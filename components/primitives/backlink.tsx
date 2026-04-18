"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface BacklinkProps {
  href?: string
  onClick?: () => void
  className?: string
  children: React.ReactNode
}

export function Backlink({ href, onClick, className, children }: BacklinkProps) {
  const inner = (
    <>
      <ChevronLeft size={14} aria-hidden="true" />
      <span>{children}</span>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={cn("atoz-backlink", className)}>
        {inner}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={cn("atoz-backlink", className)}>
      {inner}
    </button>
  )
}
