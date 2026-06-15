"use client"

/**
 * /filings/new — generate a new state-compliance filing.
 *
 * Phase 8.1 ships Oregon notification only. Form is minimal: parent
 * identity (auto-filled from auth + branding), child identity (pick from
 * the existing kid roster or type), instruction start date, optional
 * notes. On submit we call generateFiling, then route to /filings.
 */

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, FileText } from "lucide-react"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Chip } from "@/components/primitives"
import { useAuth } from "@/contexts/auth-context"
import { useKids } from "@/lib/demo-kids"
import { generateFiling } from "@/app/actions/filings-actions"
import { useToast } from "@/hooks/use-toast"

const FILING_OPTIONS = [
  { state: "or" as const, filingType: "notification", label: "Oregon Notification of Intent" },
]

function currentSchoolYear(): string {
  const now = new Date()
  const year = now.getFullYear()
  // School year flips in July
  const start = now.getMonth() >= 6 ? year : year - 1
  return `${start}-${start + 1}`
}

export default function NewFilingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const kids = useKids()
  const [pending, startTransition] = useTransition()

  const [selected, setSelected] = useState(FILING_OPTIONS[0])
  const [schoolYear, setSchoolYear] = useState(currentSchoolYear())
  const [selectedKidId, setSelectedKidId] = useState<string>("")
  const [childName, setChildName] = useState("")
  const [childBirthDate, setChildBirthDate] = useState("")
  const [childGrade, setChildGrade] = useState("")
  const [parentName, setParentName] = useState("")
  const [parentPhone, setParentPhone] = useState("")
  const [parentAddress1, setParentAddress1] = useState("")
  const [parentCity, setParentCity] = useState("")
  const [parentState, setParentState] = useState("")
  const [parentZip, setParentZip] = useState("")
  const [instructionStart, setInstructionStart] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState("")

  // Hydrate parent name from auth user once it's available.
  useEffect(() => {
    if (user?.displayName && !parentName) setParentName(user.displayName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.displayName])

  // Auto-fill child fields when a kid from the roster is picked.
  useEffect(() => {
    if (!selectedKidId) return
    const kid = kids.find((k) => k.id === selectedKidId)
    if (!kid) return
    setChildName(kid.name)
    if (kid.age !== undefined) setChildGrade(estimateGrade(kid.age))
  }, [selectedKidId, kids])

  const canSubmit =
    childName.trim().length > 0 && parentName.trim().length > 0 && !pending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    startTransition(async () => {
      const ageNum = childBirthDate ? estimateAge(childBirthDate) : undefined
      const result = await generateFiling({
        state: selected.state,
        filingType: selected.filingType,
        schoolYear,
        childId: selectedKidId || undefined,
        child: {
          name: childName.trim(),
          birthDate: childBirthDate || undefined,
          age: ageNum,
          grade: childGrade || undefined,
        },
        parent: {
          displayName: parentName.trim(),
          email: user?.email ?? undefined,
          phone: parentPhone || undefined,
          addressLine1: parentAddress1 || undefined,
          city: parentCity || undefined,
          addressState: parentState || undefined,
          zip: parentZip || undefined,
        },
        instructionStartDate: instructionStart || undefined,
        notes: notes.trim() || undefined,
      })
      if (!result.success) {
        toast({ title: "Could not generate filing", description: result.error })
        return
      }
      toast({ title: "Filing generated", description: `${selected.label} ready to download.` })
      router.push("/filings")
    })
  }

  return (
    <div className="min-h-screen bg-[var(--linen)] text-[var(--ink)] font-sans">
      <Navigation />
      <main className="atoz-page max-w-[680px]">
        <Link
          href="/filings"
          className="inline-flex items-center gap-1 text-sm text-[var(--ink-3)] hover:text-[var(--ink)] mb-4"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Back to Filings
        </Link>
        <header className="mb-8">
          <div className="atoz-eyebrow">Compliance · New filing</div>
          <h1 className="font-display text-4xl font-light tracking-tighter leading-[1.05] mt-2">
            Generate a filing.
          </h1>
          <p className="text-[var(--ink-2)] mt-2">
            We'll auto-populate from what you've logged. Verify before submitting — every PDF
            includes a footer with the data version and a disclaimer.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Field label="Filing type">
            <div className="flex flex-wrap gap-2">
              {FILING_OPTIONS.map((opt) => (
                <Chip
                  key={`${opt.state}:${opt.filingType}`}
                  active={selected.state === opt.state && selected.filingType === opt.filingType}
                  onClick={() => setSelected(opt)}
                >
                  {opt.label}
                </Chip>
              ))}
            </div>
            <p className="text-xs text-[var(--ink-4)] mt-2">
              <FileText size={11} className="inline mr-1" aria-hidden="true" />
              NY IHIP + quarterlies, PA Act 169 portfolio, MA education plan land next.
            </p>
          </Field>

          <Field label="School year">
            <Input
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              placeholder="2026-2027"
              maxLength={9}
            />
          </Field>

          <fieldset className="space-y-3 border-t border-[var(--rule)] pt-6">
            <legend className="font-display text-lg font-medium">Child</legend>
            {kids.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                <Chip active={selectedKidId === ""} onClick={() => setSelectedKidId("")}>
                  Type manually
                </Chip>
                {kids.map((k) => (
                  <Chip
                    key={k.id}
                    active={selectedKidId === k.id}
                    onClick={() => setSelectedKidId(k.id)}
                  >
                    {k.name}
                  </Chip>
                ))}
              </div>
            )}
            <Field label="Full name" required>
              <Input value={childName} onChange={(e) => setChildName(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date of birth">
                <Input
                  type="date"
                  value={childBirthDate}
                  onChange={(e) => setChildBirthDate(e.target.value)}
                />
              </Field>
              <Field label="Grade">
                <Input
                  value={childGrade}
                  onChange={(e) => setChildGrade(e.target.value)}
                  placeholder="K, 1, 2, …"
                />
              </Field>
            </div>
          </fieldset>

          <fieldset className="space-y-3 border-t border-[var(--rule)] pt-6">
            <legend className="font-display text-lg font-medium">Parent / Guardian</legend>
            <Field label="Name" required>
              <Input value={parentName} onChange={(e) => setParentName(e.target.value)} />
            </Field>
            <Field label="Mailing address">
              <Input
                value={parentAddress1}
                onChange={(e) => setParentAddress1(e.target.value)}
                placeholder="Street"
              />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="City">
                <Input value={parentCity} onChange={(e) => setParentCity(e.target.value)} />
              </Field>
              <Field label="State">
                <Input
                  value={parentState}
                  onChange={(e) => setParentState(e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="OR"
                  maxLength={2}
                />
              </Field>
              <Field label="ZIP">
                <Input
                  value={parentZip}
                  onChange={(e) => setParentZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  placeholder="97701"
                  maxLength={5}
                />
              </Field>
            </div>
            <Field label="Phone">
              <Input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
            </Field>
          </fieldset>

          <fieldset className="space-y-3 border-t border-[var(--rule)] pt-6">
            <legend className="font-display text-lg font-medium">Instruction</legend>
            <Field label="Began home instruction">
              <Input
                type="date"
                value={instructionStart}
                onChange={(e) => setInstructionStart(e.target.value)}
              />
            </Field>
            <Field label="Notes (optional)">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Anything you want on the filing — e.g., previous school, transition reason"
              />
            </Field>
          </fieldset>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--rule)]">
            <Button asChild variant="ghost">
              <Link href="/filings">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white"
            >
              {pending ? "Generating…" : "Generate filing"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <Label className="font-medium">
        {label}
        {required && <span className="text-[var(--terracotta-d)] ml-1">*</span>}
      </Label>
      {children}
    </div>
  )
}

function estimateAge(birthIso: string): number | undefined {
  const d = new Date(birthIso)
  if (Number.isNaN(d.getTime())) return undefined
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1
  return age
}

function estimateGrade(age: number): string {
  if (age <= 5) return "K"
  return String(age - 5)
}
