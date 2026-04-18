"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { BookOpen, Filter, Grid3X3, List, Plus, Search, Download, Star, Clock, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import Navigation from "@/components/navigation"
import { getResources, createResource, toggleSaveResource, getSavedResources } from "@/app/actions/resource-actions"
import { toast } from "@/hooks/use-toast"

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
    grades: [] as string[],
    subjects: [] as string[],
    types: [] as string[],
  })
  const [sortBy, setSortBy] = useState("featured")
  const [activeTab, setActiveTab] = useState("all")
  const [resources, setResources] = useState<any[]>([])
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadResources = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await getResources({ sortBy })
      if (result.success && result.resources.length > 0) {
        setResources(result.resources)
      }
      // Also load saved resources
      const savedResult = await getSavedResources()
      if (savedResult.success && savedResult.savedIds) {
        setSavedIds(savedResult.savedIds)
      }
    } catch (error) {
      console.error("Error loading resources:", error)
    } finally {
      setIsLoading(false)
    }
  }, [sortBy])

  useEffect(() => {
    loadResources()
  }, [loadResources])

  const handleCreateResource = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const form = e.currentTarget
      const formData = new FormData(form)
      const result = await createResource(formData)

      if (result.success) {
        toast({ title: "Success", description: "Resource submitted successfully!" })
        setIsCreateDialogOpen(false)
        form.reset()
        loadResources()
      } else {
        toast({ title: "Error", description: result.error || "Failed to submit resource", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error creating resource:", error)
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

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
    <div className="min-h-screen flex flex-col bg-[var(--linen)] text-[var(--ink)]">
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
              onClick={() => setIsCreateDialogOpen(true)}
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
              {sortedResources.filter((r) => savedIds.includes(r.id)).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedResources
                    .filter((r) => savedIds.includes(r.id))
                    .map((resource) => (
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
                              {resource.tags.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No saved resources</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't saved any resources yet. Browse resources and save them for later.
                  </p>
                  <Button onClick={() => setActiveTab("all")}>Browse Resources</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </main>

      {/* Create Resource Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Submit a Resource</DialogTitle>
            <DialogDescription>
              Share a resource with the homeschool community.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateResource}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="res-title">Title *</Label>
                <Input id="res-title" name="title" placeholder="Enter resource title" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="res-description">Description</Label>
                <Textarea id="res-description" name="description" placeholder="Describe the resource" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="res-type">Type *</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="res-author">Author</Label>
                  <Input id="res-author" name="author" placeholder="Author or publisher" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="res-tags">Tags (comma separated)</Label>
                <Input id="res-tags" name="tags" placeholder="e.g., Math, Elementary, Hands-on" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="res-thumbnail">Thumbnail URL</Label>
                <Input id="res-thumbnail" name="thumbnail" placeholder="Enter image URL (optional)" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Resource"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
