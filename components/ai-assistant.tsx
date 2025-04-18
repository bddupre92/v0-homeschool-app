"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, X, Maximize2, Minimize2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Sample responses based on the AIAssistant.tsx source
const getAIResponse = (message) => {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("fraction") || lowerMessage.includes("math")) {
    return "Here are some engaging activities for teaching fractions:\n\n1. **Fraction Pizza**: Use paper plates to create pizza slices representing different fractions.\n\n2. **Measuring Cup Activities**: Bake together and let your child measure ingredients to understand fractions in real life.\n\n3. **Fraction Strips**: Create colorful paper strips divided into different fractions for visual comparison.\n\n4. **Lego Fractions**: Use Lego bricks to represent different fractions and demonstrate addition and subtraction.\n\nWould you like me to suggest specific resources for any of these activities?"
  }

  if (lowerMessage.includes("charlotte mason")) {
    return "Creating a Charlotte Mason schedule involves balancing several key elements:\n\n1. **Short Lessons**: Keep lessons to 15-20 minutes for younger children, gradually increasing with age.\n\n2. **Morning Time**: Start with Bible reading, poetry, music appreciation, and art study.\n\n3. **Core Subjects**: Focus on math and language arts in the morning when minds are fresh.\n\n4. **Afternoon Activities**: Reserve afternoons for nature study, handicrafts, and free play.\n\n5. **Reading Aloud**: Incorporate living books throughout the day.\n\nA sample daily schedule might look like:\n- 8:30-9:00: Morning basket (poetry, music, art)\n- 9:00-10:30: Language arts and math\n- 10:30-11:00: Break\n- 11:00-12:00: History and science through living books\n- 12:00-1:30: Lunch and free time\n- 1:30-3:00: Nature study, handicrafts, or physical activity\n\nWould you like more specific guidance for a particular age group?"
  }

  if (lowerMessage.includes("science") || lowerMessage.includes("experiment")) {
    return "Here are some engaging science experiments perfect for elementary students:\n\n1. **Volcano Eruption**: Create a model volcano with baking soda and vinegar to demonstrate chemical reactions.\n\n2. **Plant Growth Experiment**: Grow plants in different conditions to learn about plant needs.\n\n3. **Water Cycle in a Bag**: Create a mini water cycle using a plastic bag, water, and food coloring.\n\n4. **Magnetic Slime**: Make slime with iron oxide powder to create a substance that reacts to magnets.\n\n5. **Egg Drop Challenge**: Design a container to protect an egg from breaking when dropped.\n\nAll of these experiments use simple household materials and connect to elementary science standards. Would you like detailed instructions for any specific experiment?"
  }

  if (lowerMessage.includes("record") || lowerMessage.includes("documentation")) {
    return "Keeping good homeschool records is important for both legal compliance and tracking progress. Here's what you should consider:\n\n1. **Attendance Records**: Most states require 180 days of instruction. A simple calendar works well for tracking.\n\n2. **Portfolio of Work**: Keep samples of your child's work throughout the year, especially writing samples and major projects.\n\n3. **Reading Lists**: Track books read independently and as read-alouds.\n\n4. **Curriculum Plans**: Document what materials you're using for each subject.\n\n5. **Progress Reports**: Consider quarterly assessments of progress and goals.\n\n6. **Standardized Test Results**: If your state requires testing, keep these records.\n\n7. **Field Trips and Activities**: Document educational outings and extracurricular activities.\n\nDigital tools that can help:\n- Homeschool Planet\n- Homeschool Tracker\n- Trello or Notion for digital organization\n- Google Drive for storing digital work samples.\n\nCheck your specific state requirements, as they vary significantly in terms of what records you must maintain and submit."
  }

  if (lowerMessage.includes("history") || lowerMessage.includes("social studies")) {
    return "Here are excellent resources for teaching world history:\n\n1. **Story of the World** by Susan Wise Bauer - A narrative approach to world history that's engaging for children.\n\n2. **History Quest** - A history curriculum that incorporates hands-on activities and living books.\n\n3. **Beautiful Feet Books** - Literature-based history guides with excellent book selections.\n\n4. **Timeline Books** - Creating an ongoing timeline helps children visualize historical periods.\n\n5. **Mystery of History** - Christian-based world history curriculum with activities for multiple age levels.\n\nFree online resources:\n- Khan Academy's World History section\n- BBC Bitesize History\n- Crash Course History videos on YouTube (better for older students).\n\nWould you like recommendations for a specific time period or civilization?"
  }

  // Default response for other queries
  return "That's a great question about homeschooling! While I don't have specific information on that topic, I can suggest some approaches to find what you're looking for:\n\n1. Check the resource library in the app for related materials\n\n2. Browse the community groups to connect with other homeschoolers who might have experience with this\n\n3. Try using the advanced search feature with specific keywords related to your question\n\nWould you like me to help you formulate a more specific search or connect you with relevant community groups?"
}

export default function AIAssistant() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [conversation, setConversation] = useState([])
  const messagesEndRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!message.trim()) return

    // Add user message to conversation
    const userMessage = { role: "user", content: message }
    setConversation([...conversation, userMessage])

    // Get AI response
    setTimeout(() => {
      const aiResponse = { role: "assistant", content: getAIResponse(message) }
      setConversation((prev) => [...prev, aiResponse])
    }, 500)

    setMessage("")
  }

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation])

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 rounded-full shadow-lg p-4 h-auto">
        <Sparkles className="h-6 w-6" />
        <span className="sr-only">Open AI Assistant</span>
      </Button>
    )
  }

  return (
    <Card
      className={`fixed bottom-4 right-4 shadow-lg transition-all duration-200 ${
        isExpanded ? "w-[90vw] h-[80vh] max-w-3xl" : "w-80 h-96"
      }`}
    >
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-1">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Homeschool Assistant</CardTitle>
            <CardDescription className="text-xs">Ask me anything about homeschooling</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8">
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span className="sr-only">{isExpanded ? "Minimize" : "Maximize"}</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 overflow-y-auto" style={{ height: "calc(100% - 140px)" }}>
        {conversation.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Sparkles className="h-8 w-8 mb-2" />
            <p className="text-sm">How can I help with your homeschooling journey today?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 w-full max-w-md">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMessage("What are some fun activities for teaching fractions?")
                  handleSubmit({ preventDefault: () => {} })
                }}
              >
                Teaching fractions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMessage("How do I create a Charlotte Mason schedule?")
                  handleSubmit({ preventDefault: () => {} })
                }}
              >
                Charlotte Mason schedule
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMessage("Suggest science experiments for elementary students")
                  handleSubmit({ preventDefault: () => {} })
                }}
              >
                Science experiments
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMessage("What records should I keep for homeschooling?")
                  handleSubmit({ preventDefault: () => {} })
                }}
              >
                Record keeping
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {conversation.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <div className="whitespace-pre-line text-sm">{msg.content}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-2">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Textarea
            placeholder="Ask a question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-10 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button type="submit" size="icon" disabled={!message.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
