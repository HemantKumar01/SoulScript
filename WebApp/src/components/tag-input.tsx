"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

interface TagInputProps {
  tags: string[]
  setTags: (tags: string[]) => void
}

export default function TagInput({ tags, setTags }: TagInputProps) {
  const [input, setInput] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  const addTag = () => {
    const trimmedInput = input.trim().toLowerCase()
    if (trimmedInput && !tags.includes(trimmedInput) && tags.length < 5) {
      setTags([...tags, trimmedInput])
      setInput("")
    }
  }

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-md p-2 focus-within:ring-2 focus-within:ring-purple-500">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <div key={index} className="flex items-center bg-gray-700 text-white px-3 py-1 rounded-full text-sm">
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-2 text-gray-400 hover:text-white focus:outline-none"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? "Add up to 5 tags (press Enter)" : ""}
          className="flex-grow bg-transparent border-0 focus:outline-none text-white placeholder-gray-400 py-1 px-2 min-w-[120px]"
        />
      </div>
      <div className="mt-1 text-xs text-gray-400 px-2">{tags.length}/5 tags</div>
    </div>
  )
}
