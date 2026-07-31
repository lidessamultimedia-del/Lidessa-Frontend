import { useState } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'

const EMAIL_RE = /^\S+@\S+\.\S+$/

export default function ClientFormModal({ client, onSave, onClose }) {
  const [form, setForm] = useState({
    name: client?.name ?? '',
    email: client?.email ?? '',
    company: client?.company ?? '',
  })
  const [errors, setErrors] = useState({})

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'El nombre es obligatorio.'
    if (!form.email.trim()) errs.email = 'El correo es obligatorio.'
    else if (!EMAIL_RE.test(form.email)) errs.email = 'Ingrese un correo válido.'
    if (!form.company.trim()) errs.company = 'La empresa es obligatoria.'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>
        <h3 className="text-lg font-black mb-5" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          {client ? 'Editar cliente' : 'Nuevo cliente'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField label="Nombre completo" required error={errors.name}>
            <input value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: null })) }}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.name) }} />
          </FormField>
          <FormField label="Correo electrónico" required error={errors.email}>
            <input type="email" value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: null })) }}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.email) }} />
          </FormField>
          <FormField label="Empresa" required error={errors.company}>
            <input value={form.company} onChange={e => { setForm(f => ({ ...f, company: e.target.value })); setErrors(er => ({ ...er, company: null })) }}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.company) }} />
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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
