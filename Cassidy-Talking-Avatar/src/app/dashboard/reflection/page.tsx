"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { useRouter } from "next/navigation";
import { useAuthId } from "@/hooks/use-auth-id"

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const authId = useAuthId()
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
      const response = await fetch('api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authId: authId ,userMessage: userMessage.content }),
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-md text-white py-4 px-6 shadow-lg flex justify-between items-center border-b border-slate-700">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Know Yourself Better</h1>
        <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-700 hover:text-white" onClick={() => router.push("/dashboard")}>Dashboard</Button>
      </header>


      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="inline-block bg-slate-700/50 p-8 rounded-xl shadow-xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 text-sky-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-3.862 8.25-8.625 8.25S3.75 16.556 3.75 12C3.75 7.444 7.313 3.75 12.375 3.75S21 7.444 21 12Z" />
                </svg>
                <p className="text-xl font-medium text-slate-300">Start a conversation to know yourself better</p>
                <p className="text-sm mt-2 text-slate-400">Ask me anything about self-reflection, personal growth, or mindfulness</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] md:max-w-[70%] rounded-xl px-5 py-3 shadow-md ${message.role === "user"
                      ? "bg-sky-500 text-white rounded-br-none"
                      : "bg-slate-700 text-slate-200 rounded-bl-none"
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
              <div className="bg-slate-700 text-slate-200 rounded-xl rounded-bl-none px-5 py-3 shadow-md max-w-[80%] md:max-w-[70%]">
                <div className="flex space-x-1.5">
                  <div className="h-2.5 w-2.5 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="h-2.5 w-2.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="h-2.5 w-2.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-700 bg-slate-800/70 backdrop-blur-md p-4 shadow-top-lg">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3 items-center">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-sky-500 focus:border-sky-500"
            disabled={isLoading}
          />
          <Button type="submit" size={isMobile ? "icon" : "default"} disabled={isLoading} className="bg-sky-500 hover:bg-sky-600 text-white rounded-lg">
            {isMobile ? <Send size={18} /> : <><Send size={18} className="mr-2" /> Send</>}
          </Button>
        </form>
      </div>
    </div>
  )
}

