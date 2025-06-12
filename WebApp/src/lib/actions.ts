"use server"

import { revalidatePath } from "next/cache"
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  Timestamp
} from "firebase/firestore"
import { db } from "./firebase"
import { JournalEntry } from "./types"
import { getCurrentUser } from "./firebase"
import { encrypt, decrypt } from "./crypto/encryption"

// Helper function to convert Firestore data to JournalEntry
async function convertFirestoreEntry(docData: any, docId: string, userId: string, userEmail: string): Promise<JournalEntry> {
  let title = ""
  let content = ""
  
  try {
    // Decrypt the encrypted fields
    title = docData.encryptedTitle ? await decrypt(docData.encryptedTitle, userEmail) : docData.title || ""
    content = docData.encryptedContent ? await decrypt(docData.encryptedContent, userEmail) : docData.content || ""
  } catch (error) {
    console.error("Error decrypting journal entry:", error)
    // Fallback to non-encrypted data if decryption fails
    title = docData.title || "Unable to decrypt title"
    content = docData.content || "Unable to decrypt content"
  }
  
  return {
    id: docId,
    title,
    content,
    date: docData.date.toDate ? docData.date.toDate() : docData.date,
    createdAt: docData.createdAt.toDate ? docData.createdAt.toDate() : docData.createdAt,
    updatedAt: docData.updatedAt.toDate ? docData.updatedAt.toDate() : docData.updatedAt,
    userId: userId
  }
}

// Create a new journal entry
export async function createJournalEntry(
  userId: string, 
  email: string,
  data: FormData | { title: string; content: string; date: string }
) {
  try {
    if (!userId) {
      return { success: false, message: "User not authenticated" }
    }

    let title: string, content: string, dateStr: string
    console.log(data);
    // Handle both FormData and plain object
    if (data instanceof FormData) {
      title = data.get("title") as string
      content = data.get("content") as string
      dateStr = data.get("date") as string
    } else {
      title = data.title
      content = data.content
      dateStr = data.date
    }

    if (!title || !content || !dateStr) {
      return { success: false, message: "All fields are required" }
    }

    const date = new Date(dateStr)
    const now = new Date()

    const encryptedTitle = await encrypt(title, email)
    const encryptedContent = await encrypt(content, email)

    const entry = {
      encryptedTitle,
      encryptedContent,
      date: Timestamp.fromDate(date),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    }

    // Store entry in user's subcollection
    await addDoc(collection(db, "users", userId, "journalEntries"), entry)

    const updateRef = doc(db, "users", userId)

    await updateDoc(updateRef, {
      updatePersona: true
    })

    revalidatePath("/")
    revalidatePath("/calendar")

    return { success: true, message: "Journal entry created successfully" }
  } catch (error) {
    console.error("Error creating journal entry:", error)
    return { success: false, message: "Failed to create journal entry" }
  }
}

// Get all journal entries for a specific user
export async function getJournalEntries(userId: string, userEmail: string) {
  try {
    if (!userId) {
      return { success: false, entries: [], message: "User not authenticated" }
    }

    const q = query(
      collection(db, "users", userId, "journalEntries"),
      orderBy("date", "desc")
    )

    const querySnapshot = await getDocs(q)
    const entries: JournalEntry[] = []

    // Process entries sequentially to handle async decryption
    for (const doc of querySnapshot.docs) {
      const entry = await convertFirestoreEntry(doc.data(), doc.id, userId, userEmail)
      entries.push(entry)
    }

    return { success: true, entries }
  } catch (error) {
    console.error("Error fetching journal entries:", error)
    return { success: false, entries: [] }
  }
}

// Get a single journal entry by ID for a specific user
export async function getJournalEntryById(userId: string, entryId: string, userEmail: string) {
  try {
    console.log(userId);
    if (!userId) {
      return { success: false, entry: null, message: "User not authenticated" }
    }

    const docRef = doc(db, "users", userId, "journalEntries", entryId)
    const docSnap = await getDoc(docRef)
    // console.log("meo ",docSnap);
    if (!docSnap.exists()) {
      return { success: false, entry: null, message: "Entry not found" }
    }

    const entry = await convertFirestoreEntry(docSnap.data(), docSnap.id, userId, userEmail)
    console.log("meow,",entry)
    return { success: true, entry }
  } catch (error) {
    console.error("Error fetching journal entry:", error)
    return { success: false, entry: null, message: "Failed to fetch journal entry" }
  }
}

// Update a journal entry
export async function updateJournalEntry(
  userId: string, 
  entryId: string, 
  email: string,
  data: FormData | { title: string; content: string; date: string }
) {
  try {
    if (!userId) {
      return { success: false, message: "User not authenticated" }
    }

    let title: string, content: string, dateStr: string

    // Handle both FormData and plain object
    if (data instanceof FormData) {
      title = data.get("title") as string
      content = data.get("content") as string
      dateStr = data.get("date") as string
    } else {
      title = data.title
      content = data.content
      dateStr = data.date
    }

    if (!title || !content || !dateStr) {
      return { success: false, message: "All fields are required" }
    }

    // First check if the entry exists
    const docRef = doc(db, "users", userId, "journalEntries", entryId)
    const docSnap = await getDoc(docRef)
    const updateRef = doc(db, "users", userId)


    if (!docSnap.exists()) {
      return { success: false, message: "Entry not found" }
    }

    const date = new Date(dateStr)

    const encryptedTitle = await encrypt(title, email)
    const encryptedContent = await encrypt(content, email)

    await updateDoc(docRef, {
      encryptedTitle,
      encryptedContent,
      date: Timestamp.fromDate(date),
      updatedAt: Timestamp.fromDate(new Date()),
    })

    await updateDoc(updateRef, {
      updatePersona: true
    })

    revalidatePath("/")
    revalidatePath("/calendar")
    revalidatePath(`/entry/${entryId}`)

    return { success: true, message: "Journal entry updated successfully" }
  } catch (error) {
    console.error("Error updating journal entry:", error)
    return { success: false, message: "Failed to update journal entry" }
  }
}

// Delete a journal entry
export async function deleteJournalEntry(userId: string, entryId: string) {
  try {
    if (!userId) {
      return { success: false, message: "User not authenticated" }
    }

    // First check if the entry exists
    const docRef = doc(db, "users", userId, "journalEntries", entryId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return { success: false, message: "Entry not found" }
    }

    await deleteDoc(docRef)

    revalidatePath("/")
    revalidatePath("/calendar")

    return { success: true, message: "Journal entry deleted successfully" }
  } catch (error) {
    console.error("Error deleting journal entry:", error)
    return { success: false, message: "Failed to delete journal entry" }
  }
}

// Get entries for a specific month for a specific user
export async function getEntriesByMonth(userId: string, year: number, month: number, userEmail: string) {
  try {
    if (!userId) {
      return { success: false, entries: [], message: "User not authenticated" }
    }

    // Create date range for the specified month
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)

    const q = query(
      collection(db, "users", userId, "journalEntries"),
      orderBy("date", "asc")
    )

    const querySnapshot = await getDocs(q)
    const entries: JournalEntry[] = []

    // Filter entries by date range and decrypt them
    for (const doc of querySnapshot.docs) {
      const entryData = doc.data()
      const entryDate = entryData.date.toDate()
      
      if (entryDate >= startDate && entryDate <= endDate) {
        const entry = await convertFirestoreEntry(entryData, doc.id, userId, userEmail)
        entries.push(entry)
      }
    }

    return { success: true, entries }
  } catch (error) {
    console.error("Error fetching entries by month:", error)
    return { success: false, entries: [] }
  }
}