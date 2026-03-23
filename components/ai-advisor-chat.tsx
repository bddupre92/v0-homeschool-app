"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Bot, Sparkles, Loader2, Trash2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type {
  AdvisorMessage,
  StructuredCard,
  ChildProfile,
  FamilyBlueprintData,
  AdvisorIntent,
} from "@/lib/advisor-types"
import { CurriculumPlanCardUI } from "@/components/advisor-cards/curriculum-plan-card"
import { ComplianceCheckCardUI } from "@/components/advisor-cards/compliance-check-card"
import { ProgressReportCardUI } from "@/components/advisor-cards/progress-report-card"
import { LessonSuggestionCardUI } from "@/components/advisor-cards/lesson-suggestion-card"

interface ComplianceData {
  totalHoursLogged: number
  hoursBySubject: { subject: string; total_hours: number; session_count: number }[]
  filings: { filing_type: string; status: string; due_date?: string; filed_date?: string; notes?: string }[]
  subjectsWithHours: string[]
}

interface AIAdvisorChatProps {
  children: ChildProfile[]
  familyBlueprint: FamilyBlueprintData | null
  stateRequirements: any | null
  stateFilingTypes: any[]
  complianceData?: ComplianceData | null
  onSaveRecommendation?: (data: any) => Promise<void>
  initialMessages?: AdvisorMessage[]
}

function parseStructuredData(text: string): { cleanText: string; card: StructuredCard | null } {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/)
  if (!jsonMatch) return { cleanText: text, card: null }

  try {
    const card = JSON.parse(jsonMatch[1].trim()) as StructuredCard
    const cleanText = text.replace(/```json\s*[\s\S]*?```/, "").trim()
    return { cleanText, card }
  } catch {
    return { cleanText: text, card: null }
  }
}

function StructuredCardRenderer({ card, onSave }: { card: StructuredCard; onSave?: (data: any) => void }) {
  switch (card.type) {
    case "curriculum_plan":
      return <CurriculumPlanCardUI card={card} onSave={onSave} />
    case "compliance_check":
      return <ComplianceCheckCardUI card={card} />
    case "progress_report":
      return <ProgressReportCardUI card={card} />
    case "lesson_suggestion":
      return <LessonSuggestionCardUI card={card} />
    default:
      return null
  }
}

export default function AIAdvisorChat({
  children,
  familyBlueprint,
  stateRequirements,
  stateFilingTypes,
  complianceData,
  onSaveRecommendation,
  initialMessages,
}: AIAdvisorChatProps) {
  const [messages, setMessages] = useState<AdvisorMessage[]>(
    initialMessages?.length
      ? initialMessages
      : [
          {
            id: "welcome",
            role: "assistant",
            content: children.length > 0
              ? `Hi! I'm your AtoZ Family curriculum advisor. I see you have ${children.map(c => c.name).join(" and ")} — how can I help today? I can plan a year curriculum, check your compliance status, review learning progress, or help with specific lessons.`
              : "Hi! I'm your AtoZ Family curriculum advisor. To give you the best recommendations, make sure to set up your family blueprint and add your children's profiles in the Family page. How can I help today?",
            structuredData: null,
            messageType: "text",
          },
        ]
  )
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(children[0] || null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const detectIntent = (text: string): AdvisorIntent => {
    const lower = text.toLowerCase()
    if (lower.includes("year curriculum") || lower.includes("year plan") || lower.includes("annual plan") || lower.includes("curriculum for"))
      return "year_curriculum"
    if (lower.includes("compliance") || lower.includes("filing") || lower.includes("requirement") || lower.includes("state law"))
      return "compliance_check"
    if (lower.includes("progress") || lower.includes("alignment") || lower.includes("on track") || lower.includes("how is"))
      return "learning_alignment"
    if (lower.includes("stuck") || lower.includes("help with") || lower.includes("lesson") || lower.includes("tutor"))
      return "lesson_help"
    return "general"
  }

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || isStreaming) return

    const userMessage: AdvisorMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsStreaming(true)

    const assistantMessage: AdvisorMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      const intent = detectIntent(messageText)
      const conversationHistory = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }))

      const response = await fetch("/api/ai/curriculum-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          conversationHistory,
          childProfile: selectedChild,
          familyBlueprint,
          stateRequirements: stateRequirements
            ? { ...stateRequirements, filingTypes: stateFilingTypes }
            : null,
          complianceData: complianceData || null,
          intent,
        }),
      })

      if (!response.ok) {
        let errorMessage = "Sorry, I ran into an issue. Please try again."
        try {
          const errorData = await response.json()
          if (response.status === 503) {
            errorMessage = "The AI service is temporarily unavailable. Please check that the API key is configured."
          } else if (response.status === 429) {
            errorMessage = "Too many requests. Please wait a moment and try again."
          } else if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch {
          // response wasn't JSON, use default
        }
        throw new Error(errorMessage)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          fullText += chunk
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id ? { ...m, content: fullText } : m
            )
          )
        }
      }

      // Parse structured data from the final text
      const { cleanText, card } = parseStructuredData(fullText)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? { ...m, content: cleanText || fullText, structuredData: card }
            : m
        )
      )
    } catch (error) {
      console.error("Advisor error:", error)
      const errorText = error instanceof Error ? error.message : "Sorry, I ran into an issue. Please try again."
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? { ...m, content: errorText }
            : m
        )
      )
    } finally {
      setIsStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Chat cleared! How can I help you today?",
        structuredData: null,
        messageType: "text",
      },
    ])
  }

  const quickActions = [
    {
      label: "Plan my year",
      icon: "📅",
      action: () => {
        if (selectedChild) {
          sendMessage(`I need to create my year curriculum for ${selectedChild.name}`)
        } else {
          sendMessage("I need to create a year curriculum for my child")
        }
      },
    },
    {
      label: "Check compliance",
      icon: "🛡️",
      action: () => sendMessage("Check my compliance status for this year"),
    },
    {
      label: "Create a lesson",
      icon: "📖",
      action: () => {
        if (selectedChild) {
          sendMessage(`Help me create a lesson for ${selectedChild.name}`)
        } else {
          sendMessage("Help me create a lesson")
        }
      },
    },
    {
      label: "Learning progress",
      icon: "📊",
      action: () => {
        if (selectedChild) {
          sendMessage(`How is ${selectedChild.name} doing? Check learning alignment.`)
        } else {
          sendMessage("How are my children doing? Check learning alignment.")
        }
      },
    },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      {/* Header with child selector */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">AtoZ AI Advisor</h2>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {children.length > 0 && (
            <select
              value={selectedChild?.id || ""}
              onChange={(e) => {
                const child = children.find((c) => c.id === e.target.value)
                setSelectedChild(child || null)
              }}
              className="text-sm border rounded-md px-2 py-1 bg-background"
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          )}
          <Button variant="ghost" size="icon" onClick={clearChat} title="Clear chat">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <Avatar className="h-8 w-8 shrink-0 mt-1">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
            <div className={cn("max-w-[85%] space-y-3", msg.role === "user" ? "items-end" : "items-start")}>
              {msg.content && (
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {isStreaming && msg === messages[messages.length - 1] && msg.role === "assistant" && (
                    <span className="inline-block w-1.5 h-4 bg-current animate-pulse ml-0.5" />
                  )}
                </div>
              )}
              {msg.structuredData && (
                <StructuredCardRenderer
                  card={msg.structuredData}
                  onSave={onSaveRecommendation}
                />
              )}
            </div>
            {msg.role === "user" && (
              <Avatar className="h-8 w-8 shrink-0 mt-1">
                <AvatarFallback className="bg-muted">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.content === "" && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
              <div className="flex space-x-1.5 items-center">
                <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions — only show when conversation is short */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={action.action}
                disabled={isStreaming}
                className="text-xs"
              >
                <span className="mr-1.5">{action.icon}</span>
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="px-4 py-3 border-t bg-background">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your advisor anything..."
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
            disabled={isStreaming}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isStreaming}
            size="icon"
            className="shrink-0 h-11 w-11 rounded-full"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
