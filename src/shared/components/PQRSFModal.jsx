import { useState, useEffect } from 'react'
import { usePQRSF } from '@/features/pqrsf/context/PQRSFContext'
import { useAuth } from '@/features/auth/context/AuthContext'
import { Inbox, ShieldCheck } from '@/shared/components/Icons'

const types = ['Petición', 'Queja', 'Reclamo', 'Sugerencia', 'Felicitación']

export default function PQRSFModal({ onClose }) {
  const { addTicket } = usePQRSF()
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', phone: '', type: 'Petición', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({ subject: false, message: false, email: false })
  const [ticketId, setTicketId] = useState(null)

  const errors = {
    subject: form.subject.trim() ? null : 'Este campo es obligatorio.',
    message: form.message.trim() ? null : 'Este campo es obligatorio.',
    email: !user && form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? 'Ingrese un correo válido.' : null,
  }
  const isValid = !errors.subject && !errors.message && !errors.email
  const willBeIdentified = !!user || !!form.email.trim()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [onClose])

  const markTouched = (field) => setTouched(t => ({ ...t, [field]: true }))
  const borderColor = (field) => (touched[field] && errors[field] ? '#dc2626' : 'var(--border)')

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched({ subject: true, message: true, email: true })
    if (!isValid) return
    setLoading(true)
    setTimeout(() => {
      const ticket = addTicket(form, user)
      setTicketId(ticket.id)
      setLoading(false)
      setSubmitted(true)
    }, 1400)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-6 px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.25s ease' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card)', animation: 'modalPop 0.45s cubic-bezier(0.34, 1.4, 0.64, 1)' }}
      >
        <div
          className="p-6 pb-5"
          style={{ background: 'linear-gradient(135deg, #005187 0%, #4d82bc 55%, #b8860b 100%)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Formulario PQRSF
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Peticiones · Quejas · Reclamos · Sugerencias · Felicitaciones
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.18)', transition: 'background-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)'}
            >×</button>
          </div>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4" style={{ color: 'var(--primary)' }}><Inbox size={44} /></div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                ¡Recibido con éxito!
              </h3>
              <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>
                Su <strong style={{ color: 'var(--foreground)' }}>{form.type}</strong> ha sido registrada bajo el número de radicado:
              </p>
              <p className="text-lg font-black mb-4" style={{ color: '#b8860b', fontFamily: 'var(--font-display)' }}>
                {ticketId}
              </p>
              <p className="text-xs mb-6" style={{ color: 'var(--muted-foreground)' }}>
                {user?.email || form.email.trim()
                  ? <>Daremos respuesta a <strong>{user?.email || form.email.trim()}</strong> en un plazo máximo de 15 días hábiles conforme a la normativa vigente.</>
                  : 'Al no dejar un correo, este mensaje quedó como anónimo: lo tendremos en cuenta, pero no podremos darle una respuesta directa.'}
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #005187 0%, #4d82bc 55%, #b8860b 100%)' }}
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {user ? (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)' }}>
                  <span style={{ color: '#16a34a' }}><ShieldCheck size={20} /></span>
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>Enviando como {user.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{user.email} · Este PQRSF queda vinculado a su cuenta y le podremos responder directamente.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
                        Nombre completo <span className="font-normal" style={{ color: 'var(--muted-foreground)' }}>(opcional)</span>
                      </label>
                      <input type="text" placeholder="Su nombre" value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                        style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
                        Teléfono <span className="font-normal" style={{ color: 'var(--muted-foreground)' }}>(opcional)</span>
                      </label>
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
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
                      Correo electrónico <span className="font-normal" style={{ color: 'var(--muted-foreground)' }}>(opcional)</span>
                    </label>
                    <input type="email" placeholder="correo@empresa.com" value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                      style={{ backgroundColor: 'var(--muted)', border: `1px solid ${borderColor('email')}`, color: 'var(--foreground)' }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={() => markTouched('email')}
                    />
                    {touched.email && errors.email && (
                      <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.email}</p>
                    )}
                    <p className="text-xs mt-1.5" style={{ color: willBeIdentified ? '#16a34a' : 'var(--muted-foreground)' }}>
                      {willBeIdentified
                        ? 'Con este correo podremos darle una respuesta directa.'
                        : 'Si no deja su correo, este mensaje quedará como anónimo: lo tendremos en cuenta, pero no podremos responderle directamente.'}
                    </p>
                  </div>
                </>
              )}
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
                        background: form.type === t ? 'linear-gradient(135deg, #005187 0%, #4d82bc 55%, #b8860b 100%)' : 'var(--muted)',
                        color: form.type === t ? 'white' : 'var(--muted-foreground)',
                        border: '1px solid',
                        borderColor: form.type === t ? 'transparent' : 'var(--border)',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Asunto *</label>
                <input type="text" placeholder="Resumen breve de su solicitud" value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: 'var(--muted)', border: `1px solid ${borderColor('subject')}`, color: 'var(--foreground)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={() => markTouched('subject')}
                />
                {touched.subject && errors.subject && (
                  <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.subject}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Descripción detallada *</label>
                <textarea rows={4} placeholder="Describa su solicitud con el mayor detalle posible..." value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none"
                  style={{ backgroundColor: 'var(--muted)', border: `1px solid ${borderColor('message')}`, color: 'var(--foreground)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={() => markTouched('message')}
                />
                {touched.message && errors.message && (
                  <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors.message}</p>
                )}
              </div>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Tiempo de respuesta: máximo 15 días hábiles. Sus datos serán tratados conforme a la{' '}
                <button type="button" className="underline" style={{ color: 'var(--accent)' }}>política de privacidad</button>.
              </p>
              <button type="submit" disabled={loading || (touched.subject && touched.message && !isValid)}
                className="w-full py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #005187 0%, #4d82bc 55%, #b8860b 100%)' }}
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
