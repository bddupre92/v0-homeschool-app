"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Sparkles, BookOpen, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { ResearchResult } from "@/lib/types"
import { zodFormResolver } from "@/lib/resolvers"

const curriculumSchema = z.object({
  childName: z.string().min(1, "Child's name is required"),
  duration: z.enum(["semester", "year", "quarter"]),
  learningStyle: z.string().optional(),
  focusAreas: z.string().optional(),
})

type CurriculumFormValues = z.infer<typeof curriculumSchema>

interface AICurriculumGenerationPhaseProps {
  researchQuery: { subject: string; grade: string; topics: string }
  researchResults: ResearchResult[]
  onStartOver: () => void
}

export default function AICurriculumGenerationPhase({
  researchQuery,
  researchResults,
  onStartOver,
}: AICurriculumGenerationPhaseProps) {
  const { toast } = useToast()
  const [generatedCurriculum, setGeneratedCurriculum] = useState<any>(null)
  const form = useForm<CurriculumFormValues>({
    resolver: zodFormResolver(curriculumSchema),
    defaultValues: { childName: "", duration: "year", learningStyle: "", focusAreas: "" },
  })

  const generateMutation = useMutation({
    mutationFn: async (data: CurriculumFormValues) => {
      const payload = {
        ...data,
        researchQuery,
        researchContext: researchResults,
      }
      const response = await fetch("/api/ai/generate-curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error("Failed to generate curriculum.")
      }
      return response.json()
    },
    onSuccess: (data) => {
      setGeneratedCurriculum(data)
      toast({ title: "Curriculum Generated!", description: "Your personalized curriculum is ready." })
    },
    onError: (error) => {
      toast({ title: "Generation Failed", description: (error as Error).message, variant: "destructive" })
    },
  })

  const onSubmit = (data: CurriculumFormValues) => {
    generateMutation.mutate(data)
  }

  if (generatedCurriculum) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{generatedCurriculum.title}</CardTitle>
          <CardDescription>{generatedCurriculum.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Learning Objectives</h4>
            <ul className="space-y-1 list-disc pl-5">
              {generatedCurriculum.objectives.map((obj: string, i: number) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Weekly Breakdown</h4>
            <div className="space-y-4">
              {generatedCurriculum.lessons.map((lesson: any, i: number) => (
                <div key={i} className="p-3 border rounded-md">
                  <p className="font-semibold">{lesson.title}</p>
                  <p className="text-sm text-muted-foreground">{lesson.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={onStartOver}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Start New
            </Button>
            <Button>
              <BookOpen className="mr-2 h-4 w-4" /> Save to Planner
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles />
          AI Curriculum Builder - Step 2: Generate
        </CardTitle>
        <CardDescription>
          Our AI has researched the topics. Now, let's personalize the curriculum for your child.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
          <h4 className="font-semibold mb-2">Research Summary</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Based on your query for <Badge variant="secondary">{researchQuery.subject}</Badge> for{" "}
            <Badge variant="secondary">Grade {researchQuery.grade}</Badge> focusing on{" "}
            <Badge variant="secondary">{researchQuery.topics}</Badge>, we found {researchResults.length} relevant
            resources.
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {researchResults.map((res, i) => (
              <div key={i} className="text-xs p-2 border bg-background rounded-md">
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline truncate block"
                >
                  {res.title}
                </a>
                <p className="text-muted-foreground truncate">{res.snippet}</p>
              </div>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="childName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Child's Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Alex" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Curriculum Duration</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="quarter">Quarter (9 weeks)</SelectItem>
                        <SelectItem value="semester">Semester (18 weeks)</SelectItem>
                        <SelectItem value="year">Full Year (36 weeks)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="learningStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Learning Style (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Visual">Visual</SelectItem>
                      <SelectItem value="Auditory">Auditory</SelectItem>
                      <SelectItem value="Kinesthetic">Hands-on/Kinesthetic</SelectItem>
                      <SelectItem value="Reading/Writing">Reading/Writing</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="focusAreas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Focus Areas (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., critical thinking, creativity" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-between items-center">
              <Button type="button" variant="outline" onClick={onStartOver}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Research
              </Button>
              <Button type="submit" disabled={generateMutation.isPending}>
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Curriculum
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
