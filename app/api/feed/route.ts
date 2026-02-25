import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser()

const UA_GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
const UA_BROWSER = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

/**
 * Fetches an RSS/Atom feed URL respecting the encoding declared in the XML
 * header (e.g. ISO-8859-1). Falls back to UTF-8 when no declaration is found.
 * Passes the correctly-decoded string to parser.parseString() so that
 * characters like ã, ç, º are never garbled.
 *
 * If the server returns 403 with the Googlebot UA (anti-bot policy),
 * automatically retries once with a real browser UA.
 */
async function parseURLWithEncoding(url: string): ReturnType<typeof parser.parseURL> {
  let response = await fetch(url, {
    headers: { 'User-Agent': UA_GOOGLEBOT },
  })

  // Some sites (e.g. forbes.com.br) block known bots but allow real browsers.
  // Retry once with a browser UA before giving up.
  if (response.status === 403) {
    response = await fetch(url, {
      headers: { 'User-Agent': UA_BROWSER },
    })
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching feed: ${url}`)
  }

  const contentType = response.headers.get('content-type') ?? ''

  // Reject HTML responses (challenge pages, login walls, etc.)
  if (contentType.includes('text/html')) {
    throw new Error(`Feed returned HTML instead of XML (${response.status}): ${url}`)
  }

  const buffer = await response.arrayBuffer()
  const bytes = new Uint8Array(buffer)

  // 1. Sniff the XML declaration for an encoding attribute (most authoritative)
  const latin1Head = new TextDecoder('latin1').decode(bytes.slice(0, 200))
  const xmlDeclMatch = latin1Head.match(/encoding=["']([^"']+)["']/i)

  // 2. Fall back to Content-Type charset (e.g. feeds with no XML declaration)
  const ctCharsetMatch = contentType.match(/charset=([^\s;]+)/i)

  const encoding = xmlDeclMatch?.[1] ?? ctCharsetMatch?.[1] ?? 'utf-8'

  const decoded = new TextDecoder(encoding).decode(bytes)

  // Strip any stray content (server notices, BOM residue, injected bytes) that
  // appears before the actual XML root. The sax parser throws "Text data outside
  // of root node" if it encounters any characters (including '!') before '<'.
  const firstAngle = decoded.indexOf('<')
  const trimmed = firstAngle > 0 ? decoded.slice(firstAngle) : decoded

  // rss-parser requires a version attribute on <rss>; some old feeds omit it.
  const normalized = trimmed.replace(/(<rss)(\s*>)/, '$1 version="2.0"$2')

  return parser.parseString(normalized)
}

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
async function getByCategory(country: string, category: string): Promise<FeedResponse[]> {
  try {
    // Dynamically import the feed file for the country
    const feedCountry = (await import(`@/locales/feeds/${country}.json`)).default as IFeedConfig

    if (!feedCountry[category] || Array.isArray(feedCountry.filter)) {
      return {
        title: 'Error',
        link: 'mailto:feedback@aspiral.app?subject=Aspiral%20Feedback&body=Invalid%20category',
      } as unknown as FeedResponse[]
    }

    // Get filter if available
    const filterConfig = feedCountry.filter as FeedFilter | undefined
    const filterRegex = filterConfig?.keywords ? parseFilterString(filterConfig.keywords) : null

    const feedArray = feedCountry[category] as IFeedFile[]
    const ids: string[] = []
    const theFeed: Array<{ title: string | undefined; items: any[] }> = []

    // Parse all RSS feeds in parallel, cada um com retry independente
    const feeds = await Promise.all(
      feedArray.map((item: IFeedFile) => {
        ids.push(item.name)
        return withRetry(() => parseURLWithEncoding(item.url))
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
        const originalTitle = item.title || item.contentSnippet || item.content
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
        link: 'mailto:feedback@aspiral.app?subject=Aspiral%20Feedback&body=Error%20getting%20feeds',
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
          link: 'mailto:feedback@aspiral.app?subject=Aspiral%20Feedback&body=Invalid%20category',
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
          link: `mailto:feedback@aspiral.app?subject=Aspiral%20Feedback&body=Feed%20not%20found:%20${name}`,
        } as unknown as FeedResponse,
      ]
    }

    // Get filter if available
    const filterConfig = feedCountry.filter as FeedFilter | undefined
    const filterRegex = filterConfig?.keywords ? parseFilterString(filterConfig.keywords) : null

    // Parse the feed (com retry automático)
    const feed = await withRetry(() => parseURLWithEncoding(feedUrl))

    const result: FeedResponse[] = []
    feed.items.slice(0, 4).forEach((item) => {
      const rawTitle = item.title || item.contentSnippet || item.content
      if (rawTitle && item.link) {
        const cleanedTitle = applyFilter(rawTitle, filterRegex)
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
        link: 'mailto:feedback@aspiral.app?subject=Aspiral%20Feedback&body=Error%20parsing%20feed',
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
