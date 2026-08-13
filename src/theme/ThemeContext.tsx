import React, { createContext, useContext, useMemo, useState } from 'react';
import { darkTheme, lightTheme, Theme } from './theme';

export type ColorScheme = 'dark' | 'light';

export interface ThemeContextValue extends Theme {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
}

const noop = () => undefined;

const ThemeContext = createContext<ThemeContextValue>({
  ...darkTheme,
  colorScheme: 'dark',
  setColorScheme: noop,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Defaults to 'dark' -- it's the only fully-designed palette right now
  // (see the TODO on `lightColors` in src/theme/colors.ts). This is explicit
  // app state rather than following the OS scheme, so a future light-mode
  // toggle can drive it directly via `setColorScheme`.
  const [colorScheme, setColorScheme] = useState<ColorScheme>('dark');
  const theme = useMemo(() => (colorScheme === 'dark' ? darkTheme : lightTheme), [colorScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ ...theme, colorScheme, setColorScheme }),
    [theme, colorScheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
