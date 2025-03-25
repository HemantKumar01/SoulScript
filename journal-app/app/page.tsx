import { JournalForm } from "@/components/journal-form"

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Welcome to Your Journal</h1>
        <p className="text-muted-foreground">Capture your thoughts, memories, and reflections</p>
      </div>

      <JournalForm />
    </div>
  )
}

