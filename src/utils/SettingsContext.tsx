
import React, { createContext, useContext, useEffect, useState } from 'react';

type DateFormat = 'iso' | 'us' | 'eu';

interface SettingsContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  dateFormat: DateFormat;
  applyDateFormat: (format: DateFormat) => void;
  formatDate: (date: Date) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage if available
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  const [dateFormat, setDateFormat] = useState<DateFormat>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('dateFormat') as DateFormat) || 'iso';
    }
    return 'iso';
  });

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Persist date format
  useEffect(() => {
    localStorage.setItem('dateFormat', dateFormat);
  }, [dateFormat]);

  const applyDateFormat = (format: DateFormat) => {
    setDateFormat(format);
  };

  // Utility function to format dates according to selected format
  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    switch (dateFormat) {
      case 'iso':
        return `${year}-${month}-${day}`;
      case 'us':
        return `${month}/${day}/${year}`;
      case 'eu':
        return `${day}/${month}/${year}`;
      default:
        return `${year}-${month}-${day}`;
    }
  };

  const value = {
    darkMode,
    setDarkMode,
    dateFormat,
    applyDateFormat,
    formatDate,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}