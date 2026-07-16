import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '@/shared/context/ToastContext'

export default function AuthModal({ mode: initialMode, onClose }) {
  const [mode, setMode] = useState(initialMode)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (mode === 'register') {
      if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return }
      setLoading(true)
      await new Promise(r => setTimeout(r, 1000))
      setLoading(false)
      toast('success', '¡Cuenta creada!', 'Recibirás un correo de confirmación en breve.')
      onClose()
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.password)
      const stored = localStorage.getItem('lidessa_user')
      const user = stored ? JSON.parse(stored) : null
      toast('success', `¡Bienvenido${user?.name ? ', ' + user.name.split(' ')[0] : ''}!`, 'Has iniciado sesión correctamente.')
      onClose()
      navigate(user?.role === 'admin' ? '/admin' : '/dashboard')
    } catch {
      setError('Correo o contraseña incorrectos. Intente de nuevo.')
      toast('error', 'Credenciales incorrectas', 'Verifique su correo y contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ backgroundColor: 'var(--card)', animation: 'fadeUp 0.3s ease' }}
      >
        {/* Header */}
        <div className="p-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ background: 'linear-gradient(135deg, #005187, #4d82bc)' }}>
                L
              </div>
              <span className="font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>Lidessa</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--muted)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >×</button>
          </div>
          <div className="flex rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
            {['login', 'register'].map(m => (
              <button key={m}
                className="flex-1 py-2.5 text-sm font-bold transition-all"
                style={{
                  backgroundColor: mode === m ? 'var(--primary)' : 'transparent',
                  color: mode === m ? 'white' : 'var(--muted-foreground)',
                  borderRadius: 6,
                }}
                onClick={() => { setMode(m); setError('') }}
              >
                {m === 'login' ? 'Iniciar sesión' : 'Registrarme'}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <Field label="Nombre completo" type="text" placeholder="Ej: María García López"
                value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
            )}
            <Field label="Correo electrónico" type="email" placeholder="correo@empresa.com"
              value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
            {mode === 'register' && (
              <Field label="Teléfono / WhatsApp" type="tel" placeholder="+57 300 000 0000"
                value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
            )}
            <Field label="Contraseña" type="password" placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : ''}
              value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} />
            {mode === 'register' && (
              <Field label="Confirmar contraseña" type="password" placeholder="Repita su contraseña"
                value={form.confirm} onChange={v => setForm(f => ({ ...f, confirm: v }))} />
            )}
            {mode === 'login' && (
              <div className="text-right">
                <button type="button" className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                  ¿Olvidó su contraseña?
                </button>
              </div>
            )}
            {error && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}>
                {error}
              </p>
            )}
            {mode === 'login' && (
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Demo: <code>cliente@lidessa.co</code> / <code>123456</code> &nbsp;·&nbsp; Admin: <code>admin@lidessa.co</code> / <code>admin123</code>
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {loading ? 'Procesando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
            {mode === 'register' && (
              <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
                Al registrarse acepta nuestra{' '}
                <button type="button" className="underline" style={{ color: 'var(--accent)' }}>política de privacidad</button>
                {' '}y el{' '}
                <button type="button" className="underline" style={{ color: 'var(--accent)' }}>tratamiento de datos personales</button>.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

function Field({ label, type, placeholder, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        required={type !== 'tel'}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
        style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  )
}
