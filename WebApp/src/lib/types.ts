import { Timestamp } from "firebase/firestore"

export interface JournalEntry {
  id?: string // Firestore document ID
  title: string
  content: string
  date: Date | Timestamp
  createdAt: Date | Timestamp
  updatedAt: Date | Timestamp
  userId: string // Add userId to associate entries with users
}

export interface User {
  id: string
  email: string
  displayName?: string
  createdAt: Date | Timestamp
}