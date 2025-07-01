"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Globe, CheckCircle, AlertCircle } from "lucide-react"

interface FirebaseResource {
  url: string
  title: string
  description: string
  status: "active" | "loading" | "error"
  type: string
}

export default function FirebaseUrlIntegration() {
  const [resource, setResource] = useState<FirebaseResource>({
    url: "https://kzmq2m17onygiuau3ps1.lite.vusercontent.net",
    title: "AtoZ Family Firebase Resource",
    description: "External Firebase resource integrated with your homeschool platform",
    status: "loading",
    type: "External Tool",
  })

  useEffect(() => {
    // Simulate checking resource status
    const checkResourceStatus = async () => {
      try {
        // In a real implementation, you might ping the resource or check its status
        setTimeout(() => {
          setResource((prev) => ({ ...prev, status: "active" }))
        }, 2000)
      } catch (error) {
        setResource((prev) => ({ ...prev, status: "error" }))
      }
    }

    checkResourceStatus()
  }, [])

  const handleOpenResource = () => {
    window.open(resource.url, "_blank", "noopener,noreferrer")
  }

  const getStatusIcon = () => {
    switch (resource.status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 rounded-full bg-yellow-500 animate-pulse" />
    }
  }

  const getStatusText = () => {
    switch (resource.status) {
      case "active":
        return "Active"
      case "error":
        return "Error"
      default:
        return "Loading"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{resource.title}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <Badge variant={resource.status === "active" ? "default" : "secondary"}>{getStatusText()}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{resource.type}</Badge>
            <span className="text-xs text-muted-foreground">Firebase Integration</span>
          </div>

          <Button
            onClick={handleOpenResource}
            disabled={resource.status !== "active"}
            size="sm"
            className="flex items-center space-x-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Open Resource</span>
          </Button>
        </div>

        {resource.status === "active" && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-xs text-green-700 dark:text-green-300">
              ✓ Resource is connected and ready to use with your AtoZ Family homeschool platform
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
