'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, createContext } from 'react';

export const QueryContext = createContext();

export function QueryProvider({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryContext.Provider value={{ queryClient }}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </QueryContext.Provider>
  );
}
