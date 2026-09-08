'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Phone } from 'lucide-react';
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
              <a href="viber://chat?number=%2B959784101005" className="w-8 h-8 rounded-full border border-white/15 hover:border-white/30 transition-colors flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M12.02 2.5c-4.9 0-9.4 2.7-9.4 8.2 0 3.3 1.8 5.9 4.6 7.3-.15.6-.5 1.9-.6 2.2-.13.4.15.4.31.3.13-.09 2.05-1.4 2.9-1.97.7.1 1.43.16 2.19.16 4.9 0 9.4-2.7 9.4-8.2s-4.5-8.2-9.4-8.2zm4.7 11.2s-.35.32-.44.4c-.65.55-1.9.7-3.6.02-2.9-1.16-4.8-3.9-5.06-4.28-.26-.38-.86-1.3-.9-2.4-.03-1.1.5-1.65.7-1.88a.85.85 0 0 1 .6-.27c.15 0 .3 0 .43.01.14.01.34-.02.53.42.2.46.68 1.6.74 1.72.06.12.1.26.02.42-.08.16-.12.26-.24.4-.13.14-.26.32-.37.43-.13.13-.26.27-.11.53.15.26.66 1.1 1.4 1.8.97.9 1.8 1.19 2.05 1.32.25.13.4.11.55-.06.15-.17.63-.72.8-.97.17-.25.34-.2.56-.12.22.08 1.42.68 1.66.8.24.13.4.19.46.3.06.11.06.62-.29 1.21zm-.86-6.42a4.1 4.1 0 0 0-3.5-3.55.42.42 0 1 1 .12-.83 4.95 4.95 0 0 1 4.2 4.26.42.42 0 0 1-.82.12zm-1.3-.35a2.63 2.63 0 0 0-2.06-1.98.42.42 0 1 1 .16-.82 3.47 3.47 0 0 1 2.71 2.6.42.42 0 0 1-.81.2zm-.03-.42a1.3 1.3 0 0 0-1.06-1.06.42.42 0 0 1 .17-.82c.87.18 1.53.83 1.71 1.7a.42.42 0 1 1-.82.18z" />
                </svg>
              </a>
              <a href="tel:09784101005" className="w-8 h-8 rounded-full border border-white/15 hover:border-white/30 transition-colors flex items-center justify-center">
                <Phone className="w-3.5 h-3.5 text-white" />
              </a>
              <span className="text-white/70 text-xs font-semibold">09 784 101005</span>
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
