"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useData } from "@/lib/data-context"
import AuthGuard from "@/components/auth/auth-guard"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const RESOURCE_CATEGORIES = [
  "Curriculum",
  "Worksheet",
  "Video",
  "Book",
  "Article",
  "Website",
  "App",
  "Game",
  "Other"
]

export default function EditResourcePage() {
  const params = useParams()
  const router = useRouter()
  const resourceId = params.id as string
  
  const { resources, loadingResources, errorResources, fetchResources, updateResource } = useData()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [category, setCategory] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  useEffect(() => {
    if (resources.length > 0) {
      const resource = resources.find(r => r.id === resourceId)
      if (resource) {
        setTitle(resource.title)
        setDescription(resource.description || "")
        setUrl(resource.url || "")
        setCategory(resource.category)
      }
    }
  }, [resources, resourceId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!title.trim()) {
        throw new Error("Title is required")
      }

      if (!category) {
        throw new Error("Category is required")
      }

      await updateResource(resourceId, {
        title,
        description: description.trim() ? description : undefined,
        url: url.trim() ? url : undefined,
        category
      })

      router.push(`/resources/${resourceId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update resource")
      setIsLoading(false)
    }
  }

  if (loadingResources && !category) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen flex-col">
          <Navigation />
          <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto max-w-2xl">
              <div className="mb-8 flex items-center">
                <Link href={`/resources/${resourceId}`}>
                  <Button variant="ghost" size="icon" className="mr-2">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Edit Resource</h1>
                  <p className="text-muted-foreground">Loading resource details...</p>
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

  if (errorResources) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen flex-col">
          <Navigation />
          <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto max-w-2xl">
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorResources}</AlertDescription>
              </Alert>
              <Link href="/resources">
                <Button>Back to Resources</Button>
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
              <Link href={`/resources/${resourceId}`}>
                <Button variant="ghost" size="icon" className="mr-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Resource</h1>
                <p className="text-muted-foreground">
                  Update your resource details
                </p>
              </div>
            </div>

            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Resource Details</CardTitle>
                  <CardDescription>
                    Edit the information for your resource
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
                      placeholder="Enter resource title"
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
                      placeholder="Enter resource description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="url" className="text-sm font-medium">
                      URL (optional)
                    </label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">
                      Category
                    </label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {RESOURCE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href={`/resources/${resourceId}`}>
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
