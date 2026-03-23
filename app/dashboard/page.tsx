"use client"

import { Suspense, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import CommunityEvents from "@/components/community-events"
import CommunityGroups from "@/components/community-groups"
import { BookOpen, Calendar, Users, Clock, Target, Sparkles, Heart, Shield, ArrowRight, Loader2 } from "lucide-react"
import { getDashboardStats, getFamilyBlueprint } from "@/app/actions/family-actions"

export default function DashboardPage() {
  const [stats, setStats] = useState<{
    totalHours: number
    totalLessons: number
    childrenCount: number
    complianceStatus: string
    filings: any[]
  } | null>(null)
  const [stateName, setStateName] = useState<string | null>(null)
  const [hasBlueprint, setHasBlueprint] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStats = useCallback(async () => {
    try {
      const [dashStats, blueprint] = await Promise.all([
        getDashboardStats(),
        getFamilyBlueprint(),
      ])
      setStats(dashStats)
      setHasBlueprint(!!blueprint)
      setStateName(blueprint?.state_abbreviation || null)
    } catch (error) {
      console.error("Failed to load dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const nextDueFiling = stats?.filings?.find((f: any) =>
    f.status === "pending" && f.due_date
  )

  const complianceColor = stats?.complianceStatus === "On Track" ? "text-green-600" : "text-amber-600"

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s your homeschool journey at a glance.</p>
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
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.totalHours || 0}h</p>
                )}
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
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.totalLessons || 0}</p>
                )}
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
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <p className={`text-2xl font-bold ${complianceColor}`}>
                    {stats?.complianceStatus || "Set Up"}
                  </p>
                )}
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
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.childrenCount || 0}</p>
                )}
                <p className="text-xs text-muted-foreground">Children</p>
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
                Today&apos;s Lessons
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/planner">View All <ArrowRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.totalLessons === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No lessons logged yet.</p>
                <p className="text-xs mt-1">Start by creating a lesson or logging hours.</p>
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>View your planner for today&apos;s schedule.</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href="/planner">Open Planner</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Compliance{stateName ? ` — ${stateName}` : ""}
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/plan?tab=compliance">Details <ArrowRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!stateName ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Set your state in Family Setup to track compliance.</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href="/family">Set Up</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Hours Logged</span>
                    <span className="text-muted-foreground">{stats?.totalHours || 0}h this year</span>
                  </div>
                  <Progress value={stats?.totalHours ? Math.min((stats.totalHours / 875) * 100, 100) : 0} className="h-2" />
                </div>
                {nextDueFiling && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                      Due {new Date(nextDueFiling.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </Badge>
                    <span className="text-muted-foreground">{nextDueFiling.filing_type}</span>
                  </div>
                )}
              </>
            )}
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

      {/* Family Setup CTA (show if no blueprint) */}
      {hasBlueprint === false && (
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
      )}
    </div>
  )
}
