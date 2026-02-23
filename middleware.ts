import createMiddleware from 'next-intl/middleware'

import { defaultLocale, locales } from './utils/locales'

const middleware = createMiddleware({
  locales: locales,
  defaultLocale: defaultLocale,
  localeDetection: true,
  localeCookie: false,
})

export default middleware

export const config = {
  matcher: ['/((?!api|_next|_vercel|public|.*\\..*).*)', '/([\\w-]+)?/users/(.+)'],
}
