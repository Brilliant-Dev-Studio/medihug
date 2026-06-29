import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard /admin routes (except /admin/login)
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next();
  }

  const token = req.cookies.get('admin_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  const payload = await verifyAdminToken(token);

  if (!payload || payload.role !== 'SUPER_ADMIN') {
    const res = NextResponse.redirect(new URL('/admin/login', req.url));
    res.cookies.set('admin_token', '', { maxAge: 0, path: '/' });
    return res;
  }

  // Pass user info to page via header (optional, for server components)
  const reqHeaders = new Headers(req.headers);
  reqHeaders.set('x-admin-id',    payload.id);
  reqHeaders.set('x-admin-name',  payload.name);
  reqHeaders.set('x-admin-phone', payload.phone);

  return NextResponse.next({ request: { headers: reqHeaders } });
}

export const config = {
  matcher: ['/admin/:path*'],
};
