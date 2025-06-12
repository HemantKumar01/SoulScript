'use client'

import { useState, useEffect } from 'react'
import { Edit, Trash2, Eye, Heart, MessageCircle, Bookmark, Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getBlogPostsByAuthor } from '@/lib/firebase-blog'
import type { BlogPost } from '@/types/blog'
import { getCurrentUser } from '@/lib/firebase'
import { requireAuth } from '@/lib/firebase'

export default function MyPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // You'll need to get current user ID from your auth context
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserAndPosts() {
      try {
        console.log("ruk ja sabar kar");
        await requireAuth() ; 
        const user = await getCurrentUser()
        
        console.log(user, 'user fetched')

        if (!user) {
          setError('User not logged in')
          return
        }

        setCurrentUserId(user.uid)
        const userPosts = await getBlogPostsByAuthor(user.uid)
        setPosts(userPosts)
      } catch (err: any) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndPosts()
  }, [])


  const handleDeletePost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      // You'll need to implement deletePost function in firebase-blogs.ts
      try {
        // await deletePost(postId)
        setPosts(posts.filter(post => post.id !== postId))
      } catch (err) {
        console.error('Failed to delete post:', err)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading your posts...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-emerald-900/20 border-b border-gray-700/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard/blogs" 
                className="p-2 bg-gray-700/50 hover:bg-emerald-700/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-emerald-400" />
              </Link>
              <div className="flex items-center space-x-3">
                <Edit className="h-8 w-8 text-emerald-400" />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                    My Posts
                  </h1>
                  <p className="text-gray-400 text-sm">Manage your published articles</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-emerald-300 bg-emerald-900/30 px-3 py-2 rounded-lg border border-emerald-700/50">
                {posts.length} posts
              </div>
              <Link 
                href="/dashboard/blogs/new"
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Post</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <Edit className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No posts yet</h3>
            <p className="text-gray-500 mb-6">
              Start sharing your thoughts and experiences with the community.
            </p>
            <Link 
              href="/dashboard/blogs/new"
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Write Your First Post</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <article key={post.id} className="bg-gradient-to-br from-gray-800/50 via-gray-700/30 to-emerald-900/10 rounded-xl border border-gray-600/30 hover:border-emerald-600/50 transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Title & Date */}
                      <div className="flex items-start justify-between mb-3">
                        <Link href={`/dashboard/blogs/${post.slug}`} className="group flex-1">
                          <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                            {post.title}
                          </h2>
                        </Link>
                        <div className="flex items-center space-x-2 ml-4">
                          <Link
                            href={`/dashboard/blogs/edit/${post.id}`}
                            className="p-2 bg-gray-700/50 hover:bg-emerald-700/50 rounded-lg transition-colors"
                            title="Edit post"
                          >
                            <Edit className="h-4 w-4 text-emerald-400" />
                          </Link>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-2 bg-gray-700/50 hover:bg-red-700/50 rounded-lg transition-colors"
                            title="Delete post"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                      </div>

                      {/* Date & Category */}
                      <div className="flex items-center space-x-4 mb-3 text-sm text-gray-400">
                        <span>Published {new Date(post.date).toLocaleDateString()}</span>
                        {post.category && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400">{post.category}</span>
                          </>
                        )}
                      </div>

                      {/* Excerpt */}
                      <p className="text-gray-300 mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>

                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-emerald-800/30 text-emerald-300 px-2 py-1 rounded-full border border-emerald-700/50"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 text-gray-400 text-sm">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>Views</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="h-4 w-4" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Bookmark className="h-4 w-4" />
                            <span>{post.bookmarks}</span>
                          </div>
                        </div>
                        
                        <Link 
                          href={`/dashboard/blogs/${post.slug}`}
                          className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                        >
                          View Post →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}