"use client"

/**
 * Library — every lesson across statuses. Filter by status + subject + kid.
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Navigation from "@/components/navigation"
import {
  Chip,
  KidChip,
  KidDot,
  Pill,
} from "@/components/primitives"
import LessonAuthoringDialog from "@/components/lesson-authoring-dialog"
import LessonScheduleSheet from "@/components/lesson-schedule-sheet"
import {
  type Lesson,
  type LessonStatus,
  listLessons,
  onStorageChange,
  startSession,
  deleteLesson,
} from "@/lib/atoz-store"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search } from "lucide-react"
import { DEMO_KIDS } from "@/lib/demo-kids"

const STATUS_FILTERS: { v: LessonStatus | "all"; label: string }[] = [
  { v: "all", label: "All" },
  { v: "scheduled", label: "Scheduled" },
  { v: "draft", label: "Drafts" },
  { v: "archived", label: "Archived" },
]

export default function LibraryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [status, setStatus] = useState<LessonStatus | "all">("all")
  const [subject, setSubject] = useState<string>("")
  const [kidFilter, setKidFilter] = useState<string>("")
  const [query, setQuery] = useState("")
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

  const subjectOptions = useMemo(
    () => Array.from(new Set(lessons.map((l) => l.subject).filter(Boolean))).sort(),
    [lessons],
  )

  const filtered = useMemo(() => {
    return lessons.filter((l) => {
      if (status !== "all" && l.status !== status) return false
      if (subject && l.subject !== subject) return false
      if (kidFilter && !l.kidIds.includes(kidFilter)) return false
      if (query.trim()) {
        const q = query.trim().toLowerCase()
        const hay = [l.title, l.goal, ...(l.materials ?? []), ...(l.planSteps?.map((s) => s.text) ?? [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [lessons, status, subject, kidFilter, query])

  const handleTeach = (lesson: Lesson) => {
    if (lesson.status === "draft") {
      toast({ title: "Schedule first", description: "Drafts aren't on Today yet." })
      setScheduleTarget(lesson)
      return
    }
    const session = startSession(lesson.id)
    router.push(`/teach/${session.id}`)
  }

  return (
    <div className="min-h-screen bg-[var(--linen)] text-[var(--ink)] font-sans">
      <Navigation />
      <main className="atoz-page">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="atoz-eyebrow">Library</div>
            <h1 className="font-display text-5xl font-light tracking-tighter leading-[1.05] mt-2">
              Every lesson, in one place.
            </h1>
            <p className="text-[var(--ink-2)] mt-2 max-w-[520px]">
              Drafts, scheduled, and archived. Search by title, filter by kid or subject.
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

        <section className="mb-6 space-y-3">
          <div className="relative max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-4)]"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lessons…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <Chip key={f.v} active={status === f.v} onClick={() => setStatus(f.v)}>
                {f.label}
              </Chip>
            ))}
          </div>
          {subjectOptions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Chip active={subject === ""} onClick={() => setSubject("")}>All subjects</Chip>
              {subjectOptions.map((s) => (
                <Chip key={s} active={subject === s} onClick={() => setSubject(subject === s ? "" : s)}>
                  {s}
                </Chip>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Chip active={kidFilter === ""} onClick={() => setKidFilter("")}>All kids</Chip>
            {DEMO_KIDS.map((k) => (
              <KidChip
                key={k.id}
                name={k.name}
                color={k.color}
                active={kidFilter === k.id}
                onClick={() => setKidFilter(kidFilter === k.id ? "" : k.id)}
              />
            ))}
          </div>
        </section>

        <section>
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--rule)] p-10 text-center text-sm text-[var(--ink-3)] bg-white/40">
              Nothing here yet. <strong>New lesson</strong> is a good next step.
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((lesson) => (
                <LessonListItem
                  key={lesson.id}
                  lesson={lesson}
                  onEdit={() => {
                    setEditing(lesson)
                    setAuthorOpen(true)
                  }}
                  onSchedule={() => setScheduleTarget(lesson)}
                  onTeach={() => handleTeach(lesson)}
                  onDelete={() => {
                    deleteLesson(lesson.id)
                    toast({ title: "Removed", description: `"${lesson.title || "Untitled"}" deleted.` })
                    refresh()
                  }}
                />
              ))}
            </ul>
          )}
        </section>
      </main>

      <LessonAuthoringDialog
        open={authorOpen}
        onOpenChange={(o) => {
          setAuthorOpen(o)
          if (!o) setEditing(undefined)
        }}
        kids={DEMO_KIDS}
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

    </div>
  )
}

function LessonListItem({
  lesson,
  onEdit,
  onSchedule,
  onTeach,
  onDelete,
}: {
  lesson: Lesson
  onEdit: () => void
  onSchedule: () => void
  onTeach: () => void
  onDelete: () => void
}) {
  const kids = DEMO_KIDS.filter((k) => lesson.kidIds.includes(k.id))
  const firstKid = kids[0]
  const statusVariant =
    lesson.status === "scheduled" ? "sage" : lesson.status === "archived" ? "terracotta" : undefined
  const scheduledFor = lesson.scheduledFor
    ? new Date(lesson.scheduledFor).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null

  return (
    <li className="flex items-center gap-3 rounded-xl border border-[var(--rule)] bg-white px-4 py-3">
      {firstKid && (
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: firstKid.color }}
          aria-hidden="true"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">
          {lesson.title || <span className="text-[var(--ink-3)] italic">Untitled</span>}
        </div>
        <div className="text-xs text-[var(--ink-3)] flex flex-wrap gap-2 items-center mt-0.5">
          {lesson.subject && <span>{lesson.subject}</span>}
          {lesson.durationMin && <span>· {lesson.durationMin} min</span>}
          {scheduledFor && <span>· {scheduledFor}</span>}
          <span className="inline-flex items-center gap-0.5">
            {kids.map((k) => (
              <KidDot key={k.id} name={k.name} color={k.color} size="xs" />
            ))}
          </span>
        </div>
      </div>
      <Pill variant={statusVariant}>
        {lesson.status === "scheduled" ? "Scheduled" : lesson.status === "archived" ? "Archived" : "Draft"}
      </Pill>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={onSchedule}>
          {lesson.status === "draft" ? "Schedule" : "Reschedule"}
        </Button>
        <Button
          size="sm"
          onClick={onTeach}
          className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white"
        >
          Teach
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-[var(--terracotta-d)]"
        >
          ×
        </Button>
      </div>
    </li>
  )
}
