import { useState } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'
import FormSection from '@/shared/components/FormSection'
import DocumentFields, { validateDocumentFields } from '@/shared/components/DocumentFields'
import PasswordFields, { validatePasswordFields } from '@/shared/components/PasswordFields'
import { X, User, IdCard, Mail, Lock } from '@/shared/components/Icons'

const EMAIL_RE = /^\S+@\S+\.\S+$/
const PHONE_RE = /^[\d\s+()-]{7,20}$/

const inputStyle = { backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }
const inputClass = 'w-full px-3 py-2.5 rounded-lg text-sm outline-none'

export default function DirectoryUserFormModal({ user, role, documentTypes = [], onSave, onClose, onManageDocumentTypes }) {
  const isTeacher = role === 'profesor'
  const [nameParts] = useState(() => {
    const [firstName = '', ...rest] = (user?.name ?? '').split(' ')
    return { firstName, lastName: rest.join(' ') }
  })
  const [form, setForm] = useState({
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
  // Al editar, la contraseña está oculta tras un botón para que quede claro
  // que no hace falta tocarla.
  const [changePassword, setChangePassword] = useState(!user)

  function update(patch) {
    setForm(f => ({ ...f, ...patch }))
    setErrors(er => ({ ...er, ...Object.fromEntries(Object.keys(patch).map(k => [k, null])) }))
  }

  function validate() {
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = 'El nombre es obligatorio.'
    if (!form.lastName.trim()) errs.lastName = 'Los apellidos son obligatorios.'
    Object.assign(errs, validateDocumentFields(form.documentType, form.documentNumber))
    if (!form.email.trim()) errs.email = 'El correo es obligatorio.'
    else if (!EMAIL_RE.test(form.email)) errs.email = 'Ingrese un correo válido.'
    if (isTeacher && !form.phone.trim()) errs.phone = 'El teléfono es obligatorio.'
    else if (form.phone.trim() && !PHONE_RE.test(form.phone.trim())) errs.phone = 'Ingrese un teléfono válido.'
    if (changePassword) Object.assign(errs, validatePasswordFields(form.password, form.confirmPassword))
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    const { firstName, lastName, documentType, documentNumber, email, phone, password } = form
    const payload = {
      name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      firstName: firstName.trim(), lastName: lastName.trim(),
      documentType, documentNumber: documentNumber.trim(),
      email: email.trim(), phone: phone.trim(),
    }
    if (changePassword && password) payload.password = password
    onSave({ ...payload, role })
  }

  const roleLabel = isTeacher ? 'profesor' : 'estudiante'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="rounded-2xl w-full shadow-2xl max-w-lg max-h-full flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>
        <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h3 className="text-lg font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
              {user ? `Editar ${roleLabel}` : `Nuevo ${roleLabel}`}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              {user ? 'Actualice los datos y el acceso de este usuario.' : 'Podrá iniciar sesión con el correo y la contraseña que indique.'}
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
            <FormSection icon={User} title="Datos personales">
              <div className="grid sm:grid-cols-2 gap-3">
                <FormField label="Nombres" required error={errors.firstName}>
                  <input value={form.firstName} onChange={e => update({ firstName: e.target.value })} autoComplete="off"
                    className={inputClass} style={{ ...inputStyle, ...errorInputStyle(!!errors.firstName) }} />
                </FormField>
                <FormField label="Apellidos" required error={errors.lastName}>
                  <input value={form.lastName} onChange={e => update({ lastName: e.target.value })} autoComplete="off"
                    className={inputClass} style={{ ...inputStyle, ...errorInputStyle(!!errors.lastName) }} />
                </FormField>
              </div>
            </FormSection>

            <FormSection icon={IdCard} title="Identificación">
              <DocumentFields documentTypes={documentTypes} documentType={form.documentType} documentNumber={form.documentNumber}
                onChange={update} errors={errors} inputStyle={inputStyle} onManageDocumentTypes={onManageDocumentTypes} />
            </FormSection>

            <FormSection icon={Mail} title="Contacto">
              <div className="grid sm:grid-cols-2 gap-3">
                <FormField label="Correo electrónico" required error={errors.email}>
                  <input type="email" value={form.email} onChange={e => update({ email: e.target.value })} autoComplete="off"
                    placeholder="nombre@correo.com"
                    className={inputClass} style={{ ...inputStyle, ...errorInputStyle(!!errors.email) }} />
                </FormField>
                <FormField label="Teléfono" required={isTeacher} error={errors.phone}>
                  <input type="tel" value={form.phone} onChange={e => update({ phone: e.target.value })} autoComplete="off"
                    placeholder="300 123 4567"
                    className={inputClass} style={{ ...inputStyle, ...errorInputStyle(!!errors.phone) }} />
                </FormField>
              </div>
            </FormSection>

            <FormSection icon={Lock} title="Acceso">
              {!changePassword ? (
                <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>La contraseña actual se mantiene.</span>
                  <button type="button" onClick={() => setChangePassword(true)}
                    className="text-xs font-bold shrink-0 hover:underline" style={{ color: 'var(--primary)' }}>
                    Cambiar contraseña
                  </button>
                </div>
              ) : (
                <PasswordFields password={form.password} confirmPassword={form.confirmPassword}
                  onChange={update} errors={errors} isEdit={!!user} inputStyle={inputStyle}
                  onCancelChange={user ? () => { setChangePassword(false); update({ password: '', confirmPassword: '' }) } : undefined} />
              )}
            </FormSection>
          </div>

          <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: '#005187' }}>
              {user ? 'Guardar cambios' : `Crear ${roleLabel}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
