'use client';

import AuthGuard from '@/components/auth/auth-guard';
import RegisterForm from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <AuthGuard requireAuth={false} redirectIfAuthenticated={true} redirectAuthenticatedTo="/dashboard">
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-4">
          <RegisterForm />
        </div>
      </div>
    </AuthGuard>
  );
}
