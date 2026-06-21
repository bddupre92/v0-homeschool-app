/**
 * Community room — co-op discovery + your-groups landing.
 *
 * Server component. Calls the discovery + my-groups actions, falls back
 * to a calm "configuration pending" empty state when Postgres is unset.
 */

import Link from "next/link"
import { Users, Plus, Compass, MapPin, Settings as SettingsIcon } from "lucide-react"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Pill } from "@/components/primitives"
import { isPostgresConfigured, postgresUnavailableMessage } from "@/lib/postgres-guard"
import { discoverGroups, getMyGroups } from "@/app/actions/group-discovery-actions"

export const dynamic = "force-dynamic"

function humanize(value?: string | null): string | null {
  if (!value) return null
  return value.replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export default async function CommunityPage() {
  if (!isPostgresConfigured()) return <CommunityShell><ConfigurationPendingCard /></CommunityShell>

  const [discovery, mine] = await Promise.all([discoverGroups(), getMyGroups()])

  return (
    <CommunityShell>
      <div className="space-y-10">
        <DiscoverSection discovery={discovery} />
        <YourGroupsSection groups={mine.groups} />
      </div>
    </CommunityShell>
  )
}

function CommunityShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--linen)] text-[var(--ink)] font-sans">
      <Navigation />
      <main className="atoz-page">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="atoz-eyebrow">Community</div>
            <h1 className="font-display text-5xl font-light tracking-tighter leading-[1.05] mt-2">
              Find your village.
            </h1>
            <p className="text-[var(--ink-2)] mt-2 max-w-[640px]">
              Co-ops, learning circles, and study groups in your area. Match by philosophy, age, and
              schedule.
            </p>
          </div>
          <Button asChild className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white">
            <Link href="/community/new">
              <Plus size={14} className="mr-1" aria-hidden="true" />
              Create a co-op
            </Link>
          </Button>
        </header>
        {children}
        <section className="mt-12 pt-8 border-t border-[var(--rule)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--ink-4)]">
          <div>
            Managing co-parents, tutors, or grandparents?{" "}
            <Link href="/people" className="underline hover:text-[var(--ink)]">
              Family access lives at /people.
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

function ConfigurationPendingCard() {
  return (
    <section className="rounded-2xl border border-dashed border-[var(--rule)] bg-white/40 p-10 text-center">
      <Compass className="h-10 w-10 mx-auto text-[var(--ink-3)] mb-4" aria-hidden="true" />
      <h2 className="font-display text-2xl font-medium mb-2">Community is being set up.</h2>
      <p className="text-sm text-[var(--ink-2)] max-w-[480px] mx-auto">
        {postgresUnavailableMessage()}
      </p>
      <p className="text-xs text-[var(--ink-4)] mt-6">
        Operators: see <code className="px-1 py-0.5 rounded bg-[var(--linen-d)]">DEPLOY.md §3.5</code>{" "}
        to connect Vercel Postgres, then visit{" "}
        <code className="px-1 py-0.5 rounded bg-[var(--linen-d)]">/api/health</code>.
      </p>
    </section>
  )
}

function DiscoverSection({
  discovery,
}: {
  discovery: Awaited<ReturnType<typeof discoverGroups>>
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-display text-2xl font-medium flex items-center gap-2">
          <Compass className="h-5 w-5" aria-hidden="true" /> Discover
        </h2>
        <Link
          href="/community/preferences"
          className="inline-flex items-center gap-1 text-sm text-[var(--ink-3)] hover:text-[var(--ink)]"
        >
          <SettingsIcon size={14} aria-hidden="true" /> Adjust preferences
        </Link>
      </div>

      {!discovery.success ? (
        <EmptyCard
          title="Couldn't load discovery."
          body="Try refreshing. If the issue persists, the database may be offline."
        />
      ) : discovery.needsPrefs ? (
        <EmptyCard
          title="Tell us where you are."
          body="Add a ZIP and a couple of preferences and we'll rank co-ops nearby."
          cta={{ href: "/community/preferences", label: "Set your preferences" }}
        />
      ) : discovery.matches.length === 0 ? (
        <EmptyCard
          title="No co-ops match yet."
          body="None of the public groups in your radius matched your filters. Widen your distance, or be the first to start one."
          cta={{ href: "/community/new", label: "Create a co-op" }}
        />
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {discovery.matches.map((group) => (
            <li key={group.id}>
              <Link
                href={`/community/groups/${group.id}`}
                className="block rounded-2xl border border-[var(--rule)] bg-white p-5 hover:border-[var(--sage-d)] transition-colors"
              >
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <h3 className="font-display text-xl font-medium">{group.name}</h3>
                  <Pill variant="sage">{group.matchScore}% match</Pill>
                </div>
                {group.description && (
                  <p className="text-sm text-[var(--ink-2)] line-clamp-2 mb-3">
                    {group.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--ink-3)]">
                  {group.philosophy && <span>{humanize(group.philosophy)}</span>}
                  {group.distanceMiles !== undefined && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} aria-hidden="true" /> {Math.round(group.distanceMiles)} mi
                    </span>
                  )}
                  {group.memberCount > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Users size={11} aria-hidden="true" /> {group.memberCount}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function YourGroupsSection({ groups }: { groups: any[] }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-medium flex items-center gap-2 mb-4">
        <Users className="h-5 w-5" aria-hidden="true" /> Your groups
      </h2>
      {groups.length === 0 ? (
        <EmptyCard
          title="No groups yet."
          body="Join one from Discover above, or create a new co-op to invite your circle."
        />
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {groups.map((g: any) => (
            <li key={g.id}>
              <Link
                href={`/community/groups/${g.id}`}
                className="block rounded-2xl border border-[var(--rule)] bg-white p-5 hover:border-[var(--sage-d)] transition-colors"
              >
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <h3 className="font-display text-xl font-medium">{g.name}</h3>
                  <Pill>{humanize(g.member_role) ?? "Member"}</Pill>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--ink-3)]">
                  {g.philosophy && <span>{humanize(g.philosophy)}</span>}
                  {g.city && <span>{g.city}</span>}
                  {g.member_count > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Users size={11} aria-hidden="true" /> {g.member_count}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function EmptyCard({
  title,
  body,
  cta,
}: {
  title: string
  body: string
  cta?: { href: string; label: string }
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--rule)] bg-white/40 p-8 text-center">
      <p className="font-medium mb-1">{title}</p>
      <p className="text-sm text-[var(--ink-3)] mb-3">{body}</p>
      {cta && (
        <Button asChild variant="outline">
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      )}
    </div>
  )
}
