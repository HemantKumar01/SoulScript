import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getBlogPostBySlug } from "@/lib/firebase-blog"
import type { BlogPost } from "@/types/blog"
import CommentSection from "@/components/blog/CommentSection"
import BlogPostActions from "@/components/blog/BlogPostActions"
import { followUser } from "@/lib/firebase-blog"
import FollowCard from "@/components/blog/FollowCard"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug)

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

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const typedPost = post as BlogPost

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pt-8 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/dashboard/blogs" className="inline-flex items-center text-gray-400 hover:text-purple-400 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to blogs
          </Link>

          <article>
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{typedPost.title}</h1>

              <FollowCard
                targetUserId={typedPost.author.id}
                avatarUrl={typedPost.author.avatar}
                authorName={typedPost.author.name}
                postDate={typedPost.date}
                readTime={typedPost.readTime}
              />

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

            <BlogPostActions 
              postId={typedPost.id}
              initialLikes={typedPost.likes}
              initialComments={typedPost.comments}
              initialBookmarks={typedPost.bookmarks}
            />
          </article>

          <div id="comments-section">
            <CommentSection postId={typedPost.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
