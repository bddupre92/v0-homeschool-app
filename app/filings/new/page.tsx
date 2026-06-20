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
  { state: "ny" as const, filingType: "ihip", label: "NY IHIP (annual)" },
  { state: "ny" as const, filingType: "quarterly", label: "NY Quarterly Report" },
  { state: "pa" as const, filingType: "portfolio", label: "PA Act 169 Portfolio" },
  { state: "ma" as const, filingType: "plan", label: "MA Home Education Plan" },
  { state: "or" as const, filingType: "notification", label: "Oregon Notification of Intent" },
  { state: "or" as const, filingType: "test-results", label: "Oregon Test Results" },
]

const NY_REQUIRED_SUBJECTS_K6 = [
  "Arithmetic",
  "Reading",
  "Spelling",
  "Writing",
  "English",
  "Geography",
  "US History",
  "Science",
  "Health Education",
  "Music",
  "Visual Arts",
  "Physical Education",
]

const NY_REQUIRED_SUBJECTS_7_12 = [
  "English",
  "History & Geography",
  "Mathematics",
  "Science",
  "Health Education",
  "Music",
  "Visual Arts",
  "Physical Education",
  "Library Skills",
  "Technology",
]

const PA_REQUIRED_SUBJECTS = [
  "English (reading)",
  "English (writing)",
  "English (spelling)",
  "Arithmetic",
  "Science",
  "Geography",
  "Civics",
  "Safety",
  "Health & Physiology",
  "Art",
  "Music",
  "Physical Education",
]

const MA_REQUIRED_SUBJECTS = [
  "Reading",
  "Writing",
  "English language and grammar",
  "Mathematics",
  "Geography",
  "United States history",
  "Science",
  "Civics",
  "Physical education",
  "Health",
  "Art",
  "Music",
]

interface CurriculumLineState {
  subject: string
  materials: string
}
interface HoursLineState {
  subject: string
  minutes: number
}
interface SubjectProgressLineState {
  subject: string
  hoursThisPeriod: number
  narrative: string
  grade: string
}
interface SampleLineState {
  date: string
  title: string
  subject: string
}
interface TestResultLineState {
  testName: string
  date: string
  grade: string
}

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

  // Filing-type-specific fields
  const [quarter, setQuarter] = useState(1)
  const [periodStart, setPeriodStart] = useState("")
  const [periodEnd, setPeriodEnd] = useState("")
  const [daysOfInstruction, setDaysOfInstruction] = useState<string>("")
  const [curriculum, setCurriculum] = useState<CurriculumLineState[]>([])
  const [hoursBySubject, setHoursBySubject] = useState<HoursLineState[]>([])
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgressLineState[]>([])
  const [samples, setSamples] = useState<SampleLineState[]>([])
  const [testResults, setTestResults] = useState<TestResultLineState[]>([])
  const [evaluatorName, setEvaluatorName] = useState("")
  const [evaluatorCert, setEvaluatorCert] = useState("")
  const [evaluatorDate, setEvaluatorDate] = useState("")

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

  // When the filing type changes, seed per-state subject lists. Preserves
  // user input — if any current row has typed content, leave the array
  // alone; otherwise replace with the new filing type's expected subjects.
  useEffect(() => {
    const hasTypedCurriculum = curriculum.some((c) => c.materials.trim().length > 0)
    const hasTypedHours = hoursBySubject.some((h) => h.minutes > 0)
    const hasTypedProgress = subjectProgress.some(
      (p) => p.hoursThisPeriod > 0 || p.narrative.trim() || p.grade.trim(),
    )

    if (selected.state === "ny" && selected.filingType === "ihip" && !hasTypedCurriculum) {
      const isUpper = childGrade && parseInt(childGrade, 10) >= 7
      const subjects = isUpper ? NY_REQUIRED_SUBJECTS_7_12 : NY_REQUIRED_SUBJECTS_K6
      setCurriculum(subjects.map((subject) => ({ subject, materials: "" })))
    }
    if (
      selected.state === "ny" &&
      selected.filingType === "quarterly" &&
      !hasTypedProgress
    ) {
      const isUpper = childGrade && parseInt(childGrade, 10) >= 7
      const subjects = isUpper ? NY_REQUIRED_SUBJECTS_7_12 : NY_REQUIRED_SUBJECTS_K6
      setSubjectProgress(
        subjects.map((subject) => ({ subject, hoursThisPeriod: 0, narrative: "", grade: "" })),
      )
    }
    if (
      selected.state === "pa" &&
      selected.filingType === "portfolio" &&
      !hasTypedHours
    ) {
      setHoursBySubject(PA_REQUIRED_SUBJECTS.map((subject) => ({ subject, minutes: 0 })))
    }
    if (
      selected.state === "ma" &&
      selected.filingType === "plan" &&
      !hasTypedCurriculum
    ) {
      setCurriculum(MA_REQUIRED_SUBJECTS.map((subject) => ({ subject, materials: "" })))
      // MA isn't subject-by-subject hours — seed a single "Total weekly hours" line.
      if (!hasTypedHours) {
        setHoursBySubject([{ subject: "Total weekly hours", minutes: 0 }])
      }
    }
    if (
      selected.state === "or" &&
      selected.filingType === "test-results" &&
      testResults.length === 0
    ) {
      setTestResults([{ testName: "", date: "", grade: childGrade ?? "" }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.state, selected.filingType, childGrade])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    startTransition(async () => {
      const ageNum = childBirthDate ? estimateAge(childBirthDate) : undefined
      const result = await generateFiling({
        state: selected.state,
        filingType: selected.filingType,
        schoolYear,
        quarter: selected.filingType === "quarterly" ? quarter : undefined,
        periodStartDate: periodStart || undefined,
        periodEndDate: periodEnd || undefined,
        daysOfInstruction: daysOfInstruction ? Number(daysOfInstruction) : undefined,
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
        curriculumBySubject: curriculum.filter((c) => c.materials.trim()),
        hoursBySubject: hoursBySubject.filter((h) => h.minutes > 0),
        subjectProgress: subjectProgress
          .filter((p) => p.hoursThisPeriod > 0 || p.narrative.trim() || p.grade.trim())
          .map((p) => ({
            subject: p.subject,
            hoursThisPeriod: p.hoursThisPeriod || undefined,
            narrative: p.narrative.trim() || undefined,
            grade: p.grade.trim() || undefined,
          })),
        portfolioSamples: samples.filter((s) => s.title.trim()),
        testResults: testResults.filter((t) => t.testName.trim()),
        evaluator: evaluatorName.trim()
          ? {
              name: evaluatorName.trim(),
              certificationNumber: evaluatorCert.trim() || undefined,
              evaluationDate: evaluatorDate || undefined,
            }
          : undefined,
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
              Six filings shipped across four states. More states by demand.
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

          {selected.state === "ny" && selected.filingType === "ihip" && (
            <fieldset className="space-y-3 border-t border-[var(--rule)] pt-6">
              <legend className="font-display text-lg font-medium">Curriculum by subject</legend>
              <p className="text-xs text-[var(--ink-3)]">
                List the materials, syllabi, or plan of instruction for each required subject. The
                NY IHIP requires every § 100.10 subject to be addressed.
              </p>
              {curriculum.map((line, idx) => (
                <div key={line.subject} className="space-y-1">
                  <Label className="text-sm font-medium">{line.subject}</Label>
                  <Textarea
                    value={line.materials}
                    rows={2}
                    onChange={(e) => {
                      const next = [...curriculum]
                      next[idx] = { ...next[idx], materials: e.target.value }
                      setCurriculum(next)
                    }}
                    placeholder="Curriculum / materials"
                  />
                </div>
              ))}
            </fieldset>
          )}

          {selected.state === "ny" && selected.filingType === "quarterly" && (
            <fieldset className="space-y-3 border-t border-[var(--rule)] pt-6">
              <legend className="font-display text-lg font-medium">Quarter</legend>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((q) => (
                  <Chip key={q} active={quarter === q} onClick={() => setQuarter(q)}>
                    Q{q}
                  </Chip>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Period start">
                  <Input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                  />
                </Field>
                <Field label="Period end">
                  <Input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Days of instruction in this period">
                <Input
                  type="number"
                  min="0"
                  value={daysOfInstruction}
                  onChange={(e) => setDaysOfInstruction(e.target.value)}
                  placeholder="45"
                />
              </Field>

              <Label className="font-medium mt-4 block">Progress by subject</Label>
              <p className="text-xs text-[var(--ink-3)]">
                Hours covered this quarter, plus a brief narrative or grade per subject.
              </p>
              {subjectProgress.map((row, idx) => (
                <div key={row.subject} className="rounded-lg border border-[var(--rule)] p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{row.subject}</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        className="w-20"
                        value={row.hoursThisPeriod || ""}
                        onChange={(e) => {
                          const next = [...subjectProgress]
                          next[idx] = { ...next[idx], hoursThisPeriod: Number(e.target.value) || 0 }
                          setSubjectProgress(next)
                        }}
                        placeholder="hrs"
                      />
                      <Input
                        className="w-20"
                        value={row.grade}
                        onChange={(e) => {
                          const next = [...subjectProgress]
                          next[idx] = { ...next[idx], grade: e.target.value }
                          setSubjectProgress(next)
                        }}
                        placeholder="grade"
                      />
                    </div>
                  </div>
                  <Textarea
                    value={row.narrative}
                    rows={2}
                    onChange={(e) => {
                      const next = [...subjectProgress]
                      next[idx] = { ...next[idx], narrative: e.target.value }
                      setSubjectProgress(next)
                    }}
                    placeholder="What was covered. e.g., long division, chapters 4-6 of Charlotte's Web."
                  />
                </div>
              ))}

              {quarter === 4 && (
                <div className="border-t border-[var(--rule)] pt-4 mt-4">
                  <Label className="font-medium block">Annual assessment (required Q4)</Label>
                  <p className="text-xs text-[var(--ink-3)] mb-2">
                    Standardized test results or written evaluation — listed here, attached
                    separately.
                  </p>
                  {testResults.map((t, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
                      <Input
                        value={t.testName}
                        onChange={(e) => {
                          const next = [...testResults]
                          next[idx] = { ...next[idx], testName: e.target.value }
                          setTestResults(next)
                        }}
                        placeholder="Test name"
                      />
                      <Input
                        type="date"
                        value={t.date}
                        onChange={(e) => {
                          const next = [...testResults]
                          next[idx] = { ...next[idx], date: e.target.value }
                          setTestResults(next)
                        }}
                      />
                      <Input
                        value={t.grade}
                        onChange={(e) => {
                          const next = [...testResults]
                          next[idx] = { ...next[idx], grade: e.target.value }
                          setTestResults(next)
                        }}
                        placeholder="Grade / score"
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setTestResults((prev) => [...prev, { testName: "", date: "", grade: "" }])
                    }
                  >
                    Add test result
                  </Button>
                </div>
              )}
            </fieldset>
          )}

          {selected.state === "pa" && selected.filingType === "portfolio" && (
            <fieldset className="space-y-3 border-t border-[var(--rule)] pt-6">
              <legend className="font-display text-lg font-medium">Portfolio summary</legend>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Period start">
                  <Input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                  />
                </Field>
                <Field label="Period end">
                  <Input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Days of instruction (target: 180)">
                <Input
                  type="number"
                  min="0"
                  value={daysOfInstruction}
                  onChange={(e) => setDaysOfInstruction(e.target.value)}
                  placeholder="180"
                />
              </Field>

              <Label className="font-medium mt-4 block">Hours by required subject</Label>
              <p className="text-xs text-[var(--ink-3)]">Annual target: 900 hrs (K-6) or 990 hrs (7-12).</p>
              {hoursBySubject.map((row, idx) => (
                <div key={row.subject} className="flex items-center justify-between gap-2">
                  <span className="text-sm flex-1">{row.subject}</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    className="w-24"
                    value={(row.minutes / 60).toFixed(1)}
                    onChange={(e) => {
                      const next = [...hoursBySubject]
                      next[idx] = { ...next[idx], minutes: Math.round(Number(e.target.value) * 60) || 0 }
                      setHoursBySubject(next)
                    }}
                    placeholder="hrs"
                  />
                </div>
              ))}

              <Label className="font-medium mt-4 block">Work samples (optional)</Label>
              {samples.map((s, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_2fr_1fr_auto] gap-2">
                  <Input
                    type="date"
                    value={s.date}
                    onChange={(e) => {
                      const next = [...samples]
                      next[idx] = { ...next[idx], date: e.target.value }
                      setSamples(next)
                    }}
                  />
                  <Input
                    value={s.title}
                    onChange={(e) => {
                      const next = [...samples]
                      next[idx] = { ...next[idx], title: e.target.value }
                      setSamples(next)
                    }}
                    placeholder="Sample title"
                  />
                  <Input
                    value={s.subject}
                    onChange={(e) => {
                      const next = [...samples]
                      next[idx] = { ...next[idx], subject: e.target.value }
                      setSamples(next)
                    }}
                    placeholder="Subject"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setSamples((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSamples((prev) => [...prev, { date: "", title: "", subject: "" }])}
              >
                Add sample
              </Button>

              <div className="border-t border-[var(--rule)] pt-4 mt-4">
                <Label className="font-medium block">Standardized test results (grades 3/5/8)</Label>
                {testResults.map((t, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 mb-2 mt-2">
                    <Input
                      value={t.testName}
                      onChange={(e) => {
                        const next = [...testResults]
                        next[idx] = { ...next[idx], testName: e.target.value }
                        setTestResults(next)
                      }}
                      placeholder="Test name"
                    />
                    <Input
                      type="date"
                      value={t.date}
                      onChange={(e) => {
                        const next = [...testResults]
                        next[idx] = { ...next[idx], date: e.target.value }
                        setTestResults(next)
                      }}
                    />
                    <Input
                      value={t.grade}
                      onChange={(e) => {
                        const next = [...testResults]
                        next[idx] = { ...next[idx], grade: e.target.value }
                        setTestResults(next)
                      }}
                      placeholder="Score"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setTestResults((prev) => [...prev, { testName: "", date: "", grade: "" }])
                  }
                >
                  Add test result
                </Button>
              </div>

              <div className="border-t border-[var(--rule)] pt-4 mt-4">
                <Label className="font-medium block">Evaluator (optional — fill if known)</Label>
                <p className="text-xs text-[var(--ink-3)] mb-2">
                  Per § 13-1327.1(e), evaluator must be a PA-certified teacher (2+ yrs), licensed
                  psychologist, or superintendent-authorized.
                </p>
                <Input
                  value={evaluatorName}
                  onChange={(e) => setEvaluatorName(e.target.value)}
                  placeholder="Evaluator full name"
                  className="mb-2"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={evaluatorCert}
                    onChange={(e) => setEvaluatorCert(e.target.value)}
                    placeholder="Certification #"
                  />
                  <Input
                    type="date"
                    value={evaluatorDate}
                    onChange={(e) => setEvaluatorDate(e.target.value)}
                  />
                </div>
              </div>
            </fieldset>
          )}

          {selected.state === "ma" && selected.filingType === "plan" && (
            <fieldset className="space-y-3 border-t border-[var(--rule)] pt-6">
              <legend className="font-display text-lg font-medium">Massachusetts plan</legend>
              <p className="text-xs text-[var(--ink-3)]">
                Submitted to your local school committee for prior approval. Each district uses
                its own format — this is a portable plan covering the four Charles criteria. Edit
                the sections to match your district's checklist before sending.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Period start">
                  <Input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                  />
                </Field>
                <Field label="Period end">
                  <Input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Planned days of instruction">
                <Input
                  type="number"
                  min="0"
                  value={daysOfInstruction}
                  onChange={(e) => setDaysOfInstruction(e.target.value)}
                  placeholder="180"
                />
              </Field>
              <Field label="Planned hours per week (all subjects combined)">
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={hoursBySubject[0] ? (hoursBySubject[0].minutes / 60).toString() : ""}
                  onChange={(e) => {
                    const mins = Math.round(Number(e.target.value) * 60) || 0
                    setHoursBySubject([{ subject: "Total weekly hours", minutes: mins }])
                  }}
                  placeholder="25"
                />
              </Field>

              <Label className="font-medium mt-4 block">Curriculum by subject</Label>
              <p className="text-xs text-[var(--ink-3)]">
                Massachusetts public schools cover these subjects; the plan must show at least
                equivalent scope. Empty rows are dropped from the PDF.
              </p>
              {curriculum.map((line, idx) => (
                <div key={line.subject} className="space-y-1">
                  <Label className="text-sm font-medium">{line.subject}</Label>
                  <Textarea
                    value={line.materials}
                    rows={2}
                    onChange={(e) => {
                      const next = [...curriculum]
                      next[idx] = { ...next[idx], materials: e.target.value }
                      setCurriculum(next)
                    }}
                    placeholder="Curriculum / materials"
                  />
                </div>
              ))}

              <Field label="Competence / qualifications (Charles criterion 1)">
                <Textarea
                  value={notes}
                  rows={3}
                  maxLength={1000}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={`Background of the teaching parent — education, experience, professional/career context, why you can teach this child. (If blank, a default paragraph stands in.)`}
                />
              </Field>
            </fieldset>
          )}

          {selected.state === "or" && selected.filingType === "test-results" && (
            <fieldset className="space-y-3 border-t border-[var(--rule)] pt-6">
              <legend className="font-display text-lg font-medium">Test results</legend>
              <p className="text-xs text-[var(--ink-3)]">
                Required at the end of grades 3, 5, 8, and 10. Approved tests: CAT, ITBS,
                Stanford, Metropolitan, TerraNova. Must be administered by a qualified neutral
                person (not the parent).
              </p>
              {testResults.map((t, idx) => (
                <div key={idx} className="rounded-lg border border-[var(--rule)] p-3 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      value={t.testName}
                      onChange={(e) => {
                        const next = [...testResults]
                        next[idx] = { ...next[idx], testName: e.target.value }
                        setTestResults(next)
                      }}
                      placeholder="Test name"
                    />
                    <Input
                      type="date"
                      value={t.date}
                      onChange={(e) => {
                        const next = [...testResults]
                        next[idx] = { ...next[idx], date: e.target.value }
                        setTestResults(next)
                      }}
                    />
                    <Input
                      value={t.grade}
                      onChange={(e) => {
                        const next = [...testResults]
                        next[idx] = { ...next[idx], grade: e.target.value }
                        setTestResults(next)
                      }}
                      placeholder="Grade"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setTestResults((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setTestResults((prev) => [...prev, { testName: "", date: "", grade: childGrade ?? "" }])
                }
              >
                Add another test result
              </Button>
            </fieldset>
          )}

          <fieldset className="space-y-3 border-t border-[var(--rule)] pt-6">
            <legend className="font-display text-lg font-medium">Instruction</legend>
            <Field label="Began home instruction">
              <Input
                type="date"
                value={instructionStart}
                onChange={(e) => setInstructionStart(e.target.value)}
              />
            </Field>
            {/* MA plan reuses `notes` for the Charles competence criterion, so we hide
                the universal notes textarea there to avoid two labels for the same field. */}
            {!(selected.state === "ma" && selected.filingType === "plan") && (
              <Field label="Notes (optional)">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Anything you want on the filing — e.g., previous school, transition reason"
                />
              </Field>
            )}
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
