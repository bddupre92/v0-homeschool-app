"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/** Full-screen dark container used by teach mode. */
export function TeachScreen({
  className,
  desktop = false,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { desktop?: boolean }) {
  return (
    <div
      className={cn("teach-screen", desktop && "teach-screen--desktop", className)}
      style={{ ["--bg" as string]: "#14170f" }}
      {...rest}
    >
      {children}
    </div>
  )
}

/** Large digital timer. Accepts ms; renders mm:ss. */
export function TeachTimer({
  ms,
  paused,
  size = "md",
  className,
}: {
  ms: number
  paused?: boolean
  size?: "md" | "lg"
  className?: string
}) {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n: number) => n.toString().padStart(2, "0")
  const label = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
  return (
    <div
      className={cn(
        "teach-timer",
        size === "lg" && "teach-timer--lg",
        paused && "teach-timer--paused",
        className,
      )}
      role="timer"
      aria-live="off"
      aria-label={paused ? `Paused at ${label}` : `Elapsed ${label}`}
    >
      {label}
    </div>
  )
}

/** Subject + meta chip shown at top of teach mode (e.g. "Math · Emma · 45 min"). */
export function TeachSubjectChip({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={cn("teach-subject-chip", className)}>
      <span className="teach-dot" aria-hidden="true" />
      {children}
    </span>
  )
}

/** Dark card for plan / materials / captures. */
export function TeachCard({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("teach-card", className)} {...rest}>
      {children}
    </div>
  )
}

/** Dark pill button. Variants: default, primary (terracotta), secondary (ghost). */
interface TeachBtnProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: "default" | "primary" | "secondary"
}
export const TeachBtn = React.forwardRef<HTMLButtonElement, TeachBtnProps>(function TeachBtn(
  { variant = "default", className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "teach-btn",
        variant === "primary" && "teach-btn--primary",
        variant === "secondary" && "teach-btn--secondary",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
})

/** Progress rail calibrated for dark mode. */
export function TeachProgress({
  value,
  max = 100,
  className,
}: {
  value: number
  max?: number
  className?: string
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div
      className={cn("teach-progress", className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="teach-progress__fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

/** Floating bottom capture bar for teach mode. */
export function CaptureBar({ children }: { children: React.ReactNode }) {
  return <div className="teach-capture-bar">{children}</div>
}
