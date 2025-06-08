"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const phrases = [
  "Accessible therapy for everyone, everywhere.",
  "AI-powered mental health support that understands you.",
  "Bridge the gap to professional therapeutic care.",
  "Confidential, judgment-free conversations 24/7.",
  "Your personalized journey to better mental health.",
  "Transform your wellbeing with intelligent support.",
]

export default function MorphingText() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % phrases.length)
    }, 4000) // Increased interval for better readability

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-16 flex items-center justify-center md:justify-start">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -30, filter: "blur(8px)" }}
          transition={{ 
            duration: 0.6, 
            ease: "easeInOut",
            filter: { duration: 0.4 }
          }}
          className="text-lg md:text-xl text-purple-300 font-medium leading-relaxed max-w-2xl text-center md:text-left"
        >
          {phrases[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
