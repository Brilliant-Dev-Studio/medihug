'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Bot, Stethoscope, Building2, ShoppingBag, HeartPulse, Languages, AlertTriangle, ChevronDown } from 'lucide-react';
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
  const [expanded, setExpanded] = useState(false);

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

        <div className="flex flex-col items-center gap-3">
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
          <div className="flex items-center gap-3">
            <Link href="/ai-terms" className="text-xs text-gray-400 underline hover:text-gray-600 transition-colors">
              {mm ? 'AI အသုံးပြုမှု စည်းကမ်းချက်များ' : 'AI Terms of Use'}
            </Link>
            <span className="text-gray-300 text-xs">·</span>
            <Link href="/ai-privacy" className="text-xs text-gray-400 underline hover:text-gray-600 transition-colors">
              {mm ? 'AI ကိုယ်ရေးကိုယ်တာနှင့် သဘောတူညီချက်' : 'AI Privacy & Consent'}
            </Link>
          </div>
        </div>

        <div className="mt-6 max-w-2xl mx-auto rounded-xl border" style={{ borderColor: '#fde68a', backgroundColor: '#fffbeb' }}>
          <button
            type="button"
            onClick={() => setExpanded(e => !e)}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left"
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#d97706' }} />
            <p className="flex-1 text-[11px] sm:text-xs font-semibold" style={{ color: '#92400e' }}>
              {mm ? 'AI Health Assistant သတိပြုရန် — ဆရာဝန်၏ ရောဂါရှာဖွေချက်ကို အစားထိုးခြင်းမပြုပါ' : "AI Health Assistant Notice — doesn't replace a doctor's diagnosis"}
            </p>
            <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} style={{ color: '#d97706' }} />
          </button>
          {expanded && (
            <div className="flex flex-col gap-1.5 text-[11px] sm:text-xs leading-relaxed px-4 pb-4" style={{ color: '#92400e' }}>
              <p>
                {mm
                  ? 'MediHug AI Health Assistant သည် ကျန်းမာရေးဆိုင်ရာ အထွေထွေအချက်အလက်များ၊ MediHug ၏ ဝန်ဆောင်မှုများ၊ ဆရာဝန်များနှင့် ကျန်းမာရေးအစီအစဉ်များကို ရှာဖွေရာတွင် ကူညီပေးရန် ရည်ရွယ်ထားသော AI အကူအညီပေးစနစ်တစ်ခုသာ ဖြစ်ပါသည်။'
                  : "MediHug AI Health Assistant is an AI-based tool intended to help you find general health information, MediHug's services, doctors, and health programs."}
              </p>
              <p>
                {mm
                  ? 'AI မှပေးသော အချက်အလက်များသည် ဆရာဝန်၏ ရောဂါရှာဖွေခြင်း (Diagnosis)၊ ကုသမှုညွှန်ကြားချက် (Treatment) သို့မဟုတ် ဆေးညွှန်း (Prescription) ကို အစားထိုးခြင်းမပြုပါ။'
                  : "Information provided by the AI does not replace a doctor's diagnosis, treatment instructions, or prescription."}
              </p>
              <p>
                {mm
                  ? 'AI မှပေးသော အချက်အလက်များတွင် မှားယွင်းမှု သို့မဟုတ် မပြည့်စုံမှုများ ပါဝင်နိုင်ပါသည်။ ကျန်းမာရေးနှင့်ပတ်သက်သော အရေးကြီးသော ဆုံးဖြတ်ချက်များကို AI တစ်ခုတည်းအပေါ် မူတည်၍ မပြုလုပ်ဘဲ အရည်အချင်းပြည့်မီသော ကျန်းမာရေးပညာရှင်နှင့် တိုင်ပင်ပါ။'
                  : 'Information from the AI may be inaccurate or incomplete. Please consult a qualified healthcare professional before making important health decisions, rather than relying on AI alone.'}
              </p>
              <p>
                {mm
                  ? 'အရေးပေါ်အခြေအနေများတွင် AI Chat ကို အသုံးပြု၍ အကူအညီစောင့်ဆိုင်းခြင်းမပြုဘဲ အနီးဆုံး အရေးပေါ်ဆေးကုသမှုဌာနသို့ ချက်ချင်းသွားရောက်ပါ။'
                  : 'In an emergency, do not wait for help from AI Chat — go immediately to the nearest emergency medical facility.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
