"use client"

import { useState } from "react"
import { format, addDays } from "date-fns"
import {
  CalendarIcon,
  Check,
  Clock,
  ExternalLink,
  Filter,
  Flag,
  Mail,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  Share2,
  Star,
  Tag,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import Navigation from "@/components/navigation"

// Sample community events data
const communityEvents = [
  {
    id: "1",
    title: "Science Fair Showcase",
    description:
      "Join us for a day of amazing science projects created by homeschooled students. Share your projects and learn from others!",
    date: addDays(new Date(), 5),
    time: "10:00 AM - 3:00 PM",
    location: "Community Center, 123 Main St",
    organizer: {
      name: "STEM Homeschoolers Group",
      avatar: "/placeholder.svg",
    },
    attendees: 24,
    isVirtual: false,
    isAttending: false,
    tags: ["Science", "Exhibition", "All Ages"],
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "2",
    title: "Virtual Book Club: Classical Literature",
    description:
      'Monthly discussion of classic literature for middle and high school students. This month we\'re reading "To Kill a Mockingbird".',
    date: addDays(new Date(), 10),
    time: "4:00 PM - 5:30 PM",
    location: "Zoom (link provided after RSVP)",
    organizer: {
      name: "Classical Education Enthusiasts",
      avatar: "/placeholder.svg",
    },
    attendees: 18,
    isVirtual: true,
    isAttending: false,
    tags: ["Literature", "Discussion", "Middle School", "High School"],
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "3",
    title: "Homeschool Park Day",
    description:
      "Weekly meetup at the park for homeschooling families. Bring games, snacks, and enjoy socializing with other families.",
    date: addDays(new Date(), 2),
    time: "1:00 PM - 4:00 PM",
    location: "Sunshine Park, 456 Park Avenue",
    organizer: {
      name: "Local Homeschool Network",
      avatar: "/placeholder.svg",
    },
    attendees: 35,
    isVirtual: false,
    isAttending: true,
    tags: ["Social", "Outdoor", "All Ages"],
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "4",
    title: "Art Workshop: Watercolor Techniques",
    description:
      "Learn basic and advanced watercolor techniques in this hands-on workshop led by professional artist Maria Garcia.",
    date: addDays(new Date(), 7),
    time: "10:00 AM - 12:00 PM",
    location: "Creative Arts Center, 789 Oak Street",
    organizer: {
      name: "Homeschool Arts Collective",
      avatar: "/placeholder.svg",
    },
    attendees: 15,
    isVirtual: false,
    isAttending: false,
    tags: ["Art", "Workshop", "Elementary", "Middle School"],
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "5",
    title: "Field Trip: Natural History Museum",
    description:
      "Guided tour of the Natural History Museum with special exhibits on dinosaurs and ancient civilizations.",
    date: addDays(new Date(), 14),
    time: "9:00 AM - 1:00 PM",
    location: "City Natural History Museum, 101 Museum Drive",
    organizer: {
      name: "Curious Explorers Homeschool Group",
      avatar: "/placeholder.svg",
    },
    attendees: 42,
    isVirtual: false,
    isAttending: false,
    tags: ["Field Trip", "Science", "History", "All Ages"],
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "6",
    title: "Coding Workshop for Kids",
    description:
      "Introduction to coding concepts using Scratch. Perfect for beginners with no prior coding experience.",
    date: addDays(new Date(), 9),
    time: "3:30 PM - 5:00 PM",
    location: "Tech Learning Center, 555 Digital Avenue",
    organizer: {
      name: "Tech Savvy Homeschoolers",
      avatar: "/placeholder.svg",
    },
    attendees: 20,
    isVirtual: false,
    isAttending: false,
    tags: ["Technology", "Coding", "Elementary", "Middle School"],
    image: "/placeholder.svg?height=200&width=400",
  },
]

// Sample co-ops data
const coops = [
  {
    id: "c1",
    name: "Westside Homeschool Co-op",
    description: "A cooperative learning environment offering classes in science, art, music, and physical education.",
    location: "Westside Community Church, 123 West Avenue",
    meetingDays: "Tuesdays and Thursdays",
    ageGroups: ["Elementary", "Middle School", "High School"],
    memberCount: 45,
    website: "https://example.com/westside-coop",
    contactEmail: "info@westsidecoop.example.com",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "c2",
    name: "STEM Explorers Co-op",
    description: "Focused on science, technology, engineering, and mathematics with hands-on learning experiences.",
    location: "Innovation Center, 456 Tech Boulevard",
    meetingDays: "Fridays",
    ageGroups: ["Elementary", "Middle School"],
    memberCount: 28,
    website: "https://example.com/stem-explorers",
    contactEmail: "contact@stemexplorers.example.com",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "c3",
    name: "Classical Conversations Community",
    description: "Following the classical education model with emphasis on grammar, dialectic, and rhetoric stages.",
    location: "Heritage Hall, 789 Classical Road",
    meetingDays: "Mondays",
    ageGroups: ["Elementary", "Middle School", "High School"],
    memberCount: 60,
    website: "https://example.com/classical-conversations",
    contactEmail: "info@classicalconversations.example.com",
    image: "/placeholder.svg?height=200&width=400",
  },
]

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])
  const [viewMode, setViewMode] = useState("upcoming")

  // Filter events based on search query, selected date, and tags
  const filteredEvents = communityEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDate = selectedDate ? format(event.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd") : true

    const matchesTags = selectedTags.length > 0 ? selectedTags.some((tag) => event.tags.includes(tag)) : true

    return matchesSearch && matchesDate && matchesTags
  })

  const allTags = Array.from(new Set(communityEvents.flatMap((event) => event.tags))).sort()

  const toggleTag = (tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Community</h1>
              <p className="text-muted-foreground">
                Connect with local homeschoolers, find events, co-ops, and field trips
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={() => setIsAddingEvent(true)} className="gap-1">
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-3/4">
              <Tabs defaultValue="upcoming" onValueChange={setViewMode}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <TabsList>
                    <TabsTrigger value="upcoming" className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      Upcoming Events
                    </TabsTrigger>
                    <TabsTrigger value="coops" className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Co-ops
                    </TabsTrigger>
                    <TabsTrigger value="attending" className="flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      My Events
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search events..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-1 w-[180px] justify-start">
                          <CalendarIcon className="h-4 w-4" />
                          {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Filter by date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date)
                            setIsCalendarOpen(false)
                          }}
                          initialFocus
                        />
                        {selectedDate && (
                          <div className="p-3 border-t">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)} className="w-full">
                              Clear date
                            </Button>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-1">
                          <Filter className="h-4 w-4" />
                          Filter
                          {selectedTags.length > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                              {selectedTags.length}
                            </Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                        <div className="p-2">
                          <div className="font-medium text-sm mb-2">Filter by Tags</div>
                          <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {allTags.map((tag) => (
                              <div key={tag} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`tag-${tag}`}
                                  checked={selectedTags.includes(tag)}
                                  onCheckedChange={() => toggleTag(tag)}
                                />
                                <Label htmlFor={`tag-${tag}`} className="text-sm font-normal cursor-pointer">
                                  {tag}
                                </Label>
                              </div>
                            ))}
                          </div>
                          {selectedTags.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedTags([])}
                              className="w-full mt-2"
                            >
                              Clear filters
                            </Button>
                          )}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <TabsContent value="upcoming" className="mt-0 space-y-6">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <Card key={event.id} className="overflow-hidden">
                        <div className="md:flex">
                          <div className="md:w-1/3 h-48 md:h-auto relative">
                            <img
                              src={event.image || "/placeholder.svg"}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                            {event.isVirtual && <Badge className="absolute top-2 right-2 bg-blue-500">Virtual</Badge>}
                          </div>
                          <div className="md:w-2/3 p-6">
                            <CardHeader className="p-0 pb-4">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-xl">{event.title}</CardTitle>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Share2 className="mr-2 h-4 w-4" />
                                      Share
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      Add to Calendar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Flag className="mr-2 h-4 w-4" />
                                      Report
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <CardDescription className="mt-2">{event.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 pb-4 space-y-3">
                              <div className="flex items-center text-sm">
                                <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                {format(event.date, "EEEE, MMMM d, yyyy")}
                              </div>
                              <div className="flex items-center text-sm">
                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                {event.time}
                              </div>
                              <div className="flex items-center text-sm">
                                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                {event.location}
                              </div>
                              <div className="flex items-center text-sm">
                                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                                {event.attendees} attending
                              </div>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {event.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                    <Tag className="h-3 w-3" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                            <CardFooter className="p-0 pt-2 flex items-center justify-between">
                              <div className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarImage src={event.organizer.avatar || "/placeholder.svg"} />
                                  <AvatarFallback>{event.organizer.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                  Organized by {event.organizer.name}
                                </span>
                              </div>
                              <Button variant={event.isAttending ? "secondary" : "default"}>
                                {event.isAttending ? "Attending" : "RSVP"}
                              </Button>
                            </CardFooter>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No events found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchQuery || selectedDate || selectedTags.length > 0
                          ? "Try adjusting your filters to find more events"
                          : "There are no upcoming events in your area"}
                      </p>
                      <Button onClick={() => setIsAddingEvent(true)}>Create an Event</Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="coops" className="mt-0">
                  <div className="grid gap-6 md:grid-cols-2">
                    {coops.map((coop) => (
                      <Card key={coop.id} className="overflow-hidden">
                        <div className="h-48 relative">
                          <img
                            src={coop.image || "/placeholder.svg"}
                            alt={coop.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardHeader>
                          <CardTitle>{coop.name}</CardTitle>
                          <CardDescription>{coop.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            {coop.location}
                          </div>
                          <div className="flex items-center text-sm">
                            <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            Meets on {coop.meetingDays}
                          </div>
                          <div className="flex items-center text-sm">
                            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                            {coop.memberCount} members
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {coop.ageGroups.map((age) => (
                              <Badge key={age} variant="outline">
                                {age}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button variant="outline" className="gap-1">
                            <Mail className="h-4 w-4" />
                            Contact
                          </Button>
                          <Button className="gap-1">
                            <ExternalLink className="h-4 w-4" />
                            Visit Website
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="attending" className="mt-0">
                  {communityEvents.filter((e) => e.isAttending).length > 0 ? (
                    <div className="space-y-6">
                      {communityEvents
                        .filter((e) => e.isAttending)
                        .map((event) => (
                          <Card key={event.id} className="overflow-hidden">
                            <div className="md:flex">
                              <div className="md:w-1/3 h-48 md:h-auto relative">
                                <img
                                  src={event.image || "/placeholder.svg"}
                                  alt={event.title}
                                  className="w-full h-full object-cover"
                                />
                                {event.isVirtual && (
                                  <Badge className="absolute top-2 right-2 bg-blue-500">Virtual</Badge>
                                )}
                              </div>
                              <div className="md:w-2/3 p-6">
                                <CardHeader className="p-0 pb-4">
                                  <CardTitle className="text-xl">{event.title}</CardTitle>
                                  <CardDescription className="mt-2">{event.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 pb-4 space-y-3">
                                  <div className="flex items-center text-sm">
                                    <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                    {format(event.date, "EEEE, MMMM d, yyyy")}
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                    {event.time}
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                    {event.location}
                                  </div>
                                </CardContent>
                                <CardFooter className="p-0 pt-2">
                                  <Button variant="outline" className="gap-1">
                                    <CalendarIcon className="h-4 w-4" />
                                    Add to Calendar
                                  </Button>
                                </CardFooter>
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">You're not attending any events</h3>
                      <p className="text-muted-foreground mb-4">RSVP to events to see them listed here</p>
                      <Button onClick={() => setViewMode("upcoming")}>Browse Events</Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <div className="md:w-1/4">
              <Card>
                <CardHeader>
                  <CardTitle>Nearby Groups</CardTitle>
                  <CardDescription>Homeschool groups in your area</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "City Homeschoolers", members: 124, distance: "2.5 miles" },
                    { name: "Nature Explorers", members: 87, distance: "5 miles" },
                    { name: "Classical Education Group", members: 56, distance: "8 miles" },
                  ].map((group, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{group.name}</div>
                        <div className="text-sm text-muted-foreground">{group.members} members</div>
                      </div>
                      <Badge variant="outline">{group.distance}</Badge>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Groups
                  </Button>
                </CardFooter>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Popular Locations</CardTitle>
                  <CardDescription>Favorite field trip destinations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Science Museum", rating: "4.8", visits: 342 },
                    { name: "Botanical Gardens", rating: "4.6", visits: 287 },
                    { name: "Historical Village", rating: "4.5", visits: 215 },
                    { name: "Children's Theater", rating: "4.7", visits: 198 },
                  ].map((location, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{location.name}</div>
                        <div className="text-sm text-muted-foreground">
                          <Star className="h-3 w-3 inline mr-1 text-yellow-500" />
                          {location.rating} · {location.visits} visits
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Explore Map
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Add Event Dialog */}
      <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>Share your event with the homeschool community</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="event-title">Event Title</Label>
              <Input id="event-title" placeholder="Enter event title" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-description">Description</Label>
              <Textarea id="event-description" placeholder="Describe your event" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="event-date">Date</Label>
                <Input id="event-date" type="date" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-time">Time</Label>
                <Input id="event-time" type="time" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-location">Location</Label>
              <Input id="event-location" placeholder="Enter location" />
            </div>
            <div className="grid gap-2">
              <Label>Event Type</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="in-person" />
                  <Label htmlFor="in-person" className="text-sm font-normal">
                    In-person
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="virtual" />
                  <Label htmlFor="virtual" className="text-sm font-normal">
                    Virtual
                  </Label>
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-tags">Tags</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select tags" />
                </SelectTrigger>
                <SelectContent>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground mt-1">Select tags that describe your event</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingEvent(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsAddingEvent(false)}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
