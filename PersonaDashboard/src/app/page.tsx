"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter();

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setInput("")

    try {
      // Using your Next.js API route instead of calling external API directly
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await response.json();

      // Add assistant response
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response || "Sorry, I couldn't process your request."
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)

      // Add error message from assistant
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again."
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Function to render message content
  const renderMessageContent = (content: string, role: string) => {
    if (role === "user") {
      return <p>{content}</p>;
    } else {
      // For assistant messages, render markdown
      return <ReactMarkdown>{content}</ReactMarkdown>;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold">Know Yourself Better</h1>
        <Button onClick={() => router.push("/dashboard")}>Dashboard</Button>
      </header>


      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">Start a conversation to know yourself better</p>
              <p className="text-sm mt-2">Ask me anything about self-reflection, personal growth, or mindfulness</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] md:max-w-[70%] rounded-lg px-4 py-2 ${message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-gray-200 text-gray-800 rounded-tl-none"
                    }`}
                >
                  {renderMessageContent(message.content, message.role)}
                </div>
              </div>
            ))
          )}
          
          {/* Thinking bubble */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 rounded-lg rounded-tl-none px-4 py-2 max-w-[80%] md:max-w-[70%]">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-background p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size={isMobile ? "icon" : "default"} disabled={isLoading}>
            {isMobile ? <Send size={18} /> : "Send"}
          </Button>
        </form>
      </div>
    </div>
  )
}

