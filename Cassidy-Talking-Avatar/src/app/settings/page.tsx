"use client"

import { useState } from "react"
import { deleteUser, signOut, updateProfile, updatePassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useRouter } from "next/navigation"
import AuthRequired from "@/components/auth-required"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast } from "sonner"

export default function SettingsPage() {
  const { user, loading } = useCurrentUser()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [photoURL, setPhotoURL] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  if (loading) {
    return (
      <div className="container mx-auto py-20 px-4">
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      toast.success("Signed out successfully!")
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to sign out")
    }
  }

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return

    setIsDeleting(true)
    try {
      await deleteUser(auth.currentUser)
      toast.success("Account deleted successfully!")
      router.push("/")
    } catch (error) {
      console.error("Error deleting account:", error)
      toast.error("Failed to delete account. You may need to re-authenticate first.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.currentUser) return

    setIsUpdating(true)
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName || auth.currentUser.displayName,
        photoURL: photoURL || auth.currentUser.photoURL,
      })
      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.currentUser || !newPassword) return

    setIsUpdating(true)
    try {
      await updatePassword(auth.currentUser, newPassword)
      toast.success("Password updated successfully!")
      setNewPassword("")
    } catch (error) {
      console.error("Error updating password:", error)
      toast.error("Failed to update password")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <AuthRequired>
      <div className="container mx-auto py-20 px-4">
        <div className="mt-16 max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={user?.email || ""} 
                    disabled 
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={user?.displayName || "Enter display name"}
                  />
                </div>
                <div>
                  <Label htmlFor="photoURL">Photo URL</Label>
                  <Input
                    id="photoURL"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    placeholder={user?.photoURL || "Enter photo URL"}
                  />
                </div>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <Button type="submit" disabled={isUpdating || !newPassword}>
                  {isUpdating ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong>Email:</strong> {user?.email}
              </div>
              <div>
                <strong>Display Name:</strong> {user?.displayName || "Not set"}
              </div>
              <div>
                <strong>Email Verified:</strong> {user?.emailVerified ? "Yes" : "No"}
              </div>
              <div>
                <strong>Account ID:</strong> {user?.id}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleSignOut} variant="outline">
                Sign Out
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? "Deleting..." : "Delete Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthRequired>
  )
}
