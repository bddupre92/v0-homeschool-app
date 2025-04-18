"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Bookmark, Download, ExternalLink, Heart, MessageSquare, Share2, Star, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import Navigation from "@/components/navigation"

// Sample resource data (in a real app, this would come from an API)
const resources = [
  {
    id: "r1",
    title: "Hands-on Fractions Activities",
    description:
      "Fun and engaging activities to teach fractions to elementary students. This comprehensive guide includes printable worksheets, hands-on activities, and interactive games to make learning fractions enjoyable and effective.",
    type: "activity",
    tags: ["Math", "Elementary", "Hands-on"],
    author: "Math Learning Center",
    authorAvatar: "/placeholder.svg",
    rating: 4.8,
    downloads: 1245,
    dateAdded: "2025-03-15",
    isFeatured: true,
    isPremium: false,
    thumbnail: "/placeholder.svg?height=400&width=600",
    content: `
      <h2>Introduction to Fractions</h2>
      <p>Fractions can be a challenging concept for elementary students to grasp. These hands-on activities are designed to make learning fractions fun and concrete.</p>
      
      <h3>Activity 1: Fraction Pizza</h3>
      <p>Using paper plates, create pizza slices to represent different fractions. Students can physically manipulate the pieces to understand concepts like equivalent fractions and addition.</p>
      
      <h3>Activity 2: Fraction Strips</h3>
      <p>Create colorful paper strips divided into different fractions for visual comparison. These strips help students see relationships between fractions and develop fraction sense.</p>
      
      <h3>Activity 3: Lego Fractions</h3>
      <p>Use Lego bricks to represent different fractions and demonstrate addition and subtraction. This tactile approach helps students visualize fraction operations.</p>
    `,
    reviews: [
      {
        id: "rev1",
        user: "Sarah Johnson",
        avatar: "/placeholder.svg",
        rating: 5,
        date: "2025-03-20",
        comment:
          "These fraction activities were perfect for my 3rd grader who was struggling with the concept. The pizza activity was especially helpful!",
      },
      {
        id: "rev2",
        user: "Michael Chen",
        avatar: "/placeholder.svg",
        rating: 4,
        date: "2025-03-18",
        comment:
          "Great resource! I used these activities with my homeschool co-op and the kids loved them. Would recommend adding more advanced activities for older students.",
      },
      {
        id: "rev3",
        user: "Emily Rodriguez",
        avatar: "/placeholder.svg",
        rating: 5,
        date: "2025-03-16",
        comment:
          "The Lego fractions activity was a game-changer for my visual learner. He finally understands equivalent fractions!",
      },
    ],
    relatedResources: ["r2", "r6", "r4"],
  },
  {
    id: "r2",
    title: "Nature Journal Templates",
    description: "Printable templates for nature study journals",
    type: "printable",
    tags: ["Science", "Charlotte Mason", "Printable"],
    author: "Nature Study Collective",
    authorAvatar: "/placeholder.svg",
    rating: 4.6,
    downloads: 987,
    dateAdded: "2025-03-20",
    isFeatured: true,
    isPremium: false,
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "r6",
    title: "Multiplication Tables Practice",
    description: "Interactive multiplication tables practice with games and quizzes",
    type: "interactive",
    tags: ["Math", "Elementary", "Interactive"],
    author: "Math Wizards",
    authorAvatar: "/placeholder.svg",
    rating: 4.7,
    downloads: 1543,
    dateAdded: "2025-03-18",
    isFeatured: false,
    isPremium: true,
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "r4",
    title: "Reading Comprehension Worksheets",
    description: "Printable worksheets to improve reading comprehension skills",
    type: "worksheet",
    tags: ["Language Arts", "Elementary", "Printable"],
    author: "Reading Success",
    authorAvatar: "/placeholder.svg",
    rating: 4.5,
    downloads: 1876,
    dateAdded: "2025-03-10",
    isFeatured: false,
    isPremium: false,
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
]

export default function ResourceDetailPage() {
  const params = useParams()
  const resourceId = params.id as string
  const [isSaved, setIsSaved] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  // Find the resource by ID
  const resource = resources.find((r) => r.id === resourceId)

  // Find related resources
  const relatedResources = resource ? resources.filter((r) => resource.relatedResources.includes(r.id)) : []

  if (!resource) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container py-8 px-4 md:px-6 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Resource Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The resource you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/resources">Back to Resources</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="gap-1">
              <Link href="/resources">
                <ArrowLeft className="h-4 w-4" />
                Back to Resources
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={resource.thumbnail || "/placeholder.svg"}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {resource.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                    {resource.isPremium && <Badge className="bg-secondary text-secondary-foreground">Premium</Badge>}
                  </div>
                  <CardTitle className="text-2xl">{resource.title}</CardTitle>
                  <CardDescription className="text-base">{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="reviews">Reviews ({resource.reviews?.length || 0})</TabsTrigger>
                      <TabsTrigger value="related">Related</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="mt-6">
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: resource.content || "No content available." }}
                      />
                    </TabsContent>
                    <TabsContent value="reviews" className="mt-6">
                      <div className="space-y-6">
                        {resource.reviews && resource.reviews.length > 0 ? (
                          resource.reviews.map((review) => (
                            <div key={review.id} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <Avatar>
                                    <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.user} />
                                    <AvatarFallback>
                                      {review.user
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{review.user}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {new Date(review.date).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="mt-4 text-sm">{review.comment}</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                            <p className="text-muted-foreground mb-4">Be the first to review this resource!</p>
                            <Button>Write a Review</Button>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="related" className="mt-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {relatedResources.length > 0 ? (
                          relatedResources.map((related) => (
                            <Link key={related.id} href={`/resources/${related.id}`}>
                              <Card className="h-full hover:shadow-md transition-shadow">
                                <div className="aspect-video">
                                  <img
                                    src={related.thumbnail || "/placeholder.svg"}
                                    alt={related.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <CardHeader className="p-4 pb-2">
                                  <CardTitle className="text-base">{related.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {related.tags.slice(0, 2).map((tag) => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            </Link>
                          ))
                        ) : (
                          <div className="col-span-2 text-center py-8">
                            <p className="text-muted-foreground">No related resources found.</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resource Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium capitalize">{resource.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <div className="flex items-center">
                      <div className="flex mr-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(resource.rating) ? "text-yellow-500 fill-yellow-500" : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">{resource.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Downloads</span>
                    <span className="font-medium">{resource.downloads.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date Added</span>
                    <span className="font-medium">{new Date(resource.dateAdded).toLocaleDateString()}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={resource.authorAvatar || "/placeholder.svg"} alt={resource.author} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{resource.author}</div>
                      <div className="text-sm text-muted-foreground">Resource Creator</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button className="w-full gap-1">
                    <Download className="h-4 w-4" />
                    Download Resource
                  </Button>
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      className={`flex-1 gap-1 ${isSaved ? "text-primary" : ""}`}
                      onClick={() => setIsSaved(!isSaved)}
                    >
                      <Bookmark className={`h-4 w-4 ${isSaved ? "fill-primary" : ""}`} />
                      {isSaved ? "Saved" : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      className={`flex-1 gap-1 ${isLiked ? "text-primary" : ""}`}
                      onClick={() => setIsLiked(!isLiked)}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? "fill-primary" : ""}`} />
                      Like
                    </Button>
                    <Button variant="outline" className="flex-1 gap-1">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>More from {resource.author}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resources
                    .filter((r) => r.author === resource.author && r.id !== resource.id)
                    .slice(0, 3)
                    .map((authorResource) => (
                      <Link key={authorResource.id} href={`/resources/${authorResource.id}`}>
                        <div className="flex items-start gap-3 hover:bg-muted p-2 rounded-md transition-colors">
                          <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={authorResource.thumbnail || "/placeholder.svg"}
                              alt={authorResource.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium line-clamp-2">{authorResource.title}</div>
                            <div className="text-sm text-muted-foreground flex items-center mt-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                              {authorResource.rating}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full gap-1">
                    <ExternalLink className="h-4 w-4" />
                    View Creator Profile
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
