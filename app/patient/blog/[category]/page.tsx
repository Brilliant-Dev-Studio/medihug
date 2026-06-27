'use client';

import Image from 'next/image';
import Link from 'next/link';
import { use } from 'react';
import { ArrowLeft, Clock, BookOpen, ChevronRight } from 'lucide-react';
import { useLang } from '../../../lib/LanguageContext';

const PRIMARY   = 'var(--color-primary)';
const SECONDARY = 'var(--color-primary-dark)';

/* ── category meta ── */
const CATEGORIES: Record<string, { mm: string; en: string; img: string }> = {
  digestive:  { mm: 'အစာအိမ်ကျန်းမာရေး',      en: 'Digestive Health',    img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop' },
  dental:     { mm: 'သွားကျန်းမာရေး',           en: 'Dental Health',       img: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&h=400&fit=crop' },
  eye:        { mm: 'မျက်စီကျန်းမာရေး',          en: 'Eye Health',          img: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&h=400&fit=crop' },
  child:      { mm: 'ကလေးကျန်းမာရေး',           en: 'Child Health',        img: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=800&h=400&fit=crop' },
  liver:      { mm: 'အသည်းကျန်းမာရေး',          en: 'Liver Health',        img: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800&h=400&fit=crop' },
  'bone-joint': { mm: 'အရိုးအကြောကျန်းမာရေး',   en: 'Bone & Joint Health', img: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f3?w=800&h=400&fit=crop' },
  heart:      { mm: 'နှလုံးကျန်းမာရေး',          en: 'Heart Health',        img: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=800&h=400&fit=crop' },
  cancer:     { mm: 'ကင်ဆာ',                     en: 'Cancer',              img: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&h=400&fit=crop' },
  skin:       { mm: 'အရေပြားကျန်းမာရေး',         en: 'Skin Health',         img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&h=400&fit=crop' },
  nutrition:  { mm: 'အဟာရမျှတရေး',               en: 'Nutrition',           img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop' },
  mental:     { mm: 'စိတ်ကျန်းမာရေး',            en: 'Mental Health',       img: 'https://images.unsplash.com/photo-1620147461831-a97b99ade1d3?w=800&h=400&fit=crop' },
  fitness:    { mm: 'ကိုယ်လက်လှုပ်ရှားမှု',      en: 'Exercise & Fitness',  img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop' },
};

type Article = {
  id: number;
  slug: string;
  titleMm: string;
  titleEn: string;
  excerptMm: string;
  excerptEn: string;
  img: string;
  readMin: number;
  date: string;
  tag: string;
};

/* ── mock articles per category ── */
const ARTICLES: Record<string, Article[]> = {
  digestive: [
    { id: 1, slug: 'stomach-pain-causes', titleMm: 'အစာအိမ်နာခြင်း အကြောင်းရင်းများ', titleEn: 'Common Causes of Stomach Pain', excerptMm: 'အစာအိမ်နာခြင်းကို ဖြစ်စေသော အကြောင်းရင်းအမျိုးမျိုးနှင့် ကုသနည်းများ...', excerptEn: 'Explore the most common causes of stomach pain and when to seek medical help...', img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop', readMin: 5, date: 'Jun 20, 2026', tag: 'Digestive' },
    { id: 2, slug: 'acid-reflux-tips', titleMm: 'အစာပြန်တက်ခြင်း ကာကွယ်နည်း', titleEn: 'How to Prevent Acid Reflux', excerptMm: 'နေ့စဉ်ဘဝတွင် လိုက်နာနိုင်သော ရိုးရှင်းသောနည်းများဖြင့် အစာပြန်တက်ခြင်းကို ကာကွယ်ပါ...', excerptEn: 'Simple lifestyle changes that can significantly reduce acid reflux symptoms...', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop', readMin: 4, date: 'Jun 18, 2026', tag: 'Digestive' },
    { id: 3, slug: 'ibs-management', titleMm: 'IBS — ထိန်းသိမ်းနည်းများ', titleEn: 'Managing Irritable Bowel Syndrome', excerptMm: 'IBS ဖြစ်ပွားသောသူများအတွက် နေ့စဉ်ဘဝ ပြောင်းလဲမှုများဖြင့် လက္ခဏာများ လျော့ပါးစေရန်...', excerptEn: 'Practical strategies to manage IBS through diet, stress reduction and medication...', img: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600&h=400&fit=crop', readMin: 6, date: 'Jun 14, 2026', tag: 'Digestive' },
    { id: 4, slug: 'fiber-rich-foods', titleMm: 'အမျှင်ဓာတ်များသော အစားအစာများ', titleEn: 'Best Fiber-Rich Foods for Gut Health', excerptMm: 'အူလမ်းကြောင်းကျန်းမာရေးအတွက် အမျှင်ဓာတ်ကြွယ်ဝသော အစားအစာများ ရွေးချယ်ပုံ...', excerptEn: 'Top foods to improve your gut microbiome and digestive function naturally...', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop', readMin: 3, date: 'Jun 10, 2026', tag: 'Nutrition' },
  ],
  heart: [
    { id: 1, slug: 'heart-attack-signs', titleMm: 'နှလုံးဖောက်ခြင်း လက္ခဏာများ', titleEn: 'Warning Signs of a Heart Attack', excerptMm: 'နှလုံးဖောက်ခြင်း မဖြစ်မီ ကြိုတင်သိနိုင်သော လက္ခဏာများနှင့် ရောဂါ ခွဲခြားနည်း...', excerptEn: 'Recognize the early warning signs of a heart attack and what to do immediately...', img: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=600&h=400&fit=crop', readMin: 5, date: 'Jun 22, 2026', tag: 'Heart' },
    { id: 2, slug: 'lower-blood-pressure', titleMm: 'သွေးတိုးကျဆင်းစေရန် နည်းလမ်းများ', titleEn: 'Natural Ways to Lower Blood Pressure', excerptMm: 'ဆေးမသောက်ဘဲ သွေးတိုးကို ထိန်းချုပ်နိုင်သော သဘာဝနည်းလမ်းများ...', excerptEn: 'Evidence-based lifestyle strategies to reduce blood pressure without medication...', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop', readMin: 7, date: 'Jun 19, 2026', tag: 'Heart' },
    { id: 3, slug: 'cholesterol-diet', titleMm: 'ကိုလက်စထရော ကျဆင်းစေမည့် အစားအစာများ', titleEn: 'Foods That Help Lower Cholesterol', excerptMm: 'ကိုလက်စထရောကို သဘာဝကျဆင်းစေမည့် အစားအစာများနှင့် ရှောင်ရမည့်အစားအစာများ...', excerptEn: 'Discover which foods actively help reduce bad cholesterol and protect your heart...', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop', readMin: 4, date: 'Jun 15, 2026', tag: 'Nutrition' },
  ],
  mental: [
    { id: 1, slug: 'anxiety-management', titleMm: 'စိုးရိမ်ပူပန်မှု ထိန်းချုပ်နည်း', titleEn: 'Managing Anxiety in Daily Life', excerptMm: 'နေ့စဉ်ဘဝတွင် စိုးရိမ်ပူပန်မှုကို လျော့ပါးစေမည့် လက်တွေ့ကျသော နည်းလမ်းများ...', excerptEn: 'Practical techniques to manage and reduce anxiety in your everyday routine...', img: 'https://images.unsplash.com/photo-1620147461831-a97b99ade1d3?w=600&h=400&fit=crop', readMin: 6, date: 'Jun 21, 2026', tag: 'Mental' },
    { id: 2, slug: 'sleep-better', titleMm: 'အိပ်ရေးကောင်းစေရန် နည်းလမ်းများ', titleEn: 'How to Sleep Better Every Night', excerptMm: 'အိပ်ရေးဝစေမည့် ကောင်းမွန်သောအလေ့အကျင့်များနှင့် ညဘက် routine များ...', excerptEn: 'Build a sleep routine that helps you fall asleep faster and wake up refreshed...', img: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&h=400&fit=crop', readMin: 5, date: 'Jun 17, 2026', tag: 'Mental' },
    { id: 3, slug: 'meditation-basics', titleMm: 'ရောဂါပျောက် တရားအားထုတ်နည်း', titleEn: 'Meditation for Beginners', excerptMm: 'စတင်သူများအတွက် တရားအားထုတ်ခြင်း အခြေခံနှင့် နေ့စဉ် ၁၀ မိနစ် ကျင့်ထုံး...', excerptEn: 'A simple guide to starting a meditation practice for stress relief and mental clarity...', img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop', readMin: 4, date: 'Jun 12, 2026', tag: 'Mental' },
  ],
};

/* fallback articles for categories without specific data */
const FALLBACK: Article[] = [
  { id: 1, slug: 'article-1', titleMm: 'ကျန်းမာသောဘဝအတွက် အကြံဉာဏ်များ', titleEn: 'Tips for a Healthier Lifestyle', excerptMm: 'ကျန်းမာရေးနှင့် ညီညွတ်သော ဘဝရှင်သန်မှုပုံစံ ပြောင်းလဲနည်းများ...', excerptEn: 'Simple daily habits that can transform your overall health and well-being...', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop', readMin: 5, date: 'Jun 20, 2026', tag: 'Health' },
  { id: 2, slug: 'article-2', titleMm: 'ဆေးစစ်ချက် အချိန်နှင့် အရေးပါမှု', titleEn: 'Why Regular Check-ups Matter', excerptMm: 'ပုံမှန်ဆေးစစ်ချက်များ ပြုလုပ်ခြင်းဖြင့် ရောဂါများကို အစောဆုံး ဖော်ထုတ်နိုင်ခြင်း...', excerptEn: 'Regular health screenings can detect conditions early when they are most treatable...', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop', readMin: 4, date: 'Jun 15, 2026', tag: 'Health' },
  { id: 3, slug: 'article-3', titleMm: 'ရေသောက်ခြင်း အကျိုးကျေးဇူးများ', titleEn: 'The Benefits of Staying Hydrated', excerptMm: 'ရေလုံလောက်စွာ သောက်ခြင်းသည် ခန္ဓာကိုယ် လုပ်ဆောင်ချက်အားလုံးကို ကောင်းမွန်စေသည်...', excerptEn: 'How proper hydration impacts your energy levels, skin, and organ function...', img: 'https://images.unsplash.com/photo-1559181567-c3190bfbf946?w=600&h=400&fit=crop', readMin: 3, date: 'Jun 10, 2026', tag: 'Health' },
];

/* ── article card ── */
function ArticleCard({ article, mm }: { article: Article; mm: boolean }) {
  return (
    <Link
      href={`/patient/blog/article/${article.slug}`}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col active:scale-[0.98] transition-transform"
    >
      <div className="relative w-full h-44 shrink-0">
        <Image src={article.img} alt={mm ? article.titleMm : article.titleEn} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: PRIMARY }}
        >
          {article.tag}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">
          {mm ? article.titleMm : article.titleEn}
        </p>
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 flex-1">
          {mm ? article.excerptMm : article.excerptEn}
        </p>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Clock className="w-3 h-3" />{article.readMin} {mm ? 'မိနစ်' : 'min read'}
            </span>
            <span className="text-[11px] text-gray-300">{article.date}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </div>
      </div>
    </Link>
  );
}

/* ── page ── */
export default function BlogCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const { lang } = useLang();
  const mm = lang === 'mm';

  const cat = CATEGORIES[category];
  const articles = ARTICLES[category] ?? FALLBACK;

  const title = cat ? (mm ? cat.mm : cat.en) : category;
  const heroImg = cat?.img ?? articles[0]?.img ?? '';

  return (
    <div className="min-h-full bg-gray-50">

      {/* ══ DESKTOP ══ */}
      <div className="hidden lg:flex gap-5 h-screen overflow-hidden px-6 py-6">
        <div className="flex-1 overflow-y-auto rounded-2xl bg-gray-50 flex flex-col">

          {/* Hero */}
          <div className="relative shrink-0 h-48 rounded-t-2xl overflow-hidden">
            <Image src={heroImg} alt={title} fill className="object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 100%)' }} />
            <div className="absolute inset-0 px-8 flex flex-col justify-center">
              <Link href="/patient/blog" className="flex items-center gap-1.5 text-white/70 text-xs mb-3 hover:text-white transition-colors w-fit">
                <ArrowLeft className="w-3.5 h-3.5" />{mm ? 'ဆောင်းပါး အမျိုးအစားများ' : 'All Categories'}
              </Link>
              <h1 className="text-3xl font-bold text-white">{title}</h1>
              <p className="text-white/60 text-sm mt-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                {articles.length} {mm ? 'ဆောင်းပါး' : 'articles'}
              </p>
            </div>
          </div>

          {/* Articles grid */}
          <div className="p-6 flex-1">
            <div className="grid grid-cols-3 gap-4">
              {articles.map(a => <ArticleCard key={a.id} article={a} mm={mm} />)}
            </div>
          </div>
        </div>
      </div>

      {/* ══ MOBILE ══ */}
      <div className="lg:hidden">

        {/* Hero */}
        <div className="relative h-52 w-full">
          <Image src={heroImg} alt={title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-gray-50" />
          <div className="absolute top-0 left-0 right-0 px-4 pt-14 pb-4">
            <Link
              href="/patient/blog"
              className="inline-flex items-center gap-1.5 text-white/80 text-xs mb-3"
            >
              <ArrowLeft className="w-3.5 h-3.5" />{mm ? 'ဆောင်းပါးများ' : 'Categories'}
            </Link>
            <h1 className="text-2xl font-bold text-white drop-shadow">{title}</h1>
            <p className="text-white/70 text-xs mt-1 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {articles.length} {mm ? 'ဆောင်းပါး' : 'articles'}
            </p>
          </div>
        </div>

        {/* Articles list */}
        <div className="px-4 pt-4 pb-28 flex flex-col gap-3 -mt-4">
          {articles.map(a => <ArticleCard key={a.id} article={a} mm={mm} />)}
        </div>
      </div>
    </div>
  );
}
