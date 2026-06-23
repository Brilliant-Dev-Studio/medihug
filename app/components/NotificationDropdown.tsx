'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Calendar, Pill, Heart, Stethoscope, X, CheckCheck } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

type Notification = {
  id: number;
  type: 'appointment' | 'medicine' | 'health' | 'doctor';
  title_mm: string;
  title_en: string;
  desc_mm: string;
  desc_en: string;
  time_mm: string;
  time_en: string;
  read: boolean;
};

const initialNotifications: Notification[] = [
  {
    id: 1,
    type: 'appointment',
    title_mm: 'ချိန်းဆိုမှု သတိပေးချက်',
    title_en: 'Appointment Reminder',
    desc_mm: 'ဒေါ်ကျော်ကျော်သိန်းနှင့် မနက်ဖြန် ၁၀:၀၀ AM တွင် ချိန်းဆိုမှု ရှိသည်',
    desc_en: 'You have an appointment with Dr. Kyaw Kyaw Thein tomorrow at 10:00 AM',
    time_mm: 'မိနစ် ၃၀ အကြာ',
    time_en: '30 min ago',
    read: false,
  },
  {
    id: 2,
    type: 'medicine',
    title_mm: 'ဆေးသောက်ရန် သတိပေးချက်',
    title_en: 'Medicine Reminder',
    desc_mm: 'နေ့လည် ၁၂:၀၀ တွင် သင့်ဆေးများ သောက်ရန် မမေ့ပါနှင့်',
    desc_en: 'Don\'t forget to take your medicines at 12:00 PM',
    time_mm: '၁ နာရီ အကြာ',
    time_en: '1 hr ago',
    read: false,
  },
  {
    id: 3,
    type: 'doctor',
    title_mm: 'ဆရာဝန် မှတ်ချက်',
    title_en: 'Doctor Note',
    desc_mm: 'ဦးမောင်မောင်ဝင်းမှ သင့် ကျန်းမာရေးမှတ်တမ်း အသစ် ထည့်သွင်းပေးပါသည်',
    desc_en: 'Dr. Maung Maung Win added a new note to your health records',
    time_mm: '၂ နာရီ အကြာ',
    time_en: '2 hrs ago',
    read: false,
  },
  {
    id: 4,
    type: 'health',
    title_mm: 'ကျန်းမာရေး အကြံပြုချက်',
    title_en: 'Health Tip',
    desc_mm: 'ယနေ့ ရေ ၈ ခွက် သောက်ဖို့ မမေ့ပါနှင့်။ ကောင်းသောနေ့ ဖြစ်ပါစေ!',
    desc_en: 'Remember to drink 8 glasses of water today. Have a healthy day!',
    time_mm: 'မနေ့က',
    time_en: 'Yesterday',
    read: true,
  },
  {
    id: 5,
    type: 'appointment',
    title_mm: 'ချိန်းဆိုမှု အတည်ပြု',
    title_en: 'Appointment Confirmed',
    desc_mm: 'ဒေါ်သန်းသန်းမြင့်နှင့် ချိန်းဆိုမှု အောင်မြင်စွာ ဘုကင်လုပ်ပြီးပါပြီ',
    desc_en: 'Your appointment with Dr. Than Than Myint has been confirmed',
    time_mm: 'မနေ့က',
    time_en: 'Yesterday',
    read: true,
  },
];

const iconMap = {
  appointment: { icon: Calendar,    bg: '#eff6ff', color: '#0d2b6e' },
  medicine:    { icon: Pill,        bg: '#fffbeb', color: '#f59e0b' },
  health:      { icon: Heart,       bg: '#fdf2f8', color: '#ec4899' },
  doctor:      { icon: Stethoscope, bg: '#f0fdf4', color: '#10b981' },
};

export default function NotificationDropdown() {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  function dismiss(id: number) {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  function markRead(id: number) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell style={{ width: 20, height: 20, color: '#ef4444' }} />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white px-0.5"
            style={{ backgroundColor: '#ef4444' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-sm" style={{ color: '#0d2b6e' }}>
                {mm ? 'အသိပေးချက်များ' : 'Notifications'}
              </h3>
              {unreadCount > 0 && (
                <p className="text-[11px] text-gray-400">
                  {mm ? `မဖတ်ရသေးသော ${unreadCount} ခု` : `${unreadCount} unread`}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors hover:bg-blue-50"
                style={{ color: '#4facfe' }}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {mm ? 'အားလုံး ဖတ်ပြီး' : 'Mark all read'}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-400">
                  {mm ? 'အသိပေးချက် မရှိသေးပါ' : 'No notifications yet'}
                </p>
              </div>
            ) : (
              notifications.map(n => {
                const { icon: Icon, bg, color } = iconMap[n.type];
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 relative"
                    style={{ backgroundColor: n.read ? '#fff' : '#f0f7ff' }}
                  >
                    {/* Icon */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: bg }}
                    >
                      <Icon style={{ width: 16, height: 16, color }} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[12px] font-bold leading-snug" style={{ color: '#0d2b6e' }}>
                          {mm ? n.title_mm : n.title_en}
                        </p>
                        <button
                          onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                          className="shrink-0 p-0.5 rounded hover:bg-gray-200 transition-colors mt-0.5"
                        >
                          <X className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-snug mt-0.5 line-clamp-2">
                        {mm ? n.desc_mm : n.desc_en}
                      </p>
                      <p className="text-[10px] mt-1 font-medium" style={{ color: '#9ca3af' }}>
                        {mm ? n.time_mm : n.time_en}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <span
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: '#4facfe' }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2.5">
              <button
                onClick={() => setNotifications([])}
                className="w-full text-center text-[11px] font-semibold text-gray-400 hover:text-red-400 transition-colors py-1"
              >
                {mm ? 'အားလုံး ဖျက်ရန်' : 'Clear all'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
