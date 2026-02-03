"use client"

import { useEffect, useMemo, useState } from "react"
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
const sampleLessons = [
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
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [isAddingLesson, setIsAddingLesson] = useState(false)
  const [isAiScheduleOpen, setIsAiScheduleOpen] = useState(false)
  const [aiPlanImage, setAiPlanImage] = useState<File | null>(null)
  const [aiPlanNotes, setAiPlanNotes] = useState("")
  const [aiDraftSchedule, setAiDraftSchedule] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filteredSubjects, setFilteredSubjects] = useState(subjects.map((s) => s.id))
  const [isCalendarConnected, setIsCalendarConnected] = useState(false)
  const [calendarSyncStatus, setCalendarSyncStatus] = useState("Not connected")
  const [lessonImage, setLessonImage] = useState<File | null>(null)

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
  const filteredLessons = sampleLessons.filter(
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

  const aiImagePreviewUrl = useMemo(
    () => (aiPlanImage ? URL.createObjectURL(aiPlanImage) : null),
    [aiPlanImage],
  )

  const lessonImagePreviewUrl = useMemo(
    () => (lessonImage ? URL.createObjectURL(lessonImage) : null),
    [lessonImage],
  )

  useEffect(() => {
    if (!aiImagePreviewUrl) return
    return () => URL.revokeObjectURL(aiImagePreviewUrl)
  }, [aiImagePreviewUrl])

  useEffect(() => {
    if (!lessonImagePreviewUrl) return
    return () => URL.revokeObjectURL(lessonImagePreviewUrl)
  }, [lessonImagePreviewUrl])

  const handleGenerateSchedule = () => {
    if (!aiPlanImage && aiPlanNotes.trim().length === 0) {
      setAiDraftSchedule("Add a photo or notes so the AI can build your schedule.")
      return
    }

    const sourceLabel = aiPlanImage ? `Uploaded plan: ${aiPlanImage.name}` : "No photo attached"
    setAiDraftSchedule(
      [
        `AI draft schedule generated from your inputs.`,
        sourceLabel,
        aiPlanNotes ? `Notes: ${aiPlanNotes}` : "Notes: none",
        "Suggested schedule:",
        "• Monday 9:00am - Math (Fractions practice)",
        "• Tuesday 10:00am - Science (Plant life cycle)",
        "• Wednesday 1:00pm - Art (Watercolor techniques)",
      ].join("\n"),
    )
  }

  const handleAddSchedule = () => {
    setIsAiScheduleOpen(false)
    setAiDraftSchedule(null)
    setAiPlanImage(null)
    setAiPlanNotes("")
  }

  const handleConnectCalendar = () => {
    setIsCalendarConnected(true)
    setCalendarSyncStatus("Connected (two-way sync enabled)")
  }

  const handleDisconnectCalendar = () => {
    setIsCalendarConnected(false)
    setCalendarSyncStatus("Not connected")
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

              <Button variant="outline" className="gap-1 bg-transparent" onClick={() => setIsAiScheduleOpen(true)}>
                <Bot className="h-4 w-4" />
                Add Schedule from Photo
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
                              <Checkbox checked={lesson.completed} />
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

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Google Calendar Sync</CardTitle>
                    <CardDescription>Keep your planner and Google Calendar in sync both ways.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      Status: <span className="font-medium">{calendarSyncStatus}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Planner updates will sync to Google Calendar, and calendar changes will appear in your planner
                      once connected.
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    {isCalendarConnected ? (
                      <Button variant="outline" className="w-full" onClick={handleDisconnectCalendar}>
                        Disconnect Calendar
                      </Button>
                    ) : (
                      <Button className="w-full" onClick={handleConnectCalendar}>
                        Connect Google Calendar
                      </Button>
                    )}
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
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="lesson-image">Lesson Image (optional)</Label>
              <Input
                id="lesson-image"
                type="file"
                accept="image/*"
                onChange={(event) => setLessonImage(event.target.files?.[0] ?? null)}
              />
              {lessonImagePreviewUrl && (
                <img
                  src={lessonImagePreviewUrl}
                  alt="Lesson upload preview"
                  className="h-32 w-full rounded-md object-cover border"
                />
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Lesson Title</Label>
              <Input id="title" placeholder="Enter lesson title" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Select>
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
                <Input id="duration" type="number" placeholder="45" min="5" step="5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Enter lesson description" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="materials">Materials Needed</Label>
              <Textarea id="materials" placeholder="List materials needed, one per line" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingLesson(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsAddingLesson(false)}>Add Lesson</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAiScheduleOpen} onOpenChange={setIsAiScheduleOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>AI Schedule Builder</DialogTitle>
            <DialogDescription>
              Upload a photo of your written plan and let AI convert it into a planner schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ai-plan-photo">Plan Photo</Label>
              <Input
                id="ai-plan-photo"
                type="file"
                accept="image/*"
                onChange={(event) => setAiPlanImage(event.target.files?.[0] ?? null)}
              />
              {aiImagePreviewUrl && (
                <img
                  src={aiImagePreviewUrl}
                  alt="Uploaded plan preview"
                  className="h-40 w-full rounded-md object-cover border"
                />
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ai-plan-notes">Notes for the AI</Label>
              <Textarea
                id="ai-plan-notes"
                placeholder="Add any extra details (subjects, timing preferences, goals)..."
                value={aiPlanNotes}
                onChange={(event) => setAiPlanNotes(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Draft Schedule</Label>
              <div className="rounded-md border bg-muted/40 p-3 text-sm whitespace-pre-line min-h-[120px]">
                {aiDraftSchedule ?? "Upload a plan photo and generate a schedule draft."}
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <Button variant="outline" onClick={() => setIsAiScheduleOpen(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleGenerateSchedule}>
                Generate Schedule
              </Button>
              <Button onClick={handleAddSchedule} disabled={!aiDraftSchedule}>
                Add Schedule
              </Button>
            </div>
          </DialogFooter>
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
                <Checkbox id="completed" checked={selectedLesson.completed} />
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
