"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Info, Copy, CheckCircle } from "lucide-react"

export default function AuthDomainHelper() {
  const [currentDomain, setCurrentDomain] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [showHelper, setShowHelper] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentDomain(window.location.origin)
    }
  }, [])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentDomain)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!currentDomain) return null

  return (
    <div className="mb-6">
      <Alert className="mb-2">
        <Info className="h-4 w-4" />
        <AlertTitle>Authentication Error</AlertTitle>
        <AlertDescription>
          This domain is not authorized for Firebase Authentication.{" "}
          <Button variant="link" className="p-0 h-auto" onClick={() => setShowHelper(!showHelper)}>
            {showHelper ? "Hide instructions" : "Show instructions"}
          </Button>
        </AlertDescription>
      </Alert>

      {showHelper && (
        <Card>
          <CardHeader>
            <CardTitle>How to fix this error</CardTitle>
            <CardDescription>
              You need to add this domain to your Firebase project&apos;s authorized domains list
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to the Firebase Console</li>
              <li>Select your project</li>
              <li>Go to Authentication &gt; Settings &gt; Authorized domains</li>
              <li>Click &quot;Add domain&quot; and add the following domain:</li>
            </ol>
            <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
              <code className="text-sm flex-1">{currentDomain}</code>
              <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => window.open("https://console.firebase.google.com/", "_blank")}
              className="w-full"
            >
              Open Firebase Console <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
