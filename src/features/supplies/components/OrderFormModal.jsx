import { useState } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'
import FormSection from '@/shared/components/FormSection'
import { X, User, Package, Plus, Trash, ImageIcon, Upload, Clipboard } from '@/shared/components/Icons'

const EMAIL_RE = /^\S+@\S+\.\S+$/
const PHONE_RE = /^[\d\s+()-]{7,20}$/
const STOCK_HOLDING_STATUSES = ['pending', 'confirmed']

const inputStyle = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }
const inputClass = 'w-full px-3 py-2.5 rounded-lg text-sm outline-none'

function formatCOP(value) {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

// Crear / editar un pedido de V2 Suministros desde el panel admin.
// order = null → crear (queda "Pendiente de revisión", como uno hecho en la tienda).
export default function OrderFormModal({ order, products = [], clients = [], onSave, onClose }) {
  const isNew = !order
  // Los artículos solo se pueden cambiar mientras el pedido aparta stock;
  // enviado/completado/rechazado ya no.
  const itemsEditable = isNew || STOCK_HOLDING_STATUSES.includes(order.status)
  const [form, setForm] = useState({
    clientId: order?.clientId ?? '',
    customerName: order?.customerName ?? '',
    customerEmail: order?.customerEmail ?? '',
    customerPhone: order?.customerPhone ?? '',
    address: order?.address ?? '',
    city: order?.city ?? '',
    notes: order?.notes ?? '',
    proofImage: order?.proofImage ?? null,
  })
  const [items, setItems] = useState(() => order?.items?.map(it => ({ ...it })) ?? [])
  const [errors, setErrors] = useState({})

  function update(patch) {
    setForm(f => ({ ...f, ...patch }))
    setErrors(er => ({ ...er, ...Object.fromEntries(Object.keys(patch).map(k => [k, null])) }))
  }

  function selectClient(id) {
    const c = clients.find(cl => cl.id === id)
    if (!c) return update({ clientId: '' })
    update({
      clientId: c.id, customerName: c.name, customerEmail: c.email ?? '',
      customerPhone: c.phone ?? '', address: c.address ?? '',
    })
  }

  // Stock disponible para este pedido = inventario actual + lo que este
  // mismo pedido ya tenía apartado.
  function availableFor(productId) {
    const product = products.find(p => p.id === productId)
    const alreadyHeld = order && STOCK_HOLDING_STATUSES.includes(order.status)
      ? order.items.filter(it => it.productId === productId).reduce((s, it) => s + it.qty, 0)
      : 0
    return (product?.stock ?? 0) + alreadyHeld
  }

  function addItem() {
    const used = new Set(items.map(it => it.productId))
    const next = products.find(p => p.active && !used.has(p.id))
    if (!next) return
    setItems(prev => [...prev, { productId: next.id, name: next.name, price: next.price, qty: 1 }])
    setErrors(er => ({ ...er, items: null }))
  }

  function changeItem(index, patch) {
    setItems(prev => prev.map((it, i) => {
      if (i !== index) return it
      if (patch.productId) {
        const p = products.find(pr => pr.id === patch.productId)
        return { ...it, productId: p.id, name: p.name, price: p.price }
      }
      return { ...it, ...patch }
    }))
    setErrors(er => ({ ...er, items: null }))
  }

  function removeItem(index) {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  function handleProof(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => update({ proofImage: reader.result })
    reader.readAsDataURL(file)
  }

  const total = items.reduce((sum, it) => sum + it.price * it.qty, 0)

  function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.customerName.trim()) errs.customerName = 'El nombre del cliente es obligatorio.'
    if (!form.customerPhone.trim()) errs.customerPhone = 'El teléfono es obligatorio.'
    else if (!PHONE_RE.test(form.customerPhone.trim())) errs.customerPhone = 'Ingrese un teléfono válido.'
    if (form.customerEmail.trim() && !EMAIL_RE.test(form.customerEmail.trim())) errs.customerEmail = 'Ingrese un correo válido.'
    if (!form.address.trim()) errs.address = 'La dirección de envío es obligatoria.'
    if (itemsEditable) {
      if (items.length === 0) errs.items = 'Agregue al menos un producto.'
      else if (items.some(it => !(it.qty >= 1))) errs.items = 'Cada producto debe tener al menos 1 unidad.'
      else {
        const over = items.find(it => it.qty > availableFor(it.productId))
        if (over) errs.items = `No hay suficiente stock de "${over.name}" (disponible: ${availableFor(over.productId)}).`
      }
    }
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    const payload = {
      clientId: form.clientId || null,
      customerName: form.customerName.trim(),
      customerEmail: form.customerEmail.trim(),
      customerPhone: form.customerPhone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      notes: form.notes.trim(),
      proofImage: form.proofImage,
    }
    if (itemsEditable) payload.items = items.map(it => ({ productId: it.productId, name: it.name, price: it.price, qty: Number(it.qty) }))
    onSave(payload)
  }

  const canAddMore = products.some(p => p.active && !items.some(it => it.productId === p.id))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="rounded-2xl w-full shadow-2xl max-w-2xl max-h-full flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>
        <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h3 className="text-lg font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
              {isNew ? 'Nuevo pedido' : 'Editar pedido'}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              {isNew ? 'El pedido queda "Pendiente de revisión" y aparta el stock de los productos.' : 'Actualice los datos del cliente, el envío o los artículos.'}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar"
            className="shrink-0 flex items-center justify-center rounded-full"
            style={{ width: 32, height: 32, color: 'var(--muted-foreground)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--muted)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate autoComplete="off" className="flex flex-col min-h-0">
          <div className="overflow-y-auto px-6 py-5 space-y-6">
            <FormSection icon={User} title="Cliente y envío">
              {clients.length > 0 && (
                <FormField label="Cliente registrado" helperText="Opcional. Al elegirlo se completan sus datos.">
                  <select value={form.clientId} onChange={e => selectClient(e.target.value)} className={inputClass} style={inputStyle}>
                    <option value="">— Cliente sin cuenta —</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} · {c.email}</option>)}
                  </select>
                </FormField>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                <FormField label="Nombre o razón social" required error={errors.customerName}>
                  <input value={form.customerName} onChange={e => update({ customerName: e.target.value })}
                    className={inputClass} style={{ ...inputStyle, ...errorInputStyle(!!errors.customerName) }} />
                </FormField>
                <FormField label="Teléfono" required error={errors.customerPhone}>
                  <input type="tel" value={form.customerPhone} onChange={e => update({ customerPhone: e.target.value })} placeholder="300 123 4567"
                    className={inputClass} style={{ ...inputStyle, ...errorInputStyle(!!errors.customerPhone) }} />
                </FormField>
                <FormField label="Correo electrónico" error={errors.customerEmail}>
                  <input type="email" name="order-email" value={form.customerEmail} onChange={e => update({ customerEmail: e.target.value })} placeholder="cliente@correo.com"
                    className={inputClass} style={{ ...inputStyle, ...errorInputStyle(!!errors.customerEmail) }} />
                </FormField>
                <FormField label="Ciudad">
                  <input value={form.city} onChange={e => update({ city: e.target.value })} className={inputClass} style={inputStyle} />
                </FormField>
              </div>
              <FormField label="Dirección de envío" required error={errors.address}>
                <input value={form.address} onChange={e => update({ address: e.target.value })} placeholder="Calle 00 # 00-00"
                  className={inputClass} style={{ ...inputStyle, ...errorInputStyle(!!errors.address) }} />
              </FormField>
              <FormField label="Notas">
                <textarea value={form.notes} onChange={e => update({ notes: e.target.value })} rows={2}
                  className={`${inputClass} resize-none`} style={inputStyle} />
              </FormField>
            </FormSection>

            <FormSection icon={Package} title="Artículos">
              {!itemsEditable ? (
                <>
                  <p className="text-xs rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                    Los artículos ya no se pueden cambiar porque el pedido está en estado final o ya fue enviado.
                  </p>
                  <ul className="space-y-1">
                    {items.map((it, i) => (
                      <li key={i} className="flex justify-between text-sm" style={{ color: 'var(--foreground)' }}>
                        <span>{it.qty} × {it.name}</span><span>{formatCOP(it.price * it.qty)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  {items.length > 0 && (
                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                      {items.map((it, i) => {
                        const available = availableFor(it.productId)
                        return (
                          <div key={i} className="grid grid-cols-[minmax(0,1fr)_72px_minmax(0,auto)_32px] items-center gap-2 px-3 py-2"
                            style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                            <div className="min-w-0">
                              <select value={it.productId} onChange={e => changeItem(i, { productId: e.target.value })}
                                className="w-full px-2 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
                                {products.filter(p => p.id === it.productId || (p.active && !items.some(x => x.productId === p.id))).map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                              <p className="text-[11px] mt-0.5" style={{ color: it.qty > available ? '#dc2626' : 'var(--muted-foreground)' }}>
                                {formatCOP(it.price)} c/u · {available} disponibles
                              </p>
                            </div>
                            <input type="number" min={1} value={it.qty}
                              onChange={e => changeItem(i, { qty: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                              aria-label="Cantidad"
                              className="w-full px-2 py-2 rounded-lg text-sm outline-none text-center" style={inputStyle} />
                            <span className="text-sm font-semibold text-right whitespace-nowrap" style={{ color: 'var(--foreground)' }}>{formatCOP(it.price * it.qty)}</span>
                            <button type="button" onClick={() => removeItem(i)} aria-label="Quitar producto"
                              className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, color: '#dc2626' }}>
                              <Trash size={14} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {errors.items && <p className="text-xs" style={{ color: '#dc2626' }}>⚠ {errors.items}</p>}
                  <button type="button" onClick={addItem} disabled={!canAddMore}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg disabled:opacity-40"
                    style={{ border: '1px dashed var(--border)', color: 'var(--primary)' }}>
                    <Plus size={13} /> Agregar producto
                  </button>
                </>
              )}
              <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Total</span>
                <span className="text-lg font-black" style={{ color: 'var(--primary)' }}>{formatCOP(total)}</span>
              </div>
            </FormSection>

            <FormSection icon={Clipboard} title="Comprobante de pago">
              <div className="flex items-center gap-4">
                <div className="rounded-lg overflow-hidden flex items-center justify-center shrink-0"
                  style={{ width: 72, height: 72, backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                  {form.proofImage ? <img src={form.proofImage} alt="Comprobante" className="w-full h-full object-cover" /> : <ImageIcon size={22} />}
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
                    style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                    <Upload size={13} /> {form.proofImage ? 'Cambiar imagen' : 'Subir imagen'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleProof} />
                  </label>
                  {form.proofImage && (
                    <button type="button" onClick={() => update({ proofImage: null })}
                      className="text-xs font-bold px-3 py-2 rounded-lg" style={{ color: '#dc2626' }}>
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            </FormSection>
          </div>

          <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#005187' }}>
              {isNew ? 'Crear pedido' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
