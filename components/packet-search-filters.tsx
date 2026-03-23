"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Star, X } from "lucide-react"
import type { PacketFilters } from "@/lib/types"

interface PacketSearchFiltersProps {
  filters: PacketFilters
  onFiltersChange: (filters: PacketFilters) => void
  childNames: string[]
}

export default function PacketSearchFilters({
  filters,
  onFiltersChange,
  childNames,
}: PacketSearchFiltersProps) {
  const updateFilter = (key: keyof PacketFilters, value: string | boolean | undefined) => {
    onFiltersChange({ ...filters, [key]: value || undefined })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasFilters = filters.subject || filters.grade || filters.childName || filters.isFavorite || filters.search

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Input
        placeholder="Search packets..."
        value={filters.search || ""}
        onChange={(e) => updateFilter("search", e.target.value)}
        className="sm:max-w-[220px]"
      />

      <Select
        value={filters.subject || "all"}
        onValueChange={(v) => updateFilter("subject", v === "all" ? undefined : v)}
      >
        <SelectTrigger className="sm:w-[160px]">
          <SelectValue placeholder="Subject" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Subjects</SelectItem>
          <SelectItem value="Mathematics">Mathematics</SelectItem>
          <SelectItem value="Science">Science</SelectItem>
          <SelectItem value="English Language Arts">ELA</SelectItem>
          <SelectItem value="History">History</SelectItem>
          <SelectItem value="Geography">Geography</SelectItem>
          <SelectItem value="Art">Art</SelectItem>
          <SelectItem value="Music">Music</SelectItem>
          <SelectItem value="Physical Education">PE</SelectItem>
          <SelectItem value="Foreign Language">Foreign Language</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.grade || "all"}
        onValueChange={(v) => updateFilter("grade", v === "all" ? undefined : v)}
      >
        <SelectTrigger className="sm:w-[140px]">
          <SelectValue placeholder="Grade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Grades</SelectItem>
          <SelectItem value="Kindergarten">Kindergarten</SelectItem>
          {Array.from({ length: 12 }, (_, i) => (
            <SelectItem key={i + 1} value={`${i + 1}${["st", "nd", "rd"][i] || "th"} Grade`}>
              {i + 1}{["st", "nd", "rd"][i] || "th"} Grade
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {childNames.length > 0 && (
        <Select
          value={filters.childName || "all"}
          onValueChange={(v) => updateFilter("childName", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="sm:w-[140px]">
            <SelectValue placeholder="Child" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Children</SelectItem>
            {childNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Button
        variant={filters.isFavorite ? "default" : "outline"}
        size="icon"
        className="shrink-0"
        onClick={() => updateFilter("isFavorite", !filters.isFavorite ? true : undefined)}
      >
        <Star className={`h-4 w-4 ${filters.isFavorite ? "fill-current" : ""}`} />
      </Button>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0 gap-1">
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  )
}
