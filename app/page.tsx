import React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Presentation, FolderHeart, Leaf, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--linen)] text-[var(--ink)]">
      <header className="container px-4 md:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="atoz-brand">
          <span className="atoz-brand-mark">A</span>
          <span>AtoZ Family</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white">
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -top-10 h-80 bg-[radial-gradient(ellipse_at_top,var(--honey-ll),transparent_60%)]"
          />
          <div className="container relative px-4 md:px-6 py-20 md:py-28">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-14 items-center">
              <div className="flex flex-col gap-6">
                <div className="atoz-eyebrow">AtoZ Family · calm homeschool</div>
                <h1 className="font-display text-5xl font-light tracking-tighter leading-[1.02] md:text-6xl lg:text-[68px]">
                  A calm home for{" "}
                  <span className="italic font-normal text-[var(--sage-dd)]">homeschool.</span>
                </h1>
                <p className="max-w-[560px] text-lg md:text-xl text-[var(--ink-2)] leading-[1.55]">
                  Plan, teach, capture, and rest. Five quiet rooms around the daily rhythm of a family&apos;s
                  learning — <em className="atoz-hand text-[var(--terracotta-d)] text-2xl not-italic font-semibold">without the performance culture.</em>
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    size="lg"
                    asChild
                    className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white rounded-full px-6"
                  >
                    <Link href="/sign-up">
                      Get started <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="rounded-full border-[var(--rule)] hover:bg-[var(--sage-ll)]"
                  >
                    <Link href="/today">See the rooms</Link>
                  </Button>
                </div>
                <p className="text-sm text-[var(--ink-3)]">
                  Free to try · No credit card · Local-first (your data stays on your device)
                </p>
              </div>
              <div className="relative">
                <div className="relative aspect-[4/3] w-full max-w-[600px] rounded-[var(--atoz-radius-l)] overflow-hidden shadow-[var(--shadow-hover)]">
                  <Image
                    src="/images/atozfamily-hero.jpg"
                    alt="A child's desk with books, an apple, and learning blocks"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/25 via-transparent to-transparent" />
                </div>
                <div className="absolute -top-6 -right-6 hidden sm:block">
                  <div className="atoz-hand text-[var(--terracotta-d)] text-xl -rotate-6 bg-[var(--linen-2)] border border-[var(--rule)] rounded-xl px-4 py-2 shadow-sm">
                    rest is learning too.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 md:py-24 bg-[var(--linen-2)]/60 border-y border-[var(--rule)]">
          <div className="container px-4 md:px-6">
            <div className="max-w-[760px] mx-auto text-center">
              <div className="atoz-eyebrow">Principles</div>
              <h2 className="font-display text-4xl md:text-5xl font-light tracking-tighter mt-3 mb-4">
                Serene, not performative.
              </h2>
              <p className="text-[var(--ink-2)] md:text-lg leading-[1.6]">
                No streaks. No badges. No leaderboards. The calm in this product comes from what we
                refuse to build.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
              <Feature
                icon={<Presentation className="h-6 w-6" />}
                title="Teach at your pace"
                body="Author a lesson, schedule it, teach it, capture what happened. One calm loop."
              />
              <Feature
                icon={<FolderHeart className="h-6 w-6" />}
                title="Portfolio that captures itself"
                body="Photos, quotes, reflections saved from every session. No extra data entry."
              />
              <Feature
                icon={<Leaf className="h-6 w-6" />}
                title="Compliance — if you want it"
                body="Hours tracking is off by default. Turn it on for weekly totals. Off for quiet seasons."
              />
              <Feature
                icon={<Shield className="h-6 w-6" />}
                title="Kid-safe by default"
                body="Kid mode hides admin chrome. Flip it on and only the lesson remains."
              />
            </div>
          </div>
        </section>

        {/* Rooms preview */}
        <section className="py-20 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="max-w-[720px] mx-auto text-center mb-12">
              <div className="atoz-eyebrow">Five rooms</div>
              <h2 className="font-display text-4xl md:text-5xl font-light tracking-tighter mt-3 mb-4">
                Each room does one thing well.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 max-w-5xl mx-auto">
              <RoomCard title="Today" body="The daily landing. Hero greeting, today's lessons, quick log." href="/today" />
              <RoomCard title="Teach" body="Author, schedule, and run a lesson. Dark full-screen mode when it starts." href="/teach" />
              <RoomCard title="Family" body="Kids, portfolios, hours. Simple, per-child." href="/family/calm" />
              <RoomCard title="Community" body="Co-parents, tutors, grandparents. Scoped access." href="/people" />
              <RoomCard title="Library" body="Every lesson across statuses. Filter and search." href="/library" />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-20 md:py-28">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--sage-ll),transparent_70%)] opacity-60"
          />
          <div className="container relative px-4 md:px-6">
            <div className="max-w-[720px] mx-auto text-center">
              <h2 className="font-display text-4xl md:text-5xl font-light tracking-tighter mb-4">
                Ready to slow down?
              </h2>
              <p className="text-[var(--ink-2)] md:text-lg mb-8">
                Your family&apos;s learning — calm, captured, and on your terms.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  size="lg"
                  asChild
                  className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white rounded-full px-6"
                >
                  <Link href="/sign-up">Get started free <ArrowRight className="h-4 w-4 ml-2" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-white/80 border border-[var(--rule)] p-5 flex flex-col gap-3 shadow-[var(--shadow-soft)]">
      <div className="w-12 h-12 rounded-xl bg-[var(--sage-ll)] text-[var(--sage-dd)] grid place-items-center">
        {icon}
      </div>
      <h3 className="font-display text-xl font-medium">{title}</h3>
      <p className="text-sm text-[var(--ink-2)] leading-[1.55]">{body}</p>
    </div>
  )
}

function RoomCard({ title, body, href }: { title: string; body: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-[var(--rule)] bg-white p-5 hover:bg-[var(--sage-ll)] hover:border-[var(--sage-l)] transition flex flex-col gap-2"
    >
      <div className="font-display text-xl font-medium">{title}</div>
      <p className="text-sm text-[var(--ink-2)] leading-[1.5] flex-1">{body}</p>
      <span className="text-xs text-[var(--sage-dd)] font-medium inline-flex items-center gap-1">
        Open <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
  )
}
