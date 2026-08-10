'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Home } from 'lucide-react';

const PRIMARY = '#0d2b6e';

export default function GlobalErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[error-boundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-white">
      <p className="text-lg font-bold text-gray-800">တစ်ခုခု မှားနေပါတယ်</p>
      <p className="text-sm text-gray-400 max-w-sm">ဒီစာမျက်နှာကို ဖွင့်ရာတွင် ပြဿနာတစ်ခု ဖြစ်ပွားခဲ့ပါသည်။ ထပ်မံကြိုးစားကြည့်ပါ။</p>
      <div className="flex items-center gap-3 mt-2">
        <button onClick={reset}
          className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl text-white"
          style={{ backgroundColor: PRIMARY }}>
          <RotateCcw className="w-4 h-4" /> ပြန်ကြိုးစားမည်
        </button>
        <Link href="/" className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl border" style={{ color: PRIMARY, borderColor: `${PRIMARY}30` }}>
          <Home className="w-4 h-4" /> ပင်မစာမျက်နှာ
        </Link>
      </div>
    </div>
  );
}
