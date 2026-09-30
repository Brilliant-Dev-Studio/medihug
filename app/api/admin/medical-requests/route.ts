import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

/* ── GET /api/admin/medical-requests — read-only oversight across every partner's
 * International Hospital Representative pipeline. SuperAdmin doesn't work these requests
 * (that's the owning partner's job), just audits/monitors them. ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'partners.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status') ?? '';
    const search = searchParams.get('search') ?? '';
    const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit  = 20;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) where.OR = [
      { patientName:  { contains: search, mode: 'insensitive' } },
      { patientPhone: { contains: search, mode: 'insensitive' } },
      { ownerClinic:    { name: { contains: search, mode: 'insensitive' } } },
      { hospitalClinic: { name: { contains: search, mode: 'insensitive' } } },
    ];

    const [requests, total] = await Promise.all([
      db.medicalRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          ownerClinic:    { select: { id: true, name: true, nameEn: true } },
          hospitalClinic: { select: { id: true, name: true, nameEn: true, country: true, countryEn: true } },
        },
      }),
      db.medicalRequest.count({ where }),
    ]);

    return NextResponse.json({ requests, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
