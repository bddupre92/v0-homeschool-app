"use client"

import { useState } from "react"
import { Search, Filter, BookOpen, Tag, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Navigation from "@/components/navigation"

// Sample search results
const searchResults = [
  {
    id: 1,
    title: "Nature Study Guide",
    description: "Comprehensive guide to implementing nature studies in your homeschool",
    type: "guide",
    tags: ["Science", "Charlotte Mason", "All Ages"],
    imageUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    title: "Hands-on Fractions Activities",
    description: "Fun and engaging activities to teach fractions to elementary students",
    type: "activity",
    tags: ["Math", "Elementary", "Hands-on"],
    imageUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 3,
    title: "History Timeline Project",
    description: "Create an interactive history timeline with your students",
    type: "project",
    tags: ["History", "All Ages", "Interactive"],
    imageUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 4,
    title: "Homeschooling in the Time of Coronavirus",
    description: "Tips and resources for homeschooling during the pandemic",
    type: "article",
    tags: ["COVID-19", "Organization", "All Ages"],
    imageUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 5,
    title: "Coding for Kids: Scratch Basics",
    description: "Introduction to coding with Scratch for beginners",
    type: "tutorial",
    tags: ["Technology", "Coding", "Elementary"],
    imageUrl: "/placeholder.svg?height=80&width=80",
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

const approaches = ["Charlotte Mason", "Classical", "Montessori", "Unschooling", "Waldorf", "Eclectic", "Traditional"]

const resourceTypes = ["Printable", "Video", "Interactive", "Lesson Plan", "Activity", "Game", "Book List"]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState({
    grades: [],
    subjects: [],
    approaches: [],
    resourceTypes: [],
  })

  const handleFilterChange = (category, value) => {
    setSelectedFilters((prev) => {
      const currentValues = prev[category]
      return {
        ...prev,
        [category]: currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value],
      }
    })
  }

  const clearFilters = () => {
    setSelectedFilters({
      grades: [],
      subjects: [],
      approaches: [],
      resourceTypes: [],
    })
  }

  const activeFilterCount = Object.values(selectedFilters).flat().length

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Search Resources</h1>
            <p className="text-muted-foreground">Find the perfect homeschool resources for your curriculum</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters - Desktop */}
            <div className="hidden lg:flex flex-col w-64 shrink-0 gap-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Filters</h2>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </div>

              <Accordion type="multiple" defaultValue={["grades", "subjects", "approaches", "types"]}>
                <AccordionItem value="grades">
                  <AccordionTrigger>Grade Levels</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-2 pt-2">
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
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="subjects">
                  <AccordionTrigger>Subjects</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-2 pt-2">
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
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="approaches">
                  <AccordionTrigger>Homeschool Approaches</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-2 pt-2">
                      {approaches.map((approach) => (
                        <div key={approach} className="flex items-center space-x-2">
                          <Checkbox
                            id={`approach-${approach}`}
                            checked={selectedFilters.approaches.includes(approach)}
                            onCheckedChange={() => handleFilterChange("approaches", approach)}
                          />
                          <Label htmlFor={`approach-${approach}`} className="text-sm font-normal cursor-pointer">
                            {approach}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="types">
                  <AccordionTrigger>Resource Types</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-2 pt-2">
                      {resourceTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={selectedFilters.resourceTypes.includes(type)}
                            onCheckedChange={() => handleFilterChange("resourceTypes", type)}
                          />
                          <Label htmlFor={`type-${type}`} className="text-sm font-normal cursor-pointer">
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Filters - Mobile */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Narrow down your search results</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-6 py-4">
                  {activeFilterCount > 0 && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  )}

                  <Accordion type="multiple" defaultValue={["grades", "subjects", "approaches", "types"]}>
                    <AccordionItem value="grades">
                      <AccordionTrigger>Grade Levels</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-2 pt-2">
                          {grades.map((grade) => (
                            <div key={grade} className="flex items-center space-x-2">
                              <Checkbox
                                id={`mobile-grade-${grade}`}
                                checked={selectedFilters.grades.includes(grade)}
                                onCheckedChange={() => handleFilterChange("grades", grade)}
                              />
                              <Label htmlFor={`mobile-grade-${grade}`} className="text-sm font-normal cursor-pointer">
                                {grade}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="subjects">
                      <AccordionTrigger>Subjects</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-2 pt-2">
                          {subjects.map((subject) => (
                            <div key={subject} className="flex items-center space-x-2">
                              <Checkbox
                                id={`mobile-subject-${subject}`}
                                checked={selectedFilters.subjects.includes(subject)}
                                onCheckedChange={() => handleFilterChange("subjects", subject)}
                              />
                              <Label
                                htmlFor={`mobile-subject-${subject}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {subject}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="approaches">
                      <AccordionTrigger>Homeschool Approaches</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-2 pt-2">
                          {approaches.map((approach) => (
                            <div key={approach} className="flex items-center space-x-2">
                              <Checkbox
                                id={`mobile-approach-${approach}`}
                                checked={selectedFilters.approaches.includes(approach)}
                                onCheckedChange={() => handleFilterChange("approaches", approach)}
                              />
                              <Label
                                htmlFor={`mobile-approach-${approach}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {approach}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="types">
                      <AccordionTrigger>Resource Types</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-2 pt-2">
                          {resourceTypes.map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                id={`mobile-type-${type}`}
                                checked={selectedFilters.resourceTypes.includes(type)}
                                onCheckedChange={() => handleFilterChange("resourceTypes", type)}
                              />
                              <Label htmlFor={`mobile-type-${type}`} className="text-sm font-normal cursor-pointer">
                                {type}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex-1">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search resources..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        // Optional: Add debounce for better performance
                      }}
                    />
                  </div>
                  <Select defaultValue="relevance">
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="a-z">A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Active filters */}
                {activeFilterCount > 0 && (
                  <div className="flex flex-wrap gap-2 py-2">
                    {Object.entries(selectedFilters).map(([category, values]) =>
                      values.map((value) => (
                        <div
                          key={`${category}-${value}`}
                          className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-medium"
                        >
                          {value}
                          <button
                            onClick={() => handleFilterChange(category, value)}
                            className="ml-1 rounded-full hover:bg-muted-foreground/20"
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove filter</span>
                          </button>
                        </div>
                      )),
                    )}
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      Clear all
                    </button>
                  </div>
                )}

                {/* Search results */}
                <div className="flex flex-col gap-4 mt-2">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-20 h-20 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                        <img
                          src={result.imageUrl || "/placeholder.svg"}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-lg mb-1">{result.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{result.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {result.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <div className="flex items-center text-xs text-muted-foreground">
                          {result.type === "guide" && <BookOpen className="h-3 w-3 mr-1" />}
                          {result.type === "activity" && <Tag className="h-3 w-3 mr-1" />}
                          {result.type === "project" && <BookOpen className="h-3 w-3 mr-1" />}
                          {result.type === "article" && <BookOpen className="h-3 w-3 mr-1" />}
                          {result.type === "tutorial" && <BookOpen className="h-3 w-3 mr-1" />}
                          {result.type}
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Save
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
