import { useState, useEffect } from 'react'

export default function CourseModal({ course, onClose, initialTab = 'info' }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState(initialTab)

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
    setTimeout(() => { setLoading(false); setSubmitted(true) }, 1200)
  }

  const modalityColor = {
    Virtual: '#10B981',
    Presencial: '#3B82F6',
    Mixto: '#F59E0B',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-6 px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--card)' }}>
        {/* Image header */}
        <div className="h-48 overflow-hidden relative" style={{ backgroundColor: 'var(--secondary)' }}>
          <img src={course.image} alt={course.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >×</button>
          <div className="absolute bottom-4 left-5">
            <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: modalityColor[course.modality] ?? '#6B7280' }}>
              {course.modality}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                {course.category}
              </span>
              <h2 className="text-xl font-black mt-2 leading-snug" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                {course.name}
              </h2>
            </div>
            <p className="text-xl font-black shrink-0" style={{ color: '#10B981', fontFamily: 'var(--font-display)' }}>
              {course.price}
            </p>
          </div>

          <div className="flex gap-1 mb-5 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
            <button
              onClick={() => setTab('info')}
              className="flex-1 py-2 text-sm font-bold transition-all"
              style={{
                backgroundColor: tab === 'info' ? 'var(--primary)' : 'transparent',
                color: tab === 'info' ? 'white' : 'var(--muted-foreground)',
                borderRadius: '6px',
              }}
            >
              Información
            </button>
            <button
              onClick={() => setTab('enroll')}
              className="flex-1 py-2 text-sm font-bold transition-all"
              style={{
                backgroundColor: tab === 'enroll' ? 'var(--primary)' : 'transparent',
                color: tab === 'enroll' ? 'white' : 'var(--muted-foreground)',
                borderRadius: '6px',
              }}
            >
              Inscribirme
            </button>
          </div>

          {tab === 'info' ? (
            <div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--muted-foreground)' }}>
                {course.description}
              </p>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { icon: '⏱', label: 'Duración', value: course.duration },
                  { icon: '📡', label: 'Modalidad', value: course.modality },
                  { icon: '🎓', label: 'Certificado', value: 'Sí' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--muted)' }}>
                    <div className="text-xl mb-1">{s.icon}</div>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{s.value}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setTab('enroll')}
                className="w-full py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#10B981' }}
              >
                Inscribirme ahora →
              </button>
            </div>
          ) : submitted ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">🎓</div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                ¡Inscripción recibida!
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
                Hemos recibido su solicitud de inscripción al curso <strong style={{ color: 'var(--foreground)' }}>{course.name}</strong>. Nos contactaremos a <strong>{form.email}</strong> en las próximas 24 horas para confirmar y coordinar el pago.
              </p>
              <button onClick={onClose} className="px-6 py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#10B981' }}>
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Nombre completo *</label>
                <input type="text" required placeholder="Su nombre completo" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  onFocus={e => e.target.style.borderColor = '#10B981'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Correo *</label>
                  <input type="email" required placeholder="correo@empresa.com" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    onFocus={e => e.target.style.borderColor = '#10B981'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>WhatsApp *</label>
                  <input type="tel" required placeholder="+57 300 000 0000" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    onFocus={e => e.target.style.borderColor = '#10B981'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Empresa / Institución</label>
                <input type="text" placeholder="Nombre de su organización" value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  onFocus={e => e.target.style.borderColor = '#10B981'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: '#10B981' }}
              >
                {loading ? 'Enviando solicitud...' : `Confirmar inscripción — ${course.price}`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
