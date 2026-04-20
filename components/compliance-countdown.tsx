"use client"

/**
 * Compliance countdown — calm banner showing the next filing deadline
 * from lib/compliance. Reads the user's state from atoz-store
 * onboarding. Renders nothing if state isn't set or no filings exist.
 */

import { useEffect, useState } from "react"
import { CalendarDays } from "lucide-react"
import { getOnboarding } from "@/lib/atoz-store"
import { daysUntil, nextFiling } from "@/lib/compliance"

export default function ComplianceCountdown() {
  const [stateAbbr, setStateAbbr] = useState<string | undefined>(undefined)
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    const ob = getOnboarding()
    setStateAbbr(ob.state)
    setNow(new Date())
  }, [])

  if (!now) return null
  const next = nextFiling(stateAbbr, now)
  if (!next) return null

  const days = daysUntil(next.due, now)
  const dateLabel = next.due.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
  const tone = days <= 14 ? "urgent" : days <= 60 ? "soon" : "calm"

  return (
    <div
      role="status"
      className={`rounded-xl border px-4 py-3 flex items-center gap-3 text-sm ${
        tone === "urgent"
          ? "border-[var(--terracotta)] bg-[var(--terracotta-ll)] text-[var(--terracotta-d)]"
          : tone === "soon"
            ? "border-[var(--honey-l)] bg-[var(--honey-ll)] text-[var(--honey-d)]"
            : "border-[var(--rule)] bg-white text-[var(--ink-2)]"
      }`}
    >
      <CalendarDays size={16} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <span className="font-medium">Next filing · {next.filing.label}</span>
        <span className="ml-2 text-[var(--ink-3)]">Due {dateLabel}</span>
      </div>
      <span className="text-xs text-[var(--ink-3)] whitespace-nowrap">
        {days <= 0 ? "due today" : days === 1 ? "1 day" : `${days} days`}
      </span>
    </div>
  )
}
