// themeContext.js
import { createContext, useContext, useState, useEffect } from 'react';

// Define light and dark theme styles
export const themes = {
  light: {
    name: 'light',
    colors: {
      // Base colors
      primary: '#2963ff',
      secondary: '#26cfac',
      accent: '#ff9838',
      error: '#ef5350',
      
      // UI colors
      background: {
        main: 'linear-gradient(to right, #f8f9fa, #e9ecef)',
        paper: '#ffffff',
        gradient: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
        contentCard: '#ffffff',
        drawer: 'linear-gradient(180deg, #2963ff 0%, #1e4ecc 100%)'
      },
      text: {
        primary: '#333333',
        secondary: '#666666',
        muted: '#999999'
      },
      sidebar: {
        background: 'linear-gradient(180deg, #2963ff 0%, #1e4ecc 100%)',
        text: '#ffffff',
        itemHover: 'rgba(255, 255, 255, 0.1)',
        itemActive: 'rgba(255, 255, 255, 0.2)'
      },      card: {
        statCard1: 'linear-gradient(135deg, #2963ff, #1e4ecc)',
        statCard2: 'linear-gradient(135deg, #26cfac, #1ea689)',
        statCard3: 'linear-gradient(135deg, #ff9838, #ff7c39)',
        shadow: '0 6px 16px rgba(0, 0, 0, 0.05)',
        shadowHover: '0 8px 24px rgba(0, 0, 0, 0.08)'
      },
      appBar: {
        background: 'rgba(255, 255, 255, 0.95)',
        text: '#333'
      },
      divider: 'rgba(0, 0, 0, 0.08)'
    }
  },
  dark: {
    name: 'dark',
    colors: {
      // Base colors
      primary: '#4d7dff',
      secondary: '#2fe0bd',
      accent: '#ffad5c',
      error: '#f44336',
      
      // UI colors
      background: {
        main: 'linear-gradient(to right, #1a1d21, #121417)',
        paper: '#252a34',
        gradient: 'linear-gradient(135deg, #1e222a, #252a34)',
        contentCard: '#252a34',
        drawer: 'linear-gradient(180deg, #1a1d21 0%, #121417 100%)'
      },
      text: {
        primary: '#e6e6e6',
        secondary: '#b3b3b3',
        muted: '#808080'
      },
      sidebar: {
        background: 'linear-gradient(180deg, #25292e 0%, #1e2227 100%)',
        text: '#e6e6e6',
        itemHover: 'rgba(255, 255, 255, 0.05)',
        itemActive: 'rgba(255, 255, 255, 0.1)'
      },
      card: {
        statCard1: 'linear-gradient(135deg, #1e2a45, #121b30)',
        statCard2: 'linear-gradient(135deg, #134a3b, #0d2e25)',
        statCard3: 'linear-gradient(135deg, #703c19, #4d2913)',
        shadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
        shadowHover: '0 8px 24px rgba(0, 0, 0, 0.4)'
      },
      appBar: {
        background: 'rgba(37, 42, 52, 0.95)',
        text: '#e6e6e6'
      },
      divider: 'rgba(255, 255, 255, 0.08)'
    }
  }
};

// Create a default value for the context
// This ensures components don't crash when accessing context properties
// before the provider is initialized
const defaultValue = {
  theme: 'light',
  colors: themes.light.colors,
  toggleTheme: () => {}, // no-op function so it can be called safely
  isDark: false
};

// Create the theme context with the default value
export const ThemeContext = createContext(defaultValue);

// Theme provider component
export const ThemeProvider = ({ children }) => {  
  // Check for theme preference or default to light
  const getInitialTheme = () => {
    if (typeof window === 'undefined') return 'light';
    try {
      // Use storageUtils if available, otherwise try direct access
      const savedTheme = window.localStorage ? window.localStorage.getItem('theme') : null;
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
    } catch (error) {
      console.warn('Error accessing localStorage for theme:', error);
      
      // Try system preference as fallback
      try {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
      } catch (mediaError) {
        console.warn('Error accessing media query:', mediaError);
      }
    }
    
  // Default to light theme if storage is not available
    return 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);  
  
  // Update theme and save to local storage
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    if (typeof window === 'undefined') return;
    
    try {
      // Try using storageUtils from the context
      if (window.localStorage) {
        try {
          window.localStorage.setItem('theme', newTheme);
          return; // Successfully saved, no need to try alternatives
        } catch (localErr) {
          console.warn('Error saving theme to localStorage:', localErr);
        }
      }
      
      // If localStorage failed, we could try in-memory storage
      // Let the theme state handle this case
    } catch (error) {
      console.warn('Error saving theme preference:', error);
    }
  };

  // Apply theme to document when it changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-theme', theme);
      
      // Apply background to body
      document.body.style.background = themes[theme].colors.background.main;
      document.body.style.color = themes[theme].colors.text.primary;
    }
  }, [theme]);
  
  // Create a context value object with all theme properties
  const contextValue = {
    theme,
    toggleTheme,
    colors: themes[theme].colors,
    isDark: theme === 'dark'
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);
