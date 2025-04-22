"use client"

import { useState, useEffect } from "react"
import { sendEmailVerification } from "firebase/auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Mail } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function EmailVerification() {
  const { user } = useAuth()
  const [verificationSent, setVerificationSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(60)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const router = useRouter()

  // Check if email is already verified
  useEffect(() => {
    if (user?.emailVerified) {
      router.push("/dashboard")
    }
  }, [user, router])

  // Handle countdown for resending verification
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isCountingDown && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (countdown === 0) {
      setIsCountingDown(false)
      setCountdown(60)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isCountingDown, countdown])

  // Send verification email
  const handleSendVerification = async () => {
    if (!user) return

    try {
      await sendEmailVerification(user)
      setVerificationSent(true)
      setError(null)
      setIsCountingDown(true)
    } catch (error: any) {
      setError(error.message || "Failed to send verification email")
    }
  }

  // Refresh user to check verification status
  const handleCheckVerification = async () => {
    if (!user) return

    try {
      await user.reload()
      if (user.emailVerified) {
        router.push("/dashboard")
      } else {
        setError("Your email is not verified yet. Please check your inbox.")
      }
    } catch (error: any) {
      setError(error.message || "Failed to check verification status")
    }
  }

  if (!user) return null

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification email to <strong>{user.email}</strong>. Please check your inbox and click the
            verification link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {verificationSent && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Email Sent</AlertTitle>
              <AlertDescription>
                Verification email has been sent. Please check your inbox and spam folder.
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-muted p-4 rounded-md flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <div className="text-sm">
              <p className="font-medium">Didn't receive the email?</p>
              <p className="text-muted-foreground">Check your spam folder or request a new verification email.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="flex gap-2 w-full">
            <Button onClick={handleSendVerification} disabled={isCountingDown} className="flex-1">
              {isCountingDown
                ? `Resend in ${countdown}s`
                : verificationSent
                  ? "Resend Email"
                  : "Send Verification Email"}
            </Button>
            <Button onClick={handleCheckVerification} variant="outline">
              I've Verified
            </Button>
          </div>
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => router.push("/sign-in")}>
            Back to Sign In
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
