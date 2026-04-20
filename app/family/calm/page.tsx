"use client"

/**
 * Calm Family room — kid grid + links to People and Portfolio.
 * Kids are stored locally (lib/atoz-store). Add/edit/delete happen
 * inline via the "Add a learner" dialog.
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
  deleteKid,
  listMemberships,
  listPortfolio,
  newDraftKid,
  onStorageChange,
  upsertKid,
  type Kid,
  type Lesson,
} from "@/lib/atoz-store"
import { readDemoHours, useKids } from "@/lib/demo-kids"
import WeeklyRhythm from "@/components/weekly-rhythm"
import LessonAuthoringDialog from "@/components/lesson-authoring-dialog"
import LessonScheduleSheet from "@/components/lesson-schedule-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ArrowRight, Plus, Trash2, Users } from "lucide-react"

const KID_COLORS = [
  "#d46e4d", // terracotta
  "#7d9e7d", // sage
  "#df8a27", // honey
  "#6b8caf", // slate blue
  "#9b7fbf", // muted plum
  "#c07b7b", // dusty rose
]

export default function CalmFamilyPage() {
  const kids = useKids()
  const { toast } = useToast()
  const [portfolioCount, setPortfolioCount] = useState<Record<string, number>>({})
  const [membersCount, setMembersCount] = useState(1)
  const [weeklyHours, setWeeklyHours] = useState<Record<string, number>>(() => readDemoHours())
  const [editor, setEditor] = useState<Kid | null>(null)
  const [authorOpen, setAuthorOpen] = useState(false)
  const [editing, setEditing] = useState<Lesson | undefined>(undefined)
  const [scheduleTarget, setScheduleTarget] = useState<Lesson | null>(null)

  const refresh = useCallback(() => {
    const items = listPortfolio()
    const counts: Record<string, number> = {}
    for (const item of items) counts[item.kidId] = (counts[item.kidId] ?? 0) + 1
    setPortfolioCount(counts)
    setMembersCount(1 + listMemberships().length)
    setWeeklyHours(readDemoHours())
  }, [])

  useEffect(() => {
    refresh()
    return onStorageChange(refresh)
  }, [refresh])

  const openAdd = () => setEditor(newDraftKid({ color: KID_COLORS[kids.length % KID_COLORS.length] }))
  const openEdit = (kid: Kid) => setEditor({ ...kid })
  const closeEditor = () => setEditor(null)

  const saveKid = (patch: Partial<Kid>) => {
    if (!editor) return
    const merged: Kid = { ...editor, ...patch }
    if (!merged.name.trim()) {
      toast({ title: "Name required", description: "Give your learner a name.", variant: "destructive" })
      return
    }
    upsertKid(merged)
    toast({ title: "Saved", description: `${merged.name} updated.` })
    closeEditor()
  }

  const removeKid = () => {
    if (!editor) return
    if (typeof window !== "undefined" && !window.confirm(`Remove ${editor.name}? Their portfolio will stay.`)) {
      return
    }
    deleteKid(editor.id)
    toast({ title: "Removed", description: `${editor.name} removed from the roster.` })
    closeEditor()
  }

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
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditing(undefined)
                setAuthorOpen(true)
              }}
              disabled={kids.length === 0}
              className="rounded-full border-[var(--rule)]"
            >
              <Plus size={14} className="mr-1" aria-hidden="true" /> New lesson
            </Button>
            <Link
              href="/people"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--rule)] bg-white hover:bg-[var(--sage-ll)] text-sm font-medium"
            >
              <Users size={14} aria-hidden="true" /> People · {membersCount}
            </Link>
          </div>
        </header>

        {kids.length > 0 && (
          <section className="mb-8">
            <WeeklyRhythm kids={kids} />
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="atoz-eyebrow">Kids</div>
            <Button
              size="sm"
              variant="outline"
              onClick={openAdd}
              className="rounded-full border-[var(--rule)]"
            >
              <Plus size={14} className="mr-1" aria-hidden="true" /> Add a learner
            </Button>
          </div>
          {kids.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--rule)] bg-white/40 p-8 text-center">
              <div className="text-sm text-[var(--ink-2)] mb-3">
                No learners yet. Add your first to start planning lessons.
              </div>
              <Button onClick={openAdd}>
                <Plus size={14} className="mr-1" aria-hidden="true" /> Add a learner
              </Button>
            </div>
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {kids.map((kid) => {
                const target = kid.weeklyTarget ?? 17.5
                const hours = weeklyHours[kid.id] ?? 0
                const pct = Math.min(100, Math.round((hours / target) * 100))
                const items = portfolioCount[kid.id] ?? 0
                return (
                  <li key={kid.id} className="relative group">
                    <Link
                      href={`/family/kid/${kid.id}`}
                      className="atoz-mini-card block hover:shadow-md transition"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <KidDot name={kid.name} color={kid.color} size="lg" />
                        <div>
                          <div className="font-display text-xl">{kid.name}</div>
                          <div className="text-xs text-[var(--ink-3)]">
                            {kid.age ? `Age ${kid.age}` : "Age —"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-baseline justify-between mb-2">
                        <div className="text-xs text-[var(--ink-3)]">This week</div>
                        <Pill variant={pct >= 100 ? "sage" : "honey"}>{pct}%</Pill>
                      </div>
                      <div className="mb-2">
                        <span className="font-display text-xl font-normal tracking-tight">{hours}</span>{" "}
                        <span className="text-[var(--ink-3)] text-sm">of {target} hrs</span>
                      </div>
                      <ProgressRail value={pct} tone={pct >= 100 ? "sage" : pct >= 60 ? "honey" : "terracotta"} />
                      <div className="mt-3 flex items-center justify-between text-xs text-[var(--ink-3)]">
                        <span>{items} portfolio item{items === 1 ? "" : "s"}</span>
                        <span className="text-[var(--sage-dd)] font-medium inline-flex items-center gap-1">
                          Open <ArrowRight size={12} aria-hidden="true" />
                        </span>
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={() => openEdit(kid)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition rounded-full bg-white border border-[var(--rule)] px-2 py-1 text-xs hover:bg-[var(--sage-ll)]"
                      aria-label={`Edit ${kid.name}`}
                    >
                      Edit
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </main>

      <KidEditor
        kid={editor}
        onClose={closeEditor}
        onSave={saveKid}
        onRemove={removeKid}
        existingId={editor && kids.some((k) => k.id === editor.id) ? editor.id : null}
      />

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

function KidEditor({
  kid,
  onClose,
  onSave,
  onRemove,
  existingId,
}: {
  kid: Kid | null
  onClose: () => void
  onSave: (patch: Partial<Kid>) => void
  onRemove: () => void
  existingId: string | null
}) {
  const [name, setName] = useState("")
  const [age, setAge] = useState<string>("")
  const [color, setColor] = useState(KID_COLORS[0])
  const [weeklyTarget, setWeeklyTarget] = useState<string>("17.5")

  useEffect(() => {
    if (!kid) return
    setName(kid.name)
    setAge(kid.age ? String(kid.age) : "")
    setColor(kid.color)
    setWeeklyTarget(kid.weeklyTarget ? String(kid.weeklyTarget) : "17.5")
  }, [kid])

  const open = kid !== null
  const isEdit = existingId !== null

  const handleSave = () => {
    onSave({
      name: name.trim(),
      age: age ? Number(age) : undefined,
      color,
      weeklyTarget: weeklyTarget ? Number(weeklyTarget) : undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${kid?.name || "learner"}` : "Add a learner"}</DialogTitle>
          <DialogDescription>
            Kid info stays on this device. Color shows up as their dot in the roster and lessons.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="kid-name">Name</Label>
            <Input
              id="kid-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Emma"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="kid-age">Age</Label>
              <Input
                id="kid-age"
                type="number"
                min={0}
                max={25}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="7"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kid-hours">Weekly hours</Label>
              <Input
                id="kid-hours"
                type="number"
                min={0}
                step={0.5}
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {KID_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full border-2 transition ${
                    color === c ? "border-[var(--ink)] scale-110" : "border-transparent"
                  }`}
                  style={{ background: c }}
                  aria-label={`Pick color ${c}`}
                  aria-pressed={color === c}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          {isEdit ? (
            <Button variant="ghost" onClick={onRemove} className="text-destructive hover:text-destructive">
              <Trash2 size={14} className="mr-1" aria-hidden="true" /> Remove
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>{isEdit ? "Save" : "Add"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
