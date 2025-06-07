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
