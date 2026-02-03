"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

export default function SaveToBoardModal({
  isOpen,
  onClose,
  item,
  boards,
  plannerItems,
  onSaveToBoard,
  onSaveToPlanner,
  onCreateBoard,
}) {
  const [newBoardTitle, setNewBoardTitle] = useState("")
  const [isCreatingBoard, setIsCreatingBoard] = useState(false)

  const handleCreateBoard = () => {
    if (newBoardTitle.trim()) {
      console.log('Creating new board:', newBoardTitle.trim())
      onCreateBoard?.(newBoardTitle.trim())
      setNewBoardTitle("")
      setIsCreatingBoard(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save to</DialogTitle>
          <DialogDescription>Save this content to a board or add it to your planner.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="boards" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="boards">Boards</TabsTrigger>
            <TabsTrigger value="planner">Planner</TabsTrigger>
          </TabsList>

          <TabsContent value="boards" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-1 gap-4 p-1">
                {boards.map((board) => (
                  <div
                    key={board.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => {
                      console.log('Saving to board:', board.id)
                      onSaveToBoard?.(board.id)
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-md bg-cover bg-center"
                      style={{ backgroundImage: `url(${board.coverImage})` }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{board.title}</h4>
                      <p className="text-xs text-muted-foreground">{board.itemCount} items</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {isCreatingBoard ? (
                  <div className="p-3 border rounded-lg">
                    <Input
                      placeholder="Enter board title"
                      value={newBoardTitle}
                      onChange={(e) => setNewBoardTitle(e.target.value)}
                      className="mb-2"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsCreatingBoard(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleCreateBoard} disabled={!newBoardTitle.trim()}>
                        Create
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" className="mt-2 w-full" onClick={() => setIsCreatingBoard(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Board
                  </Button>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="planner" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-1 gap-4 p-1">
                {plannerItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => onSaveToPlanner(item.id)}
                  >
                    <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                      <span className="text-lg font-medium">{new Date(item.date).getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {item.date} • {item.subject}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button variant="outline" className="mt-2 w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to New Planner Item
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
