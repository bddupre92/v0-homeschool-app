"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, MapPin, Star, Grid, MapIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GoogleLocationMap, type Location } from "@/components/google-location-map"
import Navigation from "@/components/navigation"

export default function LocationsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  // This would come from your database in a real app
  const locations: Location[] = [
    {
      id: "1",
      name: "Science Museum",
      rating: "4.8",
      visits: 342,
      coordinates: [-122.4194, 37.7749],
      address: "123 Science Way, San Francisco, CA",
      category: "museum",
      description: "Interactive exhibits on various scientific topics. Great for all ages.",
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
    },
    {
      id: "3",
      name: "Historical Village",
      rating: "4.5",
      visits: 215,
      coordinates: [-122.4104, 37.7829],
      address: "789 History Lane, San Francisco, CA",
      category: "museum",
      description: "Step back in time and experience life in the 1800s. Educational programs available.",
    },
    {
      id: "4",
      name: "Children's Theater",
      rating: "4.7",
      visits: 198,
      coordinates: [-122.4254, 37.7769],
      address: "101 Theater Blvd, San Francisco, CA",
      category: "theater",
      description: "Family-friendly performances and workshops for young actors.",
    },
    {
      id: "5",
      name: "Central Library",
      rating: "4.4",
      visits: 176,
      coordinates: [-122.4154, 37.7789],
      address: "200 Library Street, San Francisco, CA",
      category: "library",
      description: "Large collection of children's books and regular story time events.",
    },
    {
      id: "6",
      name: "Adventure Park",
      rating: "4.9",
      visits: 412,
      coordinates: [-122.4294, 37.7719],
      address: "300 Adventure Road, San Francisco, CA",
      category: "park",
      description: "Outdoor activities including hiking trails, playgrounds, and picnic areas.",
    },
    {
      id: "7",
      name: "Art Center",
      rating: "4.3",
      visits: 156,
      coordinates: [-122.4354, 37.7739],
      address: "400 Art Avenue, San Francisco, CA",
      category: "museum",
      description: "Art classes and exhibitions for all ages. Special homeschool programs available.",
    },
    {
      id: "8",
      name: "Science Center",
      rating: "4.7",
      visits: 289,
      coordinates: [-122.4124, 37.7809],
      address: "500 Science Boulevard, San Francisco, CA",
      category: "museum",
      description: "Hands-on science exhibits and regular demonstrations. STEM workshops for homeschoolers.",
    },
  ]

  // Filter locations based on search query
  const filteredLocations = locations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Get color based on category
  const getCategoryColor = (category: string): string => {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container py-8 px-4 md:px-6">
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Field Trip Locations</h1>
                <p className="text-muted-foreground">Discover popular homeschool field trip destinations</p>
              </div>

              <div className="flex items-center gap-2">
                <TabsList>
                  <TabsTrigger value="grid" className="flex items-center gap-1">
                    <Grid className="h-4 w-4" />
                    Grid
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center gap-1">
                    <MapIcon className="h-4 w-4" />
                    Map
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search locations..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
            <TabsContent value="grid" className="mt-0">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredLocations.map((location) => (
                  <Card
                    key={location.id}
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/community/locations/${location.id}`)}
                  >
                    <div className="h-48 relative">
                      <img
                        src="/placeholder.svg?height=200&width=400"
                        alt={location.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge
                        className="absolute top-2 right-2"
                        style={{ backgroundColor: getCategoryColor(location.category) }}
                      >
                        {location.category.charAt(0).toUpperCase() + location.category.slice(1)}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle>{location.name}</CardTitle>
                      <CardDescription className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span>{location.rating}</span>
                        <span className="mx-1">·</span>
                        <span>{location.visits} visits</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start mb-2">
                        <MapPin className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                        <span className="text-sm">{location.address}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{location.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="map" className="mt-0">
              <Card>
                <CardContent className="p-4">
                  <GoogleLocationMap
                    locations={filteredLocations}
                    selectedLocationId={selectedLocation || undefined}
                    onSelectLocation={(id) => {
                      setSelectedLocation(id)
                    }}
                    height="600px"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <div className="grid gap-4 mt-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className={`flex items-center p-3 rounded-md cursor-pointer ${
                    selectedLocation === location.id ? "bg-muted" : "hover:bg-muted/50"
                  }`}
                  onClick={() => {
                    setSelectedLocation(location.id)
                    if (viewMode === "map") {
                      // Center the map on this location
                    }
                  }}
                >
                  <div className="flex-1">
                    <div className="font-medium">{location.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Star className="h-3 w-3 inline mr-1 text-yellow-500" />
                      {location.rating} · {location.category}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/community/locations/${location.id}`)
                    }}
                  >
                    Details
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Tabs>
      </main>
    </div>
  )
}
