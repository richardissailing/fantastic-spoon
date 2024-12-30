import type { AppProps } from 'next/app';
import { SettingsProvider } from '@/utils/SettingsContext';
import AppLayout from '@/components/layouts/AppLayout';
import '@/styles/globals.css';
import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/auth-context';  

const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, // disable automatic refetching when window gets focus
        staleTime: 60000, // data considered fresh for 1 minute
      },
    },
  });

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
    <QueryClientProvider client={queryClient}>
    <SettingsProvider>
    <StrictMode>
      <AppLayout>
        <Component {...pageProps} />
      </AppLayout>
      </StrictMode>
    </SettingsProvider>
    </QueryClientProvider>
    </AuthProvider>
  );
}

export default MyApp;