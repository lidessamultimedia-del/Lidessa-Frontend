import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth, ROLE_HOME } from '../context/AuthContext'
import { useLMS } from '@/features/lms/context/LMSContext'
import { useToast } from '@/shared/context/ToastContext'
import FormField, { errorInputStyle } from '@/shared/components/FormField'

const EMAIL_RE = /^\S+@\S+\.\S+$/

export default function Register() {
  const [searchParams] = useSearchParams()
  const lms = useLMS()
  const courses = lms.publicCourses
  const preselected = courses.find(c => c.name === searchParams.get('curso'))?.name ?? ''

  const [form, setForm] = useState({ name: '', email: '', phone: '', courseInterest: preselected, password: '', confirmPassword: '', enrollPassword: '' })
  const selectedCourse = courses.find(c => c.name === form.courseInterest) ?? null
  const needsCoursePassword = !!selectedCourse?.selfEnrollment && !!selectedCourse?.requiresPassword
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setFieldErrors(f => ({ ...f, [field]: null }))
  }

  function validate() {
    const errors = {}
    if (!form.name.trim()) errors.name = 'El nombre es obligatorio.'
    if (!form.email) errors.email = 'El correo es obligatorio.'
    else if (!EMAIL_RE.test(form.email)) errors.email = 'Ingrese un correo válido.'
    if (!form.password) errors.password = 'La contraseña es obligatoria.'
    else if (form.password.length < 6) errors.password = 'Debe tener al menos 6 caracteres.'
    if (form.confirmPassword !== form.password) errors.confirmPassword = 'Las contraseñas no coinciden.'
    if (needsCoursePassword && form.enrollPassword !== selectedCourse.password) {
      errors.enrollPassword = 'La contraseña del curso es incorrecta.'
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return
    setLoading(true)
    try {
      const newUser = await register({ name: form.name.trim(), email: form.email, password: form.password, phone: form.phone })
      lms.addDirectoryUser({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: form.phone || undefined,
        role: 'estudiante',
        courseInterest: form.courseInterest || undefined,
      })
      const greeting = `¡Bienvenido, ${newUser.name.split(' ')[0]}!`
      if (selectedCourse?.selfEnrollment) {
        const result = lms.enrollStudent(selectedCourse.id, newUser.id)
        if (result === 'ok') {
          toast('success', greeting, `Tu cuenta fue creada y quedaste inscrito en "${selectedCourse.name}".`)
        } else if (result === 'full') {
          toast('success', greeting, `Tu cuenta fue creada. "${selectedCourse.name}" ya no tiene cupo disponible — un asesor te contactará con otras opciones.`)
        } else {
          toast('success', greeting, 'Tu cuenta fue creada. Pronto un asesor te matriculará en el curso.')
        }
      } else {
        toast('success', greeting, 'Tu cuenta fue creada. Pronto un asesor te matriculará en el curso.')
      }
      navigate(ROLE_HOME[newUser.role] ?? '/')
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta. Intente de nuevo.')
      toast('error', 'No se pudo registrar', err.message || 'Intente de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen grid lg:grid-cols-2 overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* Branded side */}
      <div
        className="hidden lg:flex flex-col justify-between p-8 relative overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(0,81,135,0.75) 0%, rgba(61,49,21,0.8) 40%, rgba(20,20,20,0.9) 100%), url(/assets/fondo_de_login.avif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Link to="/" className="relative flex items-center gap-2.5">
          <img src="/assets/logolidessa.png" alt="Lidessa" style={{ width: 34, height: 34, objectFit: 'contain' }} />
          <span className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'white' }}>
            Lide<span style={{ color: '#84b6f4' }}>ssa</span>
          </span>
        </Link>

        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#84b6f4' }}>
            Portal del estudiante
          </p>
          <h1 className="text-3xl font-black text-white mb-2 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Cree su cuenta y comience a formarse con nosotros
          </h1>
          <p className="text-sm max-w-sm" style={{ color: '#c4dafa' }}>
            Regístrese para acceder al portal del estudiante. Un asesor lo matriculará en el curso de su interés.
          </p>
        </div>

        <p className="relative text-xs" style={{ color: '#6b8bb0' }}>
          © {new Date().getFullYear()} Lidessa. Todos los derechos reservados.
        </p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-6 py-4 overflow-y-auto">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-4">
            <img src="/assets/logolidessa.png" alt="Lidessa" style={{ width: 30, height: 30, objectFit: 'contain' }} />
            <span className="text-lg font-black" style={{ fontFamily: 'var(--font-display)', color: '#005187' }}>
              Lide<span style={{ color: '#4d82bc' }}>ssa</span>
            </span>
          </Link>

          <h2 className="text-xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            Crear cuenta de estudiante
          </h2>
          <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
            Complete sus datos para acceder al portal del estudiante.
          </p>

          <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
            <Field label="Nombre completo" type="text" placeholder="Su nombre y apellido"
              value={form.name} error={fieldErrors.name} onChange={v => set('name', v)} />
            <Field label="Correo electrónico" type="email" placeholder="correo@ejemplo.com"
              value={form.email} error={fieldErrors.email} onChange={v => set('email', v)} />

            <div className="grid grid-cols-2 gap-3">
              <Field label="Teléfono (opcional)" type="tel" placeholder="+57 300 000 0000"
                value={form.phone} error={fieldErrors.phone} onChange={v => set('phone', v)} />
              <FormField label="Curso de interés">
                <select value={form.courseInterest} onChange={e => set('courseInterest', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                  <option value="">No sé aún</option>
                  {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </FormField>
            </div>

            {selectedCourse?.selfEnrollment && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(0,81,135,0.08)', color: '#005187' }}>
                Este curso tiene auto-inscripción: quedarás inscrito de inmediato al crear tu cuenta.
              </p>
            )}
            {needsCoursePassword && (
              <Field label="Contraseña del curso" type="password" placeholder="Provista por Lidessa"
                value={form.enrollPassword} error={fieldErrors.enrollPassword} onChange={v => set('enrollPassword', v)} />
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Contraseña" type="password" placeholder="Mínimo 6 caracteres"
                helperText="Mínimo 6 caracteres."
                value={form.password} error={fieldErrors.password} onChange={v => set('password', v)} />
              <Field label="Confirmar" type="password" placeholder=""
                value={form.confirmPassword} error={fieldErrors.confirmPassword} onChange={v => set('confirmPassword', v)} />
            </div>

            {error && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 btn-shimmer"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="flex items-center justify-between mt-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>← Volver al inicio</Link>
            <span>¿Ya tiene cuenta? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Inicie sesión</Link></span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, type, placeholder, value, error, helperText, onChange }) {
  return (
    <FormField label={label} error={error} helperText={helperText}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
        style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!error) }}
        onFocus={e => { if (!error) e.target.style.borderColor = 'var(--accent)' }}
        onBlur={e => { if (!error) e.target.style.borderColor = 'var(--border)' }}
      />
    </FormField>
  )
}
