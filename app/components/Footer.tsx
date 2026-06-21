'use client';

import Link from 'next/link';
import { useLang } from '../lib/LanguageContext';

export default function Footer() {
  const { tr } = useLang();

  return (
    <footer className="w-full mt-6" style={{ backgroundColor: '#0d2b6e' }}>
      <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="flex flex-col gap-4">
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-white">Medi</span>
            <span style={{ color: '#4facfe' }}>Hug</span>
          </span>
          <p className="text-white/50 text-sm leading-relaxed">
            Connecting patients and care providers for better health outcomes across Myanmar.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center border border-white/20 hover:border-white/60 hover:bg-white/10 transition-all">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
            </a>
            <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center border border-white/20 hover:border-white/60 hover:bg-white/10 transition-all">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center border border-white/20 hover:border-white/60 hover:bg-white/10 transition-all">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-semibold text-sm uppercase tracking-widest">{tr.quickLinks}</h4>
          <ul className="flex flex-col gap-2.5">
            {[tr.home, tr.contact, tr.privacy].map(item => (
              <li key={item}>
                <Link href="/" className="text-white/50 text-sm hover:text-white transition-colors flex items-center gap-2">
                  <span style={{ color: '#4facfe' }}>›</span> {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-semibold text-sm uppercase tracking-widest">{tr.services}</h4>
          <ul className="flex flex-col gap-2.5">
            {[tr.telemedicine, tr.doctorConsultation, tr.categoriesTitle, tr.emergencyCare].map(item => (
              <li key={item}>
                <Link href="/" className="text-white/50 text-sm hover:text-white transition-colors flex items-center gap-2">
                  <span style={{ color: '#4facfe' }}>›</span> {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-semibold text-sm uppercase tracking-widest">Contact</h4>
          <ul className="flex flex-col gap-3 text-sm text-white/50">
            <li className="flex items-start gap-2">
              <span style={{ color: '#4facfe' }} className="mt-0.5">📞</span>
              <span>5588 (Ext 1),<br />09 77 999 5588</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: '#4facfe' }} className="mt-0.5">📍</span>
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
