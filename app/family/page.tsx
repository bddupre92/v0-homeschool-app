"use client"

import { useState, useEffect, useCallback } from "react"
import Navigation from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { Heart, Plus, X, User, GraduationCap, Trash2, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getFamilyBlueprint,
  saveFamilyBlueprint,
  getChildren,
  addChild,
  updateChild,
  deleteChild,
} from "@/app/actions/family-actions"

const FAMILY_VALUES = [
  "Faith", "Curiosity", "Resilience", "Kindness", "Independence",
  "Creativity", "Integrity", "Compassion", "Perseverance", "Gratitude",
  "Respect", "Responsibility", "Courage", "Honesty", "Joy",
  "Service", "Humility", "Discipline", "Love of Learning", "Community"
]

const PHILOSOPHIES = [
  "Charlotte Mason", "Classical", "Montessori", "Waldorf", "Unschooling",
  "Eclectic", "Traditional", "Unit Study", "Nature-Based", "Hands-On Learning",
  "Project-Based", "Literature-Based", "STEM-Focused", "Reggio Emilia"
]

const LEARNING_STYLES = [
  "Visual", "Auditory", "Kinesthetic", "Reading/Writing",
  "Visual & Hands-On", "Auditory & Kinesthetic", "Multimodal"
]

const GRADES = [
  "Pre-K", "Kindergarten", "1st", "2nd", "3rd", "4th", "5th",
  "6th", "7th", "8th", "9th", "10th", "11th", "12th"
]

const US_STATES = [
  { abbr: "AL", name: "Alabama" }, { abbr: "AK", name: "Alaska" }, { abbr: "AZ", name: "Arizona" },
  { abbr: "AR", name: "Arkansas" }, { abbr: "CA", name: "California" }, { abbr: "CO", name: "Colorado" },
  { abbr: "CT", name: "Connecticut" }, { abbr: "DE", name: "Delaware" }, { abbr: "FL", name: "Florida" },
  { abbr: "GA", name: "Georgia" }, { abbr: "HI", name: "Hawaii" }, { abbr: "ID", name: "Idaho" },
  { abbr: "IL", name: "Illinois" }, { abbr: "IN", name: "Indiana" }, { abbr: "IA", name: "Iowa" },
  { abbr: "KS", name: "Kansas" }, { abbr: "KY", name: "Kentucky" }, { abbr: "LA", name: "Louisiana" },
  { abbr: "ME", name: "Maine" }, { abbr: "MD", name: "Maryland" }, { abbr: "MA", name: "Massachusetts" },
  { abbr: "MI", name: "Michigan" }, { abbr: "MN", name: "Minnesota" }, { abbr: "MS", name: "Mississippi" },
  { abbr: "MO", name: "Missouri" }, { abbr: "MT", name: "Montana" }, { abbr: "NE", name: "Nebraska" },
  { abbr: "NV", name: "Nevada" }, { abbr: "NH", name: "New Hampshire" }, { abbr: "NJ", name: "New Jersey" },
  { abbr: "NM", name: "New Mexico" }, { abbr: "NY", name: "New York" }, { abbr: "NC", name: "North Carolina" },
  { abbr: "ND", name: "North Dakota" }, { abbr: "OH", name: "Ohio" }, { abbr: "OK", name: "Oklahoma" },
  { abbr: "OR", name: "Oregon" }, { abbr: "PA", name: "Pennsylvania" }, { abbr: "RI", name: "Rhode Island" },
  { abbr: "SC", name: "South Carolina" }, { abbr: "SD", name: "South Dakota" }, { abbr: "TN", name: "Tennessee" },
  { abbr: "TX", name: "Texas" }, { abbr: "UT", name: "Utah" }, { abbr: "VT", name: "Vermont" },
  { abbr: "VA", name: "Virginia" }, { abbr: "WA", name: "Washington" }, { abbr: "WV", name: "West Virginia" },
  { abbr: "WI", name: "Wisconsin" }, { abbr: "WY", name: "Wyoming" }, { abbr: "DC", name: "District of Columbia" }
]

interface Child {
  id?: string
  name: string
  age?: number
  grade?: string
  learningStyle?: string
  interests: string[]
  strengths: string[]
  challenges: string[]
}

interface TraitPillar {
  name: string
  description: string
}

export default function FamilyPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  // Loading state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingChild, setSavingChild] = useState(false)

  // Blueprint state
  const [familyName, setFamilyName] = useState("")
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [selectedPhilosophies, setSelectedPhilosophies] = useState<string[]>([])
  const [traitPillars, setTraitPillars] = useState<TraitPillar[]>([])
  const [newPillarName, setNewPillarName] = useState("")
  const [newPillarDesc, setNewPillarDesc] = useState("")
  const [stateAbbr, setStateAbbr] = useState("")

  // Children state
  const [children, setChildren] = useState<Child[]>([])

  // New child form
  const [showAddChild, setShowAddChild] = useState(false)
  const [newChild, setNewChild] = useState<Child>({
    name: "", interests: [], strengths: [], challenges: []
  })

  // Load saved data on mount
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [blueprint, childrenData] = await Promise.all([
        getFamilyBlueprint(),
        getChildren(),
      ])

      if (blueprint) {
        setFamilyName(blueprint.family_name || "")
        setSelectedValues(blueprint.values || [])
        setSelectedPhilosophies(blueprint.philosophy || [])
        setTraitPillars(
          typeof blueprint.trait_pillars === "string"
            ? JSON.parse(blueprint.trait_pillars)
            : blueprint.trait_pillars || []
        )
        setStateAbbr(blueprint.state_abbreviation || "")
      }

      if (childrenData.length > 0) {
        setChildren(childrenData.map((c: any) => ({
          id: c.id,
          name: c.name,
          age: c.age || undefined,
          grade: c.grade || undefined,
          learningStyle: c.learning_style || undefined,
          interests: c.interests || [],
          strengths: c.strengths || [],
          challenges: c.challenges || [],
        })))
      }
    } catch (error) {
      console.error("Failed to load family data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const toggleValue = (value: string) => {
    setSelectedValues(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  const togglePhilosophy = (p: string) => {
    setSelectedPhilosophies(prev =>
      prev.includes(p) ? prev.filter(v => v !== p) : [...prev, p]
    )
  }

  const addPillar = () => {
    if (newPillarName.trim()) {
      setTraitPillars(prev => [...prev, { name: newPillarName.trim(), description: newPillarDesc.trim() }])
      setNewPillarName("")
      setNewPillarDesc("")
    }
  }

  const removePillar = (idx: number) => {
    setTraitPillars(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSaveBlueprint = async () => {
    setSaving(true)
    try {
      const result = await saveFamilyBlueprint({
        familyName,
        values: selectedValues,
        philosophy: selectedPhilosophies,
        traitPillars,
        stateAbbreviation: stateAbbr || undefined,
      })
      if (result.success) {
        toast({ title: "Blueprint saved", description: "Your family blueprint has been saved." })
      } else {
        toast({ title: "Error", description: result.error || "Failed to save blueprint.", variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to save blueprint.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleAddChild = async () => {
    if (!newChild.name.trim()) return
    setSavingChild(true)
    try {
      const result = await addChild({
        name: newChild.name,
        age: newChild.age,
        grade: newChild.grade,
        learningStyle: newChild.learningStyle,
        interests: newChild.interests,
        strengths: newChild.strengths,
        challenges: newChild.challenges,
      })
      if (result.success) {
        toast({ title: "Child added", description: `${newChild.name} has been added to your family.` })
        setNewChild({ name: "", interests: [], strengths: [], challenges: [] })
        setShowAddChild(false)
        loadData()
      } else {
        toast({ title: "Error", description: result.error || "Failed to add child.", variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to add child.", variant: "destructive" })
    } finally {
      setSavingChild(false)
    }
  }

  const handleDeleteChild = async (child: Child) => {
    if (!child.id) return
    try {
      const result = await deleteChild(child.id)
      if (result.success) {
        toast({ title: "Child removed", description: `${child.name} has been removed.` })
        loadData()
      }
    } catch {
      toast({ title: "Error", description: "Failed to remove child.", variant: "destructive" })
    }
  }

  const addTagToChild = (childIdx: number, field: "interests" | "strengths" | "challenges", value: string) => {
    if (!value.trim()) return
    const child = children[childIdx]
    if (!child.id) return
    const updated = { ...child, [field]: [...child[field], value.trim()] }
    setChildren(prev => prev.map((c, i) => i === childIdx ? updated : c))
    // Save in background
    updateChild(child.id, { [field]: updated[field] })
  }

  const removeTagFromChild = (childIdx: number, field: "interests" | "strengths" | "challenges", tagIdx: number) => {
    const child = children[childIdx]
    if (!child.id) return
    const updated = { ...child, [field]: child[field].filter((_, ti) => ti !== tagIdx) }
    setChildren(prev => prev.map((c, i) => i === childIdx ? updated : c))
    // Save in background
    updateChild(child.id, { [field]: updated[field] })
  }

  const addTagToNewChild = (field: "interests" | "strengths" | "challenges", value: string) => {
    if (!value.trim()) return
    setNewChild(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }))
  }

  const removeTagFromNewChild = (field: "interests" | "strengths" | "challenges", tagIdx: number) => {
    setNewChild(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== tagIdx) }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container py-8 px-4 md:px-6 max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container py-8 px-4 md:px-6 max-w-4xl">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold">Family Setup</h1>
          <p className="text-muted-foreground">
            Define your family&apos;s values, add your children, and personalize your homeschool experience.
          </p>
        </div>

        <Tabs defaultValue="blueprint" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="blueprint" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Family Blueprint
            </TabsTrigger>
            <TabsTrigger value="children" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Children ({children.length})
            </TabsTrigger>
          </TabsList>

          {/* ─── Family Blueprint Tab ──────────────────────────────────── */}
          <TabsContent value="blueprint" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Family Blueprint
                </CardTitle>
                <CardDescription>
                  Your blueprint shapes every lesson we generate. Define what matters most to your family.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Family Name */}
                <div className="space-y-2">
                  <Label htmlFor="familyName">Family Name</Label>
                  <Input
                    id="familyName"
                    placeholder="The Parker Family"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                  />
                </div>

                {/* State */}
                <div className="space-y-2">
                  <Label>Home State</Label>
                  <p className="text-sm text-muted-foreground">We&apos;ll track your state&apos;s requirements automatically.</p>
                  <Select value={stateAbbr} onValueChange={setStateAbbr}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(s => (
                        <SelectItem key={s.abbr} value={s.abbr}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Family Values */}
                <div className="space-y-3">
                  <Label>Your Family Values</Label>
                  <p className="text-sm text-muted-foreground">Select the values that guide your homeschool journey.</p>
                  <div className="flex flex-wrap gap-2">
                    {FAMILY_VALUES.map(value => (
                      <Badge
                        key={value}
                        variant={selectedValues.includes(value) ? "default" : "outline"}
                        className="cursor-pointer select-none transition-colors"
                        onClick={() => toggleValue(value)}
                      >
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Educational Philosophy */}
                <div className="space-y-3">
                  <Label>Educational Philosophy</Label>
                  <p className="text-sm text-muted-foreground">How do you approach education? Select all that apply.</p>
                  <div className="flex flex-wrap gap-2">
                    {PHILOSOPHIES.map(p => (
                      <Badge
                        key={p}
                        variant={selectedPhilosophies.includes(p) ? "default" : "outline"}
                        className="cursor-pointer select-none transition-colors"
                        onClick={() => togglePhilosophy(p)}
                      >
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Trait Pillars */}
                <div className="space-y-3">
                  <Label>Trait Pillars You&apos;re Cultivating</Label>
                  <p className="text-sm text-muted-foreground">
                    What character traits are you intentionally building in your children?
                  </p>

                  {traitPillars.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {traitPillars.map((pillar, idx) => (
                        <div key={idx} className="relative p-4 bg-muted/50 rounded-lg">
                          <button
                            onClick={() => removePillar(idx)}
                            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <p className="font-semibold text-sm">{pillar.name}</p>
                          {pillar.description && (
                            <p className="text-xs text-muted-foreground mt-1">{pillar.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      placeholder="Trait name (e.g. Critical Thinking)"
                      value={newPillarName}
                      onChange={(e) => setNewPillarName(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Brief description (optional)"
                      value={newPillarDesc}
                      onChange={(e) => setNewPillarDesc(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={addPillar} disabled={!newPillarName.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button onClick={handleSaveBlueprint} disabled={saving} className="w-full">
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saving ? "Saving..." : "Save Blueprint"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Children Tab ──────────────────────────────────────────── */}
          <TabsContent value="children" className="space-y-6">
            {children.map((child, idx) => (
              <Card key={child.id || idx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {child.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span>{child.name}</span>
                        <p className="text-sm font-normal text-muted-foreground">
                          {child.age ? `${child.age} years old` : ""}
                          {child.grade ? ` · ${child.grade} Grade` : ""}
                          {child.learningStyle ? ` · ${child.learningStyle}` : ""}
                        </p>
                      </div>
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteChild(child)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Interests */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Interests</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {child.interests.map((interest, ti) => (
                        <Badge key={ti} variant="secondary" className="gap-1">
                          {interest}
                          <button onClick={() => removeTagFromChild(idx, "interests", ti)}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      <Input
                        placeholder="Add interest..."
                        className="w-32 h-6 text-xs"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addTagToChild(idx, "interests", e.currentTarget.value)
                            e.currentTarget.value = ""
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Strengths</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {child.strengths.map((s, ti) => (
                        <Badge key={ti} variant="outline" className="gap-1 border-green-300 text-green-700">
                          {s}
                          <button onClick={() => removeTagFromChild(idx, "strengths", ti)}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      <Input
                        placeholder="Add strength..."
                        className="w-32 h-6 text-xs"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addTagToChild(idx, "strengths", e.currentTarget.value)
                            e.currentTarget.value = ""
                          }
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add Child Form */}
            {showAddChild ? (
              <Card className="border-dashed border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Add a Child
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="childName">Name</Label>
                      <Input
                        id="childName"
                        placeholder="Child's name"
                        value={newChild.name}
                        onChange={(e) => setNewChild(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="childAge">Age</Label>
                      <Input
                        id="childAge"
                        type="number"
                        min={3}
                        max={18}
                        placeholder="8"
                        value={newChild.age || ""}
                        onChange={(e) => setNewChild(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Grade Level</Label>
                      <Select value={newChild.grade || ""} onValueChange={(v) => setNewChild(prev => ({ ...prev, grade: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {GRADES.map(g => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Learning Style</Label>
                      <Select value={newChild.learningStyle || ""} onValueChange={(v) => setNewChild(prev => ({ ...prev, learningStyle: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          {LEARNING_STYLES.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Interests for new child */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Interests</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {newChild.interests.map((interest, ti) => (
                        <Badge key={ti} variant="secondary" className="gap-1">
                          {interest}
                          <button onClick={() => removeTagFromNewChild("interests", ti)}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      <Input
                        placeholder="Type and press Enter..."
                        className="w-48 h-6 text-xs"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addTagToNewChild("interests", e.currentTarget.value)
                            e.currentTarget.value = ""
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Strengths for new child */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Strengths</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {newChild.strengths.map((s, ti) => (
                        <Badge key={ti} variant="outline" className="gap-1 border-green-300 text-green-700">
                          {s}
                          <button onClick={() => removeTagFromNewChild("strengths", ti)}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      <Input
                        placeholder="Type and press Enter..."
                        className="w-48 h-6 text-xs"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addTagToNewChild("strengths", e.currentTarget.value)
                            e.currentTarget.value = ""
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleAddChild} disabled={!newChild.name.trim() || savingChild}>
                      {savingChild ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {savingChild ? "Adding..." : "Add Child"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddChild(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button
                variant="outline"
                className="w-full border-dashed h-20"
                onClick={() => setShowAddChild(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add a Child
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
