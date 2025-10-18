import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
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
      default: '#d4f1f4', // Baby Blue
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default theme;