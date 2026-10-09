import { X } from '@/shared/components/Icons'

// Vista ampliada de una foto de perfil (click en cualquier Avatar con foto real).
export default function PhotoLightbox({ user, onClose }) {
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
        <img src={user.avatar} alt={user.name ?? 'Foto de perfil'}
          style={{ maxWidth: 'min(85vw, 420px)', maxHeight: '70vh', borderRadius: 16, objectFit: 'cover', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} />
        {user.name && <p className="text-sm font-bold" style={{ color: 'white' }}>{user.name}</p>}
      </div>
    </div>
  )
}
