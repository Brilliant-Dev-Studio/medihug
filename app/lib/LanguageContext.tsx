'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Lang, t } from './translations';

const STORAGE_KEY = 'medihug_lang';

type LanguageContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  tr: typeof t['mm'];
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'mm',
  setLang: () => {},
  tr: t['mm'],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('mm');

  // Restore the saved preference after mount (localStorage isn't available during SSR).
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'mm' || saved === 'en') setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, tr: t[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
