import { db } from '@/lib/db';
async function main() {
  const product = await db.product.findFirst({ where: { name: '__test_sized_shirt__' } });
  if (product) {
    await db.orderItem.deleteMany({ where: { productId: product.id } });
    // delete orders that only had this test item (safe since they're test-only orders)
    const orders = await db.order.findMany({ where: { items: { none: {} } } });
    for (const o of orders) await db.order.delete({ where: { id: o.id } });
    await db.productSize.deleteMany({ where: { productId: product.id } });
    await db.product.delete({ where: { id: product.id } });
    console.log('removed test product, its sizes, order items, and empty orders:', orders.map(o => o.id));
  }
  const user = await db.user.findUnique({ where: { phone: '09_TEST_SIZE_1' } });
  if (user) {
    await db.order.deleteMany({ where: { userId: user.id } });
    await db.user.delete({ where: { id: user.id } });
    console.log('removed test patient user');
  }
  console.log('leftover:', await db.product.count({ where: { name: '__test_sized_shirt__' } }), await db.user.count({ where: { phone: '09_TEST_SIZE_1' } }));
  await db.$disconnect();
}
main();
