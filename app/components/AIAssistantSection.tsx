'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Bot, Stethoscope, Building2, ShoppingBag, HeartPulse, Languages } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const FEATURES = [
  {
    icon: Stethoscope,
    en: { title: 'Find the right doctor', desc: 'Ask by specialty, symptom, or name — get real, verified doctors.' },
    mm: { title: 'ဆရာဝန် ရှာဖွေပေးခြင်း', desc: 'ကျွမ်းကျင်မှု၊ ရောဂါလက္ခဏာ (သို့) နာမည်ဖြင့် မေးနိုင်ပါတယ်။' },
  },
  {
    icon: Building2,
    en: { title: 'Partner clinics', desc: 'Discover verified partner clinics near you.' },
    mm: { title: 'ပါတနာ ဆေးခန်း/ဆေးရုံများ', desc: 'အတည်ပြုပြီး ပါတနာ ဆေးခန်းများကို ရှာဖွေပေးပါတယ်။' },
  },
  {
    icon: ShoppingBag,
    en: { title: 'Products & prices', desc: 'Ask about products in our catalog and pricing.' },
    mm: { title: 'ကုန်ပစ္စည်းနှင့် ဈေးနှုန်း', desc: 'ကုန်ပစ္စည်းများနှင့် ဈေးနှုန်းများကို မေးနိုင်ပါတယ်။' },
  },
  {
    icon: HeartPulse,
    en: { title: 'Healthcare programs', desc: 'Learn what wellness and care programs are running.' },
    mm: { title: 'ကျန်းမာရေး အစီအစဉ်များ', desc: 'လက်ရှိ ကျန်းမာရေးအစီအစဉ်များကို ပြောပြပေးပါတယ်။' },
  },
  {
    icon: Languages,
    en: { title: 'Bilingual', desc: 'Ask in Myanmar or English — it replies in the same language.' },
    mm: { title: 'ဘာသာစကား နှစ်မျိုး', desc: 'မြန်မာ (သို့) English ဖြင့် မေးနိုင်ပြီး၊ အလိုအလျောက် အဲဒီဘာသာစကားနဲ့ ပြန်ဖြေပေးပါတယ်။' },
  },
];

const PRIMARY = '#0d2b6e';

export default function AIAssistantSection() {
  const { lang } = useLang();
  const mm = lang === 'mm';

  return (
    <section className="w-full py-12 sm:py-20 px-6" style={{ background: 'linear-gradient(180deg, #f8f7ff 0%, #ffffff 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-14"
        >
          <span
            className="inline-flex items-center gap-2 rounded-full pl-2 pr-3.5 py-1.5 mb-4"
            style={{ background: 'rgba(139,92,246,0.08)' }}
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)' }}
            >
              <Bot className="w-3.5 h-3.5 text-white" />
            </span>
            <span className="text-xs sm:text-sm font-semibold" style={{ color: '#7c3aed' }}>
              {mm ? 'AI လက်ထောက် ပါဝင်ပါတယ်' : 'Powered by AI'}
            </span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            {mm ? 'MediHug AI လက်ထောက်နှင့် မေးနိုင်ပါပြီ' : 'Meet your MediHug AI Assistant'}
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {mm
              ? 'ဆရာဝန်၊ ဆေးခန်း၊ ကုန်ပစ္စည်း (သို့) ကျန်းမာရေးအစီအစဉ်များအကြောင်း စိတ်ချစွာ မေးနိုင်ပါတယ် — အမှန်တကယ် ဒေတာအပေါ် အခြေခံပြီး ဖြေကြားပေးပါတယ်။'
              : 'Ask anything about our doctors, clinics, products, or healthcare programs — grounded in real platform data, not guesses.'}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 mb-10">
          {FEATURES.map((f, i) => {
            const t = mm ? f.mm : f.en;
            return (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5"
              >
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(139,92,246,0.1)' }}
                >
                  <f.icon className="w-4.5 h-4.5" style={{ color: '#7c3aed' }} />
                </span>
                <p className="text-sm font-bold text-gray-800 mb-1 leading-snug">{t.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{t.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <motion.span whileHover={{ scale: 1.045 }} whileTap={{ scale: 0.97 }} className="inline-block">
            <Link
              href="/patient/dashboard"
              className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-full text-sm sm:text-base hover:opacity-90 hover:shadow-lg transition-all"
              style={{ backgroundColor: PRIMARY }}
            >
              <Bot className="w-4 h-4" />
              {mm ? 'AI နှင့် မေးမြန်းကြည့်ပါ' : 'Try the AI Assistant'}
            </Link>
          </motion.span>
        </div>
      </div>
    </section>
  );
}
