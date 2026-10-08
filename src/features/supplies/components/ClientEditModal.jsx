import { useState } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'

// client === null -> modo "crear" (pide contraseña, para que el cliente
// pueda iniciar sesión). client = objeto -> modo "editar" (sin contraseña).
export default function ClientEditModal({ client, onSave, onCancel }) {
  const isNew = !client
  const [form, setForm] = useState({
    name: client?.name ?? '',
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    documentNumber: client?.documentNumber ?? '',
    address: client?.address ?? '',
    password: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setFieldErrors(f => ({ ...f, [field]: null }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errors = {}
    if (!form.name.trim()) errors.name = 'El nombre es obligatorio.'
    if (!form.email.trim()) errors.email = 'El correo es obligatorio.'
    if (isNew && form.password.length < 6) errors.password = 'Mínimo 6 caracteres.'
    if (Object.keys(errors).length > 0) return setFieldErrors(errors)
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <form onSubmit={handleSubmit} className="rounded-xl p-6 max-w-md w-full max-h-full overflow-y-auto space-y-4" style={{ backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-lg font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          {isNew ? 'Nuevo cliente' : 'Editar cliente'}
        </h2>

        <FormField label="Nombre completo" required error={fieldErrors.name}>
          <input value={form.name} onChange={e => set('name', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!fieldErrors.name) }} />
        </FormField>

        <FormField label="Correo electrónico" required error={fieldErrors.email}>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!fieldErrors.email) }} />
        </FormField>

        {isNew && (
          <FormField label="Contraseña" required error={fieldErrors.password} helperText="Para que el cliente pueda iniciar sesión. Mínimo 6 caracteres.">
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!fieldErrors.password) }} />
          </FormField>
        )}

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Teléfono">
            <input value={form.phone} onChange={e => set('phone', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
          </FormField>
          <FormField label="N° de documento">
            <input value={form.documentNumber} onChange={e => set('documentNumber', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
          </FormField>
        </div>

        <FormField label="Dirección">
          <input value={form.address} onChange={e => set('address', e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
        </FormField>

        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>Cancelar</button>
          <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#005187' }}>Guardar</button>
        </div>
      </form>
    </div>
  )
}
