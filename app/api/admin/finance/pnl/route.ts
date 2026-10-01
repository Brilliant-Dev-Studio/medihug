import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getPnlReport, resolveWindow, type FinanceRange } from '@/lib/financeReport';

/* ── GET /api/admin/finance/pnl?range=daily|weekly|monthly|yearly|custom&from=&to= ──
   Revenue - payout/COGS - gateway fees - expenses = net profit, plus business-type,
   doctor and partner profitability breakdowns. See lib/financeReport.ts for the computation
   itself — shared with the Dashboard summary and the Excel export. */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const range = (['daily', 'weekly', 'monthly', 'yearly', 'custom'].includes(searchParams.get('range') || '')
      ? searchParams.get('range')
      : 'monthly') as FinanceRange;
    const { since, until } = resolveWindow(range, searchParams.get('from'), searchParams.get('to'));

    const report = await getPnlReport(range, since, until);
    return NextResponse.json(report);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
