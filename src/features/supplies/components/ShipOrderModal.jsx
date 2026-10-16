import { useRef, useState } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'
import { ImageIcon } from '@/shared/components/Icons'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const CARRIERS = ['Servientrega', 'Coordinadora', 'Envía', 'TCC', 'Interrapidísimo', 'Otra']

export default function ShipOrderModal({ order, onSave, onCancel }) {
  const [carrier, setCarrier] = useState(CARRIERS[0])
  const [carrierOther, setCarrierOther] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [photo, setPhoto] = useState('')
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
    reader.onload = () => setPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const finalCarrier = carrier === 'Otra' ? carrierOther.trim() : carrier
    if (!finalCarrier) { setError('Indica la transportadora.'); return }
    if (!trackingNumber.trim()) { setError('El número de guía es obligatorio.'); return }
    if (!photo) { setError('Sube una foto del paquete.'); return }
    onSave({ carrier: finalCarrier, trackingNumber: trackingNumber.trim(), photo })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <form onSubmit={handleSubmit} className="rounded-xl p-6 max-w-md w-full max-h-full overflow-y-auto space-y-4" style={{ backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)' }}>
        <div>
          <h2 className="text-lg font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Marcar como enviado</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Pedido de {order.customerName} — se le notifica con estos datos para que pueda rastrearlo.
          </p>
        </div>

        <FormField label="Transportadora" required>
          <select value={carrier} onChange={e => setCarrier(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
            {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
        {carrier === 'Otra' && (
          <FormField label="Nombre de la transportadora" required>
            <input value={carrierOther} onChange={e => setCarrierOther(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
          </FormField>
        )}

        <FormField label="Número de guía" required>
          <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="Ej: 123456789" className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
        </FormField>

        <FormField label="Foto del paquete" required helperText="El cliente la verá en su pedido, junto con la guía.">
          <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoFile} className="hidden" />
          {photo ? (
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <img src={photo} alt="Foto del paquete" className="w-full max-h-56 object-contain" style={{ backgroundColor: 'var(--muted)' }} />
              <button type="button" onClick={() => photoInputRef.current?.click()} className="w-full py-2 text-xs font-bold" style={{ borderTop: '1px solid var(--border)', color: 'var(--primary)' }}>
                Cambiar foto
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 rounded-lg py-8"
              style={{ border: '2px dashed var(--border)', backgroundColor: 'var(--muted)' }}
            >
              <ImageIcon size={26} style={{ color: 'var(--muted-foreground)' }} />
              <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>Subir foto del paquete</span>
            </button>
          )}
        </FormField>

        {error && <p className="text-xs" style={{ color: '#dc2626' }}>⚠ {error}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>Cancelar</button>
          <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#005187' }}>Marcar como enviado</button>
        </div>
      </form>
    </div>
  )
}
