"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, MapPin, ChevronRight, Filter, Loader2 } from "lucide-react"
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

// Sample data
const groupsData = [
  {
    id: "1",
    name: "Springfield Homeschool Co-op",
    description: "Weekly co-op offering classes in science, art, and physical education",
    location: "Springfield Community Center",
    members: 45,
    tags: ["Co-op", "All Ages", "Weekly"],
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Classical Conversations",
    description: "Classical education community with a Christian worldview",
    location: "First Baptist Church, Springfield",
    members: 32,
    tags: ["Classical", "Christian", "Weekly"],
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Nature Explorers",
    description: "Monthly nature study and outdoor adventures for homeschoolers",
    location: "Various parks around Springfield",
    members: 28,
    tags: ["Nature", "All Ages", "Monthly"],
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "Teen Book Club",
    description: "Book discussions and literary activities for homeschooled teens",
    location: "Springfield Public Library",
    members: 15,
    tags: ["Reading", "Teens", "Monthly"],
    image: "/placeholder.svg?height=40&width=40",
  },
]

export default function CommunityGroups() {
  const { toast } = useToast()
  const [groups, setGroups] = useState(groupsData)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    types: [],
    ages: [],
    frequency: [],
  })

  // Load groups from Firestore
  useEffect(() => {
    const loadGroups = async () => {
      try {
        setIsLoading(true)
        const result = await getGroups()
        
        if (result.success && result.groups) {
          setGroups(result.groups.length > 0 ? result.groups : groupsData)
        } else {
          setGroups(groupsData)
        }
      } catch (error) {
        console.error("[v0] Error loading groups:", error)
        toast({
          title: "Error",
          description: "Failed to load groups. Using sample data.",
          variant: "destructive",
        })
        setGroups(groupsData)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadGroups()
  }, [])

  const groupTypes = ["Co-op", "Special Interest", "Support", "Class", "Social", "Field Trip"]
  const ageGroups = ["Preschool", "Elementary", "Middle School", "High School", "Teens", "All Ages"]
  const frequencies = ["Weekly", "Bi-weekly", "Monthly", "Quarterly"]

  const handleFilterChange = (category, value) => {
    setFilters((prev) => {
      const currentValues = prev[category]
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value]

      return {
        ...prev,
        [category]: newValues,
      }
    })
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Homeschool Groups</CardTitle>
          </div>
          <div className="flex items-center gap-2">
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
            <Button variant="ghost" size="sm" asChild>
              <Link href="/community/groups/create">Create Group</Link>
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
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
            <Link key={group.id} href={`/community/groups/${group.id}`} className="block">
              <div className="flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={group.image || "/placeholder.svg"} alt={group.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Users className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                    <h3 className="font-medium text-base">{group.name}</h3>
                    <Badge variant="outline" className="shrink-0 w-fit">
                      {group.members} members
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{group.description}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{group.location}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {group.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
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
            <Link href="/community/groups">
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
