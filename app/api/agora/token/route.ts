import { NextRequest, NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';

const TOKEN_TTL_SECONDS = 60 * 60; // 1 hour

/* ── GET /api/agora/token?appointmentId=&role=doctor|patient|guest&phone= ── */
export async function GET(req: NextRequest) {
  try {
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    if (!appId || !appCertificate) {
      return NextResponse.json({ error: 'Video calling is not configured.' }, { status: 500 });
    }

    const { searchParams } = req.nextUrl;
    const appointmentId = searchParams.get('appointmentId');
    const role = searchParams.get('role');
    if (!appointmentId || (role !== 'doctor' && role !== 'patient' && role !== 'guest')) {
      return NextResponse.json({ error: 'appointmentId and role are required.' }, { status: 400 });
    }

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      select: { doctorId: true, doctorApproved: true, status: true, user: { select: { phone: true } } },
    });
    if (!appointment) return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 });
    if (appointment.status !== 'CONFIRMED' || !appointment.doctorApproved) {
      return NextResponse.json({ error: 'This call has not been approved yet.' }, { status: 403 });
    }

    if (role === 'doctor') {
      const token = req.cookies.get('doctor_token')?.value;
      const payload = token ? await verifyDoctorToken(token) : null;
      if (!payload || payload.doctorId !== appointment.doctorId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else if (role === 'patient') {
      const phone = searchParams.get('phone');
      if (!phone || phone !== appointment.user.phone) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    // role === 'guest': anyone with the share link may join once the call is approved —
    // no identity check, matching how the link is meant to be used (family member invited
    // by the patient or doctor).

    // Stable per-role uid for doctor/patient so reconnects land on the same id; guests get
    // a random uid each time since any number of them may join via the shared link.
    const uid = role === 'doctor' ? 1 : role === 'patient' ? 2 : 1000 + Math.floor(Math.random() * 1_000_000);
    const channelName = appointmentId;

    const rtcToken = RtcTokenBuilder.buildTokenWithUid(
      appId, appCertificate, channelName, uid, RtcRole.PUBLISHER, TOKEN_TTL_SECONDS, TOKEN_TTL_SECONDS
    );

    return NextResponse.json({ appId, token: rtcToken, channel: channelName, uid });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
