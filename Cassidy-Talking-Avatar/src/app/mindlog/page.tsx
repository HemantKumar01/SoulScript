"use client"
import { requireAuth } from "@/lib/firebase"
import { useEffect } from "react"
import { JournalForm } from "@/components/journal-form"
import { Typewriter } from 'react-simple-typewriter'
import HeroHeading from "@/components/HeroHeading"
import HeroSubheading from "@/components/HeroSubheading"
export default function Home() {
   useEffect(() => {
      requireAuth();
    }, []);
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <HeroHeading></HeroHeading>
        <HeroSubheading></HeroSubheading>
      </div>
      <div className="banner-text fixed z-[0] w-[100vh] h-auto top-1/2 transform -translate-y-1/2 right-0 text-[120px] font-[900] text-[#ffffff] text-center opacity-15 origin-center -rotate-90 translate-x-[calc(50%-0.5em)] select-none">
            MINDLOG
          </div>
      <JournalForm />
    </div>
  )                                         
}

