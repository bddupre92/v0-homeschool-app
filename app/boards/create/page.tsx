import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function CreateBoardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div className="mb-6">
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link href="/boards">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Boards</span>
              </Link>
            </Button>
          </div>

          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Create a New Board</CardTitle>
              <CardDescription>Organize your favorite resources in a collection</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Board Title</Label>
                  <Input id="title" placeholder="Enter a name for your board" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this board is about"
                    className="min-h-[120px]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="public">Make Board Public</Label>
                    <p className="text-sm text-muted-foreground">Public boards can be viewed by other homeschoolers</p>
                  </div>
                  <Switch id="public" />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/boards">Cancel</Link>
                  </Button>
                  <Button type="submit">Create Board</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
