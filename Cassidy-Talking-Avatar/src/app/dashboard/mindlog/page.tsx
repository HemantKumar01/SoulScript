"use client";
import { requireAuth, waitForAuthState, getCurrentUser } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { JournalForm } from "@/components/journal-form";
import { Typewriter } from "react-simple-typewriter";
import HeroHeading from "@/components/HeroHeading";
import HeroSubheading from "@/components/HeroSubheading";
import localFont from "next/font/local";
const ClashDisplay = localFont({
  src: "../../../fonts/ClashDisplay_Complete/Fonts/WEB/fonts/ClashDisplay-Variable.woff2",
});

export default function Home() {
  const [user, setUser] = useState<string | null>(null);
  useEffect(() => {
    requireAuth();
    const user = getCurrentUser();
    if (user) {
      setUser(user.displayName?.split(" ")[0] || "Friend");
    }
    waitForAuthState()
      .then((user) => {
        if (user) {
          setUser(user.displayName?.split(" ")[0] || "Friend");
        } else {
          setUser(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
      });
  }, []);
  return (
    <div className="space-y-6 bg-[#18181B] m-auto w-[100%] max-w-[800px] px-4 md:px-10 py-12 rounded-3xl shadow-lg">
      <div className="text-center space-y-2">
        {user && <HeroHeading user={user}></HeroHeading>}
        <HeroSubheading></HeroSubheading>
      </div>
      <div
        className={`hidden md:block banner-text fixed z-[0] pointer-events-none w-[100vh] h-auto top-1/2 transform -translate-y-1/2 right-0 text-[110px] font-[900] text-[#ffffff] text-center opacity-10 origin-center -rotate-90 translate-x-[calc(50%-0.5em)] select-none ${ClashDisplay.className}`}
      >
        MINDLOG
      </div>
      <JournalForm />
    </div>
  );
}
