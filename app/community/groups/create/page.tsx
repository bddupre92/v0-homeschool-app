"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { createGroup } from "@/app/actions/group-actions"

const PHILOSOPHIES = [
  { value: "classical", label: "Classical" },
  { value: "montessori", label: "Montessori" },
  { value: "charlotte_mason", label: "Charlotte Mason" },
  { value: "unschooling", label: "Unschooling" },
  { value: "eclectic", label: "Eclectic" },
  { value: "waldorf", label: "Waldorf" },
  { value: "reggio", label: "Reggio Emilia" },
  { value: "traditional", label: "Traditional" },
  { value: "other", label: "Other" },
]

const SUBJECTS = [
  "Math", "Science", "English", "History", "Art",
  "Music", "PE", "Foreign Language", "Technology", "Geography",
]

const AGE_GROUPS = [
  { value: "preschool", label: "Preschool (3-5)" },
  { value: "elementary", label: "Elementary (6-10)" },
  { value: "middle", label: "Middle School (11-13)" },
  { value: "high", label: "High School (14-18)" },
]

export default function CreateGroupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [groupType, setGroupType] = useState("")
  const [philosophy, setPhilosophy] = useState("")
  const [meetingFrequency, setMeetingFrequency] = useState("")
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([])
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [isAcceptingMembers, setIsAcceptingMembers] = useState(true)

  const toggleAgeGroup = (value: string) => {
    setSelectedAgeGroups((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const toggleSubject = (value: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    formData.set("type", groupType)
    formData.set("philosophy", philosophy)
    formData.set("meetingFrequency", meetingFrequency)
    formData.set("ageGroups", selectedAgeGroups.join(","))
    formData.set("subjectsOffered", selectedSubjects.join(","))
    formData.set("isAcceptingMembers", String(isAcceptingMembers))

    try {
      const result = await createGroup(formData)

      if (result.success) {
        toast({
          title: "Group Created",
          description: "Your group has been created successfully!",
        })
        router.push("/community")
      } else {
        setError(result.error || "Failed to create group")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

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

          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Create a New Group</CardTitle>
              <CardDescription>Start a homeschool group or co-op in your community</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name *</Label>
                  <Input id="name" name="name" placeholder="Enter the name of your group" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your group's purpose, activities, and who should join"
                    className="min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Group Type *</Label>
                    <Select value={groupType} onValueChange={setGroupType} required>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="co-op">Co-op</SelectItem>
                        <SelectItem value="special-interest">Special Interest</SelectItem>
                        <SelectItem value="support">Support Group</SelectItem>
                        <SelectItem value="class">Class</SelectItem>
                        <SelectItem value="social">Social Group</SelectItem>
                        <SelectItem value="field-trip">Field Trip Group</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="philosophy">Education Philosophy</Label>
                    <Select value={philosophy} onValueChange={setPhilosophy}>
                      <SelectTrigger id="philosophy">
                        <SelectValue placeholder="Select philosophy" />
                      </SelectTrigger>
                      <SelectContent>
                        {PHILOSOPHIES.map((p) => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Age Groups */}
                <div className="space-y-2">
                  <Label>Age Groups</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {AGE_GROUPS.map((ag) => (
                      <div key={ag.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`age-${ag.value}`}
                          checked={selectedAgeGroups.includes(ag.value)}
                          onCheckedChange={() => toggleAgeGroup(ag.value)}
                        />
                        <label htmlFor={`age-${ag.value}`} className="text-sm cursor-pointer">
                          {ag.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subjects */}
                <div className="space-y-2">
                  <Label>Subjects Offered</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {SUBJECTS.map((subj) => (
                      <div key={subj} className="flex items-center space-x-2">
                        <Checkbox
                          id={`subj-${subj}`}
                          checked={selectedSubjects.includes(subj)}
                          onCheckedChange={() => toggleSubject(subj)}
                        />
                        <label htmlFor={`subj-${subj}`} className="text-sm cursor-pointer">
                          {subj}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Schedule */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="meetingSchedule">Meeting Schedule</Label>
                    <Input
                      id="meetingSchedule"
                      name="meetingSchedule"
                      placeholder="e.g., Every Tuesday, 9:00 AM - 2:00 PM"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meetingFrequency">Meeting Frequency</Label>
                    <Select value={meetingFrequency} onValueChange={setMeetingFrequency}>
                      <SelectTrigger id="meetingFrequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location / Venue</Label>
                  <Input id="location" name="location" placeholder="Enter the venue name and address" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" placeholder="City" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input id="zipCode" name="zipCode" placeholder="Zip code" />
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-2">
                  <Label htmlFor="maxMembers">Max Members (optional)</Label>
                  <Input id="maxMembers" name="maxMembers" type="number" placeholder="Leave blank for unlimited" />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="accepting" className="text-base">Accepting New Members</Label>
                    <p className="text-sm text-muted-foreground">Allow others to find and join your group</p>
                  </div>
                  <Switch
                    id="accepting"
                    checked={isAcceptingMembers}
                    onCheckedChange={setIsAcceptingMembers}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" asChild disabled={isSubmitting}>
                    <Link href="/community">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Group"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
