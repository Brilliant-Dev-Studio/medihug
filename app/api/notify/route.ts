import { NextRequest, NextResponse } from 'next/server';
import { Knock } from '@knocklabs/node';

const knock = new Knock({ apiKey: process.env.KNOCK_API_KEY! });

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
    const { patientId, patientName, doctorName, appointmentId, adminId, adminName } = body;

    if (!patientId || !appointmentId || !doctorName) {
      return NextResponse.json({ error: 'patientId, appointmentId, doctorName are required.' }, { status: 400 });
    }

    // The "appointment-confirmed" workflow (Knock dashboard) fans this single trigger
    // out to every channel step wired into it — In-App Feed + FCM push ("fcm" channel key,
    // channel id in NEXT_PUBLIC_KNOCK_FCM_CHANNEL_ID). The channel key itself isn't part of
    // this payload; it's configured on the workflow's push step in the dashboard.
    await knock.workflows.trigger('appointment-confirmed', {
      recipients: [patientId],
      actor: { id: adminId, name: adminName },
      data: {
        patientName,
        doctorName,
        appointmentId,
        message: `Your 10% payment is verified. Appointment with Dr. ${doctorName} is confirmed!`,
        actionUrl: `/dashboard/appointments/${appointmentId}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Knock trigger error:', e);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
