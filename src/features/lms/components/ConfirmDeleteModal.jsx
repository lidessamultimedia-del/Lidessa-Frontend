import { AlertTriangle } from '@/shared/components/Icons'

export default function ConfirmDeleteModal({ label, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>
        <div className="flex justify-center mb-3" style={{ color: '#d97706' }}><AlertTriangle size={40} /></div>
        <h3 className="text-base font-black text-center mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          ¿Confirmar eliminación?
        </h3>
        <p className="text-sm text-center mb-5" style={{ color: 'var(--muted-foreground)' }}>
          Está por eliminar <strong>{label}</strong>. Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors"
            style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
            Cancelar
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white"
            style={{ backgroundColor: '#dc2626' }}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
