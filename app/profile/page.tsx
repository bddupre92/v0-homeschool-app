"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Calendar, Edit, Grid3X3, Mail, MapPin, MessageSquare, UserIcon, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Navigation from "@/components/navigation"

// Sample user data
const userData = {
  name: "Jane Smith",
  username: "janesmith",
  avatar: "/placeholder.svg",
  bio: "Homeschooling mom of 3 with a passion for science and nature-based learning. Charlotte Mason enthusiast.",
  location: "Portland, Oregon",
  email: "jane.smith@example.com",
  joinDate: "2024-09-15",
  stats: {
    boards: 12,
    resources: 45,
    followers: 87,
    following: 34,
  },
  interests: ["Science", "Nature Study", "Charlotte Mason", "Literature", "Art", "History"],
  boards: [
    {
      id: "1",
      title: "Science Experiments",
      description: "Collection of hands-on science activities",
      itemCount: 24,
      coverImage:
        "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      id: "2",
      title: "Math Games",
      description: "Fun ways to practice math skills",
      itemCount: 18,
      coverImage:
        "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      id: "3",
      title: "Nature Study",
      description: "Ideas for outdoor exploration and nature journaling",
      itemCount: 15,
      coverImage:
        "https://images.unsplash.com/photo-1500829243541-74b677fecc30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
  ],
  resources: [
    {
      id: "r1",
      title: "Hands-on Fractions Activities",
      description: "Fun and engaging activities to teach fractions to elementary students",
      type: "activity",
      tags: ["Math", "Elementary", "Hands-on"],
      thumbnail: "/placeholder.svg?height=200&width=300",
      downloads: 1245,
    },
    {
      id: "r5",
      title: "Science Experiment: Water Cycle in a Bag",
      description: "Easy demonstration of the water cycle using household items",
      type: "activity",
      tags: ["Science", "Elementary", "Hands-on"],
      thumbnail: "/placeholder.svg?height=200&width=300",
      downloads: 2341,
    },
    {
      id: "r8",
      title: "Ancient Egypt Unit Study",
      description: "Comprehensive unit study on Ancient Egypt with activities and resources",
      type: "unit study",
      tags: ["History", "Elementary", "Middle School"],
      thumbnail: "/placeholder.svg?height=200&width=300",
      downloads: 1234,
    },
  ],
  activities: [
    {
      id: "a1",
      type: "resource_created",
      content: "Created a new resource: Water Cycle in a Bag",
      date: "2025-04-10",
    },
    {
      id: "a2",
      type: "board_created",
      content: "Created a new board: Spring Science Activities",
      date: "2025-04-05",
    },
    {
      id: "a3",
      type: "resource_saved",
      content: "Saved a resource: Multiplication Tables Practice",
      date: "2025-04-02",
    },
    {
      id: "a4",
      type: "comment",
      content: "Commented on Nature Journal Templates: 'These are perfect for our spring nature walks!'",
      date: "2025-03-28",
    },
    {
      id: "a5",
      type: "resource_created",
      content: "Created a new resource: Ancient Egypt Unit Study",
      date: "2025-03-25",
    },
  ],
}

export default function ProfilePage() {
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 space-y-6">
              <Card>
                <CardHeader className="relative pb-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit Profile</span>
                  </Button>
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.name} />
                      <AvatarFallback>
                        <UserIcon className="h-12 w-12" />
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-2xl">{userData.name}</CardTitle>
                    <CardDescription className="text-center">@{userData.username}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <p className="text-center">{userData.bio}</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {userData.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {userData.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Joined {new Date(userData.joinDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 pt-2">
                    <div className="flex flex-col items-center">
                      <span className="font-bold">{userData.stats.boards}</span>
                      <span className="text-xs text-muted-foreground">Boards</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-bold">{userData.stats.resources}</span>
                      <span className="text-xs text-muted-foreground">Resources</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-bold">{userData.stats.followers}</span>
                      <span className="text-xs text-muted-foreground">Followers</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-bold">{userData.stats.following}</span>
                      <span className="text-xs text-muted-foreground">Following</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" className="w-full gap-1">
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {userData.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userData.activities.slice(0, 4).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 pb-4 last:pb-0 last:border-0 border-b">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1">
                        <p className="text-sm">{activity.content}</p>
                        <p className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full text-muted-foreground">
                    View all activity
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="md:w-2/3">
              <Tabs defaultValue="boards">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="boards" className="flex items-center gap-1">
                    <Grid3X3 className="h-4 w-4" />
                    Boards
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    Resources
                  </TabsTrigger>
                  <TabsTrigger value="following" className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Following
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="boards" className="mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userData.boards.map((board) => (
                      <Link key={board.id} href={`/boards/${board.id}`} className="block">
                        <div
                          className="board-card group relative overflow-hidden rounded-xl h-48"
                          style={{ backgroundImage: `url(${board.coverImage})` }}
                        >
                          <div className="board-overlay absolute inset-0 opacity-60 flex flex-col justify-end p-4 text-white">
                            <h3 className="font-bold text-xl mb-1">{board.title}</h3>
                            <p className="text-sm text-white/90 mb-2 line-clamp-2">{board.description}</p>
                            <div className="text-xs font-medium">{board.itemCount} items</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                    <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-xl hover:border-primary/50 transition-colors">
                      <Button variant="ghost" className="flex flex-col h-full w-full">
                        <Grid3X3 className="h-8 w-8 mb-2" />
                        <span>Create New Board</span>
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="resources" className="mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userData.resources.map((resource) => (
                      <Link key={resource.id} href={`/resources/${resource.id}`} className="block">
                        <Card className="h-full overflow-hidden hover:shadow-md transition-shadow resource-card">
                          <div className="aspect-video relative">
                            <img
                              src={resource.thumbnail || "/placeholder.svg"}
                              alt={resource.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="p-4 pt-0 pb-2">
                            <div className="flex flex-wrap gap-1 mb-2">
                              {resource.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                          <CardFooter className="p-4 pt-2 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{resource.downloads} downloads</span>
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </CardFooter>
                        </Card>
                      </Link>
                    ))}
                    <div className="flex items-center justify-center h-full border-2 border-dashed rounded-xl hover:border-primary/50 transition-colors">
                      <Button variant="ghost" className="flex flex-col h-full w-full py-8">
                        <BookOpen className="h-8 w-8 mb-2" />
                        <span>Create New Resource</span>
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="following" className="mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      {
                        name: "Sarah Johnson",
                        username: "sarahj",
                        avatar: "/placeholder.svg",
                        bio: "Homeschooling mom of 2. Classical education enthusiast.",
                      },
                      {
                        name: "Michael Chen",
                        username: "mchen",
                        avatar: "/placeholder.svg",
                        bio: "Dad and STEM educator. Creating resources for hands-on science.",
                      },
                      {
                        name: "Emily Rodriguez",
                        username: "emilyr",
                        avatar: "/placeholder.svg",
                        bio: "Charlotte Mason homeschooler with a focus on nature studies and literature.",
                      },
                      {
                        name: "David Wilson",
                        username: "davidw",
                        avatar: "/placeholder.svg",
                        bio: "History teacher creating resources for middle and high school students.",
                      },
                    ].map((user, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                              <AvatarFallback>
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{user.name}</CardTitle>
                              <CardDescription>@{user.username}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm line-clamp-2">{user.bio}</p>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" size="sm" className="w-full">
                            View Profile
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your profile information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={userData.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue={userData.username} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" defaultValue={userData.bio} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" defaultValue={userData.location} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={userData.email} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input id="avatar" defaultValue={userData.avatar} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="interests">Interests (comma separated)</Label>
              <Input id="interests" defaultValue={userData.interests.join(", ")} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsEditingProfile(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
