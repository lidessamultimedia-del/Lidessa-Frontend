import { useRef, useState } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'
import Toggle from '@/shared/components/Toggle'
import { ImageIcon } from '@/shared/components/Icons'
import { formatAmountInput, parseAmountInput } from '@/shared/lib/money'

export default function SupplyProductFormModal({ product, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price != null ? String(product.price) : '', // dígitos crudos
    stock: product?.stock ?? '',
    image: product?.image ?? '',
    active: product?.active ?? true,
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const imageInputRef = useRef(null)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setFieldErrors(f => ({ ...f, [field]: null }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errors = {}
    if (!form.name.trim()) errors.name = 'El nombre es obligatorio.'
    if (!form.price || Number(form.price) <= 0) errors.price = 'Ingresa un precio válido.'
    if (form.stock !== '' && Number(form.stock) < 0) errors.stock = 'El stock no puede ser negativo.'
    if (Object.keys(errors).length > 0) return setFieldErrors(errors)
    onSave({ ...form, price: Number(form.price), stock: Number(form.stock) || 0 })
  }

  function handleImageFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set('image', reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <form onSubmit={handleSubmit} className="rounded-xl p-6 max-w-lg w-full max-h-full overflow-y-auto space-y-4" style={{ backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)' }}>
        <div>
          <h2 className="text-lg font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            {product ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Así se va a ver en el catálogo de Suministros.
          </p>
        </div>

        <div className="grid sm:grid-cols-[112px_1fr] gap-4">
          {/* Foto */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Foto</label>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="rounded-lg overflow-hidden flex items-center justify-center"
              style={{ width: 112, height: 112, backgroundColor: 'var(--muted)', border: '1px dashed var(--border)' }}
            >
              {form.image ? (
                <img src={form.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span style={{ color: 'var(--muted-foreground)' }}><ImageIcon size={26} /></span>
              )}
            </button>
            <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="text-xs font-semibold mt-1.5 underline"
              style={{ color: 'var(--primary)' }}
            >
              {form.image ? 'Cambiar foto' : 'Subir foto'}
            </button>
          </div>

          <div className="space-y-4">
            <FormField label="Nombre" required error={fieldErrors.name} helperText="Tal como lo va a ver el cliente en el catálogo.">
              <input
                value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="Ej: Botiquín tipo A certificado"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!fieldErrors.name) }}
              />
            </FormField>

            <div className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ backgroundColor: 'var(--muted)' }}>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Visible en el catálogo</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {form.active ? 'Los clientes pueden verlo y comprarlo.' : 'Oculto — no aparece en la tienda.'}
                </p>
              </div>
              <Toggle checked={form.active} onChange={() => set('active', !form.active)} label="Visible en el catálogo" />
            </div>
          </div>
        </div>

        <FormField label="Descripción" helperText="Qué es y para qué sirve — se muestra cuando el cliente abre el detalle del producto.">
          <textarea
            value={form.description} onChange={e => set('description', e.target.value)}
            rows={3}
            placeholder="Ej: Botiquín de primeros auxilios completo, conforme a la Resolución 0705 de 2007."
            className="w-full px-3 py-2 rounded-lg text-sm resize-none"
            style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Precio" required error={fieldErrors.price} helperText="En pesos colombianos (COP).">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--muted-foreground)' }}>$</span>
              <input
                type="text" inputMode="numeric" value={formatAmountInput(form.price)}
                onChange={e => set('price', parseAmountInput(e.target.value))}
                placeholder="0"
                className="w-full pl-6 pr-3 py-2 rounded-lg text-sm"
                style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!fieldErrors.price) }}
              />
            </div>
          </FormField>
          <FormField label="Stock disponible" error={fieldErrors.stock} helperText="Unidades listas para vender hoy.">
            <input
              type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!fieldErrors.stock) }}
            />
          </FormField>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>Cancelar</button>
          <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#005187' }}>Guardar</button>
        </div>
      </form>
    </div>
  )
}
