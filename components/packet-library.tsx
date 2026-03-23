"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Loader2 } from "lucide-react"
import { getUserPackets, getChildNames } from "@/app/actions/packet-actions"
import PacketCard from "./packet-card"
import PacketSearchFilters from "./packet-search-filters"
import type { SavedLessonPacket, PacketFilters } from "@/lib/types"

interface PacketLibraryProps {
  onOpenPacket: (id: string) => void
  onGenerateNew: () => void
}

export default function PacketLibrary({ onOpenPacket, onGenerateNew }: PacketLibraryProps) {
  const [packets, setPackets] = useState<SavedLessonPacket[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(12)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<PacketFilters>({})
  const [childNames, setChildNames] = useState<string[]>([])

  const loadPackets = useCallback(async () => {
    setLoading(true)
    const result = await getUserPackets(filters, page, pageSize)
    if (result.success) {
      setPackets(result.packets as SavedLessonPacket[])
      setTotal(result.total)
    }
    setLoading(false)
  }, [filters, page, pageSize])

  const loadChildNames = useCallback(async () => {
    const result = await getChildNames()
    if (result.success) setChildNames(result.names)
  }, [])

  useEffect(() => {
    loadPackets()
  }, [loadPackets])

  useEffect(() => {
    loadChildNames()
  }, [loadChildNames])

  const handleFiltersChange = (newFilters: PacketFilters) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">My Lesson Packets</h3>
          <p className="text-sm text-muted-foreground">
            {total} packet{total !== 1 ? "s" : ""} in your library
          </p>
        </div>
        <Button onClick={onGenerateNew} className="gap-2 shrink-0">
          <FileText className="h-4 w-4" />
          Generate New Packet
        </Button>
      </div>

      <PacketSearchFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        childNames={childNames}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : packets.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {Object.keys(filters).length > 0 ? "No matching packets" : "No packets yet"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {Object.keys(filters).length > 0
              ? "Try adjusting your filters."
              : "Generate your first AI lesson packet to get started."}
          </p>
          {Object.keys(filters).length === 0 && (
            <Button onClick={onGenerateNew}>Generate Your First Packet</Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packets.map((packet) => (
              <PacketCard
                key={packet.id}
                packet={packet}
                onOpen={onOpenPacket}
                onDeleted={loadPackets}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
