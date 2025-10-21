import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

/**
 * Read a CSS variable from :root, with a fallback for first paint.
 */
const cssVar = (name: string, fallback: string): string => {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
};

export const createAppTheme = (mode: 'light' | 'dark'): Theme => {
  // Map tokenized box-shadows into MUI's 25-slot shadow scale
  const shadows = Array(25).fill('var(--shadow-0)') as unknown as Theme['shadows'];
  shadows[1] = 'var(--shadow-1)';
  shadows[2] = 'var(--shadow-2)';
  shadows[3] = 'var(--shadow-3)';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: cssVar('--color-primary', mode === 'light' ? '#05445e' : '#189ab4'),
        contrastText: cssVar('--color-primary-contrast', mode === 'light' ? '#ffffff' : '#0b1220'),
      },
      secondary: {
        // Use accent for secondary to avoid misuse of brand primary
        main: cssVar('--color-accent', '#189ab4'),
      },
      info: {
        main: cssVar('--color-info', mode === 'light' ? '#0288d1' : '#29b6f6'),
      },
      success: {
        main: cssVar('--color-success', mode === 'light' ? '#2e7d32' : '#66bb6a'),
      },
      warning: {
        main: cssVar('--color-warning', mode === 'light' ? '#ed6c02' : '#ffa000'),
      },
      error: {
        main: cssVar('--color-error', mode === 'light' ? '#d32f2f' : '#ef5350'),
      },
      background: {
        default: cssVar('--color-bg', mode === 'light' ? '#f3f7fb' : '#0b1220'),
        paper: cssVar('--color-surface', mode === 'light' ? '#ffffff' : '#1a2027'),
      },
      text: {
        primary: cssVar('--color-text', mode === 'light' ? '#14202A' : '#E6EDF3'),
        secondary: cssVar('--color-text-secondary', mode === 'light' ? '#445B6C' : '#9FB3C8'),
      },
    },
    typography: {
      fontFamily: cssVar('--font-sans', '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'),
      h1: { fontWeight: 700, fontSize: 'var(--fs-h1)', lineHeight: 'var(--lh-tight)' },
      h2: { fontWeight: 700, fontSize: 'var(--fs-h2)', lineHeight: 'var(--lh-tight)' },
      h3: { fontWeight: 600, fontSize: 'var(--fs-h3)', lineHeight: 'var(--lh-tight)' },
      h4: { fontWeight: 600, fontSize: 'var(--fs-h4)', lineHeight: 'var(--lh-normal)' },
      body1: { fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-normal)' },
      body2: { fontSize: 'var(--fs-small)', lineHeight: 'var(--lh-normal)' },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.5px' },
    },
    shape: {
      borderRadius: 8,
    },
    shadows,
    transitions: {
      easing: {
        easeInOut: 'var(--motion-ease-standard)',
        easeOut: 'var(--motion-ease-standard)',
        easeIn: 'var(--motion-ease-standard)',
        sharp: 'var(--motion-ease-enter)',
      },
      duration: {
        shortest: 150,
        shorter: 150,
        short: 200,
        standard: 200,
        complex: 250,
        enteringScreen: 200,
        leavingScreen: 150,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--card-radius)',
            boxShadow: 'var(--card-shadow)',
          },
          outlined: {
            boxShadow: 'var(--shadow-0)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 'var(--btn-border-radius)',
            padding: 'var(--btn-padding-y) var(--btn-padding-x)',
            transition: 'var(--btn-transition)',
          },
          containedPrimary: {
            color: 'var(--color-primary-contrast)',
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: 'var(--color-link)',
            '&:hover': { color: 'var(--color-link-hover)' },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-primary-contrast)',
          },
        },
      },
    },
  });
};

export const lightTheme = createAppTheme('light');
export const darkTheme = createAppTheme('dark');