'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageSquare, Bookmark, Share2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ToastContainer, toast } from 'react-toastify';
import { 
  updateBlogPostLikes, 
  updateBlogPostBookmarks,
  hasUserLikedPost,
  hasUserBookmarkedPost
} from '@/lib/firebase-blog'

interface BlogPostActionsProps {
  postId: string
  initialLikes: number
  initialComments: number
  initialBookmarks: number
}

export default function BlogPostActions({ 
  postId, 
  initialLikes, 
  initialComments, 
  initialBookmarks 
}: BlogPostActionsProps) {
  const { user } = useAuth()
  const [likes, setLikes] = useState(initialLikes)
  const [bookmarks, setBookmarks] = useState(initialBookmarks)
  const [isLiking, setIsLiking] = useState(false)
  const [isBookmarking, setIsBookmarking] = useState(false)
  const [hasLiked, setHasLiked] = useState(false)
  const [hasBookmarked, setHasBookmarked] = useState(false)

  useEffect(() => {
    if (user) {
      // Check if user has already liked/bookmarked this post using Firebase
      const checkUserInteractions = async () => {
        try {
          const [liked, bookmarked] = await Promise.all([
            hasUserLikedPost(postId, user.uid),
            hasUserBookmarkedPost(postId, user.uid)
          ])
          setHasLiked(liked)
          setHasBookmarked(bookmarked)
        } catch (error) {
          console.error('Error checking user interactions:', error)
        }
      }
      
      checkUserInteractions()
    } else {
      setHasLiked(false)
      setHasBookmarked(false)
    }
  }, [user, postId])

  const handleLike = async () => {
    if (!user || isLiking) return

    setIsLiking(true)
    const wasLiked = hasLiked
    const increment = wasLiked ? -1 : 1
    
    try {
      // Optimistic update
      setLikes(prev => prev + increment)
      setHasLiked(!wasLiked)
      
      await updateBlogPostLikes(postId, user.uid, !wasLiked)
    } catch (error) {
      // Revert on error
      setLikes(prev => prev - increment)
      setHasLiked(wasLiked)
      
      console.error('Error updating like:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleBookmark = async () => {
    if (!user || isBookmarking) return

    setIsBookmarking(true)
    const wasBookmarked = hasBookmarked
    const increment = wasBookmarked ? -1 : 1
    
    try {
      // Optimistic update
      setBookmarks(prev => prev + increment)
      setHasBookmarked(!wasBookmarked)
      
      await updateBlogPostBookmarks(postId, user.uid, !wasBookmarked)
    } catch (error) {
      // Revert on error
      setBookmarks(prev => prev - increment)
      setHasBookmarked(wasBookmarked)
      
      console.error('Error updating bookmark:', error)
    } finally {
      setIsBookmarking(false)
    }
  }

  const notify = () => toast("Link to this post copied to clipboard!")

const handleShare = async () => {
    const url = window.location.href
    
    try {
        await navigator.clipboard.writeText(url)
        // Replace this with your preferred toast notification
        toast("Link to this post copied to clipboard!")
    } catch (error) {
        console.error('Error copying to clipboard:', error)
        // Optionally, show an error toast here
        toast('Failed to copy link.')
    }
}

  const scrollToComments = () => {
    const commentsSection = document.querySelector('#comments-section')
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="border-t border-gray-800 pt-6 mt-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button 
            onClick={handleLike}
            disabled={!user || isLiking}
            className={`flex items-center space-x-2 transition-colors ${
              !user 
                ? 'text-gray-600 cursor-not-allowed' 
                : hasLiked
                  ? 'text-red-400'
                  : isLiking
                    ? 'text-purple-400 animate-pulse'
                    : 'text-gray-400 hover:text-purple-400'
            }`}
            title={
              !user 
                ? 'Sign in to like' 
                : hasLiked 
                  ? 'You liked this post' 
                  : 'Like this post'
            }
          >
            <Heart className={`h-5 w-5 ${hasLiked ? 'fill-current' : isLiking ? 'fill-current' : ''}`} />
            <span>{likes}</span>
          </button>
          
          <button 
            onClick={scrollToComments}
            className="flex items-center space-x-2 text-gray-400 hover:text-purple-400 transition-colors"
            title="View comments"
          >
            <MessageSquare className="h-5 w-5" />
            <span>{initialComments}</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleBookmark}
            disabled={!user || isBookmarking}
            className={`transition-colors ${
              !user 
                ? 'text-gray-600 cursor-not-allowed' 
                : hasBookmarked
                  ? 'text-yellow-400'
                  : isBookmarking
                    ? 'text-purple-400 animate-pulse'
                    : 'text-gray-400 hover:text-purple-400'
            }`}
            title={
              !user 
                ? 'Sign in to bookmark' 
                : hasBookmarked 
                  ? 'Remove bookmark' 
                  : 'Bookmark this post'
            }
          >
            <Bookmark className={`h-5 w-5 ${hasBookmarked ? 'fill-current' : isBookmarking ? 'fill-current' : ''}`} />
          </button>
          
          <button 
            onClick={handleShare}
            className="text-gray-400 hover:text-purple-400 transition-colors"
            title="Share this post"
          >
            <Share2 className="h-5 w-5" />
            <ToastContainer
                position="bottom-right"
                autoClose={1000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
          </button>
        </div>
      </div>

      {!user && (
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-800/30">
          <p className="text-sm text-gray-300 text-center">
            💜 <span className="text-purple-400 font-medium">Sign in</span> to like, bookmark, and interact with posts
          </p>
        </div>
      )}

      {user && hasLiked && (
        <div className="mt-4 p-3 bg-red-900/20 rounded-lg border border-red-800/30">
          <p className="text-sm text-red-300 text-center flex items-center justify-center gap-2">
            <Heart className="h-4 w-4 fill-current" />
            Thanks for liking this post!
          </p>
        </div>
      )}
    </div>
  )
}
