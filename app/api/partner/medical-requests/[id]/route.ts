import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';
import { notify } from '@/lib/notify';
import type { MedicalRequestStatus } from '@/app/generated/prisma/enums';

async function requireClinicId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return null;
  const payload = await verifyPartnerToken(token);
  return payload?.clinicId ?? null;
}

const VALID_STATUSES: MedicalRequestStatus[] = ['NEW', 'SENT', 'RESPONDED', 'QUOTATION', 'ACCEPTED', 'APPOINTMENT', 'COMPLETED', 'CANCELLED'];

// Status labels shown to the patient — kept short, no internal pipeline jargon.
const PATIENT_STATUS_MESSAGE: Partial<Record<MedicalRequestStatus, string>> = {
  SENT:        'is reviewing your request.',
  RESPONDED:   'responded to your medical request.',
  QUOTATION:   'sent you a quotation for your medical request.',
  ACCEPTED:    'accepted your medical request.',
  APPOINTMENT: 'scheduled your appointment.',
  COMPLETED:   'marked your medical request as completed.',
  CANCELLED:   'cancelled your medical request.',
};

/* ── GET /api/partner/medical-requests/[id] ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clinicId = await requireClinicId(req);
  if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const request = await db.medicalRequest.findUnique({
    where: { id },
    include: { hospitalClinic: { select: { id: true, name: true, nameEn: true, country: true, countryEn: true } } },
  });
  if (!request || request.ownerClinicId !== clinicId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ request });
}

/* ── PATCH /api/partner/medical-requests/[id] — advance status, record a quotation, set an
 * appointment date, or cancel. Notifies the patient (if they have an account) on every
 * status change so they don't have to keep checking back. ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clinicId = await requireClinicId(req);
  if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await db.medicalRequest.findUnique({ where: { id }, select: { ownerClinicId: true, patientUserId: true, hospitalClinicId: true } });
  if (!existing || existing.ownerClinicId !== clinicId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json();
  const { status, quotationAmount, quotationCurrency, quotationNote, appointmentDate, cancelReason } = body;

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }

  const request = await db.medicalRequest.update({
    where: { id },
    data: {
      ...(status               !== undefined && { status }),
      ...(quotationAmount      !== undefined && { quotationAmount: quotationAmount === null ? null : Number(quotationAmount) }),
      ...(quotationCurrency    !== undefined && { quotationCurrency }),
      ...(quotationNote        !== undefined && { quotationNote }),
      ...(appointmentDate      !== undefined && { appointmentDate: appointmentDate ? new Date(appointmentDate) : null }),
      ...(cancelReason         !== undefined && { cancelReason }),
    },
    include: { hospitalClinic: { select: { id: true, name: true, nameEn: true } } },
  });

  if (status !== undefined && existing.patientUserId && PATIENT_STATUS_MESSAGE[status as MedicalRequestStatus]) {
    const hospitalName = request.hospitalClinic.nameEn ?? request.hospitalClinic.name;
    // No patient-portal tracking page exists yet for these requests (Phase 1 scope), so the
    // notification carries no actionUrl rather than linking somewhere that 404s.
    notify({
      userId: existing.patientUserId,
      type: 'medical-request-status',
      title: hospitalName,
      body: PATIENT_STATUS_MESSAGE[status as MedicalRequestStatus]!,
      actorName: hospitalName,
    });
  }

  return NextResponse.json({ request });
}
