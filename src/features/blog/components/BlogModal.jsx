import { useEffect } from 'react'
import { MessageCircle } from '@/shared/components/Icons'

const GOLD = '#e8c766'

export default function BlogModal({ post, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-6 px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="rounded-2xl overflow-hidden shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}
      >
        <div className="relative h-64 overflow-hidden" style={{ backgroundColor: 'var(--secondary)' }}>
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(7,20,38,0.95) 0%, rgba(7,20,38,0.3) 60%, transparent 100%)' }} />
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-lg transition-colors"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)'; e.currentTarget.style.borderColor = GOLD }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
          >
            ×
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3"
              style={{ backgroundColor: 'rgba(232,199,102,0.15)', color: GOLD, border: `1px solid rgba(232,199,102,0.4)` }}>
              Converge
            </span>
            <h2 className="text-2xl font-black leading-snug break-words text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {post.title}
            </h2>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #c9a227, #e8c766)', color: '#141414' }}>
              {post.author[0]}
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{post.author}</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{post.date}</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed mb-6 break-words" style={{ color: 'var(--muted-foreground)' }}>
            {post.excerpt}
          </p>
          <div className="flex flex-wrap gap-3">
            {post.link && (
              <a
                href={post.link}
                target="_blank" rel="noreferrer"
                className="px-4 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5"
                style={{ border: `1px solid ${GOLD}`, color: '#b8860b' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(232,199,102,0.1)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Visitar página <span className="icon-nudge">→</span>
              </a>
            )}
            <a
              href="https://wa.me/573001234567"
              target="_blank" rel="noreferrer"
              className="px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#25D366' }}
            >
              <span className="inline-flex items-center gap-1.5"><MessageCircle size={15} /> Consultar al autor</span>
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
