"use client"

/**
 * Kid Mode — chromeless, hand-to-learner surface. Big tappable tiles
 * for today's lessons, no nav, no FAB, no hours math. An adult stays
 * logged in on the phone, passes it to the kid, and the kid just
 * works through their day.
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { KidDot } from "@/components/primitives"
import {
  type Lesson,
  type LessonSession,
  listLessons,
  listSessions,
  onStorageChange,
  startSession,
} from "@/lib/atoz-store"
import { useKids } from "@/lib/demo-kids"
import { ArrowLeft, CheckCircle2, Play } from "lucide-react"

function sameLocalDay(iso: string, day: Date): boolean {
  const d = new Date(iso)
  return (
    d.getFullYear() === day.getFullYear() &&
    d.getMonth() === day.getMonth() &&
    d.getDate() === day.getDate()
  )
}

export default function KidModePage() {
  const params = useParams<{ kidId: string }>()
  const router = useRouter()
  const kids = useKids()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [sessions, setSessions] = useState<LessonSession[]>([])

  const refresh = useCallback(() => {
    setLessons(listLessons())
    setSessions(listSessions())
  }, [])

  useEffect(() => {
    refresh()
    return onStorageChange(refresh)
  }, [refresh])

  const kid = kids.find((k) => k.id === params?.kidId)
  const today = new Date()

  const todayLessons = useMemo(
    () =>
      lessons
        .filter(
          (l) =>
            l.status === "scheduled" &&
            l.scheduledFor &&
            sameLocalDay(l.scheduledFor, today) &&
            (!kid || l.kidIds.includes(kid.id)),
        )
        .sort((a, b) => (a.scheduledFor! < b.scheduledFor! ? -1 : 1)),
    [lessons, today, kid],
  )

  const completed = useMemo(
    () =>
      new Set(
        sessions
          .filter((s) => s.endedAt && sameLocalDay(s.endedAt, today))
          .map((s) => s.lessonId),
      ),
    [sessions, today],
  )

  if (!kid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--linen)] text-[var(--ink)]">
        <h1 className="font-display text-3xl font-light">That learner isn't here.</h1>
        <Link href="/family/calm" className="mt-4 underline">Go back</Link>
      </div>
    )
  }

  const firstOpen = todayLessons.find((l) => !completed.has(l.id))
  const greeting =
    new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening"

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(180deg, ${kid.color}1a 0%, var(--linen) 100%)`,
      }}
    >
      <header className="px-5 py-4 flex items-center gap-3">
        <Link
          href={`/family/kid/${kid.id}`}
          className="inline-flex items-center gap-1 text-sm text-[var(--ink-3)] hover:text-[var(--ink)]"
          aria-label="Exit kid mode"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Done
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <KidDot name={kid.name} color={kid.color} size="md" />
          <span className="font-display text-lg">{kid.name}</span>
        </div>
      </header>

      <main className="px-6 pt-8 pb-20 max-w-2xl mx-auto">
        <h1 className="font-display text-4xl md:text-5xl font-light tracking-tighter">
          {greeting}, {kid.name}.
        </h1>
        <p className="text-[var(--ink-2)] mt-3 text-lg">
          {todayLessons.length === 0 ? (
            <>Nothing scheduled. Maybe a book? A walk? Both?</>
          ) : firstOpen ? (
            <>Tap a lesson to start.</>
          ) : (
            <>All done for today. Great work.</>
          )}
        </p>

        <ul className="mt-10 space-y-4">
          {todayLessons.map((lesson) => {
            const done = completed.has(lesson.id)
            return (
              <li key={lesson.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (done) return
                    const session = startSession(lesson.id)
                    router.push(`/teach/${session.id}`)
                  }}
                  disabled={done}
                  className={`w-full rounded-2xl border-2 px-5 py-6 text-left transition ${
                    done
                      ? "border-[var(--sage-l)] bg-[var(--sage-ll)] text-[var(--ink-3)]"
                      : "border-[var(--rule)] bg-white hover:shadow-md active:scale-[0.99]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: done ? "transparent" : `${kid.color}33` }}
                    >
                      {done ? (
                        <CheckCircle2 size={28} className="text-[var(--sage-d)]" aria-hidden="true" />
                      ) : (
                        <Play size={24} style={{ color: kid.color }} aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-2xl tracking-tight truncate">
                        {lesson.title || "Lesson"}
                      </div>
                      <div className="text-sm text-[var(--ink-3)] mt-1 flex gap-2 flex-wrap">
                        {lesson.subject && <span>{lesson.subject}</span>}
                        {lesson.durationMin && <span>· {lesson.durationMin} min</span>}
                      </div>
                      {lesson.goal && (
                        <p className="text-sm text-[var(--ink-2)] mt-3 line-clamp-2">{lesson.goal}</p>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </main>
    </div>
  )
}
