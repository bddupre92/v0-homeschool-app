"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useData } from "@/lib/data-context"
import AuthGuard from "@/components/auth/auth-guard"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Pencil, Trash2, X, Check, ArrowLeft } from "lucide-react"
import Link from "next/link"

type BoardItemStatus = "todo" | "in-progress" | "completed"

export default function BoardDetailPage() {
  const params = useParams()
  const router = useRouter()
  const boardId = params.id as string
  
  const { 
    boards, loadingBoards, errorBoards, fetchBoards,
    boardItems, loadingBoardItems, errorBoardItems, fetchBoardItems,
    createBoardItem, updateBoardItem, deleteBoardItem, deleteBoard
  } = useData()

  const [board, setBoard] = useState<any>(null)
  const [newItemTitle, setNewItemTitle] = useState("")
  const [newItemStatus, setNewItemStatus] = useState<BoardItemStatus>("todo")
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingItemTitle, setEditingItemTitle] = useState("")

  useEffect(() => {
    fetchBoards()
    fetchBoardItems(boardId)
  }, [boardId, fetchBoards, fetchBoardItems])

  useEffect(() => {
    if (boards.length > 0) {
      const foundBoard = boards.find(b => b.id === boardId)
      setBoard(foundBoard)
    }
  }, [boards, boardId])

  const handleAddItem = async () => {
    if (!newItemTitle.trim()) {
      setError("Item title is required")
      return
    }

    setError(null)
    try {
      await createBoardItem(boardId, {
        title: newItemTitle,
        status: newItemStatus,
        content: ""
      })
      setNewItemTitle("")
      setIsAddingItem(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item")
    }
  }

  const handleUpdateItemStatus = async (itemId: string, newStatus: BoardItemStatus) => {
    try {
      await updateBoardItem(boardId, itemId, { status: newStatus })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item")
    }
  }

  const handleStartEditItem = (item: any) => {
    setEditingItemId(item.id)
    setEditingItemTitle(item.title)
  }

  const handleSaveEditItem = async () => {
    if (!editingItemId) return
    if (!editingItemTitle.trim()) {
      setError("Item title is required")
      return
    }

    setError(null)
    try {
      await updateBoardItem(boardId, editingItemId, { title: editingItemTitle })
      setEditingItemId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item")
    }
  }

  const handleCancelEditItem = () => {
    setEditingItemId(null)
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteBoardItem(boardId, itemId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item")
    }
  }

  const handleDeleteBoard = async () => {
    setIsDeleting(true)
    try {
      await deleteBoard(boardId)
      router.push("/boards")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete board")
      setIsDeleting(false)
    }
  }

  const renderBoardItems = (status: BoardItemStatus) => {
    if (loadingBoardItems) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )
    }

    const items = boardItems[boardId]?.filter(item => item.status === status) || []

    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No items in this column
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {items.map(item => (
          <Card key={item.id} className="bg-white dark:bg-gray-800">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                {editingItemId === item.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={editingItemTitle}
                      onChange={(e) => setEditingItemTitle(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button size="icon" variant="ghost" onClick={handleSaveEditItem}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={handleCancelEditItem}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="font-medium">{item.title}</div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleStartEditItem(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-2 pt-0 flex justify-between">
              {status !== "todo" && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleUpdateItemStatus(item.id, "todo")}
                >
                  Move to Todo
                </Button>
              )}
              {status !== "in-progress" && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleUpdateItemStatus(item.id, "in-progress")}
                >
                  Move to In Progress
                </Button>
              )}
              {status !== "completed" && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleUpdateItemStatus(item.id, "completed")}
                >
                  Mark Completed
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (loadingBoards && !board) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen flex-col">
          <Navigation />
          <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center mb-8">
                <Link href="/boards">
                  <Button variant="ghost" size="icon" className="mr-2">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <Skeleton className="h-8 w-64" />
              </div>
              <Skeleton className="h-[600px] w-full" />
            </div>
          </main>
        </div>
      </AuthGuard>
    )
  }

  if (errorBoards || !board) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen flex-col">
          <Navigation />
          <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  {errorBoards || "Board not found"}
                </AlertDescription>
              </Alert>
              <Link href="/boards">
                <Button>Back to Boards</Button>
              </Link>
            </div>
          </main>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div className="flex items-center">
                <Link href="/boards">
                  <Button variant="ghost" size="icon" className="mr-2">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{board.title}</h1>
                  {board.description && (
                    <p className="text-muted-foreground">{board.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/boards/${boardId}/edit`}>
                  <Button variant="outline">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Board
                  </Button>
                </Link>
                <Button variant="destructive" onClick={handleDeleteBoard} disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? "Deleting..." : "Delete Board"}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mb-6">
              {isAddingItem ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <Input
                        placeholder="Enter item title"
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <Button onClick={handleAddItem}>Add Item</Button>
                        <Button variant="outline" onClick={() => setIsAddingItem(false)}>Cancel</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Button onClick={() => setIsAddingItem(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Todo</CardTitle>
                  <CardDescription>Items to be started</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderBoardItems("todo")}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>In Progress</CardTitle>
                  <CardDescription>Items being worked on</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderBoardItems("in-progress")}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Completed</CardTitle>
                  <CardDescription>Finished items</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderBoardItems("completed")}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
