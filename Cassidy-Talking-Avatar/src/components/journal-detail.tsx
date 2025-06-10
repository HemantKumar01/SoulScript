"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { JournalEntry } from "@/lib/types"
import { deleteJournalEntry } from "@/lib/actions"
import { format } from "date-fns"
import { Pencil, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

interface JournalDetailProps {
  entry: JournalEntry
}

export function JournalDetail({ entry }: JournalDetailProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const { user } = useAuth()

  const handleDelete = async () => {
    if (!user?.uid) {
      console.error("User not authenticated")
      return
    }

    setIsDeleting(true)

    try {
      console.log("deleting stuff", user);
      const result = await deleteJournalEntry(user.uid, entry.id as string)
      console.log(result);
      if (result.success) {
        router.push("/dashboard/mindlog/calendar")
      }
    } catch (error) {
      console.error("Error deleting entry:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{entry.title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {format(entry.date instanceof Date ? entry.date : new Date(entry.date.seconds * 1000), "MMMM d, yyyy")}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap">{entry.content}</div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          Last updated: {format(entry.updatedAt instanceof Date ? entry.updatedAt : new Date(entry.updatedAt.seconds * 1000), "MMM d, yyyy h:mm a")}
        </div>
        <div className="flex gap-2">
          {/* <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => router.push(`mindlog/entry/${user.uid}/edit/${entry.id}`)}
          >
            <Pencil size={14} />
            Edit
          </Button> */}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1" disabled={isDeleting}>
                <Trash2 size={14} />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your journal entry.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  )
}

