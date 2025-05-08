"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, MapPin, Star, Grid, MapIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedLocationMap, type Location } from "@/components/enhanced-location-map"
import Navigation from "@/components/navigation"
import { useMapboxToken } from "@/hooks/use-mapbox"

export default function LocationsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  const { loading: mapLoading, error: mapError } = useMapboxToken()

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
    // ... (other locations omitted for brevity)
  ];

  const filteredLocations = locations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      museum: "#f97316", park: "#22c55e", library: "#8b5cf6", 
      theater: "#ec4899", school: "#3b82f6", restaurant: "#ef4444", 
      cafe: "#a16207", default: "#6b7280", 
    };
    return colors[category] || colors.default;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container py-8 px-4 md:px-6">
        <Tabs value={viewMode} onValueChange={setViewMode} className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Field Trip Locations</h1>
              <p className="text-muted-foreground">Discover popular homeschool field trip destinations</p>
            </div>
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
            {mapError ? (
              <Card>
                <CardContent className="p-4">
                  <div className="text-center py-8">
                    <p className="text-red-500 mb-2">Failed to load map: {mapError.message}</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                  </div>
                </CardContent>
              </Card>
            ) : mapLoading ? (
              <Card>
                <CardContent className="p-4">
                  <div className="text-center py-8">
                    <p className="mb-2">Loading map...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4">
                  <EnhancedLocationMap
                    locations={filteredLocations}
                    selectedLocationId={selectedLocation || undefined}
                    onSelectLocation={(id) => {
                      setSelectedLocation(id)
                    }}
                    height="600px"
                    showControls={true}
                    showSearch={true}
                    showFilters={true}
                    showDirections={true}
                    showClustering={true}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* This bottom list might need to be outside the TabsContent or handled differently if it's not part of the tabbed view */}
          <div className="grid gap-4 mt-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLocations.map((location) => (
              <div
                key={location.id}
                className={`flex items-center p-3 rounded-md cursor-pointer ${
                  selectedLocation === location.id ? "bg-muted" : "hover:bg-muted/50"
                }`}
                onClick={() => {
                  setSelectedLocation(location.id)
                  // if (viewMode === "map") { ... }
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
        </Tabs> {/* Moved the closing Tabs tag to wrap the content sections */}
      </main>
    </div>
  )
}
