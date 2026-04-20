"use client"

/**
 * Today — the calm daily landing.
 * Three layouts: Agenda (timeline), Per-kid (columns), Compass (this
 * week at a glance). User choice persists in atoz-store.
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
  type TodayLayout,
  getTodayLayout,
  listLessons,
  listPortfolio,
  listSessions,
  onStorageChange,
  setTodayLayout,
  startSession,
} from "@/lib/atoz-store"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { CalendarDays, Compass, LayoutList, Play, Sparkle, Users } from "lucide-react"
import { useKids, readDemoHours, type DemoKid } from "@/lib/demo-kids"
import ComplianceCountdown from "@/components/compliance-countdown"

const COMPLIANCE_KEY = "atoz.complianceMode"

const SUBJECT_ORDER = [
  "Mathematics", "Language Arts", "Science", "History", "Art", "Music", "Physical Education",
]

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

function startOfWeek(d: Date): Date {
  const copy = new Date(d)
  const day = copy.getDay() // 0=Sun
  copy.setHours(0, 0, 0, 0)
  copy.setDate(copy.getDate() - day)
  return copy
}

export default function TodayPage() {
  const router = useRouter()
  const { toast } = useToast()
  const kids = useKids()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [sessions, setSessions] = useState<LessonSession[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [weeklyHours, setWeeklyHours] = useState<Record<string, number>>(() => readDemoHours())
  const [complianceOn, setComplianceOn] = useState<boolean>(false)
  const [layout, setLayout] = useState<TodayLayout>("agenda")

  const refresh = useCallback(() => {
    setLessons(listLessons())
    setSessions(listSessions())
    setPortfolio(listPortfolio())
    setWeeklyHours(readDemoHours())
  }, [])

  useEffect(() => {
    refresh()
    if (typeof window !== "undefined") {
      setComplianceOn(localStorage.getItem(COMPLIANCE_KEY) === "on")
      setLayout(getTodayLayout())
    }
    return onStorageChange(refresh)
  }, [refresh])

  const handleLayoutChange = (next: TodayLayout) => {
    setLayout(next)
    setTodayLayout(next)
  }

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

  const upcomingWeek = useMemo(() => {
    const endOfToday = new Date(today)
    endOfToday.setHours(23, 59, 59, 999)
    const sevenDays = new Date(today)
    sevenDays.setDate(today.getDate() + 7)
    return lessons
      .filter((l) => {
        if (l.status !== "scheduled" || !l.scheduledFor) return false
        const d = new Date(l.scheduledFor)
        return d > endOfToday && d <= sevenDays
      })
      .sort((a, b) => (a.scheduledFor! < b.scheduledFor! ? -1 : 1))
      .slice(0, 3)
  }, [lessons, today])

  // Portfolio-derived per-subject hours for this week (used by Compass view).
  const weekStart = useMemo(() => startOfWeek(today), [today])
  const subjectHoursThisWeek = useMemo(() => {
    const map: Record<string, number> = {}
    for (const item of portfolio) {
      const d = new Date(item.date)
      if (d >= weekStart) {
        map[item.subject] = (map[item.subject] ?? 0) + (item.minutes ?? 0) / 60
      }
    }
    return map
  }, [portfolio, weekStart])

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

        <section className="mb-6">
          <ComplianceCountdown />
        </section>

        {complianceOn ? (
          <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-3">
            {kids.map((kid) => {
              const target = kid.weeklyTarget ?? 17.5
              const hours = weeklyHours[kid.id] ?? 0
              const pct = Math.min(100, Math.round((hours / target) * 100))
              return (
                <div key={kid.id} className="atoz-mini-card">
                  <div className="text-xs text-[var(--ink-3)] mb-1 flex items-center gap-2">
                    <KidDot name={kid.name} color={kid.color} size="xs" />
                    This week · {kid.name}
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="font-display text-[28px] font-normal tracking-tight">{hours}</span>{" "}
                      <span className="text-[var(--ink-3)] text-sm">of {target} hrs</span>
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
          <div className="flex items-baseline justify-between mb-3 flex-wrap gap-3">
            <h2 className="font-display text-2xl font-medium">Today's lessons</h2>
            <div className="flex items-center gap-2">
              <LayoutSwitcher value={layout} onChange={handleLayoutChange} />
              <Link href="/teach" className="text-sm text-[var(--ink-3)] hover:text-[var(--ink)]">
                Manage →
              </Link>
            </div>
          </div>

          {layout === "agenda" && (
            <AgendaView
              lessons={scheduledToday}
              kids={kids}
              doneIds={completedSessionIdsToday}
              onTeach={startTeach}
            />
          )}

          {layout === "per-kid" && (
            <PerKidView
              lessons={scheduledToday}
              kids={kids}
              doneIds={completedSessionIdsToday}
              onTeach={startTeach}
            />
          )}

          {layout === "compass" && (
            <CompassView
              kids={kids}
              weeklyHours={weeklyHours}
              subjectHoursThisWeek={subjectHoursThisWeek}
              scheduledToday={scheduledToday}
            />
          )}
        </section>

        {upcomingWeek.length > 0 && (
          <section className="mb-10">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-display text-2xl font-medium">Coming up</h2>
              <Link href="/library" className="text-sm text-[var(--ink-3)] hover:text-[var(--ink)]">
                All lessons →
              </Link>
            </div>
            <ul className="grid sm:grid-cols-3 gap-3">
              {upcomingWeek.map((lesson) => {
                const kid = kids.find((k) => lesson.kidIds.includes(k.id))
                const when = new Date(lesson.scheduledFor!)
                const dayLabel = when.toLocaleDateString(undefined, { weekday: "short" })
                const timeLabel = when.toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })
                return (
                  <li key={lesson.id} className="atoz-mini-card">
                    <div className="flex items-center gap-2 mb-2">
                      {kid && <KidDot name={kid.name} color={kid.color} size="xs" />}
                      <div className="text-xs text-[var(--ink-3)]">
                        {dayLabel} · {timeLabel}
                      </div>
                    </div>
                    <div className="font-medium text-sm truncate">
                      {lesson.title || <em className="text-[var(--ink-3)]">Untitled</em>}
                    </div>
                    <div className="text-xs text-[var(--ink-3)] mt-1">
                      {lesson.subject ?? "—"}
                      {lesson.durationMin ? ` · ${lesson.durationMin} min` : ""}
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {recentPortfolio.length > 0 && (
          <section className="mb-10">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-display text-2xl font-medium">Recently saved</h2>
              <span className="text-xs text-[var(--ink-3)]">From teach sessions</span>
            </div>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentPortfolio.map((item) => {
                const kid = kids.find((k) => k.id === item.kidId)
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

function LayoutSwitcher({
  value,
  onChange,
}: {
  value: TodayLayout
  onChange: (next: TodayLayout) => void
}) {
  const options: { v: TodayLayout; label: string; icon: typeof LayoutList }[] = [
    { v: "agenda", label: "Agenda", icon: LayoutList },
    { v: "per-kid", label: "Per kid", icon: Users },
    { v: "compass", label: "Compass", icon: Compass },
  ]
  return (
    <div
      role="tablist"
      aria-label="Today layout"
      className="inline-flex items-center rounded-full border border-[var(--rule)] bg-white p-1 text-xs"
    >
      {options.map(({ v, label, icon: Icon }) => {
        const active = value === v
        return (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(v)}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full transition ${
              active
                ? "bg-[var(--sage-ll)] text-[var(--sage-dd)] font-semibold"
                : "text-[var(--ink-3)] hover:text-[var(--ink)]"
            }`}
          >
            <Icon size={12} aria-hidden="true" /> {label}
          </button>
        )
      })}
    </div>
  )
}

function AgendaView({
  lessons,
  kids,
  doneIds,
  onTeach,
}: {
  lessons: Lesson[]
  kids: DemoKid[]
  doneIds: Set<string>
  onTeach: (l: Lesson) => void
}) {
  if (lessons.length === 0) {
    return (
      <EmptyHint>
        No lessons scheduled. Head to <Link className="underline" href="/teach">Teach</Link> to author one.
      </EmptyHint>
    )
  }
  return (
    <ul className="space-y-2">
      {lessons.map((lesson) => {
        const done = doneIds.has(lesson.id)
        const kid = kids.find((k) => lesson.kidIds.includes(k.id))
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
              onClick={() => onTeach(lesson)}
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
              onClick={() => onTeach(lesson)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--sage-dd)] hover:text-[var(--ink)]"
            >
              <Play size={14} aria-hidden="true" /> Teach
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function PerKidView({
  lessons,
  kids,
  doneIds,
  onTeach,
}: {
  lessons: Lesson[]
  kids: DemoKid[]
  doneIds: Set<string>
  onTeach: (l: Lesson) => void
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, Lesson[]>()
    for (const kid of kids) map.set(kid.id, [])
    for (const lesson of lessons) {
      for (const kidId of lesson.kidIds) {
        if (map.has(kidId)) map.get(kidId)!.push(lesson)
      }
    }
    return map
  }, [lessons, kids])

  if (kids.length === 0) {
    return <EmptyHint>Add a learner on the Family page to see lessons per kid.</EmptyHint>
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {kids.map((kid) => {
        const kidLessons = grouped.get(kid.id) ?? []
        return (
          <div key={kid.id} className="atoz-mini-card">
            <div className="flex items-center gap-2 mb-3">
              <KidDot name={kid.name} color={kid.color} size="md" />
              <div>
                <div className="font-display text-lg">{kid.name}</div>
                <div className="text-xs text-[var(--ink-3)]">
                  {kidLessons.length} lesson{kidLessons.length === 1 ? "" : "s"}
                </div>
              </div>
            </div>
            {kidLessons.length === 0 ? (
              <div className="text-xs text-[var(--ink-3)] italic py-3">Nothing scheduled today.</div>
            ) : (
              <ul className="space-y-2">
                {kidLessons.map((lesson) => {
                  const done = doneIds.has(lesson.id)
                  const time = lesson.scheduledFor
                    ? new Date(lesson.scheduledFor).toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : ""
                  return (
                    <li
                      key={lesson.id}
                      className={`rounded-lg border px-3 py-2 text-sm cursor-pointer transition ${
                        done
                          ? "border-[var(--sage-l)] bg-[var(--sage-ll)] text-[var(--ink-3)] line-through"
                          : "border-[var(--rule)] bg-white hover:bg-[var(--sage-ll)]"
                      }`}
                      onClick={() => onTeach(lesson)}
                    >
                      <div className="font-medium truncate">
                        {lesson.title || <em className="text-[var(--ink-3)]">Untitled</em>}
                      </div>
                      <div className="text-xs text-[var(--ink-3)] flex gap-2 mt-0.5">
                        {time && <span>{time}</span>}
                        {lesson.subject && <span>{lesson.subject}</span>}
                        {lesson.durationMin && <span>{lesson.durationMin}m</span>}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}

function CompassView({
  kids,
  weeklyHours,
  subjectHoursThisWeek,
  scheduledToday,
}: {
  kids: DemoKid[]
  weeklyHours: Record<string, number>
  subjectHoursThisWeek: Record<string, number>
  scheduledToday: Lesson[]
}) {
  const subjects = useMemo(() => {
    const set = new Set<string>([...Object.keys(subjectHoursThisWeek), ...SUBJECT_ORDER])
    return Array.from(set).filter((s) => (subjectHoursThisWeek[s] ?? 0) > 0 || SUBJECT_ORDER.includes(s))
  }, [subjectHoursThisWeek])

  const maxSubjectHours = Math.max(1, ...Object.values(subjectHoursThisWeek))

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="atoz-mini-card">
        <div className="atoz-eyebrow mb-3">This week · by subject</div>
        {Object.keys(subjectHoursThisWeek).length === 0 ? (
          <div className="text-xs text-[var(--ink-3)] italic py-4">
            No captured hours yet this week. Teach a lesson and it'll land here.
          </div>
        ) : (
          <ul className="space-y-2">
            {subjects.map((subject) => {
              const hrs = subjectHoursThisWeek[subject] ?? 0
              const pct = Math.min(100, Math.round((hrs / maxSubjectHours) * 100))
              return (
                <li key={subject} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--ink-2)]">{subject}</span>
                    <span className="text-[var(--ink-3)] text-xs">
                      {hrs.toFixed(1)} hr{hrs === 1 ? "" : "s"}
                    </span>
                  </div>
                  <ProgressRail
                    value={pct}
                    tone={hrs > 0 ? "sage" : "terracotta"}
                    label={`${subject} hours`}
                  />
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="atoz-mini-card">
        <div className="atoz-eyebrow mb-3">This week · by kid</div>
        {kids.length === 0 ? (
          <div className="text-xs text-[var(--ink-3)] italic py-4">Add a learner to see weekly hours.</div>
        ) : (
          <ul className="space-y-3">
            {kids.map((kid) => {
              const target = kid.weeklyTarget ?? 17.5
              const hours = weeklyHours[kid.id] ?? 0
              const pct = Math.min(100, Math.round((hours / target) * 100))
              return (
                <li key={kid.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <KidDot name={kid.name} color={kid.color} size="xs" />
                      {kid.name}
                    </span>
                    <span className="text-[var(--ink-3)] text-xs">
                      {hours} / {target} hr
                    </span>
                  </div>
                  <ProgressRail
                    value={pct}
                    tone={pct >= 100 ? "sage" : pct >= 60 ? "honey" : "terracotta"}
                    label={`${kid.name} weekly progress`}
                  />
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="atoz-mini-card md:col-span-2">
        <div className="atoz-eyebrow mb-3 flex items-center gap-2">
          <CalendarDays size={14} aria-hidden="true" /> Today's plan
        </div>
        {scheduledToday.length === 0 ? (
          <div className="text-xs text-[var(--ink-3)] italic py-2">Nothing scheduled today.</div>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {scheduledToday.map((lesson) => (
              <li
                key={lesson.id}
                className="rounded-full border border-[var(--rule)] bg-white px-3 py-1 text-xs"
              >
                <span className="font-medium">{lesson.title || "Untitled"}</span>
                {lesson.subject && <span className="text-[var(--ink-3)]"> · {lesson.subject}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
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
