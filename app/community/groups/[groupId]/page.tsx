/**
 * Community group detail (Phase 7.3).
 *
 * Server component. Fetches the group + membership state, then renders:
 *  - Header (name, description, philosophy, schedule, location, links).
 *  - Join/Leave button.
 *  - Member list.
 *  - For members only: Announcements, Teaching rotation, Field trips.
 *  - For non-members: a "Join to see…" empty card.
 *  - For private groups + non-members: an invite-only gate (404 on
 *    private + unauthenticated to keep group membership not enumerable).
 *
 * Postgres-unset and missing-group cases both render calm shells.
 */

import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ExternalLink, MapPin, Users } from "lucide-react"
import Navigation from "@/components/navigation"
import { Pill } from "@/components/primitives"
import { isPostgresConfigured, postgresUnavailableMessage } from "@/lib/postgres-guard"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-middleware"
import JoinLeaveButton from "@/components/community/join-leave-button"
import CreateFieldTripDialog from "@/components/community/create-field-trip-dialog"
import GroupAnnouncements from "@/components/group-announcements"
import TeachingRotationCalendar from "@/components/teaching-rotation-calendar"
import GroupFieldTripCard from "@/components/group-field-trip-card"
import type { GroupFieldTrip, GroupMember, TeachingRotation } from "@/lib/types"

export const dynamic = "force-dynamic"

function humanize(value?: string | null): string | null {
  if (!value) return null
  return value.replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

interface Viewer {
  userId: string | null
  isMember: boolean
  role: "admin" | "moderator" | "member" | null
}

async function getViewer(groupId: string): Promise<Viewer> {
  try {
    const auth = await getCurrentUser()
    const userId = await db.resolveOrCreateUserId(auth.userId, auth.email || undefined)
    const isMember = await db.isGroupMember(groupId, userId)
    const role = (await db.getGroupMemberRole(groupId, userId)) as Viewer["role"]
    return { userId, isMember, role }
  } catch {
    return { userId: null, isMember: false, role: null }
  }
}

function mapMember(m: any): GroupMember {
  return {
    id: m.id ?? m.user_id,
    userId: m.user_id ?? m.id,
    displayName: m.display_name ?? "Member",
    email: m.email ?? "",
    photoUrl: m.photo_url ?? undefined,
    role: (m.role ?? "member") as GroupMember["role"],
    joinedAt: m.joined_at?.toISOString?.() ?? String(m.joined_at ?? ""),
  }
}

function mapRotation(r: any): TeachingRotation {
  return {
    id: r.id,
    groupId: r.group_id,
    teacherUserId: r.teacher_user_id,
    teacherName: r.teacher_name ?? "Teacher",
    subject: r.subject,
    dayOfWeek: r.day_of_week,
    startTime: r.start_time ?? undefined,
    endTime: r.end_time ?? undefined,
    notes: r.notes ?? undefined,
    createdAt: r.created_at?.toISOString?.() ?? String(r.created_at ?? ""),
  }
}

function mapTrip(t: any, userRsvpStatus?: string | null): GroupFieldTrip {
  return {
    id: t.id,
    groupId: t.group_id,
    organizerUserId: t.organizer_user_id,
    organizerName: t.organizer_name ?? "Organizer",
    title: t.title,
    description: t.description ?? undefined,
    location: t.location ?? undefined,
    latitude: t.latitude ?? undefined,
    longitude: t.longitude ?? undefined,
    tripDate: t.trip_date?.toISOString?.() ?? String(t.trip_date ?? ""),
    maxAttendees: t.max_attendees ?? undefined,
    costPerFamily: t.cost_per_family ? Number(t.cost_per_family) : undefined,
    relatedPacketId: t.related_packet_id ?? undefined,
    rsvpCount: t.rsvp_count ?? 0,
    userRsvpStatus: (userRsvpStatus as GroupFieldTrip["userRsvpStatus"]) ?? undefined,
    createdAt: t.created_at?.toISOString?.() ?? String(t.created_at ?? ""),
    updatedAt: t.updated_at?.toISOString?.() ?? String(t.updated_at ?? ""),
  }
}

export default async function CommunityGroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params

  if (!isPostgresConfigured()) {
    return (
      <Shell>
        <BackLink />
        <ConfigPendingCard />
      </Shell>
    )
  }

  const [group, viewer] = await Promise.all([
    db.getGroupById(groupId).catch(() => null),
    getViewer(groupId),
  ])
  if (!group) notFound()

  // Private group, non-member, non-authed → 404 so membership isn't enumerable.
  if (group.is_private && !viewer.isMember) {
    if (!viewer.userId) notFound()
    return (
      <Shell>
        <BackLink />
        <GroupHeader group={group} viewer={viewer} />
        <section className="rounded-2xl border border-dashed border-[var(--rule)] bg-white/40 p-8 text-center max-w-[640px] mx-auto">
          <h2 className="font-display text-xl font-medium mb-1">Invite-only.</h2>
          <p className="text-sm text-[var(--ink-2)]">
            Ask {humanize(group.creator_name ?? null) ?? "the organizer"} for an invite to see what's
            inside.
          </p>
        </section>
      </Shell>
    )
  }

  // Fetch coordination data the page needs server-side. The client
  // components self-fetch announcements; rotations + trips come in as props
  // because the rotation calendar expects pre-loaded data.
  const [membersRaw, rotationsRaw, tripsRaw] = await Promise.all([
    db.getGroupMembers(groupId).catch(() => [] as any[]),
    db.getTeachingRotations(groupId).catch(() => [] as any[]),
    db.getGroupFieldTrips(groupId).catch(() => [] as any[]),
  ])

  const members = membersRaw.map(mapMember)
  const rotations = rotationsRaw.map(mapRotation)
  const trips = await Promise.all(
    tripsRaw.map(async (t: any) => {
      const rsvp = viewer.userId
        ? await db.getUserFieldTripRSVP(t.id, viewer.userId).catch(() => null)
        : null
      return mapTrip(t, rsvp?.status ?? null)
    }),
  )

  const isAdmin = viewer.role === "admin"
  const upcomingTrips = trips
    .filter((t) => new Date(t.tripDate) >= new Date(Date.now() - 24 * 60 * 60 * 1000))
    .sort((a, b) => new Date(a.tripDate).getTime() - new Date(b.tripDate).getTime())

  return (
    <Shell>
      <BackLink />
      <GroupHeader group={group} viewer={viewer} />

      <MembersCard members={members} />

      {viewer.isMember ? (
        <>
          <CoordinationCard heading="Announcements">
            <GroupAnnouncements groupId={groupId} isAdmin={isAdmin} userRole={viewer.role} />
          </CoordinationCard>

          <CoordinationCard heading="Teaching rotation">
            <TeachingRotationCalendar
              groupId={groupId}
              rotations={rotations}
              isAdmin={isAdmin}
              members={members}
              onUpdate={() => {}}
            />
          </CoordinationCard>

          <CoordinationCard
            heading="Field trips"
            headerAction={isAdmin ? <CreateFieldTripDialog groupId={groupId} /> : undefined}
          >
            {upcomingTrips.length === 0 ? (
              <p className="text-sm text-[var(--ink-3)]">
                No upcoming trips.{isAdmin ? " Use the button above to schedule one." : " An admin can schedule one."}
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingTrips.map((trip) => (
                  <GroupFieldTripCard key={trip.id} trip={trip} groupId={groupId} />
                ))}
              </div>
            )}
          </CoordinationCard>
        </>
      ) : (
        <section className="rounded-2xl border border-dashed border-[var(--rule)] bg-white/40 p-8 text-center max-w-[640px] mx-auto">
          <h2 className="font-display text-xl font-medium mb-1">Join to see what's happening.</h2>
          <p className="text-sm text-[var(--ink-2)]">
            Members can read announcements, see the teaching rotation, and RSVP to field trips.
          </p>
        </section>
      )}
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--linen)] text-[var(--ink)] font-sans">
      <Navigation />
      <main className="atoz-page">{children}</main>
    </div>
  )
}

function BackLink() {
  return (
    <Link
      href="/community"
      className="inline-flex items-center gap-1 text-sm text-[var(--ink-3)] hover:text-[var(--ink)] mb-4"
    >
      <ArrowLeft size={14} aria-hidden="true" /> Back to Community
    </Link>
  )
}

function ConfigPendingCard() {
  return (
    <section className="rounded-2xl border border-dashed border-[var(--rule)] bg-white/40 p-10 text-center max-w-[640px] mx-auto">
      <h1 className="font-display text-2xl font-medium mb-2">Group detail isn't available yet.</h1>
      <p className="text-sm text-[var(--ink-2)]">{postgresUnavailableMessage()}</p>
    </section>
  )
}

function GroupHeader({
  group,
  viewer,
}: {
  group: any
  viewer: Viewer
}) {
  const philosophy = humanize(group.philosophy)
  const groupType = humanize(group.group_type)
  const scheduleDay = humanize(group.schedule?.day ?? null)
  const frequency = humanize(group.meeting_frequency)
  const locationLabel = [group.city, group.state_abbreviation].filter(Boolean).join(", ")

  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="flex-1 min-w-[280px]">
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
      </div>
      <JoinLeaveButton
        groupId={group.id}
        initialIsMember={viewer.isMember}
        groupIsPrivate={Boolean(group.is_private)}
        isAcceptingMembers={group.is_accepting_members !== false}
      />
    </header>
  )
}

function MembersCard({ members }: { members: GroupMember[] }) {
  return (
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
          {members.slice(0, 30).map((m) => (
            <li key={m.id} className="flex items-center justify-between text-sm">
              <span>{m.displayName}</span>
              <Pill>{humanize(m.role) ?? "Member"}</Pill>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function CoordinationCard({
  heading,
  headerAction,
  children,
}: {
  heading: string
  headerAction?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-[var(--rule)] bg-white p-6 mb-6">
      <div className="flex items-baseline justify-between gap-3 mb-4 flex-wrap">
        <h2 className="font-display text-xl font-medium">{heading}</h2>
        {headerAction}
      </div>
      {children}
    </section>
  )
}
