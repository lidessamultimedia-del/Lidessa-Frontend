import { useState } from 'react'
import FormField, { errorInputStyle } from '@/shared/components/FormField'

export default function DocumentTypeFormModal({ documentTypes, onSave, onClose }) {
  const [name, setName] = useState('')
  const [error, setError] = useState(null)

  function validate() {
    const clean = name.trim()
    if (!clean) return 'El nombre del tipo de documento es obligatorio.'
    if (documentTypes.some(d => d.name.toLowerCase() === clean.toLowerCase())) return 'Ya existe un tipo de documento con ese nombre.'
    return null
  }

  function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    setError(err)
    if (err) return
    onSave(name.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>
        <h3 className="text-lg font-black mb-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          Nuevo tipo de documento
        </h3>
        <p className="text-xs mb-5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          Quedará disponible como opción al crear o editar un profesor.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField label="Nombre del tipo de documento" required error={error}>
            <input autoFocus value={name} onChange={e => { setName(e.target.value); setError(null) }}
              placeholder="Ej. Cédula de ciudadanía"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!error) }} />
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
