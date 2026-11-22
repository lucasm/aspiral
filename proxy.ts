import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'

import { defaultLocale, locales } from './utils/locales'

const legacyHosts = new Set(['findto.app', 'www.findto.app'])

const proxyHandler = createMiddleware({
  locales: locales,
  defaultLocale: defaultLocale,
  localeDetection: true,
  localeCookie: true,
})

function getLegacySearchPath(pathname: string) {
  const localizedMatch = pathname.match(/^\/([^/]+)\/search\/([^/]+)\/?$/)
  if (localizedMatch && locales.includes(localizedMatch[1])) {
    return `/${localizedMatch[1]}/${localizedMatch[2]}`
  }

  const match = pathname.match(/^\/search\/([^/]+)\/?$/)
  return match ? `/${defaultLocale}/${match[1]}` : undefined
}

function getLegacyHostPath(pathname: string) {
  const legacySearchPath = getLegacySearchPath(pathname)
  if (legacySearchPath) {
    return legacySearchPath
  }

  const normalizedPath =
    pathname === '/' ? pathname : pathname.replace(/\/+$/, '')
  if (normalizedPath === '/' || normalizedPath.includes('.')) {
    return normalizedPath === '/' ? `/${defaultLocale}` : normalizedPath
  }

  const hasLocale = locales.some(
    (locale) =>
      normalizedPath === `/${locale}` ||
      normalizedPath.startsWith(`/${locale}/`)
  )

  return hasLocale ? normalizedPath : `/${defaultLocale}${normalizedPath}`
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/api' || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const hostname =
    request.headers.get('host')?.split(':', 1)[0].toLowerCase() ??
    request.nextUrl.hostname

  if (legacyHosts.has(hostname)) {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    url.host = 'aspiral.app'
    url.port = ''
    url.pathname = getLegacyHostPath(pathname)
    return NextResponse.redirect(url, 308)
  }

  if (pathname.includes('.')) {
    return NextResponse.next()
  }

  const legacySearchPath = getLegacySearchPath(pathname)
  if (legacySearchPath) {
    const url = request.nextUrl.clone()
    url.pathname = legacySearchPath
    return NextResponse.redirect(url, 308)
  }

  return proxyHandler(request)
}

export const config = {
  matcher: ['/((?!_next|_vercel).*)'],
}
