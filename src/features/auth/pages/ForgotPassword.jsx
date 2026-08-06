import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import FormField, { errorInputStyle } from '@/shared/components/FormField'

const EMAIL_RE = /^\S+@\S+\.\S+$/
const CODE_RE = /^\d{6}$/

const STEP_COPY = {
  email: {
    title: 'Recuperar contraseña',
    subtitle: 'Ingrese su correo electrónico y le enviaremos un código de verificación.',
  },
  code: {
    title: 'Verifique su código',
    subtitle: 'Ingrese el código de 6 dígitos que enviamos a su correo.',
  },
  password: {
    title: 'Nueva contraseña',
    subtitle: 'Cree una nueva contraseña para su cuenta.',
  },
}

export default function ForgotPassword() {
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { requestPasswordReset, verifyResetCode, resetPassword } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')
    if (!email) return setFieldErrors({ email: 'El correo es obligatorio.' })
    if (!EMAIL_RE.test(email)) return setFieldErrors({ email: 'Ingrese un correo válido.' })
    setFieldErrors({})
    setLoading(true)
    try {
      const sentCode = await requestPasswordReset(email)
      toast('success', 'Código enviado', `Se envió un código de verificación a ${email}. (Demo: ${sentCode})`)
      setStep('code')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = (e) => {
    e.preventDefault()
    setError('')
    if (!code) return setFieldErrors({ code: 'El código es obligatorio.' })
    if (!CODE_RE.test(code)) return setFieldErrors({ code: 'El código debe tener 6 dígitos.' })
    setFieldErrors({})
    try {
      verifyResetCode(email, code)
      setStep('password')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setLoading(true)
    try {
      const sentCode = await requestPasswordReset(email)
      toast('success', 'Código reenviado', `Se envió un nuevo código a ${email}. (Demo: ${sentCode})`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    const errors = {}
    if (!password) errors.password = 'La contraseña es obligatoria.'
    else if (password.length < 6) errors.password = 'Debe tener al menos 6 caracteres.'
    if (confirmPassword !== password) errors.confirmPassword = 'Las contraseñas no coinciden.'
    if (Object.keys(errors).length > 0) return setFieldErrors(errors)
    setFieldErrors({})
    setLoading(true)
    try {
      await resetPassword(email, code, password)
      toast('success', 'Contraseña actualizada', 'Ya puede iniciar sesión con su nueva contraseña.')
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const { title, subtitle } = STEP_COPY[step]

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ backgroundColor: 'var(--background)' }}>
      {/* Branded side */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(0,81,135,0.75) 0%, rgba(61,49,21,0.8) 40%, rgba(20,20,20,0.9) 100%), url(/assets/fondo_de_login.avif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Link to="/" className="relative flex items-center gap-2.5">
          <img src="/assets/logolidessa.png" alt="Lidessa" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          <span className="text-2xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'white' }}>
            Lide<span style={{ color: '#84b6f4' }}>ssa</span>
          </span>
        </Link>

        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#84b6f4' }}>
            Panel de administración
          </p>
          <h1 className="text-4xl font-black text-white mb-4 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Recupere el acceso a su cuenta
          </h1>
          <p className="text-sm max-w-sm" style={{ color: '#c4dafa' }}>
            Verifique su identidad con un código de un solo uso y defina una nueva contraseña.
          </p>
        </div>

        <p className="relative text-xs" style={{ color: '#6b8bb0' }}>
          © {new Date().getFullYear()} Lidessa. Todos los derechos reservados.
        </p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-10">
            <img src="/assets/logolidessa.png" alt="Lidessa" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            <span className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: '#005187' }}>
              Lide<span style={{ color: '#4d82bc' }}>ssa</span>
            </span>
          </Link>

          <h2 className="text-2xl font-black mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            {title}
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>
            {subtitle}
          </p>

          {step === 'email' && (
            <form onSubmit={handleSendCode} className="space-y-4" noValidate>
              <Field label="Correo electrónico" type="email" placeholder="correo@empresa.com"
                value={email} error={fieldErrors.email}
                onChange={v => { setEmail(v); setFieldErrors(f => ({ ...f, email: null })) }} />
              {error && <ErrorBanner message={error} />}
              <button type="submit" disabled={loading} className="w-full py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 btn-shimmer">
                {loading ? 'Enviando...' : 'Enviar código'}
              </button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-4" noValidate>
              <Field label="Código de verificación" type="text" placeholder="000000" maxLength={6}
                value={code} error={fieldErrors.code}
                onChange={v => { setCode(v.replace(/\D/g, '').slice(0, 6)); setFieldErrors(f => ({ ...f, code: null })) }} />
              {error && <ErrorBanner message={error} />}
              <button type="submit" className="w-full py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 btn-shimmer">
                Verificar código
              </button>
              <button type="button" onClick={handleResendCode} disabled={loading} className="w-full text-xs font-medium text-center disabled:opacity-60" style={{ color: 'var(--accent)' }}>
                {loading ? 'Reenviando...' : '¿No recibió el código? Reenviar'}
              </button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
              <Field label="Nueva contraseña" type="password" placeholder=""
                value={password} error={fieldErrors.password}
                onChange={v => { setPassword(v); setFieldErrors(f => ({ ...f, password: null })) }} />
              <Field label="Confirmar contraseña" type="password" placeholder=""
                value={confirmPassword} error={fieldErrors.confirmPassword}
                onChange={v => { setConfirmPassword(v); setFieldErrors(f => ({ ...f, confirmPassword: null })) }} />
              {error && <ErrorBanner message={error} />}
              <button type="submit" disabled={loading} className="w-full py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 btn-shimmer">
                {loading ? 'Guardando...' : 'Guardar contraseña'}
              </button>
            </form>
          )}

          <p className="text-sm text-center mt-8" style={{ color: 'var(--muted-foreground)' }}>
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>← Volver a iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function ErrorBanner({ message }) {
  return (
    <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}>
      {message}
    </p>
  )
}

function Field({ label, type, placeholder, value, error, onChange, maxLength }) {
  return (
    <FormField label={label} error={error}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
        style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!error) }}
        onFocus={e => { if (!error) e.target.style.borderColor = 'var(--accent)' }}
        onBlur={e => { if (!error) e.target.style.borderColor = 'var(--border)' }}
      />
    </FormField>
  )
}
