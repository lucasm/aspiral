import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { FeedError } from '@/constants/feedErrors'

const parser = new Parser({
  defaultRSS: 2.0,
  customFields: {
    item: [['description', 'description']],
  },
})

const ISO_CHARSET_RE = /charset\s*=\s*iso-8859-1/i
const XML_ENCODING_RE = /<\?xml[^>]+encoding\s*=\s*["']([^"']+)["']/i

/**
 * Retenta uma função async até `retries` vezes com backoff exponencial.
 * Cada tentativa aguarda o dobro do tempo da anterior (ex: 300ms → 600ms → 1200ms).
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 300): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (retries <= 0) throw err
    await new Promise((resolve) => setTimeout(resolve, delayMs))
    return withRetry(fn, retries - 1, delayMs * 2)
  }
}

interface IFeedFile {
  name: string
  url?: string
  legacyFeed?: boolean
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
 * Detect whether raw XML bytes are ISO-8859-1 encoded.
 * Checks (in order):
 *   1. The HTTP Content-Type response header
 *   2. The XML <?xml encoding="…"> declaration (peeked as latin-1, safe for ASCII range)
 */
function detectIsoEncoding(contentType: string | null, buffer: ArrayBuffer): boolean {
  if (contentType && ISO_CHARSET_RE.test(contentType)) return true
  // Peek first 200 bytes as latin-1 (safe: encoding declaration is always ASCII)
  const peek = new TextDecoder('iso-8859-1').decode(buffer.slice(0, 200))
  const match = XML_ENCODING_RE.exec(peek)
  if (match) return /iso-8859-1|latin-1|latin1/i.test(match[1])
  return false
}

/**
 * Strip HTML tags and decode basic HTML entities from a string.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .trim()
}

/**
 * Fetch + parse an RSS feed, optionally handling ISO-8859-1 encoding for legacy feeds.
 *
 * @param url - The RSS feed URL
 * @param isLegacy - If true, handles ISO-8859-1 encoding (UOL, Folha feeds)
 */
async function fetchAndParseFeed(url: string, isLegacy: boolean): Promise<Parser.Output<{ description?: string }>> {
  console.log(`[FEED] Fetching: ${url} (legacy: ${isLegacy})`)

  if (!isLegacy) {
    // Modern feeds: use standard parseURL
    try {
      return await parser.parseURL(url)
    } catch (parseError) {
      // If parseURL fails, try manual fetch with detailed logging
      console.log(`[FEED] parseURL failed, trying manual fetch...`)
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Aspiral/1.0; +https://aspiral.app)',
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
      })
      console.log(`[FEED] Response status: ${response.status} ${response.statusText}`)
      console.log(`[FEED] Response headers:`, Object.fromEntries(response.headers.entries()))

      const text = await response.text()
      console.log(`[FEED] Response length: ${text.length}`)
      console.log(`[FEED] Response preview (first 500 chars):`, text.slice(0, 500))
      console.log(`[FEED] Response preview (last 200 chars):`, text.slice(-200))

      // Check if it's HTML (error page) instead of XML
      if (text.includes('<!DOCTYPE html') || text.includes('<html')) {
        console.error(`[FEED] ERROR: Received HTML instead of XML feed`)
        throw new Error(`Feed URL returned HTML instead of XML: ${url}`)
      }

      return parser.parseString(text)
    }
  }

  // Legacy feeds: fetch raw bytes and handle ISO-8859-1
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Aspiral/1.0; +https://aspiral.app)',
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
    },
  })

  console.log(`[FEED] Response status: ${response.status} ${response.statusText}`)
  console.log(`[FEED] Response headers:`, Object.fromEntries(response.headers.entries()))

  const buffer = await response.arrayBuffer()
  const contentType = response.headers.get('content-type')

  let text: string
  if (detectIsoEncoding(contentType, buffer)) {
    // Decode with the correct charset
    text = new TextDecoder('iso-8859-1').decode(buffer)
    // Replace the encoding declaration (or inject one) so the XML parser sees UTF-8
    if (XML_ENCODING_RE.test(text)) {
      text = text.replace(XML_ENCODING_RE, (m) => m.replace(/encoding\s*=\s*["'][^"']+["']/i, 'encoding="UTF-8"'))
    } else if (!text.startsWith('<?xml')) {
      text = `<?xml version="1.0" encoding="UTF-8"?>\n${text}`
    }
  } else {
    text = new TextDecoder('utf-8').decode(buffer)
  }

  console.log(`[FEED] Response length: ${text.length}`)
  console.log(`[FEED] Response preview (first 500 chars):`, text.slice(0, 500))

  // Check if it's HTML (error page) instead of XML
  if (text.includes('<!DOCTYPE html') || text.includes('<html')) {
    console.error(`[FEED] ERROR: Received HTML instead of XML feed`)
    console.log(`[FEED] Full response:`, text)
    throw new Error(`Feed URL returned HTML instead of XML: ${url}`)
  }

  try {
    return parser.parseString(text)
  } catch (parseError) {
    console.error(`[FEED] Parse error:`, parseError)
    console.log(`[FEED] Full response that failed to parse:`, text)
    throw parseError
  }
}

/**
 * Remove filtered keywords from title
 */
function applyFilter(title: string | undefined, filterRegex: RegExp | null): string {
  if (!title) return ''
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
async function getByCategory(locale: string, category: string): Promise<FeedResponse[]> {
  try {
    // Dynamically import the locale file
    const localeData = (await import(`@/locales/${locale}.json`)).default
    const feedConfig = localeData.feeds as IFeedConfig

    if (!feedConfig[category] || Array.isArray(feedConfig.filter)) {
      return [{ title: FeedError.INVALID_CATEGORY, link: null }] as unknown as FeedResponse[]
    }

    // Get filter if available
    const filterConfig = feedConfig.filter as FeedFilter | undefined
    const filterRegex = filterConfig?.keywords ? parseFilterString(filterConfig.keywords) : null

    const feedArray = (feedConfig[category] as IFeedFile[]).filter((item) => item.url && item.url.trim())
    const ids: string[] = []
    const theFeed: Array<{ title: string | undefined; items: any[] }> = []

    if (feedArray.length === 0) {
      return [] as unknown as FeedResponse[]
    }

    // Parse all RSS feeds in parallel, cada um com retry independente
    const feeds = await Promise.all(
      feedArray.map((item: IFeedFile) => {
        ids.push(item.name)
        return withRetry(() => fetchAndParseFeed(item.url!, item.legacyFeed || false))
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
        // Some UOL feeds omit <title> – fall back to plain-text description
        const rawTitle = item.title || (item.description ? stripHtml(item.description as string) : '')
        const cleanedTitle = applyFilter(rawTitle, filterRegex)
        // Some UOL feeds omit <link> – fall back to <guid>
        const link = item.link || item.guid || ''

        if (!cleanedTitle || !link) continue

        feedItems.push({
          title: cleanedTitle,
          link,
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
    return [{ title: FeedError.CATEGORY_FETCH_FAILED, link: null }] as unknown as FeedResponse[]
  }
}

/**
 * Get feed by specific name
 */
async function getByName(locale: string, category: string, name: string): Promise<FeedResponse[]> {
  try {
    // Dynamically import the locale file
    const localeData = (await import(`@/locales/${locale}.json`)).default
    const feedConfig = localeData.feeds as IFeedConfig

    if (!feedConfig[category] || Array.isArray(feedConfig.filter)) {
      return [{ title: FeedError.INVALID_CATEGORY_NAME, link: null }] as unknown as FeedResponse[]
    }

    // Find the feed URL and legacyFeed flag by name
    let feedUrl = ''
    let isLegacy = false
    const feedArray = feedConfig[category] as IFeedFile[]
    feedArray.forEach((item) => {
      if (item.name === name && item.url && item.url.trim()) {
        feedUrl = item.url
        isLegacy = item.legacyFeed ?? false
      }
    })

    if (!feedUrl) {
      return [{ title: FeedError.FEED_NOT_FOUND, link: null }] as unknown as FeedResponse[]
    }

    // Get filter if available
    const filterConfig = feedConfig.filter as FeedFilter | undefined
    const filterRegex = filterConfig?.keywords ? parseFilterString(filterConfig.keywords) : null

    // Parse the feed using ISO-8859-1 decoder if needed
    const feed = await fetchAndParseFeed(feedUrl, isLegacy)

    const result: FeedResponse[] = []
    feed.items.slice(0, 4).forEach((item) => {
      // Some UOL feeds omit <title> – fall back to plain-text description
      const rawTitle = item.title || (item.description ? stripHtml(item.description as string) : '')
      // Some UOL feeds omit <link> – fall back to <guid>
      const link = item.link || item.guid || ''

      if (rawTitle && link) {
        const cleanedTitle = applyFilter(rawTitle, filterRegex)
        result.push({
          title: cleanedTitle,
          link,
        })
      }
    })

    return result
  } catch (error) {
    console.error('ERROR GETTING FEED BY NAME', error)
    return [{ title: FeedError.FEED_FETCH_FAILED, link: null }] as unknown as FeedResponse[]
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale')
  const category = searchParams.get('category')
  const name = searchParams.get('name')

  // Validate required parameters
  if (!locale || !category) {
    return NextResponse.json(
      {
        error: 'Missing required parameters',
        message: `Required: locale and category. Optional: name. Received: locale='${locale}', category='${category}'`,
      },
      { status: 400 }
    )
  }

  try {
    let data: FeedResponse[]

    if (name) {
      // Get specific feed by name
      data = await getByName(locale, category, name)
    } else {
      // Get all feeds by category
      data = await getByCategory(locale, category)
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
