import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { lightTheme, darkTheme } from '../theme';
import { ThemeContext } from './ThemeContext';

type Mode = 'light' | 'dark';

const cssVar = (name: string, fallback: string): string => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
};

interface Props {
  children: ReactNode;
}

export const AppThemeProvider: React.FC<Props> = ({ children }) => {
  const getInitialMode = (): Mode => {
    // Disable darkMode
    // const savedMode = localStorage.getItem('themeMode');
    // if (savedMode === 'light' || savedMode === 'dark') return savedMode;
    return 'light';
  };

  const [mode, setMode] = useState<Mode>(getInitialMode);

  const theme: Theme = mode === 'light' ? lightTheme : darkTheme;

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', next);
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const bg = cssVar('--color-bg', mode === 'light' ? '#f3f7fb' : '#0b1220');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', bg);
    }
  }, [mode]);

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    const hasUserPreference = savedMode === 'light' || savedMode === 'dark';
    if (hasUserPreference || !window.matchMedia) return;

    // Do not change to dark mode based on system preference, keep light
  }, []);

  const value = {
    theme,
    mode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default AppThemeProvider;