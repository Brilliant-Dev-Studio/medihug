'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { useLang } from '@/app/lib/LanguageContext';

const PRIMARY = 'var(--color-primary)';
const DANGER  = '#ef4444';

/* ── Generic Merchant Cancel Redirect URL — register this page's absolute URL
 * (https://<domain>/patient/payment/cancel) with the payment gateway for both cancel AND
 * fail cases. Landing screen only, no trust boundary — see success/page.tsx for why. ── */
export default function PaymentCancelPage() {
  return (
    <Suspense>
      <PaymentCancelContent />
    </Suspense>
  );
}

function PaymentCancelContent() {
  const params = useSearchParams();
  const { lang } = useLang();
  const mm = lang === 'mm';

  const orderId = params.get('orderId') ?? params.get('order_id') ?? params.get('id') ?? undefined;

  return (
    <div className="relative min-h-full overflow-hidden flex flex-col items-center justify-center px-6 py-20" style={{ backgroundColor: '#f8fafc' }}>
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: `${DANGER}10` }} />
        <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: `${PRIMARY}10` }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-gray-200/70 border border-gray-100 px-7 py-9 flex flex-col items-center text-center"
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
          style={{ backgroundColor: `${DANGER}12` }}
        >
          <XCircle className="w-9 h-9" style={{ color: DANGER }} />
        </div>

        <p className="text-xl font-extrabold text-gray-900">{mm ? 'ငွေပေးချေမှု မပြီးဆုံးပါ' : 'Payment not completed'}</p>
        <p className="text-sm text-gray-400 mt-1.5 max-w-65 leading-relaxed">
          {mm ? 'ငွေပေးချေမှုကို ပယ်ဖျက်လိုက်သည် သို့မဟုတ် မအောင်မြင်ပါ' : 'The payment was cancelled or did not go through.'}
        </p>

        {orderId && (
          <div className="w-full mt-6 flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{mm ? 'အော်ဒါ ID' : 'Order ID'}</span>
            <span className="text-xs font-mono font-bold text-gray-600">{orderId.slice(0, 14)}{orderId.length > 14 ? '…' : ''}</span>
          </div>
        )}

        <Link href="/patient/cart"
          className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white transition-transform active:scale-[0.98]"
          style={{ backgroundColor: PRIMARY, boxShadow: `0 8px 20px -8px ${PRIMARY}70` }}>
          <RotateCcw className="w-4 h-4" />
          {mm ? 'ထပ်မံစမ်းကြည့်ရန်' : 'Try again'}
        </Link>
        <Link href="/patient/dashboard"
          className="w-full mt-2.5 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
          {mm ? 'ပင်မစာမျက်နှာသို့' : 'Back to dashboard'}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}
