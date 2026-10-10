import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard', '/settings', '/chat'];

/**
 * Lightweight route protection: redirects unauthenticated visitors away from
 * app pages. Supabase session presence is inferred from the auth cookies the
 * client SDK sets; the real authorization still happens via RLS on every query.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (!isProtected) return NextResponse.next();

  const hasSessionCookie = req.cookies.getAll().some((c) => c.name.startsWith('sb-') && c.name.includes('auth-token'));
  if (!hasSessionCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/chat/:path*'],
};
