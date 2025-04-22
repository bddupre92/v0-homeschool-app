import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function CreateGroupPage() {
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
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name</Label>
                  <Input id="name" placeholder="Enter the name of your group" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your group's purpose, activities, and who should join"
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Group Type</Label>
                  <Select>
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
                  <Label htmlFor="meeting-schedule">Meeting Schedule</Label>
                  <Input id="meeting-schedule" placeholder="e.g., Every Tuesday, 9:00 AM - 2:00 PM" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Enter the venue name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="Enter the full address" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age-group">Age Group</Label>
                  <Select>
                    <SelectTrigger id="age-group">
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
