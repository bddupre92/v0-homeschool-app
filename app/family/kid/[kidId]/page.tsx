"use client"

/**
 * Calm kid view — hours summary + portfolio grid.
 * Deliberately minimal: no scores, no streaks, no "behind by 3 hrs"
 * shaming copy. Rest is learning too.
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Pill,
  KidDot,
  ProgressRail,
  Topbar,
  PhoneBottomNav,
  FAB,
} from "@/components/primitives"
import { TweaksPanel } from "@/components/tweaks-panel"
import LogHoursDialog from "@/components/log-hours-dialog"
import {
  type PortfolioItem,
  listPortfolio,
  onStorageChange,
} from "@/lib/atoz-store"
import { useToast } from "@/hooks/use-toast"

const DEMO_KIDS = [
  { id: "emma", name: "Emma", color: "#d46e4d", weeklyTarget: 17.5 },
  { id: "noah", name: "Noah", color: "#7d9e7d", weeklyTarget: 17.5 },
  { id: "lily", name: "Lily", color: "#df8a27", weeklyTarget: 17.5 },
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

export default function KidPage() {
  const params = useParams<{ kidId: string }>()
  const { toast } = useToast()
  const [logOpen, setLogOpen] = useState(false)
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [weeklyHours, setWeeklyHours] = useState<Record<string, number>>(() => readWeeklyHours())

  const refresh = useCallback(() => {
    setItems(listPortfolio())
    setWeeklyHours(readWeeklyHours())
  }, [])

  useEffect(() => {
    refresh()
    return onStorageChange(refresh)
  }, [refresh])

  const kid = DEMO_KIDS.find((k) => k.id === params?.kidId)
  const kidItems = useMemo(
    () => (kid ? items.filter((i) => i.kidId === kid.id) : []),
    [items, kid],
  )

  if (!kid) {
    return (
      <div className="min-h-screen bg-[var(--linen)] text-[var(--ink)] font-sans">
        <Topbar onLogHours={() => setLogOpen(true)} />
        <main className="atoz-page">
          <h1 className="font-display text-3xl font-light">That kid isn&apos;t here.</h1>
          <p className="mt-2 text-[var(--ink-3)]">
            Try one of: <Link className="underline" href="/family/kid/emma">Emma</Link>,{" "}
            <Link className="underline" href="/family/kid/noah">Noah</Link>,{" "}
            <Link className="underline" href="/family/kid/lily">Lily</Link>
          </p>
        </main>
      </div>
    )
  }

  const hours = weeklyHours[kid.id] ?? 0
  const pct = Math.min(100, Math.round((hours / kid.weeklyTarget) * 100))
  const totalMinutes = kidItems.reduce((s, i) => s + (i.minutes ?? 0), 0)

  // Group portfolio by date (most recent first)
  const groups = useMemo(() => {
    const byDate = new Map<string, PortfolioItem[]>()
    for (const item of kidItems) {
      const list = byDate.get(item.date) ?? []
      list.push(item)
      byDate.set(item.date, list)
    }
    return Array.from(byDate.entries()).sort(([a], [b]) => (a > b ? -1 : 1))
  }, [kidItems])

  return (
    <div className="min-h-screen bg-[var(--linen)] text-[var(--ink)] font-sans">
      <Topbar onLogHours={() => setLogOpen(true)} />
      <main className="atoz-page">
        <div className="text-xs text-[var(--ink-3)] mb-2">
          <Link href="/today" className="hover:text-[var(--ink)]">← Today</Link>
          <span className="mx-1">·</span>
          <span>Family</span>
          <span className="mx-1">·</span>
          <span>{kid.name}</span>
        </div>

        <header className="atoz-hero flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <KidDot name={kid.name} color={kid.color} size="lg" />
            <div>
              <div className="atoz-eyebrow">{kid.name}&apos;s portfolio</div>
              <h1>{kid.name}.</h1>
              <p className="text-[var(--ink-2)]">
                {kidItems.length} saved item{kidItems.length === 1 ? "" : "s"} · {totalMinutes} minutes captured.
              </p>
            </div>
          </div>
        </header>

        <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="atoz-mini-card">
            <div className="text-xs text-[var(--ink-3)] mb-1">This week</div>
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="font-display text-[28px] font-normal tracking-tight">{hours}</span>{" "}
                <span className="text-[var(--ink-3)] text-sm">of {kid.weeklyTarget} hrs</span>
              </div>
              <Pill variant={pct >= 100 ? "sage" : "honey"}>{pct}%</Pill>
            </div>
            <ProgressRail value={pct} tone={pct >= 100 ? "sage" : pct >= 60 ? "honey" : "terracotta"} />
          </div>
          <div className="atoz-mini-card">
            <div className="text-xs text-[var(--ink-3)] mb-1">Portfolio items</div>
            <div className="font-display text-[28px] font-normal tracking-tight">
              {kidItems.length}
            </div>
            <div className="text-xs text-[var(--ink-3)] mt-1">
              {kidItems.length === 0 ? "Nothing saved yet — start a lesson." : "Saved from teach sessions."}
            </div>
          </div>
          <div className="atoz-mini-card">
            <div className="text-xs text-[var(--ink-3)] mb-1">Subjects touched</div>
            <div className="font-display text-[28px] font-normal tracking-tight">
              {new Set(kidItems.map((i) => i.subject)).size}
            </div>
            <div className="text-xs text-[var(--ink-3)] mt-1">
              {Array.from(new Set(kidItems.map((i) => i.subject))).slice(0, 5).join(" · ") || "—"}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-2xl font-medium">Portfolio</h2>
            <Link href="/teach" className="text-sm text-[var(--ink-3)] hover:text-[var(--ink)]">
              Teach a lesson →
            </Link>
          </div>
          {groups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--rule)] p-8 text-sm text-[var(--ink-3)] bg-white/40">
              Nothing saved yet. Items land here after a teach session ends with &ldquo;Save to portfolio&rdquo;.
              <div className="mt-3">
                <Link
                  href="/teach"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-[var(--sage-dd)] text-white"
                >
                  Go to Teach →
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {groups.map(([date, items]) => (
                <div key={date}>
                  <div className="atoz-eyebrow mb-2">
                    {new Date(date).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((item) => (
                      <li key={item.id} className="atoz-mini-card">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: kid.color }}
                            aria-hidden="true"
                          />
                          <span className="font-medium text-sm">{item.title || "Lesson"}</span>
                        </div>
                        <div className="text-xs text-[var(--ink-3)] mb-2">
                          {item.subject} · {item.minutes} min
                          {item.rating && <> · {item.rating}</>}
                        </div>
                        {item.photoUrls.length > 0 && (
                          <div className="flex gap-1 flex-wrap mb-2">
                            {item.photoUrls.slice(0, 4).map((u, i) => (
                              <img
                                key={i}
                                src={u}
                                alt=""
                                className="w-14 h-14 object-cover rounded-lg border border-[var(--rule)]"
                              />
                            ))}
                          </div>
                        )}
                        {item.quote && (
                          <p className="atoz-quote !text-[15px] mb-2">&ldquo;{item.quote}&rdquo;</p>
                        )}
                        {item.narration && (
                          <p className="text-sm text-[var(--ink-2)] italic">{item.narration}</p>
                        )}
                        {item.notes.length > 0 && (
                          <ul className="mt-2 text-xs text-[var(--ink-3)] space-y-0.5">
                            {item.notes.slice(0, 3).map((n, i) => (
                              <li key={i}>· {n}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <LogHoursDialog
        open={logOpen}
        onOpenChange={setLogOpen}
        children={DEMO_KIDS}
        defaultKidId={kid.id}
        onSubmit={() => toast({ title: "Logged", description: "Entry saved." })}
      />
      <FAB onClick={() => setLogOpen(true)} />
      <PhoneBottomNav />
      <TweaksPanel />
    </div>
  )
}
