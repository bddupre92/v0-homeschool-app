"use client"

import { useEffect, useMemo, useState } from "react"
import { APIProvider, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps"
import { Card } from "@/components/ui/card"
import type { ReactNode } from "react"

export interface Location {
  id: string
  name: string
  rating: string
  visits: number
  coordinates: [number, number]
  address: string
  category: string
  description?: string
}

interface GoogleLocationMapProps {
  locations: Location[]
  selectedLocationId?: string
  onSelectLocation?: (locationId: string) => void
  height?: string
  width?: string
  zoom?: number
  center?: { lat: number; lng: number }
  showZoomControls?: boolean
  renderFallback?: () => ReactNode
}

const defaultCenter = { lat: 37.7749, lng: -122.4194 }

export function GoogleLocationMap({
  locations,
  selectedLocationId,
  onSelectLocation,
  height = "400px",
  width = "100%",
  zoom = 11,
  center,
  showZoomControls = true,
  renderFallback,
}: GoogleLocationMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""
  const [activeLocationId, setActiveLocationId] = useState<string | null>(selectedLocationId ?? null)

  useEffect(() => {
    setActiveLocationId(selectedLocationId ?? null)
  }, [selectedLocationId])

  const activeLocation = useMemo(
    () => locations.find((location) => location.id === activeLocationId),
    [activeLocationId, locations],
  )

  const mapCenter = useMemo(() => {
    if (center) return center
    if (selectedLocationId) {
      const selected = locations.find((location) => location.id === selectedLocationId)
      if (selected) {
        return { lat: selected.coordinates[1], lng: selected.coordinates[0] }
      }
    }
    if (locations.length > 0) {
      return { lat: locations[0].coordinates[1], lng: locations[0].coordinates[0] }
    }
    return defaultCenter
  }, [center, locations, selectedLocationId])

  if (!apiKey) {
    return (
      <Card className="flex items-center justify-center text-sm text-muted-foreground" style={{ height, width }}>
        {renderFallback ? renderFallback() : "Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable the map."}
      </Card>
    )
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div style={{ height, width }} className="rounded-lg overflow-hidden border">
        <Map
          defaultZoom={zoom}
          defaultCenter={mapCenter}
          gestureHandling="greedy"
          zoomControl={showZoomControls}
        >
          {locations.map((location) => {
            const position = { lat: location.coordinates[1], lng: location.coordinates[0] }
            return (
              <AdvancedMarker
                key={location.id}
                position={position}
                onClick={() => {
                  setActiveLocationId(location.id)
                  onSelectLocation?.(location.id)
                }}
              />
            )
          })}
          {activeLocation && (
            <InfoWindow
              position={{
                lat: activeLocation.coordinates[1],
                lng: activeLocation.coordinates[0],
              }}
              onCloseClick={() => setActiveLocationId(null)}
            >
              <div className="space-y-1 text-sm">
                <div className="font-medium">{activeLocation.name}</div>
                <div className="text-xs text-muted-foreground">{activeLocation.address}</div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  )
}
