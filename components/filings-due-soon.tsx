"use client"

/**
 * /today "Filings due soon" card.
 *
 * Calm dashboard surface: shows the next 4 compliance deadlines for the
 * user's onboarding state, marked with their already-filed status. No
 * red banners, no countdown timers — just a quiet hint with a one-tap
 * "Generate" link. Hides itself entirely when the user hasn't picked a
 * state in onboarding, or when no deadlines exist for the picked state.
 */

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText } from "lucide-react"
import { Pill } from "@/components/primitives"
import {
  getUpcomingFilingDeadlines,
  type UpcomingFilingItem,
} from "@/app/actions/filings-actions"
import { getOnboarding } from "@/lib/atoz-store"
import { daysUntil } from "@/lib/compliance/filings/deadlines"
import type { FilingSnapshot } from "@/lib/compliance/filings"

const STATE_SUPPORTED: Record<string, FilingSnapshot["state"]> = {
  NY: "ny",
  PA: "pa",
  MA: "ma",
  OR: "or",
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function urgencyLabel(date: string): { label: string; tone: "neutral" | "warn" } {
  const d = daysUntil(date)
  if (d < 0) return { label: "Past due", tone: "warn" }
  if (d === 0) return { label: "Today", tone: "warn" }
  if (d <= 14) return { label: `${d} days`, tone: "warn" }
  if (d <= 60) return { label: `${d} days`, tone: "neutral" }
  return { label: formatDate(date), tone: "neutral" }
}

export default function FilingsDueSoon() {
  const [items, setItems] = useState<UpcomingFilingItem[] | null>(null)
  const [stateCode, setStateCode] = useState<FilingSnapshot["state"] | null>(null)

  useEffect(() => {
    const onboarding = getOnboarding()
    const raw = (onboarding.state || "").toUpperCase()
    const code = STATE_SUPPORTED[raw]
    if (!code) {
      setItems([])
      return
    }
    setStateCode(code)
    let cancelled = false
    ;(async () => {
      const result = await getUpcomingFilingDeadlines(code)
      if (cancelled) return
      setItems(result.items)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!items || items.length === 0 || !stateCode) return null

  return (
    <section
      className="rounded-2xl border border-[var(--rule)] bg-white p-5"
      aria-label={`Upcoming ${stateCode.toUpperCase()} filings`}
    >
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <h2 className="font-display text-lg font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Filings due soon · {stateCode.toUpperCase()}
        </h2>
        <Link
          href="/filings"
          className="text-xs text-[var(--ink-3)] hover:text-[var(--ink)]"
        >
          All filings →
        </Link>
      </div>
      <ul className="space-y-2">
        {items.map((item) => {
          const urgency = urgencyLabel(item.date)
          return (
            <li
              key={`${item.filingType}-${item.date}`}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.label}</div>
                <div className="text-xs text-[var(--ink-3)]">
                  {formatDate(item.date)}
                  {item.appliesToGrades?.length
                    ? ` · grades ${item.appliesToGrades.join("/")}`
                    : ""}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.submitted ? (
                  <Pill variant="sage">Submitted</Pill>
                ) : item.filingId ? (
                  <Pill>Drafted</Pill>
                ) : (
                  <Pill variant={urgency.tone === "warn" ? "terracotta" : undefined}>
                    {urgency.label}
                  </Pill>
                )}
                {item.submitted ? null : (
                  <Link
                    href={item.filingId ? `/filings` : `/filings/new`}
                    className="text-xs font-semibold text-[var(--sage-dd)] hover:text-[var(--ink)]"
                  >
                    {item.filingId ? "Open" : "Generate"}
                  </Link>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      <p className="text-xs text-[var(--ink-4)] mt-3">
        Dates are statutory anchors. Confirm with your{" "}
        {stateCode === "pa"
          ? "evaluator + district"
          : stateCode === "ny"
            ? "school district"
            : stateCode === "ma"
              ? "school committee"
              : "ESD"}{" "}
        — they may set their own specifics.
      </p>
    </section>
  )
}
