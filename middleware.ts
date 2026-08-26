import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match every path except API, _next, _vercel, files with extension, and the bare
  // sitemap/robots/asset endpoints.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
