import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/context/AuthContext'
import { apiGetBlogPosts, apiCreateBlogPost, apiUpdateBlogPost, apiDeleteBlogPost, toFileUrl } from '@/shared/lib/api'
import { BACKEND_LIVE } from '@/shared/lib/features'

const BlogContext = createContext(null)

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

// "2025-07-10" → "10 julio 2025". Se parte el texto a mano en vez de usar
// new Date() para que la zona horaria no corra la fecha un día.
function formatPublishedOn(iso) {
  const [year, month, day] = (iso ?? '').split('-').map(Number)
  if (!year || !month || !day) return ''
  return `${day} ${MONTHS[month - 1]} ${year}`
}

// Traduce un BlogPost del backend al shape que ya usan Blog.jsx, Home.jsx,
// BlogModal.jsx y el panel de admin. `imageUrl` guarda la ruta tal cual la
// devolvió el backend (para reenviarla al editar); `image` es la URL lista
// para mostrar.
function fromApiPost(p) {
  return {
    id: p.id,
    title: p.title,
    excerpt: p.excerpt,
    publishedOn: p.publishedOn,
    date: formatPublishedOn(p.publishedOn),
    imageUrl: p.imageUrl,
    image: toFileUrl(p.imageUrl),
    author: p.author,
    phone: p.phone ?? '',
    link: p.externalLink ?? '',
  }
}

function toApiPayload(form) {
  return {
    title: form.title.trim(),
    excerpt: form.excerpt.trim(),
    publishedOn: form.publishedOn || null,
    imageUrl: form.imageUrl,
    author: form.author.trim(),
    phone: form.phone?.trim() || null,
    externalLink: form.link?.trim() || null,
  }
}

export function BlogProvider({ children }) {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(BACKEND_LIVE)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!BACKEND_LIVE) return
    let cancelled = false
    apiGetBlogPosts()
      .then(data => {
        if (cancelled) return
        setPosts(data.map(fromApiPost))
        setError('')
      })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  async function addPost(form) {
    const created = fromApiPost(await apiCreateBlogPost(toApiPayload(form), user?.token))
    setPosts(prev => [created, ...prev])
    return created
  }

  async function updatePost(id, form) {
    const updated = fromApiPost(await apiUpdateBlogPost(id, toApiPayload(form), user?.token))
    setPosts(prev => prev.map(p => (p.id === id ? updated : p)))
    return updated
  }

  async function deletePost(id) {
    await apiDeleteBlogPost(id, user?.token)
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <BlogContext.Provider value={{ posts, loading, error, addPost, updatePost, deletePost }}>
      {children}
    </BlogContext.Provider>
  )
}

export function useBlog() {
  const ctx = useContext(BlogContext)
  if (!ctx) throw new Error('useBlog must be used inside BlogProvider')
  return ctx
}
