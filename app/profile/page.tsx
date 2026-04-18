"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { BookOpen, Calendar, Edit, Grid3X3, Mail, MapPin, UserIcon, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Navigation from "@/components/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { getFamilyBlueprint, getChildren, getTotalHoursThisYear, getHourSummary } from "@/app/actions/family-actions"

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth()
  const { toast } = useToast()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // Editable fields
  const [editName, setEditName] = useState("")
  const [editBio, setEditBio] = useState("")

  // Profile data from DB
  const [familyName, setFamilyName] = useState("")
  const [childrenCount, setChildrenCount] = useState(0)
  const [totalHours, setTotalHours] = useState(0)
  const [subjectCount, setSubjectCount] = useState(0)
  const [interests, setInterests] = useState<string[]>([])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [blueprint, children, hours, hourSummary] = await Promise.all([
        getFamilyBlueprint(),
        getChildren(),
        getTotalHoursThisYear(),
        getHourSummary(),
      ])
      if (blueprint) {
        setFamilyName(blueprint.family_name || "")
        setInterests(blueprint.philosophy || [])
      }
      setChildrenCount(children.length)
      setTotalHours(hours)
      setSubjectCount(hourSummary.length)
    } catch (error) {
      console.error("Failed to load profile data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (user) {
      setEditName(user.displayName || "")
    }
  }, [user])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await updateUserProfile({ displayName: editName })
      toast({ title: "Profile updated", description: "Your profile has been saved." })
      setIsEditingProfile(false)
    } catch {
      toast({ title: "Error", description: "Failed to save profile.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const displayName = user?.displayName || "User"
  const email = user?.email || ""
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "U"

  return (
    <div className="min-h-screen flex flex-col bg-[var(--linen)] text-[var(--ink)]">
      <Navigation />

      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 space-y-6">
              <Card>
                <CardHeader className="relative pb-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit Profile</span>
                  </Button>
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={user?.photoURL || ""} alt={displayName} />
                      <AvatarFallback>
                        <span className="text-2xl font-bold">{initials}</span>
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-2xl">{displayName}</CardTitle>
                    {familyName && (
                      <CardDescription className="text-center">{familyName}</CardDescription>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex flex-col gap-2">
                    {email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {email}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {totalHours}h logged this year
                    </div>
                  </div>
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="flex flex-col items-center">
                        <span className="font-bold">{childrenCount}</span>
                        <span className="text-xs text-muted-foreground">Children</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-bold">{subjectCount}</span>
                        <span className="text-xs text-muted-foreground">Subjects</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-bold">{totalHours}h</span>
                        <span className="text-xs text-muted-foreground">Hours</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {interests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Philosophy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {interests.map((interest) => (
                        <Badge key={interest} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="md:w-2/3">
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview" className="flex items-center gap-1">
                    <Grid3X3 className="h-4 w-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="boards" className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    Boards
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Resources
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-primary">{totalHours}h</p>
                        <p className="text-sm text-muted-foreground">Total Hours This Year</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold">{subjectCount}</p>
                        <p className="text-sm text-muted-foreground">Active Subjects</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold">{childrenCount}</p>
                        <p className="text-sm text-muted-foreground">Children</p>
                      </CardContent>
                    </Card>
                    <Card className="flex items-center justify-center">
                      <CardContent className="pt-6 text-center">
                        <Button variant="outline" asChild>
                          <Link href="/plan">View Full Plan</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="boards" className="mt-6">
                  <div className="text-center py-12 text-muted-foreground">
                    <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Your boards will appear here.</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href="/boards">View Boards</Link>
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="resources" className="mt-6">
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Your saved resources will appear here.</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href="/resources">Browse Resources</Link>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your profile information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Display Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" value={email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
