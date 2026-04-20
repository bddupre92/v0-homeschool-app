"use client"

/**
 * Onboarding — three short steps a first-time signup completes before
 * landing in /today. Welcome → pick state → add first learner. State
 * is stored for Phase 4 compliance guides.
 */

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getOnboarding,
  listKids,
  newDraftKid,
  resetKids,
  setOnboarding,
  upsertKid,
} from "@/lib/atoz-store"
import { AnalyticsEvents, trackEvent } from "@/lib/analytics"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { ArrowRight, ChevronLeft, Home } from "lucide-react"

const US_STATES: { abbr: string; name: string }[] = [
  { abbr: "AL", name: "Alabama" }, { abbr: "AK", name: "Alaska" }, { abbr: "AZ", name: "Arizona" },
  { abbr: "AR", name: "Arkansas" }, { abbr: "CA", name: "California" }, { abbr: "CO", name: "Colorado" },
  { abbr: "CT", name: "Connecticut" }, { abbr: "DE", name: "Delaware" }, { abbr: "DC", name: "District of Columbia" },
  { abbr: "FL", name: "Florida" }, { abbr: "GA", name: "Georgia" }, { abbr: "HI", name: "Hawaii" },
  { abbr: "ID", name: "Idaho" }, { abbr: "IL", name: "Illinois" }, { abbr: "IN", name: "Indiana" },
  { abbr: "IA", name: "Iowa" }, { abbr: "KS", name: "Kansas" }, { abbr: "KY", name: "Kentucky" },
  { abbr: "LA", name: "Louisiana" }, { abbr: "ME", name: "Maine" }, { abbr: "MD", name: "Maryland" },
  { abbr: "MA", name: "Massachusetts" }, { abbr: "MI", name: "Michigan" }, { abbr: "MN", name: "Minnesota" },
  { abbr: "MS", name: "Mississippi" }, { abbr: "MO", name: "Missouri" }, { abbr: "MT", name: "Montana" },
  { abbr: "NE", name: "Nebraska" }, { abbr: "NV", name: "Nevada" }, { abbr: "NH", name: "New Hampshire" },
  { abbr: "NJ", name: "New Jersey" }, { abbr: "NM", name: "New Mexico" }, { abbr: "NY", name: "New York" },
  { abbr: "NC", name: "North Carolina" }, { abbr: "ND", name: "North Dakota" }, { abbr: "OH", name: "Ohio" },
  { abbr: "OK", name: "Oklahoma" }, { abbr: "OR", name: "Oregon" }, { abbr: "PA", name: "Pennsylvania" },
  { abbr: "RI", name: "Rhode Island" }, { abbr: "SC", name: "South Carolina" }, { abbr: "SD", name: "South Dakota" },
  { abbr: "TN", name: "Tennessee" }, { abbr: "TX", name: "Texas" }, { abbr: "UT", name: "Utah" },
  { abbr: "VT", name: "Vermont" }, { abbr: "VA", name: "Virginia" }, { abbr: "WA", name: "Washington" },
  { abbr: "WV", name: "West Virginia" }, { abbr: "WI", name: "Wisconsin" }, { abbr: "WY", name: "Wyoming" },
]

const KID_COLORS = ["#d46e4d", "#7d9e7d", "#df8a27", "#6b8caf", "#9b7fbf", "#c07b7b"]

type Step = 1 | 2 | 3

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [step, setStep] = useState<Step>(1)
  const [state, setState] = useState<string>("")
  const [kidName, setKidName] = useState("")
  const [kidAge, setKidAge] = useState<string>("")
  const [kidColor, setKidColor] = useState(KID_COLORS[0])

  // If onboarding was already completed, send the user to today.
  useEffect(() => {
    if (typeof window === "undefined") return
    if (getOnboarding().completed) {
      router.replace("/today")
    }
  }, [router])

  const firstName = (user?.displayName || "").split(" ")[0] || "friend"

  const next = () => setStep((s) => (Math.min(3, s + 1) as Step))
  const back = () => setStep((s) => (Math.max(1, s - 1) as Step))

  const finish = () => {
    if (!kidName.trim()) {
      toast({ title: "Name your first learner", variant: "destructive" })
      return
    }
    // Clear any auto-seeded demo kids so the new user starts clean.
    resetKids()
    const kid = newDraftKid({
      name: kidName.trim(),
      age: kidAge ? Number(kidAge) : undefined,
      color: kidColor,
      weeklyTarget: 17.5,
    })
    upsertKid(kid)
    setOnboarding({
      completed: true,
      state: state || undefined,
      completedAt: new Date().toISOString(),
    })
    trackEvent(AnalyticsEvents.KID_ADDED, { context: "onboarding" })
    trackEvent(AnalyticsEvents.ONBOARDING_COMPLETED, { hasState: Boolean(state) })
    toast({ title: "Welcome aboard", description: `${kid.name} is ready to start.` })
    router.replace("/today")
  }

  const skip = () => {
    setOnboarding({ completed: true, completedAt: new Date().toISOString() })
    trackEvent(AnalyticsEvents.ONBOARDING_COMPLETED, { skipped: true })
    router.replace("/today")
  }

  return (
    <div className="min-h-screen bg-[var(--linen)] text-[var(--ink)] font-sans flex flex-col">
      <header className="border-b border-[var(--rule)] bg-white/70">
        <div className="atoz-topbar__inner">
          <Link href="/today" className="atoz-brand">
            <span className="atoz-brand-mark">A</span>
            <span>AtoZ Family</span>
          </Link>
          <div className="ml-auto text-xs text-[var(--ink-3)]">Step {step} of 3</div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-2">
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={`h-1 flex-1 rounded-full transition ${
                  step >= n ? "bg-[var(--sage-dd)]" : "bg-[var(--rule)]"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>

          {step === 1 && (
            <section className="space-y-6">
              <div>
                <div className="atoz-eyebrow">Welcome</div>
                <h1 className="font-display text-4xl font-light tracking-tighter mt-2">
                  Hi, {firstName}.
                </h1>
                <p className="text-[var(--ink-2)] mt-3">
                  AtoZ Family is a calm home for your homeschool. Plan, teach, capture, and rest.
                  No streaks, no leaderboards — just the work your family is already doing.
                </p>
              </div>
              <p className="text-sm text-[var(--ink-3)]">
                Two quick questions, then Today is yours.
              </p>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={skip}>Skip</Button>
                <Button onClick={next}>
                  Continue <ArrowRight size={14} className="ml-1" aria-hidden="true" />
                </Button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-6">
              <div>
                <div className="atoz-eyebrow">Your state</div>
                <h1 className="font-display text-3xl font-light tracking-tighter mt-2">
                  Where do you homeschool?
                </h1>
                <p className="text-[var(--ink-2)] mt-3">
                  Filing rules and required hours vary by state. Pick yours so we can surface the
                  right reminders. You can change it later in Settings.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State (optional)</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Choose a state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((s) => (
                      <SelectItem key={s.abbr} value={s.abbr}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={back}>
                  <ChevronLeft size={14} className="mr-1" aria-hidden="true" /> Back
                </Button>
                <Button onClick={next}>
                  Continue <ArrowRight size={14} className="ml-1" aria-hidden="true" />
                </Button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-6">
              <div>
                <div className="atoz-eyebrow">Your first learner</div>
                <h1 className="font-display text-3xl font-light tracking-tighter mt-2">
                  Who are we planning for?
                </h1>
                <p className="text-[var(--ink-2)] mt-3">
                  You can add more learners later on the Family page.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kid-name">Name</Label>
                  <Input
                    id="kid-name"
                    value={kidName}
                    onChange={(e) => setKidName(e.target.value)}
                    placeholder="Emma"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kid-age">Age (optional)</Label>
                  <Input
                    id="kid-age"
                    type="number"
                    min={0}
                    max={25}
                    value={kidAge}
                    onChange={(e) => setKidAge(e.target.value)}
                    placeholder="7"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {KID_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setKidColor(c)}
                        className={`h-8 w-8 rounded-full border-2 transition ${
                          kidColor === c ? "border-[var(--ink)] scale-110" : "border-transparent"
                        }`}
                        style={{ background: c }}
                        aria-label={`Pick color ${c}`}
                        aria-pressed={kidColor === c}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={back}>
                  <ChevronLeft size={14} className="mr-1" aria-hidden="true" /> Back
                </Button>
                <Button onClick={finish}>
                  <Home size={14} className="mr-1" aria-hidden="true" /> Enter Today
                </Button>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
