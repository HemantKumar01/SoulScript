"use server"

import { revalidatePath } from "next/cache"
import clientPromise from "./mongodb"
import { ObjectId } from "mongodb"

// Create a new journal entry
export async function createJournalEntry(formData: FormData) {
  try {
    const client = await clientPromise
    const db = client.db("journal_app")

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const dateStr = formData.get("date") as string

    if (!title || !content || !dateStr) {
      return { success: false, message: "All fields are required" }
    }

    const date = new Date(dateStr)
    const now = new Date()

    const entry = {
      title,
      content,
      date,
      createdAt: now,
      updatedAt: now,
    }

    await db.collection("entries").insertOne(entry)

    revalidatePath("/")
    revalidatePath("/calendar")

    return { success: true, message: "Journal entry created successfully" }
  } catch (error) {
    console.error("Error creating journal entry:", error)
    return { success: false, message: "Failed to create journal entry" }
  }
}

// Get all journal entries
export async function getJournalEntries() {
  try {
    const client = await clientPromise
    const db = client.db("journal_app")

    const entries = await db.collection("entries").find({}).sort({ date: -1 }).toArray()

    return { success: true, entries: JSON.parse(JSON.stringify(entries)) }
  } catch (error) {
    console.error("Error fetching journal entries:", error)
    return { success: false, entries: [] }
  }
}

// Get a single journal entry by ID
export async function getJournalEntryById(id: string) {
  try {
    const client = await clientPromise
    const db = client.db("journal_app")

    const entry = await db.collection("entries").findOne({ _id: new ObjectId(id) })

    if (!entry) {
      return { success: false, entry: null, message: "Entry not found" }
    }

    return { success: true, entry: JSON.parse(JSON.stringify(entry)) }
  } catch (error) {
    console.error("Error fetching journal entry:", error)
    return { success: false, entry: null, message: "Failed to fetch journal entry" }
  }
}

// Update a journal entry
export async function updateJournalEntry(id: string, formData: FormData) {
  try {
    const client = await clientPromise
    const db = client.db("journal_app")

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const dateStr = formData.get("date") as string

    if (!title || !content || !dateStr) {
      return { success: false, message: "All fields are required" }
    }

    const date = new Date(dateStr)

    await db.collection("entries").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          content,
          date,
          updatedAt: new Date(),
        },
      },
    )

    revalidatePath("/")
    revalidatePath("/calendar")
    revalidatePath(`/entry/${id}`)

    return { success: true, message: "Journal entry updated successfully" }
  } catch (error) {
    console.error("Error updating journal entry:", error)
    return { success: false, message: "Failed to update journal entry" }
  }
}

// Delete a journal entry
export async function deleteJournalEntry(id: string) {
  try {
    const client = await clientPromise
    const db = client.db("journal_app")

    await db.collection("entries").deleteOne({ _id: new ObjectId(id) })

    revalidatePath("/")
    revalidatePath("/calendar")

    return { success: true, message: "Journal entry deleted successfully" }
  } catch (error) {
    console.error("Error deleting journal entry:", error)
    return { success: false, message: "Failed to delete journal entry" }
  }
}

// Get entries for a specific month
export async function getEntriesByMonth(year: number, month: number) {
  try {
    const client = await clientPromise
    const db = client.db("journal_app")

    // Create date range for the specified month
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)

    const entries = await db
      .collection("entries")
      .find({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ date: 1 })
      .toArray()

    return { success: true, entries: JSON.parse(JSON.stringify(entries)) }
  } catch (error) {
    console.error("Error fetching entries by month:", error)
    return { success: false, entries: [] }
  }
}

