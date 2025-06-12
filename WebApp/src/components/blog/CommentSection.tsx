'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { addComment, subscribeToComments, likeComment, hasUserLikedComment } from '@/lib/firebase-blog'
import type { Comment } from '@/types/blog'
import { Heart, Send } from 'lucide-react'

interface CommentSectionProps {
  postId: string
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingCommentId, setLoadingCommentId] = useState<string | null>(null)
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Subscribe to real-time comments updates
    const unsubscribe = subscribeToComments(postId, (updatedComments) => {
      setComments(updatedComments)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [postId])

  // Check which comments the user has liked
  useEffect(() => {
    if (user && comments.length > 0) {
      const checkLikedComments = async () => {
        try {
          const likeChecks = await Promise.all(
            comments.map(comment => 
              comment.id ? hasUserLikedComment(postId, comment.id, user.uid) : Promise.resolve(false)
            )
          )
          
          const likedSet = new Set<string>()
          comments.forEach((comment, index) => {
            if (comment.id && likeChecks[index]) {
              likedSet.add(comment.id)
            }
          })
          
          setLikedComments(likedSet)
        } catch (error) {
          console.error('Error checking liked comments:', error)
        }
      }
      
      checkLikedComments()
    } else {
      setLikedComments(new Set())
    }
  }, [user, comments, postId])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setIsLoading(true)
    try {
      await addComment(postId, {
        userId: user.uid,
        userDisplayName: user.displayName || 'Anonymous',
        userAvatar: user.photoURL || undefined,
        content: newComment.trim(),
        likes: 0
      })
      setNewComment('')
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!user || loadingCommentId) return // Prevent multiple simultaneous likes
    
    const hasLiked = likedComments.has(commentId)
    setLoadingCommentId(commentId)
    
    try {
      // Optimistic update
      setLikedComments(prev => {
        const newSet = new Set(prev)
        if (hasLiked) {
          newSet.delete(commentId)
        } else {
          newSet.add(commentId)
        }
        return newSet
      })
      
      await likeComment(postId, commentId, user.uid, !hasLiked)
      // Comments will be updated automatically via real-time subscription
    } catch (error) {
      // Revert optimistic update on error
      setLikedComments(prev => {
        const newSet = new Set(prev)
        if (hasLiked) {
          newSet.add(commentId) // Revert removal
        } else {
          newSet.delete(commentId) // Revert addition
        }
        return newSet
      })
      console.error('Error liking comment:', error)
    } finally {
      setLoadingCommentId(null)
    }
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">
        Comments ({comments.length})
      </h2>
      
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-4 pr-16 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={4}
            />
            <button
              type="submit"
              disabled={isLoading || !newComment.trim()}
              className="absolute bottom-4 right-4 w-10 h-10 flex items-center justify-center bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Send comment"
            >
              {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
          <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-gray-800/50 rounded-lg text-center">
          <p className="text-gray-400 mb-4">Join the conversation! Sign in to leave a comment.</p>
        </div>
      )}

      {comments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No comments yet</div>
          <p className="text-gray-500">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-800/50 rounded-lg p-6 hover:bg-gray-800/70 transition-colors">
              <div className="flex items-start space-x-4">
                <img
                  src={comment.userAvatar || '/placeholder.svg'}
                  alt={comment.userDisplayName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white">{comment.userDisplayName}</h3>
                    <span className="text-sm text-gray-400 flex-shrink-0">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Just now'}
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                  <div className="flex items-center mt-3">
                    <button
                      onClick={() => comment.id && handleLikeComment(comment.id)}
                      disabled={!user || loadingCommentId === comment.id}
                      className={`flex items-center space-x-2 transition-colors disabled:opacity-50 ${
                        !user
                          ? 'text-gray-600 cursor-not-allowed'
                          : comment.id && likedComments.has(comment.id)
                            ? 'text-red-400'
                            : loadingCommentId === comment.id
                              ? 'text-purple-400 animate-pulse'
                              : 'text-gray-400 hover:text-purple-400'
                      }`}
                      title={
                        !user
                          ? 'Sign in to like'
                          : comment.id && likedComments.has(comment.id)
                            ? 'Unlike comment'
                            : 'Like comment'
                      }
                    >
                      <Heart className={`h-5 w-5 ${
                        comment.id && likedComments.has(comment.id) 
                          ? 'fill-current' 
                          : loadingCommentId === comment.id 
                            ? 'fill-current' 
                            : ''
                      }`} />
                      <span className="text-sm">{comment.likes || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 