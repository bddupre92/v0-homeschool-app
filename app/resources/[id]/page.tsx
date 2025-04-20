"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useData } from "@/lib/data-context"
import AuthGuard from "@/components/auth/auth-guard"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, ExternalLink, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"

export default function ResourceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const resourceId = params.id as string
  
  const { 
    resources, loadingResources, errorResources, fetchResources, deleteResource
  } = useData()

  const [resource, setResource] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  useEffect(() => {
    if (resources.length > 0) {
      const foundResource = resources.find(r => r.id === resourceId)
      setResource(foundResource)
    }
  }, [resources, resourceId])

  const handleDeleteResource = async () => {
    setIsDeleting(true)
    try {
      await deleteResource(resourceId)
      router.push("/resources")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete resource")
      setIsDeleting(false)
    }
  }

  if (loadingResources && !resource) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen flex-col">
          <Navigation />
          <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center mb-8">
                <Link href="/resources">
                  <Button variant="ghost" size="icon" className="mr-2">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <Skeleton className="h-8 w-64" />
              </div>
              <Skeleton className="h-[400px] w-full" />
            </div>
          </main>
        </div>
      </AuthGuard>
    )
  }

  if (errorResources || !resource) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen flex-col">
          <Navigation />
          <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto max-w-3xl">
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  {errorResources || "Resource not found"}
                </AlertDescription>
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
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div className="flex items-center">
                <Link href="/resources">
                  <Button variant="ghost" size="icon" className="mr-2">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{resource.title}</h1>
                  <Badge variant="outline" className="mt-1">
                    {resource.category}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/resources/${resourceId}/edit`}>
                  <Button variant="outline">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Resource
                  </Button>
                </Link>
                <Button variant="destructive" onClick={handleDeleteResource} disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? "Deleting..." : "Delete Resource"}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Resource Details</CardTitle>
                <CardDescription>
                  Information about this educational resource
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {resource.description && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p className="text-base">{resource.description}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                  <p className="text-base">{resource.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Added On</h3>
                  <p className="text-base">{new Date(resource.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
                  <p className="text-base">{new Date(resource.updatedAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
              {resource.url && (
                <CardFooter>
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    Visit Resource
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </CardFooter>
              )}
            </Card>

            <div className="flex justify-between">
              <Link href="/resources">
                <Button variant="outline">Back to Resources</Button>
              </Link>
              <Link href="/resources/new">
                <Button>Add Another Resource</Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
