"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, Bookmark, Clock, History, Tag, Users, Award, MessageSquare } from "lucide-react"

export default function BlogSidebar() {
  const [openSections, setOpenSections] = useState({
    feeds: true,
    bookmarks: false,
    discover: false,
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="mb-6">
        <Link
          href="/blogs/new"
          className="w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-4 rounded-md transition-colors"
        >
          <span className="mr-2">+</span> New post
        </Link>
      </div>

      {/* Feeds Section */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection("feeds")}
          className="flex items-center justify-between w-full text-left font-medium mb-2"
        >
          <span>Feeds</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.feeds ? "transform rotate-180" : ""}`} />
        </button>
        {openSections.feeds && (
          <div className="space-y-2 pl-2">
            <Link href="/blogs" className="flex items-center text-sm text-purple-400 hover:text-purple-300">
              <MessageSquare className="h-4 w-4 mr-2" />
              My feed
            </Link>
            <Link href="/blogs/following" className="flex items-center text-sm text-gray-400 hover:text-white">
              <Users className="h-4 w-4 mr-2" />
              Following
            </Link>
            <Link href="/blogs/explore" className="flex items-center text-sm text-gray-400 hover:text-white">
              <Tag className="h-4 w-4 mr-2" />
              Explore
            </Link>
            <Link href="/blogs/history" className="flex items-center text-sm text-gray-400 hover:text-white">
              <History className="h-4 w-4 mr-2" />
              History
            </Link>
          </div>
        )}
      </div>

      {/* Bookmarks Section */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection("bookmarks")}
          className="flex items-center justify-between w-full text-left font-medium mb-2"
        >
          <span>Bookmarks</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${openSections.bookmarks ? "transform rotate-180" : ""}`}
          />
        </button>
        {openSections.bookmarks && (
          <div className="space-y-2 pl-2">
            <Link href="/blogs/saved" className="flex items-center text-sm text-gray-400 hover:text-white">
              <Bookmark className="h-4 w-4 mr-2" />
              Saved articles
            </Link>
            <Link href="/blogs/reading-list" className="flex items-center text-sm text-gray-400 hover:text-white">
              <Clock className="h-4 w-4 mr-2" />
              Reading list
            </Link>
          </div>
        )}
      </div>

      {/* Discover Section */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection("discover")}
          className="flex items-center justify-between w-full text-left font-medium mb-2"
        >
          <span>Discover</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${openSections.discover ? "transform rotate-180" : ""}`}
          />
        </button>
        {openSections.discover && (
          <div className="space-y-2 pl-2">
            <Link href="/blogs/tags" className="flex items-center text-sm text-gray-400 hover:text-white">
              <Tag className="h-4 w-4 mr-2" />
              Tags
            </Link>
            <Link href="/blogs/top-authors" className="flex items-center text-sm text-gray-400 hover:text-white">
              <Award className="h-4 w-4 mr-2" />
              Top authors
            </Link>
          </div>
        )}
      </div>

      {/* Popular Tags */}
      <div className="mt-6">
        <h3 className="font-medium mb-3">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded hover:bg-purple-900/30 hover:text-purple-300 cursor-pointer transition-colors">
            #mentalhealth
          </span>
          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded hover:bg-purple-900/30 hover:text-purple-300 cursor-pointer transition-colors">
            #therapy
          </span>
          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded hover:bg-purple-900/30 hover:text-purple-300 cursor-pointer transition-colors">
            #selfcare
          </span>
          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded hover:bg-purple-900/30 hover:text-purple-300 cursor-pointer transition-colors">
            #anxiety
          </span>
          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded hover:bg-purple-900/30 hover:text-purple-300 cursor-pointer transition-colors">
            #wellness
          </span>
          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded hover:bg-purple-900/30 hover:text-purple-300 cursor-pointer transition-colors">
            #mindfulness
          </span>
        </div>
      </div>
    </div>
  )
}
