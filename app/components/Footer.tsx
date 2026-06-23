'use client';

import Link from 'next/link';
import { Phone, MapPin } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

export default function Footer() {
  const { tr } = useLang();

  return (
    <footer className="w-full " style={{ backgroundColor: '#0d2b6e' }}>
      <div className="max-w-6xl mx-auto px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Brand */}
        <div className="flex flex-col gap-3">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-white">Medi</span>
            <span style={{ color: '#4facfe' }}>Hug</span>
          </span>
          <p className="text-white/50 text-xs leading-relaxed">
            Connecting patients and care providers for better health outcomes across Myanmar.
          </p>
          <div className="flex items-center gap-2">
            {/* Facebook */}
            <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center border border-white/20 hover:border-white/60 hover:bg-white/10 transition-all">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
            </a>
            {/* TikTok */}
            <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center border border-white/20 hover:border-white/60 hover:bg-white/10 transition-all">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.79a4.85 4.85 0 01-1.02-.1z"/></svg>
            </a>
            {/* YouTube */}
            <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center border border-white/20 hover:border-white/60 hover:bg-white/10 transition-all">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white font-semibold text-xs uppercase tracking-widest">{tr.quickLinks}</h4>
          <ul className="flex flex-col gap-1.5">
            {[
              { label: tr.home, href: '/' },
              { label: tr.contact, href: '/contact' },
              { label: tr.privacy, href: '/privacy' },
            ].map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="text-white/50 text-xs hover:text-white transition-colors flex items-center gap-1.5">
                  <span style={{ color: '#4facfe' }}>›</span> {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white font-semibold text-xs uppercase tracking-widest">Contact</h4>
          <ul className="flex flex-col gap-2 text-xs text-white/50">
            <li className="flex items-start gap-2">
              <Phone className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#4facfe' }} />
              <span>5588 (Ext 1),<br />09 77 999 5588</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#4facfe' }} />
              <span>No.339, 11th Floor, Room 1103,<br />Bogyoke Aung San Road,<br />Sakura Tower, Yangon.</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/30 text-xs">{tr.copyright}</p>
          <p className="text-white/30 text-xs">{tr.footerTagline}</p>
        </div>
      </div>
    </footer>
  );
}
