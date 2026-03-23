"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus } from "lucide-react"
import { getSubjectById, curriculumResources, collaborators } from "@/lib/planner-data"

export default function PlannerCurriculumTab() {
  return (
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
          <CardDescription>People you&apos;re sharing your planner with</CardDescription>
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
  )
}
