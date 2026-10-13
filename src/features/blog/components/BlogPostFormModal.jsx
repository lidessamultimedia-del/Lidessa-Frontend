import { useState } from 'react'
import { useAuth } from '@/features/auth/context/AuthContext'
import { apiUploadAttachment, toFileUrl } from '@/shared/lib/api'

const emptyForm = {
  title: '',
  excerpt: '',
  imageUrl: '',
  author: '',
  link: '',
  phone: '',
}

// La imagen se sube al servidor apenas se elige (mismo endpoint de adjuntos
// que usa el LMS) y en la publicación solo se guarda su URL.
const MAX_IMAGE_MB = 5
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024

export default function BlogPostFormModal({ post, onSave, onClose }) {
  const { user } = useAuth()
  const [form, setForm] = useState(post ? { ...emptyForm, ...post } : emptyForm)
  const [imageError, setImageError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError(`La imagen pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. Use una de máximo ${MAX_IMAGE_MB} MB.`)
      return
    }
    setImageError('')
    setUploading(true)
    try {
      const uploaded = await apiUploadAttachment(file, user?.token)
      set('imageUrl', uploaded.url)
    } catch (err) {
      setImageError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.imageUrl) { setImageError('La imagen es obligatoria.'); return }
    setSaving(true)
    try {
      await onSave(form)
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    { key: 'author', label: 'Autor', type: 'text', required: true },
    { key: 'link', label: 'Enlace (opcional)', type: 'text', placeholder: 'https://...' },
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
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
              Título *
            </label>
            <input
              required
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
              Resumen *
            </label>
            <textarea
              required
              rows={3}
              value={form.excerpt}
              onChange={e => set('excerpt', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
              Imagen *
            </label>
            <div className="flex items-center gap-3">
              {form.imageUrl ? (
                <img src={toFileUrl(form.imageUrl)} alt="" className="w-16 h-12 object-cover rounded-lg shrink-0" style={{ border: '1px solid var(--border)' }} />
              ) : (
                <div className="w-16 h-12 rounded-lg shrink-0" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }} />
              )}
              <label
                className="flex-1 cursor-pointer text-sm px-3 py-2.5 rounded-lg text-center font-medium transition-colors"
                style={{ backgroundColor: 'var(--muted)', border: imageError ? '1px solid #dc2626' : '1px solid var(--border)', color: 'var(--foreground)' }}
              >
                {uploading ? 'Subiendo imagen…' : form.imageUrl ? 'Cambiar imagen…' : 'Elegir imagen del computador…'}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" disabled={uploading} onChange={handleImageChange} />
              </label>
            </div>
            {imageError && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>⚠ {imageError}</p>}
          </div>

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
            <button type="submit" disabled={uploading || saving}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: '#005187' }}>
              {saving ? 'Guardando…' : post ? 'Guardar cambios' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
