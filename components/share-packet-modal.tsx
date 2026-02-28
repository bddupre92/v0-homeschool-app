"use client"

import { useState, useEffect } from "react"
import { Share2, Loader2, Users, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { getUserGroups } from "@/app/actions/group-actions"
import { sharePacketToGroup } from "@/app/actions/group-coordination-actions"

interface SharePacketModalProps {
  packetId: string
  packetTitle: string
}

export default function SharePacketModal({ packetId, packetTitle }: SharePacketModalProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [groups, setGroups] = useState<{ id: string; name: string; imageUrl?: string; role: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [isSharing, setIsSharing] = useState(false)
  const [sharedGroupIds, setSharedGroupIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (open) loadGroups()
  }, [open])

  const loadGroups = async () => {
    setIsLoading(true)
    const result = await getUserGroups()
    if (result.success && result.groups) {
      setGroups(result.groups as any[])
    }
    setIsLoading(false)
  }

  const handleShare = async () => {
    if (!selectedGroupId) return
    setIsSharing(true)
    const result = await sharePacketToGroup(packetId, selectedGroupId, notes || undefined)
    if (result.success) {
      toast({ title: "Shared!", description: "Packet shared to group." })
      setSharedGroupIds((prev) => new Set([...prev, selectedGroupId]))
      setSelectedGroupId(null)
      setNotes("")
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    setIsSharing(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share to Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Lesson Packet</DialogTitle>
          <DialogDescription>
            Share &ldquo;{packetTitle}&rdquo; with one of your groups.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">You&apos;re not a member of any groups yet.</p>
            <p className="text-xs mt-1">Join or create a group to share packets.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Select a group</Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {groups.map((group) => {
                  const isShared = sharedGroupIds.has(group.id)
                  return (
                    <button
                      key={group.id}
                      onClick={() => !isShared && setSelectedGroupId(group.id)}
                      disabled={isShared}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                        selectedGroupId === group.id
                          ? "border-primary bg-primary/5"
                          : isShared
                          ? "border-green-200 bg-green-50 opacity-70"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <Users className="h-5 w-5 text-muted-foreground shrink-0" />
                      <span className="flex-1 text-sm font-medium truncate">{group.name}</span>
                      {isShared && <Check className="h-4 w-4 text-green-600 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedGroupId && (
              <div className="space-y-2">
                <Label className="text-sm">Add a note (optional)</Label>
                <Textarea
                  placeholder="e.g., Great for our unit on volcanoes next week!"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleShare} disabled={!selectedGroupId || isSharing}>
                {isSharing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
                Share
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
