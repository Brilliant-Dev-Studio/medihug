'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect, type RefObject } from 'react';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';
import type { Lang } from '../lib/translations';

function LangDropdown({ lang, setLang, langOpen, setLangOpen, langRef }: {
  lang: Lang; setLang: (l: Lang) => void;
  langOpen: boolean; setLangOpen: (v: boolean) => void;
  langRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="relative" ref={langRef}>
      <button
        onClick={() => setLangOpen(!langOpen)}
        className="flex items-center gap-1.5 text-base font-semibold px-3 py-2 rounded-full border border-gray-200 transition-colors hover:bg-gray-50"
        style={{ color: '#0d2b6e' }}
      >
        <Image src={lang === 'mm' ? '/flags/myanmar.png' : '/flags/english.jpg'} alt={lang} width={16} height={16} className="w-4 h-4 rounded-full object-cover" />
        {lang === 'mm' ? 'မြန်မာ' : 'English'}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
      </button>

      {langOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50 min-w-36">
          <button
            onClick={() => { setLang('mm'); setLangOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-base font-medium hover:bg-gray-50 transition-colors"
            style={{ color: lang === 'mm' ? '#0d2b6e' : '#6b7280' }}
          >
            <Image src="/flags/myanmar.png" alt="Myanmar" width={18} height={18} className="w-4.5 h-4.5 rounded-full object-cover" />
            မြန်မာ
            {lang === 'mm' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
          </button>
          <div className="border-t border-gray-50" />
          <button
            onClick={() => { setLang('en'); setLangOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-base font-medium hover:bg-gray-50 transition-colors"
            style={{ color: lang === 'en' ? '#0d2b6e' : '#6b7280' }}
          >
            <Image src="/flags/english.jpg" alt="English" width={18} height={18} className="w-4.5 h-4.5 rounded-full object-cover" />
            English
            {lang === 'en' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
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

  return (
    <div className="w-full sticky top-0 z-50">
      <header className="w-full bg-white border-b border-gray-100" style={{ height: '75px' }}>
        <div className="w-full h-full px-5 sm:px-8 lg:px-25 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center">
          <Image src="/medihug-logo.png" alt="MediHug" width={160} height={52} className="object-contain h-13 w-auto" priority />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { href: '/', label: tr.home },
            { href: '/blog', label: tr.navBlog },
            { href: '/contact', label: tr.contact },
            { href: '/privacy', label: tr.privacy },
          ].map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="relative text-base font-semibold transition-colors"
                style={{ color: active ? '#0d2b6e' : '#1a1a2e' }}
              >
                {label}
                {active && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: '#0d2b6e' }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <a href="tel:09779995588" className="flex items-center gap-1.5 text-base font-semibold" style={{ color: '#0d2b6e' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" />
            </svg>
            09779995588
          </a>
          <Link
            href="/signin"
            className="relative text-base font-semibold transition-colors"
            style={{ color: '#0d2b6e' }}
          >
            {tr.signin}
            {pathname === '/signin' && (
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: '#0d2b6e' }} />
            )}
          </Link>
          <Link
            href="/register"
            className="relative text-base font-semibold transition-colors"
            style={{ color: '#0d2b6e' }}
          >
            {tr.register}
            {pathname === '/register' && (
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: '#0d2b6e' }} />
            )}
          </Link>
          <LangDropdown lang={lang} setLang={setLang} langOpen={langOpen} setLangOpen={setLangOpen} langRef={langRef} />
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden p-2 rounded-lg" style={{ color: '#0d2b6e' }} onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {open && (
        <div className="md:hidden w-full bg-white border-b border-gray-100 shadow-md px-6 py-6 flex flex-col gap-4">
          {[
            { href: '/', label: tr.home },
            { href: '/blog', label: tr.navBlog },
            { href: '/contact', label: tr.contact },
            { href: '/privacy', label: tr.privacy },
          ].map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="text-base font-semibold py-2 border-b border-gray-100 flex items-center justify-between"
                style={{ color: active ? '#0d2b6e' : '#1a1a2e' }}
                onClick={() => setOpen(false)}
              >
                {label}
                {active && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#0d2b6e' }} />}
              </Link>
            );
          })}
          <a href="tel:09779995588" className="flex items-center gap-2 text-base font-semibold py-2 border-b border-gray-100" style={{ color: '#0d2b6e' }}>
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
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-base font-semibold border transition-colors"
                style={{
                  backgroundColor: lang === 'mm' ? '#0d2b6e' : 'transparent',
                  color: lang === 'mm' ? '#fff' : '#6b7280',
                  borderColor: lang === 'mm' ? '#0d2b6e' : '#e5e7eb',
                }}
              >
                <Image src="/flags/myanmar.png" alt="Myanmar" width={18} height={18} className="w-4.5 h-4.5 rounded-full object-cover" />
                မြန်မာ
              </button>
              <button
                onClick={() => setLang('en')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-base font-semibold border transition-colors"
                style={{
                  backgroundColor: lang === 'en' ? '#0d2b6e' : 'transparent',
                  color: lang === 'en' ? '#fff' : '#6b7280',
                  borderColor: lang === 'en' ? '#0d2b6e' : '#e5e7eb',
                }}
              >
                <Image src="/flags/english.jpg" alt="English" width={18} height={18} className="w-4.5 h-4.5 rounded-full object-cover" />
                English
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Link
              href="/signin"
              className="flex-1 text-center text-base font-semibold py-2.5 rounded-full border transition-colors"
              style={{
                backgroundColor: pathname === '/signin' ? '#0d2b6e' : 'transparent',
                color: pathname === '/signin' ? '#fff' : '#0d2b6e',
                borderColor: '#0d2b6e',
              }}
              onClick={() => setOpen(false)}
            >
              {tr.signin}
            </Link>
            <Link
              href="/register"
              className="flex-1 text-center text-white text-base font-semibold py-2.5 rounded-full transition-colors"
              style={{ backgroundColor: pathname === '/register' ? '#4facfe' : '#0d2b6e' }}
              onClick={() => setOpen(false)}
            >
              {tr.register}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
