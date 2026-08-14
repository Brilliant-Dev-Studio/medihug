import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';

function monthBounds(month: string) {
  const [y, m] = month.split('-').map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);
  return { start, end };
}

/* ── GET /api/admin/finance/budgets?month=YYYY-MM ──
   Every expense category joined with that month's budget (0 if unset) and actual spend. */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const month = req.nextUrl.searchParams.get('month') ?? new Date().toISOString().slice(0, 7);
  const { start, end } = monthBounds(month);

  const [categories, budgets, expenses] = await Promise.all([
    db.expenseCategory.findMany({ orderBy: { createdAt: 'asc' } }),
    db.budget.findMany({ where: { month } }),
    db.expense.findMany({ where: { date: { gte: start, lt: end } }, select: { categoryId: true, amount: true } }),
  ]);

  const budgetByCategory = new Map(budgets.map(b => [b.categoryId, b.amount]));
  const actualByCategory = new Map<string, number>();
  for (const e of expenses) {
    actualByCategory.set(e.categoryId, (actualByCategory.get(e.categoryId) ?? 0) + e.amount);
  }

  const rows = categories.map(c => {
    const budget = budgetByCategory.get(c.id) ?? 0;
    const actual = actualByCategory.get(c.id) ?? 0;
    const variance = budget - actual;
    const variancePercent = budget > 0 ? Math.round((variance / budget) * 1000) / 10 : 0;
    return { categoryId: c.id, name: c.name, type: c.type, budget, actual, variance, variancePercent };
  });

  return NextResponse.json({ month, rows });
}

/* ── POST /api/admin/finance/budgets ── */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { categoryId, month, amount } = await req.json();
    if (!categoryId || !month || typeof amount !== 'number' || amount < 0) {
      return NextResponse.json({ error: 'categoryId, month, and a non-negative amount are required.' }, { status: 400 });
    }
    const before = await db.budget.findUnique({ where: { categoryId_month: { categoryId, month } } });
    const budget = await db.budget.upsert({
      where: { categoryId_month: { categoryId, month } },
      update: { amount },
      create: { categoryId, month, amount },
    });
    logAudit({ admin, action: before ? 'UPDATE' : 'CREATE', entityType: 'Budget', entityId: budget.id, before, after: budget });
    return NextResponse.json({ budget });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
