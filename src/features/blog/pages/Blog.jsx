import { useState } from 'react'
import { blogPosts } from '../data/blogPosts'
import BlogModal from '../components/BlogModal'

const categories = ['Todas', 'Noticias de actualidad', 'Consultas normativas', 'Publicaciones recientes']

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('Todas')
  const [selectedPost, setSelectedPost] = useState(null)

  const filtered = activeCategory === 'Todas' ? blogPosts : blogPosts.filter(p => p.category === activeCategory)

  return (
    <div>
      {/* Hero */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1A3A6B 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#38BDF8' }}>Blog y noticias</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Actualidad normativa<br />y del sector
          </h1>
          <p className="text-base max-w-2xl" style={{ color: '#A0C4E0' }}>
            Mantenemos informados a nuestros clientes y aliados sobre las novedades legislativas, consultas normativas y publicaciones de interés para el mundo empresarial e institucional.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 sticky top-16 z-40" style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                backgroundColor: activeCategory === c ? 'var(--primary)' : 'var(--muted)',
                color: activeCategory === c ? 'white' : 'var(--muted-foreground)',
                border: '1px solid',
                borderColor: activeCategory === c ? 'var(--primary)' : 'var(--border)',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl overflow-hidden group cursor-pointer hover:shadow-xl transition-all"
              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              onClick={() => setSelectedPost(post)}
            >
              <div className="h-48 overflow-hidden" style={{ backgroundColor: 'var(--secondary)' }}>
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                    {post.category}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{post.date}</span>
                </div>
                <h3 className="font-bold text-base mb-2 leading-snug" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                  {post.title}
                </h3>
                <p className="text-sm mb-4 leading-relaxed line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                    {post.author[0]}
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{post.author}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{post.authorRole}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center py-12 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            No hay publicaciones en esta categoría.
          </p>
        )}
      </section>

      {selectedPost && <BlogModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </div>
  )
}
