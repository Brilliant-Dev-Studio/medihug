import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  /* ── Super Admin ── */
  const hash  = await bcrypt.hash('123456', 12);
  const admin = await db.user.upsert({
    where:  { phone: '09265577723' },
    update: { role: 'SUPER_ADMIN', password: hash, name: 'Super Admin' },
    create: { phone: '09265577723', password: hash, name: 'Super Admin', role: 'SUPER_ADMIN', isActive: true },
  });
  console.log(`✅ Super Admin: ${admin.phone}`);

  /* ── Specialties ── */
  const specialties = [
    { name: 'အထွေထွေရောဂါကု',        nameEn: 'General Practitioner' },
    { name: 'နှလုံးရောဂါကု',           nameEn: 'Cardiologist' },
    { name: 'ကလေးရောဂါကု',            nameEn: 'Pediatrician' },
    { name: 'အရေပြားရောဂါကု',         nameEn: 'Dermatologist' },
    { name: 'အရိုးနှင့် အဆစ်ရောဂါကု', nameEn: 'Orthopedist' },
    { name: 'မျက်စိရောဂါကု',          nameEn: 'Ophthalmologist' },
  ];
  for (const s of specialties) {
    await db.specialty.upsert({ where: { name: s.name }, update: { nameEn: s.nameEn }, create: s });
  }
  console.log(`✅ ${specialties.length} Specialties seeded.`);

  /* ── Blog Categories ── */
  const blogCategories = [
    { name: 'ကျန်းမာရေးအကြောင်း',        nameEn: 'Health Tips' },
    { name: 'ရောဂါနှင့်ကုသမှု',           nameEn: 'Disease & Treatment' },
    { name: 'ဆေးဝါးသတင်း',               nameEn: 'Medicine News' },
    { name: 'အာဟာရနှင့်အစားအသောက်',      nameEn: 'Nutrition & Diet' },
    { name: 'လေ့ကျင့်ခန်းနှင့်ကိုယ်ရေး', nameEn: 'Exercise & Fitness' },
    { name: 'မိခင်နှင့်ကလေး',             nameEn: 'Mother & Child' },
    { name: 'စိတ်ကျန်းမာရေး',            nameEn: 'Mental Health' },
  ];
  for (const c of blogCategories) {
    await db.blogCategory.upsert({ where: { name: c.name }, update: { nameEn: c.nameEn }, create: c });
  }
  console.log(`✅ ${blogCategories.length} Blog Categories seeded.`);

  /* ── Doctors ── */
  const doctorPassword = await bcrypt.hash('doctor123', 12);

  const doctorData = [
    {
      phone: '09111000001', name: 'ဒေါ်မြင့်မြင့်အောင်', nameEn: 'Dr. Myint Myint Aung',
      specialty: 'အထွေထွေရောဂါကု', experience: 12, price: 15000,
      imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face',
      bio: 'အထွေထွေရောဂါ ကုသမှုတွင် အတွေ့အကြုံ ၁၂ နှစ်ကျော်ရှိသော ဆရာဝန်တစ်ဦးဖြစ်ပါသည်။',
      slots: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '12:00' },
        { dayOfWeek: 5, startTime: '13:00', endTime: '16:00' },
      ],
    },
    {
      phone: '09111000002', name: 'ဒေါက်တာကျော်ကျော်လင်း', nameEn: 'Dr. Kyaw Kyaw Lin',
      specialty: 'နှလုံးရောဂါကု', experience: 18, price: 30000,
      imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
      bio: 'နှလုံးရောဂါကုသမှုနှင့် ခွဲစိတ်မှုတွင် ကျွမ်းကျင်သော ဆရာဝန်ဖြစ်သည်။',
      slots: [
        { dayOfWeek: 1, startTime: '10:00', endTime: '13:00' },
        { dayOfWeek: 2, startTime: '14:00', endTime: '17:00' },
        { dayOfWeek: 4, startTime: '09:00', endTime: '12:00' },
      ],
    },
    {
      phone: '09111000003', name: 'ဒေါ်သန်းသန်းမြ', nameEn: 'Dr. Than Than Mya',
      specialty: 'ကလေးရောဂါကု', experience: 10, price: 20000,
      imageUrl: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=400&fit=crop&crop=face',
      bio: 'ကလေးအထူးကု ဆရာဝန်တစ်ဦးဖြစ်ပြီး နွေးထွေးသော ကုသမှုဖြင့် နာမည်ကျော်သည်။',
      slots: [
        { dayOfWeek: 2, startTime: '09:00', endTime: '12:00' },
        { dayOfWeek: 4, startTime: '09:00', endTime: '12:00' },
        { dayOfWeek: 6, startTime: '09:00', endTime: '11:00' },
      ],
    },
    {
      phone: '09111000004', name: 'ဒေါ်နှင်းဆီဝင်း', nameEn: 'Dr. Hnin Si Win',
      specialty: 'အရေပြားရောဂါကု', experience: 8, price: 18000,
      imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
      bio: 'အရေပြားနှင့် အလှအပ ဆေးပညာတွင် ကျွမ်းကျင်သူဖြစ်သည်။',
      slots: [
        { dayOfWeek: 1, startTime: '13:00', endTime: '16:00' },
        { dayOfWeek: 3, startTime: '13:00', endTime: '16:00' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '12:00' },
      ],
    },
    {
      phone: '09111000005', name: 'ဒေါက်တာမျိုးမြင့်', nameEn: 'Dr. Myo Myint',
      specialty: 'အရိုးနှင့် အဆစ်ရောဂါကု', experience: 15, price: 25000,
      imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face',
      bio: 'အရိုးကျိုး၊ အဆစ်ရောင်ရောဂါ ကုသမှုတွင် ကျွမ်းကျင်သော ဆရာဝန်ဖြစ်သည်။',
      slots: [
        { dayOfWeek: 2, startTime: '10:00', endTime: '13:00' },
        { dayOfWeek: 4, startTime: '10:00', endTime: '13:00' },
        { dayOfWeek: 6, startTime: '09:00', endTime: '12:00' },
      ],
    },
    {
      phone: '09111000006', name: 'ဒေါ်ဝင်းဝင်းမြ', nameEn: 'Dr. Win Win Mya',
      specialty: 'မျက်စိရောဂါကု', experience: 11, price: 22000,
      imageUrl: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face',
      bio: 'မျက်စိရောဂါ ကုသမှုနှင့် မျက်မျှင်ခွဲစိတ်ကုသမှုတွင် အထူးကျွမ်းကျင်သူဖြစ်သည်။',
      slots: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '11:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '11:00' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '11:00' },
      ],
    },
    {
      phone: '09111000007', name: 'ဒေါက်တာဌေးဌေးထွန်း', nameEn: 'Dr. Htay Htay Htun',
      specialty: 'အထွေထွေရောဂါကု', experience: 7, price: 12000,
      imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
      bio: 'လူနာများနှင့် ရင်းနှီးသော ဆက်ဆံရေးဖြင့် ကုသပေးသော ဆရာဝန်တစ်ဦးဖြစ်သည်။',
      slots: [
        { dayOfWeek: 0, startTime: '09:00', endTime: '12:00' },
        { dayOfWeek: 2, startTime: '09:00', endTime: '12:00' },
        { dayOfWeek: 4, startTime: '13:00', endTime: '16:00' },
      ],
    },
    {
      phone: '09111000008', name: 'ဒေါ်ဆုမောင်မောင်', nameEn: 'Dr. Su Maung Maung',
      specialty: 'ကလေးရောဂါကု', experience: 9, price: 18000,
      imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face',
      bio: 'ကလေးငယ်များ၏ ကျန်းမာရေးစောင့်ရှောက်မှုတွင် ၉ နှစ်ကျော် အတွေ့အကြုံရှိသည်။',
      slots: [
        { dayOfWeek: 1, startTime: '08:00', endTime: '11:00' },
        { dayOfWeek: 3, startTime: '08:00', endTime: '11:00' },
        { dayOfWeek: 5, startTime: '08:00', endTime: '11:00' },
      ],
    },
    {
      phone: '09111000009', name: 'ဒေါက်တာသောင်းထွန်းနိုင်', nameEn: 'Dr. Thaung Htun Naing',
      specialty: 'နှလုံးရောဂါကု', experience: 22, price: 35000,
      imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
      bio: 'နှလုံးသွေးကြောဆိုင်ရာ ရောဂါများကို နှစ်ပေါင်း ၂၀ ကျော် ကုသပေးခဲ့သော ကျွမ်းကျင်သူဖြစ်သည်။',
      slots: [
        { dayOfWeek: 2, startTime: '13:00', endTime: '16:00' },
        { dayOfWeek: 4, startTime: '13:00', endTime: '16:00' },
      ],
    },
  ];

  let doctorCount = 0;
  for (const d of doctorData) {
    const existingUser = await db.user.findUnique({ where: { phone: d.phone } });

    if (existingUser) {
      // Update imageUrl on existing doctor
      await db.doctor.updateMany({
        where: { userId: existingUser.id },
        data:  { imageUrl: d.imageUrl },
      });
      doctorCount++;
      continue;
    }

    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { phone: d.phone, password: doctorPassword, name: d.name, role: 'DOCTOR', isActive: true },
      });
      const doc = await tx.doctor.create({
        data: {
          userId: user.id, name: d.name, nameEn: d.nameEn,
          specialty: d.specialty, bio: d.bio, imageUrl: d.imageUrl,
          phone: d.phone, experience: d.experience, price: d.price,
          isAvailable: true, isActive: true,
        },
      });
      await tx.doctorSlot.createMany({
        data: d.slots.map(s => ({
          doctorId: doc.id, dayOfWeek: s.dayOfWeek,
          startTime: s.startTime, endTime: s.endTime,
          duration: 15, maxPerSlot: 1,
        })),
      });
    });
    doctorCount++;
  }
  console.log(`✅ ${doctorCount} Doctors seeded. (password: doctor123)`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
