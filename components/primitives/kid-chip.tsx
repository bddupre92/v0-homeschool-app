"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { KidDot, type KidDotSize } from "./kid-dot"

interface KidChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  name: string
  color?: string
  active?: boolean
  dotSize?: KidDotSize
}

export const KidChip = React.forwardRef<HTMLButtonElement, KidChipProps>(function KidChip(
  { name, color, active = false, dotSize = "sm", className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={name}
      className={cn("atoz-kid-chip", active && "atoz-kid-chip--active", className)}
      {...rest}
    >
      <KidDot name={name} color={color} size={dotSize} />
      <span>{name}</span>
    </button>
  )
})
