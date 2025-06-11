"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getEntriesByMonth } from "@/lib/actions"
import type { JournalEntry } from "@/lib/types"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { useAuth } from "@/hooks/useAuth"

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { user, loading: authLoading } = useAuth()

  const fetchEntries = async () => {
    if (!user?.uid || !user?.email) {
      setLoading(false)
      return
    }

    setLoading(true)
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const result = await getEntriesByMonth(user.uid, year, month, user.email)

    if (result.success) {
      setEntries(
        result.entries.map((entry: any) => ({
          ...entry,
          date: entry.date instanceof Date ? entry.date : new Date(entry.date.seconds * 1000),
          createdAt: entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt.seconds * 1000),
          updatedAt: entry.updatedAt instanceof Date ? entry.updatedAt : new Date(entry.updatedAt.seconds * 1000),
        })),
      )
    }

    setLoading(false)
  }

  useEffect(() => {
    if (!authLoading) {
      fetchEntries()
    }
  }, [currentDate, user, authLoading])

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get day names for header
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Function to check if a day has entries
  const getDayEntries = (day: Date) => {
    return entries.filter((entry) => {
      const entryDate = entry.date instanceof Date ? entry.date : new Date(entry.date.seconds * 1000)
      return isSameDay(entryDate, day)
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Journal Calendar</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-lg font-medium">{format(currentDate, "MMMM yyyy")}</div>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {authLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading...</div>
          </div>
        ) : !user ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Please sign in to view your journal calendar</div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading calendar...</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center font-medium text-sm py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before the start of the month */}
              {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                <div key={`empty-start-${index}`} className="h-24 p-1 border rounded-md bg-muted/20"></div>
              ))}

              {/* Calendar days */}
              {daysInMonth.map((day) => {
                const dayEntries = getDayEntries(day)
                return (
                  <div
                    key={day.toString()}
                    className={`h-24 p-1 border rounded-md overflow-hidden ${
                      dayEntries.length > 0 ? "border-primary/50" : ""
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">{format(day, "d")}</div>
                    <div className="space-y-1 overflow-y-auto max-h-[calc(100%-1.5rem)]">
                      {dayEntries.map((entry) => (
                        <Link
                          key={entry.id}
                          href={`/dashboard/mindlog/entry/${user?.uid}/${entry.id}`}
                          className="block p-1 text-xs truncate rounded bg-primary/10 hover:bg-primary/20"
                        >
                          {entry.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}

              {/* Empty cells for days after the end of the month */}
              {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
                <div key={`empty-end-${index}`} className="h-24 p-1 border rounded-md bg-muted/20"></div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

