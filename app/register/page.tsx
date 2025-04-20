import RegisterForm from "@/components/auth/register-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <Link href="/" className="inline-block">
              <div className="flex items-center justify-center">
                <h1 className="text-2xl font-bold text-blue-600">A to Z Family</h1>
              </div>
            </Link>
          </div>
          <RegisterForm />
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-gray-500">
        <p>&copy; 2025 A to Z Family. All rights reserved.</p>
      </footer>
    </div>
  )
}
