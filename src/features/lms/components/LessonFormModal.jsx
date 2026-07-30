import { useState } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'

export default function LessonFormModal({ lesson, topics = [], initialTopicId, onSave, onClose }) {
  const [form, setForm] = useState({
    title: lesson?.title ?? '',
    content: lesson?.content ?? '',
    topicId: lesson?.topicId ?? initialTopicId ?? topics[0]?.id ?? '',
  })
  const [errors, setErrors] = useState({})

  function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.title.trim()) errs.title = 'El título de la lección es obligatorio.'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>
        <h3 className="text-lg font-black mb-5" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          {lesson ? 'Editar lección' : 'Nueva lección'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField label="Título" required error={errors.title}>
            <input value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(er => ({ ...er, title: null })) }}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.title) }} />
          </FormField>
          <FormField label="Contenido">
            <textarea rows={5} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
          </FormField>
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
