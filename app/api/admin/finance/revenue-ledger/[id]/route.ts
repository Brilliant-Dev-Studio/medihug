import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';

const USER_SELECT = { select: { id: true, name: true, phone: true, profileImage: true } };

/* ── GET /api/admin/finance/revenue-ledger/[id] — full detail for one ledger row: the money
 * breakdown plus whatever booked it (Appointment / ProgramEnrollment / Order), resolved via
 * sourceType+sourceId since the ledger table itself only ever stores money. ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const entry = await db.revenueLedger.findUnique({
      where: { id },
      include: {
        clinic: { select: { id: true, name: true, nameEn: true, type: true, imageUrl: true } },
        referralClinic: { select: { id: true, name: true, nameEn: true, type: true, imageUrl: true } },
      },
    });
    if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    let source: unknown = null;
    if (entry.sourceType === 'CONSULTATION') {
      const appointment = await db.appointment.findUnique({
        where: { id: entry.sourceId },
        select: {
          id: true, date: true, time: true, reason: true, note: true, status: true,
          paymentMethod: true, fee: true, platformFeeAmount: true, doctorPayoutAmount: true,
          receiptUrl: true, cbPayStatus: true, cbPayRefOrder: true, cbPayTransactionId: true,
          cbPayAmountConfirmed: true, cbPayPaidAt: true, doctorNote: true,
          user: USER_SELECT,
          doctor: { select: { id: true, name: true, nameEn: true, specialty: true, specialtyEn: true, imageUrl: true } },
          referredDoctor: { select: { id: true, name: true, nameEn: true } },
          referredClinic: { select: { id: true, name: true, nameEn: true } },
        },
      });
      source = appointment ? { type: 'CONSULTATION', appointment } : null;
    } else if (entry.sourceType === 'PROGRAM') {
      const enrollment = await db.programEnrollment.findUnique({
        where: { id: entry.sourceId },
        select: {
          id: true, amount: true, paymentMethod: true, receiptUrl: true, status: true, createdAt: true,
          cbPayStatus: true, cbPayRefOrder: true, cbPayTransactionId: true, cbPayAmountConfirmed: true, cbPayPaidAt: true,
          user: USER_SELECT,
          program: { select: { id: true, titleMm: true, titleEn: true, clinic: { select: { id: true, name: true, nameEn: true } } } },
        },
      });
      source = enrollment ? { type: 'PROGRAM', enrollment } : null;
    } else if (entry.sourceType === 'PRODUCT') {
      const order = await db.order.findUnique({
        where: { id: entry.sourceId },
        select: {
          id: true, totalAmount: true, paymentMethod: true, receiptUrl: true, status: true, createdAt: true,
          cbPayStatus: true, cbPayRefOrder: true, cbPayTransactionId: true, cbPayAmountConfirmed: true, cbPayPaidAt: true,
          user: USER_SELECT,
          items: { select: { quantity: true, price: true, product: { select: { id: true, name: true, nameEn: true, imageUrl: true } } } },
        },
      });
      source = order ? { type: 'PRODUCT', order } : null;
    }

    return NextResponse.json({ entry, source });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/admin/finance/revenue-ledger/[id] { settlementStatus } — mark a ledger
 * row SETTLED (paid out to the partner) / HELD / back to PENDING. Manual, one row at a time —
 * no automatic payout integration exists. ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { settlementStatus, paymentReference } = await req.json();
    if (settlementStatus !== undefined && !['PENDING', 'APPROVED', 'SETTLED', 'HELD'].includes(settlementStatus)) {
      return NextResponse.json({ error: 'Invalid settlementStatus.' }, { status: 400 });
    }
    if (settlementStatus === undefined && paymentReference === undefined) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    const before = await db.revenueLedger.findUnique({ where: { id }, select: { settlementStatus: true, paymentReference: true } });
    if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const data: Record<string, unknown> = {};
    if (settlementStatus !== undefined) {
      data.settlementStatus = settlementStatus;
      data.settledAt = settlementStatus === 'SETTLED' ? new Date() : null;
    }
    if (paymentReference !== undefined) {
      data.paymentReference = paymentReference || null;
    }

    const entry = await db.revenueLedger.update({ where: { id }, data });

    logAudit({
      admin, action: 'UPDATE', entityType: 'RevenueLedger', entityId: id,
      before, after: { settlementStatus: entry.settlementStatus, paymentReference: entry.paymentReference },
    });

    return NextResponse.json({ entry });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
