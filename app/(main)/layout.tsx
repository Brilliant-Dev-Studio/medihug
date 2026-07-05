'use client';

import { useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLang } from '../lib/LanguageContext';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { setLang } = useLang();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setLang('en');
  }, [setLang]);

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
