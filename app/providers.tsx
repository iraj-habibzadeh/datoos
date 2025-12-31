'use client';

import { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Navigation from '@/components/Navigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Global error handlers - filter out known harmless errors/warnings
if (typeof window !== 'undefined') {
  // Intercept console.error and console.warn
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args: any[]) => {
    // Filter out known harmless errors that don't need to be logged
    const errorString = args.map(a=>typeof a==='object'?JSON.stringify(a):String(a)).join(' ');
    const isHarmlessError = 
      (errorString.includes('Failed to fetch') && errorString.includes('Error fetching total count')) ||
      (errorString.includes('Failed to fetch') && errorString.includes('Error fetching cryptocurrencies')) ||
      (errorString.includes('Failed to fetch') && errorString.includes('Error fetching exchanges')) ||
      errorString.includes('Analytics SDK') ||
      errorString.includes('AnalyticsSDKApiError');
    
    // Suppress harmless errors from console (they're handled gracefully)
    if (!isHarmlessError) {
      originalError.apply(console, args);
    }
  };
  
  console.warn = (...args: any[]) => {
    // Filter out known harmless warnings
    const warnString = args.map(a=>typeof a==='object'?JSON.stringify(a):String(a)).join(' ');
    const isHarmlessWarning = 
      warnString.includes('Lit is in dev mode') ||
      (warnString.includes('Module not found') && warnString.includes('@react-native-async-storage'));
    
    // Suppress harmless warnings from console
    if (!isHarmlessWarning) {
      originalWarn.apply(console, args);
    }
  };
  
  window.addEventListener('unhandledrejection', (event) => {
    // Ignore wallet extension errors (they're external and harmless)
    const reason = event.reason?.toString() || '';
    if (reason.includes('chainId') || reason.includes('chrome-extension://')) {
      event.preventDefault(); // Prevent error from showing in console
    }
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <Navigation />
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
