"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Users, MapPin, Calendar, BookOpen,
  Megaphone, GraduationCap, Compass, Loader2, LogOut, Settings,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { getGroupDetails, joinGroup, leaveGroup, getUserGroupRole } from "@/app/actions/group-actions"
import GroupAnnouncements from "@/components/group-announcements"
import GroupSharedPacketGrid from "@/components/group-shared-packet-grid"
import GroupMemberList from "@/components/group-member-list"
import TeachingRotationCalendar from "@/components/teaching-rotation-calendar"
import GroupFieldTripCard from "@/components/group-field-trip-card"
import { getGroupFieldTrips, getTeachingRotations } from "@/app/actions/group-coordination-actions"
import type { GroupProfile, GroupMember } from "@/lib/types"

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

export default function GroupPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const groupId = params.id as string

  const [group, setGroup] = useState<GroupProfile | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [fieldTrips, setFieldTrips] = useState<any[]>([])
  const [rotations, setRotations] = useState<any[]>([])

  useEffect(() => {
    loadGroupData()
  }, [groupId])

  const loadGroupData = async () => {
    try {
      setIsLoading(true)
      const [detailsResult, roleResult] = await Promise.all([
        getGroupDetails(groupId),
        getUserGroupRole(groupId),
      ])

      if (!detailsResult.success || !detailsResult.group) {
        toast({ title: "Error", description: "Group not found", variant: "destructive" })
        router.push("/community")
        return
      }

      setGroup(detailsResult.group as GroupProfile)
      setMembers((detailsResult.members || []) as GroupMember[])
      setUserRole(roleResult.role || null)

      // Load coordination data if user is a member
      if (roleResult.role) {
        const [tripsResult, rotResult] = await Promise.all([
          getGroupFieldTrips(groupId),
          getTeachingRotations(groupId),
        ])
        if (tripsResult.success) setFieldTrips(tripsResult.trips || [])
        if (rotResult.success) setRotations(rotResult.rotations || [])
      }
    } catch (error) {
      console.error("[v0] Error loading group:", error)
      toast({ title: "Error", description: "Failed to load group", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoin = async () => {
    setIsJoining(true)
    try {
      const result = await joinGroup(groupId)
      if (result.success) {
        toast({ title: "Joined!", description: "You are now a member of this group." })
        loadGroupData()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    } finally {
      setIsJoining(false)
    }
  }

  const handleLeave = async () => {
    try {
      const result = await leaveGroup(groupId)
      if (result.success) {
        toast({ title: "Left group", description: "You have left this group." })
        loadGroupData()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to leave group", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--linen)] text-[var(--ink)]">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!group) return null

  const isMember = userRole !== null
  const isAdmin = userRole === "admin"

  return (
    <div className="min-h-screen flex flex-col bg-[var(--linen)] text-[var(--ink)]">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={group.imageUrl || "/placeholder.svg"} alt={group.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Users className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold">{group.name}</h1>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {group.philosophy && (
                      <Badge variant="secondary">
                        {PHILOSOPHY_LABELS[group.philosophy] || group.philosophy}
                      </Badge>
                    )}
                    {group.ageGroups?.map((ag) => (
                      <Badge key={ag} variant="outline">{ag}</Badge>
                    ))}
                    {group.meetingFrequency && (
                      <Badge variant="outline" className="capitalize">{group.meetingFrequency}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
                  <TabsTrigger value="about" className="text-xs gap-1">
                    <Compass className="h-3 w-3" />
                    About
                  </TabsTrigger>
                  <TabsTrigger value="members" className="text-xs gap-1">
                    <Users className="h-3 w-3" />
                    Members
                  </TabsTrigger>
                  {isMember && (
                    <>
                      <TabsTrigger value="packets" className="text-xs gap-1">
                        <BookOpen className="h-3 w-3" />
                        Packets
                      </TabsTrigger>
                      <TabsTrigger value="announcements" className="text-xs gap-1">
                        <Megaphone className="h-3 w-3" />
                        News
                      </TabsTrigger>
                      <TabsTrigger value="trips" className="text-xs gap-1">
                        <MapPin className="h-3 w-3" />
                        Trips
                      </TabsTrigger>
                      <TabsTrigger value="schedule" className="text-xs gap-1">
                        <GraduationCap className="h-3 w-3" />
                        Schedule
                      </TabsTrigger>
                    </>
                  )}
                </TabsList>

                <TabsContent value="about" className="mt-4">
                  <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">About This Group</h2>
                    <p className="text-muted-foreground whitespace-pre-line">{group.description || "No description provided."}</p>

                    {group.subjectsOffered && group.subjectsOffered.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-medium mb-2">Subjects Offered</h3>
                        <div className="flex flex-wrap gap-1">
                          {group.subjectsOffered.map((s) => (
                            <Badge key={s} variant="outline">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </TabsContent>

                <TabsContent value="members" className="mt-4">
                  <GroupMemberList
                    members={members}
                    groupId={groupId}
                    isAdmin={isAdmin}
                    onUpdate={loadGroupData}
                  />
                </TabsContent>

                {isMember && (
                  <>
                    <TabsContent value="packets" className="mt-4">
                      <GroupSharedPacketGrid
                        groupId={groupId}
                        isAdmin={isAdmin}
                      />
                    </TabsContent>

                    <TabsContent value="announcements" className="mt-4">
                      <GroupAnnouncements
                        groupId={groupId}
                        isAdmin={isAdmin}
                        userRole={userRole}
                      />
                    </TabsContent>

                    <TabsContent value="trips" className="mt-4">
                      <div className="space-y-4">
                        <h2 className="text-xl font-bold">Field Trips</h2>
                        {fieldTrips.length === 0 ? (
                          <Card className="p-6 text-center text-muted-foreground">
                            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No field trips planned yet.</p>
                          </Card>
                        ) : (
                          fieldTrips.map((trip) => (
                            <GroupFieldTripCard key={trip.id} trip={trip} groupId={groupId} />
                          ))
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="schedule" className="mt-4">
                      <TeachingRotationCalendar
                        groupId={groupId}
                        rotations={rotations}
                        isAdmin={isAdmin}
                        members={members}
                        onUpdate={loadGroupData}
                      />
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Group Details</h2>
                <div className="space-y-4">
                  {group.meetingSchedule && (
                    <div className="flex gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Meeting Schedule</h3>
                        <p className="text-sm text-muted-foreground">{group.meetingSchedule}</p>
                      </div>
                    </div>
                  )}

                  {(group.location || group.city) && (
                    <div className="flex gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Location</h3>
                        <p className="text-sm text-muted-foreground">{group.location}</p>
                        {group.city && <p className="text-sm text-muted-foreground">{group.city}{group.zipCode ? `, ${group.zipCode}` : ""}</p>}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Users className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Members</h3>
                      <p className="text-sm text-muted-foreground">
                        {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
                        {group.maxMembers ? ` / ${group.maxMembers} max` : ""}
                      </p>
                    </div>
                  </div>

                  {group.groupType && (
                    <div className="flex gap-3">
                      <Compass className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Type</h3>
                        <p className="text-sm text-muted-foreground capitalize">{group.groupType}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-2">
                  {!isMember ? (
                    <Button className="w-full" onClick={handleJoin} disabled={isJoining || !group.isAcceptingMembers}>
                      {isJoining ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Joining...</>
                      ) : group.isAcceptingMembers ? (
                        "Join This Group"
                      ) : (
                        "Not Accepting Members"
                      )}
                    </Button>
                  ) : (
                    <>
                      {!isAdmin && (
                        <Button variant="outline" className="w-full gap-1" onClick={handleLeave}>
                          <LogOut className="h-4 w-4" />
                          Leave Group
                        </Button>
                      )}
                      {isAdmin && (
                        <Button variant="outline" className="w-full gap-1" asChild>
                          <Link href={`/community/groups/${groupId}`}>
                            <Settings className="h-4 w-4" />
                            Manage Group
                          </Link>
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
