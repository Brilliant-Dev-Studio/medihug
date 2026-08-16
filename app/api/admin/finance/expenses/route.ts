import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';

/* ── GET /api/admin/finance/expenses?categoryId=&from=&to= ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('categoryId');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const expenses = await db.expense.findMany({
    where: {
      ...(categoryId && { categoryId }),
      ...((from || to) && {
        date: {
          ...(from && { gte: new Date(from) }),
          ...(to && { lte: new Date(to) }),
        },
      }),
    },
    include: { category: true },
    orderBy: { date: 'desc' },
  });
  return NextResponse.json({ expenses });
}

/* ── POST /api/admin/finance/expenses ── */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { categoryId, amount, description, date } = await req.json();
    if (!categoryId || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'categoryId and a positive amount are required.' }, { status: 400 });
    }
    const expense = await db.expense.create({
      data: {
        categoryId,
        amount,
        description: description || null,
        date: date ? new Date(date) : new Date(),
        createdBy: admin.name,
      },
      include: { category: true },
    });
    logAudit({ admin, action: 'CREATE', entityType: 'Expense', entityId: expense.id, after: expense });
    return NextResponse.json({ expense }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
