import { X } from '@/shared/components/Icons'

// Vista ampliada genérica de una imagen (comprobantes de pago, fotos de
// paquete, etc.) — a diferencia de PhotoLightbox, no asume que la imagen
// es la foto de perfil de un usuario.
export default function ImageLightbox({ src, alt, caption, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(2px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <button type="button" onClick={onClose} aria-label="Cerrar"
        className="absolute top-5 right-5 p-2 rounded-full transition-colors"
        style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'white' }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.22)' }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)' }}>
        <X size={20} />
      </button>
      <div className="flex flex-col items-center gap-3" style={{ animation: 'fadeUp 0.2s ease' }}>
        <img src={src} alt={alt ?? ''}
          style={{ maxWidth: 'min(90vw, 720px)', maxHeight: '82vh', borderRadius: 12, objectFit: 'contain', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} />
        {caption && <p className="text-sm font-bold" style={{ color: 'white' }}>{caption}</p>}
      </div>
    </div>
  )
}
