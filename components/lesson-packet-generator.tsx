"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, Sparkles, FileText } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { savePacket } from "@/app/actions/packet-actions"
import type { LessonPacket } from "@/lib/types"
import LessonPacketViewer from "./lesson-packet-viewer"

const formSchema = z.object({
  childName: z.string().min(1, "Child's name is required"),
  grade: z.string().min(1, "Grade level is required"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  learningStyle: z.string().optional(),
  interests: z.string().optional(),
  location: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function LessonPacketGenerator() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPacket, setGeneratedPacket] = useState<LessonPacket | null>(null)
  const [savedPacketId, setSavedPacketId] = useState<string | null>(null)
  const [streamProgress, setStreamProgress] = useState("")

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      childName: "",
      grade: "",
      subject: "",
      topic: "",
      learningStyle: "",
      interests: "",
      location: "",
    },
  })

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to generate lesson packets.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setStreamProgress("")
    setGeneratedPacket(null)

    try {
      const response = await fetch("/api/ai/generate-lesson-packet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to generate lesson packet")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          fullResponse += chunk
          // Show progress indicator based on content length
          const chars = fullResponse.length
          if (chars < 2000) setStreamProgress("Generating student lesson...")
          else if (chars < 5000) setStreamProgress("Creating worksheet and activities...")
          else if (chars < 8000) setStreamProgress("Writing teacher guide...")
          else if (chars < 11000) setStreamProgress("Building materials list and experiment...")
          else if (chars < 14000) setStreamProgress("Finding local exploration ideas...")
          else setStreamProgress("Adding extension activities...")
        }
      }

      // Clean up the response - strip any potential prefix/suffix from streaming
      let jsonStr = fullResponse.trim()

      // Handle common AI response formatting issues
      const jsonStart = jsonStr.indexOf("{")
      const jsonEnd = jsonStr.lastIndexOf("}")
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonStr = jsonStr.slice(jsonStart, jsonEnd + 1)
      }

      const packetData = JSON.parse(jsonStr)

      const packet: LessonPacket = {
        id: crypto.randomUUID(),
        title: packetData.studentLesson?.title || `${data.topic} - ${data.subject}`,
        subject: data.subject,
        grade: data.grade,
        childName: data.childName,
        topic: data.topic,
        createdAt: new Date().toISOString(),
        studentLesson: packetData.studentLesson,
        worksheet: packetData.worksheet,
        teacherGuide: packetData.teacherGuide,
        materialsList: packetData.materialsList,
        experiment: packetData.experiment,
        localExploration: packetData.localExploration,
        extensions: packetData.extensions,
      }

      setGeneratedPacket(packet)

      // Auto-save to database
      const saveResult = await savePacket(packet, {
        learningStyle: data.learningStyle,
        interests: data.interests,
        location: data.location,
      })
      if (saveResult.success && saveResult.packet) {
        setSavedPacketId(saveResult.packet.id)
      }

      toast({
        title: "Lesson packet created!",
        description: `"${packet.title}" is ready to teach.${saveResult.success ? " Saved to your library." : ""}`,
      })
    } catch (error) {
      console.error("Error generating lesson packet:", error)
      toast({
        title: "Generation failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
      setStreamProgress("")
    }
  }

  if (generatedPacket) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => {
            setGeneratedPacket(null)
            setSavedPacketId(null)
            form.reset()
          }}
        >
          Generate Another Packet
        </Button>
        <LessonPacketViewer packet={generatedPacket} savedPacketId={savedPacketId} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Lesson Packet Generator
          </CardTitle>
          <CardDescription>
            Generate a complete, print-ready lesson packet with student materials, worksheets, teacher guide,
            hands-on experiments, and more. Just fill in the details and let AI do the rest.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                        <Input placeholder="Emma" {...field} />
                      </FormControl>
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
                          <SelectItem value="Kindergarten">Kindergarten</SelectItem>
                          <SelectItem value="1st Grade">1st Grade</SelectItem>
                          <SelectItem value="2nd Grade">2nd Grade</SelectItem>
                          <SelectItem value="3rd Grade">3rd Grade</SelectItem>
                          <SelectItem value="4th Grade">4th Grade</SelectItem>
                          <SelectItem value="5th Grade">5th Grade</SelectItem>
                          <SelectItem value="6th Grade">6th Grade</SelectItem>
                          <SelectItem value="7th Grade">7th Grade</SelectItem>
                          <SelectItem value="8th Grade">8th Grade</SelectItem>
                          <SelectItem value="9th Grade">9th Grade</SelectItem>
                          <SelectItem value="10th Grade">10th Grade</SelectItem>
                          <SelectItem value="11th Grade">11th Grade</SelectItem>
                          <SelectItem value="12th Grade">12th Grade</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                          <SelectItem value="Geography">Geography</SelectItem>
                          <SelectItem value="Art">Art</SelectItem>
                          <SelectItem value="Music">Music</SelectItem>
                          <SelectItem value="Physical Education">Physical Education</SelectItem>
                          <SelectItem value="Foreign Language">Foreign Language</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="learningStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Learning Style (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Visual">Visual Learner</SelectItem>
                          <SelectItem value="Auditory">Auditory Learner</SelectItem>
                          <SelectItem value="Kinesthetic">Hands-on/Kinesthetic</SelectItem>
                          <SelectItem value="Reading/Writing">Reading/Writing</SelectItem>
                          <SelectItem value="Mixed">Mixed Approach</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson Topic</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. The Lewis and Clark Expedition, Introduction to Fractions, The Water Cycle"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Child's Interests (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="dinosaurs, space, art, sports (comma-separated)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Location (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Portland, Oregon — for local field trip suggestions"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isGenerating} className="w-full" size="lg">
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {streamProgress || "Preparing..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Generate Lesson Packet
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
