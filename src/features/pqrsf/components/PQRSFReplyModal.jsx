import { useState } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'
import { User, Mail, Phone, Eye } from '@/shared/components/Icons'

const BRAND_GRADIENT = 'linear-gradient(135deg, #005187 0%, #4d82bc 55%, #b8860b 100%)'

export default function PQRSFReplyModal({ ticket, onSave, onClose, readOnly = false }) {
  const [response, setResponse] = useState(ticket.response ?? '')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!response.trim()) {
      setError('Escriba una respuesta antes de enviar.')
      return
    }
    onSave(response.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card)', animation: 'fadeUp 0.25s ease' }}>
        <div className="p-6 pb-5" style={{ background: BRAND_GRADIENT }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {ticket.id} · {ticket.type} · {ticket.date}
          </p>
          <h3 className="text-lg font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
            {ticket.subject}
          </h3>
        </div>

        <div className="p-6">
          <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>Solicitud completa</p>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: '#005187' }}><User size={13} /></span>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{ticket.from}</p>
            </div>
            {ticket.email && (
              <div className="flex items-center gap-2 mb-1">
                <span style={{ color: 'var(--muted-foreground)' }}><Mail size={12} /></span>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{ticket.email}</p>
              </div>
            )}
            {ticket.phone && (
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: 'var(--muted-foreground)' }}><Phone size={12} /></span>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{ticket.phone}</p>
              </div>
            )}
            <p className="text-sm wrap-break-word mt-3 pt-3" style={{ color: 'var(--foreground)', whiteSpace: 'pre-wrap', borderTop: '1px solid var(--border)' }}>
              {ticket.message?.trim() || <span style={{ color: 'var(--muted-foreground)', fontStyle: 'italic' }}>Sin descripción adicional.</span>}
            </p>
          </div>

          {readOnly ? (
            <>
              <div className="rounded-lg p-3 mb-5 flex items-start gap-2.5" style={{ backgroundColor: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)' }}>
                <span style={{ color: '#d97706', marginTop: 1 }}><Eye size={15} /></span>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Este mensaje es anónimo — no dejó cuenta ni correo real, así que no hay a quién responderle. Solo queda para que lo tenga en cuenta.
                </p>
              </div>
              <button type="button" onClick={onClose}
                className="w-full py-2.5 rounded-lg text-sm font-bold transition-colors"
                style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                Cerrar
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <FormField label="Respuesta" required error={error}>
                <textarea rows={5} value={response}
                  onChange={e => { setResponse(e.target.value); setError('') }}
                  placeholder="Escriba la respuesta que se enviará al solicitante…"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!error) }} />
              </FormField>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors"
                  style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: BRAND_GRADIENT, boxShadow: '0 2px 8px rgba(0,81,135,0.25)' }}>
                  Enviar respuesta
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
