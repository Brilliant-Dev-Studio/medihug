import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';

/* ── GET /api/admin/refunds?targetType=&appointmentId=&orderId= ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const targetType = searchParams.get('targetType');
  const appointmentId = searchParams.get('appointmentId');
  const orderId = searchParams.get('orderId');

  const refunds = await db.refund.findMany({
    where: {
      ...(targetType && { targetType: targetType as 'APPOINTMENT' | 'ORDER' }),
      ...(appointmentId && { appointmentId }),
      ...(orderId && { orderId }),
    },
    include: {
      appointment: { select: { id: true, user: { select: { name: true, phone: true } } } },
      order: { select: { id: true, user: { select: { name: true, phone: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ refunds });
}

/* ── POST /api/admin/refunds ── */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { targetType, appointmentId, orderId, amount, reason } = await req.json();

    if (targetType !== 'APPOINTMENT' && targetType !== 'ORDER') {
      return NextResponse.json({ error: 'targetType must be APPOINTMENT or ORDER.' }, { status: 400 });
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'amount must be a positive number.' }, { status: 400 });
    }
    if (targetType === 'APPOINTMENT' && !appointmentId) {
      return NextResponse.json({ error: 'appointmentId is required for APPOINTMENT refunds.' }, { status: 400 });
    }
    if (targetType === 'ORDER' && !orderId) {
      return NextResponse.json({ error: 'orderId is required for ORDER refunds.' }, { status: 400 });
    }

    if (targetType === 'APPOINTMENT') {
      const exists = await db.appointment.findUnique({ where: { id: appointmentId }, select: { id: true } });
      if (!exists) return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 });
    } else {
      const exists = await db.order.findUnique({ where: { id: orderId }, select: { id: true } });
      if (!exists) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const refund = await db.refund.create({
      data: {
        targetType,
        appointmentId: targetType === 'APPOINTMENT' ? appointmentId : null,
        orderId: targetType === 'ORDER' ? orderId : null,
        amount,
        reason: reason || null,
        createdBy: admin.name,
      },
    });
    logAudit({ admin, action: 'CREATE', entityType: 'Refund', entityId: refund.id, after: refund });
    return NextResponse.json({ refund }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
