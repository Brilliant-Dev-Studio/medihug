import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { HEALTH_LOG_TYPE_MAP, type HealthLogType } from '@/lib/healthLog';

/* ── GET /api/patient/health-logs?phone=&type=&limit= — the patient's own history ── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const phone = searchParams.get('phone') ?? '';
    const type  = searchParams.get('type')  ?? '';
    const limit = parseInt(searchParams.get('limit') ?? '50');
    if (!phone) return NextResponse.json({ error: 'phone is required.' }, { status: 400 });

    const user = await db.user.findUnique({ where: { phone }, select: { id: true } });
    if (!user) return NextResponse.json({ logs: [] });

    const logs = await db.healthLog.findMany({
      where: { userId: user.id, ...(type ? { type: type as HealthLogType } : {}) },
      orderBy: { loggedAt: 'desc' },
      take: limit,
    });
    return NextResponse.json({ logs });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── POST /api/patient/health-logs — add a manual tracker entry ── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, type, data, note, loggedAt } = body;

    if (!phone || !type || !data) {
      return NextResponse.json({ error: 'phone, type, data are required.' }, { status: 400 });
    }
    const def = HEALTH_LOG_TYPE_MAP[type as HealthLogType];
    if (!def) return NextResponse.json({ error: 'Invalid tracker type.' }, { status: 400 });

    for (const f of def.fields) {
      if (f.required && (data[f.key] === undefined || data[f.key] === null || data[f.key] === '')) {
        return NextResponse.json({ error: `${f.label.en} is required.` }, { status: 400 });
      }
    }

    const user = await db.user.findUnique({ where: { phone }, select: { id: true } });
    if (!user) return NextResponse.json({ error: 'Patient not found.' }, { status: 404 });

    const log = await db.healthLog.create({
      data: {
        userId:   user.id,
        type:     type as HealthLogType,
        data,
        note:     note ?? null,
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
      },
    });
    return NextResponse.json({ log }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
