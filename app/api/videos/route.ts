import { NextRequest, NextResponse } from 'next/server'

interface VideoItem {
  author: string
  title: string
  image: string
  url: string // YouTube video ID
  channelName?: string
  rank?: number // view count from YouTube Statistics API
}

interface ChannelError {
  channel: string
  error: string
}

interface VideosResponse {
  data: VideoItem[]
  errors?: ChannelError[]
}

interface CacheEntry {
  data: VideoItem[]
  timestamp: number
  etag?: string
}

// In-memory cache per channel (survives across requests in the same process)
const channelCache = new Map<string, CacheEntry>()
const CACHE_TTL = 3600000 // 1 hour

/**
 * Batch fetch view counts for multiple video IDs in a single API call (1 quota unit total).
 * Returns a map of videoId -> viewCount.
 */
async function fetchVideoStats(videoIds: string[], apiKey: string): Promise<Map<string, number>> {
  const stats = new Map<string, number>()
  if (videoIds.length === 0) return stats

  const ids = videoIds.join(',')
  const url =
    `https://www.googleapis.com/youtube/v3/videos` + `?part=statistics&id=${encodeURIComponent(ids)}&key=${encodeURIComponent(apiKey)}`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!res.ok) return stats

    const data = await res.json()
    for (const item of data.items ?? []) {
      const views = parseInt(item.statistics?.viewCount ?? '0', 10)
      stats.set(item.id, views)
    }
  } catch {
    // Non-critical: rank will be 0 if stats call fails
  }

  return stats
}

/**
 * Convert YouTube channel ID (UC...) to uploads playlist ID (UU...)
 * This avoids the expensive search.list (100 units) — playlistItems.list costs only 1 unit.
 */
function channelToPlaylistId(channelId: string): string {
  return channelId.replace(/^UC/, 'UU')
}

/**
 * Fetch the most recent video from a YouTube channel via the Data API v3.
 * Uses ETags for conditional requests to save quota and bandwidth.
 */
async function fetchChannelVideos(
  channelId: string,
  channelName: string,
  apiKey: string
): Promise<{ videos: VideoItem[]; error?: string }> {
  const cached = channelCache.get(channelId)

  // Return from cache if still fresh
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { videos: cached.data }
  }

  const playlistId = channelToPlaylistId(channelId)
  const url =
    `https://www.googleapis.com/youtube/v3/playlistItems` +
    `?part=snippet&maxResults=1&playlistId=${playlistId}&key=${encodeURIComponent(apiKey)}`

  try {
    const headers: HeadersInit = { Accept: 'application/json' }

    // Send stored ETag — if content hasn't changed YouTube returns 304 (costs 0 quota)
    if (cached?.etag) {
      headers['If-None-Match'] = cached.etag
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(url, { headers, signal: controller.signal })
    clearTimeout(timeoutId)

    // 304 Not Modified — our cache is still valid, just refresh the timestamp
    if (res.status === 304 && cached) {
      channelCache.set(channelId, { ...cached, timestamp: Date.now() })
      return { videos: cached.data }
    }

    if (!res.ok) {
      const errBody = await res.text()
      throw new Error(`HTTP ${res.status}: ${errBody.substring(0, 300)}`)
    }

    const data = await res.json()
    const etag = res.headers.get('ETag') ?? undefined
    const items: any[] = data.items ?? []

    if (items.length === 0) {
      // No new videos — fall back to cache if available
      if (cached) return { videos: cached.data }
      return { videos: [], error: 'No videos found for this channel' }
    }

    const videos: VideoItem[] = items.map((item) => {
      const snippet = item.snippet ?? {}
      const videoId: string = snippet.resourceId?.videoId ?? ''
      const thumbnail: string =
        snippet.thumbnails?.maxres?.url ??
        snippet.thumbnails?.high?.url ??
        snippet.thumbnails?.medium?.url ??
        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`

      return {
        author: snippet.channelTitle ?? channelName,
        title: snippet.title ?? 'Untitled Video',
        image: thumbnail,
        url: videoId,
        channelName,
      }
    })

    channelCache.set(channelId, { data: videos, timestamp: Date.now(), etag })
    return { videos }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`Error fetching channel ${channelName} (${channelId}):`, error)

    // Fall back to stale cache rather than showing nothing
    if (cached) {
      return { videos: cached.data, error: `${message} — using cached data` }
    }

    return { videos: [], error: message }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') ?? 'pt-BR'
  const category = searchParams.get('category')

  if (!category) {
    return NextResponse.json({ error: 'Missing required parameter: category' }, { status: 400 })
  }

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey || apiKey === 'your_youtube_api_key_here') {
    return NextResponse.json({ error: 'YOUTUBE_API_KEY is not configured' }, { status: 500 })
  }

  try {
    const localeData = (await import(`@/locales/${locale}.json`)).default
    const feedsForCategory = localeData.feeds?.[category]

    if (!Array.isArray(feedsForCategory)) {
      return NextResponse.json({ data: [] } as VideosResponse)
    }

    const channelsWithIds = feedsForCategory.filter((feed: any) => feed.videoYoutubeId)

    if (channelsWithIds.length === 0) {
      return NextResponse.json({ data: [] } as VideosResponse)
    }

    // Fetch all channels in parallel
    const allResults = await Promise.all(channelsWithIds.map((feed: any) => fetchChannelVideos(feed.videoYoutubeId, feed.name, apiKey)))

    const allVideos: VideoItem[] = []
    const errors: ChannelError[] = []

    allResults.forEach((result, index) => {
      if (result.videos.length > 0) {
        allVideos.push(...result.videos.map((v) => ({ ...v, channelName: channelsWithIds[index].name })))
      }
      if (result.error) {
        errors.push({ channel: channelsWithIds[index].name, error: result.error })
      }
    })

    // Batch fetch view counts for all collected videos (1 quota unit total)
    const videoIds = allVideos.map((v) => v.url).filter(Boolean)
    const statsMap = await fetchVideoStats(videoIds, apiKey)

    // Attach rank and sort by it descending
    const rankedVideos = allVideos.map((v) => ({ ...v, rank: statsMap.get(v.url) ?? 0 })).sort((a, b) => b.rank - a.rank)

    const response: VideosResponse = { data: rankedVideos }
    if (errors.length > 0) response.errors = errors

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in /api/videos:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
