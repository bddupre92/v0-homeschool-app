"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, MapPin, Users, ChevronRight, Filter, Loader2 } from "lucide-react"
import { getEvents } from "@/app/actions/event-actions"
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

// Sample data
const eventsData = [
  {
    id: "1",
    title: "Science Fair Preparation Workshop",
    date: "2025-05-15T14:00:00",
    location: "Community Center, Springfield",
    attendees: 18,
    type: "Workshop",
    tags: ["Science", "Elementary", "Middle School"],
  },
  {
    id: "2",
    title: "Homeschool Co-op Open House",
    date: "2025-05-20T10:00:00",
    location: "Liberty Park, Springfield",
    attendees: 45,
    type: "Open House",
    tags: ["All Ages", "Co-op"],
  },
  {
    id: "3",
    title: "Nature Walk & Journaling",
    date: "2025-05-22T09:00:00",
    location: "Riverside Trail, Springfield",
    attendees: 12,
    type: "Field Trip",
    tags: ["Science", "Nature", "All Ages"],
  },
  {
    id: "4",
    title: "Homeschool Book Club Meeting",
    date: "2025-05-25T15:30:00",
    location: "Public Library, Springfield",
    attendees: 15,
    type: "Club",
    tags: ["Reading", "Middle School", "High School"],
  },
]

export default function CommunityEvents() {
  const { toast } = useToast()
  const [events, setEvents] = useState(eventsData)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    types: [],
    ages: [],
  })

  // Load events from Firestore
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true)
        const result = await getEvents({ upcoming: true })
        
        if (result.success && result.events) {
          setEvents(result.events.length > 0 ? result.events : eventsData)
        } else {
          setEvents(eventsData)
        }
      } catch (error) {
        console.error("[v0] Error loading events:", error)
        toast({
          title: "Error",
          description: "Failed to load events. Using sample data.",
          variant: "destructive",
        })
        setEvents(eventsData)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadEvents()
  }, [])

  const eventTypes = ["Workshop", "Open House", "Field Trip", "Club", "Class", "Social"]
  const ageGroups = ["Preschool", "Elementary", "Middle School", "High School", "All Ages"]

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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Upcoming Community Events</CardTitle>
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
                  <h4 className="font-medium text-sm mb-1">Event Type</h4>
                  {eventTypes.map((type) => (
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
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/community/events/create">Create Event</Link>
            </Button>
          </div>
        </div>
        <CardDescription>Connect with other homeschoolers at these upcoming events</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading events...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
            <Link key={event.id} href={`/community/events/${event.id}`} className="block">
              <div className="flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center shrink-0 text-primary">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                    <h3 className="font-medium text-base">{event.title}</h3>
                    <Badge variant="outline" className="shrink-0 w-fit">
                      {event.type}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{event.attendees} attending</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {event.tags.map((tag) => (
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
            <Link href="/community/events">
              View all events
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
