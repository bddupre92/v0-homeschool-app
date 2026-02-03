"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Filter, Grid3X3, List, Plus, Search, Download, Star, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Navigation from "@/components/navigation"

// Sample resource data
const resources = [
  {
    id: "r1",
    title: "Hands-on Fractions Activities",
    description: "Fun and engaging activities to teach fractions to elementary students",
    type: "activity",
    tags: ["Math", "Elementary", "Hands-on"],
    author: "Math Learning Center",
    rating: 4.8,
    downloads: 1245,
    dateAdded: "2025-03-15",
    isFeatured: true,
    isPremium: false,
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "r2",
    title: "Nature Journal Templates",
    description: "Printable templates for nature study journals",
    type: "printable",
    tags: ["Science", "Charlotte Mason", "Printable"],
    author: "Nature Study Collective",
    rating: 4.6,
    downloads: 987,
    dateAdded: "2025-03-20",
    isFeatured: true,
    isPremium: false,
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "r3",
    title: "History Timeline Project",
    description: "Create an interactive history timeline with your students",
    type: "project",
    tags: ["History", "All Ages", "Interactive"],
    author: "Classical Conversations",
    rating: 4.7,
    downloads: 756,
    dateAdded: "2025-03-25",
    isFeatured: false,
    isPremium: false,
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "r4",
    title: "Reading Comprehension Worksheets",
    description: "Printable worksheets to improve reading comprehension skills",
    type: "worksheet",
    tags: ["Language Arts", "Elementary", "Printable"],
    author: "Reading Success",
    rating: 4.5,
    downloads: 1876,
    dateAdded: "2025-03-10",
    isFeatured: false,
    isPremium: false,
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "r5",
    title: "Science Experiment: Water Cycle in a Bag",
    description: "Easy demonstration of the water cycle using household items",
    type: "activity",
    tags: ["Science", "Elementary", "Hands-on"],
    author: "Science Explorers",
    rating: 4.9,
    downloads: 2341,
    dateAdded: "2025-04-01",
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
    rating: 4.7,
    downloads: 1543,
    dateAdded: "2025-03-18",
    isFeatured: false,
    isPremium: true,
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "r7",
    title: "Poetry Analysis Guide",
    description: "Guide to analyzing and understanding poetry for middle and high school students",
    type: "guide",
    tags: ["Language Arts", "Middle School", "High School"],
    author: "Literary Scholars",
    rating: 4.6,
    downloads: 876,
    dateAdded: "2025-03-22",
    isFeatured: false,
    isPremium: true,
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "r8",
    title: "Ancient Egypt Unit Study",
    description: "Comprehensive unit study on Ancient Egypt with activities and resources",
    type: "unit study",
    tags: ["History", "Elementary", "Middle School"],
    author: "Historical Homeschoolers",
    rating: 4.8,
    downloads: 1234,
    dateAdded: "2025-03-28",
    isFeatured: true,
    isPremium: true,
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
]

// Filter categories
const grades = ["Preschool", "Kindergarten", "Elementary", "Middle School", "High School"]
const subjects = [
  "Math",
  "Science",
  "Language Arts",
  "History",
  "Art",
  "Music",
  "Physical Education",
  "Foreign Language",
  "Technology",
]
const resourceTypes = ["Printable", "Activity", "Worksheet", "Unit Study", "Guide", "Interactive", "Project"]

export default function ResourcesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState({
    grades: [],
    subjects: [],
    types: [],
  })
  const [sortBy, setSortBy] = useState("featured")
  const [activeTab, setActiveTab] = useState("all")

  const handleFilterChange = (category, value) => {
    setSelectedFilters((prev) => {
      const currentValues = [...prev[category]]
      const index = currentValues.indexOf(value)

      if (index === -1) {
        currentValues.push(value)
      } else {
        currentValues.splice(index, 1)
      }

      return {
        ...prev,
        [category]: currentValues,
      }
    })
  }

  const clearFilters = () => {
    setSelectedFilters({
      grades: [],
      subjects: [],
      types: [],
    })
  }

  // Filter resources based on search query and selected filters
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesGrades =
      selectedFilters.grades.length === 0 || selectedFilters.grades.some((grade) => resource.tags.includes(grade))

    const matchesSubjects =
      selectedFilters.subjects.length === 0 ||
      selectedFilters.subjects.some((subject) => resource.tags.includes(subject))

    const matchesTypes =
      selectedFilters.types.length === 0 ||
      selectedFilters.types.some((type) => resource.type.toLowerCase() === type.toLowerCase())

    return matchesSearch && matchesGrades && matchesSubjects && matchesTypes
  })

  // Sort resources based on selected sort option
  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
      case "popular":
        return b.downloads - a.downloads
      case "rating":
        return b.rating - a.rating
      case "featured":
      default:
        return b.isFeatured ? 1 : -1
    }
  })

  const activeFilterCount =
    selectedFilters.grades.length + selectedFilters.subjects.length + selectedFilters.types.length

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Resources</h1>
              <p className="text-muted-foreground">
                Discover and download high-quality homeschool resources for all ages and subjects
              </p>
            </div>

            <Button 
              className="gap-1 sm:self-start"
              onClick={() => {
                // Navigate to resource submission form or open modal
                console.log('Opening resource submission form')
                alert('Resource submission form would open here')
              }}
            >
              <Plus className="h-4 w-4" />
              Submit Resource
            </Button>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <TabsList>
                <TabsTrigger value="all">All Resources</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="premium">Premium</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    className="rounded-r-none"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                    <span className="sr-only">Grid view</span>
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    className="rounded-l-none"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                    <span className="sr-only">List view</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search resources..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-1">
                      <Filter className="h-4 w-4" />
                      Filter
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Grade Levels</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {grades.map((grade) => (
                            <div key={grade} className="flex items-center space-x-2">
                              <Checkbox
                                id={`grade-${grade}`}
                                checked={selectedFilters.grades.includes(grade)}
                                onCheckedChange={() => handleFilterChange("grades", grade)}
                              />
                              <Label htmlFor={`grade-${grade}`} className="text-sm font-normal cursor-pointer">
                                {grade}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Subjects</h4>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                          {subjects.map((subject) => (
                            <div key={subject} className="flex items-center space-x-2">
                              <Checkbox
                                id={`subject-${subject}`}
                                checked={selectedFilters.subjects.includes(subject)}
                                onCheckedChange={() => handleFilterChange("subjects", subject)}
                              />
                              <Label htmlFor={`subject-${subject}`} className="text-sm font-normal cursor-pointer">
                                {subject}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Resource Types</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {resourceTypes.map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                id={`type-${type}`}
                                checked={selectedFilters.types.includes(type)}
                                onCheckedChange={() => handleFilterChange("types", type)}
                              />
                              <Label htmlFor={`type-${type}`} className="text-sm font-normal cursor-pointer">
                                {type}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {activeFilterCount > 0 && (
                        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                          Clear All Filters
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <TabsContent value="all" className="mt-0">
              {sortedResources.length > 0 ? (
                viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedResources.map((resource) => (
                      <Link key={resource.id} href={`/resources/${resource.id}`} className="block">
                        <Card className="h-full overflow-hidden hover:shadow-md transition-shadow resource-card">
                          <div className="aspect-video relative">
                            <img
                              src={resource.thumbnail || "/placeholder.svg"}
                              alt={resource.title}
                              className="w-full h-full object-cover"
                            />
                            {resource.isPremium && (
                              <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">
                                Premium
                              </Badge>
                            )}
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
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Star className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                                {resource.rating}
                              </div>
                              <div className="flex items-center">
                                <Download className="h-3.5 w-3.5 mr-1" />
                                {resource.downloads}
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="p-4 pt-2 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{resource.author}</span>
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </CardFooter>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedResources.map((resource) => (
                      <Link key={resource.id} href={`/resources/${resource.id}`} className="block">
                        <Card className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/4 aspect-video md:aspect-auto md:h-auto">
                              <img
                                src={resource.thumbnail || "/placeholder.svg"}
                                alt={resource.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-bold text-lg">{resource.title}</h3>
                                  <p className="text-muted-foreground mt-1">{resource.description}</p>
                                </div>
                                {resource.isPremium && (
                                  <Badge className="bg-secondary text-secondary-foreground">Premium</Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1 mt-3">
                                {resource.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center">
                                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                    {resource.rating}
                                  </div>
                                  <div className="flex items-center">
                                    <Download className="h-4 w-4 mr-1" />
                                    {resource.downloads}
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {new Date(resource.dateAdded).toLocaleDateString()}
                                  </div>
                                </div>
                                <Button size="sm">View Resource</Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No resources found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || activeFilterCount > 0
                      ? "Try adjusting your search or filters to find more resources"
                      : "There are no resources available at the moment"}
                  </p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="featured" className="mt-0">
              {sortedResources.filter((r) => r.isFeatured).length > 0 ? (
                viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedResources
                      .filter((r) => r.isFeatured)
                      .map((resource) => (
                        <Link key={resource.id} href={`/resources/${resource.id}`} className="block">
                          <Card className="h-full overflow-hidden hover:shadow-md transition-shadow resource-card">
                            <div className="aspect-video relative">
                              <img
                                src={resource.thumbnail || "/placeholder.svg"}
                                alt={resource.title}
                                className="w-full h-full object-cover"
                              />
                              {resource.isPremium && (
                                <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">
                                  Premium
                                </Badge>
                              )}
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
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Star className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                                  {resource.rating}
                                </div>
                                <div className="flex items-center">
                                  <Download className="h-3.5 w-3.5 mr-1" />
                                  {resource.downloads}
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-2 flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{resource.author}</span>
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </CardFooter>
                          </Card>
                        </Link>
                      ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedResources
                      .filter((r) => r.isFeatured)
                      .map((resource) => (
                        <Link key={resource.id} href={`/resources/${resource.id}`} className="block">
                          <Card className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row">
                              <div className="md:w-1/4 aspect-video md:aspect-auto md:h-auto">
                                <img
                                  src={resource.thumbnail || "/placeholder.svg"}
                                  alt={resource.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-bold text-lg">{resource.title}</h3>
                                    <p className="text-muted-foreground mt-1">{resource.description}</p>
                                  </div>
                                  {resource.isPremium && (
                                    <Badge className="bg-secondary text-secondary-foreground">Premium</Badge>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {resource.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                      {resource.rating}
                                    </div>
                                    <div className="flex items-center">
                                      <Download className="h-4 w-4 mr-1" />
                                      {resource.downloads}
                                    </div>
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-1" />
                                      {new Date(resource.dateAdded).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <Button size="sm">View Resource</Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      ))}
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No featured resources found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || activeFilterCount > 0
                      ? "Try adjusting your search or filters to find featured resources"
                      : "There are no featured resources available at the moment"}
                  </p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="premium" className="mt-0">
              {sortedResources.filter((r) => r.isPremium).length > 0 ? (
                viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedResources
                      .filter((r) => r.isPremium)
                      .map((resource) => (
                        <Link key={resource.id} href={`/resources/${resource.id}`} className="block">
                          <Card className="h-full overflow-hidden hover:shadow-md transition-shadow resource-card">
                            <div className="aspect-video relative">
                              <img
                                src={resource.thumbnail || "/placeholder.svg"}
                                alt={resource.title}
                                className="w-full h-full object-cover"
                              />
                              <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">
                                Premium
                              </Badge>
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
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Star className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                                  {resource.rating}
                                </div>
                                <div className="flex items-center">
                                  <Download className="h-3.5 w-3.5 mr-1" />
                                  {resource.downloads}
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-2 flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{resource.author}</span>
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </CardFooter>
                          </Card>
                        </Link>
                      ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedResources
                      .filter((r) => r.isPremium)
                      .map((resource) => (
                        <Link key={resource.id} href={`/resources/${resource.id}`} className="block">
                          <Card className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row">
                              <div className="md:w-1/4 aspect-video md:aspect-auto md:h-auto">
                                <img
                                  src={resource.thumbnail || "/placeholder.svg"}
                                  alt={resource.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-bold text-lg">{resource.title}</h3>
                                    <p className="text-muted-foreground mt-1">{resource.description}</p>
                                  </div>
                                  <Badge className="bg-secondary text-secondary-foreground">Premium</Badge>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {resource.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                      {resource.rating}
                                    </div>
                                    <div className="flex items-center">
                                      <Download className="h-4 w-4 mr-1" />
                                      {resource.downloads}
                                    </div>
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-1" />
                                      {new Date(resource.dateAdded).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <Button size="sm">View Resource</Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      ))}
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No premium resources found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || activeFilterCount > 0
                      ? "Try adjusting your search or filters to find premium resources"
                      : "There are no premium resources available at the moment"}
                  </p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved" className="mt-0">
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No saved resources</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't saved any resources yet. Browse resources and save them for later.
                </p>
                <Button onClick={() => document.querySelector('[value="all"]')?.click()}>Browse Resources</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
