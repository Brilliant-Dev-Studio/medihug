'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, AlertTriangle } from 'lucide-react';
import { useLang } from '@/app/lib/LanguageContext';

const PRIMARY = 'var(--color-primary, #2ab5ad)';

const SUGGESTIONS_EN = [
  'Which doctors specialize in cardiology?',
  'What are your consultation fees?',
  'Do you have a nutrition program?',
  'What partner clinics do you have?',
];
const SUGGESTIONS_MM = [
  'နှလုံးရောဂါကု ဆရာဝန် ရှိလား?',
  'တိုင်ပင်ခ ဘယ်လောက်ကျမလဲ?',
  'အာဟာရဆိုင်ရာ အစီအစဉ် ရှိလား?',
  'ပါတနာ ဆေးခန်း/ဆေးရုံ ဘာတွေရှိလဲ?',
];

interface Message { role: 'user' | 'assistant'; content: string; }

interface Props {
  /** Set on pages that also show the human-support bubble, so this one stacks above it instead of overlapping. */
  stacked?: boolean;
}

export default function PatientAIChatWidget({ stacked = false }: Props) {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const suggestions = mm ? SUGGESTIONS_MM : SUGGESTIONS_EN;
  const errorMsg = mm ? 'တစ်ခုခု မှားနေပါတယ်။ ထပ်ကြိုးစားကြည့်ပါ။' : 'Sorry, something went wrong. Please try again.';
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const accRef = useRef('');

  useEffect(() => {
    setAcknowledged(localStorage.getItem('medihug_ai_disclaimer_ack') === '1');
  }, []);

  function acknowledge() {
    localStorage.setItem('medihug_ai_disclaimer_ack', '1');
    setAcknowledged(true);
  }

  useEffect(() => {
    if (open) listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  async function send(override?: string) {
    const body = (override ?? draft).trim().slice(0, 500);
    if (!body || sending) return;
    setDraft('');
    const nextMessages: Message[] = [...messages, { role: 'user', content: body }];
    setMessages([...nextMessages, { role: 'assistant', content: '' }]);
    setSending(true);

    try {
      const res = await fetch('/api/patient/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });
      if (!res.ok || !res.body) {
        const text = res.status === 429 ? await res.text().catch(() => '') : '';
        setMessages(m => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', content: text || errorMsg };
          return copy;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      accRef.current = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accRef.current += decoder.decode(value, { stream: true });
        setMessages(m => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', content: accRef.current };
          return copy;
        });
      }
    } catch {
      setMessages(m => {
        const copy = [...m];
        copy[copy.length - 1] = { role: 'assistant', content: errorMsg };
        return copy;
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* On /patient this stacks above the support chat bubble; elsewhere it's a normal standalone FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed ${stacked ? 'bottom-58 lg:bottom-24' : 'bottom-6'} right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105`}
        style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)', boxShadow: '0 0 0 4px rgba(139,92,246,0.15), 0 4px 20px rgba(139,92,246,0.5)' }}
      >
        {open ? <X className="w-5 h-5" /> : <Bot className="w-6 h-6" strokeWidth={2} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`fixed ${stacked ? 'bottom-76 lg:bottom-42' : 'bottom-24'} right-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm h-[48vh] lg:h-[60vh] max-h-96 lg:max-h-130 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden`}
          >
            <div className="px-4 py-3.5 flex items-center gap-2.5 text-white shrink-0" style={{ backgroundColor: PRIMARY }}>
              <Bot className="w-4.5 h-4.5" />
              <div>
                <p className="text-sm font-bold leading-tight">MediHug Assistant</p>
                <p className="text-[11px] text-white/75 leading-tight">{mm ? 'ဆရာဝန်နှင့် ဝန်ဆောင်မှုများအကြောင်း မေးမြန်းပါ' : 'Ask about doctors & services'}</p>
              </div>
            </div>

            {!acknowledged ? (
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-gray-50">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#d97706' }} />
                  <p className="text-xs font-bold" style={{ color: '#92400e' }}>
                    {mm ? 'MediHug AI Health Assistant အသုံးပြုခြင်းဆိုင်ရာ သတိပြုချက်' : 'Notice on Using the MediHug AI Health Assistant'}
                  </p>
                </div>
                <div className="flex flex-col gap-2 text-[11px] text-gray-600 leading-relaxed">
                  <p>
                    {mm
                      ? 'MediHug AI Health Assistant သည် သုံးစွဲသူများအား ကျန်းမာရေးဆိုင်ရာ အထွေထွေအချက်အလက်များ ရှာဖွေခြင်း၊ MediHug ၏ ကျန်းမာရေးဝန်ဆောင်မှုများနှင့် ကျန်းမာရေးပညာရှင်များကို ရှာဖွေခြင်းနှင့် သက်ဆိုင်ရာ ဝန်ဆောင်မှုများသို့ လမ်းညွှန်ပေးခြင်းတို့အတွက် ကူညီပေးရန် ရည်ရွယ်ထားပါသည်။'
                      : "The MediHug AI Health Assistant is intended to help users find general health information, find MediHug's healthcare services and healthcare professionals, and navigate to relevant services."}
                  </p>
                  <p>
                    {mm
                      ? 'AI Health Assistant သည် ဆရာဝန် သို့မဟုတ် အခြားအရည်အချင်းပြည့်မီသော ကျန်းမာရေးပညာရှင်၏ အစားထိုးမဟုတ်ပါ။ AI မှပေးသော တုံ့ပြန်ချက်များသည် ရောဂါရှာဖွေခြင်း၊ ဆေးကုသမှုဆုံးဖြတ်ချက်ချခြင်း၊ ဆေးညွှန်းပေးခြင်း သို့မဟုတ် တစ်ဦးချင်းအတွက် အတည်ပြုထားသော ဆေးဘက်ဆိုင်ရာအကြံပြုချက်အဖြစ် မယူဆသင့်ပါ။'
                      : 'The AI Health Assistant is not a substitute for a doctor or other qualified healthcare professional. AI responses should not be treated as a diagnosis, a treatment decision, a prescription, or individually validated medical advice.'}
                  </p>
                  <p>
                    {mm
                      ? 'AI နည်းပညာသည် အချို့သောအခြေအနေများတွင် မှားယွင်းသော၊ မပြည့်စုံသော သို့မဟုတ် လက်ရှိအခြေအနေနှင့် မကိုက်ညီသော အချက်အလက်များကို ပေးနိုင်ပါသည်။ ထို့ကြောင့် ကျန်းမာရေးနှင့်ပတ်သက်သော အရေးကြီးသော ဆုံးဖြတ်ချက်များမချမီ အရည်အချင်းပြည့်မီသော ဆရာဝန် သို့မဟုတ် ကျန်းမာရေးပညာရှင်ထံမှ သင့်လျော်သော ဆေးဘက်ဆိုင်ရာအကြံဉာဏ် ရယူသင့်ပါသည်။'
                      : 'AI technology may, in some cases, provide information that is inaccurate, incomplete, or not up to date. You should therefore obtain appropriate medical advice from a qualified doctor or healthcare professional before making important health decisions.'}
                  </p>
                  <p>
                    {mm
                      ? 'အရေးပေါ်အခြေအနေများ၊ အသက်အန္တရာယ်ရှိနိုင်သော လက္ခဏာများ သို့မဟုတ် ချက်ချင်းဆေးကုသရန်လိုအပ်သော အခြေအနေများတွင် MediHug AI Health Assistant ကို အားကိုးခြင်းမပြုဘဲ အနီးဆုံး အရေးပေါ်ဆေးကုသမှုဌာန သို့မဟုတ် ဆေးရုံသို့ ချက်ချင်းသွားရောက်ပါ။'
                      : 'In an emergency, if you have potentially life-threatening symptoms, or if immediate medical treatment is required, do not rely on the MediHug AI Health Assistant — go immediately to the nearest emergency facility or hospital.'}
                  </p>
                  <p>
                    {mm
                      ? 'AI မှပေးသော အချက်အလက်များကို အသုံးပြုခြင်းဖြင့် သုံးစွဲသူသည် မိမိ၏ကျန်းမာရေးအခြေအနေအတွက် လိုအပ်သည့် ကျွမ်းကျင်သူဆေးဘက်ဆိုင်ရာအကြံဉာဏ် ရယူရန် တာဝန်ရှိပါသည်။'
                      : 'By using information provided by the AI, the user is responsible for obtaining the expert medical advice necessary for their own health condition.'}
                  </p>
                </div>
                <button
                  onClick={acknowledge}
                  className="mt-1 w-full py-2.5 rounded-xl text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: PRIMARY }}
                >
                  {mm ? 'နားလည်ပြီး သဘောတူပါသည်' : 'I Understand & Agree'}
                </button>
              </div>
            ) : (
            <>
            <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2 bg-gray-50">
              {messages.length === 0 && (
                <div className="mt-6 flex flex-col gap-3">
                  <p className="text-xs text-gray-400 text-center px-4">
                    {mm
                      ? 'ဆရာဝန်၊ အထူးကုဌာန၊ ဆေးခန်း၊ ကုန်ပစ္စည်း (သို့) ကျန်းမာရေးအစီအစဉ်များအကြောင်း မေးနိုင်ပါတယ်။'
                      : 'Ask me about our doctors, specialties, clinics, products, or healthcare programs.'}
                  </p>
                  <div className="flex flex-col gap-2 px-1">
                    {suggestions.map(q => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="text-left text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 hover:border-teal-300 hover:text-teal-600 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user' ? 'self-end text-white rounded-br-sm' : 'self-start bg-white border border-gray-100 text-gray-700 rounded-bl-sm'
                  }`}
                  style={m.role === 'user' ? { backgroundColor: PRIMARY } : undefined}
                >
                  {m.content || (sending && i === messages.length - 1 ? (
                    <span className="flex gap-1 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  ) : '')}
                </div>
              ))}
            </div>

            <div className="p-2.5 border-t border-gray-100 flex items-center gap-2 shrink-0">
              <input
                value={draft}
                onChange={e => setDraft(e.target.value.slice(0, 500))}
                onKeyDown={e => e.key === 'Enter' && !sending && send()}
                placeholder={mm ? 'စာရိုက်ပါ...' : 'Type a message...'}
                maxLength={500}
                disabled={sending}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#2ab5ad] disabled:opacity-60"
              />
              <button onClick={() => send()} disabled={sending || !draft.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 disabled:opacity-40"
                style={{ backgroundColor: PRIMARY }}>
                <Send className="w-4 h-4" />
              </button>
            </div>
            </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
