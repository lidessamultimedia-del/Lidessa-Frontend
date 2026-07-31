import { useState } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'

export default function PQRSFReplyModal({ ticket, onSave, onClose }) {
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
      <div className="rounded-2xl p-6 max-w-lg w-full shadow-2xl"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>
        <h3 className="text-lg font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          Responder {ticket.id}
        </h3>
        <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>
          {ticket.subject} — {ticket.from} · {ticket.type} · {ticket.date}
        </p>
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
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: '#005187' }}>
              Enviar respuesta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
