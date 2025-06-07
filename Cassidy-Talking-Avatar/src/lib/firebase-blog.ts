import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  query, 
  orderBy, 
  where,
  updateDoc,
  increment,
  Timestamp,
  DocumentData
} from 'firebase/firestore'
import { db } from './firebase'
import type { BlogPost } from '@/types/blog'

// Collection name
const BLOGS_COLLECTION = 'blogs'

// Convert Firestore document to BlogPost
function convertFirestoreToBlogPost(docData: DocumentData, id: string): BlogPost {
  return {
    id,
    title: docData.title,
    slug: docData.slug,
    excerpt: docData.excerpt || '',
    content: docData.content,
    coverImage: docData.coverImage || '',
    date: docData.date instanceof Timestamp ? docData.date.toDate().toISOString() : docData.date,
    readTime: docData.readTime || 5,
    author: docData.author || { id: '', name: 'Anonymous', avatar: '' },
    category: docData.category || '',
    tags: docData.tags || [],
    likes: docData.likes || 0,
    comments: docData.comments || 0,
    bookmarks: docData.bookmarks || 0,
  }
}

// Create a new blog post
export async function createBlogPost(blogData: Omit<BlogPost, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, BLOGS_COLLECTION), {
      ...blogData,
      date: Timestamp.fromDate(new Date(blogData.date)),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating blog post:', error)
    throw error
  }
}

// Get all blog posts
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const q = query(
      collection(db, BLOGS_COLLECTION),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => 
      convertFirestoreToBlogPost(doc.data(), doc.id)
    )
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    throw error
  }
}

// Get a single blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const q = query(
      collection(db, BLOGS_COLLECTION),
      where('slug', '==', slug)
    )
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }
    
    const doc = querySnapshot.docs[0]
    return convertFirestoreToBlogPost(doc.data(), doc.id)
  } catch (error) {
    console.error('Error fetching blog post by slug:', error)
    throw error
  }
}

// Get blog posts by category
export async function getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
  try {
    const q = query(
      collection(db, BLOGS_COLLECTION),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => 
      convertFirestoreToBlogPost(doc.data(), doc.id)
    )
  } catch (error) {
    console.error('Error fetching blog posts by category:', error)
    throw error
  }
}

// Get blog posts by author
export async function getBlogPostsByAuthor(authorId: string): Promise<BlogPost[]> {
  try {
    const q = query(
      collection(db, BLOGS_COLLECTION),
      where('author.id', '==', authorId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => 
      convertFirestoreToBlogPost(doc.data(), doc.id)
    )
  } catch (error) {
    console.error('Error fetching blog posts by author:', error)
    throw error
  }
}

// Update blog post likes
export async function updateBlogPostLikes(postId: string, increment_value: number = 1): Promise<void> {
  try {
    const postRef = doc(db, BLOGS_COLLECTION, postId)
    await updateDoc(postRef, {
      likes: increment(increment_value),
      updatedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error updating blog post likes:', error)
    throw error
  }
}

// Update blog post comments count
export async function updateBlogPostComments(postId: string, increment_value: number = 1): Promise<void> {
  try {
    const postRef = doc(db, BLOGS_COLLECTION, postId)
    await updateDoc(postRef, {
      comments: increment(increment_value),
      updatedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error updating blog post comments:', error)
    throw error
  }
}

// Update blog post bookmarks
export async function updateBlogPostBookmarks(postId: string, increment_value: number = 1): Promise<void> {
  try {
    const postRef = doc(db, BLOGS_COLLECTION, postId)
    await updateDoc(postRef, {
      bookmarks: increment(increment_value),
      updatedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error updating blog post bookmarks:', error)
    throw error
  }
}

// Search blog posts by title or content
export async function searchBlogPosts(searchTerm: string): Promise<BlogPost[]> {
  try {
    // Note: Firestore doesn't have full-text search. For production, consider using Algolia or similar.
    // This is a simple approach that gets all posts and filters client-side.
    const allPosts = await getAllBlogPosts()
    
    return allPosts.filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  } catch (error) {
    console.error('Error searching blog posts:', error)
    throw error
  }
}
