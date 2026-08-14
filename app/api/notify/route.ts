import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notify } from '@/lib/notify';

interface ApproveAppointmentPayload {
  patientId: string;
  patientName?: string;
  doctorName: string;
  appointmentId: string;
  adminId: string;
  adminName: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ApproveAppointmentPayload = await req.json();
    const { patientId, doctorName, appointmentId, adminId, adminName } = body;

    if (!patientId || !appointmentId || !doctorName) {
      return NextResponse.json({ error: 'patientId, appointmentId, doctorName are required.' }, { status: 400 });
    }

    const admin = await db.user.findUnique({ where: { id: adminId }, select: { profileImage: true } });

    await notify({
      userId: patientId,
      type: 'appointment-confirmed',
      title: adminName,
      body: `Your 10% payment is verified. Appointment with Dr. ${doctorName} is confirmed!`,
      actionUrl: `/dashboard/appointments/${appointmentId}`,
      actorName: adminName,
      actorAvatar: admin?.profileImage,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('notify error:', e);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
