'use client'

import { Search } from "lucide-react"
import BlogCard from "@/components/blog-card"
import BlogSidebar from "@/components/blog-sidebar"
import { getAllBlogPosts } from "@/lib/firebase-blog"
import { useEffect, useState } from "react"
import type { BlogPost } from "@/types/blog"
import '../../globals.css' // Ensure global styles are imported

export default function BlogsPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const posts = await getAllBlogPosts()
        setBlogPosts(posts)
        setFilteredPosts(posts)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Filter posts based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPosts(blogPosts)
    } else {
      const filtered = blogPosts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredPosts(filtered)
    }
  }, [searchQuery, blogPosts])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading posts...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Error loading posts: {error}
      </div>
    )
  }
  return (
  <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950">

    {/* Header */}
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-emerald-900/20 border-b border-gray-700/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              Soulgram
            </h1>
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
              <span className="w-2 h-2 bg-emerald-500 rounded-full "></span>
              <span> A Community to heal together</span>
            </div>
          </div>
          
        </div>
      </div>
    </header>

    <div className="pt-8 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <BlogSidebar />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Settings Bar */}
            <div className="flex items-center justify-between mb-8 bg-gradient-to-r from-gray-800/80 via-gray-700/80 to-emerald-900/20 rounded-xl p-4 border border-gray-600/30 backdrop-blur-sm">
              <div className="relative flex-1 max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-emerald-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search articles by title, author, or tags..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg pl-12 pr-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                />
              </div>
              {/* <button className="ml-4 p-3 bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-600 hover:to-green-600 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </button> */}
            </div>

            {/* Featured Section */}
            <div className="mb-8 p-6 bg-gradient-to-r from-emerald-900/30 via-green-900/20 to-gray-800/50 rounded-xl border border-emerald-700/30">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
                <h2 className="text-lg font-semibold text-emerald-300">Featured Content</h2>
                <div className="flex flex-wrap gap-3 ml-120">
                <span className="text-xs bg-emerald-800/50 text-emerald-200 px-2 py-1 rounded-full border border-emerald-700/50">
                  🧠 Mental Wellness
                </span>
                <span className="text-xs bg-green-800/50 text-green-200 px-2 py-1 rounded-full border border-green-700/50">
                  💚 Self Care
                </span>
                <span className="text-xs bg-green-800/50 text-green-200 px-2 py-1 rounded-full border border-gray-600/50">
                  🌱 Growth
                </span>
              </div>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Discover trending blogs from other user & experts about their experience.
              </p>
              
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-400">No posts found matching your search.</p>
                </div>
              )}
            </div>

            
          </div>
        </div>
      </div>
    </div>
  </div>
)
}