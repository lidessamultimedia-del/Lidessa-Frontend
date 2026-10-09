import { useState } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'

export default function CourseSettingsForm({ course, onSave }) {
  const [form, setForm] = useState({
    name: course.name, shortName: course.shortName ?? '', category: course.category,
    visible: course.visible ?? true,
    description: course.description ?? '', format: course.format ?? 'topics',
    completionTrackingEnabled: course.completionTrackingEnabled ?? true,
  })
  const [nameError, setNameError] = useState('')
  const wordCount = form.description.trim() ? form.description.trim().split(/\s+/).length : 0

  return (
    <div style={{ maxWidth: 640 }}>
      <form onSubmit={e => {
        e.preventDefault()
        if (!form.name.trim()) { setNameError('El nombre del curso es obligatorio.'); return }
        setNameError('')
        onSave(form)
      }} className="space-y-6" noValidate>
        <section className="space-y-3">
          <SectionHeading>General</SectionHeading>
          <FormField label="Nombre completo del curso" required error={nameError}>
            <input value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setNameError('') }}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!nameError) }} />
          </FormField>
          <SettingField label="Nombre corto del curso">
            <input value={form.shortName} onChange={e => setForm(f => ({ ...f, shortName: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
          </SettingField>
          <SettingField label="Visibilidad del curso">
            <select value={form.visible ? 'show' : 'hide'} onChange={e => setForm(f => ({ ...f, visible: e.target.value === 'show' }))}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
              <option value="show">Mostrar</option>
              <option value="hide">Ocultar</option>
            </select>
          </SettingField>
          <SettingField label="Número (ID) del curso">
            <input disabled value={course.id} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none opacity-60"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
          </SettingField>
        </section>

        <section className="space-y-3">
          <SectionHeading>Descripción</SectionHeading>
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="flex gap-3 px-3 py-2 text-xs font-bold" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
              <span>B</span><span style={{ fontStyle: 'italic' }}>I</span><span style={{ textDecoration: 'underline' }}>U</span>
            </div>
            <textarea rows={5} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm outline-none resize-none" style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
            <div className="px-3 py-1.5 text-xs" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>{wordCount} palabras</div>
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeading>Formato de curso</SectionHeading>
          <SettingField label="Formato">
            <select value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
              <option value="topics">Por Tópicos</option>
              <option value="weekly">Semanal</option>
            </select>
          </SettingField>
        </section>

        <section className="space-y-2">
          <SectionHeading>Rastreo de finalización</SectionHeading>
          <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground)' }}>
            <input type="checkbox" checked={form.completionTrackingEnabled} onChange={e => setForm(f => ({ ...f, completionTrackingEnabled: e.target.checked }))} />
            Habilitar seguimiento de finalización (bloquea lecciones hasta completar la anterior)
          </label>
        </section>

        <button type="submit" className="w-full py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#005187' }}>
          Guardar cambios
        </button>
      </form>
    </div>
  )
}

export function SectionHeading({ children }) {
  return (
    <p className="text-xs font-bold uppercase tracking-wider pb-1.5" style={{ color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>
      {children}
    </p>
  )
}
export function SettingField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>{label}</label>
      {children}
    </div>
  )
}
