import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-blue-600">
              A to Z Family
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <section className="bg-blue-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Simplify Your Homeschool Journey</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              A comprehensive platform designed to help homeschool families organize lessons, track progress, and build community.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Interactive Boards</h3>
                <p className="text-gray-600">
                  Create and organize boards for different subjects, projects, or goals. Add notes, tasks, and resources.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Resource Library</h3>
                <p className="text-gray-600">
                  Store and categorize all your educational resources in one place. Share with others or keep them private.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Lesson Planning</h3>
                <p className="text-gray-600">
                  Create detailed lesson plans, schedule activities, and track progress throughout the school year.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Ready to transform your homeschool experience?</h2>
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
                Join A to Z Family Today
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">&copy; 2025 A to Z Family. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/about" className="text-sm text-gray-300 hover:text-white">
                About
              </Link>
              <Link href="/privacy" className="text-sm text-gray-300 hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-300 hover:text-white">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
