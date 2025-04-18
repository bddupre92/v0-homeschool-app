'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === 'authenticated';
  
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold text-blue-600">
            A to Z Family
          </Link>
          
          {isAuthenticated && (
            <nav className="hidden md:flex space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/boards" className="text-gray-600 hover:text-blue-600">
                Boards
              </Link>
              <Link href="/resources" className="text-gray-600 hover:text-blue-600">
                Resources
              </Link>
              <Link href="/planners" className="text-gray-600 hover:text-blue-600">
                Planners
              </Link>
              <Link href="/lessons" className="text-gray-600 hover:text-blue-600">
                Lessons
              </Link>
              <Link href="/community" className="text-gray-600 hover:text-blue-600">
                Community
              </Link>
            </nav>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span className="hidden md:inline text-sm text-gray-600">
                {session?.user?.name}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
