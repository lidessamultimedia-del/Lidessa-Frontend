import { useState } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'
import FormSection from '@/shared/components/FormSection'
import DocumentFields, { validateDocumentFields } from '@/shared/components/DocumentFields'
import PasswordFields, { validatePasswordFields } from '@/shared/components/PasswordFields'
import { X, User, IdCard, Mail, Lock } from '@/shared/components/Icons'

const EMAIL_RE = /^\S+@\S+\.\S+$/
const PHONE_RE = /^[\d\s+()-]{7,20}$/

const inputStyle = { backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }
const inputClass = 'w-full px-3 py-2.5 rounded-lg text-sm outline-none'

// client === null -> modo "crear" (pide contraseña, para que el cliente
// pueda iniciar sesión). client = objeto -> modo "editar" (la contraseña
// solo se cambia si el admin lo pide explícitamente).
export default function ClientEditModal({ client, documentTypes = [], onSave, onCancel, onManageDocumentTypes }) {
  const isNew = !client
  const [form, setForm] = useState({
    name: client?.name ?? '',
    documentType: client?.documentType ?? documentTypes[0]?.name ?? '',
    documentNumber: client?.documentNumber ?? '',
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    address: client?.address ?? '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [changePassword, setChangePassword] = useState(isNew)

  function update(patch) {
    setForm(f => ({ ...f, ...patch }))
    setFieldErrors(er => ({ ...er, ...Object.fromEntries(Object.keys(patch).map(k => [k, null])) }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errors = {}
    if (!form.name.trim()) errors.name = 'El nombre es obligatorio.'
    Object.assign(errors, validateDocumentFields(form.documentType, form.documentNumber))
    if (!form.email.trim()) errors.email = 'El correo es obligatorio.'
    else if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Ingrese un correo válido.'
    if (form.phone.trim() && !PHONE_RE.test(form.phone.trim())) errors.phone = 'Ingrese un teléfono válido.'
    if (changePassword) Object.assign(errors, validatePasswordFields(form.password, form.confirmPassword))
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return
    const payload = {
      name: form.name.trim(),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="rounded-2xl w-full shadow-2xl max-w-lg max-h-full flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>
        <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="text-lg font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
              {isNew ? 'Nuevo cliente' : 'Editar cliente'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              {isNew ? 'El cliente podrá iniciar sesión en V2 Suministros con este correo y contraseña.' : 'Actualice los datos y el acceso de este cliente.'}
            </p>
          </div>
          <button type="button" onClick={onCancel} aria-label="Cerrar"
            className="shrink-0 flex items-center justify-center rounded-full"
            style={{ width: 32, height: 32, color: 'var(--muted-foreground)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--muted)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate autoComplete="off" className="flex flex-col min-h-0">
          <div className="overflow-y-auto px-6 py-5 space-y-6">
            <FormSection icon={User} title="Datos del cliente">
              <FormField label="Nombre completo o razón social" required error={fieldErrors.name}>
                <input value={form.name} onChange={e => update({ name: e.target.value })} autoComplete="off"
                  className={inputClass} style={{ ...inputStyle, ...errorInputStyle(!!fieldErrors.name) }} />
              </FormField>
            </FormSection>

            <FormSection icon={IdCard} title="Identificación">
              <DocumentFields documentTypes={documentTypes} documentType={form.documentType} documentNumber={form.documentNumber}
                onChange={update} errors={fieldErrors} inputStyle={inputStyle} onManageDocumentTypes={onManageDocumentTypes} />
            </FormSection>

            <FormSection icon={Mail} title="Contacto y envío">
              <div className="grid sm:grid-cols-2 gap-3">
                <FormField label="Correo electrónico" required error={fieldErrors.email}>
                  {/* name/autoComplete distintos para que el navegador no rellene el correo del admin */}
                  <input type="email" name="client-email" value={form.email} onChange={e => update({ email: e.target.value })} autoComplete="off"
                    placeholder="cliente@correo.com"
                    className={inputClass} style={{ ...inputStyle, ...errorInputStyle(!!fieldErrors.email) }} />
                </FormField>
                <FormField label="Teléfono" error={fieldErrors.phone}>
                  <input type="tel" value={form.phone} onChange={e => update({ phone: e.target.value })} autoComplete="off"
                    placeholder="300 123 4567"
                    className={inputClass} style={{ ...inputStyle, ...errorInputStyle(!!fieldErrors.phone) }} />
                </FormField>
              </div>
              <FormField label="Dirección" helperText="Se usa como dirección de envío por defecto.">
                <input value={form.address} onChange={e => update({ address: e.target.value })} autoComplete="off"
                  placeholder="Calle 00 # 00-00, Ciudad"
                  className={inputClass} style={inputStyle} />
              </FormField>
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
                  onChange={update} errors={fieldErrors} isEdit={!isNew} inputStyle={inputStyle}
                  hint={isNew ? 'Para que el cliente pueda iniciar sesión. Mínimo 6 caracteres.' : undefined}
                  onCancelChange={!isNew ? () => { setChangePassword(false); update({ password: '', confirmPassword: '' }) } : undefined} />
              )}
            </FormSection>
          </div>

          <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#005187' }}>
              {isNew ? 'Crear cliente' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
