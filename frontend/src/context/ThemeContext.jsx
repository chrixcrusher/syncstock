import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const useThemeSettings = () => useContext(ThemeContext);

export const ThemeContextProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'light');
  const [themeColor, setThemeColor] = useState(localStorage.getItem('themeColor') || 'purple[500]');
  const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem('fontSize'), 10) || 14);

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    localStorage.setItem('themeColor', themeColor);
    localStorage.setItem('fontSize', fontSize.toString());
  }, [themeMode, themeColor, fontSize]);

  const theme = createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: themeColor,
      },
    },
    typography: {
      fontSize,
    },
  });

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, themeColor, setThemeColor, fontSize, setFontSize }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
