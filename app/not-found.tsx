"use client"; // Keep it client for now, though it might not matter for a simple version

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

// Intentionally NOT importing or using the <Navigation /> component

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Navigation /> - REMOVED */}
      <div style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>
        <Link href="/">
          <h1 style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>HomeScholar</h1>
        </Link>
        <p>Simplified Navigation for 404</p>
      </div>
      <main className="flex-1 container py-8 px-4 md:px-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-8">The page you are looking for doesn't exist or has been moved.</p>
          <Button asChild className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
