import { db } from '@/lib/db';
async function main() {
  const doctors = await db.doctor.findMany({ select: { id: true, name: true, userId: true, phone: true } });
  console.log(JSON.stringify(doctors, null, 2));
}
main().then(() => process.exit(0));
