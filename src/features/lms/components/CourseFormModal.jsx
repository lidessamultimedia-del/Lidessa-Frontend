import { useState } from 'react'
import { errorInputStyle } from '@/shared/components/FormField'
import { Plus } from '@/shared/components/Icons'

const CATEGORIES = ['Liderazgo', 'Formación', 'SST', 'Auditoría', 'Gestión']
const COLORS = ['#005187', '#7c3aed', '#d97706', '#16a34a', '#dc2626', '#0891b2']

// La imagen se guarda como base64 directo en el navegador (localStorage), que
// tiene un límite total de unos 5-10 MB compartido entre todo el sitio — por
// eso se limita el tamaño de cada foto individual.
const MAX_IMAGE_MB = 1.5
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024

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
    color: course?.color ?? COLORS[0],
    image: course?.image ?? '',
    requiresPassword: course?.requiresPassword ?? false,
    password: course?.password ?? '',
    selfEnrollment: course?.selfEnrollment ?? true,
    guestAccess: course?.guestAccess ?? false,
    published: course?.published ?? false,
  })

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'El nombre del curso es obligatorio.'
    if (form.capacity !== '' && Number(form.capacity) < 0) errs.capacity = 'La capacidad no puede ser negativa.'
    if (form.requiresPassword && !form.password.trim()) errs.password = 'Ingrese la contraseña de acceso.'
    if (showTeacherSelect && !form.teacherId) errs.teacherId = 'Seleccione un profesor.'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    onSave({ ...form, capacity: Number(form.capacity) || 0 })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>
        <h3 className="text-lg font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          {course ? 'Editar curso' : 'Nuevo curso'}
        </h3>
        {!course && <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>El curso se crea como borrador. Podrás publicarlo cuando esté listo.</p>}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <section className="space-y-3">
            <SectionTitle>Información general</SectionTitle>
            <Field label="Nombre del curso *" error={errors.name}>
              <input value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: null })) }}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.name) }} />
            </Field>
            <Field label="Descripción corta">
              <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
            </Field>
          </section>

          <section className="space-y-3">
            <SectionTitle>Configuración</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Categoría *">
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Formato del curso *">
                <select value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                  <option value="topics">Por Tópicos</option>
                  <option value="weekly">Semanal</option>
                </select>
              </Field>
              <Field label="Nombre corto">
                <input value={form.shortName} onChange={e => setForm(f => ({ ...f, shortName: e.target.value }))}
                  placeholder="Ej. LIDER-001"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
              </Field>
              <Field label="Capacidad máxima" error={errors.capacity}>
                <input type="number" min={0} value={form.capacity} onChange={e => { setForm(f => ({ ...f, capacity: e.target.value })); setErrors(er => ({ ...er, capacity: null })) }}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.capacity) }} />
              </Field>
            </div>
            <Field label="Color de portada">
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
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
                  style={{ backgroundColor: 'rgba(0,81,135,0.1)', color: '#005187', border: '1px solid rgba(0,81,135,0.2)' }}
                >
                  {form.image ? 'Cambiar' : 'Elegir foto…'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (!file) return
                    if (file.size > MAX_IMAGE_BYTES) {
                      setErrors(er => ({ ...er, image: `La imagen pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. Use una de máximo ${MAX_IMAGE_MB} MB.` }))
                      return
                    }
                    const reader = new FileReader()
                    reader.onload = () => { setForm(f => ({ ...f, image: reader.result })); setErrors(er => ({ ...er, image: null })) }
                    reader.readAsDataURL(file)
                  }} />
                </label>
                {form.image && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, image: '' }))}
                    className="shrink-0 p-2.5 rounded-lg" style={{ color: 'var(--muted-foreground)' }} title="Quitar imagen">
                    <Plus size={14} style={{ transform: 'rotate(45deg)' }} />
                  </button>
                )}
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Si no sube una imagen, se usa el color de portada como fondo.</p>
            </Field>
            {showTeacherSelect && (
              <Field label="Profesor asignado" error={errors.teacherId}>
                <select value={form.teacherId} onChange={e => { setForm(f => ({ ...f, teacherId: e.target.value })); setErrors(er => ({ ...er, teacherId: null })) }}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.teacherId) }}>
                  <option value="">Seleccionar…</option>
                  {(teachers ?? []).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </Field>
            )}
          </section>

          <section className="space-y-2">
            <SectionTitle>Requisitos y acceso</SectionTitle>
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground)' }}>
              <input type="checkbox" checked={form.requiresPassword} onChange={e => setForm(f => ({ ...f, requiresPassword: e.target.checked }))} />
              Requiere contraseña de acceso
            </label>
            {form.requiresPassword && (
              <Field error={errors.password}>
                <input value={form.password} onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(er => ({ ...er, password: null })) }}
                  placeholder="Contraseña"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.password) }} />
              </Field>
            )}
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground)' }}>
              <input type="checkbox" checked={form.selfEnrollment} onChange={e => setForm(f => ({ ...f, selfEnrollment: e.target.checked }))} />
              Auto-inscripción disponible
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground)' }}>
              <input type="checkbox" checked={form.guestAccess} onChange={e => setForm(f => ({ ...f, guestAccess: e.target.checked }))} />
              Permitir acceso de invitados
            </label>
          </section>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: '#005187' }}>
              Guardar
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

function Field({ label, error, children }) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>{label}</label>}
      {children}
      {error && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>⚠ {error}</p>}
    </div>
  )
}
