import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"

// Mock data for backups
const mockBackups = [
  {
    name: "backups/backup-2025-04-25.json",
    size: "1024000",
    created: new Date().toISOString(),
  },
  {
    name: "backups/backup-2025-04-24.json",
    size: "985000",
    created: new Date(Date.now() - 86400000).toISOString(),
  },
]

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  const kb = bytes / 1024
  if (kb < 1024) return kb.toFixed(1) + " KB"
  const mb = kb / 1024
  return mb.toFixed(1) + " MB"
}

// Static page that doesn't rely on Firebase during build
export default function BackupsPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Database Backups</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>Previous database backups</CardDescription>
        </CardHeader>
        <CardContent>
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
              {mockBackups.map((backup) => {
                const created = new Date(backup.created)
                return (
                  <TableRow key={backup.name}>
                    <TableCell className="font-mono text-xs">{backup.name.replace("backups/", "")}</TableCell>
                    <TableCell>{formatFileSize(Number(backup.size))}</TableCell>
                    <TableCell>
                      <time dateTime={created.toISOString()}>{formatDistanceToNow(created, { addSuffix: true })}</time>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button>Create New Backup</Button>
        </CardFooter>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
        <p className="text-yellow-800">
          Note: This is a static preview. Backup functionality will be available in the deployed application.
        </p>
      </div>
    </div>
  )
}
