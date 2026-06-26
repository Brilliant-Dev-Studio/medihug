export type Doctor = {
  id: number;
  name_mm: string;
  name_en: string;
  spec_mm: string;
  spec_en: string;
  exp: number;
  price: number;
  waitMin: number;
  nextSlot_mm: string;
  nextSlot_en: string;
  img: string;
  online: boolean;
  rating: number;
  myDoctor?: boolean;
};

export const ALL_DOCTORS: Doctor[] = [
  {
    id: 1,
    name_mm: 'ပါမောက္ခသိန်းအောင်',
    name_en: 'Prof. Dr. Thein Aung',
    spec_mm: 'ကလေးကျန်းမာရေးအထူးကု',
    spec_en: 'Pediatric Specialist',
    exp: 43, price: 22000, waitMin: 15, rating: 4.9,
    nextSlot_mm: 'မနက်ဖြန် မနက် 9:00',
    nextSlot_en: 'Tomorrow 9:00 AM',
    img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
    online: true, myDoctor: true,
  },
  {
    id: 2,
    name_mm: 'ဒေါ်ကျော်ကျော်သိန်း',
    name_en: 'Dr. Kyaw Kyaw Thein',
    spec_mm: 'နှလုံးအထူးကု',
    spec_en: 'Cardiologist',
    exp: 28, price: 15000, waitMin: 10, rating: 4.8,
    nextSlot_mm: 'ယနေ့ မွန်းလွဲ 2:00',
    nextSlot_en: 'Today 2:00 PM',
    img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
    online: true,
  },
  {
    id: 3,
    name_mm: 'ဒေါ်သန်းသန်းမြင့်',
    name_en: 'Dr. Than Than Myint',
    spec_mm: 'ကလေးအထူးကု',
    spec_en: 'Pediatrician',
    exp: 18, price: 10000, waitMin: 30, rating: 4.7,
    nextSlot_mm: 'မနက်ဖြန် မနက် 10:30',
    nextSlot_en: 'Tomorrow 10:30 AM',
    img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face',
    online: false, myDoctor: true,
  },
  {
    id: 4,
    name_mm: 'ဦးမောင်မောင်ဝင်း',
    name_en: 'Dr. Maung Maung Win',
    spec_mm: 'အရေပြားအထူးကု',
    spec_en: 'Dermatologist',
    exp: 12, price: 12000, waitMin: 20, rating: 4.6,
    nextSlot_mm: 'ယနေ့ ညနေ 4:00',
    nextSlot_en: 'Today 4:00 PM',
    img: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
    online: true,
  },
  {
    id: 5,
    name_mm: 'ဒေါ်နွဲ့နွဲ့မြင့်',
    name_en: 'Dr. Nwe Nwe Myint',
    spec_mm: 'မျက်စိအထူးကု',
    spec_en: 'Ophthalmologist',
    exp: 22, price: 18000, waitMin: 45, rating: 4.9,
    nextSlot_mm: 'မနက်ဖြန် မနက် 8:00',
    nextSlot_en: 'Tomorrow 8:00 AM',
    img: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face',
    online: false,
  },
];

export const SPEC_ICON_MAP: Record<string, { color: string; bg: string }> = {
  'Pediatric Specialist': { color: '#f97316', bg: '#fff7ed' },
  'Cardiologist':         { color: '#ef4444', bg: '#fef2f2' },
  'Pediatrician':         { color: '#f97316', bg: '#fff7ed' },
  'Dermatologist':        { color: '#d97706', bg: '#fffbeb' },
  'Ophthalmologist':      { color: '#06b6d4', bg: '#ecfeff' },
};
