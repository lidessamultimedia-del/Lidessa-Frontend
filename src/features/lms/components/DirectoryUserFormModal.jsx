import { useState } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'

const EMAIL_RE = /^\S+@\S+\.\S+$/

export default function DirectoryUserFormModal({ user, role, onSave, onClose }) {
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
  })
  const [errors, setErrors] = useState({})

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'El nombre es obligatorio.'
    if (!form.email.trim()) errs.email = 'El correo es obligatorio.'
    else if (!EMAIL_RE.test(form.email)) errs.email = 'Ingrese un correo válido.'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    onSave({ ...form, role })
  }

  const roleLabel = role === 'profesor' ? 'profesor' : 'estudiante'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>
        <h3 className="text-lg font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          {user ? `Editar ${roleLabel}` : `Nuevo ${roleLabel}`}
        </h3>
        <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>
          Los usuarios creados aquí quedan en el directorio del LMS. Como no hay backend, no podrán iniciar sesión con estas credenciales — use las cuentas demo para probar el ingreso.
        </p>
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
