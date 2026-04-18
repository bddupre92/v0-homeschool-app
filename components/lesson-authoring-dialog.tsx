"use client"

/**
 * Flow 02 Step 1 — Author a lesson.
 * Chip-based subject & kid multi-select, add/reorder plan steps,
 * materials chip list. Autosaves drafts every 3 seconds (no
 * "unsaved changes" warnings, per CLAUDE.md).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Chip, KidChip } from "@/components/primitives"
import { GripVertical, X, Plus } from "lucide-react"
import {
  type Lesson,
  type LessonPlanStep,
  newDraftLesson,
  uid,
  upsertLesson,
} from "@/lib/atoz-store"

const SUBJECTS = [
  "Mathematics",
  "Language Arts",
  "Science",
  "Social Studies",
  "History",
  "Art",
  "Music",
  "Physical Education",
  "Nature",
] as const

const KID_PALETTE = ["#d46e4d", "#7d9e7d", "#df8a27", "#4a90a4", "#8a6aa1"]

interface Child {
  id: string
  name: string
  color?: string
}

interface LessonAuthoringDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kids: Child[]
  lesson?: Lesson
  onSaved?: (lesson: Lesson) => void
  onScheduleClick?: (lesson: Lesson) => void
}

function colorForKid(kid: Child, index: number): string {
  return kid.color ?? KID_PALETTE[index % KID_PALETTE.length]
}

export default function LessonAuthoringDialog({
  open,
  onOpenChange,
  kids,
  lesson,
  onSaved,
  onScheduleClick,
}: LessonAuthoringDialogProps) {
  const [draft, setDraft] = useState<Lesson>(() => lesson ?? newDraftLesson())
  const [newMaterial, setNewMaterial] = useState("")
  const [newStep, setNewStep] = useState("")
  const lastSavedRef = useRef<string>("")

  useEffect(() => {
    if (!open) return
    setDraft(lesson ?? newDraftLesson())
    setNewMaterial("")
    setNewStep("")
  }, [open, lesson])

  // Autosave every ~3s if dirty — "always saved" per the design voice.
  useEffect(() => {
    if (!open) return
    const serialized = JSON.stringify(draft)
    if (serialized === lastSavedRef.current) return
    // Only autosave once there's something worth saving.
    if (!draft.title.trim() && draft.kidIds.length === 0 && draft.planSteps.length === 0) return
    const t = setTimeout(() => {
      const saved = upsertLesson({ ...draft, status: draft.status ?? "draft" })
      lastSavedRef.current = JSON.stringify(saved)
      onSaved?.(saved)
    }, 3000)
    return () => clearTimeout(t)
  }, [draft, open, onSaved])

  const canPublish = useMemo(
    () => Boolean(draft.title.trim() && draft.subject && draft.kidIds.length > 0),
    [draft],
  )

  const toggleKid = useCallback((kidId: string) => {
    setDraft((d) => ({
      ...d,
      kidIds: d.kidIds.includes(kidId)
        ? d.kidIds.filter((k) => k !== kidId)
        : [...d.kidIds, kidId],
    }))
  }, [])

  const setSubject = useCallback((s: string) => setDraft((d) => ({ ...d, subject: s })), [])

  const addMaterial = useCallback(() => {
    const m = newMaterial.trim()
    if (!m) return
    setDraft((d) => ({ ...d, materials: [...d.materials, m] }))
    setNewMaterial("")
  }, [newMaterial])

  const removeMaterial = useCallback((m: string) => {
    setDraft((d) => ({ ...d, materials: d.materials.filter((x) => x !== m) }))
  }, [])

  const addStep = useCallback(() => {
    const text = newStep.trim()
    if (!text) return
    setDraft((d) => ({
      ...d,
      planSteps: [...d.planSteps, { id: uid("stp"), text }],
    }))
    setNewStep("")
  }, [newStep])

  const updateStep = useCallback((id: string, text: string) => {
    setDraft((d) => ({
      ...d,
      planSteps: d.planSteps.map((s) => (s.id === id ? { ...s, text } : s)),
    }))
  }, [])

  const removeStep = useCallback((id: string) => {
    setDraft((d) => ({ ...d, planSteps: d.planSteps.filter((s) => s.id !== id) }))
  }, [])

  const moveStep = useCallback((id: string, dir: -1 | 1) => {
    setDraft((d) => {
      const idx = d.planSteps.findIndex((s) => s.id === id)
      if (idx < 0) return d
      const target = idx + dir
      if (target < 0 || target >= d.planSteps.length) return d
      const arr = [...d.planSteps]
      const [it] = arr.splice(idx, 1)
      arr.splice(target, 0, it)
      return { ...d, planSteps: arr }
    })
  }, [])

  const handleSaveDraft = useCallback(() => {
    const saved = upsertLesson({ ...draft, status: "draft" })
    onSaved?.(saved)
    onOpenChange(false)
  }, [draft, onSaved, onOpenChange])

  const handlePublish = useCallback(() => {
    if (!canPublish) return
    const saved = upsertLesson({ ...draft, status: draft.status === "archived" ? "archived" : draft.status })
    onSaved?.(saved)
    onScheduleClick?.(saved)
  }, [draft, canPublish, onSaved, onScheduleClick])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-0 gap-0 border-[var(--rule)]"
        aria-describedby={undefined}
      >
        <DialogHeader className="px-8 pt-8 pb-2 text-left space-y-1">
          <DialogTitle className="font-display text-3xl font-normal tracking-tight text-[var(--ink)]">
            {draft.title.trim() ? "Edit lesson" : "New lesson"}
          </DialogTitle>
          <p className="text-sm text-[var(--ink-3)]">
            A title is enough for now — you can come back to it.
          </p>
        </DialogHeader>

        <div className="px-8 pb-6 space-y-5">
          {/* TITLE */}
          <div className="space-y-2">
            <label className="atoz-eyebrow block" htmlFor="les-title">Title</label>
            <Input
              id="les-title"
              autoFocus
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value.slice(0, 120) }))}
              placeholder="e.g. Fractions with paper pizzas"
              className="font-display text-xl h-12"
            />
          </div>

          {/* KIDS */}
          <fieldset className="space-y-2">
            <legend className="atoz-eyebrow">Kids · pick one or more</legend>
            <div className="flex flex-wrap gap-2">
              {kids.map((kid, i) => (
                <KidChip
                  key={kid.id}
                  name={kid.name}
                  color={colorForKid(kid, i)}
                  active={draft.kidIds.includes(kid.id)}
                  onClick={() => toggleKid(kid.id)}
                />
              ))}
              {kids.length === 0 && (
                <p className="text-sm text-[var(--ink-3)]">Add a child in Family first.</p>
              )}
            </div>
          </fieldset>

          {/* SUBJECT */}
          <fieldset className="space-y-2">
            <legend className="atoz-eyebrow">Subject</legend>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <Chip
                  key={s}
                  active={draft.subject === s}
                  tone={draft.subject === s ? "terracotta" : "sage"}
                  onClick={() => setSubject(s)}
                >
                  {s}
                </Chip>
              ))}
            </div>
          </fieldset>

          {/* DURATION + GOAL */}
          <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3">
            <div className="space-y-2">
              <label className="atoz-eyebrow block" htmlFor="les-duration">Duration</label>
              <Input
                id="les-duration"
                type="number"
                inputMode="numeric"
                min={1}
                max={480}
                placeholder="45"
                value={draft.durationMin ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    durationMin: e.target.value ? Number.parseInt(e.target.value, 10) : undefined,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="atoz-eyebrow block" htmlFor="les-goal">Goal <span className="text-[var(--ink-4)] normal-case tracking-normal font-normal">(optional)</span></label>
              <Textarea
                id="les-goal"
                rows={2}
                value={draft.goal ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, goal: e.target.value.slice(0, 500) }))}
                placeholder="What will they understand at the end?"
              />
            </div>
          </div>

          {/* MATERIALS */}
          <fieldset className="space-y-2">
            <legend className="atoz-eyebrow">Materials <span className="text-[var(--ink-4)] normal-case tracking-normal font-normal">(optional)</span></legend>
            <div className="flex flex-wrap gap-2">
              {draft.materials.map((m) => (
                <span
                  key={m}
                  className="atoz-pill atoz-pill--sage inline-flex items-center gap-1 !pr-1"
                >
                  {m}
                  <button
                    type="button"
                    onClick={() => removeMaterial(m)}
                    aria-label={`Remove ${m}`}
                    className="ml-1 rounded-full hover:bg-white/50 p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <div className="flex gap-1">
                <Input
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addMaterial()
                    }
                  }}
                  placeholder="+ add material"
                  className="h-8 w-40 text-sm"
                />
                <Button variant="ghost" size="sm" onClick={addMaterial} disabled={!newMaterial.trim()}>
                  Add
                </Button>
              </div>
            </div>
          </fieldset>

          {/* PLAN STEPS */}
          <fieldset className="space-y-2">
            <legend className="atoz-eyebrow">Plan <span className="text-[var(--ink-4)] normal-case tracking-normal font-normal">(optional, add or reorder)</span></legend>
            <ol className="space-y-2">
              {draft.planSteps.map((step, idx) => (
                <li
                  key={step.id}
                  className="group flex items-center gap-2 rounded-lg border border-[var(--rule)] bg-white p-2"
                >
                  <button
                    type="button"
                    aria-label="Reorder"
                    className="text-[var(--ink-4)] cursor-grab active:cursor-grabbing"
                    onClick={() => moveStep(step.id, -1)}
                  >
                    <GripVertical size={14} />
                  </button>
                  <span className="text-xs text-[var(--ink-4)] w-5 text-right tabular-nums">{idx + 1}</span>
                  <Input
                    value={step.text}
                    onChange={(e) => updateStep(step.id, e.target.value)}
                    className="h-8 border-transparent shadow-none focus-visible:border-[var(--sage-d)] focus-visible:ring-0"
                  />
                  <div className="hidden group-hover:flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveStep(step.id, -1)}
                      className="text-xs text-[var(--ink-3)] px-1"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStep(step.id, 1)}
                      className="text-xs text-[var(--ink-3)] px-1"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStep(step.id)}
                    aria-label="Remove step"
                    className="text-[var(--ink-4)] hover:text-[var(--terracotta-d)] p-1"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ol>
            <div className="flex gap-2 pt-1">
              <Input
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addStep()
                  }
                }}
                placeholder="Add a step · press Enter"
                className="h-9"
              />
              <Button variant="ghost" onClick={addStep} disabled={!newStep.trim()}>
                <Plus size={14} className="mr-1" /> Add
              </Button>
            </div>
          </fieldset>
        </div>

        <div className="flex items-center justify-between gap-2 px-8 py-5 border-t border-[var(--rule)] bg-[var(--linen)]/40 rounded-b-2xl">
          <Button variant="ghost" onClick={handleSaveDraft}>
            Save as draft
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
            <Button
              onClick={handlePublish}
              disabled={!canPublish}
              className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white"
            >
              {canPublish ? "Save & schedule" : "Title + subject + kid to publish"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
