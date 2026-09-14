import { useState, useRef } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'
import { Plus, Trash, Lock, X, AlertTriangle } from '@/shared/components/Icons'
import { serviceThumbUrl } from '@/features/services/utils/thumbnail'

function existingSections(service) {
  const sections = service?.tabs?.[0]?.sections ?? []
  // La primera sección es la descripción (se edita aparte); el resto son las secciones extra.
  return sections.slice(1).map(s => ({
    heading: s.heading ?? '',
    text: s.text ?? '',
    bullets: (s.bullets ?? []).map(b => b.text ?? ''),
  }))
}

function SectionTitle({ children }) {
  return (
    <p className="text-xs font-bold uppercase tracking-wider pb-1.5 mb-1" style={{ color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>
      {children}
    </p>
  )
}

const inputStyle = { backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }
function focusRing(e) { e.target.style.borderColor = '#4d82bc' }
function blurRing(e) { e.target.style.borderColor = 'var(--border)' }

// La imagen se guarda como base64 directo en memoria (sin backend de
// archivos todavía) — se limita el tamaño de cada foto para no inflar el
// estado de la página.
const MAX_IMAGE_MB = 1.5
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024

export default function ServiceFormModal({ service, categories, onAddCategory, onSave, onClose }) {
  const isMultiTab = (service?.tabs?.length ?? 0) > 1
  const [form, setForm] = useState({
    title: service?.title ?? '',
    category: service?.category ?? categories[0],
    hero: service?.hero ?? '',
    description: service?.description ?? '',
  })
  const [extraSections, setExtraSections] = useState(existingSections(service))
  const [errors, setErrors] = useState({})
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const initialSnapshot = useRef(JSON.stringify({ form, extraSections }))

  function isDirty() {
    return JSON.stringify({ form, extraSections }) !== initialSnapshot.current
  }

  function attemptClose() {
    if (isDirty()) setConfirmDiscard(true)
    else onClose()
  }

  function confirmNewCategory() {
    const name = newCategoryName.trim()
    if (!name) { setAddingCategory(false); return }
    onAddCategory(name)
    setForm(f => ({ ...f, category: name }))
    setNewCategoryName('')
    setAddingCategory(false)
  }

  function addSection() {
    setExtraSections(prev => [...prev, { heading: '', text: '', bullets: [] }])
  }

  function updateSection(i, field, value) {
    setExtraSections(prev => prev.map((s, j) => j === i ? { ...s, [field]: value } : s))
  }

  function removeSection(i) {
    setExtraSections(prev => prev.filter((_, j) => j !== i))
  }

  function addBullet(sectionIdx) {
    setExtraSections(prev => prev.map((s, j) => j === sectionIdx ? { ...s, bullets: [...s.bullets, ''] } : s))
  }

  function updateBullet(sectionIdx, bulletIdx, value) {
    setExtraSections(prev => prev.map((s, j) => j !== sectionIdx ? s : {
      ...s,
      bullets: s.bullets.map((b, k) => k === bulletIdx ? value : b),
    }))
  }

  function removeBullet(sectionIdx, bulletIdx) {
    setExtraSections(prev => prev.map((s, j) => j !== sectionIdx ? s : {
      ...s,
      bullets: s.bullets.filter((_, k) => k !== bulletIdx),
    }))
  }

  function validate() {
    const errs = {}
    if (!form.title.trim()) errs.title = 'El título del servicio es obligatorio.'
    if (!form.description.trim()) errs.description = 'La descripción es obligatoria.'
    if (!form.hero.trim()) errs.hero = 'La imagen es obligatoria.'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    onSave({ ...form, extraSections })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && attemptClose()}>
      <div className="relative rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-6 pb-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h3 className="text-lg font-black flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
              {service ? 'Editar servicio' : 'Nuevo servicio'}
              {service?.locked && <Lock size={14} style={{ color: 'var(--muted-foreground)' }} />}
            </h3>
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              La descripción y las secciones se muestran en la página del servicio, con el mismo diseño que los demás.
            </p>
            {isMultiTab && (
              <p className="text-xs mt-2 leading-relaxed rounded-lg px-3 py-2" style={{ color: '#d97706', backgroundColor: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.25)' }}>
                ⚠ Este servicio tiene varias pestañas en el sitio (además de esta). Si guarda cambios aquí, esas pestañas adicionales se reemplazan por esta única sección.
              </p>
            )}
          </div>
          <button type="button" onClick={attemptClose} aria-label="Cerrar"
            className="shrink-0 p-1.5 rounded-lg transition-colors" style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--muted)'; e.currentTarget.style.color = 'var(--foreground)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden flex-1" noValidate>
        <div className="overflow-y-auto px-6 py-5 space-y-5">
          <div className="space-y-3">
            <SectionTitle>Información general</SectionTitle>
            <FormField label="Título del servicio" required error={errors.title}>
              <input value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(er => ({ ...er, title: null })) }}
                onFocus={focusRing} onBlur={blurRing}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                style={{ ...inputStyle, ...errorInputStyle(!!errors.title) }} />
            </FormField>
          </div>

          <>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Categoría">
                    {addingCategory ? (
                      <div className="flex items-center gap-1.5">
                        <input autoFocus value={newCategoryName} placeholder="Nombre de la categoría"
                          onChange={e => setNewCategoryName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirmNewCategory() } if (e.key === 'Escape') setAddingCategory(false) }}
                          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors" style={inputStyle} />
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
                        onFocus={focusRing} onBlur={blurRing}
                        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors" style={inputStyle}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        <option value="__new__">+ Nueva categoría…</option>
                      </select>
                    )}
                  </FormField>
                  <FormField label="Imagen de portada" required error={errors.hero}>
                    <div className="flex items-center gap-2">
                      {form.hero ? (
                        <img src={serviceThumbUrl(form.hero)} alt="" loading="lazy" decoding="async" className="w-11 h-11 object-cover rounded-lg shrink-0" style={{ border: '1px solid var(--border)' }} />
                      ) : (
                        <div className="w-11 h-11 rounded-lg shrink-0 flex items-center justify-center" style={{ ...inputStyle, ...errorInputStyle(!!errors.hero) }}>
                          <Plus size={16} style={{ color: 'var(--muted-foreground)' }} />
                        </div>
                      )}
                      <label
                        className="flex-1 cursor-pointer text-xs px-3 py-2.5 rounded-lg text-center font-semibold transition-colors"
                        style={{ backgroundColor: 'rgba(0,81,135,0.1)', color: '#005187', border: '1px solid rgba(0,81,135,0.2)' }}
                      >
                        {form.hero ? 'Cambiar' : 'Elegir foto…'}
                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                          const file = e.target.files?.[0]
                          e.target.value = ''
                          if (!file) return
                          if (file.size > MAX_IMAGE_BYTES) {
                            setErrors(er => ({ ...er, hero: `La imagen pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. Use una de máximo ${MAX_IMAGE_MB} MB.` }))
                            return
                          }
                          const reader = new FileReader()
                          reader.onload = () => { setForm(f => ({ ...f, hero: reader.result })); setErrors(er => ({ ...er, hero: null })) }
                          reader.readAsDataURL(file)
                        }} />
                      </label>
                    </div>
                  </FormField>
                </div>
                <FormField label="Descripción" required error={errors.description}>
                  <textarea rows={4} value={form.description}
                    onChange={e => { setForm(f => ({ ...f, description: e.target.value })); setErrors(er => ({ ...er, description: null })) }}
                    onFocus={focusRing} onBlur={blurRing}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none transition-colors"
                    style={{ ...inputStyle, ...errorInputStyle(!!errors.description) }} />
                </FormField>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <SectionTitle>Secciones adicionales (opcional)</SectionTitle>
                </div>
                <div className="space-y-3 -mt-2">
                  {extraSections.map((s, i) => (
                    <div key={i} className="rounded-xl p-3.5 space-y-2.5" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold shrink-0" style={{ color: '#b8860b' }}>#{i + 1}</span>
                        <input value={s.heading} placeholder="Encabezado (Ej. ¿Qué incluye?)"
                          onChange={e => updateSection(i, 'heading', e.target.value)}
                          onFocus={focusRing} onBlur={blurRing}
                          className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-colors"
                          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                        <button type="button" onClick={() => removeSection(i)}
                          className="shrink-0 p-2 rounded-lg transition-colors" style={{ color: '#dc2626' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                          aria-label="Eliminar sección">
                          <Trash size={14} />
                        </button>
                      </div>
                      <textarea rows={2} value={s.text} placeholder="Texto del párrafo (opcional)"
                        onChange={e => updateSection(i, 'text', e.target.value)}
                        onFocus={focusRing} onBlur={blurRing}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none transition-colors"
                        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />

                      <div className="space-y-2 pt-1">
                        {s.bullets.map((b, k) => (
                          <div key={k} className="flex items-center gap-2 pl-1">
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'linear-gradient(135deg, #005187, #b8860b)', flexShrink: 0 }} />
                            <input value={b} placeholder="Texto de la viñeta"
                              onChange={e => updateBullet(i, k, e.target.value)}
                              onFocus={focusRing} onBlur={blurRing}
                              className="flex-1 px-2.5 py-1.5 rounded-lg text-xs outline-none transition-colors"
                              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                            <button type="button" onClick={() => removeBullet(i, k)}
                              className="shrink-0 p-1.5 rounded-lg transition-colors" style={{ color: '#dc2626' }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.1)'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                              aria-label="Eliminar viñeta">
                              <Trash size={12} />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => addBullet(i)}
                          className="text-xs px-2 py-1 rounded-lg font-semibold flex items-center gap-1 ml-1 transition-opacity hover:opacity-70"
                          style={{ color: '#005187' }}>
                          <Plus size={11} /> Agregar viñeta
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addSection}
                    className="w-full text-xs px-3 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    style={{ border: '1px dashed var(--border)', color: '#005187' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,81,135,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Plus size={13} /> Agregar sección
                  </button>
                </div>
              </div>
            </>
        </div>

        <div className="flex gap-3 p-6 pt-4 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <button type="button" onClick={attemptClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors"
            style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
            Cancelar
          </button>
          <button type="submit"
            className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-transform"
            style={{ background: 'linear-gradient(135deg, #005187 0%, #4d82bc 55%, #b8860b 100%)', boxShadow: '0 4px 14px rgba(0,81,135,0.25)' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Guardar
          </button>
        </div>
        </form>

        {confirmDiscard && (
          <div className="absolute inset-0 z-10 flex items-center justify-center px-6 rounded-2xl"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}>
            <div className="rounded-xl p-5 max-w-xs w-full text-center shadow-2xl"
              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', animation: 'fadeUp 0.2s ease' }}>
              <div className="flex justify-center mb-2" style={{ color: '#d97706' }}><AlertTriangle size={28} /></div>
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>¿Descartar cambios?</p>
              <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>Los cambios que hizo aquí no se han guardado.</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setConfirmDiscard(false)}
                  className="flex-1 py-2 rounded-lg text-xs font-bold"
                  style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                  Seguir editando
                </button>
                <button type="button" onClick={onClose}
                  className="flex-1 py-2 rounded-lg text-xs font-bold text-white"
                  style={{ backgroundColor: '#dc2626' }}>
                  Descartar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
