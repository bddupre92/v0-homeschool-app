"use client"

import { useState } from "react"
import { Bot, Send, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [conversation, setConversation] = useState([
    {
      role: "assistant",
      content:
        "Hi there! I'm your HomeScholar AI assistant. I can help you find resources, plan lessons, or answer questions about homeschooling. How can I help you today?",
    },
  ])
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!message.trim()) return

    // Add user message to conversation
    setConversation([...conversation, { role: "user", content: message }])

    // Clear input
    setMessage("")

    // Simulate AI typing
    setIsTyping(true)

    // Simulate AI response after a delay
    setTimeout(() => {
      const responses = [
        "I found several math resources for elementary students. Would you like to see them?",
        "Here's a great science curriculum that many homeschoolers recommend.",
        "I can help you plan a weekly schedule. What subjects are you focusing on?",
        "Have you checked out our community events? There's a field trip planned next week.",
        "I've added those resources to your saved items. You can find them in your boards.",
      ]

      const randomResponse = responses[Math.floor(Math.random() * responses.length)]

      setConversation([
        ...conversation,
        { role: "user", content: message },
        { role: "assistant", content: randomResponse },
      ])

      setIsTyping(false)
    }, 1500)
  }

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 rounded-full p-4 shadow-lg"
          size="icon"
        >
          <Bot className="h-6 w-6" />
        </Button>
      )}

      {/* Chat window */}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-80 sm:w-96 shadow-lg z-50 flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-primary">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">HomeScholar Assistant</CardTitle>
                  <CardDescription className="text-xs flex items-center">
                    <Badge variant="outline" className="text-xs gap-1 px-1 py-0 h-4 font-normal">
                      <Sparkles className="h-2.5 w-2.5" />
                      <span>AI</span>
                    </Badge>
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-[300px] flex-grow">
            <div className="space-y-4">
              {conversation.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`rounded-lg px-3 py-2 max-w-[80%] ${
                      msg.role === "assistant" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="rounded-lg px-3 py-2 max-w-[80%] bg-muted text-foreground">
                    <div className="flex space-x-1 items-center">
                      <div className="w-1.5 h-1.5 bg-foreground/70 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-foreground/70 rounded-full animate-bounce delay-75"></div>
                      <div className="w-1.5 h-1.5 bg-foreground/70 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                placeholder="Ask me anything..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  )
}
