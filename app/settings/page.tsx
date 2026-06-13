"use client"

/**
 * Settings — auto-save preferences page.
 *
 * Four sections: Account, Appearance, Notifications, Compliance.
 * (Phase 6.10 collapsed six sections to four; folded Advisor + Sessions
 * into Account, moved Family Name out of Appearance into Account.)
 *
 * Save model:
 *  - Text inputs: debounced auto-save (400ms after last keystroke);
 *    silent "Saved" status pill, no toast spam.
 *  - Toggles + theme + accent color: immediate save with an Undo toast
 *    (5s) so a mis-tap is recoverable.
 *  - No explicit Save buttons.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Bell, CalendarDays, Check, LogOut, Mail, Sparkles, Sun, User, ChevronRight } from "lucide-react"
import {
  getAdvisorPrefs,
  getBranding,
  setAdvisorPrefs,
  setBranding,
} from "@/lib/atoz-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ToastAction } from "@/components/ui/toast"
import Navigation from "@/components/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"

const ACCENT_COLORS = [
  { value: "#556b47", label: "Sage" },
  { value: "#a44830", label: "Terracotta" },
  { value: "#a8501c", label: "Honey" },
  { value: "#4a7090", label: "Slate" },
  { value: "#6f4a7d", label: "Plum" },
  { value: "#2e5d3f", label: "Deep green" },
]

const NOTIF_KEY = "atoz.notifPrefs"
type NotifPrefs = { resources: boolean; comments: boolean; followers: boolean; events: boolean }
const NOTIF_DEFAULTS: NotifPrefs = { resources: true, comments: true, followers: true, events: true }

function readNotifPrefs(): NotifPrefs {
  if (typeof window === "undefined") return NOTIF_DEFAULTS
  try {
    const raw = window.localStorage.getItem(NOTIF_KEY)
    return raw ? { ...NOTIF_DEFAULTS, ...JSON.parse(raw) } : NOTIF_DEFAULTS
  } catch {
    return NOTIF_DEFAULTS
  }
}

function writeNotifPrefs(prefs: NotifPrefs) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs))
  } catch {}
}

/** Tiny status pill — shows "Saved" briefly after a write. */
function SavedPill({ visible }: { visible: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs text-[var(--sage-dd)] transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-live="polite"
    >
      <Check className="h-3 w-3" /> Saved
    </span>
  )
}

export default function SettingsPage() {
  const { user, updateUserProfile, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  // Account — Display name (auto-saved, debounced)
  const [name, setName] = useState("")
  const [namePill, setNamePill] = useState(false)
  const nameSavedRef = useRef("")
  const nameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Account — Family name (auto-saved, debounced)
  const [familyName, setFamilyName] = useState("")
  const [familyPill, setFamilyPill] = useState(false)
  const familyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Account — Advisor toggle
  const [advisorEnabled, setAdvisorEnabled] = useState(false)

  // Appearance — Accent color
  const [accentColor, setAccentColor] = useState<string>("#556b47")

  // Notifications
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>(NOTIF_DEFAULTS)

  // Hydrate from storage / auth
  useEffect(() => {
    setAdvisorEnabled(getAdvisorPrefs().enabled)
    const brand = getBranding()
    setFamilyName(brand.familyName ?? "")
    setAccentColor(brand.accentColor ?? "#556b47")
    setNotifPrefs(readNotifPrefs())
  }, [])

  useEffect(() => {
    if (user) {
      const initial = user.displayName || ""
      setName(initial)
      nameSavedRef.current = initial
    }
  }, [user])

  // --- Display name: debounced auto-save ---
  useEffect(() => {
    if (!user) return
    if (name === nameSavedRef.current) return
    if (nameTimerRef.current) clearTimeout(nameTimerRef.current)
    nameTimerRef.current = setTimeout(async () => {
      try {
        await updateUserProfile({ displayName: name })
        nameSavedRef.current = name
        setNamePill(true)
        setTimeout(() => setNamePill(false), 1800)
      } catch {
        toast({ title: "Could not save name", description: "Try again in a moment.", variant: "destructive" })
      }
    }, 400)
    return () => {
      if (nameTimerRef.current) clearTimeout(nameTimerRef.current)
    }
  }, [name, user, updateUserProfile, toast])

  // --- Family name: debounced auto-save ---
  useEffect(() => {
    if (familyName === (getBranding().familyName ?? "")) return
    if (familyTimerRef.current) clearTimeout(familyTimerRef.current)
    familyTimerRef.current = setTimeout(() => {
      setBranding({ familyName })
      setFamilyPill(true)
      setTimeout(() => setFamilyPill(false), 1800)
    }, 400)
    return () => {
      if (familyTimerRef.current) clearTimeout(familyTimerRef.current)
    }
  }, [familyName])

  // --- Toggle helper with Undo ---
  const toggleAdvisor = useCallback(
    (next: boolean) => {
      const prev = advisorEnabled
      setAdvisorEnabled(next)
      setAdvisorPrefs({ enabled: next })
      toast({
        title: next ? "Advisor on" : "Advisor off",
        description: next
          ? "You'll see the Advisor button on the teach screen."
          : "Hidden again — no requests are sent.",
        action: (
          <ToastAction
            altText="Undo advisor toggle"
            onClick={() => {
              setAdvisorEnabled(prev)
              setAdvisorPrefs({ enabled: prev })
            }}
          >
            Undo
          </ToastAction>
        ),
      })
    },
    [advisorEnabled, toast],
  )

  const updateNotif = useCallback(
    (key: keyof NotifPrefs, next: boolean) => {
      const prev = notifPrefs
      const updated = { ...notifPrefs, [key]: next }
      setNotifPrefs(updated)
      writeNotifPrefs(updated)
      toast({
        title: next ? "Notification on" : "Notification off",
        action: (
          <ToastAction
            altText="Undo notification toggle"
            onClick={() => {
              setNotifPrefs(prev)
              writeNotifPrefs(prev)
            }}
          >
            Undo
          </ToastAction>
        ),
      })
    },
    [notifPrefs, toast],
  )

  const chooseAccent = useCallback(
    (next: string) => {
      const prev = accentColor
      setAccentColor(next)
      setBranding({ accentColor: next })
      toast({
        title: "Accent color updated",
        action: (
          <ToastAction
            altText="Undo accent color"
            onClick={() => {
              setAccentColor(prev)
              setBranding({ accentColor: prev })
            }}
          >
            Undo
          </ToastAction>
        ),
      })
    },
    [accentColor, toast],
  )

  const chooseTheme = useCallback(
    (next: string) => {
      const prev = theme ?? "system"
      setTheme(next)
      toast({
        title: `Theme: ${next}`,
        action: (
          <ToastAction altText="Undo theme" onClick={() => setTheme(prev)}>
            Undo
          </ToastAction>
        ),
      })
    },
    [theme, setTheme, toast],
  )

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch {
      toast({ title: "Error", description: "Failed to sign out.", variant: "destructive" })
    }
  }

  const sections = useMemo(
    () => [
      { id: "account", label: "Account", icon: User },
      { id: "appearance", label: "Appearance", icon: Sun },
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "compliance", label: "Compliance", icon: CalendarDays, external: "/settings/compliance" },
    ],
    [],
  )

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
              Changes save automatically. Toggles show an Undo for five seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
            <nav
              aria-label="Settings sections"
              className="md:sticky md:top-20 md:h-fit flex md:flex-col gap-1 overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0"
            >
              {sections.map((s) => {
                const Icon = s.icon
                const href = s.external ?? `#${s.id}`
                return (
                  <Link
                    key={s.id}
                    href={href}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-[var(--sage-ll)] whitespace-nowrap"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span>{s.label}</span>
                    {s.external && <ChevronRight className="h-3 w-3 ml-auto opacity-60" aria-hidden="true" />}
                  </Link>
                )
              })}
            </nav>

            <div className="space-y-8">
              {/* Account ------------------------------------------------------ */}
              <section id="account" className="space-y-6">
                <header className="flex items-baseline justify-between">
                  <h2 className="font-display text-2xl font-medium flex items-center gap-2">
                    <User className="h-5 w-5" aria-hidden="true" /> Account
                  </h2>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="name">Display name</Label>
                      <SavedPill visible={namePill} />
                    </div>
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
                      value={user?.email ?? ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email can't be changed here.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="familyName">Family name</Label>
                    <SavedPill visible={familyPill} />
                  </div>
                  <Input
                    id="familyName"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value.slice(0, 60))}
                    placeholder="The Dupre Family"
                    className="max-w-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Shown in place of "AtoZ Family" in the topbar when set.
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    <span className="font-medium">Email verification</span>
                    {user?.emailVerified ? (
                      <Badge variant="secondary">Verified</Badge>
                    ) : (
                      <Badge variant="outline">Not verified</Badge>
                    )}
                  </div>
                  {user?.emailVerified ? (
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Optional. Verifying lets you recover your account if you lose access.
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/verify-email">Send verification link</Link>
                      </Button>
                    </>
                  )}
                </div>

                <Separator />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      <Sparkles className="h-4 w-4" aria-hidden="true" /> Advisor
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 max-w-prose">
                      Contextual helper inside the lesson authoring flow. Off by default. Never a
                      global chat — it only sees the lesson you're planning. Requires
                      <code className="px-1">ANTHROPIC_API_KEY</code> on the server.
                    </p>
                  </div>
                  <Switch
                    id="advisor-enabled"
                    aria-label="Enable the advisor"
                    checked={advisorEnabled}
                    onCheckedChange={toggleAdvisor}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="font-medium">Password</div>
                  <p className="text-sm text-muted-foreground">
                    To change your password, use the password reset flow.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/reset-password">Reset password</Link>
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
                    </div>
                    <p className="text-sm text-muted-foreground">Sign out of this device.</p>
                  </div>
                  <Button variant="outline" onClick={handleSignOut}>Sign out</Button>
                </div>
              </section>

              {/* Appearance --------------------------------------------------- */}
              <section id="appearance" className="space-y-6">
                <header>
                  <h2 className="font-display text-2xl font-medium flex items-center gap-2">
                    <Sun className="h-5 w-5" aria-hidden="true" /> Appearance
                  </h2>
                </header>

                <div className="space-y-3">
                  <Label>Accent color</Label>
                  <div className="flex items-center gap-3 flex-wrap">
                    {ACCENT_COLORS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => chooseAccent(value)}
                        className={`h-8 w-8 rounded-full border-2 transition ${
                          accentColor === value
                            ? "border-[var(--ink)] scale-110"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ background: value }}
                        aria-label={`Accent color: ${label}`}
                        aria-pressed={accentColor === value}
                      />
                    ))}
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => chooseAccent(e.target.value)}
                      aria-label="Custom accent color"
                      className="h-8 w-10 rounded border border-[var(--rule)] cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Applied to highlighted actions across the app.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-3 max-w-md">
                    {[
                      { value: "light", label: "Light", bg: "bg-white" },
                      { value: "dark", label: "Dark", bg: "bg-zinc-900" },
                      { value: "system", label: "System", bg: "bg-gradient-to-r from-white to-zinc-900" },
                    ].map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => chooseTheme(t.value)}
                        aria-pressed={theme === t.value}
                        className={`border rounded-md p-2 cursor-pointer transition-colors ${
                          theme === t.value ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50"
                        }`}
                      >
                        <div className={`h-14 ${t.bg} rounded-md border mb-2`} />
                        <div className="text-center text-sm font-medium">{t.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Notifications ----------------------------------------------- */}
              <section id="notifications" className="space-y-4">
                <header>
                  <h2 className="font-display text-2xl font-medium flex items-center gap-2">
                    <Bell className="h-5 w-5" aria-hidden="true" /> Notifications
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    In-app only for now. Email notifications arrive in a later phase.
                  </p>
                </header>

                {(
                  [
                    { key: "resources", label: "New resources in your interests" },
                    { key: "comments", label: "Comments on your resources" },
                    { key: "followers", label: "New followers" },
                    { key: "events", label: "Upcoming events in your area" },
                  ] as const
                ).map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between gap-4">
                    <Label htmlFor={`notif-${key}`}>{label}</Label>
                    <Switch
                      id={`notif-${key}`}
                      aria-label={label}
                      checked={notifPrefs[key]}
                      onCheckedChange={(v) => updateNotif(key, v)}
                    />
                  </div>
                ))}
              </section>

              {/* Compliance link --------------------------------------------- */}
              <section id="compliance" className="space-y-2">
                <header>
                  <h2 className="font-display text-2xl font-medium flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" aria-hidden="true" /> Compliance
                  </h2>
                </header>
                <p className="text-sm text-muted-foreground">
                  State-by-state filings, deadlines, and what you need to keep on file.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/settings/compliance">
                    Open compliance <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
