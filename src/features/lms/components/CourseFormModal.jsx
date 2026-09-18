import { useState, useEffect, useRef, forwardRef } from 'react'
import { errorInputStyle } from '@/shared/components/FormField'
import { Plus, Eye, EyeOff } from '@/shared/components/Icons'
import { COURSE_COLORS, COURSE_COLOR_NAMES } from '../utils/courseCard'

const CATEGORIES = ['Liderazgo', 'Formación', 'SST', 'Auditoría', 'Gestión']

// La imagen se guarda como base64 directo en memoria (sin backend de
// archivos todavía) — se limita el tamaño de cada foto para no inflar el
// estado de la página.
const MAX_IMAGE_MB = 3
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024
const MAX_IMAGE_DIMENSION = 1600
const MIN_COMPRESSION_QUALITY = 0.3
const TRANSPARENCY_CAPABLE_TYPES = ['image/png', 'image/webp', 'image/gif']

function drawResizedToCanvas(img, width, height, { whiteBackground = false } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (whiteBackground) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
  }
  ctx.drawImage(img, 0, 0, width, height)
  return canvas
}

// Redimensiona y comprime la imagen en un <canvas> hasta que quepa bajo MAX_IMAGE_BYTES,
// en vez de simplemente rechazar fotos grandes (la mayoría de fotos de celular las exceden).
function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      let { width, height } = img
      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        const scale = MAX_IMAGE_DIMENSION / Math.max(width, height)
        width = Math.round(width * scale)
        height = Math.round(height * scale)
      }

      // PNG/WebP/GIF pueden tener transparencia: si el redimensionado ya cabe en el
      // límite, se conserva sin pasar por JPEG (que rellenaría lo transparente de negro).
      if (TRANSPARENCY_CAPABLE_TYPES.includes(file.type)) {
        const pngDataUrl = drawResizedToCanvas(img, width, height).toDataURL('image/png')
        if (pngDataUrl.length * 0.75 <= MAX_IMAGE_BYTES) {
          resolve(pngDataUrl)
          return
        }
      }

      // El PNG no cupo (o el original no tenía transparencia): se convierte a JPEG,
      // pintando fondo blanco antes de dibujar para que un área transparente no
      // termine en negro sólido (JPEG no soporta canal alfa).
      const canvas = drawResizedToCanvas(img, width, height, { whiteBackground: true })
      let quality = 0.9
      let dataUrl = canvas.toDataURL('image/jpeg', quality)
      while (dataUrl.length * 0.75 > MAX_IMAGE_BYTES && quality > MIN_COMPRESSION_QUALITY) {
        quality -= 0.1
        dataUrl = canvas.toDataURL('image/jpeg', quality)
      }
      if (dataUrl.length * 0.75 > MAX_IMAGE_BYTES) {
        reject(new Error(`La imagen sigue pesando más de ${MAX_IMAGE_MB} MB incluso comprimida. Pruebe con otra foto.`))
        return
      }
      resolve(dataUrl)
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('No se pudo procesar la imagen. Pruebe con otro archivo.'))
    }
    img.src = objectUrl
  })
}

const NAME_MAX_LENGTH = 100
const DESCRIPTION_MAX_LENGTH = 300
const SHORT_NAME_MAX_LENGTH = 20
const SHORT_NAME_PATTERN = /^[A-Z0-9]+(-[A-Z0-9]+)*$/i
const PASSWORD_MIN_LENGTH = 6
const MAX_CAPACITY = 10000
const CHECKBOX_CLASS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005187] focus-visible:rounded-sm'

export default function CourseFormModal({ course, teachers, showTeacherSelect = false, onSave, onClose }) {
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    name: course?.name ?? '',
    shortName: course?.shortName ?? '',
    description: course?.description ?? '',
    category: course?.category ?? CATEGORIES[0],
    teacherId: course?.teacherId ?? teachers?.[0]?.id ?? '',
    format: course?.format ?? 'topics',
    capacity: course?.capacity ?? 100,
    color: course?.color ?? COURSE_COLORS[0],
    image: course?.image ?? '',
    requiresPassword: course?.requiresPassword ?? false,
    password: course?.password ?? '',
    selfEnrollment: course?.selfEnrollment ?? true,
    guestAccess: course?.guestAccess ?? false,
    published: course?.published ?? false,
  })
  const initialFormRef = useRef(form)
  const isMountedRef = useRef(true)
  const modalRef = useRef(null)
  const nameInputRef = useRef(null)
  const [imageProcessing, setImageProcessing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => () => { isMountedRef.current = false }, [])

  // Foco inicial en el primer campo y bloqueo de scroll del body mientras el modal está abierto.
  useEffect(() => {
    nameInputRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [])

  function clearError(field) {
    setErrors(er => ({ ...er, [field]: null }))
  }

  function handleClose() {
    const isDirty = JSON.stringify(form) !== JSON.stringify(initialFormRef.current)
    if (isDirty && !window.confirm('Hay cambios sin guardar. ¿Deseas cerrar sin guardarlos?')) return
    onClose()
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'El nombre del curso es obligatorio.'
    if (form.shortName.trim() && !SHORT_NAME_PATTERN.test(form.shortName.trim())) {
      errs.shortName = 'Use solo letras, números y guiones (ej. LIDER-001).'
    }
    if (form.capacity === '' || Number(form.capacity) <= 0) {
      errs.capacity = 'La capacidad debe ser mayor a 0.'
    } else if (Number(form.capacity) > MAX_CAPACITY) {
      errs.capacity = `La capacidad no puede superar ${MAX_CAPACITY.toLocaleString('es-CO')}.`
    }
    if (form.requiresPassword) {
      if (!form.password.trim()) errs.password = 'Ingrese la contraseña de acceso.'
      else if (form.password.trim().length < PASSWORD_MIN_LENGTH) errs.password = `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`
    }
    if (showTeacherSelect && !form.teacherId) errs.teacherId = 'Seleccione un profesor.'
    return errs
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        handleClose()
        return
      }
      if (e.key !== 'Tab' || !modalRef.current) return
      const focusable = modalRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [form, onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    if (isSubmitting) return
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setIsSubmitting(true)
    try {
      await onSave({ ...form, name: form.name.trim(), shortName: form.shortName.trim(), capacity: Number(form.capacity) || 0 })
    } finally {
      if (isMountedRef.current) setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && handleClose()}>
      <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="course-form-modal-title"
        className="rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>
        <h3 id="course-form-modal-title" className="text-lg font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          {course ? 'Editar curso' : 'Nuevo curso'}
        </h3>
        {!course && <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>El curso se crea como borrador. Podrás publicarlo cuando esté listo.</p>}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <section className="space-y-3">
            <SectionTitle>Información general</SectionTitle>
            <Field label="Nombre del curso *" error={errors.name} fieldId="course-name">
              <Input id="course-name" ref={nameInputRef} value={form.name} maxLength={NAME_MAX_LENGTH} error={errors.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); clearError('name') }} />
              <p className="text-xs mt-1 text-right" style={{ color: 'var(--muted-foreground)' }}>{form.name.length}/{NAME_MAX_LENGTH}</p>
            </Field>
            <Field label="Descripción corta" fieldId="course-description">
              <Textarea id="course-description" rows={3} value={form.description} maxLength={DESCRIPTION_MAX_LENGTH}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <p className="text-xs mt-1 text-right" style={{ color: 'var(--muted-foreground)' }}>{form.description.length}/{DESCRIPTION_MAX_LENGTH}</p>
            </Field>
          </section>

          <section className="space-y-3">
            <SectionTitle>Configuración</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Categoría *" fieldId="course-category">
                <Select id="course-category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Formato del curso *" fieldId="course-format">
                <Select id="course-format" value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))}>
                  <option value="topics">Por Tópicos</option>
                  <option value="weekly">Semanal</option>
                </Select>
              </Field>
              <Field label="Nombre corto" error={errors.shortName} fieldId="course-short-name">
                <Input id="course-short-name" value={form.shortName} maxLength={SHORT_NAME_MAX_LENGTH} placeholder="Ej. LIDER-001" error={errors.shortName}
                  onChange={e => { setForm(f => ({ ...f, shortName: e.target.value })); clearError('shortName') }} />
              </Field>
              <Field label="Capacidad máxima *" error={errors.capacity} fieldId="course-capacity">
                <Input id="course-capacity" type="number" min={1} max={MAX_CAPACITY} value={form.capacity} error={errors.capacity}
                  onChange={e => { setForm(f => ({ ...f, capacity: e.target.value })); clearError('capacity') }} />
              </Field>
            </div>
            <Field label="Color de portada">
              <div className="flex gap-2">
                {COURSE_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                    title={COURSE_COLOR_NAMES[c] ?? c}
                    aria-label={`Color de portada ${COURSE_COLOR_NAMES[c] ?? c}${form.color === c ? ' (seleccionado)' : ''}`}
                    aria-pressed={form.color === c}
                    className="w-8 h-8 rounded-full shrink-0"
                    style={{ backgroundColor: c, border: form.color === c ? '3px solid var(--foreground)' : '1px solid var(--border)' }} />
                ))}
              </div>
            </Field>
            <Field label="Imagen de portada (opcional)" error={errors.image}>
              <div className="flex items-center gap-2">
                {form.image ? (
                  <img src={form.image} alt="" className="w-11 h-11 object-cover rounded-lg shrink-0" style={{ border: '1px solid var(--border)' }} />
                ) : (
                  <div className="w-11 h-11 rounded-lg shrink-0" style={{ backgroundColor: form.color }} />
                )}
                <label
                  className="flex-1 cursor-pointer text-xs px-3 py-2.5 rounded-lg text-center font-semibold transition-colors"
                  style={{ backgroundColor: 'rgba(0,81,135,0.1)', color: '#005187', border: '1px solid rgba(0,81,135,0.2)', opacity: imageProcessing ? 0.6 : 1, pointerEvents: imageProcessing ? 'none' : 'auto' }}
                >
                  {imageProcessing ? 'Procesando…' : (form.image ? 'Cambiar' : 'Elegir foto…')}
                  <input type="file" accept="image/*" className="hidden" disabled={imageProcessing} onChange={async e => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (!file) return
                    clearError('image')
                    if (file.size <= MAX_IMAGE_BYTES) {
                      const reader = new FileReader()
                      reader.onload = () => setForm(f => ({ ...f, image: reader.result }))
                      reader.readAsDataURL(file)
                      return
                    }
                    setImageProcessing(true)
                    try {
                      const compressed = await compressImageFile(file)
                      setForm(f => ({ ...f, image: compressed }))
                    } catch (err) {
                      setErrors(er => ({ ...er, image: err.message }))
                    } finally {
                      if (isMountedRef.current) setImageProcessing(false)
                    }
                  }} />
                </label>
                {form.image && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, image: '' }))}
                    className="shrink-0 p-2.5 rounded-lg" style={{ color: 'var(--muted-foreground)' }} title="Quitar imagen" aria-label="Quitar imagen">
                    <Plus size={14} style={{ transform: 'rotate(45deg)' }} />
                  </button>
                )}
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Si no sube una imagen, se usa el color de portada como fondo. Las fotos de más de {MAX_IMAGE_MB} MB se comprimen automáticamente.</p>
            </Field>
            {showTeacherSelect && (
              <Field label="Profesor asignado" error={errors.teacherId} fieldId="course-teacher">
                <Select id="course-teacher" value={form.teacherId} error={errors.teacherId}
                  onChange={e => { setForm(f => ({ ...f, teacherId: e.target.value })); clearError('teacherId') }}>
                  <option value="">Seleccionar…</option>
                  {(teachers ?? []).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
              </Field>
            )}
          </section>

          <section className="space-y-2">
            <SectionTitle>Requisitos y acceso</SectionTitle>
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground)' }}>
              <input type="checkbox" className={CHECKBOX_CLASS} style={{ accentColor: '#005187' }} checked={form.requiresPassword} onChange={e => {
                const checked = e.target.checked
                setForm(f => ({ ...f, requiresPassword: checked, password: checked ? f.password : '' }))
                if (!checked) { clearError('password'); setShowPassword(false) }
              }} />
              Requiere contraseña de acceso
            </label>
            {form.requiresPassword && (
              <Field error={errors.password} fieldId="course-password">
                <div className="relative">
                  <Input id="course-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                    value={form.password} minLength={PASSWORD_MIN_LENGTH} error={errors.password}
                    placeholder={`Contraseña (mínimo ${PASSWORD_MIN_LENGTH} caracteres)`}
                    style={{ paddingRight: '2.5rem' }}
                    onChange={e => { setForm(f => ({ ...f, password: e.target.value })); clearError('password') }} />
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded"
                    style={{ color: 'var(--muted-foreground)' }}
                    title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
            )}
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground)' }}>
              <input type="checkbox" className={CHECKBOX_CLASS} style={{ accentColor: '#005187' }} checked={form.selfEnrollment} onChange={e => setForm(f => ({ ...f, selfEnrollment: e.target.checked }))} />
              Auto-inscripción disponible
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground)' }}>
              <input type="checkbox" className={CHECKBOX_CLASS} style={{ accentColor: '#005187' }} checked={form.guestAccess} onChange={e => setForm(f => ({ ...f, guestAccess: e.target.checked }))} />
              Permitir acceso de invitados
            </label>
          </section>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClose} disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--foreground)', opacity: isSubmitting ? 0.6 : 1 }}>
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting || imageProcessing}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: '#005187', opacity: (isSubmitting || imageProcessing) ? 0.7 : 1, cursor: isSubmitting ? 'wait' : 'pointer' }}>
              {isSubmitting ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <p className="text-xs font-bold uppercase tracking-wider pb-1" style={{ color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>
      {children}
    </p>
  )
}

function Field({ label, error, fieldId, children }) {
  const errorId = fieldId ? `${fieldId}-error` : undefined
  return (
    <div>
      {label && <label htmlFor={fieldId} className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>{label}</label>}
      {children}
      {error && <p id={errorId} role="alert" className="text-xs mt-1" style={{ color: '#dc2626' }}>⚠ {error}</p>}
    </div>
  )
}

const Input = forwardRef(function Input({ error, id, className = '', style, ...props }, ref) {
  return (
    <input {...props} ref={ref} id={id}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={error && id ? `${id}-error` : undefined}
      className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none ${className}`}
      style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!error), ...style }} />
  )
})

function Select({ error, id, children, ...props }) {
  return (
    <select {...props} id={id}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={error && id ? `${id}-error` : undefined}
      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
      style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!error) }}>
      {children}
    </select>
  )
}

function Textarea({ error, id, ...props }) {
  return (
    <textarea {...props} id={id}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={error && id ? `${id}-error` : undefined}
      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
      style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!error) }} />
  )
}
