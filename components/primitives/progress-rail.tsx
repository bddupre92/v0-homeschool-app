import * as React from "react"
import { cn } from "@/lib/utils"

type RailTone = "sage" | "honey" | "terracotta"

interface ProgressRailProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  tone?: RailTone
  label?: string
}

export function ProgressRail({
  value,
  max = 100,
  tone = "sage",
  label,
  className,
  ...rest
}: ProgressRailProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={cn("atoz-progress-rail", className)}
      {...rest}
    >
      <div
        className={cn("atoz-progress-rail__fill", `atoz-progress-rail__fill--${tone}`)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
