'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Info, AlertTriangle } from 'lucide-react';

const PRIMARY = 'var(--color-primary)';

/** Delivery address picker for product/program checkout — defaults to the patient's saved
 * profile address (with a "same as profile" toggle to override it), nudges them to add one
 * to their profile if they haven't yet, and always shows the delivery-fee disclaimer. */
export default function DeliveryAddressSection({
  mm, phone, onChange,
}: {
  mm: boolean; phone: string; onChange: (address: string) => void;
}) {
  const [profileAddress, setProfileAddress] = useState<string | null>(null);
  const [loaded, setLoaded]         = useState(false);
  const [useProfile, setUseProfile] = useState(true);
  const [customAddress, setCustomAddress] = useState('');

  useEffect(() => {
    if (!phone) { setLoaded(true); return; }
    fetch(`/api/patient/profile?phone=${encodeURIComponent(phone)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setProfileAddress(d?.user?.address ?? null))
      .finally(() => setLoaded(true));
  }, [phone]);

  useEffect(() => {
    if (!loaded) return;
    onChange(profileAddress && useProfile ? profileAddress : customAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, profileAddress, useProfile, customAddress]);

  if (!loaded) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4" style={{ color: PRIMARY }} />
        <p className="text-sm font-bold" style={{ color: PRIMARY }}>{mm ? 'ပို့ဆောင်မည့်လိပ်စာ' : 'Delivery Address'}</p>
      </div>

      {profileAddress ? (
        <>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox" checked={useProfile} onChange={e => setUseProfile(e.target.checked)}
              className="mt-0.5 w-4 h-4"
            />
            <span className="text-sm text-gray-600">{mm ? 'ကျွန်ုပ်၏ Profile လိပ်စာအတိုင်း' : 'Same as my profile address'}</span>
          </label>
          {useProfile ? (
            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-3.5 py-2.5 whitespace-pre-wrap">{profileAddress}</p>
          ) : (
            <textarea
              value={customAddress} onChange={e => setCustomAddress(e.target.value)} rows={2}
              placeholder={mm ? 'ပို့ဆောင်မည့်လိပ်စာ ရေးပါ' : 'Enter delivery address'}
              className="w-full text-sm text-gray-700 rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-gray-300 transition-colors resize-none"
            />
          )}
        </>
      ) : (
        <>
          <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-100">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              {mm
                ? <>သင့် Profile ထဲ လိပ်စာ မထည့်ရသေးပါ — <Link href="/patient/settings" className="font-bold underline">ဒီနေရာမှာ ထည့်ပါ</Link> နောက်တစ်ခေါက် ပိုမြန်စေမှာဖြစ်ပါတယ်။ လက်ရှိအတွက် အောက်မှာ ရေးထည့်ပါ။</>
                : <>You haven&apos;t added an address to your profile yet — <Link href="/patient/settings" className="font-bold underline">add it here</Link> for faster checkout next time. For now, enter it below.</>}
            </p>
          </div>
          <textarea
            value={customAddress} onChange={e => setCustomAddress(e.target.value)} rows={2}
            placeholder={mm ? 'ပို့ဆောင်မည့်လိပ်စာ ရေးပါ' : 'Enter delivery address'}
            className="w-full text-sm text-gray-700 rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-gray-300 transition-colors resize-none"
          />
        </>
      )}

      <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-gray-50">
        <AlertTriangle className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-gray-500 leading-relaxed">
          {mm
            ? 'ကုန်ပစ္စည်း/ဝန်ဆောင်မှု အမျိုးအစားနှင့် သင့်လိပ်စာပေါ်မူတည်ပြီး ပို့ဆောင်ခ ထပ်မံကျသင့်နိုင်ပါသည်။'
            : 'Additional delivery service fees may apply depending on the product/service type and your address.'}
        </p>
      </div>
    </div>
  );
}
