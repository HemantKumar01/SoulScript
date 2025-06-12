export interface Author {
  id: string
  name: string
  avatar: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  date: string
  readTime: number
  author: Author
  category?: string
  tags: string[]
  likes: number
  comments: number
  bookmarks: number
}

export interface Comment {
  id?: string
  postId?: string // Optional since it's implied by the subcollection structure
  userId: string
  userDisplayName: string
  userAvatar?: string
  content: string
  createdAt: Date
  updatedAt: Date
  likes: number
  likedBy?: string[] // Array of user IDs who liked this comment
}

export interface LikeRecord {
  userId: string
  createdAt: Date
}

export interface BookmarkRecord {
  userId: string
  createdAt: Date
}
