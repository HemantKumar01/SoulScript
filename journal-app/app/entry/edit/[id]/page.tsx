import { JournalForm } from "@/components/journal-form"
import { getJournalEntryById } from "@/lib/actions"
import { notFound } from "next/navigation"

export default async function EditEntryPage({ params }: { params: { id: string } }) {
  const { success, entry } = await getJournalEntryById(params.id)

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

