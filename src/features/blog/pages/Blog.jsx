import { useState } from 'react'
import { useBlog } from '../context/BlogContext'
import BlogModal from '../components/BlogModal'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'

const GOLD = '#e8c766'

export default function Blog() {
  const { posts: blogPosts } = useBlog()
  const [selectedPost, setSelectedPost] = useState(null)
  const pageRef = useScrollReveal('reveal')
  useScrollReveal('reveal-scale')

  return (
    <div ref={pageRef}>
      {/* Hero — bienvenida Converge */}
      <section className="py-16 overflow-hidden" style={{ background: 'linear-gradient(135deg, #10294d 0%, #071426 55%, #0c0c0c 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-5 gap-6 items-stretch">
          <div
            className="lg:col-span-3 rounded-3xl p-8 sm:p-12 flex flex-col justify-center reveal"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)', border: '1px solid rgba(232,199,102,0.18)' }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD }}>Converge</p>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              <span style={{ color: 'white' }}>¡Bienvenidos a</span><br />
              <span style={{ color: GOLD }}>Converge!</span>
            </h1>
            <div className="w-16 h-0.5 mb-5 rounded-full" style={{ backgroundColor: GOLD, opacity: 0.6 }} />
            <p className="text-sm sm:text-base leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.88)' }}>
              Nos alegra que se una a nuestra comunidad de información. En <span style={{ color: GOLD, fontWeight: 600 }}>Converge</span> estamos comprometidos a ofrecerle las <span style={{ color: GOLD, fontWeight: 600 }}>noticias más actuales, relevantes y confiables</span> del panorama empresarial, normativo e institucional, para mantenerlo siempre al tanto de lo que más importa.
            </p>

            <div className="rounded-2xl p-4 mb-5 flex gap-3 items-start" style={{ backgroundColor: 'rgba(232,199,102,0.06)', border: '1px solid rgba(232,199,102,0.25)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ border: `1.5px solid ${GOLD}` }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.88)' }}>
                Aquí no solo reportamos noticias: también fomentamos el <span style={{ color: GOLD, fontWeight: 600 }}>diálogo</span> y la <span style={{ color: GOLD, fontWeight: 600 }}>reflexión</span>. Queremos ser su fuente de información confiable y su espacio para el <span style={{ color: GOLD, fontWeight: 600 }}>intercambio de ideas</span>.
              </p>
            </div>

            <div className="w-16 h-0.5 mb-3 rounded-full" style={{ backgroundColor: GOLD, opacity: 0.6 }} />
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ border: `1.5px solid ${GOLD}` }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill={GOLD} stroke={GOLD}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <p className="text-sm sm:text-base leading-relaxed">
                <span style={{ color: 'rgba(255,255,255,0.88)' }}>Gracias por confiar en nosotros para mantenerlo informado.</span>
                <span style={{ color: GOLD, fontWeight: 700 }}>¡Vamos a converger en la verdad y el conocimiento!</span>
              </p>
            </div>
          </div>

          <div
            className="lg:col-span-2 rounded-3xl overflow-hidden min-h-65 reveal-scale relative flex items-center justify-center"
            style={{ background: 'radial-gradient(ellipse 75% 65% at 50% 42%, #10294d 0%, #071426 55%, #020712 100%)' }}
          >
            {/* Glow ring */}
            <div
              className="absolute pointer-events-none"
              style={{
                width: '94%',
                height: '76%',
                top: '9%',
                left: '3%',
                borderRadius: '50%',
                border: '1.5px solid rgba(232,199,102,0.55)',
                boxShadow: '0 0 70px 12px rgba(232,199,102,0.3), inset 0 0 45px rgba(232,199,102,0.12)',
                transform: 'rotate(-4deg)',
              }}
            />
            {/* Pedestal glow */}
            <div
              className="absolute pointer-events-none"
              style={{
                bottom: '3%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '65%',
                height: '13%',
                borderRadius: '50%',
                background: 'radial-gradient(ellipse at center, rgba(232,199,102,0.45), transparent 70%)',
                filter: 'blur(6px)',
              }}
            />
            <img
              src="/assets/logo_converge.png"
              alt="Converge"
              className="relative"
              style={{ width: '96%', height: '96%', objectFit: 'contain', display: 'block', zIndex: 2 }}
            />
          </div>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 mb-8 reveal">
          <h2 className="text-2xl font-black shrink-0" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            Tendencia
          </h2>
          <div className="h-0.5 flex-1 rounded-full" style={{ background: `linear-gradient(to right, ${GOLD}, transparent)` }} />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, i) => (
            <div key={post.id} className={`flip-card h-95 reveal-scale stagger-${(i % 6) + 1} card-interactive`}>
              <div className="flip-card-inner">
                {/* Front — image poster */}
                <div className="flip-card-front rounded-2xl overflow-hidden cursor-pointer"
                  style={{ backgroundColor: 'var(--secondary)', border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                  onClick={() => setSelectedPost(post)}>
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(7,20,38,0.92) 0%, rgba(7,20,38,0.35) 55%, transparent 85%)' }} />
                  <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: 'rgba(232,199,102,0.15)', color: GOLD, border: `1px solid rgba(232,199,102,0.4)`, backdropFilter: 'blur(4px)' }}>
                    Converge
                  </span>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="w-8 h-0.5 rounded-full mb-2.5" style={{ backgroundColor: GOLD, opacity: 0.8 }} />
                    <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>{post.date}</span>
                    <h3 className="font-bold text-lg mt-1 leading-snug text-white break-words" style={{ fontFamily: 'var(--font-display)' }}>
                      {post.title}
                    </h3>
                  </div>
                </div>

                {/* Back — details */}
                <div className="flip-card-back rounded-2xl overflow-hidden p-5 flex flex-col cursor-pointer"
                  style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderTop: `3px solid ${GOLD}`, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                  onClick={() => setSelectedPost(post)}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>Converge</span>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{post.date}</span>
                  </div>
                  <h3 className="font-bold text-base mb-2 leading-snug break-words" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                    {post.title}
                  </h3>
                  <p className="text-sm mb-3 leading-relaxed flex-1 overflow-hidden break-words" style={{ color: 'var(--muted-foreground)' }}>
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: 'linear-gradient(135deg, #c9a227, #e8c766)', color: '#141414' }}>
                        {post.author[0]}
                      </div>
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--foreground)' }}>{post.author}</p>
                    </div>
                    <span className="text-xs font-bold shrink-0 flex items-center gap-1" style={{ color: '#4d82bc' }}>
                      Leer más <span className="icon-nudge">→</span>
                    </span>
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
