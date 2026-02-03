"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { UserPreferences } from "@/lib/recommendation-service"

// Available options for each preference category
const preferenceOptions = {
  grades: ["Preschool", "Kindergarten", "Elementary", "Middle School", "High School"],
  subjects: [
    "Math",
    "Science",
    "Language Arts",
    "History",
    "Art",
    "Music",
    "Physical Education",
    "Foreign Language",
    "Technology",
    "Social Studies",
    "Geography",
  ],
  approaches: [
    "Charlotte Mason",
    "Classical",
    "Montessori",
    "Unschooling",
    "Waldorf",
    "Eclectic",
    "Traditional",
    "Unit Studies",
    "Relaxed Homeschooling",
    "Gameschooling",
  ],
  resourceTypes: [
    "Printable",
    "Video",
    "Interactive",
    "Lesson Plan",
    "Activity",
    "Game",
    "Book List",
    "Project",
    "Worksheet",
    "Curriculum",
    "Assessment",
  ],
  interests: [
    "Nature Study",
    "Coding",
    "Robotics",
    "Gardening",
    "Cooking",
    "Arts & Crafts",
    "Music",
    "Sports",
    "Writing",
    "Reading",
    "Theater",
    "Photography",
    "Astronomy",
    "Animals",
    "Engineering",
    "Entrepreneurship",
  ],
}

interface PreferenceSelectorProps {
  preferences: UserPreferences
  onUpdatePreferences: (preferences: Partial<UserPreferences>) => void
  trigger?: React.ReactNode
}

export function PreferenceSelector({ preferences, onUpdatePreferences, trigger }: PreferenceSelectorProps) {
  const [open, setOpen] = useState(false)
  const [tempPreferences, setTempPreferences] = useState<UserPreferences>(preferences)

  // Handle checkbox change
  const handleCheckboxChange = (category: keyof typeof preferenceOptions, value: string) => {
    setTempPreferences((prev) => {
      const current = [...prev[category]]
      const index = current.indexOf(value)

      if (index === -1) {
        current.push(value)
      } else {
        current.splice(index, 1)
      }

      return {
        ...prev,
        [category]: current,
      }
    })
  }

  // Save preferences and close dialog
  const handleSave = () => {
    onUpdatePreferences(tempPreferences)
    setOpen(false)
  }

  // Reset to current preferences when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTempPreferences(preferences)
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger || <Button variant="outline">Customize Feed</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Customize Your Content</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="grades" className="mt-4">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="approaches">Approaches</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="interests">Interests</TabsTrigger>
          </TabsList>

          {(Object.keys(preferenceOptions) as Array<keyof typeof preferenceOptions>).map((category) => (
            <TabsContent key={category} value={category === "resourceTypes" ? "resources" : category} className="mt-4">
              <h3 className="text-sm font-medium mb-2">
                Select {category === "resourceTypes" ? "resource types" : category} you're interested in:
              </h3>
              <ScrollArea className="h-[300px] border rounded-md p-4">
                <div className="grid grid-cols-2 gap-2">
                  {preferenceOptions[category].map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={tempPreferences[category === "resourceTypes" ? "resourceTypes" : category].includes(
                          option,
                        )}
                        onChange={() => handleCheckboxChange(category, option)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex flex-wrap gap-1 mt-3">
                <p className="text-sm text-muted-foreground mr-2">Selected:</p>
                {tempPreferences[category === "resourceTypes" ? "resourceTypes" : category].length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">None selected</p>
                ) : (
                  tempPreferences[category === "resourceTypes" ? "resourceTypes" : category].map((selected) => (
                    <div key={selected} className="flex items-center bg-muted text-xs px-2 py-1 rounded-full">
                      {selected}
                      <button
                        onClick={() => handleCheckboxChange(category, selected)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Preferences</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
