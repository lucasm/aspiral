import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser()

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

/**
 * Faz o fetch e parse do feed respeitando o encoding declarado no XML
 * (ex: ISO-8859-1 da Folha). Evita caracteres garbled como â, ã, etc.
 */
async function parseURLWithEncoding(url: string): ReturnType<typeof parser.parseURL> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching feed: ${url}`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  const buffer = await response.arrayBuffer()
  const bytes = new Uint8Array(buffer)

  // Detecta encoding pelo XML declaration (mais confiável)
  const latin1Head = new TextDecoder('latin1').decode(bytes.slice(0, 200))
  const xmlDeclMatch = latin1Head.match(/encoding=["']([^"']+)["']/i)

  // Fallback para charset do Content-Type
  const ctCharsetMatch = contentType.match(/charset=([^\s;]+)/i)

  const encoding = xmlDeclMatch?.[1] ?? ctCharsetMatch?.[1] ?? 'utf-8'
  const decoded = new TextDecoder(encoding).decode(bytes)

  // Remove bytes espúrios antes do primeiro '<'
  const firstAngle = decoded.indexOf('<')
  const trimmed = firstAngle > 0 ? decoded.slice(firstAngle) : decoded

  // Alguns feeds RSS antigos omitem version="2.0"
  const normalized = trimmed.replace(/(<rss)(\s*>)/, '$1 version="2.0"$2')

  return parser.parseString(normalized)
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
