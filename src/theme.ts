import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

export const createAppTheme = (mode: 'light' | 'dark'): Theme => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#05445e', // Navy Blue
      },
      secondary: {
        main: '#189ab4', // Blue Grotto
      },
      info: {
        main: '#75e6da', // Blue Green
      },
      background: {
        default: mode === 'light' ? '#d4f1f4' : '#0a1929', // Baby Blue / Dark Blue
        paper: mode === 'light' ? '#ffffff' : '#1a2027', // White / Dark Paper
      },
      text: {
        primary: mode === 'light' ? '#05445e' : '#ffffff',
        secondary: mode === 'light' ? '#189ab4' : '#b0bec5',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#05445e' : '#0a1929',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1a2027',
          },
        },
      },
    },
  });
};

export const lightTheme = createAppTheme('light');
export const darkTheme = createAppTheme('dark');