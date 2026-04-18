"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, Grid3X3, List, Search, Loader2 } from "lucide-react"
import ProtectedRoute from "@/components/auth/protected-route"
import { createBoard, getBoards } from "@/app/actions/board-actions"
import { toast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import Navigation from "@/components/navigation"

export default function BoardsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({ title: "", description: "" })
  const [boards, setBoards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadBoards = useCallback(async () => {
    try {
      const result = await getBoards()
      if (result.success && result.boards) {
        setBoards(result.boards)
      }
    } catch (error) {
      console.error("Error loading boards:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBoards()
  }, [loadBoards])

  // Filter boards based on search query
  const filteredBoards = boards.filter(
    (board) =>
      board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      board.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-[var(--linen)] text-[var(--ink)]">
        <Navigation />

        <main className="flex-1 container py-8 px-4 md:px-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold">My Boards</h1>
              <p className="text-muted-foreground">
                Create and organize collections of your favorite homeschool resources, activities, and ideas
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative w-full sm:w-auto max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search boards..."
                  className="pl-8 w-full sm:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    className="rounded-r-none"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                    <span className="sr-only">Grid view</span>
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    className="rounded-l-none"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                    <span className="sr-only">List view</span>
                  </Button>
                </div>

                <Select defaultValue="newest">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="a-z">A-Z</SelectItem>
                    <SelectItem value="z-a">Z-A</SelectItem>
                  </SelectContent>
                </Select>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-1">
                      <Plus className="h-4 w-4" />
                      New Board
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Board</DialogTitle>
                      <DialogDescription>
                        Create a new board to organize your homeschool resources and ideas.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input 
                          id="title" 
                          placeholder="Enter board title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input 
                          id="description" 
                          placeholder="Enter board description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsCreateDialogOpen(false)
                          setFormData({ title: "", description: "" })
                        }}
                        disabled={isCreating}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={async () => {
                          if (!formData.title.trim()) {
                            toast({
                              title: "Validation Error",
                              description: "Please enter a board title",
                              variant: "destructive",
                            })
                            return
                          }
                          
                          setIsCreating(true)
                          
                          try {
                            const formDataObj = new FormData()
                            formDataObj.append("title", formData.title.trim())
                            formDataObj.append("description", formData.description.trim())
                            formDataObj.append("isPrivate", "false")
                            
                            const result = await createBoard(formDataObj)
                            
                            if (result.success) {
                              toast({
                                title: "Success",
                                description: "Board created successfully!",
                              })
                              setIsCreateDialogOpen(false)
                              setFormData({ title: "", description: "" })
                              loadBoards()
                            } else {
                              toast({
                                title: "Error",
                                description: result.error || "Failed to create board",
                                variant: "destructive",
                              })
                            }
                          } catch (error) {
                            console.error("Error creating board:", error)
                            toast({
                              title: "Error",
                              description: "An unexpected error occurred",
                              variant: "destructive",
                            })
                          } finally {
                            setIsCreating(false)
                          }
                        }}
                        disabled={isCreating}
                      >
                        {isCreating ? "Creating..." : "Create Board"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredBoards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Grid3X3 className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No boards found</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  {searchQuery
                    ? `No boards match your search for "${searchQuery}". Try a different search term.`
                    : "You haven't created any boards yet. Create your first board to get started."}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>Create Your First Board</Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBoards.map((board) => (
                  <Link
                    key={board.id}
                    href={`/boards/${board.id}`}
                    className="board-card group relative overflow-hidden rounded-xl h-60"
                    style={{ backgroundImage: `url(${board.coverImage})` }}
                  >
                    <div className="board-overlay absolute inset-0 opacity-60 flex flex-col justify-end p-4 text-white">
                      <h3 className="font-bold text-xl mb-1">{board.title}</h3>
                      <p className="text-sm text-white/90 mb-2 line-clamp-2">{board.description}</p>
                      <div className="text-xs font-medium">{board.itemCount} items</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredBoards.map((board) => (
                  <Link
                    key={board.id}
                    href={`/boards/${board.id}`}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className="w-16 h-16 rounded-md bg-cover bg-center shrink-0"
                      style={{ backgroundImage: `url(${board.coverImage})` }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{board.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{board.description}</p>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">{board.itemCount} items</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
