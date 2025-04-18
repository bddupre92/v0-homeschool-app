'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { DataProvider } from '@/lib/data-context';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <DataProvider>
        {children}
      </DataProvider>
    </SessionProvider>
  );
}
