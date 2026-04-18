"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type ChipTone = "sage" | "terracotta" | "honey"

interface ChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  active?: boolean
  outline?: boolean
  tone?: ChipTone
}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { active = false, outline = true, tone = "sage", className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={active}
      className={cn(
        "atoz-chip",
        outline && !active && "atoz-chip--outline",
        active && "atoz-chip--active",
        tone === "terracotta" && "atoz-chip--terracotta",
        tone === "honey" && "atoz-chip--honey",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
})
