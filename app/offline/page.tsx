"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-md mx-auto">
        <AlertTriangle className="w-16 h-16 mx-auto mb-6 text-yellow-500" />
        <h1 className="text-3xl font-bold mb-4">You're offline</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          It looks like you've lost your internet connection. Some features may be limited until you're back online.
        </p>
        <p className="mb-8 text-sm text-gray-500 dark:text-gray-500">
          Don't worry - any changes you make will sync automatically when your connection is restored.
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}
