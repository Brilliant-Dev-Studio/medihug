'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Star, Heart, Package, Shield, Truck, CheckCircle2, ZoomIn, X } from 'lucide-react';
import { useLang } from '../../../lib/LanguageContext';

const PRIMARY   = '#0d2b6e';
const SECONDARY = '#1a6bcc';
const VIBER_NUMBER = '959123456789'; // placeholder number

type Product = {
  id: number;
  name: string;
  category_mm: string;
  category_en: string;
  size: string;
  price: number;
  rating: number;
  reviews: number;
  imgs: string[];
  desc_mm: string;
  desc_en: string;
  specs: { label_mm: string; label_en: string; value: string }[];
  features_mm: string[];
  features_en: string[];
};

const ALL_PRODUCTS: Product[] = [
  {
    id: 1, name: 'Paracetamol 500mg', category_mm: 'ဆေးဝါး', category_en: 'Medicine', size: '500mg', price: 1500, rating: 4.8, reviews: 320,
    imgs: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1550572017-edd951b55104?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&h=600&fit=crop'],
    desc_mm: 'Paracetamol 500mg သည် ဖျားနာမှု၊ ခေါင်းကိုက်ခြင်း၊ ကိုယ်ကာနာကျင်ခြင်းများကို သက်သာစေသော ဆေးဝါးဖြစ်သည်။ လူကြီး သို့မဟုတ် ကလေးများ အသုံးပြုနိုင်ပြီး ဆရာဝန်ညွှန်ကြားချက်အတိုင်း သောက်သုံးရပါမည်။',
    desc_en: 'Paracetamol 500mg is a widely used analgesic and antipyretic for relief from fever, headache, and body pain. Safe for adults and children when used as directed.',
    specs: [
      { label_mm: 'အမျိုးအစား', label_en: 'Type', value: 'Tablet' },
      { label_mm: 'ပါဝင်မှု', label_en: 'Strength', value: '500mg' },
      { label_mm: 'ထုပ်ပိုးမှု', label_en: 'Pack Size', value: '10 tablets/strip' },
      { label_mm: 'ထုတ်လုပ်သူ', label_en: 'Brand', value: 'Panadol' },
    ],
    features_mm: ['ဖျားနာမှု သက်သာစေသည်','ခေါင်းကိုက်ခြင်း သက်သာစေသည်','ကိုယ်ကာနာကျင်မှု သက်သာစေသည်','မိသားစုအသုံးပြုနိုင်သည်'],
    features_en: ['Reduces fever effectively','Relieves headaches','Eases body pain','Safe for the whole family'],
  },
  {
    id: 2, name: 'Vitamin C 1000mg', category_mm: 'ဖြည့်စွက်စာ', category_en: 'Supplements', size: '1000mg', price: 3200, rating: 4.9, reviews: 512,
    imgs: ['https://images.unsplash.com/photo-1550572017-edd951b55104?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop'],
    desc_mm: 'Vitamin C 1000mg သည် ခုခံအားစနစ်ကို အားကောင်းစေပြီး အရေပြားကောင်းမွန်မှုကို ပံ့ပိုးပေးသည်။ နေ့တိုင်း တစ်မှတ်ပြားနှုန်း သောက်သုံးနိုင်ပါသည်။',
    desc_en: 'Vitamin C 1000mg supports immune function, skin health, and acts as a powerful antioxidant. Take one tablet daily with or after food.',
    specs: [
      { label_mm: 'အမျိုးအစား', label_en: 'Type', value: 'Effervescent Tablet' },
      { label_mm: 'ပါဝင်မှု', label_en: 'Strength', value: '1000mg' },
      { label_mm: 'ထုပ်ပိုးမှု', label_en: 'Pack Size', value: '20 tablets/tube' },
      { label_mm: 'ထုတ်လုပ်သူ', label_en: 'Brand', value: 'Redoxon' },
    ],
    features_mm: ['ခုခံအားစနစ် အားကောင်းစေသည်','အရေပြား တောက်ပမွေ့လျားစေသည်','Antioxidant အားကောင်းသည်','ရေဖျော်သောက်နိုင်သည်'],
    features_en: ['Boosts immune system','Brightens and nourishes skin','Powerful antioxidant','Easy effervescent form'],
  },
  {
    id: 3, name: 'Cetaphil Face Wash', category_mm: 'အရေပြားပြုစု', category_en: 'Skincare', size: '250ml', price: 12500, rating: 4.7, reviews: 198,
    imgs: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&h=600&fit=crop'],
    desc_mm: 'Cetaphil Face Wash သည် အနှောင့်အယှက်မဖြစ်စေသော gentle formula ဖြင့် ဖန်တီးထားပြီး အထိခိုက်မခံသောအသားအရေများအတွက် သင့်လျော်သည်။ မကြာမကြာ အသုံးပြုနိုင်သည်။',
    desc_en: 'Cetaphil Gentle Skin Cleanser is a non-irritating, fragrance-free formula suitable for sensitive and dry skin. Gentle enough for daily use.',
    specs: [
      { label_mm: 'အမျိုးအစား', label_en: 'Type', value: 'Facial Cleanser' },
      { label_mm: 'ပမာဏ', label_en: 'Volume', value: '250ml' },
      { label_mm: 'သင့်တော်မှု', label_en: 'Skin Type', value: 'All skin types' },
      { label_mm: 'ထုတ်လုပ်သူ', label_en: 'Brand', value: 'Cetaphil' },
    ],
    features_mm: ['Gentle formula ဖြင့် သန့်ရှင်းသည်','အနံ့မပါ၊ အနှောင့်မဖြစ်','မျက်လုံးဝန်းကျင် သုံးနိုင်သည်','နေ့တိုင်း အသုံးပြုနိုင်သည်'],
    features_en: ['Gentle non-foaming cleanser','Fragrance & paraben free','Safe around eye area','Suitable for daily use'],
  },
  {
    id: 4, name: 'Dettol Antiseptic', category_mm: 'ပထမဆုံးအကူအညီ', category_en: 'First Aid', size: '250ml', price: 2800, rating: 4.6, reviews: 275,
    imgs: ['https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1550572017-edd951b55104?w=600&h=600&fit=crop'],
    desc_mm: 'Dettol Antiseptic Liquid သည် ဒဏ်ရာများ၊ ဖြတ်မိ ထိမိ ရာများကို သန့်ရှင်းစေပြီး ရောဂါပိုးများကို သတ်ပစ်နိုင်သည်။ အိမ်တိုင်းတွင် မရှိမဖြစ် လိုအပ်သောပစ္စည်းဖြစ်သည်။',
    desc_en: 'Dettol Antiseptic Liquid kills 99.9% of germs and bacteria. Ideal for wound care, surface disinfection, and general hygiene.',
    specs: [
      { label_mm: 'အမျိုးအစား', label_en: 'Type', value: 'Antiseptic Liquid' },
      { label_mm: 'ပမာဏ', label_en: 'Volume', value: '250ml' },
      { label_mm: 'ထိရောက်မှု', label_en: 'Efficacy', value: 'Kills 99.9% germs' },
      { label_mm: 'ထုတ်လုပ်သူ', label_en: 'Brand', value: 'Dettol' },
    ],
    features_mm: ['ပိုးဘက်တီးရီးယား ၉၉.၉% သတ်နိုင်','ဒဏ်ရာ ပထမဆုံးကုသမှုကောင်း','မျက်နှာသစ်ရေထဲ ရောနှောနိုင်','ဓနသဟာများ သန့်ရှင်းနိုင်'],
    features_en: ['Kills 99.9% bacteria & germs','Ideal for first aid wound care','Can be diluted in bathwater','Multi-surface disinfection'],
  },
  {
    id: 5, name: 'Omega-3 Fish Oil', category_mm: 'ဖြည့်စွက်စာ', category_en: 'Supplements', size: '1000mg', price: 8900, rating: 4.8, reviews: 430,
    imgs: ['https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1550572017-edd951b55104?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&h=600&fit=crop'],
    desc_mm: 'Omega-3 Fish Oil 1000mg သည် နှလုံးကျန်းမာရေး၊ ဦးနှောက်လုပ်ဆောင်ချက် နှင့် အဆစ်ကျန်းမာရေးအတွက် EPA နှင့် DHA ဓာတ်များ ကြွယ်ဝစွာ ပါဝင်သည်။',
    desc_en: 'Omega-3 Fish Oil 1000mg is rich in EPA and DHA to support heart health, brain function, and joint mobility. Take 1-2 capsules daily.',
    specs: [
      { label_mm: 'အမျိုးအစား', label_en: 'Type', value: 'Soft Gel Capsule' },
      { label_mm: 'ပါဝင်မှု', label_en: 'Strength', value: '1000mg (EPA 180mg + DHA 120mg)' },
      { label_mm: 'ထုပ်ပိုးမှု', label_en: 'Pack Size', value: '30 capsules' },
      { label_mm: 'ထုတ်လုပ်သူ', label_en: 'Brand', value: 'Nature\'s Bounty' },
    ],
    features_mm: ['နှလုံးကျန်းမာရေး ပံ့ပိုးသည်','ဦးနှောက် လုပ်ဆောင်ချက် ကောင်းမွန်သည်','အဆစ်နာကျင်မှု သက်သာစေသည်','ညစာပြီးနောက် သောက်သုံးနိုင်'],
    features_en: ['Supports cardiovascular health','Enhances brain & cognitive function','Reduces joint inflammation','Best taken after meals'],
  },
  {
    id: 6, name: 'Baby Dove Body Lotion', category_mm: 'မိခင်နှင့်ကလေး', category_en: 'Mother & Baby', size: '400ml', price: 5500, rating: 4.9, reviews: 610,
    imgs: ['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop'],
    desc_mm: 'Baby Dove Body Lotion သည် ကလေးငယ်များ၏ နူးညံ့သောအသားအရေကို ဆေးဘက်ဆိုင်ရာ အစစ်ဆေးဖြတ်ထားပြီး ကာကွယ်ပေးသောlotion ဖြစ်သည်။ ဒါမ်မိုက်ဒါ-tested ဖြစ်သောကြောင့် ကလေးအတွက် လုံခြုံသည်။',
    desc_en: 'Baby Dove Rich Moisture Lotion is dermatologist-tested and enriched with baby-friendly nutrients to keep baby\'s skin soft, smooth, and healthy.',
    specs: [
      { label_mm: 'အမျိုးအစား', label_en: 'Type', value: 'Body Lotion' },
      { label_mm: 'ပမာဏ', label_en: 'Volume', value: '400ml' },
      { label_mm: 'သင့်တော်မှု', label_en: 'Suitable For', value: 'Newborns & above' },
      { label_mm: 'ထုတ်လုပ်သူ', label_en: 'Brand', value: 'Baby Dove' },
    ],
    features_mm: ['Dermatologist-tested လုံခြုံသည်','ကလေးအသားအရေ နူးညံ့စေသည်','အနံ့ ပျော့ပြောင်းသည်','နွေ့ညင်းသော formula'],
    features_en: ['Dermatologist-tested & approved','Keeps baby skin soft & smooth','Mild, gentle fragrance','Hypoallergenic formula'],
  },
  {
    id: 7, name: 'Strepsils Throat Lozenges', category_mm: 'ဆေးဝါး', category_en: 'Medicine', size: '100mg', price: 1800, rating: 4.5, reviews: 160,
    imgs: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop&sat=-100','https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=600&fit=crop'],
    desc_mm: 'Strepsils Throat Lozenges သည် လည်ချောင်းနာကျင်မှုနှင့် ချောင်းဆိုးကို သက်သာစေသောဆေးဝါးဖြစ်သည်။ ပါးစပ်ထဲ ထည့်ပြီး ပျော်ပျောက်အောင် ထားနိုင်သည်။',
    desc_en: 'Strepsils Throat Lozenges provide fast, effective relief from sore throat and mouth infections. Contains antibacterial agents for targeted action.',
    specs: [
      { label_mm: 'အမျိုးအစား', label_en: 'Type', value: 'Lozenge' },
      { label_mm: 'ပါဝင်မှု', label_en: 'Strength', value: '2.4mg / 0.6mg' },
      { label_mm: 'ထုပ်ပိုးမှု', label_en: 'Pack Size', value: '24 lozenges' },
      { label_mm: 'ထုတ်လုပ်သူ', label_en: 'Brand', value: 'Strepsils' },
    ],
    features_mm: ['လည်ချောင်းနာ သက်သာစေသည်','ပိုးဘက်တီးရီးယား တိုက်ဖျက်သည်','အရသာ ကောင်းသည်','မြန်မြန်ဆန်ဆန် အကျိုးပြုသည်'],
    features_en: ['Fast sore throat relief','Antibacterial action','Pleasant taste','Works in minutes'],
  },
  {
    id: 8, name: 'Glucometer Device', category_mm: 'ဆေးကိရိယာ', category_en: 'Medical Device', size: 'Standard', price: 45000, rating: 4.7, reviews: 88,
    imgs: ['https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&h=600&fit=crop'],
    desc_mm: 'Glucometer Device သည် သွေးသကြားဓာတ် တိုင်းတာရန် အသုံးပြုသောကိရိယာဖြစ်ပြီး မိနစ်ပိုင်းအတွင်း တိကျသောရလဒ်ကို ပေးသည်။ ဆီးချိုရောဂါသည်များ အတွက် မရှိမဖြစ် လိုအပ်သည်။',
    desc_en: 'This Glucometer delivers accurate blood sugar readings in seconds. Ideal for diabetic patients for daily glucose monitoring at home.',
    specs: [
      { label_mm: 'အမျိုးအစား', label_en: 'Type', value: 'Blood Glucose Monitor' },
      { label_mm: 'တိကျမှု', label_en: 'Accuracy', value: '±10mg/dL' },
      { label_mm: 'မှတ်ဉာဏ်', label_en: 'Memory', value: '500 readings' },
      { label_mm: 'ထုတ်လုပ်သူ', label_en: 'Brand', value: 'Accu-Chek' },
    ],
    features_mm: ['သောက်ရွက် ၅ မိုက်ခရိုလီတာသာ လိုအပ်','ဖတ်ရှုချိန် ၅ စက္ကန့်အတွင်း','မှတ်ဉာဏ် ၅၀၀ ကြိမ်','USB Charging ပါဝင်'],
    features_en: ['Only 5μL blood sample needed','Results in 5 seconds','500 reading memory','Includes USB charging'],
  },
  {
    id: 9, name: 'Zinc Tablet 50mg', category_mm: 'ဖြည့်စွက်စာ', category_en: 'Supplements', size: '50mg', price: 2200, rating: 4.4, reviews: 95,
    imgs: ['https://images.unsplash.com/photo-1550572017-edd951b55104?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=600&fit=crop'],
    desc_mm: 'Zinc Tablet 50mg သည် ခုခံအားစနစ်ကို ပံ့ပိုးပြီး 傷ကျက်သောကုသမှု၊ အသားအရေ ကျန်းမာရေးနှင့် ပြန်လည်ထူထောင်မှုအတွက် အရေးကြီးသောဓာတ်ပစ္စည်းဖြစ်သည်။',
    desc_en: 'Zinc 50mg supports immune health, wound healing, skin clarity, and overall cell function. Take once daily with food.',
    specs: [
      { label_mm: 'အမျိုးအစား', label_en: 'Type', value: 'Tablet' },
      { label_mm: 'ပါဝင်မှု', label_en: 'Strength', value: '50mg' },
      { label_mm: 'ထုပ်ပိုးမှု', label_en: 'Pack Size', value: '60 tablets' },
      { label_mm: 'ထုတ်လုပ်သူ', label_en: 'Brand', value: 'Centrum' },
    ],
    features_mm: ['ခုခံအားစနစ် ပံ့ပိုးသည်','ဒဏ်ရာ မြန်မြန်ကျက်စေသည်','အသားအရေ တောက်ပစေသည်','ဆဲလ်လုပ်ဆောင်ချက် ကောင်းမွန်သည်'],
    features_en: ['Supports immune defense','Promotes wound healing','Improves skin clarity','Supports cell function'],
  },
  {
    id: 10, name: 'Sunscreen SPF 50', category_mm: 'အရေပြားပြုစု', category_en: 'Skincare', size: '100ml', price: 9800, rating: 4.6, reviews: 230,
    imgs: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop'],
    desc_mm: 'SPF 50 Sunscreen သည် နေရောင်ကင်းမဲ့ UVA/UVB ကာကွယ်မှုပေးပြီး အသားအရေကို အပူဒဏ်မှ ကာကွယ်သည်။ ပြင်ပထွက်ခွာမည်မဆိုမီ လိမ်းသင့်သည်။',
    desc_en: 'SPF 50 Sunscreen provides broad-spectrum UVA/UVB protection. Lightweight, non-greasy formula suitable for daily use before sun exposure.',
    specs: [
      { label_mm: 'အမျိုးအစား', label_en: 'Type', value: 'Sunscreen Lotion' },
      { label_mm: 'SPF', label_en: 'SPF', value: 'SPF 50 PA+++' },
      { label_mm: 'ပမာဏ', label_en: 'Volume', value: '100ml' },
      { label_mm: 'ထုတ်လုပ်သူ', label_en: 'Brand', value: 'Neutrogena' },
    ],
    features_mm: ['SPF 50 UVA/UVB ကာကွယ်မှု','မဆီဆိုင်သော နူးညံ့သောtexture','ရေဆေး resistant','နေ့တိုင်း အသုံးပြုနိုင်'],
    features_en: ['Broad spectrum SPF 50 protection','Lightweight non-greasy formula','Water-resistant','Suitable for daily use'],
  },
  {
    id: 11, name: 'Blood Pressure Monitor', category_mm: 'ဆေးကိရိယာ', category_en: 'Medical Device', size: 'Standard', price: 38000, rating: 4.8, reviews: 145,
    imgs: ['https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&h=600&fit=crop'],
    desc_mm: 'Blood Pressure Monitor သည် နှလုံးခုန်နှုန်းနှင့် သွေးဖိအားကို တိကျစွာ တိုင်းတာပေးသောကိရိယာဖြစ်သည်။ အိမ်မှာ ကိုယ်တိုင်စစ်ဆေးနိုင်သောကြောင့် ဆရာဝန်ထံ မသွားရပဲ ကျန်းမာရေးကို ထိန်းနိုင်သည်။',
    desc_en: 'Digital Blood Pressure Monitor for accurate systolic, diastolic, and pulse readings at home. WHO-certified classification of hypertension levels.',
    specs: [
      { label_mm: 'အမျိုးအစား', label_en: 'Type', value: 'Upper Arm BP Monitor' },
      { label_mm: 'မြင်ကွင်း', label_en: 'Display', value: 'Large LCD' },
      { label_mm: 'မှတ်ဉာဏ်', label_en: 'Memory', value: '60 readings × 2 users' },
      { label_mm: 'ထုတ်လုပ်သူ', label_en: 'Brand', value: 'Omron' },
    ],
    features_mm: ['WHO classification အတိုင်း ဖော်ပြသည်','သုံးစွဲသူ ၂ ဦး မှတ်ဉာဏ်','ကြီးမားသော LCD မျက်နှာပြင်','ဓာတ်ခဲ / adapter နှစ်မျိုးသုံးနိုင်'],
    features_en: ['WHO-classified BP results','2-user memory (60 readings each)','Extra-large backlit LCD','Runs on batteries or adapter'],
  },
  {
    id: 12, name: 'Baby Wipes 80pcs', category_mm: 'မိခင်နှင့်ကလေး', category_en: 'Mother & Baby', size: '80pcs', price: 3500, rating: 4.7, reviews: 380,
    imgs: ['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop','https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&h=600&fit=crop'],
    desc_mm: 'Baby Wipes 80pcs သည် ကလေးများ၏ နူးညံ့သောအသားအရေကို ညင်သာစွာ သန့်ရှင်းပေးသည်။ Aloe Vera နှင့် Vitamin E ပါဝင်သောကြောင့် အသားအရေကို ထိန်းသိမ်းပေးသည်။',
    desc_en: 'Gentle baby wipes with Aloe Vera and Vitamin E. Hypoallergenic and alcohol-free, safe for newborns and sensitive skin. 80 wipes per pack.',
    specs: [
      { label_mm: 'အမျိုးအစား', label_en: 'Type', value: 'Baby Wipes' },
      { label_mm: 'အရေအတွက်', label_en: 'Count', value: '80 wipes' },
      { label_mm: 'ပါဝင်ပစ္စည်း', label_en: 'Key Ingredients', value: 'Aloe Vera, Vitamin E' },
      { label_mm: 'ထုတ်လုပ်သူ', label_en: 'Brand', value: 'Huggies' },
    ],
    features_mm: ['Aloe Vera ပါဝင်သည်','Alcohol-free လုံခြုံသည်','Hypoallergenic ဖြစ်သည်','အသစ်မွေးကလေးများ အတွက်ပင် လုံခြုံသည်'],
    features_en: ['Enriched with Aloe Vera','Alcohol-free & gentle','Hypoallergenic tested','Safe for newborns'],
  },
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { lang } = useLang();
  const mm = lang === 'mm';

  const [slide, setSlide]       = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [zoom, setZoom]           = useState(false);

  const product = ALL_PRODUCTS.find(p => p.id === Number(id));
  if (!product) return <div className="flex items-center justify-center min-h-screen text-gray-400">Product not found</div>;

  const total = product.imgs.length;
  const prev = () => setSlide(s => (s - 1 + total) % total);
  const next = () => setSlide(s => (s + 1) % total);

  const viberMessage = encodeURIComponent(
    mm
      ? `မင်္ဂလာပါ၊ ${product.name} (${product.size}) - ${product.price.toLocaleString()} Ks ကို မှာယူလိုပါသည်။`
      : `Hello, I would like to order ${product.name} (${product.size}) - ${product.price.toLocaleString()} Ks.`
  );
  const viberUrl = `viber://chat?number=${VIBER_NUMBER}&text=${viberMessage}`;

  /* ── Lightbox ── */
  const lightbox = zoom && (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setZoom(false)}>
      <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center" onClick={() => setZoom(false)}>
        <X className="w-5 h-5 text-white" />
      </button>
      <button onClick={e => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button onClick={e => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
        <ChevronRight className="w-6 h-6 text-white" />
      </button>
      <div className="relative w-full max-w-2xl aspect-square mx-8" onClick={e => e.stopPropagation()}>
        <Image src={product.imgs[slide]} alt={product.name} fill className="object-contain" />
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {product.imgs.map((_, i) => (
          <button key={i} onClick={e => { e.stopPropagation(); setSlide(i); }}
            className="rounded-full transition-all"
            style={{ width: i === slide ? 20 : 6, height: 6, backgroundColor: i === slide ? '#fff' : 'rgba(255,255,255,0.4)' }} />
        ))}
      </div>
    </div>
  );

  /* ── Shared sections ── */
  const imageSlider = (
    <div className="relative overflow-hidden bg-gray-100 cursor-zoom-in" style={{ paddingBottom: '80%' }} onClick={() => setZoom(true)}>
      {product.imgs.map((src, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-300" style={{ opacity: i === slide ? 1 : 0, zIndex: i === slide ? 1 : 0 }}>
          <Image src={src} alt={product.name} fill className="object-cover" />
        </div>
      ))}
      <button onClick={e => { e.stopPropagation(); prev(); }} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/30 flex items-center justify-center backdrop-blur-sm">
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button onClick={e => { e.stopPropagation(); next(); }} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/30 flex items-center justify-center backdrop-blur-sm">
        <ChevronRight className="w-5 h-5 text-white" />
      </button>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
        {product.imgs.map((_, i) => (
          <button key={i} onClick={e => { e.stopPropagation(); setSlide(i); }}
            className="rounded-full transition-all"
            style={{ width: i === slide ? 18 : 6, height: 6, backgroundColor: i === slide ? '#fff' : 'rgba(255,255,255,0.5)' }} />
        ))}
      </div>
      <button onClick={e => { e.stopPropagation(); setFavorited(f => !f); }} className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
        <Heart className="w-4.5 h-4.5" fill={favorited ? '#ef4444' : 'none'} stroke={favorited ? '#ef4444' : '#9ca3af'} />
      </button>
      <span className="absolute top-3 left-3 z-10 text-xs font-semibold px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm" style={{ color: PRIMARY }}>
        {mm ? product.category_mm : product.category_en}
      </span>
      <span className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
        <ZoomIn className="w-4 h-4 text-white" />
      </span>
    </div>
  );

  const productInfo = (
    <div className="flex flex-col gap-4">
      {/* Name + rating */}
      <div>
        <h1 className="text-xl font-bold leading-snug" style={{ color: PRIMARY }}>{product.name}</h1>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className="w-3.5 h-3.5" fill={s <= Math.round(product.rating) ? '#facc15' : 'none'} stroke="#facc15" />
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.reviews} {mm ? 'သုံးစွဲသူ' : 'reviews'})</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-gray-200 text-gray-500 ml-1">{product.size}</span>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold" style={{ color: PRIMARY }}>{product.price.toLocaleString()}</span>
        <span className="text-sm font-semibold text-gray-400">Ks</span>
      </div>

      {/* Description */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm text-gray-600 leading-relaxed">{mm ? product.desc_mm : product.desc_en}</p>
      </div>

      {/* Features */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{mm ? 'အကျိုးကျေးဇူးများ' : 'Key Benefits'}</p>
        <div className="flex flex-col gap-1.5">
          {(mm ? product.features_mm : product.features_en).map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#10b981' }} />
              <span className="text-sm text-gray-700">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Specs */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{mm ? 'ကုန်ပစ္စည်း အချက်အလက်' : 'Product Details'}</p>
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          {product.specs.map((s, i) => (
            <div key={i} className={`flex items-center px-4 py-2.5 ${i !== product.specs.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <span className="text-xs text-gray-400 w-32 shrink-0">{mm ? s.label_mm : s.label_en}</span>
              <span className="text-xs font-semibold text-gray-700">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Shield,   mm: 'အာမခံချက်', en: 'Guaranteed' },
          { icon: Package,  mm: 'လုံခြုံသောထုပ်ပိုးမှု', en: 'Safe Packing' },
          { icon: Truck,    mm: 'လျင်မြန်သောဆောင်ရွက်ချက်', en: 'Fast Delivery' },
        ].map(({ icon: Icon, mm: lMm, en: lEn }) => (
          <div key={lEn} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl">
            <Icon className="w-4 h-4 text-gray-400" />
            <span className="text-[10px] font-semibold text-gray-500 text-center leading-tight">{mm ? lMm : lEn}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const viberButton = (
    <a
      href={viberUrl}
      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-80 border-2 bg-white"
      style={{ borderColor: '#7360f2', color: '#7360f2' }}
    >
      <Image src="/viberlogo.png" alt="Viber" width={28} height={28} className="object-contain" style={{ filter: 'invert(35%) sepia(80%) saturate(500%) hue-rotate(230deg)' }} />
      {mm ? 'မှတဆင့် မှာယူမည်' : 'Order via Viber'}
    </a>
  );

  return (
    <>
    {lightbox}
    <div className="min-h-full bg-gray-50 lg:bg-gray-100">

      {/* ══ DESKTOP ══ */}
      <div className="hidden lg:flex gap-5 h-screen overflow-hidden px-6 py-6">

        {/* Left: image + info */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-white flex flex-col">
          {/* Back button */}
          <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
            <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-sm font-semibold" style={{ color: PRIMARY }}>{mm ? 'ကုန်ပစ္စည်း အချက်အလက်' : 'Product Detail'}</span>
          </div>

          <div className="flex gap-8 p-6 flex-1">
            {/* Image */}
            <div className="w-80 shrink-0">
              <div className="rounded-2xl overflow-hidden border border-gray-100">{imageSlider}</div>
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">{productInfo}</div>
          </div>
        </div>

        {/* Right: order card */}
        <div className="shrink-0 w-72">
          <div className="sticky top-0 rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">

            {/* Gradient header */}
            <div className="px-5 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
              <p className="text-white/60 text-xs mb-1">{mm ? 'တန်ဖိုး' : 'Price'}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{product.price.toLocaleString()}</span>
                <span className="text-sm font-semibold text-white/60">Ks</span>
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className="w-3 h-3" fill={s <= Math.round(product.rating) ? '#facc15' : 'none'} stroke="#facc15" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-white/80">{product.rating}</span>
                <span className="text-xs text-white/50">({product.reviews})</span>
              </div>
            </div>

            {/* Body */}
            <div className="bg-white px-5 py-4 flex flex-col gap-3">

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Package, mm: 'မြန်ဆန်သောဆောင်ရွက်ချက်', en: 'Fast Delivery' },
                  { icon: Shield,  mm: 'စစ်မှန်သောကုန်ပစ္စည်း',   en: 'Genuine Product' },
                  { icon: Truck,   mm: 'လုံခြုံသောထုပ်ပိုးမှု',    en: 'Safe Packing' },
                  { icon: CheckCircle2, mm: 'အရည်အသွေး အာမခံ',   en: 'Quality Assured' },
                ].map(({ icon: Icon, mm: lMm, en: lEn }) => (
                  <div key={lEn} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: SECONDARY }} />
                    <span className="text-[10px] font-semibold text-gray-600 leading-tight">{mm ? lMm : lEn}</span>
                  </div>
                ))}
              </div>

              {/* How to order */}
              <div className="rounded-xl border border-purple-100 bg-purple-50 px-4 py-3">
                <p className="text-xs font-bold text-purple-700 mb-1">{mm ? 'မှာယူပုံ' : 'How to Order'}</p>
                <p className="text-xs text-purple-500 leading-relaxed">
                  {mm
                    ? 'Viber ကနေ ဆက်သွယ်ပြီး မှာယူနိုင်ပါသည်။ ဆောင်ရွက်ချိန် ၂၄ နာရီ အတွင်း ပြန်လည်ဆက်သွယ်မည်။'
                    : 'Contact us via Viber to place your order. We will respond within 24 hours.'}
                </p>
              </div>

              {/* Viber button */}
              {viberButton}

              {/* Wishlist */}
              <button
                onClick={() => setFavorited(f => !f)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border font-semibold text-sm transition-all"
                style={{ borderColor: favorited ? '#ef4444' : '#e5e7eb', color: favorited ? '#ef4444' : '#9ca3af', backgroundColor: favorited ? '#fff5f5' : '#fafafa' }}
              >
                <Heart className="w-4 h-4" fill={favorited ? '#ef4444' : 'none'} />
                {mm ? (favorited ? 'သိမ်းဆည်းထားသည်' : 'နှစ်သက်သောပစ္စည်းများ') : (favorited ? 'Saved' : 'Save to Wishlist')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ MOBILE ══ */}
      <div className="lg:hidden">
        {/* Back button */}
        <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm font-semibold truncate" style={{ color: PRIMARY }}>{product.name}</span>
        </div>

        {/* Image */}
        {imageSlider}

        {/* Info */}
        <div className="px-4 py-5 pb-36 flex flex-col gap-5">
          {productInfo}
        </div>

        {/* Fixed bottom bar */}
        <div className="fixed bottom-16 left-0 right-0 z-30 bg-white border-t border-gray-100 px-4 py-3 flex gap-3">
          <button
            onClick={() => setFavorited(f => !f)}
            className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-all"
            style={{ borderColor: favorited ? '#ef4444' : '#e5e7eb' }}
          >
            <Heart className="w-5 h-5" fill={favorited ? '#ef4444' : 'none'} stroke={favorited ? '#ef4444' : '#9ca3af'} />
          </button>
          <a href={viberUrl} className="flex-1 flex items-center justify-center gap-2 rounded-xl font-bold text-sm border-2 bg-white py-2.5"
            style={{ borderColor: '#7360f2', color: '#7360f2' }}>
            <Image src="/viberlogo.png" alt="Viber" width={28} height={28} className="object-contain" style={{ filter: 'invert(35%) sepia(80%) saturate(500%) hue-rotate(230deg)' }} />
            {mm ? 'မှတဆင့် မှာယူမည်' : 'Order via Viber'}
          </a>
        </div>
      </div>

    </div>
    </>
  );
}
