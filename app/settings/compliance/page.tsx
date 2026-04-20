"use client"

/**
 * Compliance settings — shows the user's state's filing deadlines
 * and lets them pick or change their state. All dates come from
 * lib/compliance (hand-curated stubs, pending legal review).
 */

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getOnboarding, setOnboarding } from "@/lib/atoz-store"
import {
  daysUntil,
  getStateCompliance,
  nextFiling,
  type ComplianceFiling,
  type StateCompliance,
} from "@/lib/compliance"
import { AlertCircle, ArrowLeft, CalendarDays, CheckCircle2, ExternalLink } from "lucide-react"

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

export default function ComplianceSettingsPage() {
  const { toast } = useToast()
  const [stateAbbr, setStateAbbr] = useState<string>("")
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const ob = getOnboarding()
    setStateAbbr(ob.state ?? "")
    setHydrated(true)
  }, [])

  const profile: StateCompliance | null = useMemo(
    () => (stateAbbr ? getStateCompliance(stateAbbr) : null),
    [stateAbbr],
  )
  const next = useMemo(() => (stateAbbr ? nextFiling(stateAbbr) : null), [stateAbbr])

  const persistState = (abbr: string) => {
    setStateAbbr(abbr)
    setOnboarding({ state: abbr || undefined })
    toast({
      title: "State updated",
      description: abbr ? "Compliance countdown will reflect your new state." : "State cleared.",
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--linen)] text-[var(--ink)]">
      <Navigation />
      <main className="flex-1 atoz-page max-w-3xl">
        <div className="mb-4">
          <Link
            href="/settings"
            className="text-xs text-[var(--ink-3)] hover:text-[var(--ink)] inline-flex items-center gap-1"
          >
            <ArrowLeft size={12} aria-hidden="true" /> Settings
          </Link>
        </div>

        <header className="mb-8">
          <div className="atoz-eyebrow">Compliance</div>
          <h1 className="font-display text-4xl md:text-5xl font-light tracking-tighter mt-2">
            Filings and deadlines.
          </h1>
          <p className="text-[var(--ink-2)] mt-2 max-w-[540px]">
            A calm reminder of what your state expects. These dates are starting points — always
            verify with your state's education department before you file.
          </p>
        </header>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" aria-hidden="true" />
              Your state
            </CardTitle>
            <CardDescription>
              Pick or change your state. We store this on your device only.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select value={stateAbbr} onValueChange={persistState}>
                <SelectTrigger id="state" className="max-w-xs">
                  <SelectValue placeholder="Choose a state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((s) => (
                    <SelectItem key={s.abbr} value={s.abbr}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {hydrated && stateAbbr && !profile && (
              <div className="rounded-lg border border-[var(--honey-l)] bg-[var(--honey-ll)] text-[var(--honey-d)] p-3 text-sm flex items-start gap-2">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  A curated guide for {stateAbbr} isn't available yet. We'll surface deadlines as
                  soon as it's reviewed. For now, check your state education department's site.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {profile && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{profile.name}</CardTitle>
                <CardDescription>{profile.summary}</CardDescription>
              </CardHeader>
              <CardContent>
                {profile.filings.length === 0 ? (
                  <div className="flex items-start gap-2 text-sm text-[var(--ink-2)]">
                    <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-[var(--sage-d)]" aria-hidden="true" />
                    <div>
                      No mandatory filings to schedule. Keep a portfolio of the subjects listed
                      above so you're ready if the state asks.
                    </div>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {profile.filings.map((f, i) => (
                      <FilingRow
                        key={`${f.type}-${i}`}
                        filing={f}
                        highlight={
                          next?.filing.type === f.type && next?.filing.label === f.label
                        }
                      />
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <p className="text-xs text-[var(--ink-4)]">
              These dates are community-curated and pending legal review. Always verify with your
              state's education department before you file. {" "}
              <Link
                href="https://hslda.org/legal"
                target="_blank"
                rel="noopener noreferrer"
                className="underline inline-flex items-center gap-1"
              >
                HSLDA state resources <ExternalLink size={10} aria-hidden="true" />
              </Link>
            </p>
          </>
        )}
      </main>
    </div>
  )
}

function FilingRow({ filing, highlight }: { filing: ComplianceFiling; highlight?: boolean }) {
  const due = useMemo(() => {
    if (filing.date) return new Date(filing.date)
    if (filing.recurring) {
      const [m, d] = filing.recurring.split("-").map(Number)
      const now = new Date()
      let candidate = new Date(now.getFullYear(), m - 1, d)
      if (candidate < now) candidate = new Date(now.getFullYear() + 1, m - 1, d)
      return candidate
    }
    return null
  }, [filing])

  const days = due ? daysUntil(due) : null
  const label = due?.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

  return (
    <li
      className={`rounded-lg border p-3 ${
        highlight
          ? "border-[var(--sage-d)] bg-[var(--sage-ll)]"
          : "border-[var(--rule)] bg-white"
      }`}
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <div className="font-medium text-sm">{filing.label}</div>
          {filing.note && (
            <div className="text-xs text-[var(--ink-3)] mt-1">{filing.note}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {highlight && <Badge variant="secondary">Next</Badge>}
          {label && <span className="text-sm text-[var(--ink-2)]">{label}</span>}
          {days !== null && (
            <span className="text-xs text-[var(--ink-3)]">
              {days <= 0 ? "due today" : days === 1 ? "1 day" : `${days} days`}
            </span>
          )}
        </div>
      </div>
    </li>
  )
}
