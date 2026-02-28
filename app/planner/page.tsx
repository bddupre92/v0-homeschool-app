"use client"

import { useState, useEffect, useCallback } from "react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from "date-fns"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Filter,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Share2,
  Users,
  Bot,
  FileCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Navigation from "@/components/navigation"
import AICurriculumWorkflow from "@/components/ai-curriculum-workflow"
import LessonPacketsTab from "@/components/lesson-packets-tab"
import { getLessons, createLesson, deleteLesson, toggleLessonCompletion } from "@/app/actions/planner-actions"
import { toast } from "@/hooks/use-toast"

// Sample data for the planner
const subjects = [
  { id: "math", name: "Math", color: "bg-blue-500" },
  { id: "science", name: "Science", color: "bg-green-500" },
  { id: "language", name: "Language Arts", color: "bg-purple-500" },
  { id: "history", name: "History", color: "bg-amber-500" },
  { id: "art", name: "Art", color: "bg-pink-500" },
  { id: "music", name: "Music", color: "bg-indigo-500" },
  { id: "pe", name: "Physical Education", color: "bg-red-500" },
  { id: "foreign", name: "Foreign Language", color: "bg-cyan-500" },
]

export default function PlannerPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState("week")
  const [selectedLesson, setSelectedLesson] = useState<any>(null)
  const [isAddingLesson, setIsAddingLesson] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filteredSubjects, setFilteredSubjects] = useState(subjects.map((s) => s.id))
  const [lessons, setLessons] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeletingLesson, setIsDeletingLesson] = useState(false)

  const loadLessons = useCallback(async () => {
    try {
      const result = await getLessons()
      if (result.success && result.lessons) {
        setLessons(
          result.lessons.map((lesson: any) => ({
            ...lesson,
            date: new Date(lesson.date),
          }))
        )
      }
    } catch (error) {
      console.error("Error loading lessons:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLessons()
  }, [loadLessons])

  const handleCreateLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const form = e.currentTarget
      const formData = new FormData(form)
      const result = await createLesson(formData)

      if (result.success) {
        toast({ title: "Success", description: "Lesson added to your planner!" })
        setIsAddingLesson(false)
        form.reset()
        loadLessons()
      } else {
        toast({ title: "Error", description: result.error || "Failed to add lesson", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error creating lesson:", error)
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    setIsDeletingLesson(true)
    try {
      const result = await deleteLesson(lessonId)
      if (result.success) {
        toast({ title: "Success", description: "Lesson deleted" })
        setSelectedLesson(null)
        loadLessons()
      } else {
        toast({ title: "Error", description: result.error || "Failed to delete lesson", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error deleting lesson:", error)
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setIsDeletingLesson(false)
    }
  }

  const handleToggleCompletion = async (lessonId: string) => {
    try {
      const result = await toggleLessonCompletion(lessonId)
      if (result.success) {
        // Update local state immediately
        setLessons((prev) =>
          prev.map((l) => (l.id === lessonId ? { ...l, completed: result.completed } : l))
        )
        if (selectedLesson?.id === lessonId) {
          setSelectedLesson((prev: any) => prev ? { ...prev, completed: result.completed } : null)
        }
      }
    } catch (error) {
      console.error("Error toggling completion:", error)
    }
  }

  // Week navigation
  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 })
  const endDate = endOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = eachDayOfInterval({ start: startDate, end: endDate })

  const handlePreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1))
  }

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1))
  }

  const toggleSubjectFilter = (subjectId) => {
    setFilteredSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId],
    )
  }

  // Filter lessons by selected subjects and current week
  const filteredLessons = lessons.filter(
    (lesson) =>
      filteredSubjects.includes(lesson.subject) &&
      lesson.date >= startOfWeek(currentDate) &&
      lesson.date <= endOfWeek(currentDate),
  )

  // Group lessons by day for week view
  const lessonsByDay = weekDays.map((day) => ({
    date: day,
    lessons: filteredLessons.filter((lesson) => isSameDay(lesson.date, day)),
  }))

  const getSubjectById = (id) => subjects.find((subject) => subject.id === id)

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Homeschool Planner</h1>
              <p className="text-muted-foreground">
                Plan, schedule, and track your homeschool curriculum and activities
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => setIsAddingLesson(true)} className="gap-1">
                <Plus className="h-4 w-4" />
                Add Lesson
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1 bg-transparent">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Share Planner</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" />
                    Invite Collaborators
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Export to Calendar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-1 bg-transparent">
                    <Filter className="h-4 w-4" />
                    Filter
                    {filteredSubjects.length !== subjects.length && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                        {filteredSubjects.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium">Filter by Subject</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {subjects.map((subject) => (
                        <div key={subject.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`filter-${subject.id}`}
                            checked={filteredSubjects.includes(subject.id)}
                            onCheckedChange={() => toggleSubjectFilter(subject.id)}
                          />
                          <Label
                            htmlFor={`filter-${subject.id}`}
                            className="flex items-center text-sm font-normal cursor-pointer"
                          >
                            <div className={`w-3 h-3 rounded-full ${subject.color} mr-2`}></div>
                            {subject.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilteredSubjects(subjects.map((s) => s.id))}
                      >
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setFilteredSubjects([])}>
                        Clear All
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Tabs defaultValue="week" onValueChange={setViewMode} className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <TabsList>
                <TabsTrigger value="week" className="flex items-center gap-1">
                  <LayoutGrid className="h-4 w-4" />
                  Week
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-1">
                  <List className="h-4 w-4" />
                  List
                </TabsTrigger>
                <TabsTrigger value="curriculum" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Curriculum
                </TabsTrigger>
                <TabsTrigger value="ai-builder" className="flex items-center gap-1">
                  <Bot className="h-4 w-4" />
                  AI Builder
                </TabsTrigger>
                <TabsTrigger value="lesson-packets" className="flex items-center gap-1">
                  <FileCheck className="h-4 w-4" />
                  Lesson Packets
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">
                  {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
                </div>
                <Button variant="outline" size="icon" onClick={handleNextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2 bg-transparent"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
              </div>
            </div>

            <TabsContent value="week" className="mt-0">
              <div className="grid grid-cols-7 gap-4">
                {lessonsByDay.map((day, index) => (
                  <div key={index} className="flex flex-col">
                    <div
                      className={`text-center p-2 rounded-t-lg font-medium text-sm ${
                        isSameDay(day.date, new Date()) ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <div>{format(day.date, "EEE")}</div>
                      <div>{format(day.date, "MMM d")}</div>
                    </div>
                    <div className="flex-1 border rounded-b-lg p-2 space-y-2 min-h-[300px]">
                      {day.lessons.length > 0 ? (
                        day.lessons.map((lesson) => {
                          const subject = getSubjectById(lesson.subject)
                          return (
                            <div
                              key={lesson.id}
                              className="p-2 rounded-lg border cursor-pointer hover:bg-muted transition-colors"
                              onClick={() => setSelectedLesson(lesson)}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${subject.color}`}></div>
                                <span className="font-medium text-sm truncate">{lesson.title}</span>
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {format(lesson.date, "h:mm a")} ({lesson.duration} min)
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                          No lessons
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list" className="mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Scheduled Lessons</CardTitle>
                  <CardDescription>All your planned lessons for the current week</CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredLessons.length > 0 ? (
                    <div className="space-y-4">
                      {filteredLessons
                        .sort((a, b) => a.date - b.date)
                        .map((lesson) => {
                          const subject = getSubjectById(lesson.subject)
                          return (
                            <div
                              key={lesson.id}
                              className="flex items-start gap-4 p-3 border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                              onClick={() => setSelectedLesson(lesson)}
                            >
                              <div className={`w-1 self-stretch ${subject.color} rounded-full`}></div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium">{lesson.title}</h3>
                                  <Badge variant="outline">{subject.name}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                    {format(lesson.date, "EEEE, MMM d")}
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                    {format(lesson.date, "h:mm a")} ({lesson.duration} min)
                                  </div>
                                </div>
                              </div>
                              <Checkbox
                                checked={lesson.completed}
                                onCheckedChange={(e) => {
                                  e.stopPropagation?.()
                                  handleToggleCompletion(lesson.id)
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          )
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No lessons scheduled</h3>
                      <p className="text-muted-foreground mb-4">You don't have any lessons scheduled for this week.</p>
                      <Button onClick={() => setIsAddingLesson(true)}>Add Your First Lesson</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="curriculum" className="mt-0">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Curriculum Resources</CardTitle>
                    <CardDescription>Track progress in your purchased curriculum</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {curriculumResources.map((resource) => {
                        const subject = getSubjectById(resource.subject)
                        const progressPercentage = Math.round((resource.progress / resource.lessons) * 100)
                        return (
                          <div key={resource.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium">{resource.title}</h3>
                              <Badge variant="outline" className={`${subject.color} bg-opacity-20`}>
                                {subject.name}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                            <div className="text-sm mb-2">
                              Progress: {resource.progress} of {resource.lessons} lessons ({progressPercentage}%)
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full ${subject.color}`}
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                              <div className="text-xs text-muted-foreground">Publisher: {resource.publisher}</div>
                              <Button variant="outline" size="sm">
                                View Lessons
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full bg-transparent">
                      Add Curriculum
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Collaborators</CardTitle>
                    <CardDescription>People you're sharing your planner with</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {collaborators.map((collaborator) => (
                        <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={collaborator.avatar || "/placeholder.svg"} alt={collaborator.name} />
                              <AvatarFallback>
                                {collaborator.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{collaborator.name}</div>
                              <div className="text-sm text-muted-foreground">{collaborator.role}</div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Manage
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full gap-1 bg-transparent">
                      <Plus className="h-4 w-4" />
                      Invite Collaborator
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="ai-builder" className="mt-0">
              <AICurriculumWorkflow />
            </TabsContent>
            <TabsContent value="lesson-packets" className="mt-0">
              <LessonPacketsTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Add Lesson Dialog */}
      <Dialog open={isAddingLesson} onOpenChange={setIsAddingLesson}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Lesson</DialogTitle>
            <DialogDescription>Create a new lesson or activity for your homeschool schedule.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateLesson}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Lesson Title *</Label>
                <Input id="title" name="title" placeholder="Enter lesson title" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select name="subject" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Subjects</SelectLabel>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full ${subject.color} mr-2`}></div>
                              {subject.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input id="duration" name="duration" type="number" placeholder="45" min="5" step="5" defaultValue="45" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" name="date" type="date" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" name="time" type="time" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Enter lesson description" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="materials">Materials Needed</Label>
                <Textarea id="materials" name="materials" placeholder="List materials needed, one per line" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddingLesson(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Lesson"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lesson Details Dialog */}
      <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
        {selectedLesson && (
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getSubjectById(selectedLesson.subject).color}`}></div>
                <DialogTitle>{selectedLesson.title}</DialogTitle>
              </div>
              <DialogDescription>
                {format(selectedLesson.date, "EEEE, MMMM d, yyyy")} at {format(selectedLesson.date, "h:mm a")} (
                {selectedLesson.duration} minutes)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm">{selectedLesson.description}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Subject</h4>
                <Badge variant="outline">{getSubjectById(selectedLesson.subject).name}</Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Materials Needed</h4>
                <ul className="text-sm space-y-1 list-disc pl-5">
                  {selectedLesson.materials.map((material, index) => (
                    <li key={index}>{material}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="completed"
                  checked={selectedLesson.completed}
                  onCheckedChange={() => handleToggleCompletion(selectedLesson.id)}
                />
                <Label htmlFor="completed">Mark as completed</Label>
              </div>
            </div>
            <DialogFooter className="flex justify-between sm:justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive bg-transparent"
                  onClick={() => handleDeleteLesson(selectedLesson.id)}
                  disabled={isDeletingLesson}
                >
                  {isDeletingLesson ? "Deleting..." : "Delete"}
                </Button>
              </div>
              <Button onClick={() => setSelectedLesson(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
