import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Users, MapPin, Calendar, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"

// Sample data - in a real app, this would come from your database
const groupsData = [
  {
    id: "1",
    name: "Springfield Homeschool Co-op",
    description:
      "Weekly co-op offering classes in science, art, and physical education. Our mission is to provide enriching educational experiences in a supportive community environment. We welcome families of all homeschooling approaches and backgrounds.",
    location: "Springfield Community Center",
    address: "123 Main St, Springfield, IL 62701",
    members: 45,
    tags: ["Co-op", "All Ages", "Weekly"],
    image: "/placeholder.svg?height=40&width=40",
    meetingSchedule: "Every Tuesday, 9:00 AM - 2:00 PM",
    upcomingEvents: [
      {
        id: "101",
        title: "Fall Semester Registration",
        date: "2025-07-15T10:00:00",
      },
      {
        id: "102",
        title: "Back-to-School Picnic",
        date: "2025-08-20T12:00:00",
      },
    ],
    organizers: ["Jane Smith", "John Doe"],
    founded: "2018",
  },
]

export default function GroupPage({ params }) {
  const group = groupsData.find((g) => g.id === params.id)

  if (!group) {
    notFound()
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
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
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={group.image || "/placeholder.svg"} alt={group.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Users className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold">{group.name}</h1>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {group.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">About This Group</h2>
                <p className="text-muted-foreground whitespace-pre-line">{group.description}</p>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
                {group.upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {group.upcomingEvents.map((event) => (
                      <Link key={event.id} href={`/community/events/${event.id}`} className="block">
                        <div className="flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                          <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center shrink-0 text-primary">
                            <Calendar className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-medium">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No upcoming events scheduled.</p>
                )}
                <div className="mt-4">
                  <Button variant="outline" asChild>
                    <Link href={`/community/events/create?groupId=${group.id}`}>Create Event</Link>
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Members</h2>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>{group.members} members</span>
                </div>
                <div className="mt-4">
                  <Button className="w-full">Join This Group</Button>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Group Details</h2>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Meeting Schedule</h3>
                      <p className="text-sm text-muted-foreground">{group.meetingSchedule}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Location</h3>
                      <p className="text-sm text-muted-foreground">{group.location}</p>
                      <p className="text-sm text-muted-foreground">{group.address}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Users className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Organizers</h3>
                      <p className="text-sm text-muted-foreground">{group.organizers.join(", ")}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Founded</h3>
                      <p className="text-sm text-muted-foreground">{group.founded}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Button className="w-full">Join This Group</Button>
                  <Button variant="outline" className="w-full gap-1">
                    <Share2 className="h-4 w-4" />
                    <span>Share Group</span>
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
