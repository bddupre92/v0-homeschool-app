"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Search, MapPin, Loader2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import GroupDiscoveryMap from "@/components/group-discovery-map"
import GroupMatchCard from "@/components/group-match-card"
import { getGroups, joinGroup } from "@/app/actions/group-actions"
import { rankGroups } from "@/lib/group-matching"
import { useToast } from "@/hooks/use-toast"
import type { GroupProfile, GroupMatchResult, UserGroupPreferences } from "@/lib/types"

const PHILOSOPHIES = [
  { value: "", label: "All Philosophies" },
  { value: "classical", label: "Classical" },
  { value: "montessori", label: "Montessori" },
  { value: "charlotte_mason", label: "Charlotte Mason" },
  { value: "unschooling", label: "Unschooling" },
  { value: "eclectic", label: "Eclectic" },
  { value: "waldorf", label: "Waldorf" },
  { value: "traditional", label: "Traditional" },
]

const AGE_GROUPS = [
  { value: "", label: "All Ages" },
  { value: "preschool", label: "Preschool" },
  { value: "elementary", label: "Elementary" },
  { value: "middle", label: "Middle School" },
  { value: "high", label: "High School" },
]

export default function DiscoverGroupsPage() {
  const { toast } = useToast()
  const [groups, setGroups] = useState<GroupProfile[]>([])
  const [rankedGroups, setRankedGroups] = useState<GroupMatchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<[number, number] | undefined>()

  // Filter state
  const [search, setSearch] = useState("")
  const [philosophy, setPhilosophy] = useState("")
  const [ageGroup, setAgeGroup] = useState("")

  useEffect(() => {
    loadGroups()
    getUserLocation()
  }, [])

  useEffect(() => {
    // Re-rank groups when filters or location change
    const prefs: UserGroupPreferences = {
      latitude: userLocation?.[1],
      longitude: userLocation?.[0],
      maxDistanceMiles: 25,
      preferredPhilosophy: philosophy || undefined,
      childAgeGroups: ageGroup ? [ageGroup] : [],
      wantedSubjects: [],
    }

    let filtered = groups
    if (search) {
      const q = search.toLowerCase()
      filtered = groups.filter(
        (g) => g.name.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q)
      )
    }
    if (philosophy) {
      filtered = filtered.filter((g) => g.philosophy === philosophy)
    }
    if (ageGroup) {
      filtered = filtered.filter((g) => g.ageGroups?.includes(ageGroup))
    }

    setRankedGroups(rankGroups(prefs, filtered))
  }, [groups, search, philosophy, ageGroup, userLocation])

  const loadGroups = async () => {
    try {
      setIsLoading(true)
      const result = await getGroups({ isAccepting: true })
      if (result.success) {
        setGroups(result.groups as GroupProfile[])
      }
    } catch (error) {
      console.error("[v0] Error loading groups:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getUserLocation = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.longitude, pos.coords.latitude]),
        () => {} // Silently fail — user can still browse without location
      )
    }
  }

  const handleJoin = async (groupId: string) => {
    const result = await joinGroup(groupId)
    if (result.success) {
      toast({ title: "Joined!", description: "You are now a member of this group." })
      loadGroups()
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
  }

  const clearFilters = () => {
    setSearch("")
    setPhilosophy("")
    setAgeGroup("")
  }

  const hasFilters = search || philosophy || ageGroup

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div className="mb-6">
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link href="/community">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Community</span>
              </Link>
            </Button>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold">Discover Groups</h1>
            <p className="text-muted-foreground mt-1">Find homeschool co-ops and groups near you</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={philosophy} onValueChange={setPhilosophy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Philosophy" />
              </SelectTrigger>
              <SelectContent>
                {PHILOSOPHIES.map((p) => (
                  <SelectItem key={p.value || "all"} value={p.value || "all_philosophies"}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ageGroup} onValueChange={setAgeGroup}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Age Group" />
              </SelectTrigger>
              <SelectContent>
                {AGE_GROUPS.map((ag) => (
                  <SelectItem key={ag.value || "all"} value={ag.value || "all_ages"}>
                    {ag.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
            {!userLocation && (
              <Button variant="outline" size="sm" onClick={getUserLocation} className="gap-1">
                <MapPin className="h-3.5 w-3.5" />
                Use my location
              </Button>
            )}
          </div>

          {/* Map + List layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map */}
            <div className="lg:sticky lg:top-4 lg:self-start">
              <GroupDiscoveryMap
                groups={rankedGroups}
                userLocation={userLocation}
                height="500px"
              />
              {userLocation && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Showing groups near your location
                </p>
              )}
            </div>

            {/* Results list */}
            <div>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : rankedGroups.length === 0 ? (
                <Card className="p-8 text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <h3 className="font-medium text-lg mb-1">No groups found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {hasFilters
                      ? "Try adjusting your filters or search terms."
                      : "Be the first to create a group in your area!"}
                  </p>
                  <div className="flex gap-2 justify-center">
                    {hasFilters && (
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    )}
                    <Button size="sm" asChild>
                      <Link href="/community/groups/create">Create a Group</Link>
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {rankedGroups.length} group{rankedGroups.length !== 1 ? "s" : ""} found
                    </p>
                    {userLocation && (
                      <Badge variant="outline" className="text-xs">Sorted by match</Badge>
                    )}
                  </div>
                  {rankedGroups.map((group) => (
                    <GroupMatchCard key={group.id} group={group} onJoin={handleJoin} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
