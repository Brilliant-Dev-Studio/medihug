'use client';

import { useTheme } from '../../lib/ThemeContext';
import { themes, ThemeId } from '../../lib/theme';
import { Check } from 'lucide-react';

export default function SettingsPage() {
  const { themeId, setTheme } = useTheme();

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800 mb-1">Settings</h1>
      <p className="text-sm text-gray-400 mb-8">App ကို ကိုယ်ပိုင် customize လုပ်ပါ</p>

      {/* Theme */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Theme အရောင်</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.values(themes) as (typeof themes)[ThemeId][]).map((t) => {
            const active = themeId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as ThemeId)}
                className="relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left"
                style={{
                  borderColor:     active ? t.primary : '#e5e7eb',
                  backgroundColor: active ? `${t.primary}10` : '#fff',
                }}
              >
                {/* Color swatches */}
                <div className="flex gap-2 shrink-0">
                  <span className="w-8 h-8 rounded-full border border-white shadow-sm" style={{ backgroundColor: t.primary }} />
                  <span className="w-8 h-8 rounded-full border border-white shadow-sm" style={{ backgroundColor: t.accent }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{t.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.primary} · {t.accent}</p>
                </div>

                {active && (
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: t.primary }}
                  >
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
