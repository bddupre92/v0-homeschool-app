"use client"

import { useState, useTransition } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createFieldTrip } from "@/app/actions/group-coordination-actions"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { AnalyticsEvents, trackEvent } from "@/lib/analytics"

interface CreateFieldTripDialogProps {
  groupId: string
}

export default function CreateFieldTripDialog({ groupId }: CreateFieldTripDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [tripDate, setTripDate] = useState("")
  const [maxAttendees, setMaxAttendees] = useState<string>("")
  const [costPerFamily, setCostPerFamily] = useState<string>("")

  const reset = () => {
    setTitle("")
    setDescription("")
    setLocation("")
    setTripDate("")
    setMaxAttendees("")
    setCostPerFamily("")
  }

  const canSubmit = title.trim().length > 0 && tripDate.length > 0 && !pending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    startTransition(async () => {
      const result = await createFieldTrip(groupId, {
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        tripDate: new Date(tripDate).toISOString(),
        maxAttendees: maxAttendees ? Number(maxAttendees) : undefined,
        costPerFamily: costPerFamily ? Number(costPerFamily) : undefined,
      })
      if (!(result as any).success) {
        toast({ title: "Couldn't schedule trip", description: (result as any).error })
        return
      }
      trackEvent("community_field_trip_created", { group_id: groupId })
      toast({ title: "Field trip scheduled", description: title })
      reset()
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" aria-hidden="true" /> Schedule field trip
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule a field trip</DialogTitle>
          <DialogDescription>
            Members will see this on the group page and can RSVP.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trip-title">Title *</Label>
            <Input
              id="trip-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Como Park Zoo morning"
              maxLength={120}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trip-date">When *</Label>
            <Input
              id="trip-date"
              type="datetime-local"
              value={tripDate}
              onChange={(e) => setTripDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trip-location">Where</Label>
            <Input
              id="trip-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="1225 Estabrook Dr, Saint Paul, MN"
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trip-description">What we'll do</Label>
            <Textarea
              id="trip-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Meet at the south gate by 9:30. Bring lunch."
              rows={3}
              maxLength={1000}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="trip-max">Max attendees</Label>
              <Input
                id="trip-max"
                type="number"
                min="1"
                value={maxAttendees}
                onChange={(e) => setMaxAttendees(e.target.value)}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trip-cost">Cost / family ($)</Label>
              <Input
                id="trip-cost"
                type="number"
                min="0"
                step="0.01"
                value={costPerFamily}
                onChange={(e) => setCostPerFamily(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="bg-[var(--sage-dd)] hover:bg-[var(--ink)] text-white"
            >
              {pending ? "Scheduling…" : "Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
