/**
 * /filings — list of all generated compliance filings.
 *
 * Server component. Postgres-gated like /community: when unset, renders
 * a calm "Filings require a connected database" empty state.
 */

import Link from "next/link"
import { FileText, Plus } from "lucide-react"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Pill } from "@/components/primitives"
import { isPostgresConfigured, postgresUnavailableMessage } from "@/lib/postgres-guard"
import { listMyFilings } from "@/app/actions/filings-actions"
import { listFilingTypes } from "@/lib/compliance/filings"

export const dynamic = "force-dynamic"

function fmtDate(value: string | Date | undefined | null) {
  if (!value) return null
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export default async function FilingsPage() {
  if (!isPostgresConfigured()) return <Shell><ConfigPending /></Shell>

  const { filings } = await listMyFilings()
  const types = listFilingTypes()

  return (
    <Shell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="atoz-eyebrow">Compliance</div>
          <h1 className="font-display text-5xl font-light tracking-tighter leading-[1.05] mt-2">
            Filings.
          </h1>
          <p className="text-[var(--ink-2)] mt-2 max-w-[640px]">
            The forms your state actually wants. Generated from what you've logged.
          </p>
        </div>
        <Button asChild className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white">
          <Link href="/filings/new">
            <Plus size={14} className="mr-1" aria-hidden="true" />
            New filing
          </Link>
        </Button>
      </header>

      {filings.length === 0 ? (
        <EmptyCard
          title="No filings yet."
          body="Generate your first one — pick a state and a child, we'll auto-populate the form from your logs."
        />
      ) : (
        <ul className="space-y-3">
          {filings.map((f: any) => (
            <li
              key={f.id}
              className="rounded-2xl border border-[var(--rule)] bg-white p-5 flex flex-wrap items-baseline justify-between gap-3"
            >
              <div className="flex-1 min-w-[280px]">
                <div className="atoz-eyebrow mb-1">
                  {(f.state_code ?? f.state_abbreviation ?? "??").toString().toUpperCase()} · {f.filing_type}
                </div>
                <div className="font-display text-xl font-medium">
                  {f.source_data_snapshot?.child?.name ?? "(child)"}
                </div>
                <div className="text-xs text-[var(--ink-3)] mt-1 flex gap-2 flex-wrap">
                  <span>School year {f.school_year ?? "—"}</span>
                  {f.created_at && <span>· Generated {fmtDate(f.created_at)}</span>}
                  {f.submitted_at && <span>· Submitted {fmtDate(f.submitted_at)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Pill variant={f.submitted_at ? "sage" : undefined}>
                  {f.submitted_at ? "Submitted" : "Generated"}
                </Pill>
                <Button asChild variant="outline" size="sm">
                  <a href={`/api/filings/${f.id}/download`}>Download PDF</a>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-12 pt-8 border-t border-[var(--rule)]">
        <h2 className="font-display text-xl font-medium mb-3">Supported filings</h2>
        <ul className="grid sm:grid-cols-2 gap-3">
          {types.map((t) => (
            <li key={`${t.state}:${t.filingType}`} className="rounded-xl border border-[var(--rule)] bg-white p-4">
              <div className="atoz-eyebrow mb-1">{t.state.toUpperCase()} · {t.filingType}</div>
              <div className="font-medium">{t.title}</div>
              <div className="text-xs text-[var(--ink-3)] mt-1">{t.description}</div>
              <div className="text-xs text-[var(--ink-4)] mt-2">Citation: {t.citation}</div>
            </li>
          ))}
        </ul>
        <p className="text-xs text-[var(--ink-4)] mt-4">
          NY IHIP + quarterlies, PA Act 169 portfolio, and MA education plan land in Phase 8.2 and 8.3.
        </p>
      </section>
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

function ConfigPending() {
  return (
    <section className="rounded-2xl border border-dashed border-[var(--rule)] bg-white/40 p-10 text-center max-w-[640px] mx-auto">
      <FileText className="h-10 w-10 mx-auto text-[var(--ink-3)] mb-4" aria-hidden="true" />
      <h1 className="font-display text-2xl font-medium mb-2">Filings need a connected database.</h1>
      <p className="text-sm text-[var(--ink-2)]">{postgresUnavailableMessage()}</p>
    </section>
  )
}

function EmptyCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--rule)] bg-white/40 p-10 text-center">
      <FileText className="h-10 w-10 mx-auto text-[var(--ink-3)] mb-4" aria-hidden="true" />
      <p className="font-medium mb-1">{title}</p>
      <p className="text-sm text-[var(--ink-3)] mb-4">{body}</p>
      <Button asChild>
        <Link href="/filings/new">Generate your first filing</Link>
      </Button>
    </div>
  )
}
