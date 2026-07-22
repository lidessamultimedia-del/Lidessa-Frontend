import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '@/shared/context/ToastContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      const stored = localStorage.getItem('lidessa_user')
      const user = stored ? JSON.parse(stored) : null
      toast('success', `¡Bienvenido${user?.name ? ', ' + user.name.split(' ')[0] : ''}!`, 'Has iniciado sesión correctamente.')
      navigate('/admin')
    } catch {
      setError('Correo o contraseña incorrectos. Intente de nuevo.')
      toast('error', 'Credenciales incorrectas', 'Verifique su correo y contraseña.')
    } finally {
      setLoading(false)
    }
  }

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
            Su aliado en excelencia organizacional
          </h1>
          <p className="text-sm max-w-sm" style={{ color: '#c4dafa' }}>
            Ingrese para gestionar servicios, contenido y solicitudes desde un solo lugar.
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
            Iniciar sesión
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>
            Ingrese sus credenciales para acceder a su cuenta.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Correo electrónico" type="email" placeholder="correo@empresa.com"
              value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
            <Field label="Contraseña" type="password" placeholder=""
              value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} />
            <div className="text-right">
              <button type="button" className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                ¿Olvidó su contraseña?
              </button>
            </div>
            {error && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}>
                {error}
              </p>
            )}
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Demo: <code>admin@lidessa.co</code> / <code>admin123</code>
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 btn-shimmer"
            >
              {loading ? 'Procesando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-sm text-center mt-8" style={{ color: 'var(--muted-foreground)' }}>
            <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>← Volver al inicio</Link>
          </p>
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
        required
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
        style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  )
}
