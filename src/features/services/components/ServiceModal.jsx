import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function ServiceModal({ service, image, onClose }) {
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
        className="rounded-2xl overflow-hidden shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card)' }}
      >
        <div className="relative overflow-hidden">
          <img src={image} alt={service.title} className="w-full h-auto block" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            ×
          </button>
        </div>

        <div className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: '#005187' }}>
            {service.title}
          </h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--muted-foreground)' }}>
            {service.description}
          </p>
          <Link
            to={`/servicios/${service.slug}`}
            onClick={onClose}
            className="inline-block px-6 py-2.5 rounded-lg text-sm font-bold text-white"
            style={{ backgroundColor: '#005187' }}
          >
            Conozca más
          </Link>
        </div>
      </div>
    </div>
  )
}
