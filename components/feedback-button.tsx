"use client"

import { MessageSquarePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FeedbackForm } from "@/components/feedback-form"

export default function FeedbackButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <FeedbackForm
        trigger={
          <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
            <MessageSquarePlus className="h-6 w-6" />
            <span className="sr-only">Send Feedback</span>
          </Button>
        }
      />
    </div>
  )
}
