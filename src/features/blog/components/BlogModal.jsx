import { useEffect } from 'react'

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
        style={{ backgroundColor: 'var(--card)' }}
      >
        <div className="relative h-64 overflow-hidden" style={{ backgroundColor: 'var(--secondary)' }}>
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            ×
          </button>
        </div>
        <div className="p-6">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
            {post.category}
          </span>
          <h2 className="text-2xl font-black mt-3 mb-2 leading-snug" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            {post.title}
          </h2>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
              {post.author[0]}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{post.author}</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{post.authorRole} · {post.date}</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>
            {post.excerpt}
          </p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>
            La actualización normativa es un proceso continuo que exige a las organizaciones mantenerse al tanto de los cambios regulatorios para garantizar el cumplimiento y evitar sanciones. Desde Lidessa, acompañamos a nuestros clientes en este proceso con asesoría especializada y capacitación permanente.
          </p>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--muted-foreground)' }}>
            Si desea ampliar esta información o recibir una consulta personalizada sobre cómo aplica esta normativa a su organización, nuestro equipo de expertos está disponible para orientarle.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://wa.me/573001234567"
              className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#25D366' }}
            >
              💬 Consultar al autor
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
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
