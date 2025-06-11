"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, Bookmark, Clock, History, Tag, Users, Award, MessageSquare } from "lucide-react"

export default function BlogSidebar() {
  const [openSections, setOpenSections] = useState({
    feeds: true,
    bookmarks: true,
    discover: false,
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
  <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900/20 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
    <div className="mb-8">
      <Link
        href="/dashboard/blogs/new"
        className="w-full flex items-center justify-center bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 hover:via-green-500 hover:to-emerald-600 text-white py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25"
      >
        <span className="mr-2 text-lg">+</span> 
        <span className="font-medium">New Post</span>
      </Link>
    </div>

    {/* Feeds Section */}
    <div className="mb-6">
      <button
        onClick={() => toggleSection("feeds")}
        className="flex items-center justify-between w-full text-left font-semibold mb-3 text-emerald-300 hover:text-emerald-200 transition-colors"
      >
        <span className="text-lg">Feeds</span>
        <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${openSections.feeds ? "transform rotate-180" : ""}`} />
      </button>
      {openSections.feeds && (
        <div className="space-y-3 pl-3 border-l-2 border-emerald-800/50">
          <Link href="/dashboard/blogs" className="flex items-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors group">
            <MessageSquare className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
            <span>My Feed</span>
          </Link>
          
          <Link href="/dashboard/blogs/history" className="flex items-center text-sm text-gray-300 hover:text-emerald-300 transition-colors group">
            <History className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
            <span>My Posts</span>
          </Link>
        </div>
      )}
    </div>

    {/* Bookmarks Section -- nah its discover now*/}
    <div className="mb-6">
      <button
        onClick={() => toggleSection("bookmarks")}
        className="flex items-center justify-between w-full text-left font-semibold mb-3 text-emerald-300 hover:text-emerald-200 transition-colors"
      >
        <span className="text-lg"> Discover</span>
        <ChevronDown
          className={`h-5 w-5 transition-transform duration-200 ${openSections.bookmarks ? "transform rotate-180" : ""}`}
        />
      </button>
      {openSections.bookmarks && (
        <div className="space-y-3 pl-3 border-l-2 border-emerald-800/50">
         
           <Link href="/dashboard/blogs/following" className="flex items-center text-sm text-gray-300 hover:text-emerald-300 transition-colors group">
            <Users className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
            <span>Following</span>
          </Link>
          
        </div>
      )}
    </div>

    {/* Discover Section */}
    {/* <div className="mb-6">
      <button
        onClick={() => toggleSection("discover")}
        className="flex items-center justify-between w-full text-left font-semibold mb-3 text-emerald-300 hover:text-emerald-200 transition-colors"
      >
        <span className="text-lg">Discover</span>
        <ChevronDown
          className={`h-5 w-5 transition-transform duration-200 ${openSections.discover ? "transform rotate-180" : ""}`}
        />
      </button>
      {openSections.discover && (
        <div className="space-y-3 pl-3 border-l-2 border-emerald-800/50">
          <Link href="/dashboard/blogs/tags" className="flex items-center text-sm text-gray-300 hover:text-emerald-300 transition-colors group">
            <Tag className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
            <span>Tags</span>
          </Link>
          <Link href="/dashboard/blogs/top-authors" className="flex items-center text-sm text-gray-300 hover:text-emerald-300 transition-colors group">
            <Award className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
            <span>Top Authors</span>
          </Link>
        </div>
      )}
    </div> */}

    {/* Popular Tags */}
    <div className="mt-8 p-4 bg-gradient-to-br from-gray-800/50 to-emerald-900/10 rounded-lg border border-gray-700/30">
      <h3 className="font-semibold mb-4 text-emerald-300 text-lg">Popular Tags</h3>
      <div className="flex flex-wrap gap-2">
        <span className="text-xs bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 px-3 py-2 rounded-full hover:from-emerald-800 hover:to-green-800 hover:text-emerald-100 cursor-pointer transition-all duration-300 transform hover:scale-105 border border-gray-600/50 hover:border-emerald-600/50">
          #mentalhealth
        </span>
        <span className="text-xs bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 px-3 py-2 rounded-full hover:from-emerald-800 hover:to-green-800 hover:text-emerald-100 cursor-pointer transition-all duration-300 transform hover:scale-105 border border-gray-600/50 hover:border-emerald-600/50">
          #therapy
        </span>
        <span className="text-xs bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 px-3 py-2 rounded-full hover:from-emerald-800 hover:to-green-800 hover:text-emerald-100 cursor-pointer transition-all duration-300 transform hover:scale-105 border border-gray-600/50 hover:border-emerald-600/50">
          #selfcare
        </span>
        <span className="text-xs bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 px-3 py-2 rounded-full hover:from-emerald-800 hover:to-green-800 hover:text-emerald-100 cursor-pointer transition-all duration-300 transform hover:scale-105 border border-gray-600/50 hover:border-emerald-600/50">
          #anxiety
        </span>
        <span className="text-xs bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 px-3 py-2 rounded-full hover:from-emerald-800 hover:to-green-800 hover:text-emerald-100 cursor-pointer transition-all duration-300 transform hover:scale-105 border border-gray-600/50 hover:border-emerald-600/50">
          #wellness
        </span>
        <span className="text-xs bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 px-3 py-2 rounded-full hover:from-emerald-800 hover:to-green-800 hover:text-emerald-100 cursor-pointer transition-all duration-300 transform hover:scale-105 border border-gray-600/50 hover:border-emerald-600/50">
          #mindfulness
        </span>
      </div>
    </div>
  </div>
)}
