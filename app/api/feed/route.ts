import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser()

interface IFeedFile {
  name: string
  url: string
}

interface FeedFilter {
  keywords?: string
}

interface IFeedConfig {
  [key: string]: IFeedFile[] | FeedFilter
}

interface FeedResponse {
  id?: string
  feed_name?: string
  feed_items?: Array<{
    title: string
    link: string
  }>
  title?: string
  link?: string
}

/**
 * Remove filtered keywords from title
 */
function applyFilter(title: string, filterRegex: RegExp | null): string {
  if (!filterRegex) return title
  return title.replace(filterRegex, '').trim()
}

/**
 * Parse filter string into RegExp
 */
function parseFilterString(filterStr: string): RegExp | null {
  if (!filterStr) return null
  // Extract pattern between first and last / if they exist
  if (filterStr.startsWith('/') && filterStr.endsWith('/')) {
    const pattern = filterStr.slice(1, -1)
    try {
      return new RegExp(pattern, 'g')
    } catch (e) {
      console.error('Invalid filter regex:', e)
      return null
    }
  }
  return null
}

/**
 * Get all feeds by category
 */
async function getByCategory(country: string, category: string): Promise<FeedResponse[]> {
  try {
    // Dynamically import the feed file for the country
    const feedCountry = (await import(`@/locales/feeds/${country}.json`)).default as IFeedConfig

    if (!feedCountry[category] || Array.isArray(feedCountry.filter)) {
      return {
        title: 'Error',
        link: 'mailto:feedback@memeh.app?subject=Memeh%20Feedback&body=Invalid%20category',
      } as unknown as FeedResponse[]
    }

    // Get filter if available
    const filterConfig = feedCountry.filter as FeedFilter | undefined
    const filterRegex = filterConfig?.keywords ? parseFilterString(filterConfig.keywords) : null

    const feedArray = feedCountry[category] as IFeedFile[]
    const ids: string[] = []
    const theFeed: Array<{ title: string | undefined; items: any[] }> = []

    // Parse all RSS feeds in parallel
    const feeds = await Promise.all(
      feedArray.map((item: IFeedFile) => {
        ids.push(item.name)
        return parser.parseURL(item.url)
      })
    )

    feeds.forEach((item) => {
      theFeed.push({
        title: item.title,
        items: item.items.slice(0, 4),
      })
    })

    // Build response
    const filteredFeed: FeedResponse[] = []

    for (let i = 0; i < ids.length; i++) {
      const feedItems: Array<{ title: string; link: string }> = []

      for (const item of theFeed[i].items) {
        const originalTitle = item.title
        const cleanedTitle = applyFilter(originalTitle, filterRegex)

        feedItems.push({
          title: cleanedTitle,
          link: item.link,
        })
      }

      filteredFeed.push({
        id: ids[i],
        feed_name: theFeed[i].title,
        feed_items: feedItems,
      })
    }

    return filteredFeed
  } catch (error) {
    console.error('ERROR GETTING FEEDS BY CATEGORY', error)
    return [
      {
        title: 'Error',
        link: 'mailto:feedback@memeh.app?subject=Memeh%20Feedback&body=Error%20getting%20feeds',
      } as unknown as FeedResponse,
    ]
  }
}

/**
 * Get feed by specific name
 */
async function getByName(country: string, category: string, name: string): Promise<FeedResponse[]> {
  try {
    // Dynamically import the feed file for the country
    const feedCountry = (await import(`@/locales/feeds/${country}.json`)).default as IFeedConfig

    if (!feedCountry[category] || Array.isArray(feedCountry.filter)) {
      return [
        {
          title: 'Error',
          link: 'mailto:feedback@memeh.app?subject=Memeh%20Feedback&body=Invalid%20category',
        } as unknown as FeedResponse,
      ]
    }

    // Find the feed URL by name
    let feedUrl = ''
    const feedArray = feedCountry[category] as IFeedFile[]
    feedArray.forEach((item) => {
      if (item.name === name) {
        feedUrl = item.url
      }
    })

    if (!feedUrl) {
      return [
        {
          title: 'Error',
          link: `mailto:feedback@memeh.app?subject=Memeh%20Feedback&body=Feed%20not%20found:%20${name}`,
        } as unknown as FeedResponse,
      ]
    }

    // Get filter if available
    const filterConfig = feedCountry.filter as FeedFilter | undefined
    const filterRegex = filterConfig?.keywords ? parseFilterString(filterConfig.keywords) : null

    // Parse the feed
    const feed = await parser.parseURL(feedUrl)

    const result: FeedResponse[] = []
    feed.items.slice(0, 4).forEach((item) => {
      if (item.title && item.link) {
        const cleanedTitle = applyFilter(item.title, filterRegex)
        result.push({
          title: cleanedTitle,
          link: item.link,
        })
      }
    })

    return result
  } catch (error) {
    console.error('ERROR GETTING FEED BY NAME', error)
    return [
      {
        title: 'Error',
        link: 'mailto:feedback@memeh.app?subject=Memeh%20Feedback&body=Error%20parsing%20feed',
      } as unknown as FeedResponse,
    ]
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const country = searchParams.get('country')
  const category = searchParams.get('category')
  const name = searchParams.get('name')

  // Validate required parameters
  if (!country || !category) {
    return NextResponse.json(
      {
        error: 'Missing required parameters',
        message: `Required: country and category. Optional: name. Received: country='${country}', category='${category}'`,
      },
      { status: 400 }
    )
  }

  try {
    let data: FeedResponse[]

    if (name) {
      // Get specific feed by name
      data = await getByName(country, category, name)
    } else {
      // Get all feeds by category
      data = await getByCategory(country, category)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
