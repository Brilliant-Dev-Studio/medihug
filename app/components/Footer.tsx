'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const ACCENT = '#2ab5ad';

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-white/55 text-sm hover:text-white transition-colors">
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
    { label: tr.emergencyCare, href: '/patient/booking' },
  ];

  return (
    <footer className="w-full" style={{ background: '#0d2b6e' }}>
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <Image src="/medihug-logo.png" alt="MediHug" width={32} height={32} className="object-contain w-7 h-7" />
            <span className="text-base font-bold text-white">MediHug</span>
            <div className="flex items-center gap-2 ml-1.5">
              <a href="#" className="relative w-8 h-8 rounded-full overflow-hidden border border-white/15 hover:border-white/30 transition-colors">
                <Image src="/socials/facebook.png" alt="Facebook" fill className="object-cover" />
              </a>
              <a href="#" className="relative w-8 h-8 rounded-full overflow-hidden border border-white/15 hover:border-white/30 transition-colors">
                <Image src="/socials/viberd.png" alt="Viber" fill className="object-cover" />
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
          <p className="text-white/30 text-xs">{tr.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
