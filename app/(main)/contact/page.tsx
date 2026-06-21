'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

export default function ContactPage() {
  const { lang } = useLang();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Banner */}
      <div
        className="w-full pt-20 relative overflow-hidden"
        style={{
          backgroundColor: '#0d2b6e',
          backgroundImage: 'url(https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1600&q=80&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#0d2b6e]/85" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-3">
            {lang === 'mm' ? 'ဆက်သွယ်ရန်' : 'Get in Touch'}
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            {lang === 'mm' ? 'ကျွန်ုပ်တို့ထံ ဆက်သွယ်ပါ' : 'Contact Us'}
          </h1>
          <p className="text-white/70 text-sm sm:text-base max-w-xl leading-relaxed">
            {lang === 'mm'
              ? 'မေးမြန်းချက်များ၊ အကြံပြုချက်များ သို့မဟုတ် ဝန်ဆောင်မှုများအကြောင်း သိလိုပါက ဆက်သွယ်ပေးပါ။'
              : 'Have a question or feedback? We\'d love to hear from you. Fill in the form and we\'ll get back to you.'}
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 mt-6 sm:mt-10">
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-5">

          {/* Left Panel — navy */}
          <div className="lg:col-span-2 p-6 sm:p-10 flex flex-col gap-6 sm:gap-8 relative" style={{ backgroundColor: '#0d2b6e' }}>

            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {lang === 'mm' ? 'ဆက်သွယ်ရေး အချက်အလက်' : 'Contact Information'}
              </h2>
              <p className="text-white/50 text-xs leading-relaxed">
                {lang === 'mm' ? 'အောက်ပါ နည်းလမ်းများဖြင့် ဆက်သွယ်နိုင်သည်' : 'Reach us through any of the channels below'}
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-0.5">{lang === 'mm' ? 'ဖုန်း' : 'Phone'}</p>
                  <p className="text-white text-sm font-medium">5588 (Ext 1)</p>
                  <p className="text-white text-sm font-medium">09 77 999 5588</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-0.5">{lang === 'mm' ? 'အီးမေးလ်' : 'Email'}</p>
                  <p className="text-white text-sm font-medium">support@medihug.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-0.5">{lang === 'mm' ? 'လိပ်စာ' : 'Address'}</p>
                  <p className="text-white text-sm font-medium leading-relaxed">
                    {lang === 'mm'
                      ? 'အမှတ် ၃၃၉၊ ၁၁ လွှာ၊ အခန်း ၁၁၀၃\nSakura Tower၊ ရန်ကုန်'
                      : 'No.339, 11F, Room 1103\nSakura Tower, Yangon'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-0.5">{lang === 'mm' ? 'ဖွင့်ချိန်' : 'Office Hours'}</p>
                  <p className="text-white text-sm font-medium">
                    {lang === 'mm' ? 'တနင်္လာ – သောကြာ' : 'Mon – Fri'}
                  </p>
                  <p className="text-white/70 text-xs">
                    {lang === 'mm' ? 'နံနက် ၉ နာရီ – ညနေ ၅ နာရီ' : '9:00 AM – 5:00 PM'}
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* Social */}
            <div>
              <p className="text-white/40 text-xs mb-3">{lang === 'mm' ? 'Social Media' : 'Follow Us'}</p>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.79a4.85 4.85 0 01-1.02-.1z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>

            {/* Decorative circles */}
            <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full opacity-5 pointer-events-none" style={{ background: '#4facfe', transform: 'translate(30%, 30%)' }} />
            <div className="absolute top-20 right-4 w-24 h-24 rounded-full opacity-5 pointer-events-none" style={{ background: '#4facfe' }} />
          </div>

          {/* Right Panel — form */}
          <div className="lg:col-span-3 bg-white p-6 sm:p-10">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-5 py-10">
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#eff6ff' }}>
                  <Send className="w-8 h-8" style={{ color: '#0d2b6e' }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#0d2b6e' }}>
                    {lang === 'mm' ? 'ကျေးဇူးတင်ပါသည်!' : 'Message Sent!'}
                  </h3>
                  <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                    {lang === 'mm'
                      ? 'သင့်စာသည် ကျွန်ုပ်တို့ထံ ရောက်ရှိပြီးပါပြီ။ မကြာမီ ပြန်လည် ဆက်သွယ်ပေးပါမည်။'
                      : 'We\'ve received your message and will get back to you shortly.'}
                  </p>
                </div>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }); }}
                  className="text-xs font-semibold px-6 py-2.5 rounded-full border-2 transition-colors"
                  style={{ color: '#0d2b6e', borderColor: '#0d2b6e' }}
                >
                  {lang === 'mm' ? 'နောက်ထပ် ဆက်သွယ်ရန်' : 'Send Another'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 h-full">
                <div className="mb-1">
                  <h2 className="text-xl font-bold" style={{ color: '#0d2b6e' }}>
                    {lang === 'mm' ? 'မက်ဆေ့ပေးပို့ရန်' : 'Send a Message'}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === 'mm' ? '* ဖြည့်ထားရမည့် အချက်များ' : '* Required fields'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold" style={{ color: '#0d2b6e' }}>
                      {lang === 'mm' ? 'နာမည်' : 'Full Name'} <span className="text-red-400">*</span>
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder={lang === 'mm' ? 'သင့်နာမည်' : 'Your name'}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0d2b6e] focus:ring-2 focus:ring-[#0d2b6e]/10 transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold" style={{ color: '#0d2b6e' }}>
                      {lang === 'mm' ? 'ဖုန်းနံပါတ်' : 'Phone'}
                    </label>
                    <input
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="09 xxx xxx xxx"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0d2b6e] focus:ring-2 focus:ring-[#0d2b6e]/10 transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold" style={{ color: '#0d2b6e' }}>
                    {lang === 'mm' ? 'အီးမေးလ်' : 'Email Address'} <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder={lang === 'mm' ? 'သင့်အီးမေးလ်' : 'your@email.com'}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0d2b6e] focus:ring-2 focus:ring-[#0d2b6e]/10 transition-all bg-gray-50 focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs font-semibold" style={{ color: '#0d2b6e' }}>
                    {lang === 'mm' ? 'မက်ဆေ့' : 'Message'} <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder={lang === 'mm' ? 'သင့်မေးမြန်းချက် သို့မဟုတ် အကြံပြုချက်ကို ရေးပါ...' : 'Write your message here...'}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0d2b6e] focus:ring-2 focus:ring-[#0d2b6e]/10 transition-all bg-gray-50 focus:bg-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#0d2b6e' }}
                >
                  <Send className="w-4 h-4" />
                  {lang === 'mm' ? 'ပေးပို့ရန်' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Map — full width below */}
        <div className="mt-4 sm:mt-6 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-gray-100 h-56 sm:h-72">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3819.4530498782!2d96.15218731483!3d16.77449988840!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30c1ec5b7ef4f191%3A0x9b8d5b9b0f3f9e0b!2sSakura%20Tower%2C%20Yangon!5e0!3m2!1sen!2smm!4v1718000000000!5m2!1sen!2smm"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

      </div>
    </main>
  );
}
