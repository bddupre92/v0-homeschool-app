import * as React from "react"
import { cn } from "@/lib/utils"

type PillVariant = "default" | "sage" | "honey" | "terracotta"

interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: PillVariant
}

export function Pill({ variant = "default", className, children, ...rest }: PillProps) {
  return (
    <span
      className={cn(
        "atoz-pill",
        variant === "sage" && "atoz-pill--sage",
        variant === "honey" && "atoz-pill--honey",
        variant === "terracotta" && "atoz-pill--terracotta",
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  )
}
