import { useState } from 'react'

const emptyForm = {
  title: '',
  excerpt: '',
  date: '',
  image: '',
  author: '',
  authorRole: '',
  email: '',
  phone: '',
}

export default function BlogPostFormModal({ post, onSave, onClose }) {
  const [form, setForm] = useState(post ? { ...emptyForm, ...post } : emptyForm)

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  const fields = [
    { key: 'title', label: 'Título', type: 'text', required: true },
    { key: 'excerpt', label: 'Resumen', type: 'textarea', required: true },
    { key: 'image', label: 'URL de la imagen', type: 'text', required: true, placeholder: 'https://...' },
    { key: 'date', label: 'Fecha', type: 'text', required: true, placeholder: 'Ej: 21 julio 2026' },
    { key: 'author', label: 'Autor', type: 'text', required: true },
    { key: 'authorRole', label: 'Cargo del autor', type: 'text', required: true },
    { key: 'email', label: 'Correo de contacto', type: 'email' },
    { key: 'phone', label: 'Teléfono de contacto', type: 'text' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-6 px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <h2 className="text-lg font-black mb-5" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          {post ? 'Editar publicación' : 'Nueva publicación'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
                {f.label}{f.required && ' *'}
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  required={f.required}
                  rows={3}
                  value={form[f.key]}
                  placeholder={f.placeholder}
                  onChange={e => set(f.key, e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                />
              ) : (
                <input
                  type={f.type}
                  required={f.required}
                  value={form[f.key]}
                  placeholder={f.placeholder}
                  onChange={e => set(f.key, e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                />
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: '#005187' }}>
              {post ? 'Guardar cambios' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
