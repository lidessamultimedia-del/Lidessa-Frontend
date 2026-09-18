import { useState } from 'react'
import { MessageCircle } from '@/shared/components/Icons'

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Panel */}
      <div
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '16px',
          width: 240,
          boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.95)',
          pointerEvents: open ? 'all' : 'none',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
          transformOrigin: 'bottom right',
        }}
      >
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>
          Contactar por WhatsApp
        </p>
        <a
          href="https://wa.me/573016280574?text=Hola, me gustaría información sobre sus servicios."
          target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: '#25D366', transition: 'opacity 0.2s, transform 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <MessageCircle size={16} /> Atención general
        </a>
      </div>

      {/* Pulse button */}
      <div style={{ position: 'relative' }}>
        {/* Pulse rings */}
        {!open && (
          <>
            <span style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              backgroundColor: 'rgba(37,211,102,0.35)',
              animation: 'pulse-ring 2s ease-out infinite',
            }} />
            <span style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              backgroundColor: 'rgba(37,211,102,0.2)',
              animation: 'pulse-ring 2s ease-out infinite 0.7s',
            }} />
          </>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="relative flex items-center justify-center shadow-xl"
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#25D366',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            boxShadow: '0 6px 20px rgba(37,211,102,0.4)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(37,211,102,0.5)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,211,102,0.4)' }}
          aria-label="WhatsApp"
        >
          {open ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.13.558 4.126 1.533 5.857L.057 23.5l5.79-1.518A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.01-1.374l-.36-.213-3.437.9.916-3.342-.235-.376A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
