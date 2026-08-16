import { db } from '@/lib/db';
async function main() {
  const patientMsgs = await db.appointmentMessage.findMany({
    where: { sender: 'PATIENT' },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { appointment: { select: { id: true, doctorId: true, doctor: { select: { userId: true, name: true } }, userId: true } } },
  });
  for (const m of patientMsgs) {
    console.log('---');
    console.log('msg:', m.id, m.createdAt, m.body);
    console.log('appointment:', m.appointment.id, 'doctorId:', m.appointment.doctorId, 'doctor.userId:', m.appointment.doctor.userId, 'doctor.name:', m.appointment.doctor.name);
  }

  console.log('\n=== recent appointment-message notifications ===');
  const notifs = await db.notification.findMany({
    where: { type: 'appointment-message' },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, userId: true, title: true, body: true, createdAt: true },
  });
  console.log(JSON.stringify(notifs, null, 2));
}
main().then(() => process.exit(0));
