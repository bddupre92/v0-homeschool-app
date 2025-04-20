"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useData } from "@/lib/data-context"
import AuthGuard from "@/components/auth/auth-guard"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditBoardPage() {
  const params = useParams()
  const router = useRouter()
  const boardId = params.id as string
  
  const { boards, loadingBoards, errorBoards, fetchBoards, updateBoard } = useData()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBoards()
  }, [fetchBoards])

  useEffect(() => {
    if (boards.length > 0) {
      const board = boards.find(b => b.id === boardId)
      if (board) {
        setTitle(board.title)
        setDescription(board.description || "")
      }
    }
  }, [boards, boardId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!title.trim()) {
        throw new Error("Title is required")
      }

      await updateBoard(boardId, {
        title,
        description: description.trim() ? description : undefined,
      })

      router.push(`/boards/${boardId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update board")
      setIsLoading(false)
    }
  }

  if (loadingBoards) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen flex-col">
          <Navigation />
          <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto max-w-2xl">
              <div className="mb-8 flex items-center">
                <Link href={`/boards/${boardId}`}>
                  <Button variant="ghost" size="icon" className="mr-2">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Edit Board</h1>
                  <p className="text-muted-foreground">Loading board details...</p>
                </div>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </AuthGuard>
    )
  }

  if (errorBoards) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen flex-col">
          <Navigation />
          <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto max-w-2xl">
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorBoards}</AlertDescription>
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
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 flex items-center">
              <Link href={`/boards/${boardId}`}>
                <Button variant="ghost" size="icon" className="mr-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Board</h1>
                <p className="text-muted-foreground">
                  Update your board details
                </p>
              </div>
            </div>

            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Board Details</CardTitle>
                  <CardDescription>
                    Edit the information for your board
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Title
                    </label>
                    <Input
                      id="title"
                      placeholder="Enter board title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Description (optional)
                    </label>
                    <Textarea
                      id="description"
                      placeholder="Enter board description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href={`/boards/${boardId}`}>
                    <Button variant="outline" type="button">Cancel</Button>
                  </Link>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
