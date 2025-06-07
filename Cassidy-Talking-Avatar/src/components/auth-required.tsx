"use client"

import { auth } from "@/lib/firebase"
import { onAuthStateChanged, User } from "firebase/auth"
import { redirect } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"

export default function AuthRequired({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  if (!user) {
    redirect("/sign-in")
  }
  
  return <>{children}</>
}
