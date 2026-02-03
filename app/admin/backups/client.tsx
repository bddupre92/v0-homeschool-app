"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"

// This component will only be loaded in the browser, not during build
export function BackupsClient() {
  const [backups, setBackups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch backups when component mounts (only in browser)
    async function fetchBackups() {
      try {
        const response = await fetch("/api/backups")
        const data = await response.json()
        setBackups(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBackups()
  }, [])

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B"
    const kb = bytes / 1024
    if (kb < 1024) return kb.toFixed(1) + " KB"
    const mb = kb / 1024
    return mb.toFixed(1) + " MB"
  }

  if (loading) return <p>Loading backups...</p>
  if (error) return <p>Error loading backups: {error}</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup History</CardTitle>
        <CardDescription>Previous database backups</CardDescription>
      </CardHeader>
      <CardContent>
        {backups.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">No backups found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((backup) => {
                const created = new Date(backup.created)
                return (
                  <TableRow key={backup.name}>
                    <TableCell className="font-mono text-xs">{backup.name.replace("backups/", "")}</TableCell>
                    <TableCell>{formatFileSize(Number(backup.size))}</TableCell>
                    <TableCell>
                      <time dateTime={created.toISOString()}>{formatDistanceToNow(created, { addSuffix: true })}</time>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => downloadBackup(backup.name)}>
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={createBackup}>Create New Backup</Button>
      </CardFooter>
    </Card>
  )

  async function downloadBackup(name) {
    // Implementation would go here
    console.log(`Downloading backup: ${name}`)
  }

  async function createBackup() {
    // Implementation would go here
    console.log("Creating new backup")
  }
}
