'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Camera, Check, ChevronDown, User, MapPin, Calendar, Shield, Bell, Palette, Heart, Stethoscope, Package, ChevronRight, Loader2 } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';
import { useTheme } from '../../lib/ThemeContext';
import { themes, ThemeId } from '../../lib/theme';
import { compressAndUpload } from '@/components/admin/uploadImage';

interface FavDoctor { id: string; name: string; nameEn: string | null; imageUrl: string | null; }
interface FavProduct { id: string; name: string; nameEn: string | null; imageUrl: string | null; }

const PRIMARY   = 'var(--color-primary)';
const SECONDARY = 'var(--color-primary-dark)';

const STATES = [
  'ကချင်ပြည်နယ်','ကယားပြည်နယ်','ကရင်ပြည်နယ်','ချင်းပြည်နယ်',
  'မွန်ပြည်နယ်','ရခိုင်ပြည်နယ်','ရှမ်းပြည်နယ်',
  'စစ်ကိုင်းတိုင်းဒေသကြီး','တနင်္သာရီတိုင်းဒေသကြီး','ပဲခူးတိုင်းဒေသကြီး',
  'မကွေးတိုင်းဒေသကြီး','မန္တလေးတိုင်းဒေသကြီး','ရန်ကုန်တိုင်းဒေသကြီး',
  'အင်္ဂပူတိုင်းဒေသကြီး','နေပြည်တော်',
];
const MONTHS_MM = ['ဇန်နဝါရီ','ဖေဖော်ဝါရီ','မတ်','ဧပြီ','မေ','ဇွန်','ဇူလိုင်','သြဂုတ်','စက်တင်ဘာ','အောက်တိုဘာ','နိုဝင်ဘာ','ဒီဇင်ဘာ'];
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function ProfilePage() {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const { themeId, setTheme } = useTheme();

  const [avatar, setAvatar]     = useState('/avatar-placeholder.png');
  const [name, setName]         = useState('thura');
  const [day, setDay]           = useState('28');
  const [month, setMonth]       = useState('February');
  const [year, setYear]         = useState('2003');
  const [gender, setGender]     = useState<'male' | 'female'>('male');
  const [state, setState]       = useState('ချင်းပြည်နယ်');
  const [township, setTownship] = useState('jdjdjd');
  const [saved, setSaved]       = useState(false);
  const [favDoctors, setFavDoctors]   = useState<FavDoctor[]>([]);
  const [favProducts, setFavProducts] = useState<FavProduct[]>([]);
  const [phone, setPhone]             = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError]         = useState('');

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem('medihug_patient');
    if (!raw) return;
    const { phone: p } = JSON.parse(raw) as { phone: string };
    setPhone(p);
    Promise.all([
      fetch(`/api/patient/favorites/doctors?phone=${encodeURIComponent(p)}&full=true`).then(r => r.json()),
      fetch(`/api/patient/favorites/products?phone=${encodeURIComponent(p)}&full=true`).then(r => r.json()),
      fetch(`/api/patient/profile?phone=${encodeURIComponent(p)}`).then(r => r.json()),
    ]).then(([d, pr, prof]) => {
      setFavDoctors(d.doctors ?? []);
      setFavProducts(pr.products ?? []);
      if (prof.user?.profileImage) setAvatar(prof.user.profileImage);
    }).catch(() => {});
  }, []);

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!phone) {
      setAvatarError(mm ? 'အကောင့်ဖုန်းနံပါတ် ရှာမတွေ့ပါ။ ချိန်းဆိုမှုတစ်ခု ပြုလုပ်ပြီးမှ ထပ်ကြိုးစားပါ' : 'No account phone found — book an appointment first, then try again');
      return;
    }

    setAvatarError('');
    setAvatarUploading(true);
    try {
      const url = await compressAndUpload(file, () => {}, '/api/patient/upload');
      const res = await fetch('/api/patient/profile', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, profileImage: url }),
      });
      if (!res.ok) throw new Error('Save failed');
      setAvatar(url);
      window.dispatchEvent(new CustomEvent('medihug-avatar-updated', { detail: url }));
    } catch {
      setAvatarError(mm ? 'ပုံတင်ရာတွင် အမှားရှိသည်' : 'Failed to upload image');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const days   = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const years  = Array.from({ length: 80 },  (_, i) => String(new Date().getFullYear() - i));
  const months = mm ? MONTHS_MM : MONTHS_EN;

  const inputCls   = 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-[var(--color-primary)] focus:bg-white transition-colors';
  const selectCls  = `${inputCls} appearance-none cursor-pointer`;

  const SelectWrap = ({ children }: { children: React.ReactNode }) => (
    <div className="relative">
      {children}
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );

  const SectionTitle = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `color-mix(in srgb, var(--color-primary) 12%, white)` }}>
        <Icon className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
      </div>
      <p className="text-sm font-bold text-gray-700">{label}</p>
    </div>
  );

  /* ── form fields (shared between mobile & desktop) ── */
  const formFields = (
    <div className="flex flex-col gap-4">

      {/* Personal info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <SectionTitle icon={User} label={mm ? 'ကိုယ်ရေး အချက်အလက်' : 'Personal Info'} />
        <div className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500">
              {mm ? 'အမည်' : 'Full Name'} <span className="text-red-500">*</span>
            </label>
            <input className={inputCls} value={name} onChange={e => setName(e.target.value)}
              placeholder={mm ? 'အမည်ထည့်ပါ' : 'Enter your name'} />
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500">
              {mm ? 'အမျိုးသား / အမျိုးသမီး' : 'Gender'} <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {(['male','female'] as const).map(g => {
                const active = gender === g;
                return (
                  <button key={g} onClick={() => setGender(g)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: active ? `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` : '#f3f4f6',
                      color: active ? '#fff' : '#6b7280',
                    }}>
                    {g === 'male' ? (mm ? 'အမျိုးသား' : 'Male') : (mm ? 'အမျိုးသမီး' : 'Female')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Birthday */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500">
              {mm ? 'မွေးနေ့' : 'Date of Birth'} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <SelectWrap>
                <select className={selectCls} value={day} onChange={e => setDay(e.target.value)}>
                  {days.map(d => <option key={d}>{d}</option>)}
                </select>
              </SelectWrap>
              <SelectWrap>
                <select className={selectCls} value={month} onChange={e => setMonth(e.target.value)}>
                  {months.map(m => <option key={m}>{m}</option>)}
                </select>
              </SelectWrap>
              <SelectWrap>
                <select className={selectCls} value={year} onChange={e => setYear(e.target.value)}>
                  {years.map(y => <option key={y}>{y}</option>)}
                </select>
              </SelectWrap>
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <SectionTitle icon={MapPin} label={mm ? 'နေထိုင်ရာ လိပ်စာ' : 'Location'} />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500">{mm ? 'တိုင်း / ပြည်နယ်' : 'State / Region'}</label>
            <SelectWrap>
              <select className={selectCls} value={state} onChange={e => setState(e.target.value)}>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </SelectWrap>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500">
              {mm ? 'မြို့နယ်' : 'Township'} <span className="text-red-500">*</span>
            </label>
            <input className={inputCls} value={township} onChange={e => setTownship(e.target.value)}
              placeholder={mm ? 'မြို့နယ် ထည့်ပါ' : 'Enter township'} />
          </div>
        </div>
      </div>

      {/* Favourites */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `color-mix(in srgb, var(--color-primary) 12%, white)` }}>
              <Heart className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
            </div>
            <p className="text-sm font-bold text-gray-700">{mm ? 'ကြိုက်နှစ်သက်သည်များ' : 'My Favourites'}</p>
          </div>
          <Link href="/patient/favourites" className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: PRIMARY }}>
            {mm ? 'အားလုံးကြည့်ရန်' : 'View all'} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {favDoctors.length === 0 && favProducts.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            {mm ? 'ကြိုက်နှစ်သက်သည် မရှိသေးပါ' : 'No favourites yet'}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {favDoctors.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Stethoscope className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {mm ? 'ဆရာဝန်' : 'Doctors'} ({favDoctors.length})
                  </p>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  {favDoctors.slice(0, 6).map(d => {
                    const name = mm ? d.name : (d.nameEn ?? d.name);
                    return (
                      <Link key={d.id} href={`/patient/doctors/${d.id}`}
                        className="shrink-0 flex flex-col items-center gap-1 w-16">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                          {d.imageUrl
                            ? <img src={d.imageUrl} alt={name} className="w-full h-full object-cover" />
                            : <span className="text-sm font-bold" style={{ color: PRIMARY }}>{d.name.charAt(0)}</span>}
                        </div>
                        <p className="text-[10px] text-gray-500 text-center truncate w-full">{name}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {favProducts.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Package className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {mm ? 'ကုန်ပစ္စည်း' : 'Products'} ({favProducts.length})
                  </p>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  {favProducts.slice(0, 6).map(p => {
                    const name = mm ? p.name : (p.nameEn ?? p.name);
                    return (
                      <Link key={p.id} href={`/patient/records/${p.id}`}
                        className="shrink-0 flex flex-col items-center gap-1 w-16">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                          {p.imageUrl
                            ? <img src={p.imageUrl} alt={name} className="w-full h-full object-cover" />
                            : <Package className="w-4 h-4 text-gray-300" />}
                        </div>
                        <p className="text-[10px] text-gray-500 text-center truncate w-full">{name}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Theme */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <SectionTitle icon={Palette} label={mm ? 'Theme အရောင်' : 'App Theme'} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.values(themes) as (typeof themes)[ThemeId][]).map(t => {
            const active = themeId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as ThemeId)}
                className="relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left"
                style={{
                  borderColor:     active ? t.primary : '#e5e7eb',
                  backgroundColor: active ? `${t.primary}10` : '#f9fafb',
                }}
              >
                {/* Color swatches */}
                <div className="flex gap-1.5 shrink-0">
                  <span className="w-7 h-7 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: t.primary }} />
                  <span className="w-7 h-7 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: t.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold leading-tight" style={{ color: t.primary }}>{t.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.primary}</p>
                </div>
                {active && (
                  <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: t.primary }}>
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save button */}
      <button onClick={handleSave}
        className="w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:opacity-90"
        style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
        {saved
          ? <><Check className="w-4 h-4" /> {mm ? 'သိမ်းဆည်းပြီး' : 'Saved!'}</>
          : (mm ? 'အကောင့် အချက်အလက် သိမ်းရန်' : 'Update Account')}
      </button>
    </div>
  );

  /* ── avatar card (reused on desktop left panel) ── */
  const avatarCard = (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-sm" style={{ borderColor: `color-mix(in srgb, var(--color-primary) 25%, white)` }}>
          <Image src={avatar} alt="avatar" width={96} height={96} className="w-full h-full object-cover" />
          {avatarUploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>
        <button onClick={() => fileRef.current?.click()} disabled={avatarUploading}
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center disabled:opacity-50">
          <Camera className="w-4 h-4" style={{ color: PRIMARY }} />
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
      </div>
      {avatarError && <p className="text-xs text-red-500">{avatarError}</p>}
      <div className="text-center">
        <p className="font-bold text-gray-800">{name || 'Patient User'}</p>
        <span className="text-xs font-semibold px-3 py-1 rounded-full mt-1 inline-block"
          style={{ backgroundColor: `color-mix(in srgb, var(--color-primary) 12%, white)`, color: PRIMARY }}>
          MediHug Patient
        </span>
      </div>

      {/* Quick info rows */}
      <div className="w-full border-t border-gray-100 pt-4 mt-1 flex flex-col gap-2.5">
        {[
          { icon: Calendar, label: mm ? 'မွေးနေ့' : 'Birthday',  value: `${day} ${month} ${year}` },
          { icon: User,     label: mm ? 'ကျားမ' : 'Gender',      value: gender === 'male' ? (mm ? 'အမျိုးသား' : 'Male') : (mm ? 'အမျိုးသမီး' : 'Female') },
          { icon: MapPin,   label: mm ? 'တိုင်း' : 'Region',     value: state },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `color-mix(in srgb, var(--color-primary) 10%, white)` }}>
              <Icon className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 leading-none">{label}</p>
              <p className="text-xs font-semibold text-gray-700 truncate mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-gray-50">

      {/* ══ MOBILE ══ */}
      <div className="lg:hidden">
        {/* Hero */}
        <div className="-mt-18 pt-24 pb-10 flex flex-col items-center"
          style={{ background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <Image src={avatar} alt="avatar" width={96} height={96} className="w-full h-full object-cover" />
              {avatarUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>
            <button onClick={() => fileRef.current?.click()} disabled={avatarUploading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center disabled:opacity-50">
              <Camera className="w-4 h-4" style={{ color: PRIMARY }} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </div>
          {avatarError && <p className="text-xs text-white mt-1.5">{avatarError}</p>}
          <p className="mt-3 text-white font-bold text-lg">{name || 'Patient User'}</p>
          <p className="text-white/60 text-xs mt-0.5">MediHug Patient</p>
        </div>

        {/* Fields */}
        <div className="px-4 py-5 pb-32 flex flex-col gap-4">
          {formFields}
        </div>

        {/* Fixed bottom save */}
        <div className="fixed bottom-16 left-0 right-0 z-30 bg-white/80 backdrop-blur-sm border-t border-gray-100 px-4 py-3">
          <button onClick={handleSave}
            className="w-full py-4 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
            {saved
              ? <><Check className="w-4 h-4" /> {mm ? 'သိမ်းဆည်းပြီး' : 'Saved!'}</>
              : (mm ? 'အကောင့် အချက်အလက် သိမ်းရန်' : 'Update Account')}
          </button>
        </div>
      </div>

      {/* ══ DESKTOP ══ */}
      <div className="hidden lg:flex gap-6 h-screen overflow-hidden px-6 py-6">

        {/* Left panel — avatar + quick info */}
        <div className="w-72 shrink-0 flex flex-col gap-4">
          {avatarCard}

          {/* Extra info cards */}
          {/* Active theme preview */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{mm ? 'လက်ရှိ Theme' : 'Active Theme'}</p>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ backgroundColor: `${themes[themeId].primary}10` }}>
              <div className="flex gap-1.5">
                <span className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: themes[themeId].primary }} />
                <span className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: themes[themeId].accent }} />
              </div>
              <span className="text-sm font-bold" style={{ color: themes[themeId].primary }}>{themes[themeId].label}</span>
            </div>
            <p className="text-xs text-gray-400 text-center">{mm ? 'ညာဘက် Theme section မှ ပြောင်းနိုင်သည်' : 'Change theme in the form →'}</p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 overflow-y-auto">
          {/* Page title */}
          <div className="mb-5">
            <h1 className="text-2xl font-bold" style={{ color: PRIMARY }}>
              {mm ? 'ပရိုဖိုင် ပြင်ဆင်ရန်' : 'Edit Profile'}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {mm ? 'သင့် ကိုယ်ရေး အချက်အလက်များ ပြင်ဆင်ပါ' : 'Update your personal information'}
            </p>
          </div>

          <div className="max-w-2xl flex flex-col gap-4 pb-8">
            {formFields}
          </div>
        </div>

      </div>

    </div>
  );
}
