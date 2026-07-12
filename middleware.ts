import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, verifyDoctorToken } from '@/lib/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Guard /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
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
    // Headers must be Latin1/ByteString — encode in case of non-ASCII names.
    const reqHeaders = new Headers(req.headers);
    reqHeaders.set('x-admin-id',    payload.id);
    reqHeaders.set('x-admin-name',  encodeURIComponent(payload.name));
    reqHeaders.set('x-admin-phone', payload.phone);

    return NextResponse.next({ request: { headers: reqHeaders } });
  }

  // Guard /doctor routes
  if (pathname.startsWith('/doctor')) {
    const token = req.cookies.get('doctor_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/signin', req.url));
    }

    const payload = await verifyDoctorToken(token);

    if (!payload || payload.role !== 'DOCTOR' || !payload.doctorId) {
      const res = NextResponse.redirect(new URL('/signin', req.url));
      res.cookies.set('doctor_token', '', { maxAge: 0, path: '/' });
      return res;
    }

    const reqHeaders = new Headers(req.headers);
    reqHeaders.set('x-doctor-id',      payload.doctorId);
    reqHeaders.set('x-doctor-user-id', payload.id);
    reqHeaders.set('x-doctor-name',    encodeURIComponent(payload.name));

    return NextResponse.next({ request: { headers: reqHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/doctor/:path*'],
};
