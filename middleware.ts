import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, verifyDoctorToken, verifyPartnerToken } from '@/lib/jwt';
import { isAdminRole } from '@/lib/permissions';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Guard /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    const payload = await verifyAdminToken(token);

    if (!payload || !isAdminRole(payload.role)) {
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

    // No cache so the browser can't show this authenticated page from bfcache
    // after logout when the user hits Back.
    const res = NextResponse.next({ request: { headers: reqHeaders } });
    res.headers.set('Cache-Control', 'no-store, must-revalidate');
    return res;
  }

  // Guard /doctor routes (except /doctor/login)
  if (pathname.startsWith('/doctor') && pathname !== '/doctor/login') {
    const token = req.cookies.get('doctor_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/doctor/login', req.url));
    }

    const payload = await verifyDoctorToken(token);

    if (!payload || payload.role !== 'DOCTOR' || !payload.doctorId) {
      const res = NextResponse.redirect(new URL('/doctor/login', req.url));
      res.cookies.set('doctor_token', '', { maxAge: 0, path: '/' });
      return res;
    }

    const reqHeaders = new Headers(req.headers);
    reqHeaders.set('x-doctor-id',      payload.doctorId);
    reqHeaders.set('x-doctor-user-id', payload.id);
    reqHeaders.set('x-doctor-name',    encodeURIComponent(payload.name));

    // No cache so the browser can't show this authenticated page from bfcache
    // after logout when the user hits Back.
    const res = NextResponse.next({ request: { headers: reqHeaders } });
    res.headers.set('Cache-Control', 'no-store, must-revalidate');
    return res;
  }

  // Guard /partner routes (except /partner/login)
  if (pathname.startsWith('/partner') && pathname !== '/partner/login') {
    const token = req.cookies.get('partner_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/partner/login', req.url));
    }

    const payload = await verifyPartnerToken(token);

    if (!payload || payload.role !== 'PARTNER' || !payload.clinicId) {
      const res = NextResponse.redirect(new URL('/partner/login', req.url));
      res.cookies.set('partner_token', '', { maxAge: 0, path: '/' });
      return res;
    }

    const reqHeaders = new Headers(req.headers);
    reqHeaders.set('x-partner-clinic-id', payload.clinicId);
    reqHeaders.set('x-partner-user-id',   payload.id);
    reqHeaders.set('x-partner-name',      encodeURIComponent(payload.name));

    const res = NextResponse.next({ request: { headers: reqHeaders } });
    res.headers.set('Cache-Control', 'no-store, must-revalidate');
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/doctor/:path*', '/partner/:path*'],
};
