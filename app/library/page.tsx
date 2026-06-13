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
  type Kid,
  type Lesson,
  type LessonStatus,
  deleteLesson,
  listLessons,
  onStorageChange,
  restoreLesson,
  startSession,
} from "@/lib/atoz-store"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search } from "lucide-react"
import { useKids } from "@/lib/demo-kids"
import { AnalyticsEvents, trackEvent } from "@/lib/analytics"

type StatusFilter = LessonStatus | "all" | "deleted"
const STATUS_FILTERS: { v: StatusFilter; label: string }[] = [
  { v: "all", label: "All" },
  { v: "scheduled", label: "Scheduled" },
  { v: "draft", label: "Drafts" },
  { v: "archived", label: "Archived" },
  { v: "deleted", label: "Recently deleted" },
]

export default function LibraryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const kids = useKids()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [status, setStatus] = useState<StatusFilter>("all")
  const [subject, setSubject] = useState<string>("")
  const [kidFilter, setKidFilter] = useState<string>("")
  const [query, setQuery] = useState("")
  const [authorOpen, setAuthorOpen] = useState(false)
  const [editing, setEditing] = useState<Lesson | undefined>(undefined)
  const [scheduleTarget, setScheduleTarget] = useState<Lesson | null>(null)

  const refresh = useCallback(() => {
    setLessons(listLessons({ includeDeleted: status === "deleted" }))
  }, [status])

  useEffect(() => {
    refresh()
    return onStorageChange(refresh)
  }, [refresh])

  // Re-fetch when the deleted filter is toggled, since listLessons gates on it.
  useEffect(() => {
    refresh()
  }, [status, refresh])

  const subjectOptions = useMemo(
    () => Array.from(new Set(lessons.map((l) => l.subject).filter(Boolean))).sort(),
    [lessons],
  )

  const filtered = useMemo(() => {
    return lessons.filter((l) => {
      if (status === "deleted") {
        if (!l.deletedAt) return false
      } else if (status !== "all" && l.status !== status) {
        return false
      } else if (l.deletedAt) {
        return false
      }
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

  const handleRestore = (lesson: Lesson) => {
    trackEvent(AnalyticsEvents.LESSON_ROW_ACTION, { room: "library", action: "restore", status: lesson.status })
    restoreLesson(lesson.id)
    toast({ title: "Restored", description: `"${lesson.title || "Untitled"}" is back.` })
    refresh()
  }

  const handleTeach = (lesson: Lesson) => {
    trackEvent(AnalyticsEvents.LESSON_ROW_ACTION, { room: "library", action: "teach", status: lesson.status })
    if (lesson.status === "draft") {
      toast({ title: "Schedule first", description: "Drafts aren't on Today yet." })
      setScheduleTarget(lesson)
      return
    }
    const session = startSession(lesson.id)
    trackEvent(AnalyticsEvents.LESSON_START, { subject: lesson.subject, from: "library" })
    router.push(`/teach/${session.id}`)
  }

  const handleEdit = (lesson: Lesson) => {
    trackEvent(AnalyticsEvents.LESSON_ROW_ACTION, { room: "library", action: "edit", status: lesson.status })
    setEditing(lesson)
    setAuthorOpen(true)
  }

  const handleSchedule = (lesson: Lesson) => {
    trackEvent(AnalyticsEvents.LESSON_ROW_ACTION, { room: "library", action: "schedule", status: lesson.status })
    setScheduleTarget(lesson)
  }

  const handleDelete = (lesson: Lesson) => {
    trackEvent(AnalyticsEvents.LESSON_ROW_ACTION, { room: "library", action: "delete", status: lesson.status })
    deleteLesson(lesson.id)
    toast({ title: "Removed", description: `"${lesson.title || "Untitled"}" deleted.` })
    refresh()
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
            {kids.map((k) => (
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
              Nothing here yet. Author one in <Link className="underline" href="/teach">Teach</Link>, then browse them all here.
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((lesson) => (
                <LessonListItem
                  key={lesson.id}
                  lesson={lesson}
                  kids={kids}
                  onEdit={() => handleEdit(lesson)}
                  onSchedule={() => handleSchedule(lesson)}
                  onTeach={() => handleTeach(lesson)}
                  onDelete={() => handleDelete(lesson)}
                  onRestore={() => handleRestore(lesson)}
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

    </div>
  )
}

function LessonListItem({
  lesson,
  kids,
  onEdit,
  onSchedule,
  onTeach,
  onDelete,
  onRestore,
}: {
  lesson: Lesson
  kids: Kid[]
  onEdit: () => void
  onSchedule: () => void
  onTeach: () => void
  onDelete: () => void
  onRestore?: () => void
}) {
  const lessonKids = kids.filter((k) => lesson.kidIds.includes(k.id))
  const firstKid = lessonKids[0]
  const isDeleted = Boolean(lesson.deletedAt)
  const statusVariant = isDeleted
    ? "terracotta"
    : lesson.status === "scheduled"
      ? "sage"
      : lesson.status === "archived"
        ? "terracotta"
        : undefined
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
    <li
      className={`flex items-center gap-3 rounded-xl border border-[var(--rule)] bg-white px-4 py-3 ${
        isDeleted ? "opacity-70" : ""
      }`}
    >
      {firstKid && (
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: firstKid.color }}
          aria-hidden="true"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-sm truncate ${isDeleted ? "line-through" : ""}`}>
          {lesson.title || <span className="text-[var(--ink-3)] italic">Untitled</span>}
        </div>
        <div className="text-xs text-[var(--ink-3)] flex flex-wrap gap-2 items-center mt-0.5">
          {lesson.subject && <span>{lesson.subject}</span>}
          {lesson.durationMin && <span>· {lesson.durationMin} min</span>}
          {scheduledFor && <span>· {scheduledFor}</span>}
          {isDeleted && lesson.deletedAt && (
            <span>· Deleted {new Date(lesson.deletedAt).toLocaleDateString()}</span>
          )}
          <span className="inline-flex items-center gap-0.5">
            {lessonKids.map((k) => (
              <KidDot key={k.id} name={k.name} color={k.color} size="xs" />
            ))}
          </span>
        </div>
      </div>
      <Pill variant={statusVariant}>
        {isDeleted
          ? "Deleted"
          : lesson.status === "scheduled"
            ? "Scheduled"
            : lesson.status === "archived"
              ? "Archived"
              : "Draft"}
      </Pill>
      <div className="flex items-center gap-1">
        {isDeleted && onRestore ? (
          <Button variant="outline" size="sm" onClick={onRestore}>
            Restore
          </Button>
        ) : (
          <>
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
          </>
        )}
      </div>
    </li>
  )
}
