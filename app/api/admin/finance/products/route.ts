import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { resolveWindow, getProductReport, type FinanceRange } from '@/lib/financeReport';

/* ── GET /api/admin/finance/products?range=&from=&to=&search= — per-product rollup. See
 * lib/financeReport.ts's getProductReport for the computation — shared with the Excel export. ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const range = (['daily', 'weekly', 'monthly', 'yearly', 'custom'].includes(searchParams.get('range') || '')
      ? searchParams.get('range')
      : 'monthly') as FinanceRange;
    const { since, until } = resolveWindow(range, searchParams.get('from'), searchParams.get('to'));
    const search = searchParams.get('search') ?? '';
    const products = await getProductReport(since, until, search);
    return NextResponse.json({ range, since, until, products });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
