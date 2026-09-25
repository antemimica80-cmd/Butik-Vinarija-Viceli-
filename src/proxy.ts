import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intl = createMiddleware(routing);

/** /admin is protected with HTTP Basic auth (user "admin", password ADMIN_PASSWORD). */
function admin(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return new NextResponse('Admin is disabled: set ADMIN_PASSWORD.', { status: 503 });
  const [scheme, encoded] = (req.headers.get('authorization') ?? '').split(' ');
  if (scheme === 'Basic' && encoded) {
    const [user, pass] = atob(encoded).split(':');
    if (user === 'admin' && pass === password) return NextResponse.next();
  }
  return new NextResponse('Authentication required', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Vicelic admin"' } });
}

export default function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin')) return admin(req);
  return intl(req);
}

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
