import SignUpForm from "@/components/auth/sign-up-form"
import Navigation from "@/components/navigation"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container py-8 px-4 md:px-6 flex items-center justify-center">
        <SignUpForm />
      </main>
    </div>
  )
}
