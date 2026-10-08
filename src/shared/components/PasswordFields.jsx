import { useState } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'
import { Eye, EyeOff, Sparkle } from '@/shared/components/Icons'

// Campos de contraseña + confirmación para los formularios del panel admin
// (usuarios del LMS y clientes de Suministros): mostrar/ocultar, indicador
// de seguridad y botón para generar una contraseña segura.

const STRENGTH = [
  { label: 'Muy débil', color: '#dc2626' },
  { label: 'Débil', color: '#dc2626' },
  { label: 'Aceptable', color: '#d97706' },
  { label: 'Buena', color: '#16a34a' },
  { label: 'Fuerte', color: '#16a34a' },
]

function passwordStrength(pw) {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return pw.length < 6 ? Math.min(score, 1) : score
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const symbols = '!@#$%*?'
  let pw = ''
  for (let i = 0; i < 9; i++) pw += chars[Math.floor(Math.random() * chars.length)]
  pw += symbols[Math.floor(Math.random() * symbols.length)]
  pw += String(Math.floor(Math.random() * 10))
  return pw
}

// Validación compartida: devuelve { password?, confirmPassword? } con los errores.
export function validatePasswordFields(password, confirmPassword) {
  const errs = {}
  if (!password) errs.password = 'La contraseña es obligatoria.'
  else if (password.length < 6) errs.password = 'Debe tener al menos 6 caracteres.'
  if (!confirmPassword) errs.confirmPassword = 'Confirme la contraseña.'
  else if (confirmPassword !== password) errs.confirmPassword = 'Las contraseñas no coinciden.'
  return errs
}

function PasswordInput({ value, onChange, visible, onToggle, hasError, inputStyle }) {
  return (
    <div className="relative">
      <input type={visible ? 'text' : 'password'} value={value} autoComplete="new-password"
        onChange={e => onChange(e.target.value)}
        className="w-full pl-3 pr-10 py-2.5 rounded-lg text-sm outline-none"
        style={{ ...inputStyle, ...errorInputStyle(hasError) }} />
      <button type="button" onClick={onToggle}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center"
        style={{ color: 'var(--muted-foreground)' }}>
        {visible ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )
}

export default function PasswordFields({ password, confirmPassword, onChange, errors = {}, isEdit = false, onCancelChange, inputStyle, hint }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const strength = passwordStrength(password)

  function handleGenerate() {
    const pw = generatePassword()
    onChange({ password: pw, confirmPassword: pw })
    setShowPassword(true)
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 gap-3">
        <FormField label={isEdit ? 'Nueva contraseña' : 'Contraseña'} required error={errors.password}>
          <PasswordInput value={password} onChange={v => onChange({ password: v })}
            visible={showPassword} onToggle={() => setShowPassword(v => !v)} hasError={!!errors.password} inputStyle={inputStyle} />
        </FormField>
        <FormField label="Confirmar contraseña" required error={errors.confirmPassword}>
          <PasswordInput value={confirmPassword} onChange={v => onChange({ confirmPassword: v })}
            visible={showConfirm} onToggle={() => setShowConfirm(v => !v)} hasError={!!errors.confirmPassword} inputStyle={inputStyle} />
        </FormField>
      </div>

      <div>
        <div className="flex gap-1 mb-1">
          {[1, 2, 3, 4].map(i => (
            <span key={i} className="flex-1 h-1.5 rounded-full"
              style={{ backgroundColor: password && strength >= i ? STRENGTH[strength].color : 'var(--muted)', transition: 'background-color 0.2s' }} />
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs" style={{ color: password ? STRENGTH[strength].color : 'var(--muted-foreground)' }}>
            {password ? `Seguridad: ${STRENGTH[strength].label}` : (hint ?? 'Mínimo 6 caracteres. Se recomienda combinar mayúsculas, números y símbolos.')}
          </span>
          <div className="flex items-center gap-3 shrink-0">
            <button type="button" onClick={handleGenerate}
              className="inline-flex items-center gap-1 text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
              <Sparkle size={12} /> Generar
            </button>
            {onCancelChange && (
              <button type="button" onClick={onCancelChange}
                className="text-xs font-semibold hover:underline" style={{ color: 'var(--muted-foreground)' }}>
                Cancelar cambio
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
