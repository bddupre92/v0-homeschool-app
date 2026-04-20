"use client"

/**
 * Flow 02 — Teach room entry page.
 * Shows drafts + scheduled lessons, lets the user author a new one,
 * and starts a teach session.
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import { Pill, KidDot } from "@/components/primitives"
import LessonAuthoringDialog from "@/components/lesson-authoring-dialog"
import LessonScheduleSheet from "@/components/lesson-schedule-sheet"
import {
  type Lesson,
  listLessons,
  onStorageChange,
  startSession,
  deleteLesson,
} from "@/lib/atoz-store"
import { useToast } from "@/hooks/use-toast"
import { Plus, Play, Trash2, Edit3 } from "lucide-react"
import { useKids } from "@/lib/demo-kids"

const KID_PALETTE = ["#d46e4d", "#7d9e7d", "#df8a27", "#4a90a4", "#8a6aa1"]

export default function TeachRoomPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const kids = useKids()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [authorOpen, setAuthorOpen] = useState(false)
  const [editing, setEditing] = useState<Lesson | undefined>(undefined)
  const [scheduleTarget, setScheduleTarget] = useState<Lesson | null>(null)

  const refresh = useCallback(() => {
    setLessons(listLessons())
  }, [])

  useEffect(() => {
    refresh()
    return onStorageChange(refresh)
  }, [refresh])

  useEffect(() => {
    if (searchParams?.get("justSaved")) {
      toast({
        title: "Saved",
        description: "Lesson saved to the portfolio.",
        duration: 4000,
      })
    }
  }, [searchParams, toast])

  const drafts = useMemo(() => lessons.filter((l) => l.status === "draft"), [lessons])
  const scheduled = useMemo(() => lessons.filter((l) => l.status === "scheduled"), [lessons])

  const handleStart = useCallback(
    (lesson: Lesson) => {
      if (lesson.status === "draft") {
        toast({
          title: "Schedule first",
          description: "Drafts are invisible to kids. Schedule the lesson to begin.",
        })
        setScheduleTarget(lesson)
        return
      }
      const session = startSession(lesson.id)
      router.push(`/teach/${session.id}`)
    },
    [router, toast],
  )

  const handleEdit = (lesson: Lesson) => {
    setEditing(lesson)
    setAuthorOpen(true)
  }

  const handleDelete = (lesson: Lesson) => {
    deleteLesson(lesson.id)
    refresh()
    toast({ title: "Removed", description: `"${lesson.title || "Untitled"}" was removed.` })
  }

  return (
    <div className="min-h-screen bg-[var(--linen)] text-[var(--ink)] font-sans">
      <Navigation />
      <main className="atoz-page">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="atoz-eyebrow">Teach</div>
            <h1 className="font-display text-5xl font-light tracking-tighter leading-[1.05] mt-2">
              The lesson loop.
            </h1>
            <p className="text-[var(--ink-2)] mt-2 max-w-[540px]">
              Author a lesson, schedule it, teach it, capture what happened. One flow, end to end.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditing(undefined)
              setAuthorOpen(true)
            }}
            className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white"
          >
            <Plus size={14} className="mr-1" /> New lesson
          </Button>
        </header>

        <Section title="Scheduled" sub="Ready to teach. Kids can see these.">
          {scheduled.length === 0 ? (
            <EmptyHint>Nothing scheduled yet. When a lesson is ready, schedule it.</EmptyHint>
          ) : (
            <ul className="space-y-2">
              {scheduled.map((l) => (
                <LessonRow
                  key={l.id}
                  lesson={l}
                  onStart={() => handleStart(l)}
                  onEdit={() => handleEdit(l)}
                  onReschedule={() => setScheduleTarget(l)}
                  onDelete={() => handleDelete(l)}
                />
              ))}
            </ul>
          )}
        </Section>

        <Section title="Drafts" sub="Autosaved. Invisible to kids until scheduled.">
          {drafts.length === 0 ? (
            <EmptyHint>
              Nothing in drafts. Use <strong>New lesson</strong> to start one.
            </EmptyHint>
          ) : (
            <ul className="space-y-2">
              {drafts.map((l) => (
                <LessonRow
                  key={l.id}
                  lesson={l}
                  onStart={() => handleStart(l)}
                  onEdit={() => handleEdit(l)}
                  onReschedule={() => setScheduleTarget(l)}
                  onDelete={() => handleDelete(l)}
                />
              ))}
            </ul>
          )}
        </Section>

        <LessonAuthoringDialog
          open={authorOpen}
          onOpenChange={(o) => {
            setAuthorOpen(o)
            if (!o) setEditing(undefined)
          }}
          kids={kids}
          lesson={editing}
          onSaved={(saved) => {
            refresh()
            setEditing(saved)
          }}
          onScheduleClick={(saved) => {
            setAuthorOpen(false)
            setScheduleTarget(saved)
          }}
        />

        <LessonScheduleSheet
          open={!!scheduleTarget}
          onOpenChange={(o) => {
            if (!o) setScheduleTarget(null)
          }}
          lesson={scheduleTarget}
          onScheduled={() => refresh()}
        />
      </main>

    </div>
  )
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-display text-2xl font-medium">{title}</h2>
        {sub && <span className="text-xs text-[var(--ink-3)]">{sub}</span>}
      </div>
      {children}
    </section>
  )
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--rule)] p-6 text-sm text-[var(--ink-3)] bg-white/40">
      {children}
    </div>
  )
}

function LessonRow({
  lesson,
  onStart,
  onEdit,
  onReschedule,
  onDelete,
}: {
  lesson: Lesson
  onStart: () => void
  onEdit: () => void
  onReschedule: () => void
  onDelete: () => void
}) {
  const kids = useKids()
  const firstKid = kids.find((k) => lesson.kidIds.includes(k.id)) ?? kids[0]
  const kidColor = firstKid?.color ?? KID_PALETTE[0]
  const scheduledFor = lesson.scheduledFor
    ? new Date(lesson.scheduledFor).toLocaleString(undefined, {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : null
  const isDraft = lesson.status === "draft"

  return (
    <li className="flex items-center gap-3 rounded-xl border border-[var(--rule)] bg-white px-4 py-3">
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: kidColor }}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">
          {lesson.title || <span className="text-[var(--ink-3)] italic">Untitled</span>}
        </div>
        <div className="text-xs text-[var(--ink-3)] flex flex-wrap gap-2 items-center mt-0.5">
          {lesson.subject && <span>{lesson.subject}</span>}
          {lesson.durationMin && <span>· {lesson.durationMin} min</span>}
          {scheduledFor && <span>· {scheduledFor}</span>}
          <span className="flex items-center gap-1">
            {lesson.kidIds.map((kid) => {
              const k = kids.find((x) => x.id === kid)
              if (!k) return null
              return <KidDot key={kid} name={k.name} color={k.color} size="xs" />
            })}
          </span>
        </div>
      </div>
      {isDraft ? (
        <Pill>Draft</Pill>
      ) : (
        <Pill variant="sage">Scheduled</Pill>
      )}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReschedule}
          aria-label="Reschedule"
          title={isDraft ? "Schedule" : "Reschedule"}
        >
          {isDraft ? "Schedule" : "Reschedule"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit} aria-label="Edit lesson">
          <Edit3 size={14} />
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} aria-label="Delete lesson">
          <Trash2 size={14} className="text-[var(--terracotta-d)]" />
        </Button>
        <Button
          onClick={onStart}
          className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white"
          size="sm"
        >
          <Play size={14} className="mr-1" /> Teach
        </Button>
      </div>
    </li>
  )
}
