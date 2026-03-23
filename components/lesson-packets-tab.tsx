"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getPacketById } from "@/app/actions/packet-actions"
import LessonPacketGenerator from "./lesson-packet-generator"
import LessonPacketViewer from "./lesson-packet-viewer"
import PacketLibrary from "./packet-library"
import type { LessonPacket } from "@/lib/types"

type View = "library" | "generate" | "detail"

export default function LessonPacketsTab() {
  const [view, setView] = useState<View>("library")
  const [detailPacket, setDetailPacket] = useState<LessonPacket | null>(null)
  const [detailPacketId, setDetailPacketId] = useState<string | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const handleOpenPacket = async (packetId: string) => {
    setLoadingDetail(true)
    setView("detail")
    setDetailPacketId(packetId)

    const result = await getPacketById(packetId)
    if (result.success && result.packet) {
      setDetailPacket(result.packet)
    }
    setLoadingDetail(false)
  }

  const handleBackToLibrary = () => {
    setView("library")
    setDetailPacket(null)
    setDetailPacketId(null)
  }

  if (view === "generate") {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={handleBackToLibrary}>
          Back to Library
        </Button>
        <LessonPacketGenerator />
      </div>
    )
  }

  if (view === "detail") {
    if (loadingDetail) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (!detailPacket) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Packet not found.</p>
          <Button variant="outline" onClick={handleBackToLibrary} className="mt-4">
            Back to Library
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={handleBackToLibrary}>
          Back to Library
        </Button>
        <LessonPacketViewer packet={detailPacket} savedPacketId={detailPacketId} />
      </div>
    )
  }

  // Library view (default)
  return (
    <PacketLibrary
      onOpenPacket={handleOpenPacket}
      onGenerateNew={() => setView("generate")}
    />
  )
}
