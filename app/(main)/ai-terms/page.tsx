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
}

const sections: Section[] = [
  {
    number: '1',
    title_mm: 'AI ဝန်ဆောင်မှု၏ ရည်ရွယ်ချက်',
    title_en: 'Purpose of the AI Service',
    intro_mm: 'MediHug AI Health Assistant သည် အောက်ပါရည်ရွယ်ချက်များအတွက် ကူညီပေးနိုင်ပါသည် —',
    intro_en: 'MediHug AI Health Assistant may assist users with:',
    bullets_mm: [
      'အထွေထွေကျန်းမာရေးအချက်အလက်များ ရှာဖွေခြင်း',
      'MediHug ၏ ကျန်းမာရေးဝန်ဆောင်မှုများကို ရှာဖွေခြင်း',
      'ဆရာဝန်၊ Physiotherapist နှင့် အခြားကျန်းမာရေးပညာရှင်များကို ရှာဖွေခြင်း',
      'ဆေးခန်း၊ ဆေးရုံနှင့် Healthcare Partners များကို ရှာဖွေခြင်း',
      'ကျန်းမာရေးအစီအစဉ်များနှင့် ဝန်ဆောင်မှုများအကြောင်း အချက်အလက်ရယူခြင်း',
      'Appointment သို့မဟုတ် Healthcare Service သို့ လမ်းညွှန်ပေးခြင်း',
    ],
    bullets_en: [
      'General health information',
      'Finding MediHug healthcare services',
      'Finding doctors, physiotherapists, and other healthcare professionals',
      'Finding clinics, hospitals, and healthcare partners',
      'Information about health programs and services',
      'Navigating users to appropriate healthcare services or appointments',
    ],
  },
  {
    number: '2',
    title_mm: 'Medical Decision Making',
    title_en: 'Medical Decision-Making',
    paragraphs_mm: [
      'MediHug AI သည် ဆေးဘက်ဆိုင်ရာ ဆုံးဖြတ်ချက်များကို လူသားများအစား မဆုံးဖြတ်ပါ။',
      'AI မှ ပေးသော အကြံပြုချက်များသည် professional medical advice မဟုတ်ပါ။',
      'သုံးစွဲသူသည် မိမိ၏ ကျန်းမာရေးအခြေအနေအတွက် လိုအပ်ပါက qualified healthcare professional ထံမှ အကြံဉာဏ်ရယူရန် တာဝန်ရှိပါသည်။',
    ],
    paragraphs_en: [
      'MediHug AI does not replace human medical decision-making.',
      'AI responses are not professional medical advice.',
      'Users should consult an appropriately qualified healthcare professional when medical assessment, diagnosis, treatment, or other professional care is required.',
    ],
  },
  {
    number: '3',
    title_mm: 'Accuracy and Limitations',
    title_en: 'Accuracy and Limitations',
    paragraphs_mm: [
      'MediHug သည် AI မှ ပေးသော အချက်အလက်များ၏ တိကျမှု၊ ပြည့်စုံမှု သို့မဟုတ် လက်ရှိဆေးဘက်ဆိုင်ရာအချက်အလက်များနှင့် အမြဲတမ်းကိုက်ညီမှုကို အာမခံမထားပါ။',
      'AI response များသည် သုံးစွဲသူပေးသော information နှင့် အသုံးပြုနေသော AI technology ပေါ်မူတည်၍ ကွဲပြားနိုင်ပါသည်။',
    ],
    paragraphs_en: [
      "MediHug does not guarantee that AI-generated information will always be accurate, complete, current, or appropriate for an individual's specific medical circumstances.",
      'AI responses may vary depending on the information provided by the user and the underlying AI technology.',
    ],
  },
  {
    number: '4',
    title_mm: 'User Responsibility',
    title_en: 'User Responsibility',
    intro_mm: 'သုံးစွဲသူသည် —',
    intro_en: 'Users are responsible for:',
    bullets_mm: [
      'AI ထံသို့ မိမိပေးသော information များကို တတ်နိုင်သမျှ မှန်ကန်စွာပေးရန်',
      'AI response ကို final medical advice အဖြစ် မယူဆရန်',
      'အရေးကြီးသော medical decision များအတွက် healthcare professional နှင့် တိုင်ပင်ရန်',
      'အရေးပေါ်အခြေအနေတွင် AI ကို အားမကိုးရန်',
    ],
    bullets_en: [
      'Providing information as accurately as reasonably possible;',
      'Not treating AI responses as final medical advice;',
      'Consulting an appropriate healthcare professional for important medical decisions; and',
      'Seeking immediate professional medical care in an emergency rather than relying on AI.',
    ],
    outro_mm: 'တာဝန်ရှိပါသည်။',
  },
  {
    number: '5',
    title_mm: 'Prohibited Use',
    title_en: 'Prohibited Use',
    intro_mm: 'MediHug AI ကို —',
    intro_en: 'Users must not use MediHug AI to:',
    bullets_mm: [
      'အခြားသူတစ်ဦး၏ ကိုယ်ရေးကိုယ်တာအချက်အလက်ကို ခွင့်ပြုချက်မရှိဘဲ ရယူရန်',
      'မမှန်ကန်သော သို့မဟုတ် အန္တရာယ်ဖြစ်စေနိုင်သော medical information ဖြန့်ဝေရန်',
      'AI ကို အသုံးပြု၍ အခြားသူများကို ထိခိုက်စေရန်',
      'MediHug system သို့မဟုတ် AI service ကို အလွဲသုံးစားပြုရန်',
    ],
    bullets_en: [
      "Obtain another person's personal information without authorization;",
      'Generate or distribute intentionally misleading or harmful medical information;',
      'Cause harm to another person; or',
      'Abuse, disrupt, or interfere with MediHug systems or AI services.',
    ],
    outro_mm: 'မသုံးရပါ။',
  },
  {
    number: '6',
    title_mm: 'Healthcare Professional Review',
    title_en: 'Healthcare Professional Review',
    paragraphs_mm: [
      'MediHug သည် သင့်လျော်သောအခြေအနေများတွင် သုံးစွဲသူအား qualified healthcare professional နှင့် ဆက်လက်တိုင်ပင်ရန် လမ်းညွှန်နိုင်ပါသည်။',
      'AI နှင့် healthcare professional service များကို သီးခြားဝန်ဆောင်မှုများအဖြစ် နားလည်အသုံးပြုရမည် ဖြစ်ပါသည်။',
    ],
    paragraphs_en: [
      'Where appropriate, MediHug AI may direct users to consult a qualified healthcare professional.',
      'AI assistance and professional healthcare services should be understood and used as separate services.',
    ],
  },
  {
    number: '7',
    title_mm: 'Service Availability',
    title_en: 'Service Availability',
    paragraphs_mm: [
      'AI service သည် technical maintenance၊ system interruption၊ network problem သို့မဟုတ် အခြားအကြောင်းများကြောင့် ယာယီမရရှိနိုင်ခြင်း ဖြစ်နိုင်ပါသည်။',
    ],
    paragraphs_en: [
      'The AI service may temporarily become unavailable due to maintenance, technical issues, network problems, or other circumstances.',
    ],
  },
  {
    number: '8',
    title_mm: 'Changes to AI Service',
    title_en: 'Changes to the AI Service',
    paragraphs_mm: [
      'MediHug သည် AI system ၏ functionality၊ features နှင့် availability များကို လိုအပ်သလို ပြင်ဆင်၊ update သို့မဟုတ် ရပ်ဆိုင်းနိုင်ပါသည်။',
    ],
    paragraphs_en: [
      "MediHug may modify, update, or discontinue the AI system's functionality, features, and availability as necessary.",
    ],
  },
  {
    number: '9',
    title_mm: 'Acceptance',
    title_en: 'Acceptance',
    paragraphs_mm: [
      'AI Health Assistant ကို ဆက်လက်အသုံးပြုခြင်းဖြင့် သင်သည် ဤ AI Terms of Use နှင့် AI Medical Disclaimer ကို ဖတ်ရှုပြီး နားလည်သဘောတူကြောင်း အတည်ပြုပါသည်။',
    ],
    paragraphs_en: [
      'By continuing to use the AI Health Assistant, you acknowledge that you have read, understood, and agreed to this AI Terms of Use and AI Medical Disclaimer.',
    ],
  },
];

export default function AiTermsPage() {
  const { lang } = useLang();
  const mm = lang === 'mm';

  return (
    <main className="min-h-screen bg-white">

      {/* Banner */}
      <div
        className="w-full pt-20 relative overflow-hidden"
        style={{
          backgroundColor: '#0d2b6e',
          backgroundImage: 'url(https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=2346&auto=format&fit=crop)',
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
            {mm ? 'AI အသုံးပြုမှု စည်းကမ်းချက်များ' : 'AI Terms of Use'}
          </h1>
          <p className="text-white/70 text-sm sm:text-base max-w-2xl leading-relaxed">
            {mm
              ? 'MediHug AI Health Assistant ကို အသုံးပြုခြင်းဖြင့် သင်သည် အောက်ပါ စည်းကမ်းချက်များကို ဖတ်ရှုပြီး နားလည်သဘောတူကြောင်း အတည်ပြုပါသည်။'
              : 'By using the MediHug AI Health Assistant, you acknowledge that you have read, understood, and agreed to these AI Terms of Use.'}
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
            const intro  = mm ? section.intro_mm  : (section.intro_en  ?? section.intro_mm);
            const outro  = mm ? section.outro_mm  : (section.outro_en  ?? section.outro_mm);
            const paras  = mm ? section.paragraphs_mm : section.paragraphs_en;
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
