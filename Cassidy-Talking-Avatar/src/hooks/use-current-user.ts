"use client"

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'

export interface UserData {
  id: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  emailVerified: boolean
}

export function useCurrentUser() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [firebaseUser, firebaseLoading, firebaseError] = useAuthState(auth)

  useEffect(() => {
    if (firebaseLoading) return

    if (!firebaseUser) {
      setUser(null)
      setLoading(false)
      return
    }

    // Directly use Firebase user data instead of making API call
    try {
      const userData: UserData = {
        id: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified
      }
      setUser(userData)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [firebaseUser, firebaseLoading])

  useEffect(() => {
    if (firebaseError) {
      setError(firebaseError)
      setLoading(false)
    }
  }, [firebaseError])

  return { user, loading, error }
}
