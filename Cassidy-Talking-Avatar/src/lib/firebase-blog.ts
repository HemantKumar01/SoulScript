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
  DocumentData,
  onSnapshot,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore'
import { db } from './firebase'
import type { BlogPost, Comment } from '@/types/blog'

// Collection names
export const BLOGS_COLLECTION = 'blogs'
export const COMMENTS_SUBCOLLECTION = 'comments'
export const LIKES_SUBCOLLECTION = 'likes'
export const BOOKMARKS_SUBCOLLECTION = 'bookmarks'
export const COMMENT_LIKES_SUBCOLLECTION = 'likes'

export const USERS_COLLECTION = 'users'
export const FOLLOWING_SUBCOLLECTION = 'following'
export const FOLLOWERS_SUBCOLLECTION = 'followers'

// Follow/Unfollow a user
export async function followUser(followerId: string, followingId: string, isFollowing: boolean): Promise<void> {
  try {
    const followerRef = doc(db, USERS_COLLECTION, followerId)
    const followingRef = doc(db, USERS_COLLECTION, followingId)
    
    if (isFollowing) {
      // Add to follower's following list
      await addDoc(collection(followerRef, FOLLOWING_SUBCOLLECTION), {
        userId: followingId,
        createdAt: serverTimestamp()
      })
      
      // Add to following user's followers list
      await addDoc(collection(followingRef, FOLLOWERS_SUBCOLLECTION), {
        userId: followerId,
        createdAt: serverTimestamp()
      })
    } else {
      // Remove from follower's following list
      const followingQuery = query(
        collection(followerRef, FOLLOWING_SUBCOLLECTION),
        where('userId', '==', followingId)
      )
      const followingSnapshot = await getDocs(followingQuery)
      
      if (!followingSnapshot.empty) {
        await deleteDoc(followingSnapshot.docs[0].ref)
      }
      
      // Remove from following user's followers list
      const followersQuery = query(
        collection(followingRef, FOLLOWERS_SUBCOLLECTION),
        where('userId', '==', followerId)
      )
      const followersSnapshot = await getDocs(followersQuery)
      
      if (!followersSnapshot.empty) {
        await deleteDoc(followersSnapshot.docs[0].ref)
      }
    }
  } catch (error) {
    console.error('Error following/unfollowing user:', error)
    throw error
  }
}

// Check if user is following another user
export async function isUserFollowing(followerId: string, followingId: string): Promise<boolean> {
  try {
    const followerRef = doc(db, USERS_COLLECTION, followerId)
    const followingQuery = query(
      collection(followerRef, FOLLOWING_SUBCOLLECTION),
      where('userId', '==', followingId)
    )
    const followingSnapshot = await getDocs(followingQuery)
    return !followingSnapshot.empty
  } catch (error) {
    console.error('Error checking if user is following:', error)
    return false
  }
}

// Get users that current user is following
export async function getFollowingUsers(userId: string): Promise<string[]> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId)
    const followingQuery = query(
      collection(userRef, FOLLOWING_SUBCOLLECTION),
      orderBy('createdAt', 'desc')
    )
    const followingSnapshot = await getDocs(followingQuery)

    return followingSnapshot.docs
      .map(doc => doc.data().userId)
      .filter((id): id is string => typeof id === 'string' && id.trim().length > 0) // fix by filterinn
  } catch (error) {
    console.error('Error getting following users:', error)
    return []
  }
}

// Get blog posts from users that current user is following
export async function getFollowingBlogPosts(userId: string): Promise<BlogPost[]> {
  try {
    const followingUserIds = await getFollowingUsers(userId)
    
    if (followingUserIds.length === 0) {
      return []
    }
    
    // Get posts from all following users
    const followingPosts: BlogPost[] = []
    
    for (const authorId of followingUserIds) {
      const authorPosts = await getBlogPostsByAuthor(authorId)
      followingPosts.push(...authorPosts)
    }
    
    // Sort by creation date (newest first)
    return followingPosts.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  } catch (error) {
    console.error('Error getting following blog posts:', error)
    return []
  }
}

// Get all unique tags from blog posts
export async function getAllTags(): Promise<string[]> {
  try {
    const allPosts = await getAllBlogPosts()
    const tagsSet = new Set<string>()
    
    allPosts.forEach(post => {
      post.tags.forEach(tag => tagsSet.add(tag))
    })
    
    return Array.from(tagsSet).sort()
  } catch (error) {
    console.error('Error getting all tags:', error)
    return []
  }
}

// Get blog posts by tag
export async function getBlogPostsByTag(tag: string): Promise<BlogPost[]> {
  try {
    const allPosts = await getAllBlogPosts()
    return allPosts.filter(post => 
      post.tags.some(postTag => postTag.toLowerCase() === tag.toLowerCase())
    )
  } catch (error) {
    console.error('Error getting blog posts by tag:', error)
    return []
  }
}

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

// Update blog post likes with user tracking
export async function updateBlogPostLikes(postId: string, userId: string, isLiking: boolean): Promise<void> {
  try {
    const postRef = doc(db, BLOGS_COLLECTION, postId)
    const userLikeRef = doc(postRef, LIKES_SUBCOLLECTION, userId)
    
    if (isLiking) {
      // Add like
      await addDoc(collection(postRef, LIKES_SUBCOLLECTION), {
        userId,
        createdAt: serverTimestamp()
      })
      
      // Update post likes count
      await updateDoc(postRef, {
        likes: increment(1),
        updatedAt: serverTimestamp()
      })
    } else {
      // Remove like
      const likesQuery = query(
        collection(postRef, LIKES_SUBCOLLECTION),
        where('userId', '==', userId)
      )
      const likesSnapshot = await getDocs(likesQuery)
      
      if (!likesSnapshot.empty) {
        await deleteDoc(likesSnapshot.docs[0].ref)
        
        // Update post likes count
        await updateDoc(postRef, {
          likes: increment(-1),
          updatedAt: serverTimestamp()
        })
      }
    }
  } catch (error) {
    console.error('Error updating blog post likes:', error)
    throw error
  }
}

// Check if user has liked a post
export async function hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
  try {
    const postRef = doc(db, BLOGS_COLLECTION, postId)
    const likesQuery = query(
      collection(postRef, LIKES_SUBCOLLECTION),
      where('userId', '==', userId)
    )
    const likesSnapshot = await getDocs(likesQuery)
    return !likesSnapshot.empty
  } catch (error) {
    console.error('Error checking if user liked post:', error)
    return false
  }
}

// Update blog post bookmarks with user tracking
export async function updateBlogPostBookmarks(postId: string, userId: string, isBookmarking: boolean): Promise<void> {
  try {
    const postRef = doc(db, BLOGS_COLLECTION, postId)
    
    if (isBookmarking) {
      // Add bookmark
      await addDoc(collection(postRef, BOOKMARKS_SUBCOLLECTION), {
        userId,
        createdAt: serverTimestamp()
      })
      
      // Update post bookmarks count
      await updateDoc(postRef, {
        bookmarks: increment(1),
        updatedAt: serverTimestamp()
      })
    } else {
      // Remove bookmark
      const bookmarksQuery = query(
        collection(postRef, BOOKMARKS_SUBCOLLECTION),
        where('userId', '==', userId)
      )
      const bookmarksSnapshot = await getDocs(bookmarksQuery)
      
      if (!bookmarksSnapshot.empty) {
        await deleteDoc(bookmarksSnapshot.docs[0].ref)
        
        // Update post bookmarks count
        await updateDoc(postRef, {
          bookmarks: increment(-1),
          updatedAt: serverTimestamp()
        })
      }
    }
  } catch (error) {
    console.error('Error updating blog post bookmarks:', error)
    throw error
  }
}

// Check if user has bookmarked a post
export async function hasUserBookmarkedPost(postId: string, userId: string): Promise<boolean> {
  try {
    const postRef = doc(db, BLOGS_COLLECTION, postId)
    const bookmarksQuery = query(
      collection(postRef, BOOKMARKS_SUBCOLLECTION),
      where('userId', '==', userId)
    )
    const bookmarksSnapshot = await getDocs(bookmarksQuery)
    return !bookmarksSnapshot.empty
  } catch (error) {
    console.error('Error checking if user bookmarked post:', error)
    return false
  }
}

// Update blog post comments count
export async function updateBlogPostComments(postId: string, increment_value: number = 1): Promise<void> {
  try {
    const postRef = doc(db, BLOGS_COLLECTION, postId)
    await updateDoc(postRef, {
      comments: increment(increment_value),
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating blog post comments:', error)
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

// Add a comment to a blog post (using subcollection)
export async function addComment(postId: string, comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'postId'>) {
  try {
    const postRef = doc(db, BLOGS_COLLECTION, postId)
    const commentsRef = collection(postRef, COMMENTS_SUBCOLLECTION)
    
    const commentData = {
      ...comment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: 0
    }
    
    // Add comment to subcollection
    const commentRef = await addDoc(commentsRef, commentData)
    
    // Update the comment count on the blog post
    await updateDoc(postRef, {
      comments: increment(1),
      updatedAt: serverTimestamp()
    })
    
    return commentRef.id
  } catch (error) {
    console.error('Error adding comment:', error)
    throw error
  }
}

// Get comments for a blog post (from subcollection)
export async function getComments(postId: string): Promise<Comment[]> {
  try {
    const postRef = doc(db, BLOGS_COLLECTION, postId)
    const commentsRef = collection(postRef, COMMENTS_SUBCOLLECTION)
    const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'))
    
    const snapshot = await getDocs(commentsQuery)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      postId, // Add postId for compatibility
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as Comment[]
  } catch (error) {
    console.error('Error getting comments:', error)
    throw error
  }
}

// Subscribe to comments in real-time (using subcollection)
export function subscribeToComments(postId: string, callback: (comments: Comment[]) => void) {
  const postRef = doc(db, BLOGS_COLLECTION, postId)
  const commentsRef = collection(postRef, COMMENTS_SUBCOLLECTION)
  const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'))
  
  return onSnapshot(commentsQuery, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      postId,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as Comment[]
    callback(comments)
  })
}

// Like a comment (using subcollection with user tracking)
export async function likeComment(postId: string, commentId: string, userId: string, isLiking: boolean) {
  try {
    const postRef = doc(db, BLOGS_COLLECTION, postId)
    const commentRef = doc(postRef, COMMENTS_SUBCOLLECTION, commentId)
    
    if (isLiking) {
      // Add like
      await addDoc(collection(commentRef, COMMENT_LIKES_SUBCOLLECTION), {
        userId,
        createdAt: serverTimestamp()
      })
      
      // Update comment likes count
      await updateDoc(commentRef, {
        likes: increment(1),
        updatedAt: serverTimestamp()
      })
    } else {
      // Remove like
      const likesQuery = query(
        collection(commentRef, COMMENT_LIKES_SUBCOLLECTION),
        where('userId', '==', userId)
      )
      const likesSnapshot = await getDocs(likesQuery)
      
      if (!likesSnapshot.empty) {
        await deleteDoc(likesSnapshot.docs[0].ref)
        
        // Update comment likes count
        await updateDoc(commentRef, {
          likes: increment(-1),
          updatedAt: serverTimestamp()
        })
      }
    }
  } catch (error) {
    console.error('Error liking comment:', error)
    throw error
  }
}

// Check if user has liked a comment
export async function hasUserLikedComment(postId: string, commentId: string, userId: string): Promise<boolean> {
  try {
    const postRef = doc(db, BLOGS_COLLECTION, postId)
    const commentRef = doc(postRef, COMMENTS_SUBCOLLECTION, commentId)
    const likesQuery = query(
      collection(commentRef, COMMENT_LIKES_SUBCOLLECTION),
      where('userId', '==', userId)
    )
    const likesSnapshot = await getDocs(likesQuery)
    return !likesSnapshot.empty
  } catch (error) {
    console.error('Error checking if user liked comment:', error)
    return false
  }
}

// Delete a comment (using subcollection)
export async function deleteComment(postId: string, commentId: string) {
  try {
    const postRef = doc(db, BLOGS_COLLECTION, postId)
    const commentRef = doc(postRef, COMMENTS_SUBCOLLECTION, commentId)
    
    // Delete the comment document
    await deleteDoc(commentRef)
    
    // Update the comment count on the blog post
    await updateDoc(postRef, {
      comments: increment(-1),
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error deleting comment:', error)
    throw error
  }
}
