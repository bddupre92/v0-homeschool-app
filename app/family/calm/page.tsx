"use client"

/**
 * Calm Family room — kid grid + links to People and Portfolio.
 * The legacy /family page continues to run its own implementation.
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import {
  Pill,
  KidDot,
  ProgressRail,
} from "@/components/primitives"
import {
  listPortfolio,
  listMemberships,
  onStorageChange,
} from "@/lib/atoz-store"
import { useToast } from "@/hooks/use-toast"
import { Users, ArrowRight } from "lucide-react"

const DEMO_KIDS = [
  { id: "emma", name: "Emma", color: "#d46e4d", weeklyTarget: 17.5, age: 9 },
  { id: "noah", name: "Noah", color: "#7d9e7d", weeklyTarget: 17.5, age: 7 },
  { id: "lily", name: "Lily", color: "#df8a27", weeklyTarget: 17.5, age: 5 },
]

const WEEKLY_HOURS_LOCAL_KEY = "atoz.demoWeeklyHours"

function readWeeklyHours(): Record<string, number> {
  if (typeof window === "undefined") return { emma: 14.5, noah: 12, lily: 9.5 }
  try {
    const raw = localStorage.getItem(WEEKLY_HOURS_LOCAL_KEY)
    return raw ? JSON.parse(raw) : { emma: 14.5, noah: 12, lily: 9.5 }
  } catch {
    return { emma: 14.5, noah: 12, lily: 9.5 }
  }
}

export default function CalmFamilyPage() {
  const [portfolioCount, setPortfolioCount] = useState<Record<string, number>>({})
  const [membersCount, setMembersCount] = useState(1)
  const [weeklyHours, setWeeklyHours] = useState<Record<string, number>>(() => readWeeklyHours())

  const refresh = useCallback(() => {
    const items = listPortfolio()
    const counts: Record<string, number> = {}
    for (const item of items) counts[item.kidId] = (counts[item.kidId] ?? 0) + 1
    setPortfolioCount(counts)
    setMembersCount(1 + listMemberships().length)
    setWeeklyHours(readWeeklyHours())
  }, [])

  useEffect(() => {
    refresh()
    return onStorageChange(refresh)
  }, [refresh])

  return (
    <div className="min-h-screen bg-[var(--linen)] text-[var(--ink)] font-sans">
      <Navigation />
      <main className="atoz-page">
        <header className="atoz-hero flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="atoz-eyebrow">Family</div>
            <h1>Your people.</h1>
            <p className="text-[var(--ink-2)] max-w-[520px]">
              Kids, parents, helpers. Tap a kid to see their portfolio and hours.
            </p>
          </div>
          <Link
            href="/people"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--rule)] bg-white hover:bg-[var(--sage-ll)] text-sm font-medium"
          >
            <Users size={14} /> People · {membersCount}
          </Link>
        </header>

        <section>
          <div className="atoz-eyebrow mb-4">Kids</div>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMO_KIDS.map((kid) => {
              const hours = weeklyHours[kid.id] ?? 0
              const pct = Math.min(100, Math.round((hours / kid.weeklyTarget) * 100))
              const items = portfolioCount[kid.id] ?? 0
              return (
                <li key={kid.id}>
                  <Link
                    href={`/family/kid/${kid.id}`}
                    className="atoz-mini-card block hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <KidDot name={kid.name} color={kid.color} size="lg" />
                      <div>
                        <div className="font-display text-xl">{kid.name}</div>
                        <div className="text-xs text-[var(--ink-3)]">Age {kid.age}</div>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between mb-2">
                      <div className="text-xs text-[var(--ink-3)]">This week</div>
                      <Pill variant={pct >= 100 ? "sage" : "honey"}>{pct}%</Pill>
                    </div>
                    <div className="mb-2">
                      <span className="font-display text-xl font-normal tracking-tight">{hours}</span>{" "}
                      <span className="text-[var(--ink-3)] text-sm">of {kid.weeklyTarget} hrs</span>
                    </div>
                    <ProgressRail value={pct} tone={pct >= 100 ? "sage" : pct >= 60 ? "honey" : "terracotta"} />
                    <div className="mt-3 flex items-center justify-between text-xs text-[var(--ink-3)]">
                      <span>{items} portfolio item{items === 1 ? "" : "s"}</span>
                      <span className="text-[var(--sage-dd)] font-medium inline-flex items-center gap-1">
                        Open <ArrowRight size={12} />
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="mt-10">
          <div className="rounded-xl border border-dashed border-[var(--rule)] bg-white/40 p-5 text-sm text-[var(--ink-3)]">
            Adding or editing kids currently happens on the legacy{" "}
            <Link className="underline" href="/family">
              Family admin page
            </Link>
            . That screen will migrate to this calm shell next.
          </div>
        </section>
      </main>

    </div>
  )
}
