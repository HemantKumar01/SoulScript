"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { JournalDetail } from "@/components/journal-detail"
import { getJournalEntryById } from "@/lib/actions"
import { useCurrentUser } from "@/hooks/use-current-user"
import { JournalEntry } from "@/lib/types"

interface EntryPageProps {
  params: Promise<{ 
    uid: string
    id: string 
  }>
}

export default function EntryPage({ params }: EntryPageProps) {
  const { user, loading: userLoading } = useCurrentUser()
  const router = useRouter()
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [resolvedParams, setResolvedParams] = useState<{ uid: string; id: string } | null>(null)

  // Resolve params
  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  // Fetch entry when user and params are ready
  useEffect(() => {
    const fetchEntry = async () => {
      if (!user || !resolvedParams || userLoading) return

      try {
        const { success, entry: fetchedEntry } = await getJournalEntryById(
          resolvedParams.uid, 
          resolvedParams.id, 
          user.email || ""
        )

        if (!success || !fetchedEntry) {
          router.push('/dashboard/mindlog/calendar')
          return
        }

        setEntry(fetchedEntry)
      } catch (error) {
        console.error("Error fetching journal entry:", error)
        router.push('/dashboard/mindlog/calendar')
      } finally {
        setLoading(false)
      }
    }

    fetchEntry()
  }, [user, resolvedParams, userLoading, router])

  if (userLoading || loading || !resolvedParams) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading journal entry...</p>
        </div>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">Entry not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <JournalDetail entry={entry} />
    </div>
  )
}

