import { useState } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'

export default function AssignmentFormModal({ assignment, topics = [], initialTopicId, onSave, onClose }) {
  const [form, setForm] = useState({
    title: assignment?.title ?? '',
    description: assignment?.description ?? '',
    dueDate: assignment?.dueDate ?? '',
    maxScore: assignment?.maxScore ?? 100,
    topicId: assignment?.topicId ?? initialTopicId ?? topics[0]?.id ?? '',
  })
  const [errors, setErrors] = useState({})

  function validate() {
    const errs = {}
    if (!form.title.trim()) errs.title = 'El título de la tarea es obligatorio.'
    if (!form.dueDate) errs.dueDate = 'Seleccione la fecha límite.'
    if (!form.maxScore || Number(form.maxScore) < 1) errs.maxScore = 'Debe ser al menos 1 punto.'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    onSave({ ...form, maxScore: Number(form.maxScore) || 100 })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>
        <h3 className="text-lg font-black mb-5" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          {assignment ? 'Editar tarea' : 'Nueva tarea'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField label="Título" required error={errors.title}>
            <input value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(er => ({ ...er, title: null })) }}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.title) }} />
          </FormField>
          <FormField label="Descripción">
            <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Fecha límite" required error={errors.dueDate}>
              <input type="date" value={form.dueDate} onChange={e => { setForm(f => ({ ...f, dueDate: e.target.value })); setErrors(er => ({ ...er, dueDate: null })) }}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.dueDate) }} />
            </FormField>
            <FormField label="Puntaje máximo" error={errors.maxScore}>
              <input type="number" min={1} value={form.maxScore} onChange={e => { setForm(f => ({ ...f, maxScore: e.target.value })); setErrors(er => ({ ...er, maxScore: null })) }}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.maxScore) }} />
            </FormField>
          </div>
          {topics.length > 0 && (
            <FormField label="Tema">
              <select value={form.topicId} onChange={e => setForm(f => ({ ...f, topicId: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </FormField>
          )}
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
