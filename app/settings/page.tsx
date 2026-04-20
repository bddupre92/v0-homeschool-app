"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell, CreditCard, LogOut, Shield, Sun, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Navigation from "@/components/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { user, updateUserProfile, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")

  // Notification preferences (local for now)
  const [notifResources, setNotifResources] = useState(true)
  const [notifComments, setNotifComments] = useState(true)
  const [notifFollowers, setNotifFollowers] = useState(true)
  const [notifEvents, setNotifEvents] = useState(true)

  useEffect(() => {
    if (user) {
      setName(user.displayName || "")
      setEmail(user.email || "")
    }
  }, [user])

  const handleSaveAccount = async () => {
    setSaving(true)
    try {
      await updateUserProfile({ displayName: name })
      toast({ title: "Saved", description: "Account settings updated." })
    } catch {
      toast({ title: "Error", description: "Failed to save. Please try again.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch {
      toast({ title: "Error", description: "Failed to sign out.", variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--linen)] text-[var(--ink)]">
      <Navigation />

      <main className="flex-1 atoz-page">
        <div className="flex flex-col gap-6">
          <div>
            <div className="atoz-eyebrow">Settings</div>
            <h1 className="font-display text-4xl md:text-5xl font-light tracking-tighter mt-2">
              Your preferences.
            </h1>
            <p className="text-[var(--ink-2)] mt-2">
              Account, appearance, notifications, and security — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
            <Card className="md:h-fit">
              <CardContent className="p-4">
                <nav className="flex flex-col gap-2">
                  <Link
                    href="#account"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium bg-primary text-primary-foreground"
                  >
                    <User className="h-4 w-4" />
                    Account
                  </Link>
                  <Link
                    href="#appearance"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    <Sun className="h-4 w-4" />
                    Appearance
                  </Link>
                  <Link
                    href="#notifications"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    <Bell className="h-4 w-4" />
                    Notifications
                  </Link>
                  <Link
                    href="#security"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    <Shield className="h-4 w-4" />
                    Security
                  </Link>
                </nav>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card id="account">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Account Settings
                  </CardTitle>
                  <CardDescription>Manage your account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveAccount} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>

              <Card id="appearance">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sun className="h-5 w-5" />
                    Appearance
                  </CardTitle>
                  <CardDescription>Customize how the app looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Theme</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: "light", label: "Light", bg: "bg-white" },
                        { value: "dark", label: "Dark", bg: "bg-zinc-900" },
                        { value: "system", label: "System", bg: "bg-gradient-to-r from-white to-zinc-900" },
                      ].map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setTheme(t.value)}
                          className={`border rounded-md p-2 cursor-pointer transition-colors ${
                            theme === t.value ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50"
                          }`}
                        >
                          <div className={`h-20 ${t.bg} rounded-md border mb-2`} />
                          <div className="text-center text-sm font-medium">{t.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card id="notifications">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">In-App Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notif-resources">New resources in your interests</Label>
                        <Switch id="notif-resources" checked={notifResources} onCheckedChange={setNotifResources} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notif-comments">Comments on your resources</Label>
                        <Switch id="notif-comments" checked={notifComments} onCheckedChange={setNotifComments} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notif-followers">New followers</Label>
                        <Switch id="notif-followers" checked={notifFollowers} onCheckedChange={setNotifFollowers} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notif-events">Upcoming events in your area</Label>
                        <Switch id="notif-events" checked={notifEvents} onCheckedChange={setNotifEvents} />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => toast({ title: "Saved", description: "Notification preferences updated." })}>
                    Save Notification Settings
                  </Button>
                </CardFooter>
              </Card>

              <Card id="security">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security
                  </CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Email verification</h3>
                    {user?.emailVerified ? (
                      <p className="text-sm text-muted-foreground">
                        <Badge variant="secondary" className="mr-2">Verified</Badge>
                        {user.email}
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Optional. Verifying lets you recover your account if you lose access.
                        </p>
                        <Button variant="outline" asChild>
                          <Link href="/verify-email">Verify email</Link>
                        </Button>
                      </>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Password</h3>
                    <p className="text-sm text-muted-foreground">
                      To change your password, use the password reset flow.
                    </p>
                    <Button variant="outline" asChild>
                      <Link href="/reset-password">Reset Password</Link>
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Sessions</h3>
                    <div className="rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Current Session</div>
                          <div className="text-sm text-muted-foreground">
                            {user?.email || "Unknown"} · Active now
                          </div>
                        </div>
                        <Badge>Active</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <LogOut className="h-5 w-5" />
                    Account Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Sign Out</div>
                      <p className="text-sm text-muted-foreground">Sign out of your account on this device</p>
                    </div>
                    <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
