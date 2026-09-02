'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const ACCENT = '#2ab5ad';

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-white/70 text-sm font-semibold hover:text-white transition-colors">
      {label}
    </Link>
  );
}

export default function Footer() {
  const { tr } = useLang();

  const links = [
    { label: tr.home, href: '/' },
    { label: tr.contact, href: '/contact' },
    { label: tr.privacy, href: '/privacy' },
    { label: tr.telemedicine, href: '/patient/doctors' },
  ];

  return (
    <footer className="w-full" style={{ background: '#0d2b6e' }}>
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <Image src="/medihug-logo.png" alt="MediHug" width={72} height={72} className="object-contain w-16 h-16" />
            <span className="text-base font-bold text-white">MediHug</span>
            <div className="flex items-center gap-2 ml-1.5">
              <a href="https://www.facebook.com/profile.php?id=61592880326160" target="_blank" rel="noopener noreferrer" className="relative w-8 h-8 rounded-full overflow-hidden border border-white/15 hover:border-white/30 transition-colors">
                <Image src="/socials/facebook.png" alt="Facebook" fill className="object-cover" />
              </a>
              <a href="https://www.tiktok.com/@medihugco.ltd" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-white/15 hover:border-white/30 transition-colors flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M16.6 5.82c-1.01-.7-1.68-1.83-1.85-3.12h-3.06v13.32c0 1.62-1.32 2.93-2.93 2.93a2.93 2.93 0 0 1 0-5.86c.28 0 .55.04.8.11V9.94a6 6 0 0 0-.8-.05A6.02 6.02 0 0 0 2.74 16a6.02 6.02 0 0 0 6.02 6.02c3.32 0 6.02-2.7 6.02-6.02V9.03a8.96 8.96 0 0 0 4.6 1.26V7.24a5.93 5.93 0 0 1-2.78-1.42z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {links.map(l => <FooterLink key={l.label} {...l} />)}
          </div>

          {/* CTA */}
          <Link
            href="/register"
            className="group shrink-0 inline-flex items-center gap-2 text-white text-sm font-semibold pl-4 pr-1.5 py-1.5 rounded-full w-fit transition-colors"
            style={{ backgroundColor: `${ACCENT}1a`, border: `1px solid ${ACCENT}40` }}
          >
            {tr.getCareNow}
            <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:rotate-45" style={{ backgroundColor: ACCENT }}>
              <ArrowUpRight className="w-3.5 h-3.5 text-white" />
            </span>
          </Link>
        </div>

        <div className="border-t border-white/10 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/50 text-xs font-semibold">{tr.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
