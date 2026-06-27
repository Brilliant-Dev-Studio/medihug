'use client';

import { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Phone, Clock, MapPin, Globe, Star,
  ChevronRight, Stethoscope, ShoppingBag, CheckCircle2, Heart,
} from 'lucide-react';
import { useLang } from '../../../lib/LanguageContext';

const PRIMARY   = 'var(--color-primary)';
const SECONDARY = 'var(--color-primary-dark)';
const ACCENT    = 'var(--color-accent)';

/* ── clinic data ── */
type Doctor = { id: number; name: string; spec_mm: string; spec_en: string; rating: number; price: number; img: string; reviews?: number; waitMin?: number; nextSlot_mm?: string; nextSlot_en?: string };
type Product = { id: number; name_mm: string; name_en: string; price: number; unit: string; img: string };

type Clinic = {
  id: number;
  name_mm: string; name_en: string;
  phone: string; open: string; close: string;
  address_mm: string; address_en: string;
  website?: string;
  about_mm: string; about_en: string;
  tags_mm: string[]; tags_en: string[];
  img: string; cover: string;
  verified: boolean;
  rating: number; reviews: number;
  doctors: Doctor[];
  products: Product[];
};

const CLINICS: Record<number, Clinic> = {
  1: {
    id: 1,
    name_mm: 'အေးမြသာ ဆေးခန်း', name_en: 'Aye Myat Tha Clinic',
    phone: '09 777 123 456', open: '08:00', close: '17:00',
    address_mm: 'အမှတ် ၁၂၃၊ ဗိုလ်ချုပ်လမ်း၊ ဗဟန်းမြို့နယ်၊ ရန်ကုန်တိုင်း',
    address_en: 'No. 123, Bogyoke Road, Bahan Township, Yangon',
    about_mm: 'အေးမြသာ ဆေးခန်းသည် ၂၀၁၀ ခုနှစ်မှ စတင်ဖွင့်လှစ်ကာ ၁၅ နှစ်ကျော် အတွေ့အကြုံဖြင့် ကျန်းမာရေး ဝန်ဆောင်မှုများ ပေးနေသောဆေးခန်းဖြစ်ပါသည်။',
    about_en: 'Aye Myat Tha Clinic has been providing quality healthcare since 2010, with over 15 years of experience. We offer comprehensive services from general medicine to specialist consultations.',
    tags_mm: ['ယေဘုယျဆေးကုသ', 'ကလေးကျန်းမာရေး', 'အမျိုးသမီးကျန်းမာရေး'],
    tags_en: ['General Medicine', 'Pediatrics', 'Women\'s Health'],
    img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=400&fit=crop',
    cover: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&h=600&fit=crop',
    verified: true, rating: 4.7, reviews: 248,
    doctors: [
      { id: 1, name: 'Dr. Khin Maung Lwin',  spec_mm: 'ယေဘုယျဆေးကု',         spec_en: 'General Practitioner', rating: 4.8, price: 8000,  img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=600&fit=crop&crop=face' },
      { id: 2, name: 'Dr. Su Su Aye',         spec_mm: 'ကလေးအထူးကု',           spec_en: 'Pediatrician',         rating: 4.9, price: 10000, img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&h=600&fit=crop&crop=face' },
      { id: 3, name: 'Dr. Myo Thant Zin',     spec_mm: 'အရေပြားအထူးကု',        spec_en: 'Dermatologist',        rating: 4.6, price: 12000, img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&h=600&fit=crop&crop=face' },
      { id: 4, name: 'Dr. Hnin Wai Phyo',     spec_mm: 'မျက်စီအထူးကု',          spec_en: 'Ophthalmologist',      rating: 4.7, price: 11000, img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=600&fit=crop&crop=face' },
      { id: 5, name: 'Dr. Zaw Win Aung',      spec_mm: 'သွားဆရာဝန်',            spec_en: 'Dentist',              rating: 4.5, price: 9000,  img: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=600&h=600&fit=crop&crop=face' },
      { id: 6, name: 'Dr. Thin Thin Oo',      spec_mm: 'ယေဘုယျဆေးကု',         spec_en: 'General Practitioner', rating: 4.7, price: 8000,  img: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=600&h=600&fit=crop&crop=face' },
      { id: 7, name: 'Dr. Kyaw Thu',           spec_mm: 'အူလမ်းကြောင်းအထူးကု', spec_en: 'Gastroenterologist',   rating: 4.8, price: 15000, img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=600&h=600&fit=crop&crop=face' },
      { id: 8, name: 'Dr. May Zin Thaw',      spec_mm: 'ကင်ဆာကုသအထူးကု',      spec_en: 'Oncologist',           rating: 4.9, price: 20000, img: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=600&h=600&fit=crop&crop=face' },
    ],
    products: [
      { id: 1,  name_mm: 'ဗီတာမင် C 500mg',      name_en: 'Vitamin C 500mg',      price: 4500,  unit: '30 tablets',  img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop' },
      { id: 2,  name_mm: 'Paracetamol 500mg',      name_en: 'Paracetamol 500mg',    price: 1200,  unit: '10 tablets',  img: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=400&fit=crop' },
      { id: 3,  name_mm: 'ကိုယ်ခံအားဆေး',          name_en: 'Immune Booster',       price: 12000, unit: '60 capsules', img: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop' },
      { id: 4,  name_mm: 'ဗီတာမင် D3 1000IU',      name_en: 'Vitamin D3 1000IU',    price: 8500,  unit: '60 capsules', img: 'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400&h=400&fit=crop' },
      { id: 5,  name_mm: 'Omega-3 Fish Oil',        name_en: 'Omega-3 Fish Oil',     price: 18000, unit: '90 capsules', img: 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=400&h=400&fit=crop' },
      { id: 6,  name_mm: 'Zinc + Selenium',         name_en: 'Zinc + Selenium',      price: 6500,  unit: '30 tablets',  img: 'https://images.unsplash.com/photo-1544991875-5dc1b05f1571?w=400&h=400&fit=crop' },
      { id: 7,  name_mm: 'Antacid Tablets',         name_en: 'Antacid Tablets',      price: 2000,  unit: '20 tablets',  img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop' },
      { id: 8,  name_mm: 'Multivitamin Complex',    name_en: 'Multivitamin Complex', price: 15000, unit: '60 tablets',  img: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=400&fit=crop' },
    ],
  },
  2: {
    id: 2,
    name_mm: 'မင်္ဂလာ ဆေးရုံ', name_en: 'Mingalar Hospital',
    phone: '09 250 456 789', open: '07:00', close: '20:00',
    address_mm: 'အမှတ် ၄၅၊ မင်္ဂလာတောင်ညွန့်လမ်း၊ မင်္ဂလာတောင်ညွန့်မြို့နယ်၊ ရန်ကုန်',
    address_en: 'No. 45, Mingalar Taungnyunt Road, Mingalar Taungnyunt Township, Yangon',
    website: 'www.mingalarhospital.com',
    about_mm: 'မင်္ဂလာ ဆေးရုံသည် ခေတ်မီ ကုသမှု နည်းပညာများဖြင့် ဆေးရုံတက် ကုသမှု၊ ခွဲစိတ်မှုနှင့် အရေးပေါ် ကုသမှုများ ၂၄ နာရီ ဝန်ဆောင်မှု ပေးနေသည့် ဆေးရုံကြီးဖြစ်သည်။',
    about_en: 'Mingalar Hospital is a full-service hospital offering inpatient care, surgical procedures, and 24-hour emergency services with modern medical technology.',
    tags_mm: ['ဆေးရုံတက်', 'ခွဲစိတ်ခန်း', 'အရေးပေါ်ကုသမှု', '၂၄နာရီ'],
    tags_en: ['Inpatient', 'Surgery', 'Emergency', '24/7'],
    img: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=400&fit=crop',
    cover: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1600&h=600&fit=crop',
    verified: true, rating: 4.5, reviews: 512,
    doctors: [
      { id: 9,  name: 'Dr. Aung Kyaw Zin',   spec_mm: 'နှလုံးအထူးကု',         spec_en: 'Cardiologist',         rating: 4.9, price: 20000, img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&h=600&fit=crop&crop=face' },
      { id: 10, name: 'Dr. Thida Win',        spec_mm: 'ခွဲစိတ်ဆရာဝန်',        spec_en: 'Surgeon',              rating: 4.7, price: 25000, img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=600&fit=crop&crop=face' },
      { id: 11, name: 'Dr. Ye Lin Aung',      spec_mm: 'အာရုံကြောအထူးကု',      spec_en: 'Neurologist',          rating: 4.6, price: 18000, img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=600&fit=crop&crop=face' },
      { id: 12, name: 'Dr. Phyu Phyu Lwin',   spec_mm: 'ကျောက်ကပ်အထူးကု',      spec_en: 'Nephrologist',         rating: 4.8, price: 22000, img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&h=600&fit=crop&crop=face' },
      { id: 13, name: 'Dr. Moe Kyaw Htet',    spec_mm: 'အဆုတ်အထူးကု',          spec_en: 'Pulmonologist',        rating: 4.5, price: 17000, img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=600&h=600&fit=crop&crop=face' },
      { id: 14, name: 'Dr. Aye Chan Myat',    spec_mm: 'ဦးနောက်ခွဲစိတ်အထူးကု', spec_en: 'Neurosurgeon',         rating: 4.9, price: 35000, img: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=600&h=600&fit=crop&crop=face' },
      { id: 15, name: 'Dr. Ko Ko Naing',      spec_mm: 'သည်းချောင်းအထူးကု',     spec_en: 'Hepatologist',         rating: 4.7, price: 19000, img: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=600&h=600&fit=crop&crop=face' },
      { id: 16, name: 'Dr. San San Oo',       spec_mm: 'ကင်ဆာကုသအထူးကု',      spec_en: 'Oncologist',           rating: 4.8, price: 28000, img: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=600&h=600&fit=crop&crop=face' },
    ],
    products: [
      { id: 9,  name_mm: 'သွေးတိုးဆေး Amlodipine', name_en: 'Amlodipine 5mg',       price: 3500,  unit: '30 tablets',  img: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=400&fit=crop' },
      { id: 10, name_mm: 'ဆီးချိုဆေး Metformin',    name_en: 'Metformin 500mg',      price: 2800,  unit: '30 tablets',  img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop' },
      { id: 11, name_mm: 'သတ္တိဆေး Ferrous',         name_en: 'Ferrous Sulfate',      price: 2200,  unit: '30 tablets',  img: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop' },
      { id: 12, name_mm: 'Atorvastatin 10mg',        name_en: 'Atorvastatin 10mg',    price: 4800,  unit: '30 tablets',  img: 'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400&h=400&fit=crop' },
      { id: 13, name_mm: 'Aspirin 100mg',             name_en: 'Aspirin 100mg',        price: 1500,  unit: '30 tablets',  img: 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=400&h=400&fit=crop' },
      { id: 14, name_mm: 'သွေးစစ်ကိရိယာ',            name_en: 'Glucose Monitor',      price: 45000, unit: '1 device',    img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop' },
      { id: 15, name_mm: 'Blood Pressure Monitor',   name_en: 'BP Monitor',           price: 55000, unit: '1 device',    img: 'https://images.unsplash.com/photo-1544991875-5dc1b05f1571?w=400&h=400&fit=crop' },
      { id: 16, name_mm: 'Surgical Mask Box',        name_en: 'Surgical Mask Box',    price: 8000,  unit: '50 pcs',      img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop' },
    ],
  },
  3: {
    id: 3,
    name_mm: 'ပန်းပွင့် ဆေးခန်း', name_en: 'Pan Pwint Clinic',
    phone: '09 451 789 012', open: '09:00', close: '18:00',
    address_mm: 'အမှတ် ၇၈၊ ပန်းဆိုးတန်းလမ်း၊ ကြည့်မြင်တိုင်မြို့နယ်၊ ရန်ကုန်',
    address_en: 'No. 78, Pan So Dan Road, Kyaukmyaung Township, Yangon',
    about_mm: 'ပန်းပွင့် ဆေးခန်းသည် မိသားစုကျန်းမာရေး စောင့်ရှောက်မှုနှင့် ကာကွယ်ဆေးများ ထိုးနှံမှုတွင် အထူးကျွမ်းကျင်သည့် ဆေးခန်းတစ်ခုဖြစ်ပါသည်။',
    about_en: 'Pan Pwint Clinic specializes in family healthcare and preventive medicine, offering vaccinations, health screenings, and chronic disease management.',
    tags_mm: ['မိသားစုကျန်းမာရေး', 'ကာကွယ်ဆေး', 'နာတာရှည်ရောဂါ'],
    tags_en: ['Family Health', 'Vaccination', 'Chronic Disease'],
    img: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=400&fit=crop',
    cover: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1600&h=600&fit=crop',
    verified: true, rating: 4.6, reviews: 189,
    doctors: [
      { id: 17, name: 'Dr. Nilar Myint',      spec_mm: 'မိသားစုဆေးကု',          spec_en: 'Family Physician',     rating: 4.8, price: 9000,  img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&h=600&fit=crop&crop=face' },
      { id: 18, name: 'Dr. Win Bo Hlaing',    spec_mm: 'ယေဘုယျဆေးကု',          spec_en: 'General Practitioner', rating: 4.6, price: 8000,  img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=600&fit=crop&crop=face' },
      { id: 19, name: 'Dr. Ei Phyu Sin',      spec_mm: 'ကလေးအထူးကု',            spec_en: 'Pediatrician',         rating: 4.9, price: 11000, img: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=600&h=600&fit=crop&crop=face' },
      { id: 20, name: 'Dr. Aung Aung Kyaw',   spec_mm: 'ကာကွယ်ဆေးအထူးကု',      spec_en: 'Vaccination Specialist',rating: 4.7, price: 9500,  img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&h=600&fit=crop&crop=face' },
      { id: 21, name: 'Dr. Mya Mya Htwe',     spec_mm: 'အမျိုးသမီးအထူးကု',      spec_en: 'Gynecologist',         rating: 4.8, price: 14000, img: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=600&h=600&fit=crop&crop=face' },
      { id: 22, name: 'Dr. Ye Yint Aung',     spec_mm: 'ယေဘုယျဆေးကု',          spec_en: 'General Practitioner', rating: 4.5, price: 8000,  img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=600&h=600&fit=crop&crop=face' },
      { id: 23, name: 'Dr. Su Myat Noe',      spec_mm: 'သွေးရောဂါအထူးကု',       spec_en: 'Hematologist',         rating: 4.7, price: 16000, img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=600&fit=crop&crop=face' },
      { id: 24, name: 'Dr. Kaung Htet Zaw',   spec_mm: 'နှလုံးအထူးကု',           spec_en: 'Cardiologist',         rating: 4.6, price: 18000, img: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=600&h=600&fit=crop&crop=face' },
    ],
    products: [
      { id: 17, name_mm: 'Hepatitis B ကာကွယ်ဆေး', name_en: 'Hepatitis B Vaccine',  price: 25000, unit: '1 dose',      img: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop' },
      { id: 18, name_mm: 'သွေးစစ်ချက် Package',    name_en: 'Blood Test Package',   price: 35000, unit: '1 set',       img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop' },
      { id: 19, name_mm: 'ဗီတာမင် D3',              name_en: 'Vitamin D3 1000IU',    price: 8500,  unit: '60 capsules', img: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=400&fit=crop' },
      { id: 20, name_mm: 'Influenza Vaccine',       name_en: 'Flu Vaccine',          price: 30000, unit: '1 dose',      img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop' },
      { id: 21, name_mm: 'Folic Acid 5mg',          name_en: 'Folic Acid 5mg',       price: 2500,  unit: '30 tablets',  img: 'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400&h=400&fit=crop' },
      { id: 22, name_mm: 'Paediatric Multivit',    name_en: 'Children Multivitamin', price: 9000,  unit: '60 tablets',  img: 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=400&h=400&fit=crop' },
      { id: 23, name_mm: 'Health Check Package',   name_en: 'Health Check Package',  price: 85000, unit: '1 package',   img: 'https://images.unsplash.com/photo-1544991875-5dc1b05f1571?w=400&h=400&fit=crop' },
      { id: 24, name_mm: 'Zinc Syrup (ကလေး)',       name_en: 'Zinc Syrup (Children)', price: 5500,  unit: '100ml',       img: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop' },
    ],
  },
  4: {
    id: 4,
    name_mm: 'ရွှေနန်း ဆေးရုံ', name_en: 'Shwe Nan Hospital',
    phone: '09 312 234 567', open: '06:00', close: '22:00',
    address_mm: 'အမှတ် ၂၂၊ ရွှေနန်းလမ်း၊ ဒဂုံမြို့နယ်၊ ရန်ကုန်',
    address_en: 'No. 22, Shwe Nan Road, Dagon Township, Yangon',
    about_mm: 'ရွှေနန်း ဆေးရုံသည် ကိုယ်ဝန်ဆောင်မိခင်များနှင့် မွေးကင်းစကလေးများအတွက် အထူးပြု ဝန်ဆောင်မှုများ ပေးသည့် ဆေးရုံဖြစ်ပြီး ၂၄ နာရီ မီးဖွားဆောင် ဖွင့်ထားသည်။',
    about_en: 'Shwe Nan Hospital is a specialized maternity and newborn care facility offering 24-hour delivery services, neonatal care, and women\'s health programs.',
    tags_mm: ['မီးဖွားဆောင်', 'သားဖွားမီးယပ်', 'ကလေးသူငယ်', '၂၄နာရီ'],
    tags_en: ['Maternity', 'OB-GYN', 'Neonatal', '24/7'],
    img: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=400&h=400&fit=crop',
    cover: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=1600&h=600&fit=crop',
    verified: false, rating: 4.4, reviews: 320,
    doctors: [
      { id: 25, name: 'Dr. Aye Aye Khin',     spec_mm: 'သားဖွားမီးယပ်အထူးကု',  spec_en: 'Obstetrician',         rating: 4.9, price: 22000, img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=600&fit=crop&crop=face' },
      { id: 26, name: 'Dr. Zin Mar Oo',       spec_mm: 'ကလေးသူငယ်အထူးကု',     spec_en: 'Neonatologist',        rating: 4.7, price: 18000, img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&h=600&fit=crop&crop=face' },
      { id: 27, name: 'Dr. Thazin Hlaing',    spec_mm: 'မိခင်ကျန်းမာရေးအထူးကု',spec_en: 'Maternal Medicine',    rating: 4.8, price: 20000, img: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=600&h=600&fit=crop&crop=face' },
      { id: 28, name: 'Dr. Naing Lin Oo',     spec_mm: 'ကလေးနှလုံးအထူးကု',    spec_en: 'Paediatric Cardiologist',rating: 4.6,price: 25000, img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&h=600&fit=crop&crop=face' },
      { id: 29, name: 'Dr. Wint Wint Kyaw',   spec_mm: 'သားဖွားမီးယပ်',         spec_en: 'Gynecologist',         rating: 4.7, price: 19000, img: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=600&h=600&fit=crop&crop=face' },
      { id: 30, name: 'Dr. Aung Zaw Oo',      spec_mm: 'ကလေးအထူးကု',           spec_en: 'Pediatrician',         rating: 4.8, price: 16000, img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=600&fit=crop&crop=face' },
      { id: 31, name: 'Dr. Hnin Yu Lwin',     spec_mm: 'မိခင်ကျန်းမာရေး',       spec_en: 'Women\'s Health',      rating: 4.5, price: 15000, img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=600&h=600&fit=crop&crop=face' },
      { id: 32, name: 'Dr. Pyae Phyo Aung',   spec_mm: 'ကလေးနှလုံးအထူးကု',    spec_en: 'Paediatric Surgeon',   rating: 4.9, price: 28000, img: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=600&h=600&fit=crop&crop=face' },
    ],
    products: [
      { id: 25, name_mm: 'မိခင်နို့မှုန့်',        name_en: 'Infant Formula',       price: 28000, unit: '400g',        img: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop' },
      { id: 26, name_mm: 'ကိုယ်ဝန်ဆောင် ဗီတာမင်', name_en: 'Prenatal Vitamins',     price: 15000, unit: '30 tablets',  img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop' },
      { id: 27, name_mm: 'ကလေး Growth Syrup',      name_en: 'Growth Syrup',          price: 12000, unit: '150ml',       img: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=400&fit=crop' },
      { id: 28, name_mm: 'Folic Acid 400mcg',      name_en: 'Folic Acid 400mcg',     price: 3500,  unit: '30 tablets',  img: 'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400&h=400&fit=crop' },
      { id: 29, name_mm: 'Iron + Folic Complex',   name_en: 'Iron + Folic Complex',  price: 5500,  unit: '30 tablets',  img: 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=400&h=400&fit=crop' },
      { id: 30, name_mm: 'Baby Thermometer',       name_en: 'Baby Thermometer',      price: 18000, unit: '1 device',    img: 'https://images.unsplash.com/photo-1544991875-5dc1b05f1571?w=400&h=400&fit=crop' },
      { id: 31, name_mm: 'ကိုယ်ဝန်စစ်ဆေးအတ္ထပတ်', name_en: 'Pregnancy Test Kit',    price: 4500,  unit: '2 strips',    img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop' },
      { id: 32, name_mm: 'Calcium + Vit D3',       name_en: 'Calcium + Vit D3',      price: 9000,  unit: '60 tablets',  img: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop' },
    ],
  },
  5: {
    id: 5,
    name_mm: 'ကြာသာပတေး ဆေးခန်း', name_en: 'Kyar Tha Patay Clinic',
    phone: '09 420 678 901', open: '08:30', close: '16:30',
    address_mm: 'အမှတ် ၅၅၊ ကြာသာပတေးလမ်း၊ တာမွေမြို့နယ်၊ ရန်ကုန်',
    address_en: 'No. 55, Kyar Tha Patay Road, Tharmawe Township, Yangon',
    about_mm: 'ကြာသာပတေး ဆေးခန်းသည် ဆီးချို၊ သွေးတိုးနှင့် နာတာရှည်ရောဂါများ စီမံခန့်ခွဲမှုတွင် အထူးကျွမ်းကျင်ပြီး တစ်ဦးချင်းစီ အပေါ် လေးစားသောဝန်ဆောင်မှုများ ပေးနေပါသည်။',
    about_en: 'Kyar Tha Patay Clinic specializes in diabetes, hypertension and chronic disease management with personalized care plans tailored to each patient\'s needs.',
    tags_mm: ['ဆီးချိုကုသ', 'သွေးတိုးကုသ', 'နာတာရှည်ရောဂါ'],
    tags_en: ['Diabetes Care', 'Hypertension', 'Chronic Disease'],
    img: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=400&fit=crop',
    cover: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1600&h=600&fit=crop',
    verified: true, rating: 4.8, reviews: 156,
    doctors: [
      { id: 33, name: 'Dr. Kyaw Zin Oo',      spec_mm: 'ဆီးချိုအထူးကု',          spec_en: 'Endocrinologist',      rating: 4.9, price: 15000, img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&h=600&fit=crop&crop=face' },
      { id: 34, name: 'Dr. Thant Zin Win',     spec_mm: 'သွေးတိုးအထူးကု',         spec_en: 'Hypertension Specialist',rating: 4.7,price: 14000, img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=600&fit=crop&crop=face' },
      { id: 35, name: 'Dr. Aye Mya Htwe',      spec_mm: 'နှလုံးအထူးကု',           spec_en: 'Cardiologist',         rating: 4.8, price: 18000, img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&h=600&fit=crop&crop=face' },
      { id: 36, name: 'Dr. Min Thura Aung',    spec_mm: 'ကျောက်ကပ်အထူးကု',        spec_en: 'Nephrologist',         rating: 4.6, price: 20000, img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=600&h=600&fit=crop&crop=face' },
      { id: 37, name: 'Dr. Khin Yadanar',      spec_mm: 'ယေဘုယျဆေးကု',           spec_en: 'General Practitioner', rating: 4.5, price: 9000,  img: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=600&h=600&fit=crop&crop=face' },
      { id: 38, name: 'Dr. Wai Yan Phyo',      spec_mm: 'အမျိုးသမီးကျန်းမာရေး',   spec_en: 'Women\'s Health',      rating: 4.7, price: 12000, img: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=600&h=600&fit=crop&crop=face' },
      { id: 39, name: 'Dr. Soe Moe Htun',      spec_mm: 'အူလမ်းကြောင်းအထူးကု',   spec_en: 'Gastroenterologist',   rating: 4.8, price: 16000, img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=600&fit=crop&crop=face' },
      { id: 40, name: 'Dr. Nann Htwe Zin',     spec_mm: 'ဆီးချိုအထူးကု',          spec_en: 'Diabetologist',        rating: 4.9, price: 17000, img: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=600&h=600&fit=crop&crop=face' },
    ],
    products: [
      { id: 33, name_mm: 'သွေးစစ်ကိရိယာ',       name_en: 'Glucose Monitor',       price: 45000, unit: '1 device',    img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop' },
      { id: 34, name_mm: 'Glucometer Strips',    name_en: 'Test Strips 50s',       price: 8000,  unit: '50 strips',   img: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=400&fit=crop' },
      { id: 35, name_mm: 'Omega-3 Fish Oil',     name_en: 'Omega-3 Fish Oil',      price: 18000, unit: '90 capsules', img: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop' },
      { id: 36, name_mm: 'BP Monitor ကိရိယာ',   name_en: 'Blood Pressure Monitor', price: 55000, unit: '1 device',    img: 'https://images.unsplash.com/photo-1544991875-5dc1b05f1571?w=400&h=400&fit=crop' },
      { id: 37, name_mm: 'Metformin 500mg',      name_en: 'Metformin 500mg',       price: 2800,  unit: '30 tablets',  img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop' },
      { id: 38, name_mm: 'Amlodipine 5mg',       name_en: 'Amlodipine 5mg',        price: 3500,  unit: '30 tablets',  img: 'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400&h=400&fit=crop' },
      { id: 39, name_mm: 'Diabetic Foot Cream',  name_en: 'Diabetic Foot Cream',   price: 12000, unit: '50g',         img: 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=400&h=400&fit=crop' },
      { id: 40, name_mm: 'Chromium Picolinate',  name_en: 'Chromium Picolinate',   price: 9500,  unit: '60 capsules', img: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop' },
    ],
  },
};

/* ── page ── */
export default function ClinicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { lang } = useLang();
  const mm = lang === 'mm';

  const clinic = CLINICS[Number(id)];
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const toggleFav = (docId: number) => setFavorites(prev => {
    const next = new Set(prev); next.has(docId) ? next.delete(docId) : next.add(docId); return next;
  });

  if (!clinic) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Clinic not found</p>
    </div>
  );

  const name = mm ? clinic.name_mm : clinic.name_en;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── hero cover ── */}
      <div className="relative w-full h-56 lg:h-72">
        <Image src={clinic.cover} alt={name} fill sizes="100vw" className="object-cover" priority />

        {/* back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-4 lg:top-6 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* ── content ── */}
      <div className="w-full px-4 pt-4 pb-28 flex flex-col gap-4">

        {/* clinic name card */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">{name}</h1>
                {clinic.verified && (
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: PRIMARY }} />
                )}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 stroke-yellow-400" />
                <span className="text-sm font-bold text-gray-700">{clinic.rating}</span>
                <span className="text-xs text-gray-400">({clinic.reviews} reviews)</span>
              </div>
            </div>
            {/* open indicator */}
            <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-green-50 border border-green-100">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-green-600">{mm ? 'ဖွင့်ဆဲ' : 'Open'}</span>
            </div>
          </div>

          {/* tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(mm ? clinic.tags_mm : clinic.tags_en).map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                style={{ backgroundColor: `${PRIMARY}10`, color: PRIMARY }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* info card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-50" style={{ backgroundColor: `${PRIMARY}06` }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>
              {mm ? 'ဆေးခန်း သတင်းအချက်အလက်' : 'Clinic Information'}
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            <div className="flex items-start gap-3 px-4 py-3">
              <Phone className="w-4 h-4 shrink-0 mt-0.5" style={{ color: PRIMARY }} />
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{mm ? 'ဖုန်းနံပါတ်' : 'Phone'}</p>
                <a href={`tel:${clinic.phone}`} className="text-sm font-semibold text-gray-800">{clinic.phone}</a>
              </div>
            </div>
            <div className="flex items-start gap-3 px-4 py-3">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-green-500" />
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{mm ? 'ဆေးခန်းချိန်' : 'Hours'}</p>
                <p className="text-sm font-semibold text-green-600">{clinic.open} – {clinic.close}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 px-4 py-3">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{mm ? 'လိပ်စာ' : 'Address'}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{mm ? clinic.address_mm : clinic.address_en}</p>
              </div>
            </div>
            {clinic.website && (
              <div className="flex items-start gap-3 px-4 py-3">
                <Globe className="w-4 h-4 shrink-0 mt-0.5" style={{ color: PRIMARY }} />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">{mm ? 'ဝက်ဘ်ဆိုက်' : 'Website'}</p>
                  <p className="text-sm font-medium" style={{ color: PRIMARY }}>{clinic.website}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* about */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
            {mm ? 'ဆေးခန်းအကြောင်း' : 'About'}
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {mm ? clinic.about_mm : clinic.about_en}
          </p>
        </div>

        {/* doctors */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" style={{ color: PRIMARY }} />
              <p className="text-sm font-bold text-gray-800">{mm ? 'ဆရာဝန်များ' : 'Our Doctors'}</p>
              <span className="text-xs text-gray-400 font-medium">{clinic.doctors.length} {mm ? 'ဦး' : 'doctors'}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {clinic.doctors.map(doc => {
              const fav = favorites.has(doc.id);
              const waitMin  = doc.waitMin  ?? 15;
              const nextSlot = mm ? (doc.nextSlot_mm ?? 'မနက်ဖြန် မနက် ၉:၀၀') : (doc.nextSlot_en ?? 'Tomorrow 9:00 AM');
              const reviews  = doc.reviews  ?? Math.round(doc.rating * 30);
              return (
                <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
                  {/* photo */}
                  <div className="relative w-full overflow-hidden bg-gray-100" style={{ height: 180 }}>
                    <Image src={doc.img} alt={doc.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover object-top" />
                    <button
                      onClick={() => toggleFav(doc.id)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center transition-transform active:scale-90"
                    >
                      <Heart className="w-4 h-4" style={{ color: fav ? '#ef4444' : '#9ca3af', fill: fav ? '#ef4444' : 'transparent' }} />
                    </button>
                  </div>

                  {/* info */}
                  <div className="p-3 flex flex-col gap-1.5 flex-1">
                    <div>
                      <p className="font-bold text-sm leading-snug line-clamp-2" style={{ color: PRIMARY }}>{doc.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{mm ? doc.spec_mm : doc.spec_en}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{mm ? `အတွေ့အကြုံ ${reviews} နှစ်` : `${reviews} reviews`}</span>
                      <span className="text-gray-200">|</span>
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-gray-600">{doc.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{mm ? `${waitMin} မိနစ်အတွင်း` : `In ${waitMin} min`}</span>
                    </div>

                    <div className="mt-auto pt-2 border-t border-gray-50">
                      <div className="flex items-center justify-between mb-2.5">
                        <div>
                          <p className="text-[10px] text-gray-400">{mm ? 'တိုင်ပင်ဆွေးနွေးခ' : 'Consult fee'}</p>
                          <p className="text-sm font-bold" style={{ color: PRIMARY }}>{doc.price.toLocaleString()} MMK</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400">{mm ? 'အဆောဆုံး' : 'Next slot'}</p>
                          <p className="text-[11px] font-semibold" style={{ color: ACCENT }}>{nextSlot}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Link
                          href={`/patient/doctors/${doc.id}`}
                          className="flex-1 text-center text-xs font-semibold py-2 rounded-full border transition-all active:scale-95"
                          style={{ borderColor: PRIMARY, color: PRIMARY }}
                        >
                          {mm ? 'ကိုယ်ရေးအကျဉ်း' : 'Profile'}
                        </Link>
                        <Link
                          href={`/patient/doctors/${doc.id}?tab=schedule`}
                          className="flex-1 text-center text-xs font-bold py-2 rounded-full text-white transition-all active:scale-95"
                          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}
                        >
                          {mm ? 'ချိန်းဆို' : 'Book'}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* products */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag className="w-4 h-4" style={{ color: PRIMARY }} />
            <p className="text-sm font-bold text-gray-800">{mm ? 'ထုတ်ကုန်များ' : 'Products'}</p>
            <span className="text-xs text-gray-400 font-medium">{clinic.products.length} {mm ? 'မျိုး' : 'items'}</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {clinic.products.map(p => (
              <Link
                key={p.id}
                href={`/patient/records/${p.id}`}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden active:scale-[0.98] transition-transform"
              >
                <div className="relative w-full h-32">
                  <Image src={p.img} alt={mm ? p.name_mm : p.name_en} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug">
                    {mm ? p.name_mm : p.name_en}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{p.unit}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-sm font-bold" style={{ color: PRIMARY }}>
                      {p.price.toLocaleString()} Ks
                    </p>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
