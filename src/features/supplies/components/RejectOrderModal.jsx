import { useRef, useState } from 'react'
import FormField from '@/shared/components/FormField'
import { ImageIcon } from '@/shared/components/Icons'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024

function formatCOP(value) {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

export default function RejectOrderModal({ order, onSave, onCancel }) {
  const [reason, setReason] = useState('')
  const [refundProof, setRefundProof] = useState('')
  const [error, setError] = useState('')
  const photoInputRef = useRef(null)

  function handlePhotoFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_PHOTO_BYTES) {
      setError('La imagen no puede pesar más de 5 MB.')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = () => setRefundProof(reader.result)
    reader.readAsDataURL(file)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!reason.trim()) { setError('Escribe la causa del rechazo.'); return }
    onSave(reason.trim(), refundProof || null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <form onSubmit={handleSubmit} className="rounded-xl p-6 max-w-md w-full max-h-full overflow-y-auto space-y-4" style={{ backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)' }}>
        <div>
          <h2 className="text-lg font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Rechazar pedido</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Pedido de {order.customerName} por {formatCOP(order.total)} — el cliente verá esta causa en su pedido.
          </p>
        </div>

        <FormField label="Causa del rechazo" required error={error} helperText="Ej: el comprobante no corresponde a esta cuenta, producto agotado, etc.">
          <textarea
            value={reason} onChange={e => { setReason(e.target.value); setError('') }}
            rows={3} autoFocus
            className="w-full px-3 py-2 rounded-lg text-sm resize-none"
            style={{ backgroundColor: 'var(--background)', border: error ? '1px solid #dc2626' : '1px solid var(--border)', color: 'var(--foreground)' }}
          />
        </FormField>

        <FormField label="Comprobante de devolución (opcional)" helperText="Solo si ya le devolviste el dinero al cliente — se lo mostramos junto con la causa.">
          <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoFile} className="hidden" />
          {refundProof ? (
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <img src={refundProof} alt="Comprobante de devolución" className="w-full max-h-40 object-contain" style={{ backgroundColor: 'var(--muted)' }} />
              <div className="flex" style={{ borderTop: '1px solid var(--border)' }}>
                <button type="button" onClick={() => photoInputRef.current?.click()} className="flex-1 py-2 text-xs font-bold" style={{ color: 'var(--primary)' }}>Cambiar foto</button>
                <button type="button" onClick={() => setRefundProof('')} className="flex-1 py-2 text-xs font-bold" style={{ borderLeft: '1px solid var(--border)', color: '#dc2626' }}>Quitar</button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-1.5 rounded-lg py-5"
              style={{ border: '2px dashed var(--border)', backgroundColor: 'var(--muted)' }}
            >
              <ImageIcon size={22} style={{ color: 'var(--muted-foreground)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>Subir comprobante de devolución</span>
            </button>
          )}
        </FormField>

        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>Cancelar</button>
          <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#dc2626' }}>Rechazar pedido</button>
        </div>
      </form>
    </div>
  )
}
