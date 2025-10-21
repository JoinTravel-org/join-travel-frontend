import { createContext } from 'react';
import type { Theme } from '@mui/material/styles';

export interface ThemeContextType {
  theme: Theme;
  mode: 'light' | 'dark';
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export type { Theme };