import { db } from '@/lib/db';
async function main() {
  for (const id of ['cmsfworws0000xtxf96udtzod', 'cmsfx0mda0002xtxfi79i8zxe']) {
    const o = await db.order.findUnique({ where: { id } });
    console.log(id, '->', o ? 'STILL EXISTS' : 'gone');
  }
  // any other orders currently with zero items, to gauge how common this anomaly is
  const zeroItemOrders = await db.order.findMany({ where: { items: { none: {} } }, select: { id: true, userId: true, totalAmount: true, createdAt: true, status: true } });
  console.log('current zero-item orders remaining:', zeroItemOrders);
  await db.$disconnect();
}
main();
