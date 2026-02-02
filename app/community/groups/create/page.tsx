"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { loadFromStorage, saveToStorage } from "@/lib/local-storage"

const GROUPS_STORAGE_KEY = "homeschoolGroups"

export default function CreateGroupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    meetingSchedule: "",
    location: "",
    address: "",
    ageGroup: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formData.name || !formData.type) {
      return
    }

    const storedGroups = loadFromStorage(GROUPS_STORAGE_KEY, [])
    const scheduleLower = formData.meetingSchedule.toLowerCase()
    const frequencyTag = scheduleLower.includes("quarter")
      ? "Quarterly"
      : scheduleLower.includes("bi-week") ||
          scheduleLower.includes("bi week") ||
          scheduleLower.includes("every other week")
        ? "Bi-weekly"
        : scheduleLower.includes("week")
          ? "Weekly"
          : scheduleLower.includes("month")
            ? "Monthly"
            : ""

    const newGroup = {
      id: typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}`,
      name: formData.name,
      description: formData.description,
      location: formData.location || formData.address,
      members: 1,
      tags: [formData.type, formData.ageGroup, frequencyTag || (formData.meetingSchedule ? "Custom" : "")].filter(
        Boolean,
      ),
      image: "/placeholder.svg?height=40&width=40",
    }

    saveToStorage(GROUPS_STORAGE_KEY, [...storedGroups, newGroup])
    router.push("/community")
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
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter the name of your group"
                    value={formData.name}
                    onChange={(event) => handleChange("name", event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your group's purpose, activities, and who should join"
                    className="min-h-[120px]"
                    value={formData.description}
                    onChange={(event) => handleChange("description", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Group Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select group type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Co-op">Co-op</SelectItem>
                      <SelectItem value="Special Interest">Special Interest</SelectItem>
                      <SelectItem value="Support">Support Group</SelectItem>
                      <SelectItem value="Class">Class</SelectItem>
                      <SelectItem value="Social">Social Group</SelectItem>
                      <SelectItem value="Field Trip">Field Trip Group</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting-schedule">Meeting Schedule</Label>
                  <Input
                    id="meeting-schedule"
                    placeholder="e.g., Every Tuesday, 9:00 AM - 2:00 PM"
                    value={formData.meetingSchedule}
                    onChange={(event) => handleChange("meetingSchedule", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Enter the venue name"
                    value={formData.location}
                    onChange={(event) => handleChange("location", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter the full address"
                    value={formData.address}
                    onChange={(event) => handleChange("address", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age-group">Age Group</Label>
                  <Select value={formData.ageGroup} onValueChange={(value) => handleChange("ageGroup", value)}>
                    <SelectTrigger id="age-group">
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Ages">All Ages</SelectItem>
                      <SelectItem value="Preschool">Preschool</SelectItem>
                      <SelectItem value="Elementary">Elementary</SelectItem>
                      <SelectItem value="Middle School">Middle School</SelectItem>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="Teens">Teens</SelectItem>
                      <SelectItem value="Parents Only">Parents Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/community">Cancel</Link>
                  </Button>
                  <Button type="submit">Create Group</Button>
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
