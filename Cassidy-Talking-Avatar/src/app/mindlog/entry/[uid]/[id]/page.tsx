// "use client"
import { JournalDetail } from "@/components/journal-detail"
import { getJournalEntryById } from "@/lib/actions"
import { notFound } from "next/navigation"
import { getCurrentUser } from "@/lib/firebase"
interface EntryPageProps {
  params: { 
    uid: string
    id: string 
  }
}
export default async function EntryPage({ params }: EntryPageProps) {
  const user = getCurrentUser() ; 
  const {uid ,  id  } = await params
  // console.log("id00--",id)
  const { success, entry } = await getJournalEntryById(uid,id)

  if (!success || !entry) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <JournalDetail entry={entry} />
    </div>
  )
}

