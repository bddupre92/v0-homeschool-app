"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Sparkles, BookOpen, TrendingUp, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Sample data from PersonalizedRecommendations.tsx
const recommendationsData = {
  forYou: [
    {
      id: "1",
      title: "Hands-on Fractions Activities",
      description: "Fun and engaging activities to teach fractions to elementary students",
      type: "activity",
      tags: ["Math", "Elementary", "Hands-on"],
      matchScore: 98,
    },
    {
      id: "2",
      title: "Nature Journal Templates",
      description: "Printable templates for nature study journals",
      type: "document",
      tags: ["Science", "Charlotte Mason", "Printable"],
      matchScore: 95,
    },
    {
      id: "3",
      title: "History Timeline Project",
      description: "Create an interactive history timeline with your students",
      type: "project",
      tags: ["History", "All Ages", "Interactive"],
      matchScore: 92,
    },
  ],
  trending: [
    {
      id: "4",
      title: "Coding for Kids: Scratch Basics",
      description: "Introduction to coding with Scratch for beginners",
      type: "tutorial",
      tags: ["Technology", "Coding", "Elementary"],
      popularity: "High",
    },
    {
      id: "5",
      title: "Virtual Field Trips Collection",
      description: "Explore museums, national parks, and historical sites from home",
      type: "collection",
      tags: ["Virtual", "Field Trips", "All Ages"],
      popularity: "High",
    },
  ],
  newContent: [
    {
      id: "6",
      title: "Homeschool Record Keeping Templates",
      description: "Comprehensive set of templates for tracking progress and attendance",
      type: "document",
      tags: ["Organization", "Planning", "Templates"],
      dateAdded: "2025-04-15",
    },
    {
      id: "7",
      title: "Science Experiment: Water Cycle in a Bag",
      description: "Easy demonstration of the water cycle using household items",
      type: "activity",
      tags: ["Science", "Elementary", "Hands-on"],
      dateAdded: "2025-04-14",
    },
  ],
}

// Sample preferences
const userPreferences = {
  grades: ["Elementary", "Middle School"],
  subjects: ["Math", "Science", "History"],
  approaches: ["Charlotte Mason", "Classical"],
  resourceTypes: ["Activity", "Printable", "Project"],
}

export default function PersonalizedRecommendations() {
  const [isEditingPreferences, setIsEditingPreferences] = useState(false)
  const [tempPreferences, setTempPreferences] = useState(userPreferences)

  const handleCheckboxChange = (category, value) => {
    setTempPreferences((prev) => {
      const currentValues = prev[category]
      return {
        ...prev,
        [category]: currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value],
      }
    })
  }

  const savePreferences = () => {
    // In a real app, this would save to backend
    setIsEditingPreferences(false)
  }

  // Sample data for dropdowns
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
  const approaches = ["Charlotte Mason", "Classical", "Montessori", "Unschooling", "Waldorf", "Eclectic", "Traditional"]

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Personalized Recommendations</CardTitle>
          </div>
          {!isEditingPreferences ? (
            <Button variant="ghost" size="sm" onClick={() => setIsEditingPreferences(true)}>
              Edit Preferences
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditingPreferences(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={savePreferences}>
                Save
              </Button>
            </div>
          )}
        </div>
        <CardDescription>Resources tailored to your homeschool journey</CardDescription>
      </CardHeader>
      <CardContent>
        {isEditingPreferences ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2 text-sm">Grade Levels</h3>
                <div className="max-h-40 overflow-y-auto p-2 border border-border rounded-md">
                  {grades.map((grade) => (
                    <label key={grade} className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        checked={tempPreferences.grades.includes(grade)}
                        onChange={() => handleCheckboxChange("grades", grade)}
                        className="mr-2 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{grade}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2 text-sm">Subjects</h3>
                <div className="max-h-40 overflow-y-auto p-2 border border-border rounded-md">
                  {subjects.map((subject) => (
                    <label key={subject} className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        checked={tempPreferences.subjects.includes(subject)}
                        onChange={() => handleCheckboxChange("subjects", subject)}
                        className="mr-2 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2 text-sm">Homeschool Approaches</h3>
                <div className="max-h-40 overflow-y-auto p-2 border border-border rounded-md">
                  {approaches.map((approach) => (
                    <label key={approach} className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        checked={tempPreferences.approaches.includes(approach)}
                        onChange={() => handleCheckboxChange("approaches", approach)}
                        className="mr-2 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{approach}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2 text-sm">Resource Types</h3>
                <div className="max-h-40 overflow-y-auto p-2 border border-border rounded-md">
                  {["Printable", "Video", "Interactive", "Lesson Plan", "Activity", "Game", "Book List", "Project"].map(
                    (type) => (
                      <label key={type} className="flex items-center mb-1">
                        <input
                          type="checkbox"
                          checked={tempPreferences.resourceTypes.includes(type)}
                          onChange={() => handleCheckboxChange("resourceTypes", type)}
                          className="mr-2 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-sm">{type}</span>
                      </label>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="forYou">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="forYou" className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                <span>For You</span>
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Trending</span>
              </TabsTrigger>
              <TabsTrigger value="new" className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>New</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="forYou" className="space-y-4">
              {recommendationsData.forYou.map((item) => (
                <Link key={item.id} href={`/resources/${item.id}`} className="block">
                  <div className="flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center shrink-0">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-base">{item.title}</h3>
                        <Badge variant="outline" className="shrink-0 bg-primary/10 text-primary border-primary/20">
                          {item.matchScore}% Match
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              <Button variant="ghost" className="w-full flex items-center justify-center gap-1 text-muted-foreground">
                View more recommendations
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TabsContent>

            <TabsContent value="trending" className="space-y-4">
              {recommendationsData.trending.map((item) => (
                <Link key={item.id} href={`/resources/${item.id}`} className="block">
                  <div className="flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center shrink-0">
                      <TrendingUp className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-base">{item.title}</h3>
                        <Badge
                          variant="outline"
                          className="shrink-0 bg-secondary/10 text-secondary border-secondary/20"
                        >
                          {item.popularity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              <Button variant="ghost" className="w-full flex items-center justify-center gap-1 text-muted-foreground">
                View more trending resources
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TabsContent>

            <TabsContent value="new" className="space-y-4">
              {recommendationsData.newContent.map((item) => (
                <Link key={item.id} href={`/resources/${item.id}`} className="block">
                  <div className="flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center shrink-0">
                      <Clock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-base">{item.title}</h3>
                        <Badge variant="outline" className="shrink-0 bg-accent/10 text-accent border-accent/20">
                          New
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              <Button variant="ghost" className="w-full flex items-center justify-center gap-1 text-muted-foreground">
                View more new resources
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
