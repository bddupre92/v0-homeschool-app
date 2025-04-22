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

export default function CreateEventPage() {
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
              <CardTitle>Create a New Event</CardTitle>
              <CardDescription>Share your homeschool event with the community</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input id="title" placeholder="Enter the name of your event" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe your event" className="min-h-[120px]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" />
                  </div>
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
                  <Label htmlFor="type">Event Type</Label>
                  <Select>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="field-trip">Field Trip</SelectItem>
                      <SelectItem value="social">Social Gathering</SelectItem>
                      <SelectItem value="class">Class</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">Cost</Label>
                  <Input id="cost" placeholder="Free or enter amount" />
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
                      <SelectItem value="parents">Parents Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/community">Cancel</Link>
                  </Button>
                  <Button type="submit">Create Event</Button>
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
