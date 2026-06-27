export const themes = {
  teal: {
    id:          'teal',
    label:       'MediHug Teal',
    primary:     '#2ab5ad',
    accent:      '#4caf50',
    primaryDark: '#1a9990',
  },
  blue: {
    id:          'blue',
    label:       'Classic Blue',
    primary:     '#0d2b6e',
    accent:      '#4facfe',
    primaryDark: '#1a6bcc',
  },
} as const;

export type ThemeId = keyof typeof themes;
export type ThemeTokens = (typeof themes)[ThemeId];

export const theme = themes.teal;
