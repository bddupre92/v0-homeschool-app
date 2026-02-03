"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useErrorTracking } from "@/lib/error-tracking"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { captureError } = useErrorTracking()

  useEffect(() => {
    // Log the error to our error tracking service
    captureError(error, "ErrorBoundary")
  }, [error, captureError])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="mt-2 text-muted-foreground">{error.message || "An unexpected error occurred"}</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => reset()}>Try again</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go home
          </Button>
        </div>
      </div>
    </div>
  )
}
