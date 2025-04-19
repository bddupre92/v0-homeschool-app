"use client"

import { useEffect } from "react"
import { useData } from "@/lib/data-context"
import { useSession } from "next-auth/react"
import AuthGuard from "@/components/auth/auth-guard"
import Navigation from "@/components/navigation"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session } = useSession()
  const { 
    boards, loadingBoards, errorBoards, fetchBoards,
    resources, loadingResources, errorResources, fetchResources,
    planners, loadingPlanners, errorPlanners, fetchPlanners
  } = useData()

  useEffect(() => {
    fetchBoards()
    fetchResources()
    fetchPlanners()
  }, [fetchBoards, fetchResources, fetchPlanners])

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, {session?.user?.name || "User"}!
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/boards/new">
                  <Button>New Board</Button>
                </Link>
                <Link href="/planner/new">
                  <Button variant="outline">New Planner</Button>
                </Link>
              </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="boards">Boards</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="planners">Planners</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Boards</CardTitle>
                      <CardDescription>Organize your homeschool content</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{boards.length}</div>
                    </CardContent>
                    <CardFooter>
                      <Link href="/boards" className="w-full">
                        <Button variant="outline" className="w-full">View all boards</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Resources</CardTitle>
                      <CardDescription>Your educational materials</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{resources.length}</div>
                    </CardContent>
                    <CardFooter>
                      <Link href="/resources" className="w-full">
                        <Button variant="outline" className="w-full">View all resources</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Planners</CardTitle>
                      <CardDescription>Your lesson plans and schedules</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{planners.length}</div>
                    </CardContent>
                    <CardFooter>
                      <Link href="/planner" className="w-full">
                        <Button variant="outline" className="w-full">View all planners</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Boards</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingBoards ? (
                        <div className="space-y-2">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ) : boards.length > 0 ? (
                        <div className="space-y-2">
                          {boards.slice(0, 5).map((board) => (
                            <Link key={board.id} href={`/boards/${board.id}`}>
                              <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted">
                                <div className="font-medium">{board.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(board.updatedAt).toLocaleDateString()}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No boards created yet
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Link href="/boards" className="w-full">
                        <Button variant="outline" className="w-full">View all boards</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingResources ? (
                        <div className="space-y-2">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ) : resources.length > 0 ? (
                        <div className="space-y-2">
                          {resources.slice(0, 5).map((resource) => (
                            <Link key={resource.id} href={`/resources/${resource.id}`}>
                              <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted">
                                <div className="font-medium">{resource.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {resource.category}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No resources added yet
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Link href="/resources" className="w-full">
                        <Button variant="outline" className="w-full">View all resources</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="boards" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Your Boards</h2>
                  <Link href="/boards/new">
                    <Button>New Board</Button>
                  </Link>
                </div>
                {loadingBoards ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-40 w-full" />
                    ))}
                  </div>
                ) : boards.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {boards.map((board) => (
                      <Link key={board.id} href={`/boards/${board.id}`}>
                        <Card className="h-full hover:bg-muted/50 transition-colors">
                          <CardHeader>
                            <CardTitle>{board.title}</CardTitle>
                            <CardDescription>
                              {board.description || "No description"}
                            </CardDescription>
                          </CardHeader>
                          <CardFooter>
                            <p className="text-sm text-muted-foreground">
                              Updated {new Date(board.updatedAt).toLocaleDateString()}
                            </p>
                          </CardFooter>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <p className="mb-4 text-center text-muted-foreground">
                        You haven't created any boards yet.
                      </p>
                      <Link href="/boards/new">
                        <Button>Create your first board</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="resources" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Your Resources</h2>
                  <Link href="/resources/new">
                    <Button>Add Resource</Button>
                  </Link>
                </div>
                {loadingResources ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-40 w-full" />
                    ))}
                  </div>
                ) : resources.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {resources.map((resource) => (
                      <Link key={resource.id} href={`/resources/${resource.id}`}>
                        <Card className="h-full hover:bg-muted/50 transition-colors">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle>{resource.title}</CardTitle>
                              <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                {resource.category}
                              </div>
                            </div>
                            <CardDescription>
                              {resource.description || "No description"}
                            </CardDescription>
                          </CardHeader>
                          <CardFooter>
                            {resource.url && (
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Visit resource
                              </a>
                            )}
                          </CardFooter>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <p className="mb-4 text-center text-muted-foreground">
                        You haven't added any resources yet.
                      </p>
                      <Link href="/resources/new">
                        <Button>Add your first resource</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="planners" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Your Planners</h2>
                  <Link href="/planner/new">
                    <Button>New Planner</Button>
                  </Link>
                </div>
                {loadingPlanners ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-40 w-full" />
                    ))}
                  </div>
                ) : planners.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {planners.map((planner) => (
                      <Link key={planner.id} href={`/planner/${planner.id}`}>
                        <Card className="h-full hover:bg-muted/50 transition-colors">
                          <CardHeader>
                            <CardTitle>{planner.title}</CardTitle>
                            <CardDescription>
                              {planner.description || "No description"}
                            </CardDescription>
                          </CardHeader>
                          <CardFooter>
                            <div className="flex flex-col w-full">
                              {planner.startDate && planner.endDate && (
                                <p className="text-sm text-muted-foreground">
                                  {new Date(planner.startDate).toLocaleDateString()} - {new Date(planner.endDate).toLocaleDateString()}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                Updated {new Date(planner.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </CardFooter>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <p className="mb-4 text-center text-muted-foreground">
                        You haven't created any planners yet.
                      </p>
                      <Link href="/planner/new">
                        <Button>Create your first planner</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
