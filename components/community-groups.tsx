"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, MapPin, ChevronRight, Filter, Loader2, Compass, Plus } from "lucide-react"
import { getGroups } from "@/app/actions/group-actions"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const PHILOSOPHY_LABELS: Record<string, string> = {
  classical: "Classical",
  montessori: "Montessori",
  charlotte_mason: "Charlotte Mason",
  unschooling: "Unschooling",
  eclectic: "Eclectic",
  waldorf: "Waldorf",
  reggio: "Reggio Emilia",
  traditional: "Traditional",
}

export default function CommunityGroups() {
  const { toast } = useToast()
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<{
    types: string[]
    ages: string[]
    frequency: string[]
  }>({
    types: [],
    ages: [],
    frequency: [],
  })

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      setIsLoading(true)
      const result = await getGroups()

      if (result.success && result.groups) {
        setGroups(result.groups)
      } else {
        setGroups([])
      }
    } catch (error) {
      console.error("[v0] Error loading groups:", error)
      toast({
        title: "Error",
        description: "Failed to load groups.",
        variant: "destructive",
      })
      setGroups([])
    } finally {
      setIsLoading(false)
    }
  }

  const groupTypes = ["Co-op", "Special Interest", "Support", "Class", "Social", "Field Trip"]
  const ageGroups = ["Preschool", "Elementary", "Middle School", "High School", "Teens", "All Ages"]
  const frequencies = ["Weekly", "Bi-weekly", "Monthly", "Quarterly"]

  const handleFilterChange = (category: string, value: string) => {
    setFilters((prev) => {
      const currentValues = (prev as any)[category] as string[]
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v: string) => v !== value)
        : [...currentValues, value]

      return {
        ...prev,
        [category]: newValues,
      }
    })
  }

  // Apply client-side filters
  const filteredGroups = groups.filter((group) => {
    if (filters.types.length > 0) {
      const typeMatch = filters.types.some(
        (t) => group.groupType?.toLowerCase().includes(t.toLowerCase())
      )
      if (!typeMatch) return false
    }
    if (filters.ages.length > 0) {
      const ageMatch = filters.ages.some(
        (a) => group.ageGroups?.some((ag: string) => ag.toLowerCase().includes(a.toLowerCase()))
      )
      if (!ageMatch) return false
    }
    if (filters.frequency.length > 0) {
      const freqMatch = filters.frequency.some(
        (f) => group.meetingFrequency?.toLowerCase().includes(f.toLowerCase())
      )
      if (!freqMatch) return false
    }
    return true
  })

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Homeschool Groups</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1" asChild>
              <Link href="/community/groups/discover">
                <Compass className="h-3.5 w-3.5" />
                <span>Discover</span>
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <h4 className="font-medium text-sm mb-1">Group Type</h4>
                  {groupTypes.map((type) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={filters.types.includes(type)}
                      onCheckedChange={() => handleFilterChange("types", type)}
                    >
                      {type}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
                <div className="p-2 border-t">
                  <h4 className="font-medium text-sm mb-1">Age Group</h4>
                  {ageGroups.map((age) => (
                    <DropdownMenuCheckboxItem
                      key={age}
                      checked={filters.ages.includes(age)}
                      onCheckedChange={() => handleFilterChange("ages", age)}
                    >
                      {age}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
                <div className="p-2 border-t">
                  <h4 className="font-medium text-sm mb-1">Meeting Frequency</h4>
                  {frequencies.map((freq) => (
                    <DropdownMenuCheckboxItem
                      key={freq}
                      checked={filters.frequency.includes(freq)}
                      onCheckedChange={() => handleFilterChange("frequency", freq)}
                    >
                      {freq}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link href="/community/groups/create">
                <Plus className="h-3.5 w-3.5" />
                Create
              </Link>
            </Button>
          </div>
        </div>
        <CardDescription>Connect with local homeschool groups and co-ops</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading groups...</p>
            </div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <h3 className="font-medium text-lg mb-1">No groups found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {groups.length > 0
                ? "Try adjusting your filters to see more results."
                : "Be the first to create a homeschool group in your area!"}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/community/groups/discover">Discover Groups</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/community/groups/create">Create a Group</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGroups.map((group) => (
              <Link key={group.id} href={`/community/groups/${group.id}`} className="block">
                <div className="flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={group.imageUrl || "/placeholder.svg"} alt={group.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Users className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                      <h3 className="font-medium text-base">{group.name}</h3>
                      <Badge variant="outline" className="shrink-0 w-fit">
                        {group.memberCount} members
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{group.description}</p>
                    {group.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{group.city || group.location}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {group.philosophy && (
                        <Badge variant="secondary" className="text-xs">
                          {PHILOSOPHY_LABELS[group.philosophy] || group.philosophy}
                        </Badge>
                      )}
                      {group.ageGroups?.slice(0, 3).map((ag: string) => (
                        <Badge key={ag} variant="outline" className="text-xs">
                          {ag}
                        </Badge>
                      ))}
                      {group.meetingFrequency && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {group.meetingFrequency}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            <Button
              variant="ghost"
              className="w-full flex items-center justify-center gap-1 text-muted-foreground"
              asChild
            >
              <Link href="/community/groups/discover">
                View all groups
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
