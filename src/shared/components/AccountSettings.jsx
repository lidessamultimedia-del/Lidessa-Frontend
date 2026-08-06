import { useRef, useState } from 'react'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import FormField, { errorInputStyle } from '@/shared/components/FormField'
import Avatar from '@/shared/components/Avatar'

const EMAIL_RE = /^\S+@\S+\.\S+$/
const MAX_AVATAR_BYTES = 2 * 1024 * 1024

// Panel de "Mi cuenta" compartido por los tres roles (admin, profesor,
// estudiante) — cada dashboard lo monta como su propia sección de
// configuración personal, separada de ajustes globales (ej. la
// "Configuración del sitio" del admin).
export default function AccountSettings() {
  const { user, updateProfile, changePassword } = useAuth()
  const { toast } = useToast()

  const [profile, setProfile] = useState({ name: user.name, email: user.email, phone: user.phone ?? '' })
  const [profileErrors, setProfileErrors] = useState({})
  const avatarInputRef = useRef(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [savingPassword, setSavingPassword] = useState(false)

  function handleAvatarPick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast('error', 'Archivo no válido', 'Seleccione un archivo de imagen.')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast('error', 'Imagen muy pesada', 'El tamaño máximo permitido es 2 MB.')
      return
    }
    setUploadingAvatar(true)
    const reader = new FileReader()
    reader.onload = () => {
      updateProfile({ avatar: reader.result })
      setUploadingAvatar(false)
      toast('success', 'Foto actualizada', 'Su foto de perfil se cambió correctamente.')
    }
    reader.onerror = () => {
      setUploadingAvatar(false)
      toast('error', 'Error al cargar la imagen', 'Intente con otro archivo.')
    }
    reader.readAsDataURL(file)
  }

  function handleRemoveAvatar() {
    updateProfile({ avatar: null })
    toast('info', 'Foto eliminada', 'Se restauraron sus iniciales como foto de perfil.')
  }

  function handleProfileSubmit(e) {
    e.preventDefault()
    const errors = {}
    if (!profile.name.trim()) errors.name = 'El nombre es obligatorio.'
    if (!profile.email) errors.email = 'El correo es obligatorio.'
    else if (!EMAIL_RE.test(profile.email)) errors.email = 'Ingrese un correo válido.'
    if (Object.keys(errors).length > 0) return setProfileErrors(errors)
    setProfileErrors({})
    updateProfile(profile)
    toast('success', 'Perfil actualizado', 'Sus datos se guardaron correctamente.')
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    const errors = {}
    if (!passwords.current) errors.current = 'Ingrese su contraseña actual.'
    if (!passwords.next) errors.next = 'La nueva contraseña es obligatoria.'
    else if (passwords.next.length < 6) errors.next = 'Debe tener al menos 6 caracteres.'
    if (passwords.confirm !== passwords.next) errors.confirm = 'Las contraseñas no coinciden.'
    if (Object.keys(errors).length > 0) return setPasswordErrors(errors)
    setPasswordErrors({})
    setSavingPassword(true)
    try {
      await changePassword(passwords.current, passwords.next)
      toast('success', 'Contraseña actualizada', 'Su contraseña se cambió correctamente.')
      setPasswords({ current: '', next: '', confirm: '' })
    } catch (err) {
      setPasswordErrors({ current: err.message })
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div style={{ animation: 'fadeUp 0.4s ease', maxWidth: 560 }}>
      <h2 className="text-xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Mi cuenta</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Actualice su información personal y su contraseña.</p>

      <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--muted-foreground)' }}>Foto de perfil</h3>
        <div className="flex items-center gap-4">
          <Avatar user={user} size={72} />
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button type="button" onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar}
                className="text-xs px-3 py-1.5 rounded-lg font-bold text-white disabled:opacity-60" style={{ backgroundColor: '#005187' }}>
                {uploadingAvatar ? 'Subiendo...' : 'Cambiar foto'}
              </button>
              {user.avatar && (
                <button type="button" onClick={handleRemoveAvatar}
                  className="text-xs px-3 py-1.5 rounded-lg font-bold" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                  Quitar foto
                </button>
              )}
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>JPG o PNG, máximo 2 MB.</p>
            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarPick} className="hidden" />
          </div>
        </div>
      </div>

      <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--muted-foreground)' }}>Datos personales</h3>
        <form onSubmit={handleProfileSubmit} className="space-y-4" noValidate>
          <FormField label="Nombre completo" error={profileErrors.name}>
            <input value={profile.name}
              onChange={e => { setProfile(f => ({ ...f, name: e.target.value })); setProfileErrors(f => ({ ...f, name: null })) }}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!profileErrors.name) }} />
          </FormField>
          <FormField label="Correo electrónico" error={profileErrors.email}>
            <input type="email" value={profile.email}
              onChange={e => { setProfile(f => ({ ...f, email: e.target.value })); setProfileErrors(f => ({ ...f, email: null })) }}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!profileErrors.email) }} />
          </FormField>
          <FormField label="Teléfono" helperText="Opcional">
            <input value={profile.phone} onChange={e => setProfile(f => ({ ...f, phone: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
          </FormField>
          <button type="submit" className="w-full py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#005187' }}>
            Guardar cambios
          </button>
        </form>
      </div>

      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--muted-foreground)' }}>Cambiar contraseña</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
          <FormField label="Contraseña actual" error={passwordErrors.current}>
            <input type="password" value={passwords.current}
              onChange={e => { setPasswords(f => ({ ...f, current: e.target.value })); setPasswordErrors(f => ({ ...f, current: null })) }}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!passwordErrors.current) }} />
          </FormField>
          <FormField label="Nueva contraseña" error={passwordErrors.next}>
            <input type="password" value={passwords.next}
              onChange={e => { setPasswords(f => ({ ...f, next: e.target.value })); setPasswordErrors(f => ({ ...f, next: null })) }}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!passwordErrors.next) }} />
          </FormField>
          <FormField label="Confirmar nueva contraseña" error={passwordErrors.confirm}>
            <input type="password" value={passwords.confirm}
              onChange={e => { setPasswords(f => ({ ...f, confirm: e.target.value })); setPasswordErrors(f => ({ ...f, confirm: null })) }}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!passwordErrors.confirm) }} />
          </FormField>
          <button type="submit" disabled={savingPassword} className="w-full py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-60" style={{ backgroundColor: '#005187' }}>
            {savingPassword ? 'Guardando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
