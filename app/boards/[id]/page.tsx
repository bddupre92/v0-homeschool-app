"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Edit, Grid3X3, List, Loader2, MoreHorizontal, Plus, Search, Share2, Trash2, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import Navigation from "@/components/navigation"
import { getBoardById, updateBoard, deleteBoard, addItemToBoard } from "@/app/actions/board-actions"
import { toast } from "@/hooks/use-toast"

export default function BoardDetailPage() {
  const params = useParams()
  const router = useRouter()
  const boardId = params.id as string
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isEditingBoard, setIsEditingBoard] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [board, setBoard] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadBoard = useCallback(async () => {
    try {
      const result = await getBoardById(boardId)
      if (result.success && result.board) {
        setBoard(result.board)
      }
    } catch (error) {
      console.error("Error loading board:", error)
    } finally {
      setIsLoading(false)
    }
  }, [boardId])

  useEffect(() => {
    loadBoard()
  }, [loadBoard])

  // Filter items based on search query
  const filteredItems = board?.items?.filter(
    (item: any) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const form = e.currentTarget
      const formData = new FormData(form)
      const result = await addItemToBoard(boardId, formData)

      if (result.success) {
        toast({ title: "Success", description: "Item added to board!" })
        setIsAddingItem(false)
        form.reset()
        loadBoard()
      } else {
        toast({ title: "Error", description: result.error || "Failed to add item", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error adding item:", error)
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateBoard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const form = e.currentTarget
      const formData = new FormData(form)
      const result = await updateBoard(boardId, formData)

      if (result.success) {
        toast({ title: "Success", description: "Board updated!" })
        setIsEditingBoard(false)
        loadBoard()
      } else {
        toast({ title: "Error", description: result.error || "Failed to update board", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error updating board:", error)
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteBoard = async () => {
    setIsSubmitting(true)
    try {
      const result = await deleteBoard(boardId)
      if (result.success) {
        toast({ title: "Success", description: "Board deleted" })
        router.push("/boards")
      } else {
        toast({ title: "Error", description: result.error || "Failed to delete board", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error deleting board:", error)
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--linen)] text-[var(--ink)]">
        <Navigation />
        <main className="flex-1 container py-8 px-4 md:px-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    )
  }

  if (!board) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--linen)] text-[var(--ink)]">
        <Navigation />
        <main className="flex-1 container py-8 px-4 md:px-6 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Board Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The board you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/boards">Back to Boards</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--linen)] text-[var(--ink)]">
      <Navigation />

      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="gap-1">
              <Link href="/boards">
                <ArrowLeft className="h-4 w-4" />
                Back to Boards
              </Link>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {board.coverImage && (
                <div
                  className="w-16 h-16 rounded-md bg-cover bg-center shrink-0"
                  style={{ backgroundImage: `url(${board.coverImage})` }}
                />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">{board.title}</h1>
                  {board.isPrivate && (
                    <Badge variant="outline" className="text-muted-foreground">
                      Private
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{board.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-1">
                <Share2 className="h-4 w-4" />
                Share
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Board Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsEditingBoard(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Board
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" />
                    Manage Collaborators
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Board
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-auto max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search items..."
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

              <Button onClick={() => setIsAddingItem(true)} className="gap-1">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>
          </div>

          {filteredItems && filteredItems.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow resource-card">
                    <div className="aspect-video relative">
                      <img
                        src={item.thumbnail || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 pb-2">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">Source: {item.source}</div>
                    </CardContent>
                    <CardFooter className="p-4 pt-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </span>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/4 aspect-video md:aspect-auto md:h-auto">
                        <img
                          src={item.thumbnail || "/placeholder.svg"}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg">{item.title}</h3>
                            <p className="text-muted-foreground mt-1">{item.description}</p>
                          </div>
                          <Badge variant="outline">{item.type}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div>Source: {item.source}</div>
                            <div>Added {new Date(item.addedAt).toLocaleDateString()}</div>
                          </div>
                          <Button size="sm">View Resource</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Grid3X3 className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {searchQuery
                  ? `No items match your search for "${searchQuery}". Try a different search term.`
                  : "This board doesn't have any items yet. Add your first item to get started."}
              </p>
              <Button onClick={() => setIsAddingItem(true)}>Add Your First Item</Button>
            </div>
          )}
        </div>
      </main>

      {/* Add Item Dialog */}
      <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Item to Board</DialogTitle>
            <DialogDescription>Add a resource or activity to your &quot;{board.title}&quot; board.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddItem}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="item-title">Title *</Label>
                <Input id="item-title" name="title" placeholder="Enter item title" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item-description">Description</Label>
                <Textarea id="item-description" name="description" placeholder="Enter item description" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item-type">Type *</Label>
                <Input id="item-type" name="type" placeholder="e.g., activity, printable, resource" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item-tags">Tags (comma separated) *</Label>
                <Input id="item-tags" name="tags" placeholder="e.g., Science, Elementary, Hands-on" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item-source">Source</Label>
                <Input id="item-source" name="source" placeholder="Where did you find this resource?" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item-thumbnail">Thumbnail URL</Label>
                <Input id="item-thumbnail" name="thumbnail" placeholder="Enter image URL" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddingItem(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Board Dialog */}
      <Dialog open={isEditingBoard} onOpenChange={setIsEditingBoard}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Board</DialogTitle>
            <DialogDescription>Update your board details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateBoard}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="board-title">Title</Label>
                <Input id="board-title" name="title" defaultValue={board.title} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="board-description">Description</Label>
                <Textarea id="board-description" name="description" defaultValue={board.description} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="board-cover">Cover Image URL</Label>
                <Input id="board-cover" name="coverImage" defaultValue={board.coverImage} />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="board-private" name="isPrivate" value="true" defaultChecked={board.isPrivate} />
                <Label htmlFor="board-private">Make this board private</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditingBoard(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Board Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Delete Board</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this board? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-destructive font-medium">
              All items in this board will be removed. This action is permanent.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBoard} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete Board"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
