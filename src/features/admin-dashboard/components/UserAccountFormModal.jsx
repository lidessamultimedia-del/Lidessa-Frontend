import { useState } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'
import FormSection from '@/shared/components/FormSection'
import DocumentFields, { validateDocumentFields } from '@/shared/components/DocumentFields'
import PasswordFields, { validatePasswordFields } from '@/shared/components/PasswordFields'
import { X, User, IdCard, Mail, Lock, ShieldCheck } from '@/shared/components/Icons'

const EMAIL_RE = /^\S+@\S+\.\S+$/
const PHONE_RE = /^[\d\s+()-]{7,20}$/

const inputStyle = { backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }
const inputClass = 'w-full px-3 py-2.5 rounded-lg text-sm outline-none'

export const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrador', description: 'Acceso completo al panel de administración.' },
  { value: 'profesor', label: 'Profesor', description: 'Gestiona sus cursos, califica y responde mensajes.' },
  { value: 'estudiante', label: 'Estudiante', description: 'Accede a los cursos en los que está inscrito.' },
  { value: 'cliente', label: 'Cliente', description: 'Compra en V2 Suministros y sigue sus pedidos.' },
]

// Crear / editar cualquier cuenta del sistema (Configuración → Usuarios y
// Roles). `account` = null → crear. `isSelf` bloquea el cambio de rol propio.
export default function UserAccountFormModal({ account, isSelf = false, documentTypes = [], existingEmails = [], onSave, onClose, onManageDocumentTypes }) {
  const isNew = !account
  const [nameParts] = useState(() => {
    const [firstName = '', ...rest] = (account?.name ?? '').split(' ')
    return { firstName, lastName: rest.join(' ') }
  })
  const [form, setForm] = useState({
    role: account?.role ?? 'estudiante',
    firstName: account?.firstName ?? nameParts.firstName,
    lastName: account?.lastName ?? nameParts.lastName,
    documentType: account?.documentType ?? documentTypes[0]?.name ?? '',
    documentNumber: account?.documentNumber ?? '',
    email: account?.email ?? '',
    phone: account?.phone ?? '',
    address: account?.address ?? '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [changePassword, setChangePassword] = useState(isNew)

  function update(patch) {
    setForm(f => ({ ...f, ...patch }))
    setErrors(er => ({ ...er, ...Object.fromEntries(Object.keys(patch).map(k => [k, null])) }))
  }

  function validate() {
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = 'El nombre es obligatorio.'
    if (!form.lastName.trim()) errs.lastName = 'Los apellidos son obligatorios.'
    Object.assign(errs, validateDocumentFields(form.documentType, form.documentNumber))
    const email = form.email.trim().toLowerCase()
    if (!email) errs.email = 'El correo es obligatorio.'
    else if (!EMAIL_RE.test(email)) errs.email = 'Ingrese un correo válido.'
    else if (existingEmails.includes(email)) errs.email = 'Ya existe otra cuenta con ese correo.'
    if (form.role === 'profesor' && !form.phone.trim()) errs.phone = 'El teléfono es obligatorio para profesores.'
    else if (form.phone.trim() && !PHONE_RE.test(form.phone.trim())) errs.phone = 'Ingrese un teléfono válido.'
    if (changePassword) Object.assign(errs, validatePasswordFields(form.password, form.confirmPassword))
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    const payload = {
      role: form.role,
      name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      documentType: form.documentType,
      documentNumber: form.documentNumber.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
    }
    if (changePassword && form.password) payload.password = form.password
    onSave(payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="rounded-2xl w-full shadow-2xl max-w-lg max-h-full flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>
        <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h3 className="text-lg font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
              {isNew ? 'Nuevo usuario' : 'Editar usuario'}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              {isNew ? 'Podrá iniciar sesión con el correo y la contraseña que indique.' : 'Actualice los datos, el rol y el acceso de esta cuenta.'}
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
            <FormSection icon={ShieldCheck} title="Rol">
              <div className="grid grid-cols-2 gap-2">
                {ROLE_OPTIONS.map(r => {
                  const selected = form.role === r.value
                  const disabled = isSelf && !selected
                  return (
                    <button key={r.value} type="button" disabled={disabled}
                      onClick={() => update({ role: r.value })}
                      className="text-left rounded-xl p-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        border: `1.5px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
                        backgroundColor: selected ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : 'transparent',
                      }}>
                      <span className="flex items-center gap-2 text-sm font-bold" style={{ color: selected ? 'var(--primary)' : 'var(--foreground)' }}>
                        <span className="flex items-center justify-center rounded-full shrink-0"
                          style={{ width: 14, height: 14, border: `2px solid ${selected ? 'var(--primary)' : 'var(--border)'}` }}>
                          {selected && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--primary)' }} />}
                        </span>
                        {r.label}
                      </span>
                      <span className="block text-[11px] leading-snug mt-1" style={{ color: 'var(--muted-foreground)' }}>{r.description}</span>
                    </button>
                  )
                })}
              </div>
              {isSelf && (
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>No puede cambiar su propio rol.</p>
              )}
            </FormSection>

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
                  <input type="email" name="account-email" value={form.email} onChange={e => update({ email: e.target.value })} autoComplete="off"
                    placeholder="nombre@correo.com"
                    className={inputClass} style={{ ...inputStyle, ...errorInputStyle(!!errors.email) }} />
                </FormField>
                <FormField label="Teléfono" required={form.role === 'profesor'} error={errors.phone}>
                  <input type="tel" value={form.phone} onChange={e => update({ phone: e.target.value })} autoComplete="off"
                    placeholder="300 123 4567"
                    className={inputClass} style={{ ...inputStyle, ...errorInputStyle(!!errors.phone) }} />
                </FormField>
              </div>
              {form.role === 'cliente' && (
                <FormField label="Dirección" helperText="Se usa como dirección de envío por defecto.">
                  <input value={form.address} onChange={e => update({ address: e.target.value })} autoComplete="off"
                    placeholder="Calle 00 # 00-00, Ciudad"
                    className={inputClass} style={inputStyle} />
                </FormField>
              )}
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
                  onChange={update} errors={errors} isEdit={!isNew} inputStyle={inputStyle}
                  onCancelChange={!isNew ? () => { setChangePassword(false); update({ password: '', confirmPassword: '' }) } : undefined} />
              )}
            </FormSection>
          </div>

          <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold"
              style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: '#005187' }}>
              {isNew ? 'Crear usuario' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
