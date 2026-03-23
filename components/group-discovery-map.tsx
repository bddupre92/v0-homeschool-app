"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Loader2 } from "lucide-react"
import { useMapboxToken } from "@/hooks/use-mapbox"
import type { GroupProfile, GroupMatchResult } from "@/lib/types"

// Philosophy → marker color mapping
const PHILOSOPHY_COLORS: Record<string, string> = {
  classical: "#8B5CF6",
  montessori: "#10B981",
  charlotte_mason: "#F59E0B",
  unschooling: "#EF4444",
  eclectic: "#6366F1",
  waldorf: "#EC4899",
  reggio: "#14B8A6",
  traditional: "#3B82F6",
}

interface GroupDiscoveryMapProps {
  groups: (GroupProfile | GroupMatchResult)[]
  userLocation?: [number, number]
  onSelectGroup?: (groupId: string) => void
  radiusMiles?: number
  height?: string
}

export default function GroupDiscoveryMap({
  groups,
  userLocation,
  onSelectGroup,
  radiusMiles = 15,
  height = "400px",
}: GroupDiscoveryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const { token, isLoading: tokenLoading } = useMapboxToken()
  const [mapLoaded, setMapLoaded] = useState(false)

  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapContainer.current || !token || map.current) return

    try {
      mapboxgl.accessToken = token

      const center: [number, number] = userLocation || [-98.5795, 39.8283] // US center
      const zoom = userLocation ? 10 : 3.5

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center,
        zoom,
      })

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

      map.current.on("load", () => setMapLoaded(true))
      map.current.on("error", (e) => {
        console.error("[v0] Mapbox error:", e)
      })
    } catch (err) {
      console.error("[v0] Failed to initialize map:", err)
      setMapError("Map could not be loaded. Please try again later.")
    }

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [token, userLocation])

  // Add/update markers when groups or map changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    // Add user location marker
    if (userLocation) {
      const el = document.createElement("div")
      el.className = "w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"
      const userMarker = new mapboxgl.Marker(el)
        .setLngLat(userLocation)
        .addTo(map.current)
      markersRef.current.push(userMarker)
    }

    // Add group markers
    const groupsWithCoords = groups.filter((g) => g.latitude && g.longitude)
    for (const group of groupsWithCoords) {
      const color = PHILOSOPHY_COLORS[group.philosophy || ""] || "#6B7280"
      const matchScore = "matchScore" in group ? (group as GroupMatchResult).matchScore : null

      const el = document.createElement("div")
      el.style.cssText = `
        width: 32px; height: 32px; background: ${color}; border-radius: 50%;
        border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        color: white; font-size: 12px; font-weight: 700;
      `
      el.textContent = matchScore !== null ? `${matchScore}` : ""

      const popupContent = `
        <div style="max-width:220px;font-family:system-ui">
          <strong style="font-size:14px">${group.name}</strong>
          <div style="margin:4px 0;color:#6B7280;font-size:12px">
            ${group.philosophy ? `<span style="background:#F3F4F6;padding:1px 6px;border-radius:4px">${group.philosophy}</span>` : ""}
            ${group.memberCount} members
          </div>
          ${matchScore !== null ? `<div style="color:${color};font-weight:600;font-size:13px">${matchScore}% match</div>` : ""}
          <div style="margin-top:6px">
            <a href="/community/groups/${group.id}" style="color:#3B82F6;font-size:12px;text-decoration:none">View Group →</a>
          </div>
        </div>
      `

      const marker = new mapboxgl.Marker(el)
        .setLngLat([group.longitude!, group.latitude!])
        .setPopup(new mapboxgl.Popup({ offset: 20, closeButton: false }).setHTML(popupContent))
        .addTo(map.current!)

      el.addEventListener("click", () => {
        onSelectGroup?.(group.id)
      })

      markersRef.current.push(marker)
    }

    // Fit bounds to show all markers
    if (groupsWithCoords.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      if (userLocation) bounds.extend(userLocation)
      groupsWithCoords.forEach((g) => bounds.extend([g.longitude!, g.latitude!]))
      map.current.fitBounds(bounds, { padding: 60, maxZoom: 12 })
    }
  }, [groups, mapLoaded, userLocation, onSelectGroup])

  if (tokenLoading) {
    return (
      <Card className="flex items-center justify-center" style={{ height }}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  if (!token || mapError) {
    return (
      <Card className="flex items-center justify-center p-6" style={{ height }}>
        <div className="text-center text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">{mapError || "Map requires a Mapbox token to display."}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="relative rounded-lg overflow-hidden border" style={{ height }}>
      <div ref={mapContainer} className="w-full h-full" />
      {groups.length === 0 && mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60">
          <p className="text-muted-foreground text-sm">No groups found in this area</p>
        </div>
      )}
    </div>
  )
}
