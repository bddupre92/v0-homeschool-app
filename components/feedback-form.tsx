"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"

interface FeedbackFormProps {
  trigger?: React.ReactNode
}

export function FeedbackForm({ trigger }: FeedbackFormProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<string>("feedback")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setResult({
        success: false,
        message: "You must be signed in to submit feedback.",
      })
      return
    }

    if (!title.trim() || !description.trim()) {
      setResult({
        success: false,
        message: "Please fill in all fields.",
      })
      return
    }

    setIsSubmitting(true)
    setResult(null)

    try {
      await addDoc(collection(db, "feedback"), {
        type,
        title,
        description,
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        status: "new",
      })

      setResult({
        success: true,
        message: "Thank you for your feedback! We appreciate your input.",
      })

      // Reset form
      setType("feedback")
      setTitle("")
      setDescription("")

      // Close dialog after a delay
      setTimeout(() => {
        setOpen(false)
        setResult(null)
      }, 3000)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      setResult({
        success: false,
        message: "An error occurred while submitting your feedback. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button variant="outline">Send Feedback</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>We value your input! Let us know how we can improve HomeScholar.</DialogDescription>
        </DialogHeader>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-type">Feedback Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="feedback-type">
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feedback">General Feedback</SelectItem>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="content">Content Suggestion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-title">Title</Label>
            <Input
              id="feedback-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your feedback"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-description">Description</Label>
            <Textarea
              id="feedback-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details about your feedback, bug report, or feature request"
              rows={5}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
