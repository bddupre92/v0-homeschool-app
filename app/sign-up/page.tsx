import SignUpForm from "@/components/auth/sign-up-form"
import AuthDomainHelper from "@/components/auth/auth-domain-helper"
import Navigation from "@/components/navigation"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container py-8 px-4 md:px-6 flex flex-col items-center justify-center">
        <AuthDomainHelper />
        <SignUpForm />
      </main>
    </div>
  )
}
