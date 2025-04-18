'use client';

import AuthGuard from '@/components/auth/auth-guard';
import LoginForm from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false} redirectIfAuthenticated={true} redirectAuthenticatedTo="/dashboard">
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-4">
          <LoginForm />
        </div>
      </div>
    </AuthGuard>
  );
}
