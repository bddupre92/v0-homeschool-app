import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, BookOpen, Calendar, MessageSquare, Star, TrendingUp } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">+12 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resources</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">543</div>
            <p className="text-xs text-muted-foreground">+48 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+3 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <p className="text-xs text-muted-foreground">+15 this week</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="moderation">Moderation Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: "user", action: "New user registered", name: "Emily Johnson", time: "10 minutes ago" },
                  {
                    type: "resource",
                    action: "New resource added",
                    name: "Algebra Fundamentals Workbook",
                    time: "1 hour ago",
                  },
                  {
                    type: "post",
                    action: "New community post",
                    name: "Tips for Teaching Multiple Ages",
                    time: "3 hours ago",
                  },
                  {
                    type: "review",
                    action: "New review submitted",
                    name: "5★ review for Science Museum",
                    time: "5 hours ago",
                  },
                  { type: "event", action: "New event created", name: "Homeschool Co-op Meetup", time: "Yesterday" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 pb-4 last:pb-0 last:border-0 border-b">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {item.type === "user" && <Users className="h-4 w-4" />}
                      {item.type === "resource" && <BookOpen className="h-4 w-4" />}
                      {item.type === "post" && <MessageSquare className="h-4 w-4" />}
                      {item.type === "review" && <Star className="h-4 w-4" />}
                      {item.type === "event" && <Calendar className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-sm text-muted-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Reports</CardTitle>
              <CardDescription>Usage statistics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "User Growth", icon: Users, value: "+15%", period: "vs. last month" },
                  { title: "Resource Engagement", icon: BookOpen, value: "+23%", period: "vs. last month" },
                  { title: "Community Activity", icon: MessageSquare, value: "+8%", period: "vs. last month" },
                  { title: "Event Participation", icon: Calendar, value: "+12%", period: "vs. last month" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between pb-4 last:pb-0 last:border-0 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-500">{item.value}</span>
                      <span className="text-xs text-muted-foreground">{item.period}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Queue</CardTitle>
              <CardDescription>Items requiring review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    type: "post",
                    name: "Is this curriculum worth it?",
                    reason: "Reported for potential advertising",
                    time: "2 hours ago",
                  },
                  {
                    type: "review",
                    name: "Review for Math Curriculum",
                    reason: "Contains external links",
                    time: "5 hours ago",
                  },
                  {
                    type: "resource",
                    name: "Free Printable Pack",
                    reason: "Potential copyright issue",
                    time: "Yesterday",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 pb-4 last:pb-0 last:border-0 border-b">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                      {item.type === "post" && <MessageSquare className="h-4 w-4" />}
                      {item.type === "review" && <Star className="h-4 w-4" />}
                      {item.type === "resource" && <BookOpen className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.reason}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Approve</button>
                      <button className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
