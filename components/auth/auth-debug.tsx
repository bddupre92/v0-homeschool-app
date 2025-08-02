"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AuthDebug() {
  const { user, signOut } = useAuth()

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <Card className="w-full max-w-md mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Auth Debug (Dev Only)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs">
          <strong>User:</strong> {user ? "Authenticated" : "Not authenticated"}
        </div>
        {user && (
          <>
            <div className="text-xs">
              <strong>UID:</strong> {user.uid}
            </div>
            <div className="text-xs">
              <strong>Email:</strong> {user.email}
            </div>
            <div className="text-xs">
              <strong>Display Name:</strong> {user.displayName}
            </div>
            <div className="text-xs">
              <strong>Email Verified:</strong> {user.emailVerified ? "Yes" : "No"}
            </div>
            <Button size="sm" variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
