import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('doctor_token')?.value;
  if (!token) return NextResponse.json({ doctor: null }, { status: 401 });

  const payload = await verifyDoctorToken(token);
  if (!payload?.doctorId) return NextResponse.json({ doctor: null }, { status: 401 });

  const doctor = await db.doctor.findUnique({
    where: { id: payload.doctorId },
    select: { id: true, name: true, nameEn: true, specialty: true, imageUrl: true, phone: true },
  });
  if (!doctor) return NextResponse.json({ doctor: null }, { status: 404 });

  return NextResponse.json({ doctor: { ...doctor, userId: payload.id } });
}
