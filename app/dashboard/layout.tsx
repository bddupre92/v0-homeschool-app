'use client';

import { ReactNode } from 'react';
import Header from '@/components/layout/header';
import AuthGuard from '@/components/auth/auth-guard';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
