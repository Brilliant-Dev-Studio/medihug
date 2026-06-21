'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Lang, t } from './translations';

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
  const [lang, setLang] = useState<Lang>('mm');
  return (
    <LanguageContext.Provider value={{ lang, setLang, tr: t[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
