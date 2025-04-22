import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import PersonalizedRecommendations from "@/components/personalized-recommendations"
import BoardsGrid from "@/components/boards-grid"
import CommunityEvents from "@/components/community-events"
import AIAssistant from "@/components/ai-assistant"

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <PersonalizedRecommendations />
              <BoardsGrid />
            </div>
            <div className="space-y-6">
              <CommunityEvents />
            </div>
          </div>
        </div>
      </main>

      <AIAssistant />
      <Footer />
    </div>
  )
}
