"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function HeroImage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const [currentMessage, setCurrentMessage] = useState(0)
  const [showTyping, setShowTyping] = useState(false)

  const messages = [
    {
      type: "user",
      text: "I've been feeling overwhelmed lately with work and personal life. It's hard to find balance.",
      delay: 1000
    },
    {
      type: "ai",
      text: "I understand how challenging it can be to balance multiple responsibilities. It's common to feel overwhelmed when trying to manage everything at once. Would you like to explore some strategies that might help you find more balance?",
      delay: 2000
    },
    {
      type: "user", 
      text: "Yes, that would be helpful. I feel like I'm always putting out fires and never have time for myself.",
      delay: 1500
    },
    {
      type: "ai",
      text: "That's a common feeling when we're overwhelmed. Let's start with something simple: could you identify one small activity that brings you joy or peace that you could schedule for yourself this week? Even 15 minutes can make a difference.",
      delay: 2500
    }
  ]

  useEffect(() => {
    if (!isLoaded) return

    const timer = setTimeout(() => {
      if (currentMessage < messages.length) {
        setShowTyping(true)
        setTimeout(() => {
          setShowTyping(false)
          setCurrentMessage(prev => prev + 1)
        }, messages[currentMessage]?.delay || 1000)
      } else {
        // Reset animation after showing all messages
        setTimeout(() => {
          setCurrentMessage(0)
        }, 3000)
      }
    }, currentMessage === 0 ? 500 : 100)

    return () => clearTimeout(timer)
  }, [currentMessage, isLoaded])

  return (
    // <embed src="https://soulscript01.vercel.app/" className="w-full h-128 md:h-[600px] rounded-lg border border-purple-500/30"></embed>
    <div className="relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-75"></div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: isLoaded ? 1 : 0,
          scale: isLoaded ? 1 : 0.9,
        }}
        transition={{ duration: 0.5 }}
        className="relative bg-gray-900/95 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30 h-[500px] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="text-xs text-gray-400 font-medium">SoulScript AI</div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-hidden">
          {messages.slice(0, currentMessage).map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-lg p-3 max-w-[80%] shadow-lg ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30'
                    : 'bg-gray-800/80 border border-gray-700/50'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
            </motion.div>
          ))}
          
          {/* Typing indicator */}
          {showTyping && currentMessage < messages.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gray-800/80 border border-gray-700/50 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="relative mt-4">
          <input
            type="text"
            placeholder="Type your message..."
            className="w-full bg-gray-800/80 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700/50 backdrop-blur-sm"
            readOnly
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
