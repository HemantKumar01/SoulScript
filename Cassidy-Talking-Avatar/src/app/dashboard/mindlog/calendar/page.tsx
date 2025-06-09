"use client"
import { CalendarView } from "@/components/calendar-view"
import { requireAuth } from "@/lib/firebase"
import { useEffect } from "react"
export default function CalendarPage() {
  useEffect(() => {
      requireAuth();
    }, []);
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Journal History</h1>
        <p className="text-muted-foreground">Browse through your past journal entries</p>
      </div>

      <CalendarView />
    </div>
  )
}

