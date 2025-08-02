"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, AlertCircle, ExternalLink } from "lucide-react"

interface ChecklistItem {
  id: string
  title: string
  description: string
  category: "setup" | "security" | "performance" | "testing" | "deployment"
  priority: "high" | "medium" | "low"
  completed: boolean
  links?: { text: string; url: string }[]
}

export function DeploymentChecklist() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    // Setup & Configuration
    {
      id: "env-vars",
      title: "Environment Variables",
      description: "Set all required environment variables in Vercel dashboard",
      category: "setup",
      priority: "high",
      completed: false,
      links: [
        {
          text: "Vercel Environment Variables",
          url: "https://vercel.com/docs/concepts/projects/environment-variables",
        },
      ],
    },
    {
      id: "firebase-config",
      title: "Firebase Configuration",
      description: "Configure Firebase project with production settings",
      category: "setup",
      priority: "high",
      completed: false,
      links: [{ text: "Firebase Console", url: "https://console.firebase.google.com" }],
    },
    {
      id: "google-auth",
      title: "Google Authentication Setup",
      description: "Enable Google sign-in and add authorized domains",
      category: "setup",
      priority: "high",
      completed: false,
    },
    {
      id: "domain-config",
      title: "Domain Configuration",
      description: "Configure custom domain (atozfamily.org) in Vercel",
      category: "setup",
      priority: "high",
      completed: false,
    },

    // Security
    {
      id: "firestore-rules",
      title: "Firestore Security Rules",
      description: "Deploy production-ready Firestore security rules",
      category: "security",
      priority: "high",
      completed: false,
    },
    {
      id: "storage-rules",
      title: "Storage Security Rules",
      description: "Deploy production-ready Storage security rules",
      category: "security",
      priority: "high",
      completed: false,
    },
    {
      id: "auth-bypass",
      title: "Disable Auth Bypass",
      description: "Set DEV_MODE_BYPASS_AUTH to false in auth context",
      category: "security",
      priority: "high",
      completed: false,
    },
    {
      id: "middleware-auth",
      title: "Enable Middleware Auth",
      description: "Uncomment auth protection in middleware.ts",
      category: "security",
      priority: "high",
      completed: false,
    },

    // Performance
    {
      id: "image-optimization",
      title: "Image Optimization",
      description: "Run image optimization script and verify images are optimized",
      category: "performance",
      priority: "medium",
      completed: false,
    },
    {
      id: "bundle-analysis",
      title: "Bundle Size Analysis",
      description: "Analyze and optimize bundle size",
      category: "performance",
      priority: "medium",
      completed: false,
      links: [{ text: "Next.js Bundle Analyzer", url: "https://www.npmjs.com/package/@next/bundle-analyzer" }],
    },
    {
      id: "lighthouse-audit",
      title: "Lighthouse Audit",
      description: "Run Lighthouse audit and fix performance issues",
      category: "performance",
      priority: "medium",
      completed: false,
    },

    // Testing
    {
      id: "auth-flow-test",
      title: "Authentication Flow Testing",
      description: "Test sign-up, sign-in, and Google auth in production",
      category: "testing",
      priority: "high",
      completed: false,
    },
    {
      id: "responsive-test",
      title: "Responsive Design Testing",
      description: "Test on mobile, tablet, and desktop devices",
      category: "testing",
      priority: "high",
      completed: false,
    },
    {
      id: "browser-compatibility",
      title: "Browser Compatibility",
      description: "Test on Chrome, Firefox, Safari, and Edge",
      category: "testing",
      priority: "medium",
      completed: false,
    },
    {
      id: "error-handling",
      title: "Error Handling Testing",
      description: "Test error boundaries and fallback UI",
      category: "testing",
      priority: "medium",
      completed: false,
    },

    // Deployment
    {
      id: "build-success",
      title: "Production Build",
      description: "Ensure production build completes without errors",
      category: "deployment",
      priority: "high",
      completed: false,
    },
    {
      id: "seo-meta",
      title: "SEO Meta Tags",
      description: "Verify all pages have proper meta tags and Open Graph data",
      category: "deployment",
      priority: "medium",
      completed: false,
    },
    {
      id: "sitemap",
      title: "Sitemap Generation",
      description: "Generate and submit sitemap to search engines",
      category: "deployment",
      priority: "medium",
      completed: false,
    },
    {
      id: "analytics",
      title: "Analytics Setup",
      description: "Verify Vercel Analytics is working correctly",
      category: "deployment",
      priority: "medium",
      completed: false,
    },
    {
      id: "monitoring",
      title: "Error Monitoring",
      description: "Set up error monitoring (Sentry) for production",
      category: "deployment",
      priority: "medium",
      completed: false,
    },
  ])

  const toggleItem = (id: string) => {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const getCategoryStats = (category: string) => {
    const items = checklist.filter((item) => item.category === category)
    const completed = items.filter((item) => item.completed).length
    return { completed, total: items.length }
  }

  const getOverallProgress = () => {
    const completed = checklist.filter((item) => item.completed).length
    return Math.round((completed / checklist.length) * 100)
  }

  const categories = [
    { key: "setup", name: "Setup & Configuration", color: "bg-blue-500" },
    { key: "security", name: "Security", color: "bg-red-500" },
    { key: "performance", name: "Performance", color: "bg-green-500" },
    { key: "testing", name: "Testing", color: "bg-yellow-500" },
    { key: "deployment", name: "Deployment", color: "bg-purple-500" },
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Deployment Checklist</h1>
        <p className="text-muted-foreground">Complete all items before deploying to production</p>
        <div className="text-2xl font-bold text-primary">{getOverallProgress()}% Complete</div>
      </div>

      {categories.map((category) => {
        const stats = getCategoryStats(category.key)
        const items = checklist.filter((item) => item.category === category.key)

        return (
          <Card key={category.key}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${category.color}`} />
                  <CardTitle>{category.name}</CardTitle>
                </div>
                <Badge variant={stats.completed === stats.total ? "default" : "secondary"}>
                  {stats.completed}/{stats.total}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                  <button onClick={() => toggleItem(item.id)} className="mt-0.5 text-primary hover:text-primary/80">
                    {item.completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </button>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                        {item.title}
                      </h3>
                      <Badge
                        variant={
                          item.priority === "high"
                            ? "destructive"
                            : item.priority === "medium"
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {item.priority}
                      </Badge>
                    </div>

                    <p
                      className={`text-sm ${item.completed ? "line-through text-muted-foreground" : "text-muted-foreground"}`}
                    >
                      {item.description}
                    </p>

                    {item.links && (
                      <div className="flex flex-wrap gap-2">
                        {item.links.map((link, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs bg-transparent"
                            onClick={() => window.open(link.url, "_blank")}
                          >
                            {link.text}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <span>Ready to Deploy?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-800 mb-4">
            Make sure all high-priority items are completed before deploying to production. Medium and low priority
            items can be addressed post-launch.
          </p>
          <div className="flex space-x-2">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              disabled={checklist.filter((item) => item.priority === "high" && !item.completed).length > 0}
            >
              Deploy to Production
            </Button>
            <Button variant="outline">Run Final Tests</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
