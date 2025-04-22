"use client"
import { Card } from "@/components/ui/card"
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
              <TabsTrigger value="locations">Locations</TabsTrigger>
            </TabsList>
            <TabsContent value="events">
              <CommunityEvents />
            </TabsContent>
            <TabsContent value="groups">
              <CommunityGroups />
            </TabsContent>
            <TabsContent value="locations">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Locations</h2>
                <p>Map and location features will be displayed here.</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
