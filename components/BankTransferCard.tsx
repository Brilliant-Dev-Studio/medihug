'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Landmark, Copy, Check } from 'lucide-react';
import { BANK_ACCOUNTS } from '@/lib/bankAccounts';

/** "Top up with mobile banking" section — every manual bank-transfer account listed at once,
 * each row with its own Copy button. Shown when the patient picks the "Bank Transfer"
 * payment method. Layout matches the reference design: stacked icon+bank-label on the left,
 * account number/holder in the middle, a ghost Copy button on the right. */
export default function BankTransferCard({ mm }: { mm: boolean }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = async (id: string, accountNumber: string) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-bold text-gray-900">
        {mm ? 'မိုဘိုင်းဘဏ်ဖြင့် ငွေဖြည့်ရန်' : 'Top up with mobile banking'}
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-5">
        {BANK_ACCOUNTS.map(bank => (
          <div key={bank.id} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1 shrink-0 w-14">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center" style={{ backgroundColor: bank.logoUrl ? '#fff' : `${bank.color}18`, border: bank.logoUrl ? '1px solid #f3f4f6' : 'none' }}>
                {bank.logoUrl
                  ? <Image src={bank.logoUrl} alt={bank.bankName} width={40} height={40} className="object-cover w-full h-full" />
                  : <Landmark className="w-4.5 h-4.5" style={{ color: bank.color }} />}
              </div>
              <span className="text-[8px] font-bold text-center leading-tight" style={{ color: bank.color }}>{bank.shortLabel}</span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 tracking-wide truncate">{bank.accountNumber}</p>
              <p className="text-xs text-gray-400 truncate">{bank.accountName}</p>
            </div>

            <button type="button" onClick={() => copy(bank.id, bank.accountNumber)}
              className="flex items-center gap-1.5 text-xs font-bold shrink-0" style={{ color: bank.color }}>
              {copiedId === bank.id
                ? <><Check className="w-4 h-4" /> {mm ? 'ကူးပြီး' : 'Copied'}</>
                : <><Copy className="w-4 h-4" /> {mm ? 'ကူးမည်' : 'Copy'}</>}
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        {mm ? 'အထက်ပါ အကောင့်များထဲမှ တစ်ခုသို့ ငွေလွှဲပြီး ပြေစာတင်ပေးပါ' : 'Transfer to any account above, then upload your receipt'}
      </p>
    </div>
  );
}
