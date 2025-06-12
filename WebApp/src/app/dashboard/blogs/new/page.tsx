"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon, LinkIcon, Check, Smile, Paperclip } from "lucide-react"
import BlogSidebar from "@/components/blog-sidebar"
import TagInput from "@/components/tag-input"
import { supabase } from "@/lib/supabaseClient"
import { useCurrentUser } from "@/hooks/use-current-user"
import { createBlogPost } from "@/lib/firebase-blog"
import { v4 as uuidv4 } from 'uuid'

export default function NewPostPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useCurrentUser()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [category, setCategory] = useState("")
  const [activeTab, setActiveTab] = useState("write")
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file)) // Show preview immediately

      // Upload to Supabase Storage
      setIsUploading(true)
      setUploadError(null)
      const fileName = `${uuidv4()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('blog-thumbnails') // Make sure this bucket exists and has correct policies
        .upload(fileName, file)

      if (error) {
        console.error("Error uploading thumbnail:", error)
        setUploadError(error.message)
        setThumbnailPreview(null) // Clear preview on error
      } else if (data) {
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('blog-thumbnails')
          .getPublicUrl(fileName)
        setThumbnailPreview(publicUrlData.publicUrl)
        console.log("Uploaded thumbnail URL:", publicUrlData.publicUrl)
      }
      setIsUploading(false)
    }
  }

  const handleThumbnailClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert("You must be signed in to create a post.")
      router.push("/sign-in?redirect_url=/dashboard/blogs/new")
      return
    }
    
    if (!title || !content || !category) {
      alert("Please fill in title, content, and category.")
      return
    }

    // Ensure thumbnailPreview is not null before proceeding
    let coverImageUrl = thumbnailPreview;
    if (isUploading) {
      alert("Image is still uploading. Please wait.");
      return;
    }
    if (uploadError) {
      alert(`Image upload failed: ${uploadError}. Please try again or remove the image.`);
      return;
    }

    // Generate excerpt from content (first 150 characters)
    const excerpt = content.substring(0, 150) + (content.length > 150 ? '...' : '');
    
    const newPost = {
      slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''), // simple slug generation
      title,
      excerpt,
      content, // Storing raw markdown/text
      tags,
      category, 
      coverImage: coverImageUrl || '', // Use the public URL from Supabase Storage
      author: { 
        id: user?.id || '', // Store user ID
        name: user?.displayName || "Anonymous User", 
        avatar: user?.photoURL || "https://auzgxzljszsarpxeosby.supabase.co/storage/v1/object/public/user-pfp//Default_pfp.png"
      },
      date: new Date().toISOString(),
      readTime: Math.ceil(content.split(' ').length / 200), 
      likes: 0,
      comments: 0,
      bookmarks: 0,
    }

    try {
      // Use Firebase to create the blog post
      const postId = await createBlogPost(newPost);
      console.log("Post created with ID:", postId);
      router.push("/dashboard/blogs"); // Navigate immediately after successful post
    } catch (err) {
      console.error("Error creating post:", err);
      alert(`Error creating post: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  const handleAutoSave = () => {
    // Simulate auto-save functionality
    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
    }, 3000)
  }

  const categories = [
    "Mental Health",
    "Therapy",
    "Self-Care",
    "Mindfulness",
    "Anxiety",
    "Depression",
    "Wellness",
    "Technology",
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pt-8 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0">
              <BlogSidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-gray-900 rounded-lg p-6">
              {/* User Info */}
              <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <div className="relative h-8 w-8 rounded-full overflow-hidden mr-3">
                    {userLoading ? (
                      <div className="animate-pulse bg-gray-700 h-full w-full"></div>
                    ) : (
                      <img 
                        src={user?.photoURL || "/placeholder-user.jpg"}
                        alt="Profile" 
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {userLoading ? (
                        <div className="animate-pulse bg-gray-700 h-4 w-32 rounded"></div>
                      ) : (
                        <p>Posting as: {user?.displayName || "Anonymous User"}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <Tabs defaultValue="post" className="mb-6">
                <TabsList className="bg-gray-800">
                  <TabsTrigger value="post" className="data-[state=active]:bg-gray-700">
                    New post
                  </TabsTrigger>
                  <TabsTrigger value="link" className="data-[state=active]:bg-gray-700">
                    Share a link
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="post" className="mt-4">
                  <form onSubmit={handleSubmit}>
                    {/* Category Selection */}
                    <div className="mb-6">
                      <div className="relative">
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 pl-4 pr-10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}</select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Thumbnail Upload */}
                    <div className="mb-6">
                      <div
                        onClick={handleThumbnailClick}
                        className="flex items-center justify-center bg-gray-800 border border-gray-700 border-dashed rounded-md h-40 cursor-pointer hover:bg-gray-750 transition-colors"
                      >
                        {thumbnailPreview ? (
                          <img src={thumbnailPreview} alt="Thumbnail preview" className="h-full w-full object-cover rounded-md" />
                        ) : (
                          <div className="text-center text-gray-400">
                            <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                            <span>Click to upload thumbnail</span>
                          </div>
                        )}
                        {isUploading && <p className="mt-2 text-sm text-purple-400">Uploading image...</p>}
                        {uploadError && <p className="mt-2 text-sm text-red-500">Upload error: {uploadError}</p>}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleThumbnailChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>

                    {/* Title Input */}
                    <div className="mb-6">
                      <div className="relative">
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Post Title*"
                          className="w-full bg-gray-800 border border-gray-700 rounded-md py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          maxLength={250}
                        />
                        <div className="absolute right-3 bottom-3 text-xs text-gray-400">{title.length}/250</div>
                      </div>
                    </div>

                    {/* Tags Input */}
                    <div className="mb-6">
                      <TagInput tags={tags} setTags={setTags} />
                    </div>

                    {/* Content Editor */}
                    <div className="mb-6">
                      <div className="bg-gray-800 border border-gray-700 rounded-md overflow-hidden">
                        <div className="flex border-b border-gray-700">
                          <button
                            type="button"
                            onClick={() => setActiveTab("write")}
                            className={`px-4 py-2 ${
                              activeTab === "write" ? "bg-gray-700" : "hover:bg-gray-750"
                            } transition-colors`}
                          >
                            Write
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab("preview")}
                            className={`px-4 py-2 ${
                              activeTab === "preview" ? "bg-gray-700" : "hover:bg-gray-750"
                            } transition-colors`}
                          >
                            Preview
                          </button>
                        </div>
                        {activeTab === "write" ? (
                          <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Start writing your amazing blog post here...\nUse markdown for formatting."
                            className="w-full h-64 bg-gray-800 p-4 text-white placeholder-gray-400 focus:outline-none resize-none"
                          />
                        ) : (
                          <div 
                            className="p-4 prose prose-invert prose-purple max-w-none min-h-[16rem] whitespace-pre-wrap" 
                            dangerouslySetInnerHTML={{ __html: content.replace(/\\n/g, '<br />') /* Basic preview, consider a markdown library */ }} 
                          />
                        )}
                        <div className="flex items-center justify-between p-2 border-t border-gray-700 text-xs text-gray-400">
                          <div>Markdown supported</div>
                          <div className="flex items-center">
                            {isSaved && <Check className="h-4 w-4 text-green-500 mr-1" />}
                            <span>{content.split(/\\s+/).filter(Boolean).length} words</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 hover:via-green-500 hover:to-emerald-600 text-white py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25 text-white border-0 px-8"
                      >
                        Post
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="link" className="mt-4">
                  <div className="bg-gray-800 border border-gray-700 rounded-md p-6 text-center">
                    <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Share a link</h3>
                    <p className="text-gray-400 mb-4">
                      Paste a link to an article, video, or any other content you want to share
                    </p>
                    <div className="relative mb-4">
                      <input
                        type="text"
                        placeholder="https://"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-8">
                      Fetch & Share
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
