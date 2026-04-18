"use client"

import { useState, useEffect, useCallback } from "react"
import Navigation from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Plus, Camera, FileText, Award, MapPin, Loader2, Trash2, Image, Filter, X } from "lucide-react"
import {
  getPortfolioEntries,
  addPortfolioEntry,
  deletePortfolioEntry,
} from "@/app/actions/portfolio-actions"
import { getChildren } from "@/app/actions/family-actions"

const ENTRY_TYPES = [
  { value: "work_sample", label: "Work Sample", icon: FileText },
  { value: "photo", label: "Photo", icon: Camera },
  { value: "reflection", label: "Reflection", icon: FileText },
  { value: "achievement", label: "Achievement", icon: Award },
  { value: "field_trip", label: "Field Trip", icon: MapPin },
]

const SUBJECTS = [
  "Math", "Science", "Language Arts", "Reading", "Writing",
  "History", "Geography", "Art", "Music", "PE",
  "Foreign Language", "Technology", "Social Studies", "Other",
]

function getEntryTypeInfo(type: string) {
  return ENTRY_TYPES.find((t) => t.value === type) || ENTRY_TYPES[0]
}

function isImageFile(fileUrl?: string, fileType?: string): boolean {
  if (fileType && fileType.startsWith("image/")) return true
  if (fileUrl) {
    const ext = fileUrl.split(".").pop()?.toLowerCase()
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")
  }
  return false
}

export default function PortfolioPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<any[]>([])
  const [children, setChildren] = useState<any[]>([])

  // Filters
  const [filterChild, setFilterChild] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterSubject, setFilterSubject] = useState<string>("all")
  const [filterStartDate, setFilterStartDate] = useState("")
  const [filterEndDate, setFilterEndDate] = useState("")

  // Dialogs
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<any>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  // Add form state
  const [formTitle, setFormTitle] = useState("")
  const [formChildId, setFormChildId] = useState<string>("")
  const [formEntryType, setFormEntryType] = useState("work_sample")
  const [formSubject, setFormSubject] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0])
  const [formTags, setFormTags] = useState("")
  const [formFile, setFormFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const filters: any = {}
      if (filterChild !== "all") filters.childId = filterChild
      if (filterType !== "all") filters.entryType = filterType
      if (filterSubject !== "all") filters.subject = filterSubject
      if (filterStartDate) filters.startDate = filterStartDate
      if (filterEndDate) filters.endDate = filterEndDate

      const [entriesData, childrenData] = await Promise.all([
        getPortfolioEntries(filters),
        getChildren(),
      ])
      setEntries(entriesData)
      setChildren(childrenData)
    } catch (error) {
      console.error("Failed to load portfolio data:", error)
    } finally {
      setLoading(false)
    }
  }, [filterChild, filterType, filterSubject, filterStartDate, filterEndDate])

  useEffect(() => {
    loadData()
  }, [loadData])

  const resetForm = () => {
    setFormTitle("")
    setFormChildId("")
    setFormEntryType("work_sample")
    setFormSubject("")
    setFormDescription("")
    setFormDate(new Date().toISOString().split("T")[0])
    setFormTags("")
    setFormFile(null)
  }

  const handleAddEntry = async () => {
    if (!formTitle.trim()) {
      toast({ title: "Title required", description: "Please enter a title for this entry.", variant: "destructive" })
      return
    }

    setSubmitting(true)
    try {
      let fileUrl: string | undefined
      let fileType: string | undefined

      if (formFile) {
        setUploading(true)
        const formData = new FormData()
        formData.append("file", formFile)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadRes.ok) {
          throw new Error("Upload failed")
        }

        const { url } = await uploadRes.json()
        fileUrl = url
        fileType = formFile.type
        setUploading(false)
      }

      const tags = formTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

      const result = await addPortfolioEntry({
        title: formTitle,
        childId: formChildId || undefined,
        entryType: formEntryType,
        subject: formSubject || undefined,
        description: formDescription || undefined,
        date: formDate || undefined,
        fileUrl,
        fileType,
        tags: tags.length > 0 ? tags : undefined,
      })

      if (result.success) {
        toast({ title: "Entry added", description: "Portfolio entry has been saved." })
        setShowAddDialog(false)
        resetForm()
        loadData()
      } else {
        toast({ title: "Error", description: "Failed to add entry. Please try again.", variant: "destructive" })
      }
    } catch (error) {
      console.error("Failed to add portfolio entry:", error)
      toast({ title: "Error", description: "Failed to add entry. Please try again.", variant: "destructive" })
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  const handleDeleteEntry = async (id: string) => {
    setDeleting(true)
    try {
      const result = await deletePortfolioEntry(id)
      if (result.success) {
        toast({ title: "Entry deleted", description: "Portfolio entry has been removed." })
        setShowDetailDialog(false)
        setSelectedEntry(null)
        loadData()
      } else {
        toast({ title: "Error", description: "Failed to delete entry.", variant: "destructive" })
      }
    } catch (error) {
      console.error("Failed to delete portfolio entry:", error)
      toast({ title: "Error", description: "Failed to delete entry.", variant: "destructive" })
    } finally {
      setDeleting(false)
    }
  }

  const clearFilters = () => {
    setFilterChild("all")
    setFilterType("all")
    setFilterSubject("all")
    setFilterStartDate("")
    setFilterEndDate("")
  }

  const hasActiveFilters =
    filterChild !== "all" ||
    filterType !== "all" ||
    filterSubject !== "all" ||
    filterStartDate !== "" ||
    filterEndDate !== ""

  return (
    <div className="min-h-screen flex flex-col bg-[var(--linen)] text-[var(--ink)]">
      <Navigation />
      <main className="flex-1 atoz-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="atoz-eyebrow">Portfolio</div>
            <h1 className="font-display text-4xl md:text-5xl font-light tracking-tighter mt-2">
              What they&apos;ve made.
            </h1>
            <p className="text-[var(--ink-2)] mt-2 max-w-[520px]">
              A quiet record of work, in your children&apos;s words and hands.
            </p>
          </div>
          <Button onClick={() => { resetForm(); setShowAddDialog(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>

        {/* Filter Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Child</Label>
                <Select value={filterChild} onValueChange={setFilterChild}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Children" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Children</SelectItem>
                    {children.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Entry Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {ENTRY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Subject</Label>
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {SUBJECTS.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Start Date</Label>
                <Input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">End Date</Label>
                <Input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Image className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No portfolio entries yet</h3>
              <p className="text-muted-foreground text-center mb-4 max-w-md">
                Start building your portfolio by adding work samples, photos, achievements, and more.
              </p>
              <Button onClick={() => { resetForm(); setShowAddDialog(true) }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => {
              const typeInfo = getEntryTypeInfo(entry.entry_type)
              const TypeIcon = typeInfo.icon
              const hasImage = isImageFile(entry.file_url, entry.file_type)

              return (
                <Card
                  key={entry.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedEntry(entry)
                    setShowDetailDialog(true)
                  }}
                >
                  {hasImage && entry.file_url && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                      <img
                        src={entry.file_url}
                        alt={entry.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className={hasImage ? "pt-4" : ""}>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-1">{entry.title}</CardTitle>
                      <TypeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {entry.child_name && (
                        <Badge variant="secondary">{entry.child_name}</Badge>
                      )}
                      {entry.subject && (
                        <Badge variant="outline">{entry.subject}</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {typeInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {entry.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {entry.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {entry.date
                        ? new Date(entry.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "No date"}
                    </p>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.tags.map((tag: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedEntry && (() => {
              const typeInfo = getEntryTypeInfo(selectedEntry.entry_type)
              const TypeIcon = typeInfo.icon
              const hasImage = isImageFile(selectedEntry.file_url, selectedEntry.file_type)

              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <TypeIcon className="h-5 w-5" />
                      {selectedEntry.title}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedEntry.date
                        ? new Date(selectedEntry.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "No date"}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.child_name && (
                        <Badge variant="secondary">{selectedEntry.child_name}</Badge>
                      )}
                      {selectedEntry.subject && (
                        <Badge variant="outline">{selectedEntry.subject}</Badge>
                      )}
                      <Badge variant="outline">{typeInfo.label}</Badge>
                    </div>

                    {hasImage && selectedEntry.file_url && (
                      <div className="rounded-lg overflow-hidden border">
                        <img
                          src={selectedEntry.file_url}
                          alt={selectedEntry.title}
                          className="w-full max-h-96 object-contain"
                        />
                      </div>
                    )}

                    {!hasImage && selectedEntry.file_url && (
                      <div className="rounded-lg border p-4 flex items-center gap-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Attached File</p>
                          <a
                            href={selectedEntry.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View File
                          </a>
                        </div>
                      </div>
                    )}

                    {selectedEntry.description && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Description</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {selectedEntry.description}
                        </p>
                      </div>
                    )}

                    {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Tags</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedEntry.tags.map((tag: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteEntry(selectedEntry.id)}
                      disabled={deleting}
                    >
                      {deleting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Delete Entry
                    </Button>
                  </DialogFooter>
                </>
              )
            })()}
          </DialogContent>
        </Dialog>

        {/* Add Entry Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Portfolio Entry</DialogTitle>
              <DialogDescription>
                Record a piece of your child&apos;s learning journey.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="entry-title">Title *</Label>
                <Input
                  id="entry-title"
                  placeholder="e.g., Science Fair Project"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="entry-child">Child</Label>
                <Select value={formChildId} onValueChange={setFormChildId}>
                  <SelectTrigger id="entry-child">
                    <SelectValue placeholder="Select a child" />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="entry-type">Entry Type</Label>
                <Select value={formEntryType} onValueChange={setFormEntryType}>
                  <SelectTrigger id="entry-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTRY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="entry-subject">Subject</Label>
                <Select value={formSubject} onValueChange={setFormSubject}>
                  <SelectTrigger id="entry-subject">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="entry-description">Description</Label>
                <Textarea
                  id="entry-description"
                  placeholder="Describe what was learned or accomplished..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="entry-date">Date</Label>
                <Input
                  id="entry-date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="entry-file">File Upload</Label>
                <Input
                  id="entry-file"
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => setFormFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Images, PDFs, or documents
                </p>
              </div>

              <div>
                <Label htmlFor="entry-tags">Tags</Label>
                <Input
                  id="entry-tags"
                  placeholder="e.g., creative writing, poetry (comma-separated)"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEntry} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {uploading ? "Uploading..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entry
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
