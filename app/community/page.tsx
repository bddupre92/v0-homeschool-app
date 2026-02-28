"use client"
import Link from "next/link"
import { Compass } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import CommunityEvents from "@/components/community-events"
import CommunityGroups from "@/components/community-groups"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CommunityPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <h1 className="text-3xl font-bold mb-6">Community</h1>

          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="discover">Discover</TabsTrigger>
            </TabsList>
            <TabsContent value="events">
              <CommunityEvents />
            </TabsContent>
            <TabsContent value="groups">
              <CommunityGroups />
            </TabsContent>
            <TabsContent value="discover">
              <Card className="p-8 text-center">
                <Compass className="h-12 w-12 mx-auto mb-3 text-primary" />
                <h2 className="text-xl font-bold mb-2">Discover Groups Near You</h2>
                <p className="text-muted-foreground mb-4">
                  Find homeschool co-ops and groups in your area using our matching algorithm and map-based discovery.
                </p>
                <Button asChild>
                  <Link href="/community/groups/discover">
                    <Compass className="h-4 w-4 mr-2" />
                    Explore Groups
                  </Link>
                </Button>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
