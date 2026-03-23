"use client"

import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import CommunityEvents from "@/components/community-events"
import CommunityGroups from "@/components/community-groups"
import { BookOpen, Calendar, Users, Clock, Target, Sparkles, Heart, Shield, ArrowRight } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">Here's your homeschool journey at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/plan">
              <Target className="h-4 w-4 mr-2" />
              View Plan
            </Link>
          </Button>
          <Button asChild>
            <Link href="/planner">
              <Sparkles className="h-4 w-4 mr-2" />
              Create Lesson
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">326h</p>
                <p className="text-xs text-muted-foreground">This Year</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">260</p>
                <p className="text-xs text-muted-foreground">Lessons</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">On Track</p>
                <p className="text-xs text-muted-foreground">Compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">Groups</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Lessons */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Today's Lessons
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/planner">View All <ArrowRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Solar System Exploration</p>
                  <p className="text-xs text-muted-foreground">Science · Emma · 45 min</p>
                </div>
                <Badge variant="outline" className="text-xs">Completed</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Fractions Through Baking</p>
                  <p className="text-xs text-muted-foreground">Math · Emma · 30 min</p>
                </div>
                <Badge variant="secondary" className="text-xs">Up Next</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Dinosaur Counting Adventure</p>
                  <p className="text-xs text-muted-foreground">Math · Liam · 20 min</p>
                </div>
                <Badge variant="secondary" className="text-xs">Later</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Compliance — Wisconsin
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/plan?tab=compliance">Details <ArrowRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Hours Progress</span>
                <span className="text-muted-foreground">326 of 875h</span>
              </div>
              <Progress value={37} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Required Subjects</span>
                <span className="text-muted-foreground">6 of 6 covered</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">Due Mar 31</Badge>
              <span className="text-muted-foreground">Q2 Quarterly Report</span>
            </div>
          </CardContent>
        </Card>

        {/* Community Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming Events
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/community">View All <ArrowRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="animate-pulse h-32 bg-muted rounded" />}>
              <CommunityEvents limit={3} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Your Groups */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Your Groups
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/community">View All <ArrowRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="animate-pulse h-32 bg-muted rounded" />}>
              <CommunityGroups limit={3} />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Family Setup CTA (if not set up) */}
      <Card className="border-dashed">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-semibold">Set Up Your Family Blueprint</h3>
              <p className="text-sm text-muted-foreground">
                Define your values, add your children, and get AI lessons tailored to your family.
              </p>
            </div>
            <Button asChild>
              <Link href="/family">Get Started</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
