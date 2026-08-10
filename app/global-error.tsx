'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[global-error-boundary]', error);
  }, [error]);

  return (
    <html lang="mm">
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center', background: '#fff', fontFamily: 'sans-serif' }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>တစ်ခုခု မှားနေပါတယ်</p>
          <p style={{ fontSize: 14, color: '#9ca3af', maxWidth: 380 }}>အက်ပ်ကို ဖွင့်ရာတွင် ပြဿနာတစ်ခု ဖြစ်ပွားခဲ့ပါသည်။ ထပ်မံကြိုးစားကြည့်ပါ။</p>
          <button onClick={reset} style={{ fontSize: 14, fontWeight: 600, padding: '10px 20px', borderRadius: 12, color: '#fff', backgroundColor: '#0d2b6e', border: 'none', cursor: 'pointer' }}>
            ပြန်ကြိုးစားမည်
          </button>
        </div>
      </body>
    </html>
  );
}
