"use client"

/**
 * Create a co-op. Phase 7 minimum form: name, description, group type,
 * philosophy, age groups, subjects, schedule, ZIP, private toggle.
 *
 * ZIP-to-coords lookup happens on the server in `createGroup`; the form
 * itself stays small and validates only the basics so the empty state is
 * truly empty (no nudging anti-goals).
 */

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Chip } from "@/components/primitives"
import { ArrowLeft, Plus } from "lucide-react"
import { createGroup } from "@/app/actions/group-discovery-actions"
import { useToast } from "@/hooks/use-toast"
import { isValidZip } from "@/lib/zipcodes"

const GROUP_TYPES = [
  { v: "co-op", label: "Co-op" },
  { v: "learning-circle", label: "Learning circle" },
  { v: "study-group", label: "Study group" },
]

const PHILOSOPHIES = [
  "classical",
  "charlotte_mason",
  "montessori",
  "reggio",
  "waldorf",
  "unschooling",
  "eclectic",
]

const AGE_GROUPS = ["under-5", "5-7", "8-10", "11-13", "14-17"]

const SUBJECTS = [
  "Mathematics",
  "Language Arts",
  "Science",
  "History",
  "Art",
  "Music",
  "Physical Education",
  "Foreign Language",
]

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const FREQS = ["weekly", "biweekly", "monthly"]

function humanizePhilosophy(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function NewCommunityGroupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, startTransition] = useTransition()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [groupType, setGroupType] = useState("co-op")
  const [philosophy, setPhilosophy] = useState<string | null>(null)
  const [ageGroups, setAgeGroups] = useState<string[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [scheduleDay, setScheduleDay] = useState<string | null>(null)
  const [meetingFrequency, setMeetingFrequency] = useState<string | null>(null)
  const [zipCode, setZipCode] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)

  const toggleAge = (a: string) =>
    setAgeGroups((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))
  const toggleSubject = (s: string) =>
    setSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))

  const zipInvalid = zipCode.length > 0 && !isValidZip(zipCode)
  const canSubmit = name.trim().length > 0 && !zipInvalid && !pending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    startTransition(async () => {
      const result = await createGroup({
        name,
        description: description || undefined,
        groupType,
        philosophy: philosophy ?? undefined,
        ageGroups: ageGroups.length ? ageGroups : undefined,
        subjectsOffered: subjects.length ? subjects : undefined,
        scheduleDay: scheduleDay ?? undefined,
        meetingFrequency: meetingFrequency ?? undefined,
        zipCode: zipCode || undefined,
        isPrivate,
      })
      if (!result.success) {
        toast({ title: "Could not create group", description: result.error })
        return
      }
      toast({ title: "Group created", description: `"${name}" is live.` })
      router.push(`/community/groups/${result.groupId}`)
    })
  }

  return (
    <div className="min-h-screen bg-[var(--linen)] text-[var(--ink)] font-sans">
      <Navigation />
      <main className="atoz-page max-w-[680px]">
        <Link
          href="/community"
          className="inline-flex items-center gap-1 text-sm text-[var(--ink-3)] hover:text-[var(--ink)] mb-4"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Back to Community
        </Link>
        <header className="mb-8">
          <div className="atoz-eyebrow">Community</div>
          <h1 className="font-display text-4xl font-light tracking-tighter leading-[1.05] mt-2">
            Start a co-op.
          </h1>
          <p className="text-[var(--ink-2)] mt-2">
            The basics. You can refine the details after — name, type, and ZIP are enough to start.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Field id="name" label="Group name" required>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="The Northside Co-op"
              maxLength={120}
              autoFocus
            />
          </Field>

          <Field id="description" label="What's this group about?">
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="One paragraph. What you teach, who you welcome, what a Tuesday looks like."
              rows={4}
              maxLength={1000}
            />
          </Field>

          <Field id="groupType" label="Group type">
            <div className="flex flex-wrap gap-2" role="radiogroup">
              {GROUP_TYPES.map((t) => (
                <Chip key={t.v} active={groupType === t.v} onClick={() => setGroupType(t.v)}>
                  {t.label}
                </Chip>
              ))}
            </div>
          </Field>

          <Field id="philosophy" label="Philosophy (optional)">
            <div className="flex flex-wrap gap-2">
              {PHILOSOPHIES.map((p) => (
                <Chip
                  key={p}
                  active={philosophy === p}
                  onClick={() => setPhilosophy((prev) => (prev === p ? null : p))}
                >
                  {humanizePhilosophy(p)}
                </Chip>
              ))}
            </div>
          </Field>

          <Field id="ageGroups" label="Age groups (optional, pick any)">
            <div className="flex flex-wrap gap-2">
              {AGE_GROUPS.map((a) => (
                <Chip key={a} active={ageGroups.includes(a)} onClick={() => toggleAge(a)}>
                  {a}
                </Chip>
              ))}
            </div>
          </Field>

          <Field id="subjects" label="Subjects offered (optional)">
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <Chip key={s} active={subjects.includes(s)} onClick={() => toggleSubject(s)}>
                  {s}
                </Chip>
              ))}
            </div>
          </Field>

          <Field id="scheduleDay" label="Meeting day (optional)">
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <Chip
                  key={d}
                  active={scheduleDay === d}
                  onClick={() => setScheduleDay((prev) => (prev === d ? null : d))}
                >
                  {d}
                </Chip>
              ))}
            </div>
          </Field>

          <Field id="meetingFrequency" label="How often?">
            <div className="flex flex-wrap gap-2">
              {FREQS.map((f) => (
                <Chip
                  key={f}
                  active={meetingFrequency === f}
                  onClick={() => setMeetingFrequency((prev) => (prev === f ? null : f))}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Chip>
              ))}
            </div>
          </Field>

          <Field id="zipCode" label="ZIP code (helps families find you)">
            <Input
              id="zipCode"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder="55105"
              inputMode="numeric"
              maxLength={5}
              aria-invalid={zipInvalid ? true : undefined}
            />
            {zipInvalid && (
              <p className="text-xs text-[var(--terracotta-d)] mt-1">Use a 5-digit US ZIP.</p>
            )}
          </Field>

          <Field id="isPrivate" label="">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="isPrivate" className="font-medium">
                  Private group
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Hidden from discovery. New members join only by direct invite.
                </p>
              </div>
              <Switch
                id="isPrivate"
                aria-label="Private group"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
              />
            </div>
          </Field>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--rule)]">
            <Button asChild variant="ghost">
              <Link href="/community">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white"
            >
              <Plus size={14} className="mr-1" aria-hidden="true" />
              {pending ? "Creating…" : "Create group"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="font-medium">
          {label}
          {required && <span className="text-[var(--terracotta-d)] ml-1">*</span>}
        </Label>
      )}
      {children}
    </div>
  )
}
