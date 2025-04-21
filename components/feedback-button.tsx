"use client"

import type React from "react"

import { useState } from "react"
import { MessageSquare } from "lucide-react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

export default function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState("suggestion")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await addDoc(collection(db, "feedback"), {
        type,
        message,
        userId: user?.uid || "anonymous",
        userEmail: user?.email || "anonymous",
        createdAt: serverTimestamp(),
        status: "new",
      })

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      })

      setMessage("")
      setType("suggestion")
      setOpen(false)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="fixed bottom-4 right-4 z-50">
          <MessageSquare className="mr-2 h-4 w-4" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>We'd love to hear your thoughts on how we can improve HomeScholar.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <RadioGroup
              defaultValue="suggestion"
              value={type}
              onValueChange={setType}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem value="suggestion" id="suggestion" className="peer sr-only" />
                <Label
                  htmlFor="suggestion"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  Suggestion
                </Label>
              </div>
              <div>
                <RadioGroupItem value="issue" id="issue" className="peer sr-only" />
                <Label
                  htmlFor="issue"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  Issue
                </Label>
              </div>
              <div>
                <RadioGroupItem value="question" id="question" className="peer sr-only" />
                <Label
                  htmlFor="question"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  Question
                </Label>
              </div>
            </RadioGroup>
            <div className="grid gap-2">
              <Label htmlFor="message">Your message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you think..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Feedback"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
