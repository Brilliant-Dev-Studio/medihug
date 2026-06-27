'use client';

import { use, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Heart, Clock, Eye, ChevronRight } from 'lucide-react';
import { useLang } from '../../../../lib/LanguageContext';

const PRIMARY = 'var(--color-primary)';

/* ── mock article data ── */
type Block =
  | { type: 'p'; mm: string; en: string }
  | { type: 'h2'; mm: string; en: string }
  | { type: 'h3'; mm: string; en: string }
  | { type: 'quote'; mm: string; en: string }
  | { type: 'img'; src: string; caption?: string };

type Article = {
  slug: string;
  titleMm: string;
  titleEn: string;
  category: string;
  categorySlug: string;
  img: string;
  readMin: number;
  views: number;
  date: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  blocks: Block[];
  tags: string[];
};

const ARTICLES: Record<string, Article> = {
  'stomach-pain-causes': {
    slug: 'stomach-pain-causes',
    titleMm: 'အစာအိမ်နာခြင်း အကြောင်းရင်းများနှင့် ကုသနည်း',
    titleEn: 'Common Causes of Stomach Pain & When to See a Doctor',
    category: 'Digestive Health',
    categorySlug: 'digestive',
    img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=600&fit=crop',
    readMin: 5, views: 1240, date: 'June 20, 2026',
    authorName: 'Dr. Su Su Lwin',
    authorRole: 'General Practitioner · MediHug',
    authorAvatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=80&h=80&fit=crop&crop=face',
    tags: ['Digestive', 'Stomach', 'Pain Relief'],
    blocks: [
      { type: 'p', mm: 'အစာအိမ်နာခြင်းသည် လူတိုင်း အနည်းဆုံး တစ်ကြိမ်ထက်ပို ကြုံတွေ့ဖူးသော ကျန်းမာရေး ပြဿနာတစ်ခုဖြစ်သည်။ ကင်မြန်တတ်သော နောက်ကျောနာမှ ပြင်းထန်သော ဝမ်းနည်မှုအထိ အစာအိမ်ဒေသတွင် နာကျင်မှုများစွာ ဖြစ်ပေါ်နိုင်သည်။', en: 'Stomach pain is something almost everyone experiences at some point in their life. From mild cramps to severe discomfort, abdominal pain can arise from a wide range of causes — some harmless, others requiring prompt medical attention.' },
      { type: 'h2', mm: 'အဓိက အကြောင်းရင်းများ', en: 'Most Common Causes' },
      { type: 'p', mm: 'အစာမကြေခြင်း (Indigestion) သည် အစာအိမ်နာခြင်း၏ အဖြစ်အများဆုံးသော အကြောင်းရင်းတစ်ခုဖြစ်သည်။ အစာကို လျင်မြန်စွာ စားခြင်း၊ အဆီများသောအစာများ သောက်သုံးခြင်း သို့မဟုတ် သောက်ကစားများပြားခြင်းတို့ကြောင့် ဖြစ်ပေါ်တတ်သည်။', en: 'Indigestion (dyspepsia) is one of the most common culprits. It often results from eating too quickly, consuming fatty or spicy foods, or drinking alcohol. The discomfort typically feels like a burning or heaviness in the upper abdomen.' },
      { type: 'img', src: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&h=500&fit=crop', caption: 'Healthy diet can significantly reduce digestive discomfort.' },
      { type: 'h3', mm: 'Gastritis (အစာအိမ်အနာ)', en: 'Gastritis (Stomach Inflammation)' },
      { type: 'p', mm: 'Gastritis သည် အစာအိမ်အတွင်းနံရံ ရောင်ရမ်းခြင်းကြောင့် ဖြစ်ပေါ်သည်။ H. pylori ဘက်တီးရီးယားပိုး ကူးစက်ခြင်း၊ ရောဂါပျောက်ဆေးများ ကြာရှည်သောက်ခြင်းတို့ကြောင့် ဖြစ်ပေါ်တတ်သည်။ လက္ခဏာများမှာ ရင်ကြက်ခြင်း၊ ပျို့ခြင်းနှင့် အစာစားပြီးနောက် နာကျင်ခြင်းတို့ ဖြစ်သည်။', en: 'Gastritis involves inflammation of the stomach lining and can be triggered by H. pylori bacterial infection, excessive use of NSAIDs, or heavy alcohol use. Symptoms include a burning ache in the upper abdomen, nausea, and vomiting.' },
      { type: 'quote', mm: 'အစာအိမ်နာနေသည်ဟု ထင်ရသောအခါ နာကျင်မှုသည် မိနစ်ပိုင်း ၃၀ ထက်ကျော်ပါက ဆရာဝန်နှင့် တိုင်ပင်သင့်သည်။', en: 'If stomach pain persists for more than 30 minutes or is accompanied by fever, vomiting blood, or severe cramping — seek immediate medical attention.' },
      { type: 'h2', mm: 'ဆရာဝန်နှင့် မည်သည့်အချိန် တွေ့ဆုံသင့်သနည်း', en: 'When to See a Doctor' },
      { type: 'p', mm: 'အောက်ပါ လက္ခဏာများ ပေါ်ပေါက်ပါက အမြန်ဆုံး ဆေးခန်းသို့ သွားရောက်ပါ — သွေးပါ ဝမ်းချုပ်ခြင်း၊ ဆီးနှင့် မြင်သောသွေး ပါခြင်း၊ ကိုယ်တွင်းမှ တုန်ခြင်း၊ ပြင်းထန်စွာ ကြက်သည် ဖြစ်ပေါ်ခြင်း တို့ဖြစ်သည်။', en: 'Seek immediate care if you experience: blood in stool or vomit, severe pain that comes on suddenly, pain with high fever, unexplained weight loss, or difficulty swallowing. These may signal a more serious underlying condition.' },
      { type: 'p', mm: 'ထိုကဲ့သို့ မဟုတ်သောနာကျင်မှုများအတွက် ကြို၍ ဆေးထိုးပြီး ရေများများသောက်ကာ နားနေသင့်သည်။ ပေါ်ပြာပေးသည်မှာ မကောင်းပါ အကြောင်းမရှိဘဲ ၂ ရက်ကျော် ဆက်ကြာပါက ဆရာဝန်နှင့် ပြသပါ။', en: 'For mild discomfort, rest, hydration and over-the-counter antacids often help. However, if pain persists beyond 48 hours without improvement, it\'s time to book a consultation with your doctor.' },
    ],
  },

  'heart-attack-signs': {
    slug: 'heart-attack-signs',
    titleMm: 'နှလုံးဖောက်ခြင်း လက္ခဏာများ — အချိန်မီ သိရှိနည်း',
    titleEn: 'Warning Signs of a Heart Attack — What You Must Know',
    category: 'Heart Health',
    categorySlug: 'heart',
    img: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=1200&h=600&fit=crop',
    readMin: 5, views: 3850, date: 'June 22, 2026',
    authorName: 'Dr. Khin Maung',
    authorRole: 'Cardiologist · MediHug',
    authorAvatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face',
    tags: ['Heart', 'Emergency', 'Prevention'],
    blocks: [
      { type: 'p', mm: 'နှလုံးဖောက်ခြင်း (Heart Attack) သည် မျော်လင့်မထားဘဲ ဖြစ်ပေါ်နိုင်သော အသက်ဆုံးရှုံးနိုင်သော အခြေအနေတစ်ခုဖြစ်သည်။ လက္ခဏာများကို အချိန်မီ သိရှိနိုင်ပါက မိနစ်တစ်ဆောင်အတွင်း ဆေးရုံသို့ ရောက်ရှိကာ အသက် ကယ်တင်နိုင်သည်။', en: 'A heart attack occurs when blood flow to the heart is blocked, usually by a clot. Recognizing the symptoms early can be the difference between life and death. Every minute without treatment means more heart muscle is lost.' },
      { type: 'h2', mm: 'အဓိက လက္ခဏာများ', en: 'Key Warning Signs' },
      { type: 'p', mm: 'ရင်ဘတ်တွင် ဖိနှိပ်ခြင်းကဲ့သို့ ခံစားရခြင်း၊ ဘယ်ဘက်လက်မောင်း ထုံကျင်ခြင်း၊ မောပမ်းသည်ဟု ထူးထူးဆန်းဆန်း ခံစားရခြင်း၊ ချွေးများများ ထွက်ခြင်းနှင့် ပျို့ချင်ငန်းမောင်ခြင်းတို့သည် နှလုံးဖောက်ခြင်းလက္ခဏာများ ဖြစ်သည်။', en: 'Classic symptoms include: chest pressure or tightness, pain radiating to the left arm or jaw, sudden shortness of breath, cold sweats, and nausea. Women may also experience unusual fatigue and back or stomach pain.' },
      { type: 'img', src: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&h=500&fit=crop', caption: 'Regular heart monitoring can detect early warning signs.' },
      { type: 'quote', mm: 'နှလုံးဖောက်ခြင်း လက္ခဏာများ ပေါ်ပေါက်ပါက အမြန်ဆုံး ဆေးရုံသို့ ခေါ်ဆောင်ပါ — မိမိကိုယ်တိုင် မောင်းနှင်ခြင်းမပြုပါနှင့်။', en: 'If you suspect a heart attack — call emergency services immediately. Do NOT drive yourself to the hospital. Chew an aspirin (if not allergic) while waiting for help.' },
      { type: 'h2', mm: 'ကာကွယ်နည်းများ', en: 'Prevention Tips' },
      { type: 'p', mm: 'ဆေးလိပ်ဖြတ်ခြင်း၊ ကိုယ်လက်လှုပ်ရှားမှု ပုံမှန်ပြုလုပ်ခြင်း၊ ကိုလက်စထရောနှင့် သွေးတိုးကို ထိန်းချုပ်ခြင်း၊ အဆီများနှင့် ဆားများသောအစားများ ရှောင်ကြဉ်ခြင်းတို့ဖြင့် နှလုံးဖောက်ခြင်း ဖြစ်နိုင်ခြေကို သိသိသာသာ လျော့ပါးစေနိုင်သည်။', en: 'Quit smoking, exercise regularly, manage blood pressure and cholesterol, limit salt and saturated fat, and get regular cardiac check-ups. A healthy lifestyle dramatically reduces your risk of heart disease.' },
    ],
  },

  'anxiety-management': {
    slug: 'anxiety-management',
    titleMm: 'နေ့စဉ်ဘဝတွင် စိုးရိမ်ပူပန်မှု ထိန်းချုပ်နည်း',
    titleEn: 'Managing Anxiety in Daily Life — Practical Techniques',
    category: 'Mental Health',
    categorySlug: 'mental',
    img: 'https://images.unsplash.com/photo-1620147461831-a97b99ade1d3?w=1200&h=600&fit=crop',
    readMin: 6, views: 2100, date: 'June 21, 2026',
    authorName: 'Dr. Thura Nyi',
    authorRole: 'Mental Health Specialist · MediHug',
    authorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face',
    tags: ['Mental Health', 'Anxiety', 'Wellness'],
    blocks: [
      { type: 'p', mm: 'စိုးရိမ်ပူပန်မှုသည် ဆေးဘက်ဆိုင်ရာ ကျယ်ကျယ်ပြန့်ပြန့် ဖြစ်ပေါ်နေသော ပြဿနာတစ်ခုဖြစ်သည်။ ကမ္ဘာတစ်ဝှမ်းတွင် လူ ၃၀၀ သန်းကျော်သည် စိုးရိမ်ပူပန်မှုဆိုင်ရာ ရောဂါများ ခံစားနေကြသည်ဟု WHO ကဆိုသည်။', en: 'Anxiety is one of the most widespread mental health challenges worldwide. According to the WHO, over 300 million people suffer from anxiety disorders — yet it remains one of the most treatable conditions when approached correctly.' },
      { type: 'h2', mm: 'ချက်ချင်း လျင်မြန်စွာ ကူညီနိုင်သော နည်းလမ်းများ', en: 'Quick Techniques That Work Immediately' },
      { type: 'p', mm: '4-7-8 အသက်ရှုနည်းကို ကျင့်ကြည့်ပါ — မိနစ် ၄ ကြာ ရှူ၊ မိနစ် ၇ ကြာ ထိန်းကာ၊ မိနစ် ၈ ကြာ ထုတ်ပါ။ ဒီနည်းသည် parasympathetic nervous system ကို လှုံ့ဆော်ပြီး ချက်ချင်း ငြိမ်သက်မှု ဖြစ်ပေါ်စေသည်။', en: 'Try the 4-7-8 breathing technique: inhale for 4 counts, hold for 7, exhale slowly for 8. This activates the parasympathetic nervous system, triggering an immediate calming response within minutes.' },
      { type: 'img', src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&h=500&fit=crop', caption: 'Mindful breathing is one of the most accessible anxiety tools.' },
      { type: 'quote', mm: 'မင်းရဲ့ အတွေးတွေဟာ မင်းမဟုတ်ဘူး — အဲ့ဒါတွေကို ကြည့်တတ်ရင် ကြောက်ရွံ့မှုတွေ ပျောက်ကုန်မယ်', en: 'You are not your thoughts — you are the observer of your thoughts. This simple shift in perspective is the foundation of most anxiety management strategies.' },
      { type: 'h2', mm: 'ရေရှည် ထိရောက်မှုရှိသော နည်းလမ်းများ', en: 'Long-Term Strategies' },
      { type: 'p', mm: 'ပုံမှန်ကိုယ်လက်လှုပ်ရှားမှု၊ အိပ်ချိန်ပုံမှန်ထိန်းသိမ်းခြင်း၊ caffeine ကန့်သတ်ခြင်း၊ CBT (Cognitive Behavioral Therapy) ကျင့်ဆောင်ခြင်းတို့သည် စိုးရိမ်ပူပန်မှုကို ရေရှည် လျော့ပါးစေနိုင်ကြောင်း သိပ္ပံနည်းကျ သက်သေပြပြီး ဖြစ်သည်။', en: 'Regular physical exercise (even 20 minutes daily), consistent sleep schedules, limiting caffeine and alcohol, and cognitive behavioral therapy (CBT) are all evidence-based approaches proven to reduce anxiety significantly over time.' },
    ],
  },
};

/* fallback for unknown slugs */
const FALLBACK_ARTICLE: Article = {
  slug: 'article',
  titleMm: 'ကျန်းမာရေး အကြောင်းအရာ',
  titleEn: 'Health & Wellness Article',
  category: 'Health',
  categorySlug: 'digestive',
  img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop',
  readMin: 5, views: 800, date: 'June 2026',
  authorName: 'MediHug Editorial',
  authorRole: 'Health Writer · MediHug',
  authorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face',
  tags: ['Health', 'Wellness'],
  blocks: [
    { type: 'p', mm: 'ကျန်းမာရေးသည် ကြွယ်ဝချမ်းသာမှုထက် အဖိုးတန်သောအရာဖြစ်သည်။ ကောင်းမွန်သောကျန်းမာရေးအတွက် မှန်ကန်သောဗဟုသုတများ ရှိထားခြင်းသည် အင်မတန်မှ အရေးကြီးသည်။', en: 'Health is wealth — and staying informed is the first step to a healthier life. Read on to discover evidence-based tips and insights curated by our medical team.' },
  ],
};

/* ── reading progress bar ── */
function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 z-50 bg-gray-100">
      <div
        className="h-full transition-all duration-100"
        style={{ width: `${progress}%`, backgroundColor: PRIMARY }}
      />
    </div>
  );
}

/* ── content block renderer ── */
function ContentBlock({ block, mm }: { block: Block; mm: boolean }) {
  if (block.type === 'h2') return (
    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3 leading-snug">
      {mm ? block.mm : block.en}
    </h2>
  );
  if (block.type === 'h3') return (
    <h3 className="text-base font-bold text-gray-800 mt-6 mb-2">
      {mm ? block.mm : block.en}
    </h3>
  );
  if (block.type === 'quote') return (
    <blockquote
      className="my-6 pl-4 py-1 border-l-4 rounded-r-lg"
      style={{ borderColor: PRIMARY, backgroundColor: `${PRIMARY}08` }}
    >
      <p className="text-sm font-medium text-gray-700 leading-relaxed italic px-2">
        "{mm ? block.mm : block.en}"
      </p>
    </blockquote>
  );
  if (block.type === 'img') return (
    <figure className="my-6">
      <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <Image src={block.src} alt={block.caption ?? ''} fill className="object-cover" />
      </div>
      {block.caption && (
        <figcaption className="text-center text-xs text-gray-400 mt-2">{block.caption}</figcaption>
      )}
    </figure>
  );
  return (
    <p className="text-sm text-gray-600 leading-[1.9] mb-4">
      {mm ? block.mm : block.en}
    </p>
  );
}

/* ── page ── */
export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [liked, setLiked] = useState(false);

  const article = ARTICLES[slug] ?? FALLBACK_ARTICLE;

  return (
    <>
      <ReadingProgress />

      <div className="min-h-screen bg-white">

        {/* ── sticky nav bar ── */}
        <div className="sticky top-0.5 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 h-12 flex items-center justify-between">
            <Link
              href={`/patient/blog/${article.categorySlug}`}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {mm ? article.category : article.category}
            </Link>
            <button
              onClick={() => setLiked(l => !l)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
            >
              <Heart className="w-4 h-4" fill={liked ? '#ef4444' : 'none'} stroke={liked ? '#ef4444' : '#9ca3af'} />
            </button>
          </div>
        </div>

        {/* ── hero image ── */}
        <div className="relative w-full" style={{ aspectRatio: '21/9' }}>
          <Image src={article.img} alt={mm ? article.titleMm : article.titleEn} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        </div>

        {/* ── article body ── */}
        <div className="max-w-3xl mx-auto px-4 pb-28">

          {/* category tag */}
          <div className="flex items-center gap-2 mt-6 mb-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: PRIMARY }}
            >
              {article.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />{article.readMin} {mm ? 'မိနစ်' : 'min read'}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Eye className="w-3 h-3" />{article.views.toLocaleString()}
            </span>
          </div>

          {/* title */}
          <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 leading-tight mb-6">
            {mm ? article.titleMm : article.titleEn}
          </h1>

          {/* author row */}
          <div className="flex items-center gap-3 pb-6 mb-6 border-b border-gray-100">
            <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-gray-100">
              <Image src={article.authorAvatar} alt={article.authorName} width={44} height={44} className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{article.authorName}</p>
              <p className="text-xs text-gray-400">{article.authorRole}</p>
            </div>
            <p className="text-xs text-gray-400 shrink-0">{article.date}</p>
          </div>

          {/* divider */}
          <div className="w-12 h-1 rounded-full mb-6" style={{ backgroundColor: PRIMARY }} />

          {/* content blocks */}
          <div>
            {article.blocks.map((block, i) => (
              <ContentBlock key={i} block={block} mm={mm} />
            ))}
          </div>

          {/* tags */}
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
            {article.tags.map(tag => (
              <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>

          {/* like row */}
          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100">
            <button
              onClick={() => setLiked(l => !l)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all"
              style={liked
                ? { borderColor: '#fca5a5', backgroundColor: '#fff1f2', color: '#ef4444' }
                : { borderColor: '#e5e7eb', color: '#6b7280' }}
            >
              <Heart className="w-4 h-4" fill={liked ? '#ef4444' : 'none'} stroke={liked ? '#ef4444' : 'currentColor'} />
              {liked ? (mm ? 'ကြိုက်ပြီ' : 'Liked') : (mm ? 'ကြိုက်မယ်' : 'Like')}
            </button>
          </div>

          {/* read more */}
          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              {mm ? 'ဆက်ဖတ်ရန်' : 'More in'} {article.category}
            </p>
            <Link
              href={`/patient/blog/${article.categorySlug}`}
              className="flex items-center justify-between px-4 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-semibold text-gray-700">
                {mm ? `${article.category} ဆောင်းပါးများ အားလုံး` : `All ${article.category} Articles`}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
