"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Database } from "lucide-react"
import {
  seedDatabase,
  seedCollection,
  sampleUsers,
  sampleResources,
  sampleBoards,
  sampleEvents,
  sampleLocations,
  samplePosts,
  sampleReviews,
} from "@/lib/seed-data"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SeedDataPage() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null)
  const { user, userProfile } = useAuth()
  const router = useRouter()

  // Check if user is admin
  useEffect(() => {
    if (userProfile && userProfile.role !== "admin") {
      router.push("/dashboard")
    }
  }, [userProfile, router])

  const handleSeedAll = async () => {
    setIsSeeding(true)
    setResult(null)

    try {
      const result = await seedDatabase()
      if (result.success) {
        setResult({ success: true, message: "All collections seeded successfully!" })
      } else {
        setResult({ success: false, message: "Error seeding database. Check console for details." })
      }
    } catch (error) {
      console.error("Error in seed operation:", error)
      setResult({ success: false, message: "An unexpected error occurred." })
    } finally {
      setIsSeeding(false)
    }
  }

  const handleSeedCollection = async (collectionName: string, data: any[]) => {
    setIsSeeding(true)
    setResult(null)

    try {
      const result = await seedCollection(collectionName, data)
      if (result.success) {
        setResult({ success: true, message: `Collection "${collectionName}" seeded successfully!` })
      } else {
        setResult({
          success: false,
          message: `Error seeding collection "${collectionName}". Check console for details.`,
        })
      }
    } catch (error) {
      console.error("Error in seed operation:", error)
      setResult({ success: false, message: "An unexpected error occurred." })
    } finally {
      setIsSeeding(false)
    }
  }

  // If not admin, show access denied
  if (userProfile && userProfile.role !== "admin") {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You do not have permission to access this page.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Database Seed Utility</h1>
      <p className="text-muted-foreground mb-8">
        Use this utility to populate your Firestore database with sample data for testing and development.
      </p>

      {result && (
        <Alert variant={result.success ? "default" : "destructive"} className="mb-6">
          {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Seed All Collections</CardTitle>
          <CardDescription>
            This will populate all collections with sample data. Any existing data with the same IDs will be
            overwritten.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={handleSeedAll} disabled={isSeeding} className="gap-2">
            <Database className="h-4 w-4" />
            {isSeeding ? "Seeding..." : "Seed All Collections"}
          </Button>
        </CardFooter>
      </Card>

      <Tabs defaultValue="users">
        <TabsList className="grid grid-cols-7 mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="boards">Boards</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Seed Users Collection</CardTitle>
              <CardDescription>Add sample user profiles to your database.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60">
                {JSON.stringify(sampleUsers, null, 2)}
              </pre>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSeedCollection("users", sampleUsers)} disabled={isSeeding}>
                {isSeeding ? "Seeding..." : "Seed Users"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Seed Resources Collection</CardTitle>
              <CardDescription>Add sample educational resources to your database.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60">
                {JSON.stringify(sampleResources, null, 2)}
              </pre>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSeedCollection("resources", sampleResources)} disabled={isSeeding}>
                {isSeeding ? "Seeding..." : "Seed Resources"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="boards">
          <Card>
            <CardHeader>
              <CardTitle>Seed Boards Collection</CardTitle>
              <CardDescription>Add sample boards (collections of resources) to your database.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60">
                {JSON.stringify(sampleBoards, null, 2)}
              </pre>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSeedCollection("boards", sampleBoards)} disabled={isSeeding}>
                {isSeeding ? "Seeding..." : "Seed Boards"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Seed Events Collection</CardTitle>
              <CardDescription>Add sample community events to your database.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60">
                {JSON.stringify(sampleEvents, null, 2)}
              </pre>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSeedCollection("events", sampleEvents)} disabled={isSeeding}>
                {isSeeding ? "Seeding..." : "Seed Events"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <CardTitle>Seed Locations Collection</CardTitle>
              <CardDescription>Add sample field trip locations to your database.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60">
                {JSON.stringify(sampleLocations, null, 2)}
              </pre>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSeedCollection("locations", sampleLocations)} disabled={isSeeding}>
                {isSeeding ? "Seeding..." : "Seed Locations"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Seed Posts Collection</CardTitle>
              <CardDescription>Add sample community posts to your database.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60">
                {JSON.stringify(samplePosts, null, 2)}
              </pre>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSeedCollection("posts", samplePosts)} disabled={isSeeding}>
                {isSeeding ? "Seeding..." : "Seed Posts"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Seed Reviews Collection</CardTitle>
              <CardDescription>Add sample reviews for resources and locations to your database.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60">
                {JSON.stringify(sampleReviews, null, 2)}
              </pre>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSeedCollection("reviews", sampleReviews)} disabled={isSeeding}>
                {isSeeding ? "Seeding..." : "Seed Reviews"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
