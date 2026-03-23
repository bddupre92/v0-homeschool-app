"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"
import Link from "next/link"
import type { DemoChild } from "@/lib/plan-data"

interface PlanChildrenTabProps {
  children: DemoChild[]
  totalHours: number
  totalLessons: number
  subjectCount: number
}

export default function PlanChildrenTab({ children, totalHours, totalLessons, subjectCount }: PlanChildrenTabProps) {
  return (
    <div className="space-y-6">
      {children.map((child) => (
        <Card key={child.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {child.name.charAt(0)}
                </div>
                <div>
                  <span>{child.name}</span>
                  <p className="text-sm font-normal text-muted-foreground">
                    {child.age} · Grade {child.grade} · {child.learningStyle}
                  </p>
                </div>
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/family">Edit Profile</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-lg font-bold">
                  {(totalHours / children.length).toFixed(1)}h
                </p>
                <p className="text-xs text-muted-foreground">Hours This Year</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-lg font-bold">
                  {Math.round(totalLessons / children.length)}
                </p>
                <p className="text-xs text-muted-foreground">Lessons</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-lg font-bold text-green-600">On Track</p>
                <p className="text-xs text-muted-foreground">Compliance</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-lg font-bold">{subjectCount}</p>
                <p className="text-xs text-muted-foreground">Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" className="w-full border-dashed" asChild>
        <Link href="/family">
          <GraduationCap className="h-4 w-4 mr-2" />
          Manage Children Profiles
        </Link>
      </Button>
    </div>
  )
}
