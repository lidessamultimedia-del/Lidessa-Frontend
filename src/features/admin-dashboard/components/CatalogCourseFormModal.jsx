import { useState } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'

const MODALITIES = ['Virtual', 'Presencial', 'Semipresencial']

export default function CatalogCourseFormModal({ course, onSave, onClose }) {
  const [form, setForm] = useState({
    name: course?.name ?? '',
    description: course?.description ?? '',
    intro: course?.intro ?? '',
    duration: course?.duration ?? '',
    modality: course?.modality ?? MODALITIES[0],
    category: course?.category ?? '',
    price: course?.price ?? 'Consultar valor',
    image: course?.image ?? '',
    objectives: (course?.objectives ?? []).join('\n'),
    modules: (course?.modules ?? []).join('\n'),
  })
  const [errors, setErrors] = useState({})

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'El nombre del curso es obligatorio.'
    if (!form.description.trim()) errs.description = 'La descripción corta es obligatoria.'
    if (!form.duration.trim()) errs.duration = 'La duración es obligatoria.'
    if (!form.image.trim()) errs.image = 'La imagen es obligatoria.'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    onSave({
      ...form,
      objectives: form.objectives.split('\n').map(s => s.trim()).filter(Boolean),
      modules: form.modules.split('\n').map(s => s.trim()).filter(Boolean),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>
        <h3 className="text-lg font-black mb-5" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          {course ? 'Editar curso del catálogo' : 'Nuevo curso del catálogo'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField label="Nombre del curso" required error={errors.name}>
            <input value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: null })) }}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.name) }} />
          </FormField>
          <FormField label="Descripción corta" required error={errors.description}>
            <textarea rows={2} value={form.description} onChange={e => { setForm(f => ({ ...f, description: e.target.value })); setErrors(er => ({ ...er, description: null })) }}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.description) }} />
          </FormField>
          <FormField label="Introducción (texto largo de la página del curso)">
            <textarea rows={3} value={form.intro} onChange={e => setForm(f => ({ ...f, intro: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Duración" required error={errors.duration}>
              <input value={form.duration} placeholder="Ej. 40 horas"
                onChange={e => { setForm(f => ({ ...f, duration: e.target.value })); setErrors(er => ({ ...er, duration: null })) }}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.duration) }} />
            </FormField>
            <FormField label="Modalidad">
              <select value={form.modality} onChange={e => setForm(f => ({ ...f, modality: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                {MODALITIES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </FormField>
            <FormField label="Categoría">
              <input value={form.category} placeholder="Ej. Gestión"
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
            </FormField>
            <FormField label="Precio">
              <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
            </FormField>
          </div>
          <FormField label="Imagen (ruta en /assets)" required error={errors.image}>
            <input value={form.image} placeholder="/assets/nombre.png"
              onChange={e => { setForm(f => ({ ...f, image: e.target.value })); setErrors(er => ({ ...er, image: null })) }}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.image) }} />
          </FormField>
          <FormField label="Objetivos (uno por línea)">
            <textarea rows={4} value={form.objectives} onChange={e => setForm(f => ({ ...f, objectives: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
          </FormField>
          <FormField label="Módulos (uno por línea)">
            <textarea rows={4} value={form.modules} onChange={e => setForm(f => ({ ...f, modules: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
          </FormField>
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
