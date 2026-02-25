import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser()

const UA_BROWSER = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'

const FETCH_TIMEOUT_MS = 8000

function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer))
}

/**
 * Faz o fetch do feed com timeout de 8s.
 * Em caso de 403 (bloqueio por IP de datacenter),
 * faz fallback via allorigins.win que usa IPs diferentes.
 */
async function fetchFeed(url: string): Promise<{ buffer: ArrayBuffer; contentType: string }> {
  const headers = { 'User-Agent': UA_BROWSER }

  let response = await fetchWithTimeout(url, { headers })

  if (response.status === 403) {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    response = await fetchWithTimeout(proxyUrl, { headers })
  }

  if (!response.ok) {
    const err = new Error(`HTTP ${response.status} fetching feed: ${url}`) as Error & { status: number }
    err.status = response.status
    throw err
  }

  const contentType = response.headers.get('content-type') ?? ''

  // Reject HTML responses (challenge pages, login walls, etc.)
  if (contentType.includes('text/html')) {
    throw new Error(`Feed returned HTML instead of XML (${response.status}): ${url}`)
  }

  return { buffer: await response.arrayBuffer(), contentType }
}

async function parseURLWithEncoding(url: string): ReturnType<typeof parser.parseURL> {
  const { buffer, contentType } = await fetchFeed(url)

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
 * Não retenta erros 4xx (são determinísticos).
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 300): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    const status = (err as { status?: number }).status
    if (retries <= 0 || (status && status >= 400 && status < 500)) throw err
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
