import { JournalDetail } from "@/components/journal-detail"
import { getJournalEntryById } from "@/lib/actions"
import { notFound } from "next/navigation"

export default async function EntryPage({ params }: { params: { id: string } }) {
  const { success, entry } = await getJournalEntryById(params.id)

  if (!success || !entry) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <JournalDetail entry={entry} />
    </div>
  )
}

