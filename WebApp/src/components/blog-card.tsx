'use client'

import Link from "next/link"
import { Heart, MessageSquare, Bookmark, Share2 } from "lucide-react"
import { useEffect, useState } from "react"
import { isUserFollowing, followUser } from "@/lib/firebase-blog"
import { getCurrentUser } from "@/lib/firebase"
import type { BlogPost } from "@/types/blog"
import { formatDate } from "@/lib/date-utils"
import { requireAuth } from "@/lib/firebase"

interface BlogCardProps {
  post: BlogPost
}

export default function BlogCard({ post }: BlogCardProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchStatus() {
      await requireAuth();
      const user = await getCurrentUser()
      if (!user || user.uid === post.author.id) return
      setCurrentUserId(user.uid)
      const status = await isUserFollowing(user.uid, post.author.id)
      setIsFollowing(status)
    }
    fetchStatus()
  }, [post.author.id])

  const handleFollow = async () => {
    if (!currentUserId) return
    setLoading(true)
    try {
      await followUser(currentUserId, post.author.id, !isFollowing)
      setIsFollowing(prev => !prev)
    } catch (err) {
      console.error("Follow action failed", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-emerald-500/30 transition-all group">
      <Link href={`/dashboard/blogs/${post.slug}`}>
        <div className="relative aspect-video overflow-hidden">
          <img
            src={post.coverImage || "/placeholder.svg"}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {post.category && (
            <div className="absolute top-2 left-2 bg-emerald-700/80 text-white text-xs px-2 py-1 rounded">
              {post.category}
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
            <span>{post.readTime} min read</span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <img
              src={post.author.avatar || "https://auzgxzljszsarpxeosby.supabase.co/storage/v1/object/public/user-pfp//Default_pfp.png"}
              alt={post.author.name || "Author"}
              className="w-6 h-6 rounded-full mr-2"
            />
            <span className="text-sm text-gray-300">{post.author.name}</span>
          </div>

          {currentUserId && currentUserId !== post.author.id && (
            <button
              onClick={handleFollow}
              disabled={loading}
              className={`text-xs px-3 py-1 rounded-full border transition ${
                isFollowing
                  ? 'text-gray-300 border-gray-500 hover:bg-gray-800'
                  : 'text-emerald-400 border-emerald-600 hover:bg-emerald-950/30'
              }`}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>

        <span className="text-gray-500 text-xs block mb-1">{formatDate(post.date)}</span>

        <Link href={`/dashboard/blogs/${post.slug}`}>
          <h3 className="text-lg font-bold text-gray-100 mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
            {post.title}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-1 mb-3">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded hover:bg-gray-700/60 hover:text-white cursor-pointer transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-gray-400 pt-3 border-t border-gray-800">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 hover:text-emerald-400 transition-colors">
              <Heart className="h-4 w-4" />
              <span className="text-xs">{post.likes}</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-emerald-400 transition-colors">
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs">{post.comments}</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button className="hover:text-emerald-400 transition-colors">
              <Bookmark className="h-4 w-4" />
            </button>
            <button className="hover:text-emerald-400 transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
