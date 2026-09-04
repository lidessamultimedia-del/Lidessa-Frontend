import { useState } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'
import { Upload, FileText, X } from '@/shared/components/Icons'

// El material se guarda como base64 directo en memoria (sin backend de
// archivos todavía) — se limita el tamaño de cada archivo para no inflar el
// estado de la página.
const MAX_FILE_MB = 3
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024

export default function LessonFormModal({ lesson, topics = [], initialTopicId, onSave, onClose }) {
  const [form, setForm] = useState({
    title: lesson?.title ?? '',
    content: lesson?.content ?? '',
    topicId: lesson?.topicId ?? initialTopicId ?? topics[0]?.id ?? '',
    fileName: lesson?.fileName ?? '',
    fileData: lesson?.fileData ?? '',
    fileSize: lesson?.fileSize ?? 0,
    publishAt: lesson?.publishAt ?? '',
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
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
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
          <FormField label="Material adjunto (PDF, Word, PowerPoint, Excel, imagen)" error={errors.file}>
            {form.fileName ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                <FileText size={16} style={{ color: '#005187' }} />
                <span className="text-sm flex-1 truncate" style={{ color: 'var(--foreground)' }}>{form.fileName}</span>
                <span className="text-xs shrink-0" style={{ color: 'var(--muted-foreground)' }}>{(form.fileSize / 1024).toFixed(0)} KB</span>
                <button type="button" onClick={() => setForm(f => ({ ...f, fileName: '', fileData: '', fileSize: 0 }))}
                  className="shrink-0 p-1 rounded" style={{ color: '#dc2626' }} title="Quitar archivo">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label
                className="flex items-center gap-2 cursor-pointer px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={{ backgroundColor: 'rgba(0,81,135,0.1)', color: '#005187', border: '1px solid rgba(0,81,135,0.2)' }}
              >
                <Upload size={15} /> Subir archivo…
                <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/*" className="hidden" onChange={e => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (!file) return
                  if (file.size > MAX_FILE_BYTES) {
                    setErrors(er => ({ ...er, file: `El archivo pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. Use uno de máximo ${MAX_FILE_MB} MB.` }))
                    return
                  }
                  const reader = new FileReader()
                  reader.onload = () => {
                    setForm(f => ({ ...f, fileName: file.name, fileData: reader.result, fileSize: file.size }))
                    setErrors(er => ({ ...er, file: null }))
                  }
                  reader.readAsDataURL(file)
                }} />
              </label>
            )}
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
