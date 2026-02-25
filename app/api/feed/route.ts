import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser({
  defaultRSS: 2.0,
  customFields: {
    item: [['description', 'description']],
  },
})

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

const ISO_CHARSET_RE = /charset\s*=\s*iso-8859-1/i
const XML_ENCODING_RE = /<\?xml[^>]+encoding\s*=\s*["']([^"']+)["']/i

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
 * Fetch + parse an RSS feed, auto-detecting ISO-8859-1 encoding.
 *
 * Some feeds (rss.uol.com.br, feeds.folha.uol.com.br, …) serve ISO-8859-1
 * encoded XML. rss-parser's parseURL() assumes UTF-8, mangling accented chars.
 * We always fetch the raw bytes, detect the encoding, and fix it before parsing.
 */
async function fetchAndParseFeed(url: string): Promise<Parser.Output<{ description?: string }>> {
  const response = await fetch(url)
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

  return parser.parseString(text)
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
        link: 'mailto:feedback@aspiral.app?subject=Aspiral%20Feedback&body=Invalid%20category',
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
        return fetchAndParseFeed(item.url)
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

    // Parse the feed
    const feed = await fetchAndParseFeed(feedUrl)

    const result: FeedResponse[] = []
    feed.items.slice(0, 4).forEach((item) => {
      // Fall back to plain-text description when title is absent (UOL vueland)
      const rawTitle = item.title || (item.description ? stripHtml(item.description as string) : '')
      // Fall back to guid when link is absent
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
