import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, MapPin, Users, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"

// Sample data - in a real app, this would come from your database
const eventsData = [
  {
    id: "1",
    title: "Science Fair Preparation Workshop",
    date: "2025-05-15T14:00:00",
    location: "Community Center, Springfield",
    address: "123 Main St, Springfield, IL 62701",
    attendees: 18,
    type: "Workshop",
    tags: ["Science", "Elementary", "Middle School"],
    description:
      "Join us for a hands-on workshop to help prepare your students for the upcoming regional homeschool science fair. We'll cover project selection, scientific method, display creation, and presentation skills. Materials will be provided. Suitable for elementary and middle school students.",
    organizer: "Springfield Homeschool Association",
    cost: "Free",
  },
]

export default function EventPage({ params }) {
  const event = eventsData.find((e) => e.id === params.id)

  if (!event) {
    notFound()
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date)
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h1 className="text-3xl font-bold">{event.title}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge>{event.type}</Badge>
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">About This Event</h2>
                <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Attendees</h2>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>{event.attendees} people attending</span>
                </div>
                <div className="mt-4">
                  <Button className="w-full">RSVP to this Event</Button>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Event Details</h2>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Date and Time</h3>
                      <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Location</h3>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                      <p className="text-sm text-muted-foreground">{event.address}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Users className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Organizer</h3>
                      <p className="text-sm text-muted-foreground">{event.organizer}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-5 w-5 flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
                      $
                    </div>
                    <div>
                      <h3 className="font-medium">Cost</h3>
                      <p className="text-sm text-muted-foreground">{event.cost}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Button className="w-full">RSVP to this Event</Button>
                  <Button variant="outline" className="w-full gap-1">
                    <Share2 className="h-4 w-4" />
                    <span>Share Event</span>
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Location</h2>
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Map will be displayed here</p>
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
