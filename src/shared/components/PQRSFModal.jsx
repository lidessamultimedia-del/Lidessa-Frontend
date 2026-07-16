import { useState, useEffect } from 'react'

const types = ['Petición', 'Queja', 'Reclamo', 'Sugerencia', 'Felicitación']

export default function PQRSFModal({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', type: 'Petición', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [onClose])

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); setSubmitted(true) }, 1400)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-6 px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card)' }}
      >
        <div className="p-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                Formulario PQRSF
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                Peticiones · Quejas · Reclamos · Sugerencias · Felicitaciones
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ color: 'var(--muted-foreground)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--muted)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >×</button>
          </div>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">📬</div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                ¡Recibido con éxito!
              </h3>
              <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>
                Su <strong style={{ color: 'var(--foreground)' }}>{form.type}</strong> ha sido registrada bajo el número de radicado:
              </p>
              <p className="text-lg font-black mb-4" style={{ color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
                PQRSF-2025-{String(Math.floor(Math.random() * 9000) + 1000)}
              </p>
              <p className="text-xs mb-6" style={{ color: 'var(--muted-foreground)' }}>
                Daremos respuesta a <strong>{form.email}</strong> en un plazo máximo de 15 días hábiles conforme a la normativa vigente.
              </p>
              <button onClick={onClose} className="px-6 py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Nombre completo *</label>
                  <input type="text" required placeholder="Su nombre" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Teléfono</label>
                  <input type="tel" placeholder="+57 300 000 0000" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Correo electrónico *</label>
                <input type="email" required placeholder="correo@empresa.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Tipo de solicitud *</label>
                <div className="flex flex-wrap gap-2">
                  {types.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: t }))}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={{
                        backgroundColor: form.type === t ? 'var(--primary)' : 'var(--muted)',
                        color: form.type === t ? 'white' : 'var(--muted-foreground)',
                        border: '1px solid',
                        borderColor: form.type === t ? 'var(--primary)' : 'var(--border)',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Asunto *</label>
                <input type="text" required placeholder="Resumen breve de su solicitud" value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Descripción detallada *</label>
                <textarea required rows={4} placeholder="Describa su solicitud con el mayor detalle posible..." value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Tiempo de respuesta: máximo 15 días hábiles. Sus datos serán tratados conforme a la{' '}
                <button type="button" className="underline" style={{ color: 'var(--accent)' }}>política de privacidad</button>.
              </p>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {loading ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
