"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Database, CheckCircle, AlertCircle } from "lucide-react"

interface FirebaseResource {
  url: string
  title: string
  description: string
  status: "active" | "pending" | "error"
  type: "database" | "storage" | "hosting" | "function"
}

export default function FirebaseUrlIntegration() {
  const [resources] = useState<FirebaseResource[]>([
    {
      url: "https://kzmq2m17onygiuau3ps1.lite.vusercontent.net",
      title: "Firebase Resource",
      description: "External Firebase resource integrated with your homeschool app",
      status: "active",
      type: "hosting",
    },
  ])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Database className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleOpenResource = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Firebase Resources</h3>
        <Badge variant="outline" className="text-xs">
          {resources.length} Resource{resources.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="grid gap-4">
        {resources.map((resource, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  {resource.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusIcon(resource.status)}
                  <Badge variant="outline" className={`text-xs ${getStatusColor(resource.status)}`}>
                    {resource.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">
                    {resource.type}
                  </Badge>
                  <span className="truncate max-w-[200px]">{resource.url}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenResource(resource.url)}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
