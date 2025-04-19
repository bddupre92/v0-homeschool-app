"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useData } from "@/lib/data-context"
import AuthGuard from "@/components/auth/auth-guard"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function NewBoardPage() {
  const router = useRouter()
  const { createBoard } = useData()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!title.trim()) {
        throw new Error("Title is required")
      }

      const newBoard = await createBoard({
        title,
        description: description.trim() ? description : undefined,
      })

      router.push(`/boards/${newBoard.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board")
      setIsLoading(false)
    }
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Create New Board</h1>
              <p className="text-muted-foreground">
                Create a new board to organize your homeschool content
              </p>
            </div>

            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Board Details</CardTitle>
                  <CardDescription>
                    Enter the information for your new board
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter board title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
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
                  <Link href="/boards">
                    <Button variant="outline" type="button">Cancel</Button>
                  </Link>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Board"}
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
