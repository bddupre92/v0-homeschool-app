"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from "date-fns"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  LayoutGrid,
  List,
  Plus,
  Share2,
  Users,
  Bot,
  FileCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navigation from "@/components/navigation"
import AICurriculumWorkflow from "@/components/ai-curriculum-workflow"
import LessonPacketsTab from "@/components/lesson-packets-tab"
import PlannerWeekView from "@/components/planner-week-view"
import PlannerListView from "@/components/planner-list-view"
import PlannerCurriculumTab from "@/components/planner-curriculum-tab"
import PlannerFilterPopover from "@/components/planner-filter-popover"
import AddLessonDialog from "@/components/planner-add-lesson-dialog"
import LessonDetailDialog from "@/components/planner-lesson-detail-dialog"
import { subjects } from "@/lib/planner-data"
import { getLessons, createLesson, deleteLesson, toggleLessonCompletion } from "@/app/actions/planner-actions"
import { toast } from "@/hooks/use-toast"

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
        setLessons((prev) =>
          prev.map((l) => (l.id === lessonId ? { ...l, completed: result.completed } : l))
        )
        if (selectedLesson?.id === lessonId) {
          setSelectedLesson((prev: any) => (prev ? { ...prev, completed: result.completed } : null))
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

  const toggleSubjectFilter = (subjectId: string) => {
    setFilteredSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    )
  }

  // Collect all unique subject IDs from actual lessons (handles AI-created subjects not in the default list)
  const allSubjectIds = useMemo(() => {
    const ids = new Set(subjects.map((s) => s.id))
    lessons.forEach((l) => { if (l.subject) ids.add(l.subject) })
    return Array.from(ids)
  }, [lessons])

  // Filter lessons by selected subjects and current week
  // If a lesson's subject isn't in the known subject list, always show it (don't filter it out)
  const knownSubjectIds = new Set(subjects.map((s) => s.id))
  const filteredLessons = lessons.filter(
    (lesson) =>
      (filteredSubjects.includes(lesson.subject) || !knownSubjectIds.has(lesson.subject)) &&
      lesson.date >= startOfWeek(currentDate, { weekStartsOn: 0 }) &&
      lesson.date <= endOfWeek(currentDate, { weekStartsOn: 0 })
  )

  // Group lessons by day for week view
  const lessonsByDay = weekDays.map((day) => ({
    date: day,
    lessons: filteredLessons.filter((lesson) => isSameDay(lesson.date, day)),
  }))

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

              <PlannerFilterPopover
                open={isFilterOpen}
                onOpenChange={setIsFilterOpen}
                filteredSubjects={filteredSubjects}
                onToggleSubject={toggleSubjectFilter}
                onSelectAll={() => setFilteredSubjects(subjects.map((s) => s.id))}
                onClearAll={() => setFilteredSubjects([])}
              />
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
                <Button variant="outline" size="icon" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">
                  {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
                </div>
                <Button variant="outline" size="icon" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
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
              <PlannerWeekView
                lessonsByDay={lessonsByDay}
                onSelectLesson={setSelectedLesson}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="list" className="mt-0">
              <PlannerListView
                lessons={filteredLessons}
                onSelectLesson={setSelectedLesson}
                onToggleCompletion={handleToggleCompletion}
                onAddLesson={() => setIsAddingLesson(true)}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="curriculum" className="mt-0">
              <PlannerCurriculumTab />
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

      <AddLessonDialog
        open={isAddingLesson}
        onOpenChange={setIsAddingLesson}
        onSubmit={handleCreateLesson}
        isSubmitting={isSubmitting}
      />

      <LessonDetailDialog
        lesson={selectedLesson}
        onClose={() => setSelectedLesson(null)}
        onDelete={handleDeleteLesson}
        onToggleCompletion={handleToggleCompletion}
        isDeleting={isDeletingLesson}
      />
    </div>
  )
}
