"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Grid3X3, Plus, MoreHorizontal, Bookmark, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

// Sample data
const boardsData = [
  {
    id: "1",
    title: "Science Experiments",
    description: "Hands-on science activities for elementary students",
    itemCount: 12,
    coverImage:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    isPublic: true,
  },
  {
    id: "2",
    title: "Math Games",
    description: "Fun ways to practice math skills",
    itemCount: 8,
    coverImage:
      "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    isPublic: true,
  },
  {
    id: "3",
    title: "Reading List",
    description: "Books for our literature studies",
    itemCount: 15,
    coverImage:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    isPublic: false,
  },
  {
    id: "4",
    title: "Field Trip Ideas",
    description: "Places to visit for hands-on learning",
    itemCount: 6,
    coverImage:
      "https://images.unsplash.com/photo-1503803548695-c2a7b4a5b875?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    isPublic: true,
  },
]

export default function BoardsGrid() {
  const [boards, setBoards] = useState(boardsData)

  const handleCreateBoard = () => {
    // In a real app, this would open a modal or navigate to a create board page
    console.log("Create new board")
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-primary" />
            <CardTitle>Your Boards</CardTitle>
          </div>
          <Button size="sm" className="gap-1" asChild>
            <Link href="/boards/create">
              <Plus className="h-4 w-4" />
              <span>New Board</span>
            </Link>
          </Button>
        </div>
        <CardDescription>Organize and save your favorite resources</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {boards.map((board) => (
            <div key={board.id} className="group relative">
              <div className="aspect-square overflow-hidden rounded-lg border">
                <div className="relative h-full w-full">
                  <Image
                    src={board.coverImage || "/placeholder.svg"}
                    alt={board.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-white">{board.title}</h3>
                        <p className="text-xs text-white/80">{board.itemCount} items</p>
                      </div>
                      <div className="flex gap-1">
                        {!board.isPublic && (
                          <Badge variant="outline" className="bg-black/30 text-white border-white/20 text-xs">
                            Private
                          </Badge>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-black/20">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/boards/${board.id}/edit`} className="flex items-center">
                                <Bookmark className="mr-2 h-4 w-4" />
                                <span>Edit Board</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/boards/${board.id}/share`} className="flex items-center">
                                <Share2 className="mr-2 h-4 w-4" />
                                <span>Share Board</span>
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Link href={`/boards/${board.id}`} className="absolute inset-0">
                <span className="sr-only">View {board.title}</span>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
