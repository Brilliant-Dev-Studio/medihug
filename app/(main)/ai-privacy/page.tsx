'use client';

import { useLang } from '../../lib/LanguageContext';

const PRIMARY = '#0d2b6e';

interface Section {
  number: string;
  title_mm: string;
  title_en: string;
  intro_mm?: string;
  intro_en?: string;
  paragraphs_mm?: string[];
  paragraphs_en?: string[];
  bullets_mm?: string[];
  bullets_en?: string[];
  outro_mm?: string;
  outro_en?: string;
  contact?: { label_mm: string; label_en: string; value: string }[];
}

const sections: Section[] = [
  {
    number: '1',
    title_mm: 'စုဆောင်းနိုင်သော အချက်အလက်များ',
    title_en: 'Information That May Be Provided',
    intro_mm: 'AI service အသုံးပြုရာတွင် လိုအပ်သလို အောက်ပါ information များကို သုံးစွဲသူက ပေးနိုင်ပါသည် —',
    intro_en: 'Depending on the features used, users may provide:',
    bullets_mm: [
      'AI chat တွင် ရိုက်ထည့်သော မေးခွန်းများနှင့် အကြောင်းအရာများ',
      'ကျန်းမာရေးနှင့်ပတ်သက်သော သုံးစွဲသူက မိမိဆန္ဒဖြင့် ပေးသော information များ',
      'Symptoms နှင့် health concerns',
      'Appointment နှင့် healthcare service information',
      'Upload ပြုလုပ်သော medical documents/images များ၊ အဆိုပါ feature ကို အသုံးပြုပါက',
      'Account နှင့် contact information များ၊ ဝန်ဆောင်မှုအတွက် လိုအပ်ပါက',
    ],
    bullets_en: [
      'Questions and content submitted through AI conversations;',
      'Health information voluntarily provided by the user;',
      'Symptoms and health concerns;',
      'Appointment and healthcare service information;',
      'Medical documents or images, where such features are available;',
      'Account and contact information where required for the service.',
    ],
  },
  {
    number: '2',
    title_mm: 'Data အသုံးပြုရသည့် ရည်ရွယ်ချက်',
    title_en: 'Purposes of Processing',
    intro_mm: 'စုဆောင်းထားသော information များကို လိုအပ်သည့်အတိုင်း —',
    intro_en: 'Information may be processed as reasonably necessary to:',
    bullets_mm: [
      'AI response ပေးရန်',
      'သက်ဆိုင်ရာ healthcare service များသို့ လမ်းညွှန်ရန်',
      'Doctor / clinic / healthcare professional ရှာဖွေရန်',
      'Appointment နှင့် service delivery အတွက်',
      'User support နှင့် service operation အတွက်',
      'Security နှင့် fraud prevention အတွက်',
      'သက်ဆိုင်ရာဥပဒေ၊ စည်းမျဉ်း သို့မဟုတ် တရားဝင်တောင်းဆိုချက်များကို လိုက်နာရန်',
    ],
    bullets_en: [
      'Provide AI responses;',
      'Direct users to appropriate healthcare services;',
      'Help users find doctors, clinics, and healthcare professionals;',
      'Facilitate appointments and service delivery;',
      'Provide user support and operate the service;',
      'Maintain security and prevent misuse or fraud; and',
      'Comply with applicable legal or regulatory requirements.',
    ],
    outro_mm: 'အသုံးပြုနိုင်ပါသည်။',
  },
  {
    number: '3',
    title_mm: 'Medical Information',
    title_en: 'Medical Information',
    paragraphs_mm: [
      'သုံးစွဲသူသည် AI Chat ထဲသို့ မိမိ၏ medical history၊ symptoms၊ medication၊ laboratory results သို့မဟုတ် အခြားကျန်းမာရေးဆိုင်ရာ အချက်အလက်များကို ထည့်သွင်းနိုင်ပါသည်။',
      'ထိုကဲ့သို့သော information များကို မလိုအပ်ဘဲ မထည့်သွင်းရန်နှင့် အခြားသူများ၏ medical information ကို ခွင့်ပြုချက်မရှိဘဲ မထည့်သွင်းရန် အကြံပြုပါသည်။',
    ],
    paragraphs_en: [
      'Users may voluntarily provide medical history, symptoms, medications, laboratory results, or other health-related information through the AI service.',
      "Users are encouraged not to provide unnecessary sensitive information and must not submit another person's medical information without appropriate authorization.",
    ],
  },
  {
    number: '4',
    title_mm: 'Third-Party AI Technology',
    title_en: 'Third-Party AI Technology',
    paragraphs_mm: [
      'အရေးကြီး: MediHug သည် AI service အတွက် third-party AI technology/provider ကို အသုံးပြုပါက ထို provider နှင့် သက်ဆိုင်သော data processing arrangements၊ privacy practices နှင့် data retention policies များကို အသုံးမပြုမီ သုံးစွဲသူအား သင့်လျော်စွာ အသိပေးမည် ဖြစ်ပါသည်။',
      '[AI Provider Name] ကို အသုံးပြုပါက သက်ဆိုင်ရာ provider ၏ Privacy Policy နှင့် Data Processing Terms များကိုလည်း ဖော်ပြပေးမည် ဖြစ်ပါသည်။',
    ],
    paragraphs_en: [
      "Important: If MediHug uses a third-party AI technology or provider for the AI service, users will be appropriately informed of the relevant data processing arrangements, privacy practices, and data retention policies of that provider before use.",
      "If [AI Provider Name] is used, the relevant provider's Privacy Policy and Data Processing Terms will also be made available.",
    ],
  },
  {
    number: '5',
    title_mm: 'Access to Medical Information',
    title_en: 'Access to Medical Information',
    paragraphs_mm: [
      'Medical information များကို MediHug ၏ authorized personnel သို့မဟုတ် သက်ဆိုင်ရာ healthcare professional များက ဝန်ဆောင်မှုပေးရန် လိုအပ်သည့်အတိုင်းသာ access ပြုလုပ်နိုင်ရန် ရည်ရွယ်ထားပါသည်။',
      'သို့သော် မည်သည့် digital system မဆို absolute security ကို အာမခံနိုင်ခြင်းမရှိပါ။',
    ],
    paragraphs_en: [
      "Medical information is intended to be accessed only by MediHug's authorized personnel or relevant healthcare professionals as necessary to provide the service.",
      'However, no digital system can guarantee absolute security.',
    ],
  },
  {
    number: '6',
    title_mm: 'Data Security',
    title_en: 'Data Security',
    paragraphs_mm: [
      'MediHug သည် သုံးစွဲသူ၏ information များကို unauthorized access၊ loss၊ misuse သို့မဟုတ် disclosure မှ ကာကွယ်ရန် သင့်လျော်သော technical နှင့် organizational security measures များ အသုံးပြုရန် ရည်ရွယ်ပါသည်။',
    ],
    paragraphs_en: [
      'MediHug intends to use appropriate technical and organizational security measures to protect user information from unauthorized access, loss, misuse, or disclosure.',
    ],
  },
  {
    number: '7',
    title_mm: 'Data Retention',
    title_en: 'Data Retention',
    paragraphs_mm: [
      'Information များကို သက်ဆိုင်ရာ service အတွက် လိုအပ်သည့်ကာလ၊ legal/regulatory requirements နှင့် MediHug ၏ applicable retention policy အတိုင်း ထိန်းသိမ်းနိုင်ပါသည်။',
    ],
    paragraphs_en: [
      "Information may be retained for as long as necessary for the relevant service, in accordance with legal/regulatory requirements and MediHug's applicable retention policy.",
    ],
  },
  {
    number: '8',
    title_mm: 'User Consent',
    title_en: 'User Consent',
    paragraphs_mm: [
      'AI Health Assistant ကို အသုံးပြုခြင်းမပြုမီ သုံးစွဲသူသည် ဤ Privacy and Consent Notice ကို ဖတ်ရှုနားလည်ပြီး မိမိဆန္ဒအလျောက် information များကို AI service သို့ ပေးပို့အသုံးပြုရန် သဘောတူနိုင်ပါသည်။',
    ],
    paragraphs_en: [
      'Before using the AI Health Assistant, users may read and understand this Privacy and Consent Notice and voluntarily agree to submit information to the AI service.',
    ],
  },
  {
    number: '9',
    title_mm: 'Consent Withdrawal / Data Requests',
    title_en: 'Consent Withdrawal / Data Requests',
    paragraphs_mm: [
      'သက်ဆိုင်ရာဥပဒေနှင့် MediHug ၏ applicable policies အရ သုံးစွဲသူသည် မိမိ၏ data နှင့်ပတ်သက်၍ access၊ correction၊ deletion သို့မဟုတ် consent withdrawal ကဲ့သို့သော တောင်းဆိုချက်များ ပြုလုပ်နိုင်ပါသည်။',
    ],
    paragraphs_en: [
      'In accordance with applicable law and applicable MediHug policies, users may make requests regarding their data, such as access, correction, deletion, or withdrawal of consent.',
    ],
    contact: [
      { label_mm: 'တောင်းဆိုရန် — Email', label_en: 'To make a request — Email', value: 'privacy@medihug.com.mm' },
      { label_mm: 'Phone', label_en: 'Phone', value: '[Phone Number]' },
    ],
  },
  {
    number: '10',
    title_mm: 'Privacy Policy',
    title_en: 'Privacy Policy',
    paragraphs_mm: [
      'ဤ AI & Medical Data Privacy Notice သည် MediHug ၏ အထွေထွေ Privacy Policy နှင့်အတူ ဖတ်ရှုအသုံးပြုရမည် ဖြစ်ပါသည်။',
    ],
    paragraphs_en: [
      "This AI & Medical Data Privacy Notice should be read together with MediHug's general Privacy Policy.",
    ],
    contact: [
      { label_mm: 'Privacy Policy', label_en: 'Privacy Policy', value: '/privacy' },
    ],
  },
];

export default function AiPrivacyPage() {
  const { lang } = useLang();
  const mm = lang === 'mm';

  return (
    <main className="min-h-screen bg-white">

      {/* Banner */}
      <div
        className="w-full pt-20 relative overflow-hidden"
        style={{
          backgroundColor: '#0d2b6e',
          backgroundImage: 'url(https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2346&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#0d2b6e]/85" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-3">
            {mm ? 'တရားဝင် စာရွက်စာတမ်း' : 'Legal Document'}
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            {mm ? 'AI နှင့် ဆေးဘက်ဆိုင်ရာ ဒေတာ ကိုယ်ရေးကိုယ်တာနှင့် သဘောတူညီချက်' : 'AI & Medical Data Privacy and Consent'}
          </h1>
          <p className="text-white/70 text-sm sm:text-base max-w-2xl leading-relaxed">
            {mm
              ? 'MediHug AI Health Assistant အသုံးပြုရာတွင် သုံးစွဲသူက ထည့်သွင်းပေးသော ကျန်းမာရေးဆိုင်ရာ အချက်အလက်များသည် အရေးကြီးပြီး ကိုယ်ရေးကိုယ်တာဆိုင်ရာ အချက်အလက်များ ဖြစ်နိုင်သောကြောင့် သင့်လျော်သော လုံခြုံရေးနှင့် privacy measures များဖြင့် စီမံဆောင်ရွက်ရန် ရည်ရွယ်ပါသည်။'
              : 'MediHug recognizes that information voluntarily provided through the AI Health Assistant may include sensitive health-related or personal information. MediHug intends to process such information using appropriate privacy and security measures.'}
          </p>
          <div className="flex items-center gap-3 mt-6">
            <span className="w-8 h-px bg-white/30" />
            <p className="text-white/30 text-xs">
              {mm ? 'အကျိုးသက်ရောက်သည့်ရက် — [DD/MM/YYYY]' : 'Effective Date — [DD/MM/YYYY]'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col gap-6 sm:gap-8">
          {sections.map(section => {
            const intro   = mm ? section.intro_mm  : (section.intro_en  ?? section.intro_mm);
            const outro   = mm ? section.outro_mm  : (section.outro_en  ?? section.outro_mm);
            const paras   = mm ? section.paragraphs_mm : section.paragraphs_en;
            const bullets = mm ? section.bullets_mm : section.bullets_en;
            return (
              <div key={section.number} className="flex gap-3 sm:gap-5">
                <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5" style={{ backgroundColor: PRIMARY }}>
                  {section.number}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm sm:text-lg font-bold mb-3 pb-2 border-b border-gray-100 leading-snug" style={{ color: PRIMARY }}>
                    {mm ? section.title_mm : section.title_en}
                  </h2>
                  <div className="flex flex-col gap-2.5">
                    {intro && <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{intro}</p>}
                    {paras?.map((p, i) => (
                      <p key={i} className="text-xs sm:text-sm text-gray-500 leading-relaxed">{p}</p>
                    ))}
                    {bullets && (
                      <ul className="flex flex-col gap-1.5 pl-1">
                        {bullets.map((b, i) => (
                          <li key={i} className="text-xs sm:text-sm text-gray-500 leading-relaxed flex gap-2">
                            <span className="shrink-0" style={{ color: PRIMARY }}>—</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {outro && <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{outro}</p>}
                    {section.contact && (
                      <div className="flex flex-col gap-1 mt-1 pl-3 border-l-2 border-gray-100">
                        {section.contact.map((c, i) => (
                          <p key={i} className="text-xs sm:text-sm text-gray-500">
                            <span className="font-semibold text-gray-700">{mm ? c.label_mm : c.label_en}:</span>{' '}
                            {c.value.startsWith('/') ? (
                              <a href={c.value} className="underline" style={{ color: PRIMARY }}>{mm ? 'ဤနေရာတွင်' : 'here'}</a>
                            ) : c.value.includes('@') ? (
                              <a href={`mailto:${c.value}`} className="underline" style={{ color: PRIMARY }}>{c.value}</a>
                            ) : (
                              <span>{c.value}</span>
                            )}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            {mm ? 'နောက်ဆုံးပြင်ဆင်သည့်ရက် — [DD/MM/YYYY]' : 'Last Updated — [DD/MM/YYYY]'}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {mm
              ? 'မေးမြန်းလိုပါက support@medihug.com သို့ ဆက်သွယ်ပါ။'
              : 'For enquiries, contact support@medihug.com'}
          </p>
        </div>
      </div>

    </main>
  );
}
