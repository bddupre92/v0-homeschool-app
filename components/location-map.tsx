"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useMapboxToken } from "@/hooks/use-mapbox"

interface Location {
  id: string
  name: string
  rating: string
  visits: number
  coordinates: [number, number] // [longitude, latitude]
  address: string
}

interface LocationMapProps {
  locations: Location[]
  selectedLocationId?: string
  onSelectLocation?: (locationId: string) => void
  height?: string
  width?: string
  zoom?: number
  center?: [number, number]
}

export function LocationMap({
  locations,
  selectedLocationId,
  onSelectLocation,
  height = "300px",
  width = "100%",
  zoom = 11,
  center = [-122.4194, 37.7749], // Default to San Francisco
}: LocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({})
  const [mapLoaded, setMapLoaded] = useState(false)
  const { token, loading, error } = useMapboxToken()

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !token || loading) return

    // Set the token from our hook
    mapboxgl.accessToken = token

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom,
    })

    map.current.on("load", () => {
      setMapLoaded(true)
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [center, zoom, token, loading])

  // Add markers for locations
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Clear existing markers
    Object.values(markers.current).forEach((marker) => marker.remove())
    markers.current = {}

    // Add new markers
    locations.forEach((location) => {
      const el = document.createElement("div")
      el.className = "marker"
      el.style.width = "30px"
      el.style.height = "30px"
      el.style.borderRadius = "50%"
      el.style.backgroundColor = location.id === selectedLocationId ? "#3b82f6" : "#f97316"
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
            `<strong>${location.name}</strong><p>${location.address}</p><p>Rating: ${location.rating} · ${location.visits} visits</p>`,
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
    if (locations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      locations.forEach((location) => {
        bounds.extend(location.coordinates)
      })
      map.current.fitBounds(bounds, { padding: 50 })
    }
  }, [locations, mapLoaded, selectedLocationId, onSelectLocation])

  // Update selected marker
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    Object.entries(markers.current).forEach(([id, marker]) => {
      const el = marker.getElement()
      if (id === selectedLocationId) {
        el.style.backgroundColor = "#3b82f6" // Blue for selected
        el.style.width = "35px"
        el.style.height = "35px"
        el.style.zIndex = "10"
        marker.togglePopup() // Show popup for selected location
      } else {
        el.style.backgroundColor = "#f97316" // Orange for others
        el.style.width = "30px"
        el.style.height = "30px"
        el.style.zIndex = "1"
      }
    })
  }, [selectedLocationId, mapLoaded])

  // Show loading state
  if (loading) {
    return (
      <Card className="overflow-hidden">
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
      <Card className="overflow-hidden">
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
    <Card className="overflow-hidden">
      <div ref={mapContainer} style={{ width, height }} />
    </Card>
  )
}
