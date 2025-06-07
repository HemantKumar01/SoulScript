import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Heart, MessageSquare, Bookmark, Share2 } from "lucide-react"
import { getBlogPostBySlug } from "@/lib/firebase-blog"
import type { BlogPost } from "@/types/blog"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug)

  if (!post) {
    return {
      title: "Post Not Found - SoulScript",
      description: "The requested blog post could not be found.",
    }
  }

  return {
    title: `${post.title} - SoulScript Blog`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const typedPost = post as BlogPost

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pt-4 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/blogs" className="inline-flex items-center text-gray-400 hover:text-purple-400 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to blogs
          </Link>

          <article>
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{typedPost.title}</h1>

              <div className="flex items-center mb-6">
                <img
                  src={typedPost.author.avatar || "/placeholder.svg"}
                  alt={typedPost.author.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <div className="font-medium">{typedPost.author.name}</div>
                  <div className="text-sm text-gray-400">
                    {new Date(typedPost.date).toLocaleDateString()} · {typedPost.readTime} min read
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {typedPost.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded hover:bg-purple-900/30 hover:text-purple-300 cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="aspect-video overflow-hidden rounded-lg mb-8">
                <img
                  src={typedPost.coverImage || "/placeholder.svg"}
                  alt={typedPost.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="prose prose-invert prose-purple max-w-none">
                <p className="text-lg text-gray-300 mb-6">{typedPost.excerpt}</p>
                <div dangerouslySetInnerHTML={{ __html: typedPost.content }} />
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6 mt-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-purple-400 transition-colors">
                    <Heart className="h-5 w-5" />
                    <span>{typedPost.likes}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-purple-400 transition-colors">
                    <MessageSquare className="h-5 w-5" />
                    <span>{typedPost.comments}</span>
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="text-gray-400 hover:text-purple-400 transition-colors">
                    <Bookmark className="h-5 w-5" />
                  </button>
                  <button className="text-gray-400 hover:text-purple-400 transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
