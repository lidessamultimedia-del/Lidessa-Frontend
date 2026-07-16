import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import { courses } from '@/features/training/data/courses'

const mockPQRSF = [
  { id: 'PQRSF-2025-0041', type: 'Solicitud', subject: 'Cotización SG-SST para empresa de 25 empleados', date: '2025-07-10', status: 'En proceso', response: '' },
  { id: 'PQRSF-2025-0038', type: 'Queja', subject: 'Demora en entrega de certificado de capacitación', date: '2025-07-03', status: 'Respondida', response: 'Estimada cliente, le informamos que su certificado está listo para descarga. Disculpe el inconveniente.' },
  { id: 'PQRSF-2025-0029', type: 'Sugerencia', subject: 'Habilitar más horarios de cursos virtuales nocturnos', date: '2025-06-22', status: 'Recibida', response: '' },
]

const mockNotifications = [
  { id: '1', icon: '📋', title: 'Respuesta a su PQRSF', body: 'Lidessa respondió a su radicado PQRSF-2025-0038', time: 'Hace 2 horas', read: false },
  { id: '2', icon: '🎓', title: 'Curso por iniciar', body: 'Su curso "Auditoría Interna" inicia el 20 de julio', time: 'Ayer', read: false },
  { id: '3', icon: 'ℹ️', title: 'Nuevo documento disponible', body: 'El informe de diagnóstico SG-SST fue cargado en su cuenta', time: 'Hace 3 días', read: true },
]

const mockEnrolled = [courses[0], courses[2], courses[4]]

const statusColor = {
  'En proceso': '#d97706',
  'Respondida': '#16a34a',
  'Recibida': '#005187',
}

export default function ClientDashboard() {
  const { user, logout, updateProfile } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [section, setSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    company: user?.company ?? '',
  })
  const [notifications, setNotifications] = useState(mockNotifications)
  const [pqrsfType, setPqrsfType] = useState('Solicitud')
  const [pqrsfSubject, setPqrsfSubject] = useState('')
  const [pqrsfMessage, setPqrsfMessage] = useState('')
  const [pqrsfSent, setPqrsfSent] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const unread = notifications.filter(n => !n.read).length

  function handleLogout() {
    logout()
    toast('info', 'Sesión cerrada', 'Ha cerrado sesión correctamente.')
    navigate('/')
  }

  function handleProfileSave(e) {
    e.preventDefault()
    updateProfile(profileForm)
    toast('success', 'Perfil actualizado', 'Sus datos han sido guardados correctamente.')
  }

  function handlePQRSF(e) {
    e.preventDefault()
    setPqrsfSent(true)
    toast('success', 'PQRSF enviado', `Radicado PQRSF-2025-${Math.floor(Math.random() * 9000 + 1000)} creado exitosamente.`)
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast('info', 'Notificaciones marcadas como leídas')
  }

  const navItems = [
    { id: 'overview', label: 'Inicio', icon: '🏠' },
    { id: 'courses', label: 'Mis cursos', icon: '🎓' },
    { id: 'pqrsf', label: 'PQRSF', icon: '📋' },
    { id: 'notifications', label: 'Notificaciones', icon: '🔔' },
    { id: 'profile', label: 'Mi perfil', icon: '👤' },
  ]

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 64,
        minHeight: '100vh',
        backgroundColor: '#005187',
        transition: 'width 0.25s ease',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 12px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
              style={{ background: 'rgba(255,255,255,0.2)', fontSize: 14 }}>L</div>
            {sidebarOpen && (
              <span className="font-bold text-white text-sm truncate" style={{ fontFamily: 'var(--font-display)' }}>
                Lidessa
              </span>
            )}
          </div>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <button key={item.id}
              onClick={() => setSection(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '10px 16px',
                backgroundColor: section === item.id ? 'rgba(255,255,255,0.18)' : 'transparent',
                color: section === item.id ? 'white' : 'rgba(255,255,255,0.65)',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                textAlign: 'left',
                borderLeft: section === item.id ? '3px solid rgba(255,255,255,0.8)' : '3px solid transparent',
              }}
              onMouseEnter={e => { if (section !== item.id) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { if (section !== item.id) e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <span style={{ fontSize: 18, flexShrink: 0, width: 20, textAlign: 'center' }}>{item.icon}</span>
              {sidebarOpen && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </button>
          ))}
        </nav>
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <button onClick={() => setSidebarOpen(s => !s)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '8px 4px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.5)', fontSize: 12,
            }}>
            <span style={{ flexShrink: 0, fontSize: 14 }}>{sidebarOpen ? '◀' : '▶'}</span>
            {sidebarOpen && <span>Colapsar</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header style={{
          height: 60,
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          backgroundColor: 'var(--card)',
          flexShrink: 0,
        }}>
          <h1 className="font-bold text-sm" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>
            Portal Cliente — {navItems.find(n => n.id === section)?.label}
          </h1>
          <div className="flex items-center gap-4">
            {/* Bell */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setBellOpen(o => !o)}
                style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--foreground)' }}>
                🔔
                {unread > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    width: 18, height: 18, borderRadius: '50%',
                    backgroundColor: '#dc2626', color: 'white',
                    fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'fadeUp 0.3s ease',
                  }}>{unread}</span>
                )}
              </button>
              {bellOpen && (
                <div style={{
                  position: 'absolute', top: 36, right: 0,
                  width: 300, maxHeight: 340,
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                  zIndex: 100,
                  overflow: 'hidden',
                  animation: 'fadeUp 0.2s ease',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Notificaciones</span>
                    <button onClick={markAllRead} className="text-xs" style={{ color: 'var(--accent)' }}>Marcar leídas</button>
                  </div>
                  <div style={{ overflowY: 'auto', maxHeight: 280 }}>
                    {notifications.map(n => (
                      <div key={n.id} style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: n.read ? 'transparent' : 'rgba(0,81,135,0.06)',
                      }}>
                        <div className="flex gap-3">
                          <span style={{ fontSize: 20, flexShrink: 0 }}>{n.icon}</span>
                          <div>
                            <p className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>{n.title}</p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{n.body}</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #005187, #4d82bc)' }}>
                {user?.name?.charAt(0)}
              </div>
              <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--foreground)' }}>{user?.name}</span>
            </div>
            <button onClick={handleLogout}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#dc2626'; e.currentTarget.style.color = '#dc2626' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
            >
              Salir
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

          {section === 'overview' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <p className="text-2xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                Hola, {user?.name?.split(' ')[0]} 👋
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Bienvenido a su portal de cliente Lidessa.</p>
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Cursos activos', value: mockEnrolled.length, icon: '🎓', color: '#005187' },
                  { label: 'PQRSF enviadas', value: mockPQRSF.length, icon: '📋', color: '#d97706' },
                  { label: 'Notificaciones', value: unread, icon: '🔔', color: '#dc2626' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-5"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontSize: 24 }}>{s.icon}</span>
                      <span className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>Actividad reciente</h2>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {mockNotifications.map((n, i) => (
                  <div key={n.id} style={{
                    display: 'flex', gap: 12, padding: '12px 16px',
                    borderBottom: i < mockNotifications.length - 1 ? '1px solid var(--border)' : 'none',
                    backgroundColor: 'var(--card)',
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{n.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{n.title}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{n.body}</p>
                    </div>
                    <span className="text-xs shrink-0" style={{ color: 'var(--muted-foreground)' }}>{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'courses' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <h2 className="text-xl font-black mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Mis cursos inscritos</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockEnrolled.map(c => (
                  <div key={c.id} className="rounded-xl overflow-hidden"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                    <img src={c.image} alt={c.name} className="w-full h-36 object-cover" />
                    <div className="p-4">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>{c.category}</span>
                      <h3 className="font-bold text-sm mt-2 mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>{c.name}</h3>
                      <div className="flex gap-2 text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>
                        <span>⏱ {c.duration}</span>
                        <span>· {c.modality}</span>
                      </div>
                      <div className="w-full rounded-full h-1.5 mb-1" style={{ backgroundColor: 'var(--muted)' }}>
                        <div className="h-full rounded-full" style={{ width: '45%', backgroundColor: '#005187' }} />
                      </div>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>45% completado</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'pqrsf' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <h2 className="text-xl font-black mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Mis solicitudes PQRSF</h2>
              {!pqrsfSent ? (
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--foreground)' }}>Nueva solicitud</h3>
                    <form onSubmit={handlePQRSF} className="rounded-xl p-5 space-y-4"
                      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                      <div className="flex gap-2 flex-wrap">
                        {['Solicitud', 'Queja', 'Reclamo', 'Sugerencia', 'Felicitación'].map(t => (
                          <button key={t} type="button" onClick={() => setPqrsfType(t)}
                            className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                            style={{
                              backgroundColor: pqrsfType === t ? '#005187' : 'var(--muted)',
                              color: pqrsfType === t ? 'white' : 'var(--muted-foreground)',
                              border: '1px solid',
                              borderColor: pqrsfType === t ? '#005187' : 'var(--border)',
                            }}>
                            {t}
                          </button>
                        ))}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Asunto</label>
                        <input value={pqrsfSubject} required onChange={e => setPqrsfSubject(e.target.value)}
                          placeholder="Describa brevemente su solicitud"
                          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                          style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          onFocus={e => e.target.style.borderColor = '#005187'}
                          onBlur={e => e.target.style.borderColor = 'var(--border)'}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Mensaje</label>
                        <textarea value={pqrsfMessage} required onChange={e => setPqrsfMessage(e.target.value)}
                          rows={4} placeholder="Detalle su solicitud aquí..."
                          className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                          style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          onFocus={e => e.target.style.borderColor = '#005187'}
                          onBlur={e => e.target.style.borderColor = 'var(--border)'}
                        />
                      </div>
                      <button type="submit"
                        className="w-full py-2.5 rounded-lg text-sm font-bold text-white"
                        style={{ backgroundColor: '#005187' }}>
                        Enviar {pqrsfType}
                      </button>
                    </form>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--foreground)' }}>Historial</h3>
                    <div className="space-y-3">
                      {mockPQRSF.map(p => (
                        <div key={p.id} className="rounded-xl p-4"
                          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>{p.id}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{ backgroundColor: `${statusColor[p.status]}22`, color: statusColor[p.status] }}>
                              {p.status}
                            </span>
                          </div>
                          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>{p.type} · {p.date}</p>
                          <p className="text-sm" style={{ color: 'var(--foreground)' }}>{p.subject}</p>
                          {p.response && (
                            <div className="mt-2 p-2 rounded-lg text-xs"
                              style={{ backgroundColor: 'rgba(0,81,135,0.08)', color: 'var(--foreground)', borderLeft: '2px solid #005187' }}>
                              <strong>Respuesta:</strong> {p.response}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>¡Solicitud enviada!</h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>Hemos recibido su {pqrsfType.toLowerCase()}. Le responderemos en 5 días hábiles.</p>
                  <button onClick={() => { setPqrsfSent(false); setPqrsfSubject(''); setPqrsfMessage('') }}
                    className="px-6 py-2.5 rounded-lg text-sm font-bold text-white"
                    style={{ backgroundColor: '#005187' }}>
                    Nueva solicitud
                  </button>
                </div>
              )}
            </div>
          )}

          {section === 'notifications' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Notificaciones</h2>
                <button onClick={markAllRead} className="text-xs px-3 py-1.5 rounded-lg font-medium"
                  style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                  Marcar todo como leído
                </button>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {notifications.map((n, i) => (
                  <div key={n.id} style={{
                    display: 'flex', gap: 14, padding: '16px 20px',
                    borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                    backgroundColor: n.read ? 'var(--card)' : 'rgba(0,81,135,0.06)',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                  }}
                    onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                  >
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{n.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{n.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{n.body}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>{n.time}</p>
                    </div>
                    {!n.read && (
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#005187', flexShrink: 0, marginTop: 6 }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'profile' && (
            <div style={{ animation: 'fadeUp 0.4s ease', maxWidth: 520 }}>
              <h2 className="text-xl font-black mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Mi perfil</h2>
              <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black"
                    style={{ background: 'linear-gradient(135deg, #005187, #4d82bc)' }}>
                    {user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>{user?.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{user?.email}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold mt-1 inline-block"
                      style={{ backgroundColor: 'rgba(0,81,135,0.12)', color: '#005187' }}>
                      Cliente
                    </span>
                  </div>
                </div>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  {[
                    { key: 'name', label: 'Nombre completo', type: 'text' },
                    { key: 'email', label: 'Correo electrónico', type: 'email' },
                    { key: 'phone', label: 'Teléfono / WhatsApp', type: 'tel' },
                    { key: 'company', label: 'Empresa / Organización', type: 'text' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{f.label}</label>
                      <input type={f.type} value={profileForm[f.key] ?? ''}
                        onChange={e => setProfileForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                        style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                        onFocus={e => e.target.style.borderColor = '#005187'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                  ))}
                  <button type="submit"
                    className="w-full py-2.5 rounded-lg text-sm font-bold text-white mt-2"
                    style={{ backgroundColor: '#005187' }}>
                    Guardar cambios
                  </button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
