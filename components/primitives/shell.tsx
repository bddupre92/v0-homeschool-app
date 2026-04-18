"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Presentation, Heart, Users, BookMarked, Plus } from "lucide-react"

export const ATOZ_ROOMS = [
  { href: "/today", label: "Today", icon: Home, matchPrefix: "/today" },
  { href: "/teach", label: "Teach", icon: Presentation, matchPrefix: "/teach" },
  { href: "/family/calm", label: "Family", icon: Heart, matchPrefix: "/family" },
  { href: "/people", label: "Community", icon: Users, matchPrefix: "/people" },
  { href: "/library", label: "Library", icon: BookMarked, matchPrefix: "/library" },
] as const

interface TopbarProps {
  onLogHours?: () => void
  children?: React.ReactNode
}

export function Topbar({ onLogHours, children }: TopbarProps) {
  const pathname = usePathname() ?? ""
  return (
    <header className="atoz-topbar">
      <div className="atoz-topbar__inner">
        <Link href="/today" className="atoz-brand">
          <span className="atoz-brand-mark">A</span>
          <span>AtoZ Family</span>
        </Link>
        <nav className="atoz-top-nav" aria-label="Main">
          {ATOZ_ROOMS.map((room) => (
            <Link
              key={room.href}
              href={room.href}
              aria-current={pathname.startsWith(room.matchPrefix) ? "page" : undefined}
            >
              {room.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {onLogHours && (
            <button
              type="button"
              onClick={onLogHours}
              className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-[var(--sage-ll)] text-[var(--sage-dd)] border border-[var(--sage-l)] hover:bg-[var(--sage-l)] transition"
            >
              <Plus size={14} /> Log hours
            </button>
          )}
          {children}
        </div>
      </div>
    </header>
  )
}

export function PhoneBottomNav() {
  const pathname = usePathname() ?? ""
  return (
    <nav className="atoz-phone-bottom-nav" aria-label="Rooms">
      {ATOZ_ROOMS.map((room) => {
        const Icon = room.icon
        const active = pathname.startsWith(room.matchPrefix)
        return (
          <Link
            key={room.href}
            href={room.href}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={18} aria-hidden="true" />
            {room.label}
          </Link>
        )
      })}
    </nav>
  )
}

interface FABProps {
  onClick: () => void
  label?: string
}

export function FAB({ onClick, label = "Log hours" }: FABProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="atoz-fab"
    >
      <Plus size={22} strokeWidth={2.2} />
    </button>
  )
}

interface ComplianceStripProps {
  icon?: React.ReactNode
  tone?: "sage" | "honey"
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function ComplianceStrip({ icon, tone = "sage", children, action, className }: ComplianceStripProps) {
  return (
    <div
      className={cn(
        "atoz-compliance-strip",
        tone === "honey" && "atoz-compliance-strip--honey",
        className,
      )}
    >
      {icon}
      <div className="flex-1 text-sm">{children}</div>
      {action}
    </div>
  )
}
