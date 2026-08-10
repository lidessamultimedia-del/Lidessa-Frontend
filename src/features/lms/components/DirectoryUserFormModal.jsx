import { useState } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'
import { Eye, EyeOff } from '@/shared/components/Icons'

const EMAIL_RE = /^\S+@\S+\.\S+$/

export default function DirectoryUserFormModal({ user, role, documentTypes = [], onSave, onClose }) {
  const isTeacher = role === 'profesor'
  const [nameParts] = useState(() => {
    const [firstName = '', ...rest] = (user?.name ?? '').split(' ')
    return { firstName, lastName: rest.join(' ') }
  })
  const [form, setForm] = useState({
    name: user?.name ?? '',
    firstName: user?.firstName ?? nameParts.firstName,
    lastName: user?.lastName ?? nameParts.lastName,
    documentType: user?.documentType ?? documentTypes[0]?.name ?? '',
    documentNumber: user?.documentNumber ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  function validate() {
    const errs = {}
    if (isTeacher) {
      if (!form.firstName.trim()) errs.firstName = 'El nombre es obligatorio.'
      if (!form.lastName.trim()) errs.lastName = 'Los apellidos son obligatorios.'
      if (!form.documentType) errs.documentType = 'Seleccione un tipo de documento.'
      if (!form.documentNumber.trim()) errs.documentNumber = 'El número de documento es obligatorio.'
      if (!form.phone.trim()) errs.phone = 'El teléfono es obligatorio.'
      if (!user) {
        if (!form.password) errs.password = 'La contraseña es obligatoria.'
        else if (form.password.length < 6) errs.password = 'Debe tener al menos 6 caracteres.'
        if (!form.confirmPassword) errs.confirmPassword = 'Confirme la contraseña.'
        else if (form.confirmPassword !== form.password) errs.confirmPassword = 'Las contraseñas no coinciden.'
      } else if (form.password || form.confirmPassword) {
        if (form.password.length < 6) errs.password = 'Debe tener al menos 6 caracteres.'
        if (form.confirmPassword !== form.password) errs.confirmPassword = 'Las contraseñas no coinciden.'
      }
    } else if (!form.name.trim()) {
      errs.name = 'El nombre es obligatorio.'
    }
    if (!form.email.trim()) errs.email = 'El correo es obligatorio.'
    else if (!EMAIL_RE.test(form.email)) errs.email = 'Ingrese un correo válido.'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    if (isTeacher) {
      const { firstName, lastName, documentType, documentNumber, email, phone, password } = form
      const payload = {
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        firstName: firstName.trim(), lastName: lastName.trim(),
        documentType, documentNumber: documentNumber.trim(), email, phone: phone.trim(),
      }
      if (password) payload.password = password
      onSave({ ...payload, role })
    } else {
      onSave({ name: form.name, email: form.email, role })
    }
  }

  const roleLabel = isTeacher ? 'profesor' : 'estudiante'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className={`rounded-2xl p-6 w-full shadow-2xl ${isTeacher ? 'max-w-md' : 'max-w-sm'}`}
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>
        <h3 className="text-lg font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          {user ? `Editar ${roleLabel}` : `Nuevo ${roleLabel}`}
        </h3>
        <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>
          Los usuarios creados aquí quedan en el directorio del LMS. Como no hay backend, no podrán iniciar sesión con estas credenciales — use las cuentas demo para probar el ingreso.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {isTeacher ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Nombre" required error={errors.firstName}>
                  <input value={form.firstName} onChange={e => { setForm(f => ({ ...f, firstName: e.target.value })); setErrors(er => ({ ...er, firstName: null })) }}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.firstName) }} />
                </FormField>
                <FormField label="Apellidos" required error={errors.lastName}>
                  <input value={form.lastName} onChange={e => { setForm(f => ({ ...f, lastName: e.target.value })); setErrors(er => ({ ...er, lastName: null })) }}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.lastName) }} />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Tipo de documento" required error={errors.documentType}
                  helperText={documentTypes.length === 0 ? 'Configure al menos uno en Configuración → Tipos de documento.' : undefined}>
                  <select value={form.documentType} disabled={documentTypes.length === 0}
                    onChange={e => { setForm(f => ({ ...f, documentType: e.target.value })); setErrors(er => ({ ...er, documentType: null })) }}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none disabled:opacity-50"
                    style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.documentType) }}>
                    {documentTypes.length === 0
                      ? <option value="">Sin tipos configurados</option>
                      : documentTypes.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                  </select>
                </FormField>
                <FormField label="Número de documento" required error={errors.documentNumber}>
                  <input value={form.documentNumber} onChange={e => { setForm(f => ({ ...f, documentNumber: e.target.value })); setErrors(er => ({ ...er, documentNumber: null })) }}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.documentNumber) }} />
                </FormField>
              </div>
            </>
          ) : (
            <FormField label="Nombre completo" required error={errors.name}>
              <input value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: null })) }}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.name) }} />
            </FormField>
          )}
          <FormField label="Correo electrónico" required error={errors.email}>
            <input type="email" value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: null })) }}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.email) }} />
          </FormField>
          {isTeacher && (
            <>
              <FormField label="Número de teléfono" required error={errors.phone}>
                <input type="tel" value={form.phone} onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setErrors(er => ({ ...er, phone: null })) }}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.phone) }} />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Contraseña" required={!user} error={errors.password}
                  helperText={user ? 'Deje en blanco para no cambiarla.' : undefined}>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={form.password}
                      onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(er => ({ ...er, password: null })) }}
                      className="w-full pl-3 pr-10 py-2.5 rounded-lg text-sm outline-none"
                      style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.password) }} />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center"
                      style={{ color: 'var(--muted-foreground)' }}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </FormField>
                <FormField label="Confirmar contraseña" required={!user} error={errors.confirmPassword}>
                  <div className="relative">
                    <input type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword}
                      onChange={e => { setForm(f => ({ ...f, confirmPassword: e.target.value })); setErrors(er => ({ ...er, confirmPassword: null })) }}
                      className="w-full pl-3 pr-10 py-2.5 rounded-lg text-sm outline-none"
                      style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.confirmPassword) }} />
                    <button type="button" onClick={() => setShowConfirmPassword(v => !v)}
                      aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center"
                      style={{ color: 'var(--muted-foreground)' }}>
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </FormField>
              </div>
            </>
          )}
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
