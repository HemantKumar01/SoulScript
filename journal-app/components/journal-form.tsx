"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createJournalEntry, updateJournalEntry } from "@/lib/actions"
import type { JournalEntry } from "@/lib/types"
import { format } from "date-fns"

interface JournalFormProps {
  entry?: JournalEntry
  isEditing?: boolean
}

export function JournalForm({ entry, isEditing = false }: JournalFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const today = format(new Date(), "yyyy-MM-dd")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    const formData = new FormData(e.currentTarget)

    try {
      let result

      if (isEditing && entry?._id) {
        result = await updateJournalEntry(entry._id, formData)
      } else {
        result = await createJournalEntry(formData)
      }

      if (result.success) {
        setSuccess(result.message)
        if (!isEditing) {
          // Reset form if creating a new entry
          e.currentTarget.reset()
        }

        // Redirect after a short delay
        setTimeout(() => {
          router.push("/calendar")
        }, 1500)
      } else {
        setError(result.message || "Failed to save journal entry")
      }
    } catch (err) {
      console.error(err)
    
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Journal Entry" : "New Journal Entry"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter a title for your journal entry"
              required
              defaultValue={entry?.title || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={entry?.date ? format(new Date(entry.date), "yyyy-MM-dd") : today}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Write your journal entry here..."
              rows={10}
              required
              defaultValue={entry?.content || ""}
              className="resize-none"
            />
          </div>

          {error && <div className="p-3 text-sm text-white bg-red-500 rounded-md">{error}</div>}

          {success && <div className="p-3 text-sm text-white bg-green-500 rounded-md">{success}</div>}
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update Entry" : "Save Entry"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

