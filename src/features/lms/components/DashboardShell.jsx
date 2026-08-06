import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import { Bell } from '@/shared/components/Icons'
import ThemeToggle from '@/shared/components/ThemeToggle'
import Avatar from '@/shared/components/Avatar'

// Shell compartido por los paneles de Profesor y Estudiante: sidebar
// colapsable + topbar. Mismo patrón estructural que AdminDashboard.jsx,
// con el degradado navy/dorado institucional en el sidebar.
export default function DashboardShell({ roleLabel, navItems, activeSection, onSectionChange, title, notifications = [], theme, setTheme, children }) {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [bellOpen, setBellOpen] = useState(false)
  const seenKey = `lidessa_seen_notifications_${user?.id ?? 'anon'}`
  const [seenIds, setSeenIds] = useState(() => {
    try {
      const stored = localStorage.getItem(seenKey)
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch {
      return new Set()
    }
  })
  const unreadNotifications = notifications.filter(n => !seenIds.has(n.id))

  function markAllSeen() {
    setSeenIds(prev => {
      const next = new Set(prev)
      notifications.forEach(n => next.add(n.id))
      localStorage.setItem(seenKey, JSON.stringify([...next]))
      return next
    })
  }

  function handleLogout() {
    logout()
    toast('info', 'Sesión cerrada', 'Has cerrado sesión del panel.')
    navigate('/')
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <aside className="no-print" style={{
        width: sidebarOpen ? 232 : 68,
        height: '100%',
        background: 'linear-gradient(165deg, #0a2540 0%, #071e33 50%, #2d2308 85%, #4a3a0f 100%)',
        transition: 'width 0.25s ease',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRight: '1px solid rgba(132,182,244,0.15)',
      }}>
        <div style={{ padding: '22px 16px', borderBottom: '1px solid rgba(132,182,244,0.15)' }}>
          <div className="flex items-center gap-2.5">
            <img src="/assets/logolidessa.png" alt="Lidessa" className="shrink-0"
              style={{ width: 34, height: 34, objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(132,182,244,0.35))' }} />
            {sidebarOpen && (
              <div className="min-w-0">
                <span className="font-black text-white text-sm block truncate tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>LIDESSA</span>
                <span className="text-[11px] block truncate" style={{ color: '#84b6f4', letterSpacing: '0.04em' }}>{roleLabel}</span>
              </div>
            )}
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 overflow-y-auto min-h-0">
          {sidebarOpen && (
            <p className="text-[10px] font-bold px-3 mb-2" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em' }}>
              NAVEGACIÓN
            </p>
          )}
          <div className="space-y-1">
            {navItems.map(item => (
              <button key={item.id}
                onClick={() => onSectionChange(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 11,
                  width: '100%', padding: '9px 11px', borderRadius: 10,
                  background: activeSection === item.id
                    ? 'linear-gradient(135deg, rgba(132,182,244,0.2) 0%, rgba(132,182,244,0.06) 100%)'
                    : 'transparent',
                  color: activeSection === item.id ? '#84b6f4' : 'rgba(255,255,255,0.6)',
                  border: activeSection === item.id ? '1px solid rgba(132,182,244,0.35)' : '1px solid transparent',
                  boxShadow: activeSection === item.id ? '0 4px 16px rgba(132,182,244,0.14)' : 'none',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.35s ease, border-color 0.35s ease, color 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease',
                }}
                onMouseEnter={e => {
                  if (activeSection === item.id) return
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(132,182,244,0.1) 0%, rgba(255,255,255,0.04) 100%)'
                  e.currentTarget.style.color = '#84b6f4'
                  e.currentTarget.style.transform = 'translateX(4px)'
                }}
                onMouseLeave={e => {
                  if (activeSection === item.id) return
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                  e.currentTarget.style.transform = 'translateX(0)'
                }}
              >
                <span style={{
                  flexShrink: 0, width: 28, height: 28, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: activeSection === item.id ? 'rgba(132,182,244,0.18)' : 'rgba(255,255,255,0.05)',
                  transition: 'background-color 0.35s ease',
                }}>
                  <item.icon size={15} />
                </span>
                {sidebarOpen && <span className="text-sm font-semibold truncate">{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>

        {/* Profile mini-card */}
        <div style={{ padding: '0 12px 12px' }}>
          <div className="flex items-center gap-2.5" style={{
            padding: sidebarOpen ? '10px 10px' : '10px 0', borderRadius: 10,
            backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(132,182,244,0.12)',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
          }}>
            <Avatar user={user} size={32} />
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-xs font-bold truncate" style={{ color: 'white' }}>{user?.name ?? roleLabel}</p>
                <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{roleLabel}</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: 12, borderTop: '1px solid rgba(132,182,244,0.15)' }}>
          <button onClick={() => setSidebarOpen(s => !s)} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '8px 10px', borderRadius: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.4)', fontSize: 12, transition: 'background-color 0.15s, color 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#84b6f4' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
          >
            <span style={{ flexShrink: 0, fontSize: 14, transform: sidebarOpen ? 'none' : 'rotate(180deg)', transition: 'transform 0.25s ease' }}>◀</span>
            {sidebarOpen && <span>Colapsar</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden print-main">
        {/* Top bar */}
        <header className="no-print" style={{
          height: 60, borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', backgroundColor: 'var(--card)', flexShrink: 0,
        }}>
          <h1 className="font-bold text-sm" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>
            {title}
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <div style={{ position: 'relative' }}>
              <button onClick={() => {
                const next = !bellOpen
                setBellOpen(next)
                if (next) markAllSeen()
              }}
                style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--foreground)' }}>
                <Bell size={20} />
                {unreadNotifications.length > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    width: 18, height: 18, borderRadius: '50%',
                    backgroundColor: '#dc2626', color: 'white',
                    fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{unreadNotifications.length}</span>
                )}
              </button>
              {bellOpen && (
                <div style={{
                  position: 'absolute', top: 36, right: 0, width: 300,
                  backgroundColor: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                  zIndex: 100, overflow: 'hidden', animation: 'fadeUp 0.2s ease',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Notificaciones</span>
                  </div>
                  {notifications.length === 0 && (
                    <p className="text-xs px-4 py-4" style={{ color: 'var(--muted-foreground)' }}>Sin novedades por ahora.</p>
                  )}
                  {notifications.map((n, i) => {
                    const wasUnread = !seenIds.has(n.id)
                    return (
                      <div key={n.id ?? i}
                        onClick={() => { n.onClick?.(); setBellOpen(false) }}
                        className={n.onClick ? 'cursor-pointer transition-colors' : undefined}
                        style={{
                          padding: '10px 16px',
                          borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                          backgroundColor: wasUnread ? 'rgba(0,81,135,0.05)' : 'transparent',
                        }}
                        onMouseEnter={e => { if (n.onClick) e.currentTarget.style.backgroundColor = 'rgba(0,81,135,0.1)' }}
                        onMouseLeave={e => { if (n.onClick) e.currentTarget.style.backgroundColor = wasUnread ? 'rgba(0,81,135,0.05)' : 'transparent' }}
                      >
                        <div className="flex gap-3">
                          <span style={{ flexShrink: 0, color: 'var(--muted-foreground)', position: 'relative' }}>
                            <n.icon size={16} />
                            {wasUnread && (
                              <span style={{
                                position: 'absolute', top: -2, right: -2,
                                width: 6, height: 6, borderRadius: '50%', backgroundColor: '#005187',
                              }} />
                            )}
                          </span>
                          <div>
                            <p className="text-xs" style={{ color: 'var(--foreground)', opacity: wasUnread ? 1 : 0.65 }}>{n.text}</p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>{n.time}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Avatar user={user} size={32} />
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
        <main className="print-main" style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
