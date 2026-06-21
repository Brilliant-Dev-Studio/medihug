'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { lang, setLang, tr } = useLang();

  return (
    <div className="w-full px-3 sm:px-6 pt-2 fixed top-0 left-0 z-50">
      <header className="max-w-6xl mx-auto bg-white rounded-3xl shadow-sm px-5 sm:px-8 flex items-center justify-between" style={{ height: '75px' }}>

        {/* Logo */}
        <span className="text-xl font-bold tracking-tight" style={{ color: '#0d2b6e' }}>
          Medi<span style={{ color: '#1a6bcc' }}>Hug</span>
        </span>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>{tr.home}</Link>
          <Link href="/contact" className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>{tr.contact}</Link>
          <Link href="/privacy" className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>{tr.privacy}</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-6">
          <a href="tel:09779995588" className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#0d2b6e' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" />
            </svg>
            09779995588
          </a>
          <Link href="/signin" className="text-sm font-semibold" style={{ color: '#0d2b6e' }}>{tr.signin}</Link>
          <Link href="/register" className="text-white text-sm font-semibold px-5 py-2.5 rounded-full" style={{ backgroundColor: '#0d2b6e' }}>
            {tr.register}
          </Link>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-full px-1 py-1">
            <button
              onClick={() => setLang('mm')}
              className="text-xs font-semibold px-2.5 py-1 rounded-full transition-colors"
              style={{ backgroundColor: lang === 'mm' ? '#0d2b6e' : 'transparent', color: lang === 'mm' ? '#fff' : '#6b7280' }}
            >
              မြန်မာ
            </button>
            <button
              onClick={() => setLang('en')}
              className="text-xs font-semibold px-2.5 py-1 rounded-full transition-colors"
              style={{ backgroundColor: lang === 'en' ? '#0d2b6e' : 'transparent', color: lang === 'en' ? '#fff' : '#6b7280' }}
            >
              EN
            </button>
          </div>
        </div>

        {/* Mobile Right */}
        <div className="md:hidden flex items-center gap-2">
          {/* Mobile Language Switcher */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-full px-1 py-1">
            <button
              onClick={() => setLang('mm')}
              className="text-xs font-semibold px-2 py-0.5 rounded-full transition-colors"
              style={{ backgroundColor: lang === 'mm' ? '#0d2b6e' : 'transparent', color: lang === 'mm' ? '#fff' : '#6b7280' }}
            >
              မြ
            </button>
            <button
              onClick={() => setLang('en')}
              className="text-xs font-semibold px-2 py-0.5 rounded-full transition-colors"
              style={{ backgroundColor: lang === 'en' ? '#0d2b6e' : 'transparent', color: lang === 'en' ? '#fff' : '#6b7280' }}
            >
              EN
            </button>
          </div>
          <button className="p-2 rounded-lg" style={{ color: '#0d2b6e' }} onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden max-w-6xl mx-auto mt-2 bg-white rounded-2xl shadow-md px-6 py-6 flex flex-col gap-4">
          <Link href="/" className="text-sm font-semibold py-2 border-b border-gray-100" style={{ color: '#1a1a2e' }} onClick={() => setOpen(false)}>{tr.home}</Link>
          <Link href="/contact" className="text-sm font-semibold py-2 border-b border-gray-100" style={{ color: '#1a1a2e' }} onClick={() => setOpen(false)}>{tr.contact}</Link>
          <Link href="/privacy" className="text-sm font-semibold py-2 border-b border-gray-100" style={{ color: '#1a1a2e' }} onClick={() => setOpen(false)}>{tr.privacy}</Link>
          <a href="tel:09779995588" className="flex items-center gap-2 text-sm font-semibold py-2 border-b border-gray-100" style={{ color: '#0d2b6e' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" />
            </svg>
            09779995588
          </a>
          <div className="flex gap-3 pt-2">
            <Link href="/signin" className="flex-1 text-center text-sm font-semibold py-2.5 rounded-full border" style={{ color: '#0d2b6e', borderColor: '#0d2b6e' }} onClick={() => setOpen(false)}>{tr.signin}</Link>
            <Link href="/register" className="flex-1 text-center text-white text-sm font-semibold py-2.5 rounded-full" style={{ backgroundColor: '#0d2b6e' }} onClick={() => setOpen(false)}>{tr.register}</Link>
          </div>
        </div>
      )}
    </div>
  );
}
