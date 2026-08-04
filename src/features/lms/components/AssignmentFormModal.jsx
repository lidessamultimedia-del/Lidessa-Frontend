import { useState } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'
import { Upload, FileText, X } from '@/shared/components/Icons'
import { MAX_GRADE, PASS_THRESHOLD } from '../context/LMSContext'

// Tareas viejas guardaron la fecha límite como solo-fecha ("2026-08-02"); el
// input datetime-local necesita también la hora o se muestra vacío al editar.
function toDatetimeLocal(value) {
  if (!value) return ''
  return value.includes('T') ? value : `${value}T00:00`
}

// El material se guarda como base64 directo en el navegador (localStorage),
// que tiene un límite total de unos 5-10 MB compartido entre todo el sitio —
// por eso se limita el tamaño de cada archivo individual.
const MAX_FILE_MB = 3
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024

export default function AssignmentFormModal({ assignment, topics = [], initialTopicId, onSave, onClose }) {
  const [form, setForm] = useState({
    title: assignment?.title ?? '',
    description: assignment?.description ?? '',
    dueDate: toDatetimeLocal(assignment?.dueDate),
    topicId: assignment?.topicId ?? initialTopicId ?? topics[0]?.id ?? '',
    publishAt: assignment?.publishAt ?? '',
    fileName: assignment?.fileName ?? '',
    fileData: assignment?.fileData ?? '',
    fileSize: assignment?.fileSize ?? 0,
  })
  const [errors, setErrors] = useState({})

  function validate() {
    const errs = {}
    if (!form.title.trim()) errs.title = 'El título de la tarea es obligatorio.'
    if (!form.dueDate) errs.dueDate = 'Seleccione la fecha límite.'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    onSave({ ...form, maxScore: MAX_GRADE })
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
          <FormField label="Archivo adjunto (opcional — guía, plantilla, rúbrica)" error={errors.file}>
            {form.fileName ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                <FileText size={16} style={{ color: '#7c3aed' }} />
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
                style={{ backgroundColor: 'rgba(124,58,237,0.1)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.2)' }}
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
          <FormField label="Fecha y hora límite" required error={errors.dueDate} helperText="Puedes poner una hora exacta — ej. de un día para otro, o en unas horas. Después de esta hora ya no le aparece al estudiante.">
            <input type="datetime-local" value={form.dueDate} onChange={e => { setForm(f => ({ ...f, dueDate: e.target.value })); setErrors(er => ({ ...er, dueDate: null })) }}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!errors.dueDate) }} />
          </FormField>
          <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
            El puntaje máximo de toda actividad es {MAX_GRADE} (con decimales) — se aprueba con {PASS_THRESHOLD.toFixed(1)} o más.
          </p>
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
