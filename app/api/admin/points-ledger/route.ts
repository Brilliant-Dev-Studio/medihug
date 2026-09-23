import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { expiryConfigOf, getPointsSettings, loadLedgerRows } from '@/lib/pointsLedger';
import { expiringSoon, runningBalances, simulate, type Lot } from '@/lib/pointsExpiry';
import { adjustPoints, pointsErrorResponse } from '@/lib/pointsAdmin';
import type { Prisma } from '@/app/generated/prisma/client';

const TYPES = ['EARNED', 'REDEEMED', 'ADJUSTED'] as const;

/** Doctor names are usually stored with their own "Dr." — don't prefix a second one. */
const drName = (n: string) => (/^dr\.?\s/i.test(n) ? n : `Dr. ${n}`);
const SOURCES = ['CONSULTATION', 'PROGRAM', 'PRODUCT'] as const;
const CSV_MAX_ROWS = 5000;

/** Quote a CSV cell; text starting with = + - @ is prefixed so a spreadsheet can't run it as a formula. */
function csvCell(v: string | number | null | undefined, isText = true): string {
  if (v === null || v === undefined) return '""';
  let out = String(v);
  if (isText && /^[=+\-@\t\r]/.test(out)) out = `'${out}`;
  return `"${out.replace(/"/g, '""')}"`;
}

/* ── GET /api/admin/points-ledger — every points transaction (who earned/used what, where, how),
 * filterable, with summaries. With ?userId= it is that patient's statement plus their balance. ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'dashboard.view');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const sp = req.nextUrl.searchParams;
    const page     = Math.max(1, parseInt(sp.get('page') ?? '1') || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(sp.get('pageSize') ?? '20') || 20));
    const userId   = sp.get('userId') ?? '';
    const type     = sp.get('type') ?? '';
    const source   = sp.get('source') ?? '';
    const status   = sp.get('status') ?? 'all';
    const from     = sp.get('from');
    const to       = sp.get('to');
    const q        = sp.get('q')?.trim();
    const isCsv    = sp.get('format') === 'csv';

    const where: Prisma.PointsLedgerWhereInput = {};
    if (userId) where.userId = userId;
    if ((TYPES as readonly string[]).includes(type)) where.type = type as (typeof TYPES)[number];
    if (source === 'MANUAL') where.sourceType = null;
    else if ((SOURCES as readonly string[]).includes(source)) where.sourceType = source as (typeof SOURCES)[number];
    if (status === 'active') where.voidedAt = null;
    else if (status === 'voided') where.voidedAt = { not: null };
    if (from || to) {
      where.createdAt = {
        ...(from ? { gte: new Date(`${from}T00:00:00`) } : {}),
        ...(to ? { lte: new Date(`${to}T23:59:59.999`) } : {}),
      };
    }
    if (q) {
      where.OR = [
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { user: { phone: { contains: q } } },
        { note: { contains: q, mode: 'insensitive' } },
      ];
    }
    const activeWhere: Prisma.PointsLedgerWhereInput = { ...where, voidedAt: null };

    const [total, rows, byTypeSource, voidedCount, settings, userInfo] = await Promise.all([
      db.pointsLedger.count({ where }),
      db.pointsLedger.findMany({
        where, orderBy: { createdAt: 'desc' },
        skip: isCsv ? 0 : (page - 1) * pageSize, take: isCsv ? CSV_MAX_ROWS : pageSize,
        include: { user: { select: { id: true, name: true, phone: true } } },
      }),
      db.pointsLedger.groupBy({ by: ['type', 'sourceType'], where: activeWhere, _sum: { points: true, amountKs: true }, _count: { _all: true } }),
      db.pointsLedger.count({ where: { ...where, voidedAt: { not: null } } }),
      getPointsSettings(),
      userId ? db.user.findUnique({ where: { id: userId }, select: { id: true, name: true, phone: true, isActive: true } }) : Promise.resolve(null),
    ]);
    const cfg = expiryConfigOf(settings);
    const now = new Date();

    // Resolve what each entry was tied to (the appointment / order / program enrollment).
    const idsFor = (t: string) => rows.filter(r => r.sourceType === t && r.sourceId).map(r => r.sourceId as string);
    const [appts, orders, enrollments] = await Promise.all([
      idsFor('CONSULTATION').length ? db.appointment.findMany({
        where: { id: { in: idsFor('CONSULTATION') } },
        select: { id: true, date: true, time: true, fee: true, status: true, doctor: { select: { name: true, nameEn: true } } },
      }) : [],
      idsFor('PRODUCT').length ? db.order.findMany({
        where: { id: { in: idsFor('PRODUCT') } },
        select: { id: true, totalAmount: true, status: true, items: { select: { quantity: true, product: { select: { name: true, nameEn: true } } } } },
      }) : [],
      idsFor('PROGRAM').length ? db.programEnrollment.findMany({
        where: { id: { in: idsFor('PROGRAM') } },
        select: { id: true, amount: true, status: true, program: { select: { titleMm: true, titleEn: true } } },
      }) : [],
    ]);
    const apptMap = new Map(appts.map(a => [a.id, a]));
    const orderMap = new Map(orders.map(o => [o.id, o]));
    const enrMap = new Map(enrollments.map(e => [e.id, e]));

    const entries = rows.map(r => {
      let source: { label: string; detail: string; href: string | null } | null = null;
      if (r.sourceType === 'CONSULTATION' && r.sourceId) {
        const a = apptMap.get(r.sourceId);
        source = a
          ? { label: drName(a.doctor.nameEn ?? a.doctor.name), detail: `${new Date(a.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}${a.time ? ` · ${a.time}` : ''} · ${a.status} · ${(a.fee ?? 0).toLocaleString()} Ks`, href: `/admin/appointments/${a.id}` }
          : { label: 'Appointment (deleted)', detail: r.sourceId, href: null };
      } else if (r.sourceType === 'PRODUCT' && r.sourceId) {
        const o = orderMap.get(r.sourceId);
        source = o
          ? { label: `Order · ${o.items.length} item${o.items.length === 1 ? '' : 's'}`, detail: `${o.items.slice(0, 2).map(i => `${i.product.nameEn ?? i.product.name} ×${i.quantity}`).join(', ')}${o.items.length > 2 ? ` +${o.items.length - 2}` : ''} · ${o.status} · ${o.totalAmount.toLocaleString()} Ks`, href: `/admin/orders/${o.id}` }
          : { label: 'Order (deleted)', detail: r.sourceId, href: null };
      } else if (r.sourceType === 'PROGRAM' && r.sourceId) {
        const e = enrMap.get(r.sourceId);
        source = e
          ? { label: e.program.titleEn ?? e.program.titleMm, detail: `Program · ${e.status} · ${e.amount.toLocaleString()} Ks`, href: `/admin/program-enrollments/${e.id}` }
          : { label: 'Program enrollment (deleted)', detail: r.sourceId, href: null };
      }
      return { ...r, source };
    });

    // Expiry, per credit: load the full (non-deleted) ledger of every patient on this page and replay
    // it, so each credit can say when it expires and how much of it is left / used / lost.
    const pageUserIds = [...new Set(rows.map(r => r.userId))];
    const rowsByUser = await loadLedgerRows(db, userId ? [userId] : pageUserIds);
    const lotById = new Map<string, Lot>();
    let userSim: ReturnType<typeof simulate> | null = null;
    for (const [uid, list] of rowsByUser) {
      const sim = simulate(list, cfg, now);
      for (const l of sim.lots) lotById.set(l.id, l);
      if (uid === userId) userSim = sim;
    }
    if (userId && !userSim) userSim = simulate([], cfg, now);

    // A patient's statement also shows the balance right after each entry (as of that moment).
    const balanceAfter = userId ? runningBalances(rowsByUser.get(userId) ?? [], cfg) : new Map<string, number>();

    const withBalance = entries.map(e => {
      const lot = e.voidedAt === null && e.points > 0 ? lotById.get(e.id) : undefined;
      const expiry = lot && (cfg.enabled || e.noExpiry)
        ? {
          expiresAt: lot.expiresAt, never: lot.expiresAt === null, used: lot.used, expired: lot.expired, remaining: lot.remaining,
          soon: lot.remaining > 0 && lot.expiresAt !== null && lot.expiresAt.getTime() - now.getTime() <= 30 * 86400000,
        }
        : null;
      return { ...e, balanceAfter: balanceAfter.get(e.id) ?? null, expiry };
    });

    // Headline numbers: this patient's, or (no patient chosen) everyone's.
    let balanceNow = 0, expiredTotal = 0, soon = { points: 0, date: null as Date | null };
    if (userSim) {
      balanceNow = userSim.balance; expiredTotal = userSim.expiredTotal; soon = expiringSoon(userSim.lots, 30, now);
    } else if (!cfg.enabled) {
      balanceNow = (await db.pointsLedger.aggregate({ where: { voidedAt: null }, _sum: { points: true } }))._sum.points ?? 0;
    } else {
      for (const list of (await loadLedgerRows(db)).values()) {
        const sim = simulate(list, cfg, now);
        balanceNow += sim.balance; expiredTotal += sim.expiredTotal;
        const sn = expiringSoon(sim.lots, 30, now);
        soon.points += sn.points;
        if (sn.date && (!soon.date || sn.date < soon.date)) soon.date = sn.date;
      }
    }

    if (isCsv) {
      const header = ['Date', 'Patient', 'Phone', 'Type', 'Points', 'Ks amount', 'Ks per point', 'Where / what for', 'Detail', 'Note', 'Recorded by', 'Status', 'Deleted reason', 'Expires on', 'Points expired'];
      const lines = [header.map(h => csvCell(h)).join(',')];
      for (const e of withBalance) {
        lines.push([
          csvCell(e.createdAt.toISOString()), csvCell(e.user.name), csvCell(e.user.phone), csvCell(e.type),
          csvCell(e.points, false), csvCell(e.amountKs, false), csvCell(e.rateKs, false),
          csvCell(e.source?.label ?? 'Manual adjustment'), csvCell(e.source?.detail ?? ''), csvCell(e.note ?? ''),
          csvCell(e.createdByAdminName ?? ''), csvCell(e.voidedAt ? 'Deleted' : 'Active'), csvCell(e.voidReason ?? ''),
          csvCell(e.expiry ? (e.expiry.expiresAt ? e.expiry.expiresAt.toISOString().slice(0, 10) : 'Never') : ''), csvCell(e.expiry ? e.expiry.expired : '', false),
        ].join(','));
      }
      return new NextResponse('\uFEFF' + lines.join('\r\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="points-ledger-${new Date().toISOString().slice(0, 10)}.csv"`,
          ...(total > CSV_MAX_ROWS ? { 'X-Truncated': 'true' } : {}),
        },
      });
    }

    const sum = (t: string, pick: 'points' | 'amountKs' | 'count') =>
      byTypeSource.filter(g => g.type === t).reduce((n, g) => n + (pick === 'count' ? g._count._all : (g._sum[pick] ?? 0)), 0);
    const bySource = ['CONSULTATION', 'PRODUCT', 'PROGRAM', 'MANUAL'].map(k => {
      const rowsFor = byTypeSource.filter(g => (k === 'MANUAL' ? g.sourceType === null : g.sourceType === k));
      const pts = (t: string) => rowsFor.filter(g => g.type === t).reduce((n, g) => n + (g._sum.points ?? 0), 0);
      return { source: k, earned: pts('EARNED'), redeemed: Math.abs(pts('REDEEMED')), adjusted: pts('ADJUSTED') };
    });

    return NextResponse.json({
      entries: withBalance, total, page, pageSize,
      summary: {
        earned:   { points: sum('EARNED', 'points'),         count: sum('EARNED', 'count'),   ks: sum('EARNED', 'amountKs') },
        redeemed: { points: Math.abs(sum('REDEEMED', 'points')), count: sum('REDEEMED', 'count'), ks: sum('REDEEMED', 'amountKs') },
        adjusted: { points: sum('ADJUSTED', 'points'),       count: sum('ADJUSTED', 'count') },
        voidedCount, bySource,
      },
      rates: { earn: settings.kyatPerPointEarn, redeem: settings.kyatPerPointRedeem },
      expiry: { enabled: cfg.enabled, value: cfg.value, unit: cfg.unit, expiredTotal, expiringSoon: { points: soon.points, date: soon.date } },
      ...(userInfo ? { user: userInfo, balance: balanceNow } : {}),
      ...(!userId ? { outstanding: balanceNow } : {}),
    });
  } catch (e) {
    return pointsErrorResponse(e);
  }
}

/* ── POST /api/admin/points-ledger { userId, points, note } — manual credit (+) / debit (−) ── */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req, 'settings.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { userId, points, note, noExpiry } = await req.json();
    const entry = await adjustPoints({ id: admin.id, name: admin.name }, { userId, points, note, noExpiry });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (e) {
    return pointsErrorResponse(e);
  }
}
