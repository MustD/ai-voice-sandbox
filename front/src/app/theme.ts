'use client';

import {ThemeOptions} from '@mui/material/styles';
import {createTheme} from "@mui/material";

const themeOptions: ThemeOptions = {
  typography: {
    fontFamily: 'var(--font-roboto)',
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#66bb6a',
    },
    secondary: {
      main: '#3f51b5',
    },
    background: {
      default: '#030516',
      paper: 'rgba(8,8,102,0.8)',
    },
  },
};

const theme = createTheme(themeOptions);

export default theme;