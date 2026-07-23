import { useState } from 'react'
import { useBlog } from '../context/BlogContext'
import BlogModal from '../components/BlogModal'
import { useIsDarkTheme } from '@/shared/hooks/useIsDarkTheme'

export default function Blog() {
  const isDark = useIsDarkTheme()
  const { posts: blogPosts } = useBlog()
  const [selectedPost, setSelectedPost] = useState(null)

  return (
    <div>
      {/* Hero — bienvenida Converge */}
      <section className="py-16 overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-5 gap-6 items-stretch">
          <div
            className="lg:col-span-3 rounded-3xl p-8 sm:p-12 flex flex-col justify-center"
            style={{ background: isDark ? '#000000' : 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)' }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: isDark ? '#e8c766' : 'var(--secondary)' }}>Converge</p>
            <h1 className="text-4xl sm:text-5xl font-black mb-5" style={{ fontFamily: 'var(--font-display)', color: isDark ? '#e8c766' : 'white' }}>
              ¡Bienvenidos a Converge!
            </h1>
            <p className="text-sm sm:text-base leading-relaxed mb-4" style={{ color: isDark ? '#cbb98a' : 'rgba(255,255,255,0.92)' }}>
              Nos alegra que te unas a nuestra comunidad de información. En Converge estamos comprometidos a ofrecerte las noticias más actuales, relevantes y confiables del panorama empresarial, normativo e institucional, para mantenerte siempre al tanto de lo que más importa.
            </p>
            <p className="text-sm sm:text-base leading-relaxed mb-4" style={{ color: isDark ? '#cbb98a' : 'rgba(255,255,255,0.92)' }}>
              Aquí no solo reportamos noticias: también fomentamos el diálogo y la reflexión. Queremos ser tu fuente de información confiable y tu espacio para el intercambio de ideas.
            </p>
            <p className="text-sm sm:text-base leading-relaxed font-semibold" style={{ color: isDark ? '#e8c766' : 'white' }}>
              Gracias por confiar en nosotros para mantenerte informado. ¡Vamos a converger en la verdad y el conocimiento!
            </p>
          </div>

          <div
            className="lg:col-span-2 rounded-3xl overflow-hidden min-h-65"
            style={{ backgroundColor: '#000000' }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              src="/assets/logoanimado.mp4"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-black mb-8" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          Tendencia
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
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
        {blogPosts.length === 0 && (
          <p className="text-center py-12 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            No hay publicaciones todavía.
          </p>
        )}
      </section>

      {selectedPost && <BlogModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </div>
  )
}
