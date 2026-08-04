import { useState } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'
import { Plus, Trash, X } from '@/shared/components/Icons'

const MODALITIES = ['Virtual', 'Presencial', 'Semipresencial']

// La imagen se guarda como base64 directo en el navegador (localStorage), que
// tiene un límite total de unos 5-10 MB compartido entre todo el sitio — por
// eso se limita el tamaño de cada foto individual.
const MAX_IMAGE_MB = 1.5
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024

export default function CatalogCourseFormModal({ course, categories = [], onSave, onClose }) {
  const [form, setForm] = useState({
    name: course?.name ?? '',
    description: course?.description ?? '',
    intro: course?.intro ?? '',
    duration: course?.duration ?? '',
    modality: course?.modality ?? MODALITIES[0],
    category: course?.category ?? categories[0] ?? '',
    image: course?.image ?? '',
    certified: course?.certified ?? false,
    objectives: course?.objectives?.length ? course.objectives : [''],
  })
  const [errors, setErrors] = useState({})
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

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
      objectives: form.objectives.map(s => s.trim()).filter(Boolean),
    })
  }

  function updateObjective(idx, value) {
    setForm(f => ({ ...f, objectives: f.objectives.map((o, i) => i === idx ? value : o) }))
  }
  function addObjective() {
    setForm(f => ({ ...f, objectives: [...f.objectives, ''] }))
  }
  function removeObjective(idx) {
    setForm(f => ({ ...f, objectives: f.objectives.filter((_, i) => i !== idx) }))
  }

  function confirmNewCategory() {
    const name = newCategoryName.trim()
    if (name) setForm(f => ({ ...f, category: name }))
    setAddingCategory(false)
    setNewCategoryName('')
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
              {addingCategory ? (
                <div className="flex items-center gap-1.5">
                  <input autoFocus value={newCategoryName} placeholder="Nombre de la categoría"
                    onChange={e => setNewCategoryName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirmNewCategory() } if (e.key === 'Escape') setAddingCategory(false) }}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                  <button type="button" onClick={confirmNewCategory} title="Agregar categoría"
                    className="shrink-0 px-2.5 py-2.5 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: '#005187' }}>
                    OK
                  </button>
                  <button type="button" onClick={() => setAddingCategory(false)} title="Cancelar"
                    className="shrink-0 p-2.5 rounded-lg" style={{ color: 'var(--muted-foreground)' }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <select value={form.category} onChange={e => {
                  if (e.target.value === '__new__') { setAddingCategory(true); return }
                  setForm(f => ({ ...f, category: e.target.value }))
                }}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                  {!categories.includes(form.category) && form.category && (
                    <option value={form.category}>{form.category}</option>
                  )}
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="__new__">+ Nueva categoría…</option>
                </select>
              )}
            </FormField>
          </div>
          <FormField label="Imagen del curso" required error={errors.image}>
            <div className="flex items-center gap-2">
              {form.image ? (
                <img src={form.image} alt="" className="w-11 h-11 object-cover rounded-lg shrink-0" style={{ border: '1px solid var(--border)' }} />
              ) : (
                <div className="w-11 h-11 rounded-lg shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', ...errorInputStyle(!!errors.image) }}>
                  <Plus size={16} style={{ color: 'var(--muted-foreground)' }} />
                </div>
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
            </div>
          </FormField>
          <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground)' }}>
            <input type="checkbox" checked={form.certified} onChange={e => setForm(f => ({ ...f, certified: e.target.checked }))} />
            Este curso otorga certificado
          </label>
          <FormField label="Objetivos del curso">
            <div className="space-y-2">
              {form.objectives.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'linear-gradient(135deg, #005187, #b8860b)', flexShrink: 0 }} />
                  <input value={o} placeholder="Ej. Dominar los fundamentos de las Normas ISO"
                    onChange={e => updateObjective(i, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                  <button type="button" onClick={() => removeObjective(i)}
                    className="shrink-0 p-1.5 rounded-lg transition-colors" style={{ color: '#dc2626' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    aria-label="Eliminar objetivo">
                    <Trash size={12} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addObjective}
                className="text-xs px-2 py-1 rounded-lg font-semibold flex items-center gap-1 transition-opacity hover:opacity-70"
                style={{ color: '#005187' }}>
                <Plus size={11} /> Agregar objetivo
              </button>
            </div>
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
