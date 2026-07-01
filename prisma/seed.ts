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

  /* ── Product Categories ── */
  const productCategories = [
    { name: 'ဆေးဝါး',              nameEn: 'Medicine' },
    { name: 'Supplement',           nameEn: 'Supplements & Vitamins' },
    { name: 'အရေပြားထိန်းသိမ်းမှု', nameEn: 'Skincare' },
    { name: 'ဆေးကိရိယာများ',        nameEn: 'Medical Devices' },
    { name: 'မိခင်နှင့်ကလေး',       nameEn: 'Mother & Baby' },
    { name: 'ကျန်းမာရေးအစားအစာ',   nameEn: 'Health Food' },
  ];
  for (const c of productCategories) {
    await db.productCategory.upsert({ where: { name: c.name }, update: { nameEn: c.nameEn }, create: c });
  }
  console.log(`✅ ${productCategories.length} Product Categories seeded.`);

  /* ── Doctors ── */
  const doctorPassword = await bcrypt.hash('doctor123', 12);

  const doctorData = [
    {
      phone: '09111000001', name: 'ဒေါ်မြင့်မြင့်အောင်', nameEn: 'Dr. Myint Myint Aung',
      specialty: 'အထွေထွေရောဂါကု', experience: 12, price: 15000,
      imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face',
      bio: 'အထွေထွေရောဂါ ကုသမှုတွင် အတွေ့အကြုံ ၁၂ နှစ်ကျော်ရှိသော ဆရာဝန်တစ်ဦးဖြစ်ပါသည်။ လူနာများ၏ ကျန်းမာရေးကို ဦးစားပေးကာ စစ်မှန်သော ဆေးဝါးနှင့် ကုသမှုများ ပေးသည်။',
      qualifications: 'M.B.,B.S | FCGP',
      careerMm: 'အထွေထွေရောဂါကု ဆရာဝန် | စစ်ကိုင်းဆေးတကသ',
      careerEn: 'Fellowship of College of General Practitioners',
      clinicTypesMm: ['ဖျားနာ၊ ချောင်းဆိုး၊ အအေးမိ', 'သွေးဖိအားရောဂါ ကုသမှု', 'ဆီးချိုရောဂါ စီမံခန့်ခွဲမှု', 'ကျန်းမာရေး ကြိုတင်စစ်ဆေးမှု'],
      clinicTypesEn: ['Fever, Cough & Common Cold', 'Hypertension Management', 'Diabetes Management', 'Preventive Health Screening'],
      languages: ['မြန်မာ', 'English'],
      location: 'ရန်ကုန်မြို့၊ တောင်ဥက္ကလာပ',
      slots: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '12:00' },
        { dayOfWeek: 5, startTime: '13:00', endTime: '16:00' },
      ],
      gallery: [
        { imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&fit=crop', captionMm: 'ဆေးကုသမှု ကော်ငါ', captionEn: 'Consultation Room' },
        { imageUrl: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&fit=crop', captionMm: 'ဆေးပစ္စည်းများ', captionEn: 'Medical Equipment' },
      ],
    },
    {
      phone: '09111000002', name: 'ဒေါက်တာကျော်ကျော်လင်း', nameEn: 'Dr. Kyaw Kyaw Lin',
      specialty: 'နှလုံးရောဂါကု', experience: 18, price: 30000,
      imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
      bio: 'နှလုံးရောဂါကုသမှုနှင့် ခွဲစိတ်မှုတွင် ကျွမ်းကျင်သော ဆရာဝန်ဖြစ်သည်။ နှလုံးသွေးကြောဆိုင်ရာ ရောဂါများကို ၁၈ နှစ်ကျော် ကုသပေးခဲ့ပြီး နိုင်ငံတကာ ဆောင်းပါးများတွင် ပူးပေါင်းပါဝင်ဆောင်ရွက်ခဲ့သည်။',
      qualifications: 'M.B.,B.S | MRCP (UK) | FESC | PhD (Cardiology)',
      careerMm: 'နှလုံးရောဂါကု အထူးကုဆရာဝန် | ရန်ကုန် နှလုံးအထူးကုဆေးရုံ',
      careerEn: 'Senior Consultant Cardiologist | Yangon Heart Specialist Hospital',
      clinicTypesMm: ['နှလုံးသွေးကြောကျဉ်းရောဂါ', 'နှလုံးခုန်မမှန်ရောဂါ', 'နှလုံးပျက်ကွက်ခြင်း ကုသမှု', 'နှလုံးသွေးဖိအားစစ်ဆေးမှု', 'ECG နှင့် Echo စစ်ဆေးမှု'],
      clinicTypesEn: ['Coronary Artery Disease', 'Arrhythmia & Atrial Fibrillation', 'Heart Failure Management', 'Cardiac Hypertension', 'ECG & Echocardiography'],
      languages: ['မြန်မာ', 'English'],
      location: 'ရန်ကုန်မြို့၊ ဗဟန်း',
      slots: [
        { dayOfWeek: 1, startTime: '10:00', endTime: '13:00' },
        { dayOfWeek: 2, startTime: '14:00', endTime: '17:00' },
        { dayOfWeek: 4, startTime: '09:00', endTime: '12:00' },
      ],
      gallery: [
        { imageUrl: 'https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=800&fit=crop', captionMm: 'ECG စစ်ဆေးမှု', captionEn: 'ECG Monitoring Room' },
        { imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&fit=crop', captionMm: 'နှလုံးကင်မရာ စစ်ဆေးမှု', captionEn: 'Echocardiography Lab' },
        { imageUrl: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=800&fit=crop', captionMm: 'ဆေးကုသမှု ကော်ငါ', captionEn: 'Cardiac Consultation Suite' },
      ],
    },
    {
      phone: '09111000003', name: 'ဒေါ်သန်းသန်းမြ', nameEn: 'Dr. Than Than Mya',
      specialty: 'ကလေးရောဂါကု', experience: 10, price: 20000,
      imageUrl: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=400&fit=crop&crop=face',
      bio: 'ကလေးအထူးကု ဆရာဝန်တစ်ဦးဖြစ်ပြီး နွေးထွေးသော ကုသမှုဖြင့် နာမည်ကျော်သည်။ ကလေးများ၏ ဖွံ့ဖြိုးမှုနှင့် ကျန်းမာရေးကို ဦးတည်ကာ London DCH နှင့် MRCP ဘွဲ့များ ရရှိထားသည်။',
      qualifications: 'M.B.,B.S | DCH (London) | MRCP (UK) | FRCP (Edin) | Dr.Med.Sc (Paed)',
      careerMm: 'ကလေးအထူးကုဆရာဝန် | ရန်ကုန်ကလေးဆေးရုံကြီး',
      careerEn: 'Senior Pediatric Specialist | Yangon Children\'s Hospital',
      clinicTypesMm: ['ကလေးကျန်းမာရေး ပြသနာများ', 'ကာကွယ်ဆေးထိုးနှံမှုများ', 'ကလေးဖွံ့ဖြိုးမှု စစ်ဆေးမှု', 'ကလေးပဋိဇာဏု ရောဂါများ', 'အာဟာရချို့တဲ့မှု ကုသမှု'],
      clinicTypesEn: ['Pediatric Health Issues', 'Immunization Programs', 'Child Development Assessment', 'Pediatric Infections', 'Nutritional Disorders Treatment'],
      languages: ['မြန်မာ', 'English', 'Chinese'],
      location: 'ရန်ကုန်မြို့၊ မင်္ဂလာဒုံ',
      slots: [
        { dayOfWeek: 2, startTime: '09:00', endTime: '12:00' },
        { dayOfWeek: 4, startTime: '09:00', endTime: '12:00' },
        { dayOfWeek: 6, startTime: '09:00', endTime: '11:00' },
      ],
      gallery: [
        { imageUrl: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&fit=crop', captionMm: 'ကလေးဆေးကုသဌာန', captionEn: 'Pediatric Ward' },
        { imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&fit=crop', captionMm: 'ကလေးကုသမှုကော်ငါ', captionEn: 'Child Consultation Room' },
      ],
    },
    {
      phone: '09111000004', name: 'ဒေါ်နှင်းဆီဝင်း', nameEn: 'Dr. Hnin Si Win',
      specialty: 'အရေပြားရောဂါကု', experience: 8, price: 18000,
      imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
      bio: 'အရေပြားနှင့် အလှအပ ဆေးပညာတွင် ကျွမ်းကျင်သူဖြစ်သည်။ ဝက်ခြံ၊ အရေပြားနီ ယားရောဂါ၊ ဆံပင်ကျွတ်မှု နှင့် အလှ ကုသမှုများကို ဆောင်ရွက်ပေးသည်။',
      qualifications: 'M.B.,B.S | DDVL | MD (Dermatology)',
      careerMm: 'အရေပြားနှင့် အလှ ဆေးပညာ ဆရာဝန်',
      careerEn: 'Consultant Dermatologist & Aesthetic Physician',
      clinicTypesMm: ['မျက်နှာ ဝက်ခြံ ကုသမှု', 'ဆံပင်ကျွတ်ရောဂါ ကုသမှု', 'အရေပြားနီ ယားရောဂါ', 'ဓာတ်မတည့်မှု ကုသမှု', 'အရေပြား အဖြူ အမည်းကွက် ကုသမှု'],
      clinicTypesEn: ['Acne & Pimple Treatment', 'Hair Loss & Alopecia', 'Eczema & Psoriasis', 'Skin Allergy Management', 'Pigmentation & Dark Spots'],
      languages: ['မြန်မာ', 'English'],
      location: 'မန္တလေးမြို့',
      slots: [
        { dayOfWeek: 1, startTime: '13:00', endTime: '16:00' },
        { dayOfWeek: 3, startTime: '13:00', endTime: '16:00' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '12:00' },
      ],
      gallery: [],
    },
    {
      phone: '09111000005', name: 'ဒေါက်တာမျိုးမြင့်', nameEn: 'Dr. Myo Myint',
      specialty: 'အရိုးနှင့် အဆစ်ရောဂါကု', experience: 15, price: 25000,
      imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face',
      bio: 'အရိုးကျိုး၊ အဆစ်ရောင်ရောဂါ ကုသမှုနှင့် အစားထိုးခွဲစိတ်မှုတွင် ကျွမ်းကျင်သော ဆရာဝန်ဖြစ်သည်။ ၁၅ နှစ်ကျော် အတွေ့အကြုံဖြင့် ကျောကိုင်းနာ၊ ဒူးဆစ်ပြဿနာ ကုသမှုများ ဆောင်ရွက်ပေးသည်။',
      qualifications: 'M.B.,B.S | MS (Orthopaedics) | FRCS (Edin)',
      careerMm: 'အရိုးနှင့် အဆစ်ရောဂါကု ခွဲစိတ်ဆရာဝန်',
      careerEn: 'Consultant Orthopaedic Surgeon',
      clinicTypesMm: ['အရိုးကျိုး နှင့် ဆစ်ပျက် ကုသမှု', 'ဒူးဆစ်အစားထိုး ခွဲစိတ်မှု', 'ကျောကိုင်းနာ ကုသမှု', 'အားကစားဒဏ်ရာ ကုသမှု', 'အရိုးပွရောဂါ စီမံခန့်ခွဲမှု'],
      clinicTypesEn: ['Fractures & Joint Injuries', 'Knee Replacement Surgery', 'Back & Spine Pain', 'Sports Injury Rehabilitation', 'Osteoporosis Management'],
      languages: ['မြန်မာ', 'English'],
      location: 'ရန်ကုန်မြို့၊ ကမာရွတ်',
      slots: [
        { dayOfWeek: 2, startTime: '10:00', endTime: '13:00' },
        { dayOfWeek: 4, startTime: '10:00', endTime: '13:00' },
        { dayOfWeek: 6, startTime: '09:00', endTime: '12:00' },
      ],
      gallery: [],
    },
    {
      phone: '09111000006', name: 'ဒေါ်ဝင်းဝင်းမြ', nameEn: 'Dr. Win Win Mya',
      specialty: 'မျက်စိရောဂါကု', experience: 11, price: 22000,
      imageUrl: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face',
      bio: 'မျက်စိရောဂါ ကုသမှုနှင့် မျက်မျှင်ခွဲစိတ်ကုသမှုတွင် အထူးကျွမ်းကျင်သူဖြစ်သည်။ ဖန်ခဲပတ် ခွဲစိတ်မှုများကို ခေတ်မီ နည်းပညာဖြင့် ဆောင်ရွက်ပေးသည်။',
      qualifications: 'M.B.,B.S | DO | FRCS (Ophthalmology)',
      careerMm: 'မျက်စိရောဂါကု ဆရာဝန်',
      careerEn: 'Consultant Ophthalmologist',
      clinicTypesMm: ['မြင်လိုအား စစ်ဆေးမှု', 'ဖန်ခဲပတ် ခွဲစိတ်မှု', 'မျက်ကြည်ကာသား ရောဂါ', 'မျက်ဆံပြောင်ရောဂါ', 'မျက်ကြည်လွှာ ရောဂါ'],
      clinicTypesEn: ['Vision Assessment & Refraction', 'Cataract Surgery', 'Corneal Diseases', 'Glaucoma Management', 'Retinal Disorders'],
      languages: ['မြန်မာ', 'English'],
      location: 'ရန်ကုန်မြို့၊ ကြည့်မြင်တိုင်',
      slots: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '11:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '11:00' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '11:00' },
      ],
      gallery: [],
    },
    {
      phone: '09111000007', name: 'ဒေါက်တာဌေးဌေးထွန်း', nameEn: 'Dr. Htay Htay Htun',
      specialty: 'အထွေထွေရောဂါကု', experience: 7, price: 12000,
      imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
      bio: 'လူနာများနှင့် ရင်းနှီးသော ဆက်ဆံရေးဖြင့် ကုသပေးသော ဆရာဝန်တစ်ဦးဖြစ်သည်။ မိသားစုကျန်းမာရေးနှင့် ပြည်သူ့ကျန်းမာရေး ကာကွယ်ရေးကို ဦးတည်ကာ ဆောင်ရွက်နေသည်။',
      qualifications: 'M.B.,B.S',
      careerMm: 'မိသားစုကျန်းမာရေး ဆရာဝန်',
      careerEn: 'Family Physician',
      clinicTypesMm: ['အထွေထွေ ကျန်းမာရေး ကုသမှု', 'မိသားစုကျန်းမာရေး ဆွေးနွေးမှု', 'ပြည်သူ့ကျန်းမာရေး စစ်ဆေးမှု'],
      clinicTypesEn: ['General Medical Care', 'Family Health Consultation', 'Community Health Screening'],
      languages: ['မြန်မာ'],
      location: 'ပဲခူးမြို့',
      slots: [
        { dayOfWeek: 0, startTime: '09:00', endTime: '12:00' },
        { dayOfWeek: 2, startTime: '09:00', endTime: '12:00' },
        { dayOfWeek: 4, startTime: '13:00', endTime: '16:00' },
      ],
      gallery: [],
    },
    {
      phone: '09111000008', name: 'ဒေါ်ဆုမောင်မောင်', nameEn: 'Dr. Su Maung Maung',
      specialty: 'ကလေးရောဂါကု', experience: 9, price: 18000,
      imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face',
      bio: 'ကလေးငယ်များ၏ ကျန်းမာရေးစောင့်ရှောက်မှုတွင် ၉ နှစ်ကျော် အတွေ့အကြုံရှိသည်။ ကလေးဖျားနာမှု၊ အာဟာရနှင့် ဖွံ့ဖြိုးမှုကို ကျွမ်းကျင်စွာ ကုသပေးသည်။',
      qualifications: 'M.B.,B.S | DCH | MD (Paediatrics)',
      careerMm: 'ကလေးရောဂါကု ဆရာဝန်',
      careerEn: 'Pediatric Specialist',
      clinicTypesMm: ['ကလေးဖျားနာ ကုသမှု', 'သွေးအားနည်း ကုသမှု', 'ကလေးအာဟာရ ဆွေးနွေးမှု', 'ကလေးကာကွယ်ဆေး ဆေးနှံခြင်း'],
      clinicTypesEn: ['Pediatric Fever Management', 'Childhood Anemia Treatment', 'Pediatric Nutrition Counseling', 'Childhood Immunization'],
      languages: ['မြန်မာ', 'English'],
      location: 'မန္တလေးမြို့',
      slots: [
        { dayOfWeek: 1, startTime: '08:00', endTime: '11:00' },
        { dayOfWeek: 3, startTime: '08:00', endTime: '11:00' },
        { dayOfWeek: 5, startTime: '08:00', endTime: '11:00' },
      ],
      gallery: [],
    },
    {
      phone: '09111000009', name: 'ဒေါက်တာသောင်းထွန်းနိုင်', nameEn: 'Dr. Thaung Htun Naing',
      specialty: 'နှလုံးရောဂါကု', experience: 22, price: 35000,
      imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
      bio: 'နှလုံးသွေးကြောဆိုင်ရာ ရောဂါများကို နှစ်ပေါင်း ၂၀ ကျော် ကုသပေးခဲ့သော နှလုံးရောဂါကု ပညာရှင်ဖြစ်သည်။ နိုင်ငံတကာ နှလုံးဆေးပညာ ညီလာခံများတွင် ကိုယ်စားပြုတင်ဆက်ပြဲသည်။',
      qualifications: 'M.B.,B.S | MRCP (UK) | FRCP (Edin) | PhD (Cardiology) | FESC',
      careerMm: 'နှလုံးသွေးကြောရောဂါ ပညာရှင် | ကျောင်းသားများ ဆရာ',
      careerEn: 'Professor & Senior Cardiac Specialist | International Cardiology Consultant',
      clinicTypesMm: ['မြင့်မားသော နှလုံးပျက်ကွက်ခြင်း', 'နှလုံးသွေးကြောဆိုင်ရာ ရောဂါများ', 'နှလုံး Intervention ပညာ', 'နှလုံးသွေးဖိအားရောဂါ', 'ကောင်စီ ဒုတိယအကြံ ဆွေးနွေးမှု'],
      clinicTypesEn: ['Advanced Heart Failure', 'Cardiovascular Disease Management', 'Interventional Cardiology', 'Cardiac Hypertension', 'Expert Second Opinion Consultation'],
      languages: ['မြန်မာ', 'English', 'Thai'],
      location: 'ရန်ကုန်မြို့၊ ရွှေတောင်ကြား',
      slots: [
        { dayOfWeek: 2, startTime: '13:00', endTime: '16:00' },
        { dayOfWeek: 4, startTime: '13:00', endTime: '16:00' },
      ],
      gallery: [],
    },
  ];

  let doctorCount = 0;
  for (const d of doctorData) {
    const existingUser = await db.user.findUnique({ where: { phone: d.phone } });
    let doctorId: string;

    if (existingUser) {
      const existingDoc = await db.doctor.findFirst({ where: { userId: existingUser.id } });
      if (!existingDoc) { doctorCount++; continue; }
      doctorId = existingDoc.id;
      await db.doctor.update({
        where: { id: doctorId },
        data: {
          imageUrl:      d.imageUrl,
          bio:           d.bio,
          qualifications: d.qualifications,
          careerMm:      d.careerMm,
          careerEn:      d.careerEn,
          clinicTypesMm: d.clinicTypesMm,
          clinicTypesEn: d.clinicTypesEn,
          languages:     d.languages,
          location:      d.location,
        },
      });
    } else {
      const user = await db.user.create({
        data: { phone: d.phone, password: doctorPassword, name: d.name, role: 'DOCTOR', isActive: true },
      });
      const doc = await db.doctor.create({
        data: {
          userId:        user.id,
          name:          d.name,
          nameEn:        d.nameEn,
          specialty:     d.specialty,
          bio:           d.bio,
          imageUrl:      d.imageUrl,
          phone:         d.phone,
          experience:    d.experience,
          price:         d.price,
          isAvailable:   true,
          isActive:      true,
          qualifications: d.qualifications,
          careerMm:      d.careerMm,
          careerEn:      d.careerEn,
          clinicTypesMm: d.clinicTypesMm,
          clinicTypesEn: d.clinicTypesEn,
          languages:     d.languages,
          location:      d.location,
        },
      });
      doctorId = doc.id;
      if (d.slots.length > 0) {
        await db.doctorSlot.createMany({
          data: d.slots.map(s => ({
            doctorId, dayOfWeek: s.dayOfWeek,
            startTime: s.startTime, endTime: s.endTime,
            duration: 15, maxPerSlot: 1,
          })),
        });
      }
    }

    /* Gallery — replace entirely */
    if (d.gallery.length > 0) {
      await db.doctorGallery.deleteMany({ where: { doctorId } });
      await db.doctorGallery.createMany({
        data: d.gallery.map((g, i) => ({
          doctorId,
          imageUrl:   g.imageUrl,
          captionMm:  g.captionMm ?? null,
          captionEn:  g.captionEn ?? null,
          order:      i,
        })),
      });
    }

    doctorCount++;
  }
  console.log(`✅ ${doctorCount} Doctors seeded. (password: doctor123)`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
