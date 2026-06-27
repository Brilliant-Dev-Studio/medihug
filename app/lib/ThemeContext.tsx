'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { themes, ThemeId, ThemeTokens } from './theme';

interface ThemeCtx {
  themeId:   ThemeId;
  theme:     ThemeTokens;
  setTheme:  (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeCtx>({
  themeId:  'teal',
  theme:    themes.teal,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>('teal');

  useEffect(() => {
    const saved = localStorage.getItem('medihug-theme') as ThemeId | null;
    if (saved && themes[saved]) setThemeId(saved);
  }, []);

  useEffect(() => {
    const t = themes[themeId];
    const root = document.documentElement;
    root.style.setProperty('--color-primary',      t.primary);
    root.style.setProperty('--color-accent',       t.accent);
    root.style.setProperty('--color-primary-dark', t.primaryDark);
    localStorage.setItem('medihug-theme', themeId);
  }, [themeId]);

  return (
    <ThemeContext.Provider value={{ themeId, theme: themes[themeId], setTheme: setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
