"use client"

import { useState } from "react"
import { MapPin, Calendar, Users, DollarSign, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { rsvpToFieldTrip } from "@/app/actions/group-coordination-actions"
import type { GroupFieldTrip } from "@/lib/types"

interface GroupFieldTripCardProps {
  trip: GroupFieldTrip
  groupId: string
}

export default function GroupFieldTripCard({ trip, groupId }: GroupFieldTripCardProps) {
  const { toast } = useToast()
  const [currentStatus, setCurrentStatus] = useState(trip.userRsvpStatus || null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRSVP = async (status: "going" | "maybe" | "not_going") => {
    setIsSubmitting(true)
    const result = await rsvpToFieldTrip(trip.id, 1, status)
    if (result.success) {
      setCurrentStatus(status === "not_going" ? null : status)
      toast({ title: "RSVP Updated" })
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    setIsSubmitting(false)
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    })

  const isPast = new Date(trip.tripDate) < new Date()

  return (
    <Card className={isPast ? "opacity-60" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-base">{trip.title}</h3>
            {trip.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{trip.description}</p>
            )}
          </div>
          {isPast && <Badge variant="outline" className="shrink-0">Past</Badge>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{formatDate(trip.tripDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{trip.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0" />
            <span>
              {trip.rsvpCount} attending
              {trip.maxAttendees ? ` / ${trip.maxAttendees} max` : ""}
            </span>
          </div>
          {trip.costPerFamily !== undefined && trip.costPerFamily > 0 && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 shrink-0" />
              <span>${trip.costPerFamily.toFixed(2)} per family</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">
            Organized by {trip.organizerName}
          </span>
        </div>

        {!isPast && (
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant={currentStatus === "going" ? "default" : "outline"}
              onClick={() => handleRSVP("going")}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Going"}
            </Button>
            <Button
              size="sm"
              variant={currentStatus === "maybe" ? "default" : "outline"}
              onClick={() => handleRSVP("maybe")}
              disabled={isSubmitting}
              className="flex-1"
            >
              Maybe
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRSVP("not_going")}
              disabled={isSubmitting}
              className="flex-1"
            >
              Can&apos;t Go
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
