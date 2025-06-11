"use client";
import { CalendarView } from "@/components/calendar-view";
import { requireAuth } from "@/lib/firebase";
import { useEffect } from "react";
import localFont from "next/font/local";
const ClashDisplay = localFont({
  src: "../../../../fonts/ClashDisplay_Complete/Fonts/WEB/fonts/ClashDisplay-Variable.woff2",
});

export default function CalendarPage() {
  useEffect(() => {
    requireAuth();
  }, []);
  return (
    <div
      className={`space-y-6 bg-[#18181B] m-auto w-[90%] max-w-[800px] px-10 py-12 rounded-3xl shadow-lg`}
    >
      <div className={`text-center space-y-2  ${ClashDisplay.className}`}>
        <h1 className="text-4xl font-regular">Journal History</h1>
        <p className="text-muted-foreground">
          Browse through your past journal entries
        </p>
      </div>

      <CalendarView />
    </div>
  );
}
