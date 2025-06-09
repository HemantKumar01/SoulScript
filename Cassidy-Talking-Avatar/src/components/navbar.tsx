"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { auth, signInWithGoogle, signOutUser } from "@/lib/firebase"
import { onAuthStateChanged, User } from "firebase/auth"
import { useRouter } from "next/navigation"
import { Settings, LogOut } from "lucide-react" // Assuming you use lucide-react for icons
  // Import DropdownMenu components from shadcn/ui
import {DropdownMenu,
        DropdownMenuContent,
        DropdownMenuItem,
        DropdownMenuLabel,
        DropdownMenuSeparator,
        DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const isLoggedIn = !!user && !loading

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOutUser()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const login = () => (
    <Button 
      onClick={handleGoogleSignIn}
      variant="ghost" 
      className="text-white hover:bg-purple-900/30"
    >
      Sign In with Google
    </Button>
  )
  
  const logout = () => (
    <Button 
      onClick={handleSignOut}
      variant="ghost" 
      className="text-white hover:bg-purple-900/30"
    >
      Sign Out
    </Button>
  )
  
  const userButton = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 p-0 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
          {user?.photoURL && (
            <img 
              src={user.photoURL} 
              alt="User avatar" 
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-white hidden md:inline">
            {user?.displayName || user?.email}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-gray-900 border-gray-800 text-white">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700"/>
        <DropdownMenuItem 
          className="hover:bg-purple-900/30 focus:bg-purple-900/30"
          onSelect={() => router.push('/settings')} // Assuming a settings page
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="hover:bg-purple-900/30 focus:bg-purple-900/30"
          onSelect={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-500">
              SoulScript
            </span>
          </Link>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                {userButton()}
                {<Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                  <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </Button>}
              </div>
            ) : (
              <>
                {login()}
                <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                  <Link href="/login">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-300 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* todo: mobile navigation link fix same as desktop */}
            <div className="pt-8 border-t border-gray-800 flex flex-col space-y-3">
              {isLoggedIn ? (
                <>
                  <div className="flex justify-center py-2">
                    {userButton()}
                  </div>
                  {logout()}
                </>
              ) : (
                <>
                  {login()}
                  <Button
                    asChild
                    className="justify-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
