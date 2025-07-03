"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bot, Loader2, Search } from "lucide-react"
import type { ResearchResult } from "@/lib/types"

const researchSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  grade: z.string().min(1, "Grade level is required"),
  topics: z.string().min(3, "Please specify topics of interest."),
})

type ResearchFormValues = z.infer<typeof researchSchema>

interface AIResearchPhaseProps {
  onResearchComplete: (query: ResearchFormValues, results: ResearchResult[]) => void
}

export default function AIResearchPhase({ onResearchComplete }: AIResearchPhaseProps) {
  const { toast } = useToast()
  const form = useForm<ResearchFormValues>({
    resolver: zodResolver(researchSchema),
    defaultValues: { subject: "", grade: "", topics: "" },
  })

  const researchMutation = useMutation({
    mutationFn: async (data: ResearchFormValues) => {
      const response = await fetch("/api/ai/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to fetch research results.")
      }
      return response.json()
    },
    onSuccess: (data: ResearchResult[]) => {
      toast({ title: "Research Complete", description: "We've gathered some resources for you." })
      onResearchComplete(form.getValues(), data)
    },
    onError: (error) => {
      toast({ title: "Research Failed", description: (error as Error).message, variant: "destructive" })
    },
  })

  const onSubmit = (data: ResearchFormValues) => {
    researchMutation.mutate(data)
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot />
          AI Curriculum Builder - Step 1: Research
        </CardTitle>
        <CardDescription>
          Let's start by gathering the best, most up-to-date information from across the web. Tell us what you're
          looking for.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="English Language Arts">English Language Arts</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 13 }, (_, i) => (i === 0 ? "K" : `${i}`)).map((g) => (
                          <SelectItem key={g} value={String(g)}>
                            {g === "K" ? "Kindergarten" : `Grade ${g}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="topics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Topics or Interests</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., fractions, photosynthesis, American Revolution" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={researchMutation.isPending}>
                {researchMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Researching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Start Research
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
