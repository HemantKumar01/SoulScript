'use client'

import { useEffect, useState } from 'react'
import { isUserFollowing, followUser } from '@/lib/firebase-blog'
import { getCurrentUser, requireAuth } from '@/lib/firebase'

interface FollowCardProps {
  targetUserId: string
  avatarUrl?: string
  authorName: string
  postDate: string // ISO string or date string
  readTime: string | number // like "4" or "4 min"
}

export default function FollowCard({
  targetUserId,
  avatarUrl = '/placeholder.svg',
  authorName,
  postDate,
  readTime,
}: FollowCardProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    async function checkFollowStatus() {
      await requireAuth();
      const user = getCurrentUser();
      setCurrentUserId(user.uid)
      const following = await isUserFollowing(currentUserId, targetUserId)
      setIsFollowing(following)
    }
    checkFollowStatus()
  }, [targetUserId])

  const handleFollowClick = async () => {
    if (!currentUserId) return
    setLoading(true)
    try {
      await followUser(currentUserId, targetUserId, !isFollowing)
      setIsFollowing(prev => !prev)
    } catch (err) {
      console.error('Follow/unfollow failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center mb-6 justify-between">
      <div className="flex items-center">
        <img
          src={avatarUrl}
          alt={authorName}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <div className="font-medium">{authorName}</div>
          <div className="text-sm text-gray-400">
            {new Date(postDate).toLocaleDateString()} · {readTime} min read
          </div>
        </div>
      </div>
      <button
        onClick={handleFollowClick}
        disabled={loading}
        className={`px-4 py-1 rounded text-sm transition ${
          isFollowing
            ? 'bg-gray-300 text-gray-800 hover:bg-gray-400'
            : 'bg-emerald-600 text-white hover:bg-emerald-700'
        }`}
      >
        {isFollowing ? 'Unfollow' : 'Follow'}
      </button>
    </div>
  )
}
