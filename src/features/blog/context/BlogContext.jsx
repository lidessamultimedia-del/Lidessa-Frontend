import { createContext, useContext, useState } from 'react'
import { blogPosts as defaultPosts } from '../data/blogPosts'

const BlogContext = createContext(null)

export function BlogProvider({ children }) {
  const [posts, setPosts] = useState(defaultPosts)

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
