import React, { useEffect } from 'react';
import Sidebar from '@/components/common/Sidebar';
import { Toaster } from '@/components/ui/toaster';
import { useSettings } from '@/utils/SettingsContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { darkMode } = useSettings();

  // Apply theme class and CSS variables at the root level
  useEffect(() => {
    // Remove any existing theme classes
    document.documentElement.classList.remove('light', 'dark');
    // Add current theme class
    document.documentElement.classList.add(darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div 
      className={`
        flex h-screen
        ${darkMode ? 'dark' : 'light'}
        bg-background
        text-foreground
        transition-colors duration-300 ease-in-out
      `}
    >
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div 
          className="
            container mx-auto py-6 px-4 
            min-h-[calc(100vh-2rem)] 
            relative
          "
        >
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
};

export default AppLayout;
