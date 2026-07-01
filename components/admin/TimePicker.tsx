'use client';

import { useState, useEffect, useRef } from 'react';
import Picker from 'react-mobile-picker';
import { Clock, X } from 'lucide-react';

const PRIMARY = '#2ab5ad';

const HOURS   = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
const PERIODS = ['AM', 'PM'];

function to24(h: string, m: string, period: string): string {
  let hour = parseInt(h);
  if (period === 'AM' && hour === 12) hour = 0;
  if (period === 'PM' && hour !== 12) hour += 12;
  return `${String(hour).padStart(2, '0')}:${m}`;
}

function from24(time: string): { h: string; m: string; period: string } {
  if (!time) return { h: '09', m: '00', period: 'AM' };
  const [hStr, mStr] = time.split(':');
  let hour = parseInt(hStr);
  const period = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  if (hour > 12) hour -= 12;
  const nearestMin = Math.round(parseInt(mStr) / 5) * 5;
  const m = String(Math.min(nearestMin, 55)).padStart(2, '0');
  return { h: String(hour).padStart(2, '0'), m, period };
}

function displayTime(time: string): string {
  if (!time) return '';
  const { h, m, period } = from24(time);
  return `${h}:${m} ${period}`;
}

interface TimePickerProps {
  value: string;       // HH:MM (24h)
  onChange: (v: string) => void;
  label?: string;
  placeholder?: string;
}

export default function TimePicker({ value, onChange, label, placeholder = 'Select time' }: TimePickerProps) {
  const init = from24(value);
  const [pickerValue, setPickerValue] = useState({ h: init.h, m: init.m, period: init.period });
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parsed = from24(value);
    setPickerValue({ h: parsed.h, m: parsed.m, period: parsed.period });
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (newVal: typeof pickerValue) => {
    setPickerValue(newVal);
    onChange(to24(newVal.h, newVal.m, newVal.period));
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const inp = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad] transition-colors';

  return (
    <div className="relative" ref={ref}>
      {label && <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>}

      {/* Trigger */}
      <div
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 cursor-pointer rounded-xl border bg-gray-50 px-3 py-2.5 text-sm transition-colors ${open ? 'border-[#2ab5ad] ring-2 ring-[#2ab5ad]/40' : 'border-gray-200 hover:border-gray-300'}`}
      >
        <Clock size={14} className="text-gray-400 shrink-0" />
        {value ? (
          <>
            <span className="flex-1 text-gray-800 font-medium">{displayTime(value)}</span>
            <button type="button" onClick={clear} className="shrink-0 text-gray-400 hover:text-red-400 transition-colors">
              <X size={14} />
            </button>
          </>
        ) : (
          <span className="flex-1 text-gray-400">{placeholder}</span>
        )}
      </div>

      {/* Dropdown picker */}
      {open && (
        <div className="absolute z-50 mt-1 left-0 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden w-64">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>
              Select Time
            </span>
            <span className="text-sm font-bold text-gray-700">{displayTime(to24(pickerValue.h, pickerValue.m, pickerValue.period))}</span>
          </div>

          {/* Picker columns */}
          <div className="relative">
            {/* highlight band — behind text (no z-index, just background) */}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-teal-50 border-y border-teal-100" />

            <Picker
              value={pickerValue}
              onChange={handleChange}
              height={160}
              itemHeight={40}
              wheelMode="natural"
            >
              <Picker.Column name="h">
                {HOURS.map(h => (
                  <Picker.Item key={h} value={h}>
                    {({ selected }) => (
                      <span style={{ position: 'relative', zIndex: 1 }} className={`text-base font-semibold transition-colors ${selected ? 'text-[#2ab5ad]' : 'text-gray-300'}`}>{h}</span>
                    )}
                  </Picker.Item>
                ))}
              </Picker.Column>

              <Picker.Column name="m">
                {MINUTES.map(m => (
                  <Picker.Item key={m} value={m}>
                    {({ selected }) => (
                      <span style={{ position: 'relative', zIndex: 1 }} className={`text-base font-semibold transition-colors ${selected ? 'text-[#2ab5ad]' : 'text-gray-300'}`}>{m}</span>
                    )}
                  </Picker.Item>
                ))}
              </Picker.Column>

              <Picker.Column name="period">
                {PERIODS.map(p => (
                  <Picker.Item key={p} value={p}>
                    {({ selected }) => (
                      <span style={{ position: 'relative', zIndex: 1 }} className={`text-base font-semibold transition-colors ${selected ? 'text-[#2ab5ad]' : 'text-gray-300'}`}>{p}</span>
                    )}
                  </Picker.Item>
                ))}
              </Picker.Column>
            </Picker>
          </div>

          {/* Footer */}
          <div className="flex gap-2 px-4 py-3 border-t border-gray-100">
            <button type="button" onClick={() => { onChange(''); setOpen(false); }}
              className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={() => setOpen(false)}
              className="flex-1 py-2 rounded-xl text-xs font-bold text-white transition-colors"
              style={{ backgroundColor: PRIMARY }}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
