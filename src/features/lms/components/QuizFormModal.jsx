import { useState } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'
import { Plus, Trash } from '@/shared/components/Icons'

function newQuestion() {
  return { id: `tmp${Date.now()}${Math.random().toString(36).slice(2, 6)}`, text: '', options: ['', ''], correctIndex: 0 }
}

export default function QuizFormModal({ quiz, topics = [], initialTopicId, onSave, onClose }) {
  const [form, setForm] = useState({
    title: quiz?.title ?? '',
    description: quiz?.description ?? '',
    dueDate: quiz?.dueDate ?? '',
    topicId: quiz?.topicId ?? initialTopicId ?? topics[0]?.id ?? '',
    questions: quiz?.questions?.length ? quiz.questions.map(q => ({ ...q, options: [...q.options] })) : [newQuestion()],
  })
  const [errors, setErrors] = useState({})

  function updateQuestion(qi, data) {
    setForm(f => ({ ...f, questions: f.questions.map((q, i) => i === qi ? { ...q, ...data } : q) }))
  }
  function updateOption(qi, oi, value) {
    setForm(f => ({
      ...f,
      questions: f.questions.map((q, i) => i === qi ? { ...q, options: q.options.map((o, j) => j === oi ? value : o) } : q),
    }))
  }
  function addOption(qi) {
    setForm(f => ({
      ...f,
      questions: f.questions.map((q, i) => i === qi && q.options.length < 6 ? { ...q, options: [...q.options, ''] } : q),
    }))
  }
  function removeOption(qi, oi) {
    setForm(f => ({
      ...f,
      questions: f.questions.map((q, i) => {
        if (i !== qi || q.options.length <= 2) return q
        const options = q.options.filter((_, j) => j !== oi)
        const correctIndex = q.correctIndex === oi ? 0 : q.correctIndex > oi ? q.correctIndex - 1 : q.correctIndex
        return { ...q, options, correctIndex }
      }),
    }))
  }
  function addQuestion() {
    setForm(f => ({ ...f, questions: [...f.questions, newQuestion()] }))
  }
  function removeQuestion(qi) {
    setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== qi) }))
  }

  function validate() {
    const errs = {}
    if (!form.title.trim()) errs.title = 'El título del examen es obligatorio.'
    if (!form.dueDate) errs.dueDate = 'Seleccione la fecha límite.'
    if (form.questions.length === 0) errs.questions = 'Agregue al menos una pregunta.'
    else if (form.questions.some(q => !q.text.trim() || q.options.some(o => !o.trim()))) {
      errs.questions = 'Complete el texto de cada pregunta y todas sus opciones.'
    }
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    onSave({
      title: form.title, description: form.description, dueDate: form.dueDate, topicId: form.topicId,
      questions: form.questions.map(({ id, text, options, correctIndex }) => ({ id, text: text.trim(), options: options.map(o => o.trim()), correctIndex })),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rounded-2xl p-6 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>
        <h3 className="text-lg font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          {quiz ? 'Editar examen' : 'Nuevo examen'}
        </h3>
        <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>
          Los estudiantes responden en línea y se califica automáticamente al entregar.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField label="Título" required error={errors.title}>
            <input value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(er => ({ ...er, title: null })) }}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.title) }} />
          </FormField>
          <FormField label="Descripción">
            <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Fecha límite" required error={errors.dueDate}>
              <input type="date" value={form.dueDate} onChange={e => { setForm(f => ({ ...f, dueDate: e.target.value })); setErrors(er => ({ ...er, dueDate: null })) }}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.dueDate) }} />
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
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Preguntas</p>
              <button type="button" onClick={addQuestion}
                className="text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                <Plus size={12} /> Pregunta
              </button>
            </div>
            {errors.questions && <p className="text-xs" style={{ color: '#dc2626' }}>⚠ {errors.questions}</p>}

            {form.questions.map((q, qi) => (
              <div key={q.id} className="rounded-xl p-3.5 space-y-2.5" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold shrink-0" style={{ color: 'var(--muted-foreground)' }}>{qi + 1}.</span>
                  <input value={q.text} onChange={e => updateQuestion(qi, { text: e.target.value })}
                    placeholder="Escriba la pregunta…"
                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                  {form.questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(qi)} title="Eliminar pregunta"
                      className="shrink-0 p-2 rounded-lg" style={{ color: '#dc2626' }}>
                      <Trash size={14} />
                    </button>
                  )}
                </div>
                <div className="space-y-1.5 pl-5">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input type="radio" name={`correct-${q.id}`} checked={q.correctIndex === oi}
                        onChange={() => updateQuestion(qi, { correctIndex: oi })} title="Marcar como respuesta correcta" />
                      <input value={opt} onChange={e => updateOption(qi, oi, e.target.value)}
                        placeholder={`Opción ${oi + 1}`}
                        className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
                        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                      {q.options.length > 2 && (
                        <button type="button" onClick={() => removeOption(qi, oi)} title="Quitar opción"
                          className="shrink-0 p-1.5 rounded-lg" style={{ color: 'var(--muted-foreground)' }}>
                          <Trash size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                  {q.options.length < 6 && (
                    <button type="button" onClick={() => addOption(qi)}
                      className="text-xs font-semibold pl-6" style={{ color: '#005187' }}>
                      + Agregar opción
                    </button>
                  )}
                </div>
                <p className="text-xs pl-5" style={{ color: 'var(--muted-foreground)' }}>Marque con el punto la opción correcta.</p>
              </div>
            ))}
          </div>

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
