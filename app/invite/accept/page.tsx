"use client"

/**
 * Flow 03 — Accept an invite.
 * Magic link lands here. In v1 this is a local-only simulation; v2
 * will move token resolution to the server.
 */

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Pill, Backlink } from "@/components/primitives"
import {
  type Invite,
  addMembership,
  listInvites,
  updateInvite,
  uid,
} from "@/lib/atoz-store"

export default function AcceptInvitePage() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params?.get("token")
  const [invite, setInvite] = useState<Invite | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "expired" | "revoked" | "not-found" | "done">(
    "loading",
  )

  useEffect(() => {
    if (!token) {
      setStatus("not-found")
      return
    }
    const match = listInvites().find((i) => i.token === token)
    if (!match) {
      setStatus("not-found")
      return
    }
    setInvite(match)
    if (match.revokedAt) setStatus("revoked")
    else if (match.acceptedAt) setStatus("done")
    else if (new Date(match.expiresAt) < new Date()) setStatus("expired")
    else setStatus("ready")
  }, [token])

  const accept = () => {
    if (!invite) return
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
    setStatus("done")
  }

  const roleDescription = useMemo(() => {
    if (!invite) return ""
    switch (invite.role) {
      case "coparent":
        return "Full partner access across everything."
      case "tutor":
        return "Scoped access: only the kids and subjects listed below."
      case "grandparent":
        return "Read-only view of portfolios. You can react but not edit."
      case "group":
        return "Co-op / group access: events and shared schedules only."
      default:
        return ""
    }
  }, [invite])

  return (
    <main className="min-h-screen bg-[var(--linen)] text-[var(--ink)] font-sans">
      <div className="max-w-xl mx-auto px-6 md:px-10 py-16">
        <Backlink href="/">AtoZ Family</Backlink>

        <div className="mt-10 rounded-2xl border border-[var(--rule)] bg-white p-8 shadow-sm">
          <div className="atoz-eyebrow mb-3">Invite</div>

          {status === "loading" && <p className="text-[var(--ink-3)]">Checking your link…</p>}

          {status === "not-found" && (
            <>
              <h1 className="font-display text-3xl font-normal tracking-tight">
                This link didn&apos;t match.
              </h1>
              <p className="mt-2 text-[var(--ink-3)]">
                The invite may have been revoked or the URL is incomplete. Ask whoever invited you to resend.
              </p>
            </>
          )}

          {status === "expired" && invite && (
            <>
              <h1 className="font-display text-3xl font-normal tracking-tight">
                This invite expired.
              </h1>
              <p className="mt-2 text-[var(--ink-3)]">
                Invites are valid for 7 days. Ask {invite.name ?? "the sender"} to send a fresh one.
              </p>
            </>
          )}

          {status === "revoked" && (
            <>
              <h1 className="font-display text-3xl font-normal tracking-tight">
                This invite was revoked.
              </h1>
              <p className="mt-2 text-[var(--ink-3)]">
                Access was removed before it was used. Reach out if you think this is a mistake.
              </p>
            </>
          )}

          {status === "ready" && invite && (
            <>
              <h1 className="font-display text-3xl font-normal tracking-tight">
                You&apos;re invited to join.
              </h1>
              <p className="mt-2 text-[var(--ink-3)]">{roleDescription}</p>

              <div className="mt-6 rounded-xl bg-[var(--sage-ll)] border border-[var(--sage-l)] p-4 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Pill variant="sage">{invite.role}</Pill>
                  <span className="text-[var(--ink-3)] text-xs">
                    Valid until {new Date(invite.expiresAt).toLocaleDateString()}
                  </span>
                </div>
                {invite.note && (
                  <p className="italic text-[var(--ink-2)] mt-2">&ldquo;{invite.note}&rdquo;</p>
                )}
              </div>

              <div className="mt-6 flex gap-2">
                <Button
                  onClick={accept}
                  className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white"
                >
                  Accept &amp; set up account
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/">Not now</Link>
                </Button>
              </div>
            </>
          )}

          {status === "done" && invite && (
            <>
              <h1 className="font-display text-3xl font-normal tracking-tight">
                You&apos;re in.
              </h1>
              <p className="mt-2 text-[var(--ink-3)]">
                Welcome aboard. You now have {invite.role} access.
              </p>
              <div className="mt-6 flex gap-2">
                <Button
                  asChild
                  className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white"
                >
                  <Link href="/people">See the family</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
