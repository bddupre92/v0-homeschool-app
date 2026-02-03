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
import { useToast } from "@/hooks/use-toast"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { createGroup } from "@/app/actions/group-actions"

export default function CreateGroupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [groupType, setGroupType] = useState("")
  const [ageGroup, setAgeGroup] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    formData.set("type", groupType)
    formData.set("ageGroup", ageGroup)

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
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="type">Group Type</Label>
                  <Select value={groupType} onValueChange={setGroupType} required>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select group type" />
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
                  <Label htmlFor="meetingSchedule">Meeting Schedule</Label>
                  <Input id="meetingSchedule" name="meetingSchedule" placeholder="e.g., Every Tuesday, 9:00 AM - 2:00 PM" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" placeholder="Enter the venue name and address" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxMembers">Max Members (optional)</Label>
                  <Input id="maxMembers" name="maxMembers" type="number" placeholder="Leave blank for unlimited" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ageGroup">Age Group</Label>
                  <Select value={ageGroup} onValueChange={setAgeGroup}>
                    <SelectTrigger id="ageGroup">
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ages</SelectItem>
                      <SelectItem value="preschool">Preschool</SelectItem>
                      <SelectItem value="elementary">Elementary</SelectItem>
                      <SelectItem value="middle">Middle School</SelectItem>
                      <SelectItem value="high">High School</SelectItem>
                      <SelectItem value="teens">Teens</SelectItem>
                      <SelectItem value="parents">Parents Only</SelectItem>
                    </SelectContent>
                  </Select>
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
