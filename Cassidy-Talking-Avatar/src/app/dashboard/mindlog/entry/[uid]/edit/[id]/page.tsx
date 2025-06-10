import { JournalForm } from "@/components/journal-form"
import { getJournalEntryById } from "@/lib/actions"
import { notFound } from "next/navigation"

export default async function EditEntryPage({ params }: { params: Promise<{ uid: string; id: string }> }) {
  const { uid, id } = await params
  const { success, entry } = await getJournalEntryById(uid, id)

  if (!success || !entry) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Edit Journal Entry</h1>
      </div>

      <JournalForm entry={entry} isEditing={true} />
    </div>
  )
}

