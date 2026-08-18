import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';

async function requireDoctorId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('doctor_token')?.value;
  if (!token) return null;
  const payload = await verifyDoctorToken(token);
  return payload?.doctorId ?? null;
}

async function loadOwnAppointment(id: string, doctorId: string) {
  const appointment = await db.appointment.findUnique({ where: { id }, select: { doctorId: true, status: true } });
  if (!appointment || appointment.doctorId !== doctorId || !['CONFIRMED', 'COMPLETED'].includes(appointment.status)) return null;
  return appointment;
}

interface MedicineInput { name: string; dosage?: string | null; frequency?: string | null; duration?: string | null }

/* ── GET /api/doctor/appointments/[id]/prescription ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!(await loadOwnAppointment(id, doctorId))) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const prescription = await db.prescription.findUnique({
    where: { appointmentId: id },
    include: { medicines: { orderBy: { order: 'asc' } } },
  });
  return NextResponse.json({ prescription });
}

/* ── PUT /api/doctor/appointments/[id]/prescription — upsert draft ── */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!(await loadOwnAppointment(id, doctorId))) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const { diagnosis, advice, referredSpecialist, followUpDate, followUpTime, comeAfterDays, medicines } = body as {
    diagnosis?: string | null; advice?: string | null; referredSpecialist?: boolean;
    followUpDate?: string | null; followUpTime?: string | null; comeAfterDays?: number | null;
    medicines?: MedicineInput[];
  };

  if (medicines !== undefined && (!Array.isArray(medicines) || medicines.some(m => typeof m.name !== 'string' || !m.name.trim()))) {
    return NextResponse.json({ error: 'Invalid medicines' }, { status: 400 });
  }

  const existing = await db.prescription.findUnique({ where: { appointmentId: id }, select: { id: true, status: true } });
  if (existing?.status === 'SENT') {
    return NextResponse.json({ error: 'Prescription already sent — cannot edit' }, { status: 409 });
  }

  const data = {
    diagnosis: diagnosis ?? null,
    advice: advice ?? null,
    referredSpecialist: !!referredSpecialist,
    followUpDate: followUpDate ? new Date(followUpDate) : null,
    followUpTime: followUpTime ?? null,
    comeAfterDays: comeAfterDays ?? null,
  };

  const prescription = await db.$transaction(async tx => {
    const p = existing
      ? await tx.prescription.update({ where: { appointmentId: id }, data })
      : await tx.prescription.create({ data: { appointmentId: id, ...data } });

    if (medicines !== undefined) {
      await tx.prescriptionMedicine.deleteMany({ where: { prescriptionId: p.id } });
      if (medicines.length > 0) {
        await tx.prescriptionMedicine.createMany({
          data: medicines.map((m, i) => ({
            prescriptionId: p.id, name: m.name.trim(),
            dosage: m.dosage || null, frequency: m.frequency || null, duration: m.duration || null,
            order: i,
          })),
        });
      }
    }
    return tx.prescription.findUniqueOrThrow({ where: { id: p.id }, include: { medicines: { orderBy: { order: 'asc' } } } });
  });

  return NextResponse.json({ prescription });
}
