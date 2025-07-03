"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader2, MailCheck, MailWarning } from "lucide-react"

export function EmailVerification() {
  const { user, sendEmailVerification, signOut, isEmailVerified } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [sending, setSending] = useState(false)
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (sending && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (countdown === 0) {
      setSending(false)
      setCountdown(60)
    }
    return () => clearTimeout(timer)
  }, [sending, countdown])

  const handleResendVerification = async () => {
    setSending(true)
    try {
      await sendEmailVerification()
      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email.",
        variant: "destructive",
      })
      setSending(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/sign-in")
  }

  if (isEmailVerified()) {
    router.push("/dashboard")
    return null
  }

  return (
    <div className="w-full max-w-md text-center space-y-6">
      <MailWarning className="mx-auto h-12 w-12 text-yellow-500" />
      <h2 className="text-2xl font-bold">Verify Your Email</h2>
      <p className="text-muted-foreground">
        We've sent a verification link to <strong>{user?.email}</strong>. Please check your inbox and spam folder to
        continue.
      </p>
      <div className="space-y-4">
        <Button onClick={handleResendVerification} disabled={sending} className="w-full">
          {sending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resending in {countdown}s
            </>
          ) : (
            "Resend Verification Email"
          )}
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
          <MailCheck className="mr-2 h-4 w-4" />
          I've verified my email
        </Button>
        <Button variant="link" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </div>
  )
}
