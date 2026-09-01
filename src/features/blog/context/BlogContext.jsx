import { createContext, useContext, useState, useEffect } from 'react'
import { blogPosts as defaultPosts } from '../data/blogPosts'

const BlogContext = createContext(null)
const STORAGE_KEY = 'lidessa_blog_posts'

export function BlogProvider({ children }) {
  const [posts, setPosts] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : defaultPosts
    } catch {
      return defaultPosts
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
  }, [posts])

  function addPost(post) {
    const newPost = { ...post, id: Date.now() }
    setPosts(prev => [newPost, ...prev])
    return newPost
  }

  function updatePost(id, data) {
    setPosts(prev => prev.map(p => (p.id === id ? { ...p, ...data } : p)))
  }

  function deletePost(id) {
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <BlogContext.Provider value={{ posts, addPost, updatePost, deletePost }}>
      {children}
    </BlogContext.Provider>
  )
}

export function useBlog() {
  const ctx = useContext(BlogContext)
  if (!ctx) throw new Error('useBlog must be used inside BlogProvider')
  return ctx
}
