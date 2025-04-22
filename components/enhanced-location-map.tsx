"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder"
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { MapPin, Filter, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useMapboxToken } from "@/hooks/use-mapbox"

export interface Location {
  id: string
  name: string
  rating: string
  visits: number
  coordinates: [number, number] // [longitude, latitude]
  address: string
  category: string // e.g., "museum", "park", "library"
  description?: string
}

interface EnhancedLocationMapProps {
  locations: Location[]
  selectedLocationId?: string
  onSelectLocation?: (locationId: string) => void
  height?: string
  width?: string
  zoom?: number
  center?: [number, number]
  showControls?: boolean
  showSearch?: boolean
  showFilters?: boolean
  showDirections?: boolean
  showClustering?: boolean
}

export function EnhancedLocationMap({
  locations,
  selectedLocationId,
  onSelectLocation,
  height = "400px",
  width = "100%",
  zoom = 11,
  center = [-122.4194, 37.7749], // Default to San Francisco
  showControls = true,
  showSearch = true,
  showFilters = true,
  showDirections = true,
  showClustering = true,
}: EnhancedLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({})
  const [mapLoaded, setMapLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [mapStyle, setMapStyle] = useState("streets-v12")
  const [showingDirections, setShowingDirections] = useState(false)
  const [directionsOrigin, setDirectionsOrigin] = useState<[number, number] | null>(null)
  const [directionsDestination, setDirectionsDestination] = useState<[number, number] | null>(null)
  const [filterDistance, setFilterDistance] = useState(10) // in miles
  const [filterCategories, setFilterCategories] = useState<string[]>([])
  const [filterMinRating, setFilterMinRating] = useState(0)
  const [filteredLocations, setFilteredLocations] = useState<Location[]>(locations)
  const directionsGeoJSON = useRef<any>(null)

  const allCategories = Array.from(new Set(locations.map((loc) => loc.category)))

  const { token, loading, error } = useMapboxToken()

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !token || loading) return

    // Set the token from our hook
    mapboxgl.accessToken = token

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${mapStyle}`,
      center,
      zoom,
    })

    map.current.on("error", (e) => {
      console.error("Mapbox error:", e)
    })

    // Add navigation controls
    if (showControls) {
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right")
      map.current.addControl(new mapboxgl.FullscreenControl(), "top-right")
      map.current.addControl(new mapboxgl.ScaleControl(), "bottom-left")
    }

    // Add search control
    if (showSearch) {
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false,
        placeholder: "Search for locations",
      })
      map.current.addControl(geocoder, "top-left")
    }

    map.current.on("load", () => {
      setMapLoaded(true)

      // Add source and layer for directions
      if (map.current && showDirections) {
        map.current.addSource("directions", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [],
            },
          },
        })

        map.current.addLayer({
          id: "directions-line",
          type: "line",
          source: "directions",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3887be",
            "line-width": 5,
            "line-opacity": 0.75,
          },
        })
      }

      // Set up clustering if enabled
      if (showClustering && map.current) {
        map.current.addSource("locations", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: locations.map((loc) => ({
              type: "Feature",
              properties: {
                id: loc.id,
                name: loc.name,
                rating: loc.rating,
                category: loc.category,
              },
              geometry: {
                type: "Point",
                coordinates: loc.coordinates,
              },
            })),
          },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        })

        map.current.addLayer({
          id: "clusters",
          type: "circle",
          source: "locations",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": ["step", ["get", "point_count"], "#51bbd6", 10, "#f1f075", 30, "#f28cb1"],
            "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 30, 40],
          },
        })

        map.current.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "locations",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          },
        })

        map.current.on("click", "clusters", (e) => {
          const features = map.current?.queryRenderedFeatures(e.point, {
            layers: ["clusters"],
          })

          if (features && features.length > 0) {
            const clusterId = features[0].properties.cluster_id
            map.current?.getSource("locations")?.getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err || !map.current) return

              map.current.easeTo({
                center: (features[0].geometry as any).coordinates,
                zoom: zoom,
              })
            })
          }
        })
      }
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [center, zoom, mapStyle, showControls, showSearch, showDirections, showClustering, locations, token, loading])

  // Apply filters to locations
  useEffect(() => {
    let filtered = [...locations]

    // Filter by category if any categories are selected
    if (filterCategories.length > 0) {
      filtered = filtered.filter((loc) => filterCategories.includes(loc.category))
    }

    // Filter by minimum rating
    if (filterMinRating > 0) {
      filtered = filtered.filter((loc) => Number.parseFloat(loc.rating) >= filterMinRating)
    }

    // Filter by distance from user location if available
    if (userLocation && filterDistance > 0) {
      filtered = filtered.filter((loc) => {
        const distance = calculateDistance(userLocation[1], userLocation[0], loc.coordinates[1], loc.coordinates[0])
        return distance <= filterDistance
      })
    }

    setFilteredLocations(filtered)
  }, [locations, filterCategories, filterMinRating, filterDistance, userLocation])

  // Add markers for locations
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Clear existing markers
    Object.values(markers.current).forEach((marker) => marker.remove())
    markers.current = {}

    // Skip adding individual markers if clustering is enabled
    if (showClustering) return

    // Add new markers for filtered locations
    filteredLocations.forEach((location) => {
      const el = document.createElement("div")
      el.className = "marker"
      el.style.width = "30px"
      el.style.height = "30px"
      el.style.borderRadius = "50%"
      el.style.backgroundColor = location.id === selectedLocationId ? "#3b82f6" : getCategoryColor(location.category)
      el.style.cursor = "pointer"
      el.style.display = "flex"
      el.style.justifyContent = "center"
      el.style.alignItems = "center"
      el.style.color = "white"
      el.style.fontWeight = "bold"
      el.style.fontSize = "14px"
      el.innerHTML = location.rating

      const marker = new mapboxgl.Marker(el)
        .setLngLat(location.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<strong>${location.name}</strong>
             <p>${location.address}</p>
             <p>Rating: ${location.rating} · ${location.visits} visits</p>
             <p>Category: ${location.category}</p>
             ${location.description ? `<p>${location.description}</p>` : ""}
             ${
               showDirections
                 ? `<button 
                  style="background: #3b82f6; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 5px;"
                  onclick="window.getDirectionsTo(${location.coordinates[0]}, ${location.coordinates[1]})"
                >
                  Get Directions
                </button>`
                 : ""
             }`,
          ),
        )
        .addTo(map.current)

      el.addEventListener("click", () => {
        if (onSelectLocation) {
          onSelectLocation(location.id)
        }
      })

      markers.current[location.id] = marker
    })

    // Fit map to show all markers if there are any
    if (filteredLocations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      filteredLocations.forEach((location) => {
        bounds.extend(location.coordinates)
      })
      map.current.fitBounds(bounds, { padding: 50 })
    }

    // Add function to window for the directions button in popups
    window.getDirectionsTo = (lng, lat) => {
      if (userLocation) {
        getDirections(userLocation, [lng, lat])
      } else {
        findUserLocation(() => {
          if (userLocation) {
            getDirections(userLocation, [lng, lat])
          }
        })
      }
    }
  }, [filteredLocations, mapLoaded, selectedLocationId, onSelectLocation, showDirections, showClustering])

  // Update selected marker
  useEffect(() => {
    if (!map.current || !mapLoaded || showClustering) return

    Object.entries(markers.current).forEach(([id, marker]) => {
      const el = marker.getElement()
      const location = locations.find((loc) => loc.id === id)
      if (!location) return

      if (id === selectedLocationId) {
        el.style.backgroundColor = "#3b82f6" // Blue for selected
        el.style.width = "35px"
        el.style.height = "35px"
        el.style.zIndex = "10"
        marker.togglePopup() // Show popup for selected location
      } else {
        el.style.backgroundColor = getCategoryColor(location.category)
        el.style.width = "30px"
        el.style.height = "30px"
        el.style.zIndex = "1"
      }
    })
  }, [selectedLocationId, mapLoaded, locations, showClustering])

  // Update user location marker
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation) return

    // Remove existing user marker if any
    const userMarker = markers.current["user-location"]
    if (userMarker) userMarker.remove()

    // Add new user marker
    const el = document.createElement("div")
    el.className = "user-marker"
    el.style.width = "20px"
    el.style.height = "20px"
    el.style.borderRadius = "50%"
    el.style.backgroundColor = "#ff0000"
    el.style.border = "2px solid white"
    el.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.25)"

    const marker = new mapboxgl.Marker(el)
      .setLngLat(userLocation)
      .setPopup(new mapboxgl.Popup().setHTML("<strong>Your Location</strong>"))
      .addTo(map.current)

    markers.current["user-location"] = marker
  }, [userLocation, mapLoaded])

  // Update map style
  useEffect(() => {
    if (!map.current || !mapLoaded) return
    map.current.setStyle(`mapbox://styles/mapbox/${mapStyle}`)
  }, [mapStyle, mapLoaded])

  // Find user's location
  const findUserLocation = (callback?: () => void) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords: [number, number] = [position.coords.longitude, position.coords.latitude]
          setUserLocation(userCoords)

          if (map.current) {
            map.current.flyTo({
              center: userCoords,
              zoom: 14,
              essential: true,
            })
          }

          if (callback) callback()
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Could not get your location. Please check your browser permissions.")
        },
      )
    } else {
      alert("Geolocation is not supported by your browser")
    }
  }

  // Get directions between two points
  const getDirections = async (origin: [number, number], destination: [number, number]) => {
    if (!token) return

    try {
      setDirectionsOrigin(origin)
      setDirectionsDestination(destination)
      setShowingDirections(true)

      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?steps=true&geometries=geojson&access_token=${token}`,
      )

      const data = await response.json()

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        const routeGeometry = route.geometry

        directionsGeoJSON.current = {
          type: "Feature",
          properties: {},
          geometry: routeGeometry,
        }

        if (map.current) {
          const source = map.current.getSource("directions") as mapboxgl.GeoJSONSource
          if (source) {
            source.setData(directionsGeoJSON.current)
          }

          // Fit the map to the route
          const bounds = new mapboxgl.LngLatBounds()
          routeGeometry.coordinates.forEach((coord) => {
            bounds.extend(coord as [number, number])
          })

          map.current.fitBounds(bounds, {
            padding: 50,
          })
        }
      }
    } catch (error) {
      console.error("Error getting directions:", error)
      alert("Could not get directions. Please try again.")
    }
  }

  // Clear directions
  const clearDirections = () => {
    setShowingDirections(false)
    setDirectionsOrigin(null)
    setDirectionsDestination(null)

    if (map.current) {
      const source = map.current.getSource("directions") as mapboxgl.GeoJSONSource
      if (source) {
        source.setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [],
          },
        })
      }
    }
  }

  // Toggle category filter
  const toggleCategoryFilter = (category: string) => {
    setFilterCategories((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]))
  }

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

  // Calculate distance between two points in miles
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3958.8 // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Show loading state
  if (loading) {
    return (
      <Card className="overflow-hidden relative">
        <div className="flex items-center justify-center" style={{ width, height }}>
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading map...</p>
          </div>
        </div>
      </Card>
    )
  }

  // Show error state
  if (error || !token) {
    return (
      <Card className="overflow-hidden relative">
        <div className="flex items-center justify-center" style={{ width, height }}>
          <div className="text-center p-4 text-red-500">
            <p>Error loading map: {error?.message || "Could not load Mapbox token"}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden relative">
      <div ref={mapContainer} style={{ width, height }} />

      {/* Map Controls */}
      {showControls && (
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
          <Button onClick={findUserLocation} size="sm" variant="secondary" className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Near Me
          </Button>

          {showDirections && showingDirections && (
            <Button onClick={clearDirections} size="sm" variant="destructive" className="flex items-center gap-1">
              <X className="h-4 w-4" />
              Clear Directions
            </Button>
          )}
        </div>
      )}

      {/* Map Style Selector */}
      {showControls && (
        <div className="absolute bottom-2 left-2 z-10">
          <Tabs
            defaultValue="streets-v12"
            value={mapStyle}
            onValueChange={setMapStyle}
            className="bg-white bg-opacity-90 rounded-md p-1"
          >
            <TabsList>
              <TabsTrigger value="streets-v12" className="text-xs px-2 py-1">
                Streets
              </TabsTrigger>
              <TabsTrigger value="satellite-streets-v12" className="text-xs px-2 py-1">
                Satellite
              </TabsTrigger>
              <TabsTrigger value="light-v11" className="text-xs px-2 py-1">
                Light
              </TabsTrigger>
              <TabsTrigger value="dark-v11" className="text-xs px-2 py-1">
                Dark
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="absolute top-2 right-2 z-10">
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="secondary" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Filters
                {(filterCategories.length > 0 || filterMinRating > 0 || (userLocation && filterDistance < 10)) && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    !
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Filter Locations</h4>

                {userLocation && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Distance (miles)</h5>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[filterDistance]}
                        min={1}
                        max={50}
                        step={1}
                        onValueChange={(value) => setFilterDistance(value[0])}
                      />
                      <span className="w-12 text-center">{filterDistance}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Minimum Rating</h5>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[filterMinRating]}
                      min={0}
                      max={5}
                      step={0.5}
                      onValueChange={(value) => setFilterMinRating(value[0])}
                    />
                    <span className="w-12 text-center">{filterMinRating}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Categories</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {allCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={filterCategories.includes(category)}
                          onCheckedChange={() => toggleCategoryFilter(category)}
                        />
                        <Label
                          htmlFor={`category-${category}`}
                          className="text-sm font-normal cursor-pointer flex items-center"
                        >
                          <span
                            className="inline-block w-3 h-3 rounded-full mr-1"
                            style={{ backgroundColor: getCategoryColor(category) }}
                          ></span>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setFilterCategories([])
                    setFilterMinRating(0)
                    setFilterDistance(10)
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 right-2 z-10 bg-white bg-opacity-90 rounded-md p-2 text-xs">
        <div className="font-medium mb-1">Legend</div>
        <div className="space-y-1">
          {allCategories.map((category) => (
            <div key={category} className="flex items-center gap-1">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: getCategoryColor(category) }}
              ></span>
              <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// Add this to the window object for the directions button in popups
declare global {
  interface Window {
    getDirectionsTo: (lng: number, lat: number) => void
  }
}
