"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Mail, RefreshCw, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Progress } from "@/components/ui/progress"

export default function EmailVerification() {
  const { user, sendEmailVerification } = useAuth()
  const [verificationSent, setVerificationSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(60)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [autoCheckProgress, setAutoCheckProgress] = useState(0)
  const [autoChecking, setAutoChecking] = useState(false)
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

  // Auto-check verification status
  useEffect(() => {
    let timer: NodeJS.Timeout
    let progressTimer: NodeJS.Timeout

    if (autoChecking) {
      // Reset progress
      setAutoCheckProgress(0)

      // Increment progress every 100ms
      progressTimer = setInterval(() => {
        setAutoCheckProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressTimer)
            return 100
          }
          return prev + 1
        })
      }, 50)

      // Check verification status after 5 seconds
      timer = setTimeout(async () => {
        await handleCheckVerification()
        setAutoChecking(false)
      }, 5000)
    }

    return () => {
      if (timer) clearTimeout(timer)
      if (progressTimer) clearInterval(progressTimer)
    }
  }, [autoChecking])

  // Send verification email
  const handleSendVerification = async () => {
    if (!user) return

    try {
      await sendEmailVerification()
      setVerificationSent(true)
      setError(null)
      setIsCountingDown(true)
      setAutoChecking(true)
    } catch (error: any) {
      setError(error.message || "Failed to send verification email")
    }
  }

  // Refresh user to check verification status
  const handleCheckVerification = async () => {
    if (!user) return

    setCheckingStatus(true)
    try {
      await user.reload()
      if (user.emailVerified) {
        router.push("/dashboard")
      } else {
        setError("Your email is not verified yet. Please check your inbox.")
      }
    } catch (error: any) {
      setError(error.message || "Failed to check verification status")
    } finally {
      setCheckingStatus(false)
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

          {autoChecking && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Checking verification status...</span>
                <RefreshCw className="h-4 w-4 animate-spin" />
              </div>
              <Progress value={autoCheckProgress} />
            </div>
          )}

          <div className="bg-muted p-4 rounded-md space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div className="text-sm">
                <p className="font-medium">Didn't receive the email?</p>
                <p className="text-muted-foreground">Check your spam folder or request a new verification email.</p>
              </div>
            </div>

            <div className="text-sm space-y-1 mt-2">
              <p className="font-medium">Troubleshooting tips:</p>
              <ul className="list-disc pl-5 text-muted-foreground">
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the correct email address</li>
                <li>Add our email domain to your safe senders list</li>
                <li>Check if your email provider is blocking verification emails</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="flex gap-2 w-full">
            <Button onClick={handleSendVerification} disabled={isCountingDown || autoChecking} className="flex-1">
              {isCountingDown
                ? `Resend in ${countdown}s`
                : verificationSent
                  ? "Resend Email"
                  : "Send Verification Email"}
            </Button>
            <Button onClick={handleCheckVerification} variant="outline" disabled={checkingStatus || autoChecking}>
              {checkingStatus ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "I've Verified"
              )}
            </Button>
          </div>
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => router.push("/sign-in")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
