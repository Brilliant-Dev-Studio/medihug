'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { PartyPopper, Sparkles, ArrowRight, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useLang } from '@/app/lib/LanguageContext';

const PRIMARY   = 'var(--color-primary)';
const SECONDARY = 'var(--color-primary-dark)';

/* ── Generic Merchant Success Redirect URL —register this page's absolute URL
 * (https://<domain>/patient/payment/success) with the payment gateway. Not tied to any one
 * gateway's param names yet: reads the common ones (orderId/order_id/id, txnId/transactionId)
 * so whichever provider we wire up later mostly works without touching this page. The actual
 * source of truth for payment status is always the backend (Notify URL / DB), never these
 * query params — this page is a landing screen, not a trust boundary. ── */
export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentSuccessContent />
    </Suspense>
  );
}

function PaymentSuccessContent() {
  const params = useSearchParams();
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [copied, setCopied] = useState(false);

  const orderId = params.get('orderId') ?? params.get('order_id') ?? params.get('id') ?? undefined;
  const txnId = params.get('transactionId') ?? params.get('txnId') ?? params.get('transaction_id') ?? undefined;

  const copyOrderId = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="relative min-h-full overflow-hidden flex flex-col items-center justify-center px-6 py-20" style={{ backgroundColor: '#f8fafc' }}>
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: `${PRIMARY}14` }} />
        <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: `${SECONDARY}12` }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-gray-200/70 border border-gray-100 px-7 py-9 flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 16 }}
          className="relative w-20 h-20 rounded-full flex items-center justify-center mb-5"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`, boxShadow: `0 10px 28px -8px ${PRIMARY}55` }}
        >
          <span className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: `${PRIMARY}30`, animationDuration: '2.2s' }} />
          <PartyPopper className="w-9 h-9 text-white relative" />
          <Sparkles className="w-4 h-4 text-white/90 absolute -top-1 -right-1" />
        </motion.div>

        <p className="text-xl font-extrabold text-gray-900">{mm ? 'ငွေပေးချေမှု အောင်မြင်ပါသည်!' : 'Payment successful!'}</p>
        <p className="text-sm text-gray-400 mt-1.5 max-w-65 leading-relaxed">
          {mm ? 'သင့်ငွေပေးချေမှုကို လက်ခံရရှိပြီး အတည်ပြုပေးပါမည်' : "We've received your payment and will confirm it shortly."}
        </p>

        {(orderId || txnId) && (
          <div className="w-full mt-6 rounded-2xl overflow-hidden border border-gray-100">
            {orderId && (
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{mm ? 'အော်ဒါ ID' : 'Order ID'}</span>
                <button onClick={copyOrderId} className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-800 transition-colors">
                  <span className="font-mono">{orderId.slice(0, 14)}{orderId.length > 14 ? '…' : ''}</span>
                  {copied ? <Check className="w-3.5 h-3.5" style={{ color: PRIMARY }} /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                </button>
              </div>
            )}
            {txnId && (
              <div className="flex items-center justify-between px-4 py-3" style={{ background: `linear-gradient(135deg, ${PRIMARY}08 0%, ${SECONDARY}10 100%)` }}>
                <span className="text-xs font-semibold text-gray-500">{mm ? 'အတည်ပြု နံပါတ်' : 'Transaction ID'}</span>
                <span className="text-xs font-mono font-bold text-gray-700">{txnId.slice(0, 18)}{txnId.length > 18 ? '…' : ''}</span>
              </div>
            )}
          </div>
        )}

        <Link href="/patient/records"
          className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white transition-transform active:scale-[0.98]"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`, boxShadow: `0 8px 20px -8px ${PRIMARY}70` }}>
          {mm ? 'ပစ္စည်း/ချိန်းဆိုမှုများ ကြည့်ရန်' : 'View my records'}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}
