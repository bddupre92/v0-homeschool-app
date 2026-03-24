"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Filter, User } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { subjects } from "@/lib/planner-data"

interface PlannerFilterPopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filteredSubjects: string[]
  onToggleSubject: (subjectId: string) => void
  onSelectAll: () => void
  onClearAll: () => void
  childNames?: string[]
  filteredChildren?: string[]
  onToggleChild?: (name: string) => void
  onSelectAllChildren?: () => void
  onClearAllChildren?: () => void
}

export default function PlannerFilterPopover({
  open,
  onOpenChange,
  filteredSubjects,
  onToggleSubject,
  onSelectAll,
  onClearAll,
  childNames = [],
  filteredChildren = [],
  onToggleChild,
  onSelectAllChildren,
  onClearAllChildren,
}: PlannerFilterPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
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
                  onCheckedChange={() => onToggleSubject(subject.id)}
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
            <Button variant="outline" size="sm" onClick={onSelectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={onClearAll}>
              Clear All
            </Button>
          </div>
          {childNames.length > 1 && (
            <>
              <Separator />
              <h4 className="font-medium">Filter by Student</h4>
              <div className="grid grid-cols-2 gap-2">
                {childNames.map((name) => (
                  <div key={name} className="flex items-center space-x-2">
                    <Checkbox
                      id={`filter-child-${name}`}
                      checked={filteredChildren.includes(name)}
                      onCheckedChange={() => onToggleChild?.(name)}
                    />
                    <Label
                      htmlFor={`filter-child-${name}`}
                      className="flex items-center text-sm font-normal cursor-pointer"
                    >
                      <User className="h-3 w-3 mr-2 text-muted-foreground" />
                      {name}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={onSelectAllChildren}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={onClearAllChildren}>
                  Clear All
                </Button>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
