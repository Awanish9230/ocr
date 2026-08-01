'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Creating QueryClient in state ensures that data is not shared 
  // between different users and requests during server-side rendering (SSR),
  // while also caching it correctly on the client side.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1, // Only retry once on failure
            refetchOnWindowFocus: false, // Prevent excessive refetching
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
