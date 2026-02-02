"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
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
  Plus,
  Share2,
  Users,
  Bot,
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
import { loadFromStorage, saveToStorage } from "@/lib/local-storage"

const PLANNER_STORAGE_KEY = "plannerLessons"

type Lesson = {
  id: string
  title: string
  subject: string
  date: Date
  duration: number
  description: string
  materials: string[]
  completed: boolean
  source?: "sample" | "user"
}

type LessonFormState = {
  title: string
  subject: string
  duration: string
  date: string
  time: string
  description: string
  materials: string
}

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

// Sample lesson plans
const sampleLessons: Lesson[] = [
  {
    id: "1",
    title: "Fractions Introduction",
    subject: "math",
    date: new Date(2025, 3, 15, 9, 0),
    duration: 45,
    description: "Introduction to basic fractions with hands-on activities",
    materials: ["Fraction tiles", "Worksheets", "Colored paper"],
    completed: false,
  },
  {
    id: "2",
    title: "Plant Life Cycle",
    subject: "science",
    date: new Date(2025, 3, 15, 10, 0),
    duration: 60,
    description: "Exploring the stages of plant growth with bean sprouting experiment",
    materials: ["Bean seeds", "Paper towels", "Plastic bags", "Science journal"],
    completed: false,
  },
  {
    id: "3",
    title: "Poetry Analysis",
    subject: "language",
    date: new Date(2025, 3, 16, 9, 0),
    duration: 45,
    description: "Reading and analyzing poems by Robert Frost",
    materials: ["Poetry anthology", "Notebooks", "Highlighters"],
    completed: false,
  },
  {
    id: "4",
    title: "Ancient Egypt",
    subject: "history",
    date: new Date(2025, 3, 16, 11, 0),
    duration: 60,
    description: "Introduction to Ancient Egyptian civilization and hieroglyphics",
    materials: ["History textbook", "Hieroglyphic chart", "Paper and markers"],
    completed: false,
  },
  {
    id: "5",
    title: "Watercolor Techniques",
    subject: "art",
    date: new Date(2025, 3, 17, 13, 0),
    duration: 90,
    description: "Learning basic watercolor painting techniques",
    materials: ["Watercolor paints", "Brushes", "Watercolor paper", "Water containers"],
    completed: false,
  },
  {
    id: "6",
    title: "Multiplication Tables",
    subject: "math",
    date: new Date(2025, 3, 17, 9, 0),
    duration: 30,
    description: "Practice multiplication tables 1-12",
    materials: ["Flashcards", "Multiplication chart", "Math workbook"],
    completed: false,
  },
  {
    id: "7",
    title: "Reading Comprehension",
    subject: "language",
    date: new Date(2025, 3, 18, 10, 0),
    duration: 45,
    description: "Reading and discussing 'Charlotte's Web' chapters 5-7",
    materials: ["Charlotte's Web book", "Reading journal", "Vocabulary list"],
    completed: false,
  },
  {
    id: "8",
    title: "Simple Machines",
    subject: "science",
    date: new Date(2025, 3, 19, 11, 0),
    duration: 60,
    description: "Exploring levers, pulleys, and inclined planes",
    materials: ["Simple machines kit", "Science textbook", "Notebook"],
    completed: false,
  },
]

// Sample curriculum resources
const curriculumResources = [
  {
    id: "c1",
    title: "Math U See: Gamma",
    subject: "math",
    description: "Complete math curriculum focusing on multiplication",
    publisher: "Math U See",
    lessons: 30,
    progress: 12,
  },
  {
    id: "c2",
    title: "Apologia Science: Exploring Creation",
    subject: "science",
    description: "Elementary science curriculum with hands-on experiments",
    publisher: "Apologia",
    lessons: 24,
    progress: 8,
  },
  {
    id: "c3",
    title: "All About Reading: Level 3",
    subject: "language",
    description: "Comprehensive reading program with phonics and fluency",
    publisher: "All About Learning Press",
    lessons: 40,
    progress: 15,
  },
  {
    id: "c4",
    title: "Story of the World: Volume 1",
    subject: "history",
    description: "Ancient history curriculum with activities and readings",
    publisher: "Well-Trained Mind Press",
    lessons: 42,
    progress: 18,
  },
]

// Sample collaborators
const collaborators = [
  {
    id: "u1",
    name: "Sarah Johnson",
    role: "Co-teacher",
    avatar: "/placeholder.svg",
  },
  {
    id: "u2",
    name: "Michael Chen",
    role: "Science Specialist",
    avatar: "/placeholder.svg",
  },
]

export default function PlannerPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState("week")
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [isAddingLesson, setIsAddingLesson] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filteredSubjects, setFilteredSubjects] = useState(subjects.map((s) => s.id))
  const [userLessons, setUserLessons] = useState<Lesson[]>([])
  const [lessonForm, setLessonForm] = useState<LessonFormState>({
    title: "",
    subject: "",
    duration: "45",
    date: "",
    time: "",
    description: "",
    materials: "",
  })

  useEffect(() => {
    const storedLessons = loadFromStorage(PLANNER_STORAGE_KEY, [])
    if (storedLessons.length) {
      setUserLessons(
        storedLessons.map((lesson) => {
          const parsedLesson = lesson as Lesson & { date: string }
          return {
            ...parsedLesson,
            date: new Date(parsedLesson.date),
          }
        }),
      )
    }
  }, [])

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

  const allLessons = useMemo(() => {
    const sampleWithSource = sampleLessons.map((lesson) => ({ ...lesson, source: "sample" }))
    const userWithSource = userLessons.map((lesson) => ({ ...lesson, source: "user" }))
    return [...sampleWithSource, ...userWithSource]
  }, [userLessons])

  // Filter lessons by selected subjects and current week
  const filteredLessons = allLessons.filter(
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

  const handleLessonFormChange = (field: keyof LessonFormState, value: string) => {
    setLessonForm((prev) => ({ ...prev, [field]: value }))
  }

  const resetLessonForm = () => {
    setLessonForm({
      title: "",
      subject: "",
      duration: "45",
      date: "",
      time: "",
      description: "",
      materials: "",
    })
  }

  const handleAddLesson = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!lessonForm.title || !lessonForm.subject || !lessonForm.date) {
      return
    }

    const dateTime = lessonForm.time ? new Date(`${lessonForm.date}T${lessonForm.time}`) : new Date(lessonForm.date)
    const newLesson: Lesson = {
      id: typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}`,
      title: lessonForm.title,
      subject: lessonForm.subject,
      date: dateTime,
      duration: Number.parseInt(lessonForm.duration, 10) || 45,
      description: lessonForm.description,
      materials: lessonForm.materials
        ? lessonForm.materials.split("\n").map((item) => item.trim()).filter(Boolean)
        : [],
      completed: false,
    }

    const updatedLessons = [...userLessons, newLesson]
    setUserLessons(updatedLessons)
    saveToStorage(PLANNER_STORAGE_KEY, updatedLessons)
    resetLessonForm()
    setIsAddingLesson(false)
  }

  const handleToggleCompletion = (lessonId, value) => {
    const updatedLessons = userLessons.map((lesson) =>
      lesson.id === lessonId ? { ...lesson, completed: value } : lesson,
    )
    setUserLessons(updatedLessons)
    saveToStorage(PLANNER_STORAGE_KEY, updatedLessons)
    if (selectedLesson?.id === lessonId) {
      setSelectedLesson({ ...selectedLesson, completed: value })
    }
  }

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
                                disabled={lesson.source !== "user"}
                                onCheckedChange={(value) => {
                                  if (lesson.source === "user") {
                                    handleToggleCompletion(lesson.id, Boolean(value))
                                  }
                                }}
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
          <form onSubmit={handleAddLesson} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Lesson Title</Label>
              <Input
                id="title"
                placeholder="Enter lesson title"
                value={lessonForm.title}
                onChange={(event) => handleLessonFormChange("title", event.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={lessonForm.subject}
                  onValueChange={(value) => handleLessonFormChange("subject", value)}
                >
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
                <Input
                  id="duration"
                  type="number"
                  placeholder="45"
                  min="5"
                  step="5"
                  value={lessonForm.duration}
                  onChange={(event) => handleLessonFormChange("duration", event.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={lessonForm.date}
                  onChange={(event) => handleLessonFormChange("date", event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={lessonForm.time}
                  onChange={(event) => handleLessonFormChange("time", event.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter lesson description"
                value={lessonForm.description}
                onChange={(event) => handleLessonFormChange("description", event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="materials">Materials Needed</Label>
              <Textarea
                id="materials"
                placeholder="List materials needed, one per line"
                value={lessonForm.materials}
                onChange={(event) => handleLessonFormChange("materials", event.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddingLesson(false)
                  resetLessonForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Add Lesson</Button>
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
                  disabled={selectedLesson.source !== "user"}
                  onCheckedChange={(value) => {
                    if (selectedLesson.source === "user") {
                      handleToggleCompletion(selectedLesson.id, Boolean(value))
                    }
                  }}
                />
                <Label htmlFor="completed">Mark as completed</Label>
              </div>
            </div>
            <DialogFooter className="flex justify-between sm:justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive bg-transparent">
                  Delete
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
