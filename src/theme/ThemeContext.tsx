import React, { createContext, useContext, useMemo } from 'react';
import { darkTheme, lightTheme, Theme } from './theme';
import { useHabitStore } from '../store';

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
  // Backed by the store's persisted `themeMode` (habitStore.ts) rather than
  // local state, so the choice survives app restarts and every screen re-renders
  // together via this same context when Settings toggles it.
  const colorScheme = useHabitStore((state) => state.themeMode);
  const setThemeMode = useHabitStore((state) => state.setThemeMode);
  const theme = useMemo(() => (colorScheme === 'dark' ? darkTheme : lightTheme), [colorScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ ...theme, colorScheme, setColorScheme: setThemeMode }),
    [theme, colorScheme, setThemeMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
