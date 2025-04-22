"use client"

import { useState, useRef, useEffect } from "react"
import { useInView } from "react-intersection-observer"
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Plus,
  ChevronUp,
  ChevronDown,
  Calendar,
  Grid3X3,
  Sparkles,
  Filter,
} from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import Navigation from "@/components/navigation"
import { useAuth } from "@/contexts/auth-context"
import { PreferenceSelector } from "@/components/preference-selector"
import { useRecommendations } from "@/hooks/use-recommendations"
import type { ContentItem } from "@/lib/recommendation-service"

// Sample data for the scroll feed
const scrollItems: ContentItem[] = [
  {
    id: "1",
    type: "resource",
    title: "10 Hands-on Science Experiments for Elementary Students",
    description: "Engage your young learners with these easy-to-setup science experiments using household items.",
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    tags: ["Science", "Elementary", "Hands-on"],
    author: {
      name: "Science Explorers",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    stats: {
      likes: 342,
      comments: 28,
      saves: 156,
    },
  },
  {
    id: "2",
    type: "community",
    title: "Our Nature Journal Adventure at the Local Park",
    description:
      "We spent the morning identifying local plants and sketching in our nature journals. Here's what we discovered!",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    tags: ["Nature Study", "Charlotte Mason", "Outdoor Learning"],
    author: {
      name: "Homeschool Adventures",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    stats: {
      likes: 215,
      comments: 42,
      saves: 89,
    },
  },
  {
    id: "3",
    type: "board",
    title: "Ancient Egypt Unit Study Resources",
    description: "A collection of the best books, activities, and videos for an immersive Ancient Egypt unit study.",
    image:
      "https://images.unsplash.com/photo-1608580594961-beb394dda856?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    tags: ["History", "Unit Study", "Middle School"],
    author: {
      name: "Classical Homeschooler",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    stats: {
      likes: 178,
      comments: 15,
      saves: 203,
    },
    items: 24,
  },
  {
    id: "4",
    type: "resource",
    title: "Printable Fraction Games Pack",
    description: "Make learning fractions fun with these 10 printable games that reinforce concepts through play.",
    image:
      "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    tags: ["Math", "Elementary", "Printable"],
    author: {
      name: "Math Made Fun",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    stats: {
      likes: 421,
      comments: 37,
      saves: 289,
    },
  },
  {
    id: "5",
    type: "community",
    title: "Our Homeschool Room Transformation",
    description: "We transformed our spare bedroom into an inspiring learning space. See the before and after!",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    tags: ["Homeschool Spaces", "Organization", "DIY"],
    author: {
      name: "Creative Learning",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    stats: {
      likes: 532,
      comments: 64,
      saves: 217,
    },
  },
  {
    id: "6",
    type: "resource",
    title: "Shakespeare for Kids: A Midsummer Night's Dream",
    description: "Introduce your children to Shakespeare with this kid-friendly adaptation and activity guide.",
    image: "https://images.unsplash.com/photo-1551029506-0807df4e2031?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    tags: ["Literature", "Elementary", "Middle School"],
    author: {
      name: "Literary Adventures",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    stats: {
      likes: 187,
      comments: 23,
      saves: 142,
    },
  },
  {
    id: "7",
    type: "board",
    title: "Hands-on Geography Activities",
    description: "Make geography come alive with these interactive projects, games, and explorations.",
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    tags: ["Geography", "Hands-on", "All Ages"],
    author: {
      name: "World Explorer",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    stats: {
      likes: 245,
      comments: 19,
      saves: 178,
    },
    items: 18,
  },
  {
    id: "8",
    type: "community",
    title: "Weekly Nature Walk: Identifying Local Birds",
    description: "Our homeschool co-op's weekly nature walk focused on bird identification. Here's what we spotted!",
    image: "https://images.unsplash.com/photo-1549608276-5786777e6587?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    tags: ["Nature Study", "Science", "Co-op Activity"],
    author: {
      name: "Nature Explorers Co-op",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    stats: {
      likes: 198,
      comments: 31,
      saves: 67,
    },
  },
  {
    id: "9",
    type: "resource",
    title: "Coding for Kids: Intro to Scratch Programming",
    description: "Get your kids started with coding using this beginner-friendly Scratch tutorial series.",
    image:
      "https://images.unsplash.com/photo-1603354350317-6f7aaa5911c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    tags: ["Technology", "Coding", "Elementary"],
    author: {
      name: "Tech for Kids",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    stats: {
      likes: 312,
      comments: 27,
      saves: 203,
    },
  },
  {
    id: "10",
    type: "board",
    title: "Charlotte Mason Nature Study Resources",
    description: "Everything you need for a Charlotte Mason inspired nature study curriculum.",
    image:
      "https://images.unsplash.com/photo-1500829243541-74b677fecc30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    tags: ["Charlotte Mason", "Nature Study", "All Ages"],
    author: {
      name: "CM Homeschooler",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    stats: {
      likes: 276,
      comments: 22,
      saves: 231,
    },
    items: 32,
  },
]

// Sample boards for the save modal
const userBoards = [
  { id: "b1", title: "Science Experiments", itemCount: 24, coverImage: "/placeholder.svg?height=100&width=100" },
  { id: "b2", title: "Math Resources", itemCount: 18, coverImage: "/placeholder.svg?height=100&width=100" },
  { id: "b3", title: "Reading List", itemCount: 32, coverImage: "/placeholder.svg?height=100&width=100" },
  { id: "b4", title: "Art Projects", itemCount: 15, coverImage: "/placeholder.svg?height=100&width=100" },
]

// Sample planner items
const plannerItems = [
  { id: "p1", title: "Math Lesson", date: "2025-04-20", subject: "Math" },
  { id: "p2", title: "Science Experiment", date: "2025-04-22", subject: "Science" },
  { id: "p3", title: "Reading Assignment", date: "2025-04-21", subject: "Language Arts" },
]

export default function ScrollPage() {
  const [activeTab, setActiveTab] = useState("for-you")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadedItems, setLoadedItems] = useState<ContentItem[]>([])
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  // Use our recommendations hook
  const {
    preferences,
    updatePreferences,
    recommendedContent,
    isLoading: isRecommendationsLoading,
    handleLikeContent,
    handleSaveContent,
    isContentLiked,
    isContentSaved,
  } = useRecommendations(scrollItems)

  // Initialize loaded items with recommended content
  useEffect(() => {
    if (recommendedContent.length > 0 && loadedItems.length === 0) {
      const initialItems = recommendedContent.slice(0, 3).map((item) => item.item)
      setLoadedItems(initialItems)
    }
  }, [recommendedContent, loadedItems.length])

  // Load more items when reaching the end
  const loadMoreItems = () => {
    if (isLoading || isRecommendationsLoading) return

    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      const currentIds = new Set(loadedItems.map((item) => item.id))

      // Get next batch of recommended items that aren't already loaded
      const nextItems = recommendedContent
        .map((item) => item.item)
        .filter((item) => !currentIds.has(item.id))
        .slice(0, 3)

      if (nextItems.length > 0) {
        setLoadedItems((prev) => [...prev, ...nextItems])
      } else {
        // If we've reached the end of recommendations, loop back to the beginning
        setLoadedItems((prev) => [...prev, ...recommendedContent.slice(0, 3).map((item) => item.item)])
      }

      setIsLoading(false)
    }, 1500)
  }

  // Set up intersection observer for infinite scroll
  const { ref: endOfListRef, inView } = useInView({
    threshold: 0.5,
  })

  // Load more items when reaching the end of the list
  useEffect(() => {
    if (inView) {
      loadMoreItems()
    }
  }, [inView])

  // Handle like action
  const handleLike = (item: ContentItem) => {
    handleLikeContent(item)
    // In a real app, this would call an API to like the content
  }

  // Handle save action
  const handleSave = (item: ContentItem) => {
    setSelectedItem(item)
    setIsSaveModalOpen(true)
  }

  // Handle comments action
  const handleComments = (item: ContentItem) => {
    setSelectedItem(item)
    setIsCommentsOpen(true)
  }

  // Handle share action
  const handleShare = (item: ContentItem) => {
    // In a real app, this would open a share dialog
    alert(`Sharing "${item.title}"`)
  }

  // Handle saving to a board
  const handleSaveToBoard = (boardId: string) => {
    if (selectedItem) {
      handleSaveContent(selectedItem)
    }
    setIsSaveModalOpen(false)
    // In a real app, this would save the item to the selected board
  }

  // Handle saving to planner
  const handleSaveToPlanner = (plannerId: string) => {
    if (selectedItem) {
      handleSaveContent(selectedItem)
    }
    setIsSaveModalOpen(false)
    // In a real app, this would save the item to the selected planner item
  }

  // Scroll to the next item
  const scrollToNext = () => {
    if (currentIndex < loadedItems.length - 1) {
      setCurrentIndex(currentIndex + 1)
      scrollContainerRef.current?.children[currentIndex + 1]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }

  // Scroll to the previous item
  const scrollToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      scrollContainerRef.current?.children[currentIndex - 1]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 flex flex-col">
        <div className="container px-4 py-4 md:py-6">
          <Tabs defaultValue="for-you" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1"></div>
              <TabsList>
                <TabsTrigger value="for-you">For You</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
              </TabsList>
              <div className="flex-1 flex justify-end">
                <PreferenceSelector
                  preferences={preferences}
                  onUpdatePreferences={updatePreferences}
                  trigger={
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <Filter className="h-4 w-4" />
                      <span className="hidden sm:inline">Customize</span>
                    </Button>
                  }
                />
              </div>
            </div>

            <TabsContent value="for-you" className="mt-0">
              {isRecommendationsLoading && loadedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Skeleton className="h-8 w-64 mb-4" />
                  <Skeleton className="h-4 w-48 mb-8" />
                  <div className="space-y-8 w-full max-w-3xl">
                    <ScrollCardSkeleton />
                    <ScrollCardSkeleton />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Personalization indicator */}
                  <div className="flex items-center justify-center mb-6 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 mr-2 text-primary" />
                    <span>Content personalized based on your preferences</span>
                  </div>

                  {/* Navigation buttons */}
                  <div className="hidden md:block fixed right-8 bottom-1/2 transform translate-y-1/2 z-10">
                    <div className="flex flex-col gap-4">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full shadow-lg"
                        onClick={scrollToPrevious}
                        disabled={currentIndex === 0}
                      >
                        <ChevronUp className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full shadow-lg"
                        onClick={scrollToNext}
                        disabled={currentIndex >= loadedItems.length - 1}
                      >
                        <ChevronDown className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Scroll feed */}
                  <div className="flex flex-col gap-8 items-center pb-8" ref={scrollContainerRef}>
                    {loadedItems.map((item, index) => {
                      // Create a ref callback for the last item to detect when we need to load more
                      const isLastItem = index === loadedItems.length - 1

                      return (
                        <div
                          key={`${item.id}-${index}`}
                          className="w-full max-w-3xl"
                          ref={isLastItem ? endOfListRef : null}
                        >
                          <ScrollCard
                            item={item}
                            onLike={() => handleLike(item)}
                            onSave={() => handleSave(item)}
                            onComment={() => handleComments(item)}
                            onShare={() => handleShare(item)}
                            isLiked={isContentLiked(item.id)}
                            isSaved={isContentSaved(item.id)}
                            matchScore={recommendedContent.find((rec) => rec.item.id === item.id)?.score}
                          />
                        </div>
                      )
                    })}

                    {/* Loading indicator */}
                    {isLoading && (
                      <div className="w-full max-w-3xl">
                        <ScrollCardSkeleton />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="following" className="mt-0">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="Following"
                  width={200}
                  height={200}
                  className="mb-6"
                />
                <h3 className="text-xl font-semibold mb-2">Follow your favorite creators</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Follow homeschool creators, educators, and other parents to see their content in your feed.
                </p>
                <Button>Discover Creators</Button>
              </div>
            </TabsContent>

            <TabsContent value="trending" className="mt-0">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="Trending"
                  width={200}
                  height={200}
                  className="mb-6"
                />
                <h3 className="text-xl font-semibold mb-2">Trending content coming soon</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  We're gathering the most popular homeschool content. Check back soon!
                </p>
                <Button>Explore For You</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Save to Board/Planner Modal */}
      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save to</DialogTitle>
            <DialogDescription>Save this content to a board or add it to your planner.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="boards" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="boards" className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Boards
              </TabsTrigger>
              <TabsTrigger value="planner" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Planner
              </TabsTrigger>
            </TabsList>

            <TabsContent value="boards" className="mt-4">
              <ScrollArea className="h-[300px]">
                <div className="grid grid-cols-1 gap-4 p-1">
                  {userBoards.map((board) => (
                    <div
                      key={board.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => handleSaveToBoard(board.id)}
                    >
                      <div
                        className="w-12 h-12 rounded-md bg-cover bg-center"
                        style={{ backgroundImage: `url(${board.coverImage})` }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{board.title}</h4>
                        <p className="text-xs text-muted-foreground">{board.itemCount} items</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button variant="outline" className="mt-2 w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Board
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="planner" className="mt-4">
              <ScrollArea className="h-[300px]">
                <div className="grid grid-cols-1 gap-4 p-1">
                  {plannerItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => handleSaveToPlanner(item.id)}
                    >
                      <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {item.date} • {item.subject}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button variant="outline" className="mt-2 w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add to New Planner Item
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsSaveModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comments Modal */}
      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="mt-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarImage src={selectedItem.author.avatar || "/placeholder.svg"} alt={selectedItem.author.name} />
                  <AvatarFallback>{selectedItem.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{selectedItem.author.name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-1">{selectedItem.title}</p>
                </div>
              </div>

              <ScrollArea className="h-[300px] border rounded-md p-4">
                <div className="space-y-4">
                  {/* Sample comments */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${i}`} />
                        <AvatarFallback>U{i}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">User {i}</span>
                          <span className="text-xs text-muted-foreground">2 days ago</span>
                        </div>
                        <p className="text-sm mt-1">
                          This is a great resource! I used it with my kids and they loved it.
                          {i % 2 === 0 ? " We'll definitely be using this again in our homeschool." : ""}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <button className="text-xs text-muted-foreground hover:text-foreground">Like</button>
                          <button className="text-xs text-muted-foreground hover:text-foreground">Reply</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex items-center gap-3 mt-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || "/placeholder.svg?height=32&width=32"} />
                  <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="w-full rounded-full border px-4 py-2 text-sm"
                  />
                  <Button size="sm" className="absolute right-1 top-1 h-6 rounded-full">
                    Post
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Scroll Card Component
function ScrollCard({ item, onLike, onSave, onComment, onShare, isLiked, isSaved, matchScore }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border rounded-xl overflow-hidden bg-card"
    >
      <div className="relative aspect-[4/3] md:aspect-[16/9] overflow-hidden">
        <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />

        {/* Type badge */}
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="capitalize">
            {item.type}
          </Badge>
        </div>

        {/* Match score badge */}
        {matchScore && (
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {matchScore}% Match
            </Badge>
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <Button
            variant={isLiked ? "default" : "secondary"}
            size="icon"
            className="rounded-full h-10 w-10 shadow-lg"
            onClick={onLike}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
          </Button>
          <Button
            variant={isSaved ? "default" : "secondary"}
            size="icon"
            className="rounded-full h-10 w-10 shadow-lg"
            onClick={onSave}
          >
            <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
          </Button>
          <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 shadow-lg" onClick={onComment}>
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 shadow-lg" onClick={onShare}>
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar>
            <AvatarImage src={item.author.avatar || "/placeholder.svg"} alt={item.author.name} />
            <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium">{item.author.name}</h4>
            {item.type === "board" && <p className="text-xs text-muted-foreground">{item.items} items</p>}
          </div>
          <Button variant="ghost" size="sm" className="ml-auto">
            Follow
          </Button>
        </div>

        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
        <p className="text-muted-foreground mb-4">{item.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" /> {item.stats.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" /> {item.stats.comments}
            </span>
            <span className="flex items-center gap-1">
              <Bookmark className="h-4 w-4" /> {item.stats.saves}
            </span>
          </div>

          {item.type === "resource" && (
            <Button size="sm" variant="outline">
              View Resource
            </Button>
          )}
          {item.type === "board" && (
            <Button size="sm" variant="outline">
              View Board
            </Button>
          )}
          {item.type === "community" && (
            <Button size="sm" variant="outline">
              Read More
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Skeleton loader for scroll cards
function ScrollCardSkeleton() {
  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      <Skeleton className="aspect-[4/3] md:aspect-[16/9] w-full" />
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-4" />
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <div className="flex justify-between">
          <div className="flex gap-3">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
    </div>
  )
}
