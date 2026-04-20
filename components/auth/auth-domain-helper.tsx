"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Info } from "lucide-react"
import { isFirebaseAvailable, getFirebaseInitError } from "@/lib/firebase"

export default function AuthDomainHelper() {
  const [showDetails, setShowDetails] = useState(false)
  const [diagnostics, setDiagnostics] = useState<string[]>([])
  const [hasIssue, setHasIssue] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    // Developer-only affordance. In production, silently render nothing so
    // real users don't see our internal config status.
    if (process.env.NODE_ENV === "production") return

    const issues: string[] = []

    // Check if Firebase initialized
    if (!isFirebaseAvailable()) {
      const initErr = getFirebaseInitError()
      issues.push("Firebase app failed to initialize")
      if (initErr) {
        issues.push(`Init error: ${initErr}`)
      }

      // Check which env vars are missing (NEXT_PUBLIC_ vars are inlined at build time)
      const vars = {
        NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      }

      for (const [key, value] of Object.entries(vars)) {
        if (!value) {
          issues.push(`Missing: ${key}`)
        } else if (value.includes("demo") || value.includes("your-") || value === "123456789") {
          issues.push(`Demo/placeholder value: ${key}`)
        } else {
          // Show first 4 chars to confirm it's set without revealing the full value
          issues.push(`${key}: ${value.substring(0, 4)}...`)
        }
      }
    }

    if (issues.length > 0) {
      setHasIssue(true)
      setDiagnostics(issues)
    }
  }, [])

  if (!hasIssue) return null

  return (
    <div className="mb-6 w-full max-w-md">
      <Alert variant="destructive" className="mb-2">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Firebase Configuration Issue</AlertTitle>
        <AlertDescription>
          Firebase is not initialized. Authentication will not work.{" "}
          <Button variant="link" className="p-0 h-auto text-xs" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? "Hide details" : "Show details"}
          </Button>
        </AlertDescription>
      </Alert>

      {showDetails && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Diagnostics</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-xs space-y-1 font-mono">
              {diagnostics.map((d, i) => (
                <li key={i} className={d.startsWith("Missing") || d.startsWith("Demo") ? "text-red-500" : "text-green-500"}>
                  {d}
                </li>
              ))}
            </ul>
            <p className="text-xs mt-3 text-muted-foreground">
              NEXT_PUBLIC_ env vars are embedded at build time. If they were added after the last build,
              you need to redeploy for them to take effect.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
