import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.add('dark');
    root.classList.remove('theme-light');
    root.classList.add('theme-dark');
    body.classList.add('dark');
    body.classList.add('theme-dark');
    root.setAttribute('data-theme', 'dark');
    localStorage.setItem('vit_theme', 'dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'dark', isDark: true, toggleTheme: () => {}, setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
