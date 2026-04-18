"use client"

/**
 * Flow 03 — Invite a co-teacher.
 * Three-step wizard: role → scope (tutor only) → send.
 */

import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Chip, KidChip, Pill } from "@/components/primitives"
import {
  type Invite,
  type MemberRole,
  type MembershipScope,
  addInvite,
  newInvite,
} from "@/lib/atoz-store"
import { ChevronRight, Link as LinkIcon, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const KID_PALETTE = ["#d46e4d", "#7d9e7d", "#df8a27", "#4a90a4", "#8a6aa1"]

const ROLES: {
  role: MemberRole
  name: string
  sub: string
  permissions: string[]
  featured?: boolean
}[] = [
  {
    role: "coparent",
    name: "Co-parent",
    sub: "Your equal partner. Full access.",
    permissions: ["See & edit everything", "Log for any kid", "Invite others", "Billing"],
    featured: true,
  },
  {
    role: "tutor",
    name: "Tutor",
    sub: "Scoped to specific kids & subjects.",
    permissions: ["Teach assigned lessons", "Log their hours", "No other kids' portfolios", "No billing, no settings"],
  },
  {
    role: "grandparent",
    name: "Grandparent",
    sub: "Read-only view of portfolios.",
    permissions: ["View portfolios", "React to entries (♥)", "Receive weekly summary", "Never edits, never sees hours"],
  },
  {
    role: "group",
    name: "Co-op / group",
    sub: "Shared events only. Never kid data.",
    permissions: ["Events, shared schedules", "Co-op resources", "Never kid data", "Never hours or portfolios"],
  },
]

const SUBJECTS = ["Mathematics", "Language Arts", "Science", "Social Studies", "History", "Art", "Music", "Nature"]
const WEEKDAYS = [
  { i: 1, label: "Mon" },
  { i: 2, label: "Tue" },
  { i: 3, label: "Wed" },
  { i: 4, label: "Thu" },
  { i: 5, label: "Fri" },
  { i: 6, label: "Sat" },
  { i: 0, label: "Sun" },
]

interface Kid {
  id: string
  name: string
  color?: string
}

interface InviteFlowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kids: Kid[]
  onSent?: (invite: Invite) => void
}

type Step = 1 | 2 | 3

export default function InviteFlowDialog({ open, onOpenChange, kids, onSent }: InviteFlowDialogProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<Step>(1)
  const [role, setRole] = useState<MemberRole>("coparent")
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [note, setNote] = useState("")
  const [kidIds, setKidIds] = useState<string[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [weekdays, setWeekdays] = useState<number[]>([])
  const [permsOpen, setPermsOpen] = useState(false)

  const reset = () => {
    setStep(1)
    setRole("coparent")
    setName("")
    setContact("")
    setNote("")
    setKidIds([])
    setSubjects([])
    setWeekdays([])
    setPermsOpen(false)
  }

  const toggle = <T,>(arr: T[], item: T) =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]

  const scopeValid = role !== "tutor" || (kidIds.length > 0 && subjects.length > 0)
  const contactLooksEmail = /@/.test(contact)
  const contactLooksPhone = /^[\d+\-\s().]{6,}$/.test(contact.trim())
  const contactValid = contactLooksEmail || contactLooksPhone

  const previewSentence = useMemo(() => {
    if (role !== "tutor") return null
    const kidNames = kids.filter((k) => kidIds.includes(k.id)).map((k) => k.name)
    const subs = subjects.length ? subjects.join(" & ") : "—"
    const days =
      weekdays.length === 0 || weekdays.length === 7
        ? "every day"
        : weekdays
            .sort((a, b) => a - b)
            .map((i) => WEEKDAYS.find((w) => w.i === i)?.label)
            .filter(Boolean)
            .join(" · ")
    const who = kidNames.length > 0 ? kidNames.join(" & ") : "—"
    const target = name.trim() || "They"
    return `${target} will see ${who}'s ${subs} lessons, hours, and portfolio — on ${days}.`
  }, [role, kidIds, subjects, weekdays, kids, name])

  const sendInvite = () => {
    const scope: MembershipScope | undefined =
      role === "tutor"
        ? { kidIds, subjects, weekdays: weekdays.length ? weekdays : undefined }
        : undefined
    const invite = newInvite({
      role,
      name: name.trim() || undefined,
      email: contactLooksEmail ? contact.trim() : undefined,
      phone: contactLooksPhone && !contactLooksEmail ? contact.trim() : undefined,
      note: note.trim() || undefined,
      scope,
    })
    addInvite(invite)
    toast({
      title: "Invite sent",
      description: `Link valid for 7 days · ${invite.email ?? invite.phone ?? "copied link"}`,
    })
    onSent?.(invite)
    reset()
    onOpenChange(false)
  }

  const copyLink = async () => {
    const invite = newInvite({
      role,
      name: name.trim() || undefined,
      email: contactLooksEmail ? contact.trim() : undefined,
      phone: contactLooksPhone && !contactLooksEmail ? contact.trim() : undefined,
      note: note.trim() || undefined,
      scope:
        role === "tutor"
          ? { kidIds, subjects, weekdays: weekdays.length ? weekdays : undefined }
          : undefined,
    })
    addInvite(invite)
    const origin = typeof window !== "undefined" ? window.location.origin : "https://atoz.family"
    const url = `${origin}/invite/accept?token=${invite.token}`
    try {
      await navigator.clipboard.writeText(url)
      toast({ title: "Link copied", description: "Paste it wherever you want to send it." })
    } catch {
      toast({ title: "Copy failed", description: url, variant: "destructive" })
    }
    onSent?.(invite)
    reset()
    onOpenChange(false)
  }

  const handleNext = () => {
    if (step === 1) setStep(role === "tutor" ? 2 : 3)
    else if (step === 2) setStep(3)
  }
  const handleBack = () => {
    if (step === 3 && role !== "tutor") setStep(1)
    else if (step === 3) setStep(2)
    else if (step === 2) setStep(1)
  }

  const stepIndicator =
    role === "tutor"
      ? `Step ${step} of 3`
      : step === 1
        ? "Step 1 of 2"
        : "Step 2 of 2"

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) reset()
      }}
    >
      <DialogContent
        className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-0 gap-0 border-[var(--rule)]"
        aria-describedby={undefined}
      >
        <DialogHeader className="px-8 pt-8 pb-2 text-left space-y-1">
          <div className="atoz-eyebrow">{stepIndicator}</div>
          <DialogTitle className="font-display text-3xl font-normal tracking-tight text-[var(--ink)]">
            {step === 1 && "What kind of access?"}
            {step === 2 && `What will ${name.trim() || "they"} work on?`}
            {step === 3 && `Send ${name.trim() || "their"} invite`}
          </DialogTitle>
          <p className="text-sm text-[var(--ink-3)]">
            {step === 1 && "Pick a role. You can change this later."}
            {step === 2 && "Tutor sees only what you include."}
            {step === 3 && "They'll get a link to set up their account."}
          </p>
        </DialogHeader>

        <div className="px-8 pb-6 space-y-5">
          {step === 1 && (
            <>
              <div className="atoz-role-grid">
                {ROLES.map((r) => (
                  <button
                    key={r.role}
                    type="button"
                    aria-pressed={role === r.role}
                    onClick={() => setRole(r.role)}
                    className="atoz-role-card"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="atoz-role-card__name">{r.name}</div>
                      {role === r.role && (
                        <span className="w-5 h-5 bg-[var(--sage-dd)] text-white rounded-full grid place-items-center flex-shrink-0">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <div className="atoz-role-card__sub">{r.sub}</div>
                    <ul>
                      {r.permissions.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPermsOpen((o) => !o)}
                className="text-sm font-medium text-[var(--sage-dd)] hover:text-[var(--ink)] inline-flex items-center gap-1"
              >
                {permsOpen ? "Hide" : "Full permissions matrix"} →
              </button>
              {permsOpen && <PermissionsMatrix />}
            </>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <fieldset className="space-y-2">
                <legend className="atoz-eyebrow">Kids</legend>
                <div className="flex flex-wrap gap-2">
                  {kids.map((kid, i) => (
                    <KidChip
                      key={kid.id}
                      name={kid.name}
                      color={kid.color ?? KID_PALETTE[i % KID_PALETTE.length]}
                      active={kidIds.includes(kid.id)}
                      onClick={() => setKidIds((arr) => toggle(arr, kid.id))}
                    />
                  ))}
                </div>
              </fieldset>
              <fieldset className="space-y-2">
                <legend className="atoz-eyebrow">Subjects</legend>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((s) => (
                    <Chip
                      key={s}
                      active={subjects.includes(s)}
                      onClick={() => setSubjects((arr) => toggle(arr, s))}
                    >
                      {s}
                    </Chip>
                  ))}
                </div>
              </fieldset>
              <fieldset className="space-y-2">
                <legend className="atoz-eyebrow">
                  Days <span className="text-[var(--ink-4)] normal-case tracking-normal font-normal">(optional · default every day)</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((w) => (
                    <Chip
                      key={w.i}
                      active={weekdays.includes(w.i)}
                      onClick={() => setWeekdays((arr) => toggle(arr, w.i))}
                    >
                      {w.label}
                    </Chip>
                  ))}
                </div>
              </fieldset>
              {previewSentence && (
                <div className="rounded-xl border border-[var(--rule)] bg-[var(--linen)]/50 p-4 text-sm text-[var(--ink-2)]">
                  {previewSentence}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="atoz-eyebrow block" htmlFor="inv-name">Name</label>
                  <Input
                    id="inv-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maria"
                  />
                </div>
                <div className="space-y-2">
                  <label className="atoz-eyebrow block" htmlFor="inv-contact">Email or phone</label>
                  <Input
                    id="inv-contact"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="maria@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="atoz-eyebrow block" htmlFor="inv-note">
                  Personal note <span className="text-[var(--ink-4)] normal-case tracking-normal font-normal">(optional · 500 char max)</span>
                </label>
                <Textarea
                  id="inv-note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value.slice(0, 500))}
                  placeholder="Anything they should know?"
                />
              </div>
              <div className="rounded-xl bg-[var(--sage-ll)] border border-[var(--sage-l)] p-4 text-sm text-[var(--sage-dd)]">
                <div className="font-medium mb-1">
                  What {name.trim() || "they"} will get
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-[var(--ink-2)]">
                  <li>Role: {ROLES.find((r) => r.role === role)?.name}</li>
                  {role === "tutor" && previewSentence && <li>{previewSentence}</li>}
                  <li>Link expires in 7 days</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-8 py-5 border-t border-[var(--rule)] bg-[var(--linen)]/40 rounded-b-2xl">
          {step > 1 ? (
            <Button variant="ghost" onClick={handleBack}>Back</Button>
          ) : (
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          )}
          <div className="flex items-center gap-2">
            {step === 3 && (
              <Button variant="outline" onClick={copyLink} disabled={!contactValid && !name.trim() ? false : false}>
                <LinkIcon size={14} className="mr-1" /> Copy link instead
              </Button>
            )}
            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={step === 2 && !scopeValid}
                className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white"
              >
                Continue <ChevronRight size={14} className="ml-1" />
              </Button>
            ) : (
              <Button
                onClick={sendInvite}
                disabled={!contactValid}
                className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white"
              >
                Send invite
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PermissionsMatrix() {
  const rows = [
    { label: "View all kids", coparent: "yes", tutor: "partial", grandparent: "yes", group: "no" },
    { label: "Edit lesson plans", coparent: "yes", tutor: "partial", grandparent: "no", group: "no" },
    { label: "Run teach mode", coparent: "yes", tutor: "partial", grandparent: "no", group: "no" },
    { label: "Log hours", coparent: "yes", tutor: "partial", grandparent: "no", group: "no" },
    { label: "View portfolio", coparent: "yes", tutor: "partial", grandparent: "yes", group: "no" },
    { label: "React to portfolio", coparent: "yes", tutor: "no", grandparent: "yes", group: "no" },
    { label: "Compliance stats", coparent: "yes", tutor: "no", grandparent: "no", group: "no" },
    { label: "Invite others", coparent: "yes", tutor: "no", grandparent: "no", group: "no" },
    { label: "Billing", coparent: "yes", tutor: "no", grandparent: "no", group: "no" },
    { label: "Community events", coparent: "yes", tutor: "no", grandparent: "no", group: "yes" },
  ] as const

  const cell = (v: string) => {
    if (v === "yes") return <td className="yes">✓</td>
    if (v === "no") return <td className="no">—</td>
    return <td className="partial">Scoped</td>
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--rule)] bg-white">
      <table className="atoz-perm-table">
        <thead>
          <tr>
            <th></th>
            <th>Co-parent</th>
            <th>Tutor</th>
            <th>Grandparent</th>
            <th>Group</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td className="font-medium text-[var(--ink)]">{r.label}</td>
              {cell(r.coparent)}
              {cell(r.tutor)}
              {cell(r.grandparent)}
              {cell(r.group)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
