import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

const DEFAULT_CATEGORIES: { name: string; type: 'FIXED' | 'VARIABLE' | 'ONE_TIME' }[] = [
  { name: 'Software Development', type: 'FIXED' },
  { name: 'Server / AWS', type: 'FIXED' },
  { name: 'Domain', type: 'FIXED' },
  { name: 'SSL', type: 'FIXED' },
  { name: 'Software Subscription', type: 'FIXED' },
  { name: 'Maintenance', type: 'FIXED' },
  { name: 'Office / Admin Expenses', type: 'FIXED' },
  { name: 'Staff Salary', type: 'FIXED' },
  { name: 'Marketing', type: 'VARIABLE' },
  { name: 'Facebook / Google Ads', type: 'VARIABLE' },
  { name: 'Payment Gateway Fees', type: 'VARIABLE' },
  { name: 'Partner Commission', type: 'VARIABLE' },
  { name: 'Referral Fees', type: 'VARIABLE' },
  { name: 'Service Delivery Costs', type: 'VARIABLE' },
  { name: 'Initial Software Development', type: 'ONE_TIME' },
  { name: 'Hardware', type: 'ONE_TIME' },
  { name: 'Branding', type: 'ONE_TIME' },
  { name: 'App Development', type: 'ONE_TIME' },
  { name: 'Legal / Licensing', type: 'ONE_TIME' },
  { name: 'Initial Marketing', type: 'ONE_TIME' },
];

/* ── GET /api/admin/finance/expense-categories ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const count = await db.expenseCategory.count();
  if (count === 0) {
    await db.expenseCategory.createMany({ data: DEFAULT_CATEGORIES });
  }

  const categories = await db.expenseCategory.findMany({ orderBy: { createdAt: 'asc' } });
  return NextResponse.json({ categories });
}

/* ── POST /api/admin/finance/expense-categories ── */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, type } = await req.json();
    if (!name || !['FIXED', 'VARIABLE', 'ONE_TIME'].includes(type)) {
      return NextResponse.json({ error: 'name and a valid type (FIXED/VARIABLE/ONE_TIME) are required.' }, { status: 400 });
    }
    const category = await db.expenseCategory.create({ data: { name, type } });
    return NextResponse.json({ category }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
