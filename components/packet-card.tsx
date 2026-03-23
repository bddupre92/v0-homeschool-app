"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Star, MoreVertical, Printer, Trash2, Eye, FileText } from "lucide-react"
import { format } from "date-fns"
import { toggleFavorite, deletePacket } from "@/app/actions/packet-actions"
import { useToast } from "@/hooks/use-toast"
import type { SavedLessonPacket } from "@/lib/types"

const subjectColors: Record<string, string> = {
  Mathematics: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Science: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  "English Language Arts": "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  History: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  Geography: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
  Art: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  Music: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  "Physical Education": "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  "Foreign Language": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
}

interface PacketCardProps {
  packet: SavedLessonPacket
  onOpen: (id: string) => void
  onDeleted?: () => void
}

export default function PacketCard({ packet, onOpen, onDeleted }: PacketCardProps) {
  const { toast } = useToast()
  const [isFavorite, setIsFavorite] = useState(packet.isFavorite)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const prev = isFavorite
    setIsFavorite(!prev)
    const result = await toggleFavorite(packet.id)
    if (!result.success) {
      setIsFavorite(prev)
      toast({ title: "Error", description: "Failed to update favorite", variant: "destructive" })
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deletePacket(packet.id)
    if (result.success) {
      toast({ title: "Deleted", description: "Packet removed from library" })
      onDeleted?.()
    } else {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" })
      setIsDeleting(false)
    }
  }

  const colorClass = subjectColors[packet.subject] || "bg-gray-100 text-gray-700"

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-all ${isDeleting ? "opacity-50" : ""}`}
      onClick={() => onOpen(packet.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{packet.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {packet.topic}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleFavorite}
            >
              <Star
                className={`h-4 w-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onOpen(packet.id) }}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Packet
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => { e.stopPropagation(); handleDelete() }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Badge variant="secondary" className={`text-xs ${colorClass}`}>
            {packet.subject}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {packet.grade}
          </Badge>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>For {packet.childName}</span>
          <span>{format(new Date(packet.createdAt), "MMM d, yyyy")}</span>
        </div>

        {packet.timesPrinted > 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Printer className="h-3 w-3" />
            <span>Printed {packet.timesPrinted}x</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
