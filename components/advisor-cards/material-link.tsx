"use client"

import { ExternalLink, BookOpen, Video, Globe, FileText, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { MaterialResource } from "@/lib/types"

const TYPE_ICONS: Record<string, typeof BookOpen> = {
  book: BookOpen,
  video: Video,
  website: Globe,
  article: FileText,
  supply: Package,
}

export function MaterialLink({ material }: { material: string | MaterialResource }) {
  // Plain string material — render as simple badge (backward compatible)
  if (typeof material === "string") {
    return (
      <Badge variant="secondary" className="text-xs">
        {material}
      </Badge>
    )
  }

  const Icon = TYPE_ICONS[material.type] || Package
  const displayName = material.name + (material.price ? ` (${material.price})` : "")

  // Material with URL — render as clickable badge
  if (material.url) {
    return (
      <a href={material.url} target="_blank" rel="noopener noreferrer">
        <Badge
          variant="secondary"
          className="text-xs cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors inline-flex items-center gap-1"
        >
          <Icon className="h-3 w-3 shrink-0" />
          {displayName}
          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
        </Badge>
      </a>
    )
  }

  // Material object without URL — render with type icon but no link
  return (
    <Badge variant="secondary" className="text-xs inline-flex items-center gap-1">
      <Icon className="h-3 w-3 shrink-0" />
      {displayName}
    </Badge>
  )
}
