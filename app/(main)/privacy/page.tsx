'use client';

import { useLang } from '../../lib/LanguageContext';

const sections = [
  {
    number: '1',
    title_en: 'Nature of Service & Medical Disclaimer',
    title_mm: 'ဝန်ဆောင်မှု သဘောသဘာဝ နှင့် ဆေးပညာဆိုင်ရာ အာမခံချက်',
    items: [
      {
        label_en: 'MediHug is a Facilitator',
        label_mm: 'MediHug သည် ညှိနှိုင်းပေးသော Platform တစ်ခုဖြစ်သည်',
        text_en: 'MediHug is an online platform that coordinates and schedules telehealth consultations. We do not practice medicine, provide diagnosis, or deliver clinical advice directly.',
        text_mm: 'MediHug သည် Telehealth တိုင်ပင်ဆွေးနွေးမှုများကို ညှိနှိုင်းပြီး ချိန်းဆိုပေးသော Online Platform တစ်ခုဖြစ်သည်။ ကျွန်ုပ်တို့သည် ဆေးကုသမှု မပြုလုပ်ဘဲ၊ ရောဂါ မစစ်ဆေးဘဲ၊ ဆေးပညာဆိုင်ရာ အကြံဉာဏ်များကိုလည်း တိုက်ရိုက် မပေးပါ။',
      },
      {
        label_en: 'Not for Emergencies',
        label_mm: 'အရေးပေါ် အခြေအနေများအတွက် မဟုတ်ပါ',
        text_en: 'MediHug is strictly for non-emergency medical consultations. If you are experiencing a life-threatening medical emergency, you must immediately visit the nearest physical hospital or contact emergency services.',
        text_mm: 'MediHug သည် အရေးမပေါ်သော ဆေးပညာဆိုင်ရာ တိုင်ပင်ဆွေးနွေးမှုများအတွက်သာ ဖြစ်သည်။ အသက်အန္တရာယ်ရှိသော အရေးပေါ် ဆေးဘက်ဆိုင်ရာ အခြေအနေ ကြုံတွေ့ပါက အနီးနားဆုံး ဆေးရုံသို့ ချက်ချင်းသွားရောက်ပြီး အရေးပေါ် ဝန်ဆောင်မှုများကို ဆက်သွယ်ရမည်။',
      },
      {
        label_en: 'Doctor–Patient Relationship',
        label_mm: 'ဆရာဝန် – လူနာ ဆက်ဆံရေး',
        text_en: 'The medical advice given during a video consultation is solely the responsibility of the consulting Doctor. MediHug does not assume liability for the quality, accuracy, or outcomes of treatments or diagnoses.',
        text_mm: 'ဗီဒီယိုတိုင်ပင်ဆွေးနွေးမှုအတွင်း ပေးသော ဆေးပညာဆိုင်ရာ အကြံဉာဏ်သည် တိုင်ပင်ဆွေးနွေးသော ဆရာဝန်၏ တာဝန်သာ ဖြစ်သည်။ MediHug သည် ကုသမှု သို့မဟုတ် ရောဂါစစ်ဆေးမှု၏ အရည်အသွေး၊ တိကျမှုနှင့် ရလဒ်များအတွက် တာဝန်မယူပါ။',
      },
    ],
  },
  {
    number: '2',
    title_en: 'Appointment Booking & Payment Policy',
    title_mm: 'ချိန်းဆိုမှု Booking နှင့် ငွေပေးချေမှု မူဝါဒ',
    items: [
      {
        label_en: '40% Booking Deposit',
        label_mm: '၄၀% Booking အပ်ငွေ',
        text_en: 'To secure an appointment with a Doctor, Patients are required to pay a non-refundable 40% Commission/Deposit Fee via integrated mobile financial services (e.g., KPay, WavePay).',
        text_mm: 'ဆရာဝန်နှင့် ချိန်းဆိုမှုကို သေချာစေရန် လူနာများသည် ပြန်မအမ်းနိုင်သော ၄၀% Commission/Deposit ကြေးကို ပေါင်းစပ်ထားသော Mobile Financial Services (ဥပမာ — KPay, WavePay) မှတဆင့် ပေးချေရမည်။',
      },
      {
        label_en: 'Super Admin Payment Verification',
        label_mm: 'Super Admin ငွေပေးချေမှု အတည်ပြုခြင်း',
        text_en: 'All bookings remain in a "Pending Payment Verification" state until the Super Admin team verifies the authenticity of the uploaded payment transaction slip. If the payment slip is found to be fraudulent or unverified, the appointment request will be rejected.',
        text_mm: 'Booking များအားလုံးသည် Super Admin အဖွဲ့မှ တင်လွှာထားသော ငွေပေးချေမှု ငွေချေလက်မှတ်ကို အတည်ပြုသည်အထိ "ငွေပေးချေမှု အတည်ပြုဆဲ" အခြေအနေတွင် ရှိနေမည်။ ငွေချေလက်မှတ် မှားယွင်းသည် သို့မဟုတ် အတည်မပြုနိုင်ပါက ချိန်းဆိုမှုကို ငြင်းပယ်မည်။',
      },
      {
        label_en: 'Doctor Approval Lifecycle',
        label_mm: 'ဆရာဝန် အတည်ပြုမှု လုပ်ငန်းစဉ်',
        text_en: 'Once payment is approved by the Super Admin, the appointment request is sent to the designated Doctor ("Waiting for Doctor Approval"). The schedule is finalized only when the Doctor clicks "Accept" or "Confirm" ("Appointment Confirmed").',
        text_mm: 'Super Admin မှ ငွေပေးချေမှုကို အတည်ပြုပြီးနောက် ချိန်းဆိုမှုတောင်းဆိုချက်ကို သတ်မှတ်ထားသော ဆရာဝန်ထံ ပေးပို့မည် ("ဆရာဝန်အတည်ပြုမှု စောင့်ဆိုင်းဆဲ")။ ဆရာဝန်မှ "လက်ခံ" သို့မဟုတ် "အတည်ပြု" နှိပ်မှသာ ချိန်းဆိုမှု အတည်ဖြစ်မည် ("ချိန်းဆိုမှု အတည်ပြုပြီး")။',
      },
    ],
  },
  {
    number: '3',
    title_en: 'Live Video Consultations & Multi-Tasking Workspace',
    title_mm: 'တိုက်ရိုက် ဗီဒီယို တိုင်ပင်ဆွေးနွေးမှုနှင့် Multi-Tasking Workspace',
    items: [
      {
        label_en: 'Video Call Access',
        label_mm: 'ဗီဒီယိုခေါ်ဆိုမှု ဝင်ရောက်ခွင့်',
        text_en: 'The "Join Video Call" link within the Patient Dashboard will only become active and clickable five (5) minutes prior to the officially confirmed appointment time slot.',
        text_mm: 'Patient Dashboard ထဲရှိ "ဗီဒီယိုကော်ဖြင့်ချိတ်ဆက်ရန်" လင့်ခ်သည် တရားဝင် အတည်ပြုထားသော ချိန်းဆိုချိန်မတိုင်မှီ ၅ မိနစ်အလိုမှသာ အသက်ဝင်ပြီး နှိပ်၍ ရမည်။',
      },
      {
        label_en: 'Workspace Multi-Tasking',
        label_mm: 'Workspace Multi-Tasking',
        text_en: 'During an active session, Doctors utilize an integrated Multi-tasking Workspace allowing them to simultaneously review your live video feed, examine uploaded medical records/X-Ray charts, and compose digital e-prescriptions.',
        text_mm: 'တက်ကြွသော Session အတွင်း ဆရာဝန်များသည် ပေါင်းစပ်ထားသော Multi-tasking Workspace ကို အသုံးပြုပြီး တိုက်ရိုက် ဗီဒီယို၊ တင်လွှာထားသော ဆေးဘက်ဆိုင်ရာ မှတ်တမ်းများ/X-Ray ဇယားများနှင့် ဒစ်ဂျစ်တယ် e-Prescription ရေးဆွဲမှုများကို တပြိုင်နက် ကိုင်တွယ်နိုင်သည်။',
      },
      {
        label_en: 'Technical Connectivity',
        label_mm: 'နည်းပညာဆိုင်ရာ ချိတ်ဆက်မှု',
        text_en: 'Users are solely responsible for ensuring a stable internet connection, functional camera, and working microphone before joining a call. MediHug is not liable for dropped calls due to local infrastructure failures.',
        text_mm: 'ကော်ဖြင့်မချိတ်ဆက်မှီ တည်ငြိမ်သော Internet ချိတ်ဆက်မှု၊ ကင်မရာနှင့် မိုက်ခရိုဖုန်း ကောင်းမွန်မှုကို သေချာစေရန် အသုံးပြုသူများသာ တာဝန်ရှိသည်။ ဒေသဆိုင်ရာ အခြေခံ အဆောက်အဦ ချွတ်ယွင်းမှုကြောင့် ဖုန်းကျပြတ်ပါက MediHug မှ တာဝန်မယူပါ။',
      },
    ],
  },
  {
    number: '4',
    title_en: 'Medical History & Secure Referral Data Privacy',
    title_mm: 'ဆေးဘက်ဆိုင်ရာ မှတ်တမ်းနှင့် လုံခြုံသော Referral ဒေတာ ကိုယ်ရေးကိုယ်တာ',
    items: [
      {
        label_en: 'Data Encryption',
        label_mm: 'ဒေတာ Encryption',
        text_en: 'Patient medical histories and digital e-prescriptions are securely stored and encrypted under absolute privacy standards.',
        text_mm: 'လူနာ၏ ဆေးဘက်ဆိုင်ရာ မှတ်တမ်းများနှင့် ဒစ်ဂျစ်တယ် e-Prescription များကို လျှို့ဝှက်ချက် မူဝါဒအပြည့်ဖြင့် လုံခြုံစွာ သိမ်းဆည်းပြီး Encrypt လုပ်ထားသည်။',
      },
      {
        label_en: 'The Restricted Access Rule',
        label_mm: 'ဝင်ရောက်ခွင့် ကန့်သတ်ချက် စည်းမျဉ်း',
        text_en: 'Your full medical records and e-prescriptions are strictly Locked and Restricted from external third parties. They will only become unlocked and readable to an external Partner Clinic or Freelancer after you explicitly present your Secure Referral QR Code or share your dynamic 6-Digit OTP code for them to scan and verify.',
        text_mm: 'သင်၏ ဆေးဘက်ဆိုင်ရာ မှတ်တမ်းနှင့် e-Prescription အပြည့်သည် ပြင်ပ တတိယပုဂ္ဂိုလ်များကို တင်းကြပ်စွာ Lock နှင့် ကန့်သတ်ထားသည်။ သင်မှ လုံခြုံသော Referral QR Code ကို ပြသသည် သို့မဟုတ် Dynamic 6-Digit OTP Code ကို မိတ်ဖက်ဆေးခန်း/Freelancer ထံ မျှဝေပြီး Scan ကာ အတည်ပြုမှသာ ဖတ်ရှုခွင့် ရမည်။',
      },
      {
        label_en: 'User Consent',
        label_mm: 'အသုံးပြုသူ သဘောတူညီချက်',
        text_en: 'By presenting your QR Code or OTP to a Partner Clinic, you grant explicit consent for that entity to read and download your structured medical transfer logs.',
        text_mm: 'မိတ်ဖက်ဆေးခန်းထံ QR Code သို့မဟုတ် OTP ကို ပြသပေးခြင်းဖြင့် ထိုအဖွဲ့အစည်းသည် သင်၏ ဆေးဘက်ဆိုင်ရာ လွှဲပြောင်းမှတ်တမ်းများကို ဖတ်ရှုပြီး Download ရယူရန် သင်မှ ရှင်းလင်းစွာ သဘောတူညီချက် ပေးသည်ဟု ယူဆသည်။',
      },
    ],
  },
  {
    number: '5',
    title_en: 'Health Shop & Order Fulfillment',
    title_mm: 'ကျန်းမာရေး ဆိုင် နှင့် အော်ဒါ ဆောင်ရွက်ပေးမှု',
    items: [
      {
        label_en: 'Viber/Messenger Routing',
        label_mm: 'Viber/Messenger ဆောင်ရွက်မှု',
        text_en: "MediHug's Health Shop and Customer Support desks may automatically route ordering summaries directly to our automated Viber or Facebook Messenger Fulfillment Desk.",
        text_mm: 'MediHug ၏ Health Shop နှင့် Customer Support ဆောင်ရွက်မှုများသည် အော်ဒါ အကျဉ်းချုပ်များကို ကျွန်ုပ်တို့၏ အလိုအလျောက် Viber သို့မဟုတ် Facebook Messenger Fulfillment Desk သို့ တိုက်ရိုက် ညွှန်ကြားနိုင်သည်။',
      },
      {
        label_en: 'Prescription-Only Items',
        label_mm: 'ဆေးစာဖြင့်သာ မှာယူနိုင်သော ပစ္စည်းများ',
        text_en: 'Ordering certain restricted wellness items or medications requires a valid digital e-prescription issued by a certified Doctor on the MediHug platform.',
        text_mm: 'ကန့်သတ်ထားသော ကျန်းမာရေး ပစ္စည်းများ သို့မဟုတ် ဆေးဝါးများ မှာယူရန် MediHug Platform ပေါ်ရှိ လက်မှတ်ရ ဆရာဝန်ထုတ်ပေးသော တရားဝင် ဒစ်ဂျစ်တယ် e-Prescription လိုအပ်သည်။',
      },
    ],
  },
  {
    number: '6',
    title_en: 'Account Security & Responsibility',
    title_mm: 'အကောင့် လုံခြုံရေးနှင့် တာဝန်ဝတ္တရား',
    items: [
      {
        label_en: 'Account Confidentiality',
        label_mm: 'အကောင့် လျှို့ဝှက်ချက်',
        text_en: 'You are entirely responsible for maintaining the confidentiality of your account credentials and login information on your hardware devices (macOS, iOS, Android, etc.).',
        text_mm: 'သင်၏ Hardware ကိရိယာများ (macOS, iOS, Android) ပေါ်ရှိ အကောင့် Credential နှင့် Login အချက်အလက်များ၏ လျှို့ဝှက်ချက်ကို ထိန်းသိမ်းရန် သင်တစ်ဦးတည်း တာဝန်ရှိသည်။',
      },
      {
        label_en: 'Accurate Information',
        label_mm: 'မှန်ကန်သော အချက်အလက်',
        text_en: 'You agree to provide true, accurate, current, and complete information during registration and booking processes.',
        text_mm: 'စာရင်းသွင်းမှုနှင့် Booking လုပ်ငန်းစဉ်များအတွင်း မှန်ကန်၊ တိကျ၊ နောက်ဆုံးရ နှင့် ပြည့်စုံသော အချက်အလက်များ ပေးရန် သင်သဘောတူသည်။',
      },
    ],
  },
  {
    number: '7',
    title_en: 'Limitation of Liability & Governing Law',
    title_mm: 'တာဝန်ခံမှု ကန့်သတ်ချက်နှင့် ကျင့်သုံးသည့် ဥပဒေ',
    items: [
      {
        label_en: 'Limitation of Liability',
        label_mm: 'တာဝန်ခံမှု ကန့်သတ်ချက်',
        text_en: 'To the maximum extent permitted by applicable law, MediHug, its founders, and affiliates shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or the inability to use the platform.',
        text_mm: 'သက်ဆိုင်ရာ ဥပဒေ ခွင့်ပြုသည့် အများဆုံးအတိုင်းအတာအထိ MediHug၊ ၎င်း၏ တည်ထောင်သူများနှင့် ဆက်စပ်အဖွဲ့အစည်းများသည် Platform ကို အသုံးပြုမှု သို့မဟုတ် အသုံးပြုနိုင်မှုကြောင့် ဖြစ်ပေါ်သည့် သွယ်ဝိုက်သော၊ မတော်တဆ၊ အထူး သို့မဟုတ် နောက်ဆက်တွဲ ထိခိုက်ဆုံးရှုံးမှုများအတွက် တာဝန်မခံပါ။',
      },
      {
        label_en: 'Governing Law',
        label_mm: 'ကျင့်သုံးသည့် ဥပဒေ',
        text_en: 'These Terms and Conditions shall be governed by, interpreted, and enforced in accordance with the laws of the Republic of the Union of Myanmar.',
        text_mm: 'ဤ စည်းမျဉ်းစည်းကမ်းများနှင့် သတ်မှတ်ချက်များသည် ပြည်ထောင်စု သမ္မတ မြန်မာနိုင်ငံ၏ ဥပဒေများနှင့်အညီ ကျင့်သုံးမည်၊ အဓိပ္ပာယ်ဖွင့်ဆိုမည်နှင့် အာဏာပြုဆောင်ရွက်မည်။',
      },
    ],
  },
];

export default function PrivacyPage() {
  const { lang } = useLang();

  return (
    <main className="min-h-screen bg-white">

      {/* Banner */}
      <div
        className="w-full pt-20 relative overflow-hidden"
        style={{
          backgroundColor: '#0d2b6e',
          backgroundImage: 'url(https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2346&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-[#0d2b6e]/80" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-3">
            {lang === 'mm' ? 'တရားဝင် စာရွက်စာတမ်း' : 'Legal Document'}
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            {lang === 'mm' ? 'စည်းမျဉ်းစည်းကမ်းများ' : 'Terms & Conditions'}
          </h1>
          <p className="text-white/70 text-sm sm:text-base max-w-2xl leading-relaxed">
            {lang === 'mm'
              ? 'MediHug Telehealth Platform ကို အသုံးပြုခြင်းဖြင့် အောက်ပါ စည်းမျဉ်းစည်းကမ်းများကို သင်သဘောတူပြီး လက်ခံသည်ဟု မှတ်ယူသည်။'
              : 'By using the MediHug Telehealth Platform, you acknowledge that you have read and agreed to the following terms and conditions.'}
          </p>
          <div className="flex items-center gap-3 mt-6">
            <span className="w-8 h-px bg-white/30" />
            <p className="text-white/30 text-xs">
              {lang === 'mm' ? 'နောက်ဆုံးပြင်ဆင်သည့်ရက် — ဇွန် ၂၁၊ ၂၀၂၅' : 'Last updated — June 21, 2025'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col gap-6 sm:gap-8">
          {sections.map((section) => (
            <div key={section.number} className="flex gap-3 sm:gap-5">
              {/* Number */}
              <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5" style={{ backgroundColor: '#0d2b6e' }}>
                {section.number}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm sm:text-lg font-bold mb-3 pb-2 border-b border-gray-100 leading-snug" style={{ color: '#0d2b6e' }}>
                  {lang === 'mm' ? section.title_mm : section.title_en}
                </h2>
                <div className="flex flex-col gap-3 sm:gap-4">
                  {section.items.map((item, i) => (
                    <div key={i} className="pl-3 border-l-2 border-gray-100">
                      <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 leading-snug">
                        {lang === 'mm' ? item.label_mm : item.label_en}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                        {lang === 'mm' ? item.text_mm : item.text_en}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            {lang === 'mm'
              ? 'မေးမြန်းလိုပါက support@medihug.com သို့ ဆက်သွယ်ပါ။'
              : 'For enquiries, contact support@medihug.com'}
          </p>
        </div>
      </div>

    </main>
  );
}
