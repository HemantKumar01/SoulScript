import Link from "next/link"
import { Heart, MessageSquare, Bookmark, Share2 } from "lucide-react"
import type { BlogPost } from "@/types/blog"
import { formatDate } from "@/lib/date-utils"

interface BlogCardProps {
  post: BlogPost
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-purple-500/30 transition-all group">
      <Link href={`/blogs/${post.slug}`}>
        <div className="relative aspect-video overflow-hidden">
          <img
            src={post.coverImage || "/placeholder.svg"}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {post.category && (
            <div className="absolute top-2 left-2 bg-purple-600/80 text-white text-xs px-2 py-1 rounded">
              {post.category}
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
            <span>{post.readTime} min read</span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-center mb-2">
          <img
            src={post.author.avatar || "https://auzgxzljszsarpxeosby.supabase.co/storage/v1/object/public/user-pfp//Default_pfp.png"}
            alt={post.author.name || "Author"}
            className="w-6 h-6 rounded-full mr-2"
          />
          <span className="text-sm text-gray-400">{post.author.name}</span>
          <span className="text-gray-500 text-xs ml-auto">{formatDate(post.date)}</span>
        </div>

        <Link href={`/blogs/${post.slug}`}>
          <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
            {post.title}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-1 mb-3">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded hover:bg-purple-900/30 hover:text-purple-300 cursor-pointer transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-gray-400 pt-3 border-t border-gray-800">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 hover:text-purple-400 transition-colors">
              <Heart className="h-4 w-4" />
              <span className="text-xs">{post.likes}</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-purple-400 transition-colors">
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs">{post.comments}</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button className="hover:text-purple-400 transition-colors">
              <Bookmark className="h-4 w-4" />
            </button>
            <button className="hover:text-purple-400 transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
