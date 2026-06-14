/**
 * Community room — co-op discovery landing.
 *
 * Server component that gates on Postgres availability. When configured,
 * shows the user's groups + a discovery form; without Postgres, renders
 * a calm "configuration pending" empty state so a fresh deploy doesn't
 * crash.
 *
 * Discovery flow itself (zip + filters → ranked GroupMatchCard list) ships
 * in Phase 7.2 once the form + server action are wired end-to-end. For
 * now this page is the durable shell + the entry to /community/new.
 */

import Link from "next/link"
import { Users, Plus, Compass } from "lucide-react"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Pill } from "@/components/primitives"
import { isPostgresConfigured, postgresUnavailableMessage } from "@/lib/postgres-guard"

export const dynamic = "force-dynamic"

export default async function CommunityPage() {
  const ready = isPostgresConfigured()

  return (
    <div className="min-h-screen bg-[var(--linen)] text-[var(--ink)] font-sans">
      <Navigation />
      <main className="atoz-page">
        <header className="mb-10">
          <div className="atoz-eyebrow">Community</div>
          <h1 className="font-display text-5xl font-light tracking-tighter leading-[1.05] mt-2">
            Find your village.
          </h1>
          <p className="text-[var(--ink-2)] mt-2 max-w-[640px]">
            Co-ops, learning circles, and study groups in your area. Match by
            philosophy, age, and schedule — no maps, no algorithm anxiety.
          </p>
        </header>

        {!ready ? <ConfigurationPendingCard /> : <ReadyState />}

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

function ReadyState() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-[var(--rule)] bg-white p-6">
        <div className="flex items-baseline justify-between mb-2 flex-wrap gap-3">
          <h2 className="font-display text-2xl font-medium flex items-center gap-2">
            <Compass className="h-5 w-5" aria-hidden="true" />
            Discover
          </h2>
          <Pill variant="honey">Coming in 7.2</Pill>
        </div>
        <p className="text-sm text-[var(--ink-2)] mb-4">
          The discovery form (ZIP + distance + philosophy + ages) lands in
          Phase 7.2. The data tables and server actions are already wired —
          you can create a group now and it will appear here once discovery
          ships.
        </p>
        <Button asChild className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white">
          <Link href="/community/new">
            <Plus size={14} className="mr-1" aria-hidden="true" />
            Create a co-op
          </Link>
        </Button>
      </section>

      <section className="rounded-2xl border border-[var(--rule)] bg-white p-6">
        <h2 className="font-display text-2xl font-medium flex items-center gap-2 mb-2">
          <Users className="h-5 w-5" aria-hidden="true" />
          Your groups
        </h2>
        <p className="text-sm text-[var(--ink-2)]">
          Groups you join will appear here. Phase 7.2 wires the live list.
        </p>
      </section>
    </div>
  )
}
