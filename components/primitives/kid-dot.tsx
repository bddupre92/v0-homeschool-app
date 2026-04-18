import * as React from "react"
import { cn } from "@/lib/utils"

export type KidDotSize = "xs" | "sm" | "md" | "lg"

interface KidDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string
  color?: string
  size?: KidDotSize
}

function initialOf(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return "?"
  return trimmed[0].toUpperCase()
}

export function KidDot({ name, color, size = "sm", className, style, ...rest }: KidDotProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("atoz-kid-dot", `atoz-kid-dot--${size}`, className)}
      style={{ background: color ?? "var(--sage-d)", ...style }}
      {...rest}
    >
      {initialOf(name)}
    </span>
  )
}
