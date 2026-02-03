"use client"

import { useState, useEffect } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

export function CookieConsent() {
  const [open, setOpen] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: true,
    marketing: false,
    preferences: true,
  })

  useEffect(() => {
    // Check if user has already set cookie preferences
    const hasConsent = localStorage.getItem("cookieConsent")
    if (!hasConsent) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setShowBanner(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    setPreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    })

    saveCookiePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    })

    setShowBanner(false)
  }

  const handleAcceptSelected = () => {
    saveCookiePreferences(preferences)
    setOpen(false)
    setShowBanner(false)
  }

  const handleRejectAll = () => {
    const newPreferences = {
      necessary: true, // Always required
      analytics: false,
      marketing: false,
      preferences: false,
    }

    setPreferences(newPreferences)
    saveCookiePreferences(newPreferences)
    setShowBanner(false)
  }

  const saveCookiePreferences = (prefs: CookiePreferences) => {
    // Save preferences to localStorage
    localStorage.setItem("cookieConsent", "true")
    localStorage.setItem("cookiePreferences", JSON.stringify(prefs))

    // Here you would also set the actual cookies based on preferences
    // For example, enable/disable Google Analytics based on analytics preference
    if (prefs.analytics) {
      // Enable analytics
      console.log("Analytics enabled")
    } else {
      // Disable analytics
      console.log("Analytics disabled")
    }
  }

  if (!showBanner) {
    return null
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-50">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm">
            <p className="font-medium">We use cookies to improve your experience</p>
            <p className="text-muted-foreground">
              By continuing to use this site, you agree to our use of cookies for analytics, personalization, and
              advertising.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Customize
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Cookie Preferences</DialogTitle>
                  <DialogDescription>
                    Customize your cookie preferences. Some cookies are required for the website to function properly.
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="essential" className="mt-4">
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="essential">Essential</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="marketing">Marketing</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                  </TabsList>

                  <TabsContent value="essential" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Essential Cookies</h4>
                        <p className="text-sm text-muted-foreground">
                          These cookies are necessary for the website to function and cannot be disabled.
                        </p>
                      </div>
                      <Switch checked={true} disabled />
                    </div>
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Analytics Cookies</h4>
                        <p className="text-sm text-muted-foreground">
                          These cookies help us understand how visitors interact with the website.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.analytics}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, analytics: checked })}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="marketing" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Marketing Cookies</h4>
                        <p className="text-sm text-muted-foreground">
                          These cookies are used to track visitors across websites to display relevant advertisements.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.marketing}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, marketing: checked })}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="preferences" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Preference Cookies</h4>
                        <p className="text-sm text-muted-foreground">
                          These cookies enable personalized features and functionality.
                        </p>
                      </div>
                      <Switch
                        checked={preferences.preferences}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, preferences: checked })}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter className="mt-6">
                  <Button variant="outline" onClick={handleRejectAll}>
                    Reject All
                  </Button>
                  <Button onClick={handleAcceptSelected}>Save Preferences</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={handleRejectAll}>
              Reject All
            </Button>
            <Button size="sm" onClick={handleAcceptAll}>
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
