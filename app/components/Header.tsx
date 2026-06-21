'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { lang, setLang, tr } = useLang();
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const LangDropdown = () => (
    <div className="relative" ref={langRef}>
      <button
        onClick={() => setLangOpen(!langOpen)}
        className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-full border border-gray-200 transition-colors hover:bg-gray-50"
        style={{ color: '#0d2b6e' }}
      >
        <Globe className="w-4 h-4" />
        {lang === 'mm' ? 'မြန်မာ' : 'English'}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
      </button>

      {langOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50 min-w-36">
          <button
            onClick={() => { setLang('mm'); setLangOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
            style={{ color: lang === 'mm' ? '#0d2b6e' : '#6b7280' }}
          >
            <span className="text-base">🇲🇲</span>
            မြန်မာ
            {lang === 'mm' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
          </button>
          <div className="border-t border-gray-50" />
          <button
            onClick={() => { setLang('en'); setLangOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
            style={{ color: lang === 'en' ? '#0d2b6e' : '#6b7280' }}
          >
            <span className="text-base">🇬🇧</span>
            English
            {lang === 'en' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full px-3 sm:px-6 pt-2 fixed top-0 left-0 z-50">
      <header className="max-w-6xl mx-auto bg-white rounded-3xl shadow-sm px-5 sm:px-8 flex items-center justify-between" style={{ height: '75px' }}>

        {/* Logo */}
        <span className="text-xl font-bold tracking-tight shrink-0" style={{ color: '#0d2b6e' }}>
          Medi<span style={{ color: '#1a6bcc' }}>Hug</span>
        </span>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>{tr.home}</Link>
          <Link href="/contact" className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>{tr.contact}</Link>
          <Link href="/privacy" className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>{tr.privacy}</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
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
          <LangDropdown />
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden p-2 rounded-lg" style={{ color: '#0d2b6e' }} onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Sidebar */}
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

          {/* Mobile Language Switcher */}
          <div className="py-2 border-b border-gray-100">
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Language / ဘာသာစကား</p>
            <div className="flex gap-2">
              <button
                onClick={() => setLang('mm')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
                style={{
                  backgroundColor: lang === 'mm' ? '#0d2b6e' : 'transparent',
                  color: lang === 'mm' ? '#fff' : '#6b7280',
                  borderColor: lang === 'mm' ? '#0d2b6e' : '#e5e7eb',
                }}
              >
                🇲🇲 မြန်မာ
              </button>
              <button
                onClick={() => setLang('en')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
                style={{
                  backgroundColor: lang === 'en' ? '#0d2b6e' : 'transparent',
                  color: lang === 'en' ? '#fff' : '#6b7280',
                  borderColor: lang === 'en' ? '#0d2b6e' : '#e5e7eb',
                }}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Link href="/signin" className="flex-1 text-center text-sm font-semibold py-2.5 rounded-full border" style={{ color: '#0d2b6e', borderColor: '#0d2b6e' }} onClick={() => setOpen(false)}>{tr.signin}</Link>
            <Link href="/register" className="flex-1 text-center text-white text-sm font-semibold py-2.5 rounded-full" style={{ backgroundColor: '#0d2b6e' }} onClick={() => setOpen(false)}>{tr.register}</Link>
          </div>
        </div>
      )}
    </div>
  );
}
