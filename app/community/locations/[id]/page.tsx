"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Star,
  MapPin,
  Users,
  Calendar,
  ExternalLink,
  Share2,
  ThumbsUp,
  MessageSquare,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { GoogleLocationMap } from "@/components/google-location-map"
import Navigation from "@/components/navigation"

// This would come from your database in a real app
const getLocationById = (id: string) => {
  const locations = [
    {
      id: "1",
      name: "Science Museum",
      rating: "4.8",
      visits: 342,
      coordinates: [-122.4194, 37.7749],
      address: "123 Science Way, San Francisco, CA",
      category: "museum",
      description: "Interactive exhibits on various scientific topics. Great for all ages.",
      phone: "(555) 123-4567",
      website: "https://example.com/science-museum",
      hours: "Mon-Fri: 9am-5pm, Sat-Sun: 10am-6pm",
      admission: "Adults: $15, Children: $8, Homeschool groups: $6 per student with reservation",
      amenities: ["Parking", "Cafe", "Gift Shop", "Wheelchair Accessible"],
      educationalPrograms: [
        "Homeschool Science Days (every Wednesday)",
        "STEM Workshops (monthly)",
        "Science Camps (summer and winter breaks)",
      ],
      reviews: [
        {
          id: "r1",
          user: {
            name: "Sarah Johnson",
            avatar: "/placeholder.svg",
          },
          rating: 5,
          date: "2023-05-15",
          text: "Excellent place for homeschoolers! My kids loved the hands-on exhibits and the staff was very knowledgeable and friendly. The homeschool discount is a nice bonus.",
        },
        {
          id: "r2",
          user: {
            name: "Michael Chen",
            avatar: "/placeholder.svg",
          },
          rating: 4,
          date: "2023-04-22",
          text: "Great exhibits and educational value. The only reason I'm not giving 5 stars is because it can get very crowded during peak hours. Try to visit early in the day.",
        },
        {
          id: "r3",
          user: {
            name: "Emily Rodriguez",
            avatar: "/placeholder.svg",
          },
          rating: 5,
          date: "2023-03-10",
          text: "We attend their homeschool days regularly and they're always well organized with different themes each time. Highly recommend for science curriculum enrichment.",
        },
      ],
      upcomingEvents: [
        {
          id: "e1",
          title: "Homeschool Science Day: Chemistry",
          date: "2023-06-15",
          time: "10:00 AM - 2:00 PM",
          description: "Special activities and demonstrations focused on chemistry concepts for homeschool students.",
        },
        {
          id: "e2",
          title: "Astronomy Night",
          date: "2023-06-22",
          time: "7:00 PM - 10:00 PM",
          description: "Telescope viewing, planetarium shows, and astronomy activities for the whole family.",
        },
      ],
    },
    {
      id: "2",
      name: "Botanical Gardens",
      rating: "4.6",
      visits: 287,
      coordinates: [-122.4324, 37.7699],
      address: "456 Garden Path, San Francisco, CA",
      category: "park",
      description: "Beautiful gardens with plants from around the world. Guided tours available.",
      phone: "(555) 987-6543",
      website: "https://example.com/botanical-gardens",
      hours: "Daily: 9am-5pm",
      admission: "Adults: $12, Children: $6, Homeschool groups: $5 per student with reservation",
      amenities: ["Parking", "Cafe", "Gift Shop", "Wheelchair Accessible", "Picnic Area"],
      educationalPrograms: [
        "Homeschool Botany Classes (bi-weekly)",
        "Junior Gardener Program (seasonal)",
        "Nature Art Workshops (monthly)",
      ],
      reviews: [
        {
          id: "r1",
          user: {
            name: "David Wilson",
            avatar: "/placeholder.svg",
          },
          rating: 5,
          date: "2023-05-02",
          text: "A peaceful oasis in the city. We use this as part of our nature studies curriculum. The staff is very accommodating to homeschoolers.",
        },
        {
          id: "r2",
          user: {
            name: "Lisa Thompson",
            avatar: "/placeholder.svg",
          },
          rating: 4,
          date: "2023-04-10",
          text: "Beautiful gardens and great educational programs. The guided tours are very informative.",
        },
      ],
      upcomingEvents: [
        {
          id: "e1",
          title: "Homeschool Botany Day",
          date: "2023-06-20",
          time: "10:00 AM - 12:00 PM",
          description: "Hands-on activities about plant life cycles and ecosystems.",
        },
      ],
    },
    // Add more locations as needed
  ]

  return locations.find((loc) => loc.id === id)
}

export default function LocationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [location, setLocation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("info")
  const [newReview, setNewReview] = useState("")

  useEffect(() => {
    if (params.id) {
      const locationData = getLocationById(params.id as string)
      setLocation(locationData)
      setLoading(false)
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container py-8 px-4 md:px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!location) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container py-8 px-4 md:px-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Location Not Found</h1>
          <p className="mb-6">The location you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container py-8 px-4 md:px-6">
        <Button variant="ghost" className="mb-4 pl-0" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Community
        </Button>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <div className="h-64 relative">
                <img
                  src="/placeholder.svg?height=400&width=800"
                  alt={location.name}
                  className="w-full h-full object-cover"
                />
                <Badge
                  className="absolute top-4 right-4"
                  style={{ backgroundColor: getCategoryColor(location.category) }}
                >
                  {location.category.charAt(0).toUpperCase() + location.category.slice(1)}
                </Badge>
              </div>

              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{location.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-medium">{location.rating}</span>
                      <span className="mx-1">·</span>
                      <span>{location.visits} visits</span>
                      <span className="mx-1">·</span>
                      <span>{location.reviews?.length || 0} reviews</span>
                    </CardDescription>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Button size="sm" className="gap-1">
                      <Calendar className="h-4 w-4" />
                      Plan Visit
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="info">Information</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">About</h3>
                      <p className="text-muted-foreground">{location.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Details</h3>
                        <div className="space-y-2">
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                            <span>{location.address}</span>
                          </div>
                          <div className="flex items-start">
                            <Clock className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                            <span>{location.hours}</span>
                          </div>
                          <div className="flex items-start">
                            <Users className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                            <span>{location.admission}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">Amenities</h3>
                        <div className="flex flex-wrap gap-2">
                          {location.amenities.map((amenity: string) => (
                            <Badge key={amenity} variant="outline">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Educational Programs</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {location.educationalPrograms.map((program: string) => (
                          <li key={program}>{program}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" className="gap-1">
                        <ExternalLink className="h-4 w-4" />
                        Visit Website
                      </Button>
                      <Button className="gap-1">
                        <Calendar className="h-4 w-4" />
                        Book a Visit
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Reviews</h3>
                      <Button size="sm">Write a Review</Button>
                    </div>

                    <div className="space-y-4">
                      {location.reviews.map((review: any) => (
                        <Card key={review.id}>
                          <CardContent className="pt-6">
                            <div className="flex justify-between mb-2">
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage src={review.user.avatar || "/placeholder.svg"} />
                                  <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{review.user.name}</div>
                                  <div className="text-xs text-muted-foreground">{review.date}</div>
                                </div>
                              </div>
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < review.rating ? "text-yellow-500" : "text-gray-300"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm">{review.text}</p>
                            <div className="flex gap-4 mt-4">
                              <Button variant="ghost" size="sm" className="gap-1">
                                <ThumbsUp className="h-4 w-4" />
                                Helpful
                              </Button>
                              <Button variant="ghost" size="sm" className="gap-1">
                                <MessageSquare className="h-4 w-4" />
                                Reply
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card>
                      <CardContent className="pt-6">
                        <h4 className="font-medium mb-2">Write a Review</h4>
                        <div className="flex items-center mb-4">
                          <span className="mr-2">Rating:</span>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="h-5 w-5 cursor-pointer text-gray-300 hover:text-yellow-500" />
                          ))}
                        </div>
                        <Textarea
                          placeholder="Share your experience..."
                          value={newReview}
                          onChange={(e) => setNewReview(e.target.value)}
                          className="mb-4"
                        />
                        <Button>Submit Review</Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="events" className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Upcoming Events</h3>
                      <Button size="sm">View Calendar</Button>
                    </div>

                    {location.upcomingEvents.length > 0 ? (
                      <div className="space-y-4">
                        {location.upcomingEvents.map((event: any) => (
                          <Card key={event.id}>
                            <CardContent className="pt-6">
                              <h4 className="font-medium text-lg">{event.title}</h4>
                              <div className="flex items-center text-sm mt-1 mb-2">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                {event.date} · {event.time}
                              </div>
                              <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                              <Button size="sm">RSVP</Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h4 className="text-lg font-medium mb-2">No Upcoming Events</h4>
                        <p className="text-muted-foreground mb-4">
                          There are no scheduled events at this location right now.
                        </p>
                        <Button>Subscribe for Updates</Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <GoogleLocationMap
                  locations={[
                    {
                      id: location.id,
                      name: location.name,
                      rating: location.rating,
                      visits: location.visits,
                      coordinates: location.coordinates,
                      address: location.address,
                      category: location.category,
                      description: location.description,
                    },
                  ]}
                  selectedLocationId={location.id}
                  height="250px"
                  showZoomControls={false}
                />
                <div className="mt-4 space-y-2">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                    <span className="text-sm">{location.address}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Get Directions
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nearby Locations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: "3", name: "Historical Village", rating: "4.5", category: "museum" },
                  { id: "4", name: "Children's Theater", rating: "4.7", category: "theater" },
                  { id: "5", name: "Central Library", rating: "4.4", category: "library" },
                ].map((nearbyLoc) => (
                  <div
                    key={nearbyLoc.id}
                    className="flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted"
                    onClick={() => router.push(`/community/locations/${nearbyLoc.id}`)}
                  >
                    <div>
                      <div className="font-medium">{nearbyLoc.name}</div>
                      <div className="text-sm text-muted-foreground">
                        <Star className="h-3 w-3 inline mr-1 text-yellow-500" />
                        {nearbyLoc.rating}
                      </div>
                    </div>
                    <Badge variant="outline">{nearbyLoc.category}</Badge>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Nearby
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper function to get color based on category
function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    museum: "#f97316", // orange
    park: "#22c55e", // green
    library: "#8b5cf6", // purple
    theater: "#ec4899", // pink
    school: "#3b82f6", // blue
    restaurant: "#ef4444", // red
    cafe: "#a16207", // amber
    default: "#6b7280", // gray
  }

  return colors[category] || colors.default
}
