import { db } from '@/lib/db';
import { signAdminToken } from '@/lib/jwt';
async function main() {
  const superAdmin = await db.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  const adminToken = await signAdminToken({ id: superAdmin!.id, name: superAdmin!.name, phone: superAdmin!.phone, role: superAdmin!.role });
  console.log(adminToken);
  await db.$disconnect();
}
main();
