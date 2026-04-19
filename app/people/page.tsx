"use client"

/**
 * Flow 03 — People page.
 * Parents / Helpers sections, pending invites with dashed avatar,
 * kebab actions (resend / copy link / revoke), solo-parent empty state.
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Navigation from "@/components/navigation"
import { Pill } from "@/components/primitives"
import InviteFlowDialog from "@/components/invite-flow-dialog"
import {
  type Invite,
  type Membership,
  type MemberRole,
  addMembership,
  listInvites,
  listMemberships,
  onStorageChange,
  removeMembership,
  updateInvite,
  uid,
} from "@/lib/atoz-store"
import { useToast } from "@/hooks/use-toast"
import { MoreVertical, Plus } from "lucide-react"
import { DEMO_KIDS } from "@/lib/demo-kids"

const DEMO_PRIMARY: Membership = {
  id: "mem_primary",
  name: "You (primary)",
  email: "you@example.com",
  role: "primary",
  createdAt: new Date().toISOString(),
}

function rolePillVariant(role: MemberRole): "sage" | "honey" | "terracotta" | "default" {
  switch (role) {
    case "primary":
    case "coparent":
      return "sage"
    case "tutor":
      return "honey"
    case "grandparent":
      return "terracotta"
    default:
      return "default"
  }
}

function roleLabel(role: MemberRole): string {
  return {
    primary: "Primary",
    coparent: "Co-parent",
    tutor: "Tutor",
    grandparent: "Grandparent",
    group: "Group",
  }[role]
}

export default function PeoplePage() {
  const { toast } = useToast()
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [inviteOpen, setInviteOpen] = useState(false)

  const refresh = useCallback(() => {
    setMemberships(listMemberships())
    setInvites(listInvites())
  }, [])

  useEffect(() => {
    refresh()
    return onStorageChange(refresh)
  }, [refresh])

  const allMemberships = useMemo(() => [DEMO_PRIMARY, ...memberships], [memberships])

  const parents = useMemo(
    () => allMemberships.filter((m) => m.role === "primary" || m.role === "coparent"),
    [allMemberships],
  )
  const helpers = useMemo(
    () => allMemberships.filter((m) => m.role !== "primary" && m.role !== "coparent"),
    [allMemberships],
  )
  const pendingInvites = useMemo(
    () => invites.filter((i) => !i.acceptedAt && !i.revokedAt && new Date(i.expiresAt) > new Date()),
    [invites],
  )

  const copyInviteLink = async (invite: Invite) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://atoz.family"
    const url = `${origin}/invite/accept?token=${invite.token}`
    try {
      await navigator.clipboard.writeText(url)
      toast({ title: "Link copied", description: "Paste wherever works." })
    } catch {
      toast({ title: "Copy failed", description: url, variant: "destructive" })
    }
  }

  const resendInvite = (invite: Invite) => {
    const expires = new Date()
    expires.setDate(expires.getDate() + 7)
    updateInvite(invite.id, { expiresAt: expires.toISOString() })
    refresh()
    toast({ title: "Invite resent", description: "Link reset to 7 days." })
  }

  const revokeInvite = (invite: Invite) => {
    updateInvite(invite.id, { revokedAt: new Date().toISOString() })
    refresh()
    toast({ title: "Invite revoked", description: `${invite.name ?? invite.email ?? "Invite"} no longer valid.` })
  }

  const acceptInviteDemo = (invite: Invite) => {
    // Simulated accept for demo (in v2 this happens server-side via magic link).
    const now = new Date().toISOString()
    addMembership({
      id: uid("mem"),
      name: invite.name ?? invite.email ?? "Guest",
      email: invite.email,
      phone: invite.phone,
      role: invite.role,
      scope: invite.scope,
      createdAt: now,
    })
    updateInvite(invite.id, { acceptedAt: now })
    refresh()
    toast({ title: "Invite accepted", description: `${invite.name ?? "Guest"} is now a ${roleLabel(invite.role)}.` })
  }

  const handleRemove = (m: Membership) => {
    removeMembership(m.id)
    refresh()
    toast({ title: "Removed", description: `${m.name} was removed from the family.` })
  }

  return (
    <div className="min-h-screen bg-[var(--linen)] text-[var(--ink)] font-sans">
      <Navigation />
      <main className="atoz-page max-w-4xl">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="atoz-eyebrow">Family · People</div>
            <h1 className="font-display text-5xl font-light tracking-tighter leading-[1.05] mt-2">
              Who has access.
            </h1>
            <p className="text-[var(--ink-2)] mt-2 max-w-[540px]">
              Parents, helpers, grandparents. Everyone gets only what they need.
            </p>
          </div>
          <Button
            onClick={() => setInviteOpen(true)}
            className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white"
          >
            <Plus size={14} className="mr-1" /> Invite someone
          </Button>
        </header>

        <Section title={`Parents · ${parents.length}`}>
          <ul className="space-y-2">
            {parents.map((m) => (
              <PersonRow key={m.id} m={m} onRemove={m.role === "primary" ? undefined : () => handleRemove(m)} />
            ))}
            {memberships.filter((m) => m.role === "coparent").length === 0 && (
              <SoloParentHint onInvite={() => setInviteOpen(true)} />
            )}
          </ul>
        </Section>

        <Section title={`Helpers · ${helpers.length}`}>
          {helpers.length === 0 && pendingInvites.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--rule)] p-6 text-sm text-[var(--ink-3)] bg-white/40">
              No helpers yet. Tutors, grandparents, and co-op groups show up here.
            </div>
          ) : (
            <ul className="space-y-2">
              {helpers.map((m) => (
                <PersonRow key={m.id} m={m} onRemove={() => handleRemove(m)} />
              ))}
              {pendingInvites.map((inv) => (
                <PendingInviteRow
                  key={inv.id}
                  invite={inv}
                  onResend={() => resendInvite(inv)}
                  onCopy={() => copyInviteLink(inv)}
                  onRevoke={() => revokeInvite(inv)}
                  onAccept={() => acceptInviteDemo(inv)}
                />
              ))}
            </ul>
          )}
        </Section>

        <InviteFlowDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          kids={DEMO_KIDS}
          onSent={() => refresh()}
        />
      </main>

    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="atoz-eyebrow mb-3">{title}</div>
      {children}
    </section>
  )
}

function PersonRow({ m, onRemove }: { m: Membership; onRemove?: () => void }) {
  const scopeStr = m.scope
    ? [
        m.scope.kidIds?.length ? `${m.scope.kidIds.length} kid(s)` : null,
        m.scope.subjects?.length ? m.scope.subjects.join(" · ") : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : null

  return (
    <li className="atoz-people-row">
      <span className="atoz-people-avatar">{m.name.trim()[0]?.toUpperCase() ?? "?"}</span>
      <div className="min-w-0">
        <div className="font-medium text-sm truncate">{m.name}</div>
        <div className="text-xs text-[var(--ink-3)] truncate">
          {scopeStr ?? m.email ?? m.phone ?? "—"}
        </div>
      </div>
      <Pill variant={rolePillVariant(m.role)}>{roleLabel(m.role)}</Pill>
      <div className="text-xs text-[var(--ink-3)] hidden sm:block">
        {m.role === "primary" ? "Right now" : "Active today"}
      </div>
      {onRemove ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1.5 rounded-full hover:bg-[var(--linen-2)]"
              aria-label="More actions"
            >
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onRemove} className="text-[var(--terracotta-d)]">
              Remove from family
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <span className="w-8" />
      )}
    </li>
  )
}

function PendingInviteRow({
  invite,
  onResend,
  onCopy,
  onRevoke,
  onAccept,
}: {
  invite: Invite
  onResend: () => void
  onCopy: () => void
  onRevoke: () => void
  onAccept: () => void
}) {
  const initial = (invite.name || invite.email || "?").trim()[0]?.toUpperCase() ?? "?"
  return (
    <li className="atoz-people-row atoz-people-row--pending">
      <span className="atoz-people-avatar atoz-people-avatar--pending">{initial}</span>
      <div className="min-w-0">
        <div className="font-medium text-sm truncate">{invite.name ?? invite.email ?? invite.phone ?? "Invite"}</div>
        <div className="text-xs text-[var(--ink-3)] truncate">Invited · not yet accepted · expires {new Date(invite.expiresAt).toLocaleDateString()}</div>
      </div>
      <Pill variant={rolePillVariant(invite.role)}>{roleLabel(invite.role)}</Pill>
      <div className="hidden sm:flex gap-1 text-xs">
        <button onClick={onResend} className="px-2 py-1 text-[var(--ink-3)] hover:text-[var(--ink)]">Resend</button>
        <button onClick={onCopy} className="px-2 py-1 text-[var(--ink-3)] hover:text-[var(--ink)]">Copy link</button>
        <button onClick={onRevoke} className="px-2 py-1 text-[var(--terracotta-d)] hover:text-[var(--ink)]">Revoke</button>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1.5 rounded-full hover:bg-[var(--linen-2)]" aria-label="More actions">
            <MoreVertical size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onAccept}>Simulate accept</DropdownMenuItem>
          <DropdownMenuItem onClick={onResend}>Resend invite</DropdownMenuItem>
          <DropdownMenuItem onClick={onCopy}>Copy link</DropdownMenuItem>
          <DropdownMenuItem onClick={onRevoke} className="text-[var(--terracotta-d)]">
            Revoke invite
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}

function SoloParentHint({ onInvite }: { onInvite: () => void }) {
  return (
    <li className="rounded-xl border border-dashed border-[var(--rule)] p-5 bg-white/40">
      <p className="atoz-hand text-[var(--terracotta-d)] text-lg mb-2 -rotate-1 inline-block">
        Not everyone has a partner — and that&apos;s fine.
      </p>
      <div>
        <Button variant="outline" size="sm" onClick={onInvite}>
          <Plus size={14} className="mr-1" /> Invite a co-parent <span className="text-[var(--ink-3)] ml-1">(optional)</span>
        </Button>
      </div>
    </li>
  )
}
