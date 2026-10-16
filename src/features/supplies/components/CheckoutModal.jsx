import { useRef, useState } from 'react'
import FormField from '@/shared/components/FormField'
import { ImageIcon } from '@/shared/components/Icons'

const MAX_PROOF_BYTES = 5 * 1024 * 1024

function formatCOP(value) {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

// Fondo de input que se ve bien tanto sobre --supplies-surface claro (blanco)
// como oscuro (azul marino): un tinte translúcido sobre --foreground se
// oscurece/aclara solo según el tema, a diferencia de un color fijo.
const inputBg = 'color-mix(in srgb, var(--foreground) 6%, transparent)'

// variant="modal" (por defecto, usado en /tienda pública para visitantes sin
// sesión) se muestra como overlay. variant="section" (usado en /tienda/cliente)
// se muestra como un apartado normal dentro de la página, no como modal.
// `items` es el carrito (con imagen ya resuelta) para el resumen del pedido.
export default function CheckoutModal({ user, items = [], total, onSubmit, onCancel, variant = 'modal' }) {
  const [form, setForm] = useState({
    customerName: user?.name ?? '',
    customerPhone: user?.phone ?? '',
    customerEmail: user?.email ?? '',
    city: user?.city ?? '',
    address: user?.address ?? '',
    notes: '',
  })
  const [proofImage, setProofImage] = useState('')
  const [error, setError] = useState('')
  const proofInputRef = useRef(null)

  function handleProofFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_PROOF_BYTES) {
      setError('La imagen no puede pesar más de 5 MB.')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = () => setProofImage(reader.result)
    reader.readAsDataURL(file)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.customerName.trim() || !form.customerPhone.trim() || !form.city.trim() || !form.address.trim()) {
      setError('Nombre, teléfono, ciudad y dirección son obligatorios')
      return
    }
    if (!proofImage) {
      setError('Adjunta la foto del comprobante de pago')
      return
    }
    onSubmit({ ...form, proofImage })
  }

  const isSection = variant === 'section'

  const formEl = (
    <>
      <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Finalizar compra</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>Completa tus datos de entrega y adjunta el comprobante de pago.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nombre completo" required>
          <input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: inputBg, border: '1px solid var(--border)', color: 'var(--foreground)' }} />
        </FormField>
        <div className="grid sm:grid-cols-2 gap-3">
          <FormField label="Teléfono / WhatsApp" required>
            <input value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: inputBg, border: '1px solid var(--border)', color: 'var(--foreground)' }} />
          </FormField>
          <FormField label="Correo (opcional)">
            <input type="email" value={form.customerEmail} onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: inputBg, border: '1px solid var(--border)', color: 'var(--foreground)' }} />
          </FormField>
        </div>
        <div className="grid sm:grid-cols-[1fr_2fr] gap-3">
          <FormField label="Ciudad" required>
            <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Ej: Medellín" className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: inputBg, border: '1px solid var(--border)', color: 'var(--foreground)' }} />
          </FormField>
          <FormField label="Dirección de entrega" required>
            <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: inputBg, border: '1px solid var(--border)', color: 'var(--foreground)' }} />
          </FormField>
        </div>
        <FormField label="Notas (opcional)">
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg text-sm resize-none" style={{ backgroundColor: inputBg, border: '1px solid var(--border)', color: 'var(--foreground)' }} />
        </FormField>

        <div className="rounded-lg p-4" style={{ backgroundColor: inputBg, border: '1px solid var(--border)' }}>
          <p className="text-sm font-black mb-3" style={{ color: 'var(--foreground)' }}>Datos para transferencia</p>
          <div className="flex flex-col items-center gap-3 mb-4">
            <img src="/assets/qr-transferencia.webp" alt="Código QR Bre-B Lidessa SAS" className="rounded-lg" style={{ width: 220, height: 220, border: '1px solid var(--border)', backgroundColor: '#fff', padding: 8 }} />
            <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>Escanea con tu app bancaria</p>
          </div>
          <dl className="space-y-1.5 text-sm" style={{ color: 'var(--foreground)' }}>
            <div className="flex justify-between gap-2"><dt style={{ color: 'var(--muted-foreground)' }}>Banco</dt><dd className="font-semibold">Bancolombia</dd></div>
            <div className="flex justify-between gap-2"><dt style={{ color: 'var(--muted-foreground)' }}>Medio</dt><dd className="font-semibold">Bre-B</dd></div>
            <div className="flex justify-between gap-2"><dt style={{ color: 'var(--muted-foreground)' }}>Llave Bre-B</dt><dd className="font-semibold">0092362854</dd></div>
            <div className="flex justify-between gap-2"><dt style={{ color: 'var(--muted-foreground)' }}>Empresa</dt><dd className="font-semibold">Lidessa SAS</dd></div>
            <div className="flex justify-between gap-2 pt-1.5" style={{ borderTop: '1px solid var(--border)' }}><dt className="font-bold">Monto a transferir</dt><dd className="font-black" style={{ color: 'var(--primary)' }}>{formatCOP(total)}</dd></div>
          </dl>
          <p className="text-xs mt-3" style={{ color: 'var(--muted-foreground)' }}>
            La llave Bre-B no es un número de celular: pégala en la opción "Bre-B" de tu app bancaria (Nequi, Bancolombia, etc.), o escanea el código QR.
          </p>
        </div>

        <FormField label="Comprobante de pago" required helperText="Transfiere o consigna el total y sube la foto del comprobante.">
          <input ref={proofInputRef} type="file" accept="image/*" onChange={handleProofFile} className="hidden" />
          {proofImage ? (
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <img src={proofImage} alt="Comprobante de pago" className="w-full max-h-64 object-contain" style={{ backgroundColor: inputBg }} />
              <button
                type="button"
                onClick={() => proofInputRef.current?.click()}
                className="w-full py-2 text-xs font-bold"
                style={{ borderTop: '1px solid var(--border)', color: 'var(--primary)' }}
              >
                Cambiar foto
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => proofInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 rounded-lg py-10"
              style={{ border: '2px dashed var(--border)', backgroundColor: inputBg }}
            >
              <ImageIcon size={30} style={{ color: 'var(--muted-foreground)' }} />
              <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>Haz clic para subir el comprobante</span>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>JPG o PNG, máximo 5 MB</span>
            </button>
          )}
        </FormField>

        <div className="rounded-lg px-4 py-3 text-xs leading-relaxed" style={{ backgroundColor: 'rgba(184,134,11,0.12)', border: '1px solid rgba(184,134,11,0.3)', color: '#b8860b' }}>
          <strong>Importante:</strong> tu pedido queda "Pendiente de revisión" hasta que confirmemos el pago. Te avisamos dentro de la app apenas se apruebe o se rechace.
        </div>

        {error && <p className="text-xs" style={{ color: '#b3261e' }}>⚠ {error}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
            {isSection ? 'Volver al catálogo' : 'Cancelar'}
          </button>
          <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#005187' }}>Enviar pedido</button>
        </div>
      </form>
    </>
  )

  const summaryEl = (
    <div className="rounded-xl p-6 space-y-5 h-fit" style={{ backgroundColor: inputBg, border: '1px solid var(--border)' }}>
      <h3 className="text-lg font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Resumen del pedido</h3>
      <div className="space-y-4">
        {items.map(it => (
          <div key={it.productId} className="flex items-center gap-4">
            <div className="rounded-lg overflow-hidden shrink-0" style={{ width: 64, height: 64, backgroundColor: 'var(--muted)' }}>
              {it.image ? (
                <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--muted-foreground)' }}><ImageIcon size={22} /></div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{it.name}</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Cantidad: {it.qty}</p>
            </div>
            <p className="text-sm font-bold shrink-0" style={{ color: 'var(--primary)' }}>{formatCOP(it.price * it.qty)}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between text-sm" style={{ color: 'var(--muted-foreground)' }}>
          <span>Subtotal</span>
          <span>{formatCOP(total)}</span>
        </div>
        <div className="flex items-center justify-between text-sm" style={{ color: 'var(--muted-foreground)' }}>
          <span>Envío</span>
          <span style={{ color: '#16a34a', fontWeight: 700 }}>Gratis</span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <span className="text-base font-bold" style={{ color: 'var(--foreground)' }}>Total</span>
        <span className="text-2xl font-black" style={{ color: 'var(--primary)' }}>{formatCOP(total)}</span>
      </div>
      <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>*IVA incluido en el precio</p>
    </div>
  )

  const content = (
    <div className={`grid lg:grid-cols-[1fr_360px] gap-6 items-start w-full ${isSection ? 'max-w-5xl mx-auto' : 'max-w-3xl max-h-full overflow-y-auto'}`}>
      <div className="rounded-xl p-6 sm:p-8" style={{ backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)' }}>
        {formEl}
      </div>
      {summaryEl}
    </div>
  )

  if (isSection) {
    return <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">{content}</div>
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      {content}
    </div>
  )
}
