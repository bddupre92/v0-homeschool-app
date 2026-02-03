"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function WelcomeTour() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const checkFirstVisit = async () => {
      if (!user) return

      try {
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists() && !userDoc.data().hasSeenWelcomeTour) {
          setOpen(true)
          // Mark that the user has seen the welcome tour
          await setDoc(userDocRef, { hasSeenWelcomeTour: true }, { merge: true })
        }
      } catch (error) {
        console.error("Error checking first visit:", error)
      }
    }

    checkFirstVisit()
  }, [user])

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      setOpen(false)
    }
  }

  const handleSkip = () => {
    setOpen(false)
  }

  const steps = [
    {
      title: "Welcome to HomeScholar!",
      description: "Your all-in-one platform for homeschool resources, planning, and community.",
      action: "Next",
    },
    {
      title: "Discover Resources",
      description: "Browse and save educational resources, organize them into boards, and share with others.",
      action: "Next",
    },
    {
      title: "Plan Your Curriculum",
      description: "Use the planner to schedule activities, track progress, and manage your homeschool journey.",
      action: "Next",
    },
    {
      title: "Connect with Others",
      description: "Join the community to share ideas, ask questions, and connect with other homeschoolers.",
      action: "Get Started",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{steps[step - 1].title}</DialogTitle>
          <DialogDescription>{steps[step - 1].description}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-4">
          <div className="relative h-40 w-full rounded-md bg-muted flex items-center justify-center">
            {/* Tour step illustration would go here */}
            <div className="text-4xl">Step {step}</div>
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button variant="outline" onClick={handleSkip}>
            Skip Tour
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div key={i} className={`h-1.5 w-5 rounded-full ${i + 1 === step ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
            <Button onClick={handleNext}>{steps[step - 1].action}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
