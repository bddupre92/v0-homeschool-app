"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"

export default function ScrollError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">
            We're sorry, but there was an error loading the content. Please try again.
          </p>
          <Button onClick={reset}>Try again</Button>
        </div>
      </main>
    </div>
  )
}
