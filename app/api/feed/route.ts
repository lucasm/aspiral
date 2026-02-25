import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser()

// Feeds são cacheados por 5 minutos. Após o 1º request, retornam instantaneamente do cache.
const CACHE_OPTS = { next: { revalidate: 300 } }

/**
 * Retenta uma função async até `retries` vezes com backoff exponencial.
 * Cada tentativa aguarda o dobro do tempo da anterior (ex: 300ms → 600ms → 1200ms).
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 300): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    const status = (err as { status?: number }).status
    // Não retenta erros 4xx — são determinísticos (bloqueio, não encontrado, etc.)
    if (retries <= 0 || (status && status >= 400 && status < 500)) throw err
    console.warn(`[feed] retry em ${retries} tentativa(s) restantes — delay ${delayMs}ms`)
    await new Promise((resolve) => setTimeout(resolve, delayMs))
    return withRetry(fn, retries - 1, delayMs * 2)
  }
}

/**
 * Faz o fetch e parse do feed respeitando o encoding declarado no XML
 * (ex: ISO-8859-1 da Folha). Evita caracteres garbled como â, ã, etc.
 * Em caso de 403 (bloqueio por IP de datacenter da Vercel),
 * faz fallback via allorigins.win antes de desistir.
 */
async function parseURLWithEncoding(url: string): ReturnType<typeof parser.parseURL> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)

  let response: Response
  try {
    response = await fetch(url, { signal: controller.signal, ...CACHE_OPTS })
  } catch (err) {
    clearTimeout(timeoutId)
    throw new Error(`Timeout ou falha de rede em: ${url}`)
  }
  clearTimeout(timeoutId)

  // 403 em produção = bloqueio por IP de datacenter. Proxy usa IPs diferentes.
  if (response.status === 403) {
    console.warn(`[feed] 403 em ${url} — usando proxy allorigins`)
    const proxyController = new AbortController()
    const proxyTimeoutId = setTimeout(() => proxyController.abort(), 4000)
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
      response = await fetch(proxyUrl, { signal: proxyController.signal, ...CACHE_OPTS })
    } catch {
      clearTimeout(proxyTimeoutId)
      throw new Error(`Proxy timeout para: ${url}`)
    }
    clearTimeout(proxyTimeoutId)
    if (!response.ok) {
      console.error(`[feed] proxy também falhou para ${url} — status ${response.status}`)
    }
  }

  if (!response.ok) {
    const err = new Error(`HTTP ${response.status} fetching feed: ${url}`) as Error & { status: number }
    err.status = response.status
    throw err
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

    // Promise.allSettled: feeds individuais que falharem não derrubam os demais
    const results = await Promise.allSettled(feedArray.map((item) => withRetry(() => parseURLWithEncoding(item.url))))

    const filteredFeed: FeedResponse[] = []

    for (let i = 0; i < feedArray.length; i++) {
      const result = results[i]
      if (result.status === 'rejected') {
        console.error(`ERROR parsing feed "${feedArray[i].name}":`, result.reason)
        continue
      }

      const feedItems = result.value.items.slice(0, 4).map((item) => ({
        title: applyFilter(item.title || item.contentSnippet || item.content, filterRegex),
        link: item.link ?? '',
      }))

      filteredFeed.push({
        id: feedArray[i].name,
        feed_name: result.value.title,
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

    const feedArray = feedCountry[category] as IFeedFile[]
    const feedUrl = feedArray.find((item) => item.name === name)?.url

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
