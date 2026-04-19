"use client"

/**
 * Today — the calm daily landing.
 * Hero greeting, per-kid weekly progress (if compliance is on),
 * today's lessons, most recent portfolio glimpse, FAB for quick log.
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import {
  Pill,
  KidDot,
  ProgressRail,
  ComplianceStrip,
} from "@/components/primitives"
import {
  type Lesson,
  type LessonSession,
  type PortfolioItem,
  listLessons,
  listPortfolio,
  listSessions,
  onStorageChange,
  startSession,
} from "@/lib/atoz-store"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Play, Sparkle } from "lucide-react"

const DEMO_KIDS = [
  { id: "emma", name: "Emma", color: "#d46e4d", weeklyTarget: 17.5 },
  { id: "noah", name: "Noah", color: "#7d9e7d", weeklyTarget: 17.5 },
  { id: "lily", name: "Lily", color: "#df8a27", weeklyTarget: 17.5 },
]

const COMPLIANCE_KEY = "atoz.complianceMode"
const WEEKLY_HOURS_LOCAL_KEY = "atoz.demoWeeklyHours"

function demoWeeklyHours(): Record<string, number> {
  // Lightweight demo numbers that prove the progress bars work without
  // requiring any real logs. Stored in localStorage so Undo works.
  if (typeof window === "undefined") return { emma: 14.5, noah: 12, lily: 9.5 }
  try {
    const raw = localStorage.getItem(WEEKLY_HOURS_LOCAL_KEY)
    return raw ? JSON.parse(raw) : { emma: 14.5, noah: 12, lily: 9.5 }
  } catch {
    return { emma: 14.5, noah: 12, lily: 9.5 }
  }
}

function saveWeeklyHours(next: Record<string, number>): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(WEEKLY_HOURS_LOCAL_KEY, JSON.stringify(next))
  } catch {}
}

function greetingFor(): string {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

function sameLocalDay(iso: string, day: Date): boolean {
  const d = new Date(iso)
  return (
    d.getFullYear() === day.getFullYear() &&
    d.getMonth() === day.getMonth() &&
    d.getDate() === day.getDate()
  )
}

export default function TodayPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [sessions, setSessions] = useState<LessonSession[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [weeklyHours, setWeeklyHours] = useState<Record<string, number>>(() => demoWeeklyHours())
  const [complianceOn, setComplianceOn] = useState<boolean>(false)

  const refresh = useCallback(() => {
    setLessons(listLessons())
    setSessions(listSessions())
    setPortfolio(listPortfolio())
    setWeeklyHours(demoWeeklyHours())
  }, [])

  useEffect(() => {
    refresh()
    if (typeof window !== "undefined") {
      setComplianceOn(localStorage.getItem(COMPLIANCE_KEY) === "on")
    }
    return onStorageChange(refresh)
  }, [refresh])

  const today = new Date()
  const scheduledToday = useMemo(
    () =>
      lessons
        .filter((l) => l.status === "scheduled" && l.scheduledFor && sameLocalDay(l.scheduledFor, today))
        .sort((a, b) => (a.scheduledFor! < b.scheduledFor! ? -1 : 1)),
    [lessons, today],
  )

  const completedSessionIdsToday = useMemo(
    () =>
      new Set(
        sessions
          .filter((s) => s.endedAt && sameLocalDay(s.endedAt, today))
          .map((s) => s.lessonId),
      ),
    [sessions, today],
  )

  const doneCount = scheduledToday.filter((l) => completedSessionIdsToday.has(l.id)).length

  const recentPortfolio = useMemo(() => portfolio.slice(0, 3), [portfolio])

  const toggleCompliance = () => {
    const next = !complianceOn
    setComplianceOn(next)
    if (typeof window !== "undefined") {
      localStorage.setItem(COMPLIANCE_KEY, next ? "on" : "off")
    }
    toast({
      title: next ? "Compliance tracking on" : "Compliance tracking off",
      description: next
        ? "We'll show weekly totals. Turn off anytime in settings."
        : "Toasts only from now on — no week math visible.",
    })
  }

  const startTeach = (lesson: Lesson) => {
    const session = startSession(lesson.id)
    router.push(`/teach/${session.id}`)
  }

  const dateEyebrow = today.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })

  return (
    <div className="min-h-screen bg-[var(--linen)] text-[var(--ink)] font-sans">
      <Navigation />
      <main className="atoz-page">
        <section className="atoz-hero">
          <div className="atoz-eyebrow">{dateEyebrow}</div>
          <h1>
            {greetingFor()}, <em className="not-italic font-normal text-[var(--sage-dd)]">Rachel</em>.
          </h1>
          <p className="text-[var(--ink-2)] max-w-[540px]">
            {scheduledToday.length === 0 && portfolio.length === 0 ? (
              <>No lessons scheduled today. That's a quiet day — rest is learning too.</>
            ) : (
              <>
                {doneCount} of {scheduledToday.length} lesson{scheduledToday.length === 1 ? "" : "s"} done.
                {scheduledToday.length > doneCount && scheduledToday[doneCount] && (
                  <> Next up: {scheduledToday[doneCount].title || "a lesson"}.</>
                )}
              </>
            )}
          </p>
        </section>

        {complianceOn ? (
          <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-3">
            {DEMO_KIDS.map((kid) => {
              const hours = weeklyHours[kid.id] ?? 0
              const pct = Math.min(100, Math.round((hours / kid.weeklyTarget) * 100))
              return (
                <div key={kid.id} className="atoz-mini-card">
                  <div className="text-xs text-[var(--ink-3)] mb-1 flex items-center gap-2">
                    <KidDot name={kid.name} color={kid.color} size="xs" />
                    This week · {kid.name}
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="font-display text-[28px] font-normal tracking-tight">{hours}</span>{" "}
                      <span className="text-[var(--ink-3)] text-sm">of {kid.weeklyTarget} hrs</span>
                    </div>
                    <Pill variant={pct >= 100 ? "sage" : "honey"}>{pct}%</Pill>
                  </div>
                  <ProgressRail
                    value={pct}
                    tone={pct >= 100 ? "sage" : pct >= 60 ? "honey" : "terracotta"}
                    label={`${kid.name}'s weekly progress`}
                  />
                </div>
              )
            })}
          </section>
        ) : (
          <section className="mb-8">
            <ComplianceStrip
              tone="honey"
              icon={<Sparkle size={16} aria-hidden="true" />}
              action={
                <button
                  onClick={toggleCompliance}
                  className="text-xs font-semibold underline underline-offset-2 text-[var(--honey-d)]"
                >
                  Turn on
                </button>
              }
            >
              Compliance tracking is off. Turn it on to see weekly totals for each kid.
            </ComplianceStrip>
          </section>
        )}

        <section className="mb-10">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-2xl font-medium">Today's lessons</h2>
            <Link href="/teach" className="text-sm text-[var(--ink-3)] hover:text-[var(--ink)]">
              Manage →
            </Link>
          </div>
          {scheduledToday.length === 0 ? (
            <EmptyHint>
              No lessons scheduled. Head to <Link className="underline" href="/teach">Teach</Link> to author one.
            </EmptyHint>
          ) : (
            <ul className="space-y-2">
              {scheduledToday.map((lesson) => {
                const done = completedSessionIdsToday.has(lesson.id)
                const kid = DEMO_KIDS.find((k) => lesson.kidIds.includes(k.id))
                const time = lesson.scheduledFor
                  ? new Date(lesson.scheduledFor).toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : ""
                return (
                  <li key={lesson.id} className="atoz-lesson-row" data-state={done ? "done" : "open"}>
                    <button
                      className="atoz-lesson-row__check"
                      aria-checked={done}
                      aria-label={done ? "Mark incomplete" : "Mark complete"}
                      role="checkbox"
                      onClick={() => startTeach(lesson)}
                    >
                      {done && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                    </button>
                    {kid && (
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: kid.color }}
                        aria-hidden="true"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="atoz-lesson-row__title truncate">
                        {lesson.title || <em className="text-[var(--ink-3)]">Untitled</em>}
                      </div>
                      <div className="atoz-lesson-row__meta">
                        {time && <span>{time}</span>}
                        {kid && <span>· {kid.name}</span>}
                        {lesson.durationMin && <span>· {lesson.durationMin} min</span>}
                        {lesson.subject && <span>· {lesson.subject}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => startTeach(lesson)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--sage-dd)] hover:text-[var(--ink)]"
                    >
                      <Play size={14} /> Teach
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {recentPortfolio.length > 0 && (
          <section className="mb-10">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-display text-2xl font-medium">Recently saved</h2>
              <span className="text-xs text-[var(--ink-3)]">From teach sessions</span>
            </div>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentPortfolio.map((item) => {
                const kid = DEMO_KIDS.find((k) => k.id === item.kidId)
                return (
                  <li key={item.id} className="atoz-portfolio-item">
                    <div
                      className="atoz-portfolio-thumb"
                      style={{ background: kid?.color ?? "var(--sage-d)" }}
                    >
                      {item.photoUrls[0] ? (
                        <img
                          src={item.photoUrls[0]}
                          alt=""
                          className="w-full h-full object-cover rounded-[10px]"
                        />
                      ) : (
                        kid?.name[0].toUpperCase() ?? "?"
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="atoz-portfolio-title truncate">{item.title || "Lesson"}</div>
                      <div className="text-xs text-[var(--ink-3)] truncate">
                        {item.subject} · {item.date} · {item.minutes} min
                      </div>
                      {item.quote && (
                        <p className="atoz-quote mt-2 !text-sm">&ldquo;{item.quote}&rdquo;</p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        <section className="mt-12 pt-8 border-t border-[var(--rule)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--ink-4)]">
          <div>
            AtoZ Family ·{" "}
            <button
              onClick={toggleCompliance}
              className="underline underline-offset-2 hover:text-[var(--ink)]"
            >
              {complianceOn ? "Turn compliance off" : "Turn compliance on"}
            </button>
          </div>
          <div>
            <Link href="/design-system" className="hover:text-[var(--ink)]">Design system</Link>
          </div>
        </section>
      </main>
    </div>
  )
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--rule)] p-6 text-sm text-[var(--ink-3)] bg-white/40">
      {children}
    </div>
  )
}
