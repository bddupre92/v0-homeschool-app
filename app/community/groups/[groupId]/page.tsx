/**
 * Community group detail. Phase 7.1 ships the read shell: name,
 * description, philosophy, schedule, location, member list. Announcements,
 * teaching rotations, field trips, and shared packets render in 7.2 once
 * their per-group surfaces ship.
 *
 * The page gracefully degrades when Postgres isn't configured.
 */

import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ExternalLink, MapPin, Users } from "lucide-react"
import Navigation from "@/components/navigation"
import { Pill } from "@/components/primitives"
import { isPostgresConfigured, postgresUnavailableMessage } from "@/lib/postgres-guard"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

function humanize(s?: string | null): string | null {
  if (!s) return null
  return s.replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export default async function CommunityGroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params

  if (!isPostgresConfigured()) {
    return (
      <div className="min-h-screen bg-[var(--linen)] text-[var(--ink)] font-sans">
        <Navigation />
        <main className="atoz-page">
          <Link
            href="/community"
            className="inline-flex items-center gap-1 text-sm text-[var(--ink-3)] hover:text-[var(--ink)] mb-4"
          >
            <ArrowLeft size={14} aria-hidden="true" /> Back to Community
          </Link>
          <section className="rounded-2xl border border-dashed border-[var(--rule)] bg-white/40 p-10 text-center max-w-[640px] mx-auto">
            <h1 className="font-display text-2xl font-medium mb-2">
              Group detail isn't available yet.
            </h1>
            <p className="text-sm text-[var(--ink-2)]">{postgresUnavailableMessage()}</p>
          </section>
        </main>
      </div>
    )
  }

  const group = await db.getGroupById(groupId).catch(() => null)
  if (!group) notFound()

  const members = await db.getGroupMembers(groupId).catch(() => [])
  const philosophy = humanize(group.philosophy)
  const groupType = humanize(group.group_type)
  const scheduleDay = humanize(group.schedule?.day ?? null)
  const frequency = humanize(group.meeting_frequency)
  const locationLabel = [group.city, group.state_abbreviation].filter(Boolean).join(", ")

  return (
    <div className="min-h-screen bg-[var(--linen)] text-[var(--ink)] font-sans">
      <Navigation />
      <main className="atoz-page">
        <Link
          href="/community"
          className="inline-flex items-center gap-1 text-sm text-[var(--ink-3)] hover:text-[var(--ink)] mb-4"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Back to Community
        </Link>

        <header className="mb-8">
          <div className="atoz-eyebrow">Community · {groupType ?? "Group"}</div>
          <h1 className="font-display text-4xl font-light tracking-tighter leading-[1.05] mt-2">
            {group.name}
          </h1>
          {group.description && (
            <p className="text-[var(--ink-2)] mt-3 max-w-[640px] whitespace-pre-line">
              {group.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {philosophy && <Pill variant="sage">{philosophy}</Pill>}
            {scheduleDay && (
              <Pill>
                {scheduleDay}
                {frequency ? ` · ${frequency.toLowerCase()}` : ""}
              </Pill>
            )}
            {group.is_private && <Pill variant="terracotta">Private</Pill>}
            {!group.is_accepting_members && <Pill>Not accepting members</Pill>}
            {locationLabel && (
              <span className="text-xs text-[var(--ink-4)] inline-flex items-center gap-1">
                <MapPin size={12} aria-hidden="true" /> {locationLabel}
              </span>
            )}
            {group.external_url && (
              <a
                href={group.external_url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs text-[var(--sage-dd)] inline-flex items-center gap-1 underline"
              >
                <ExternalLink size={12} aria-hidden="true" /> External link
              </a>
            )}
          </div>
        </header>

        <section className="rounded-2xl border border-[var(--rule)] bg-white p-6 mb-6">
          <h2 className="font-display text-xl font-medium flex items-center gap-2 mb-4">
            <Users className="h-4 w-4" aria-hidden="true" /> Members ({members.length})
          </h2>
          {members.length === 0 ? (
            <p className="text-sm text-[var(--ink-3)]">
              No members yet. As they join, they'll appear here.
            </p>
          ) : (
            <ul className="space-y-2">
              {members.slice(0, 30).map((m: any) => (
                <li key={m.id ?? m.user_id} className="flex items-center justify-between text-sm">
                  <span>{m.display_name ?? m.displayName ?? "Member"}</span>
                  <Pill>{humanize(m.role) ?? "Member"}</Pill>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-dashed border-[var(--rule)] bg-white/40 p-6 text-center">
          <p className="text-sm text-[var(--ink-3)]">
            Announcements, teaching rotations, field trips, and shared packets land in Phase 7.2.
          </p>
        </section>
      </main>
    </div>
  )
}
