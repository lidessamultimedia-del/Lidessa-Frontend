import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import { useBlog } from '@/features/blog/context/BlogContext'
import { usePQRSF } from '@/features/pqrsf/context/PQRSFContext'
import BlogPostFormModal from '@/features/blog/components/BlogPostFormModal'
import { courses } from '@/features/training/data/courses'
import AnimatedCounter from '@/shared/components/AnimatedCounter'
import { BarChart2, Building, FileText, GraduationCap, Users, Clipboard, Sliders, Bell, User, AlertTriangle, Edit2, Plus, Send } from '@/shared/components/Icons'

const mockUsers = [
  { id: '1', name: 'María García', email: 'cliente@lidessa.co', role: 'client', company: 'Construcciones García S.A.S.', joined: '2025-05-12' },
  { id: '3', name: 'Carlos Rodríguez', email: 'carlos.r@empresa.com', role: 'client', company: 'Distribuidora del Pacífico', joined: '2025-06-01' },
  { id: '4', name: 'Ana Martínez', email: 'ana.m@colegio.edu.co', role: 'client', company: 'IED La Esperanza', joined: '2025-07-02' },
]

const mockServices = [
  { id: 1, name: 'Seguridad y salud en el trabajo', category: 'Propiedades horizontales', active: true },
  { id: 2, name: 'Plan de manejo de residuos sólidos', category: 'Propiedades horizontales', active: true },
  { id: 3, name: 'Evaluación de riesgo psicosocial', category: 'Gestión de empresas', active: true },
  { id: 4, name: 'Proyecto educativo institucional', category: 'Gestión de instituciones', active: false },
  { id: 5, name: 'Gestión para instituciones educativas', category: 'Gestión de instituciones', active: true },
  { id: 6, name: 'Formación a la medida', category: 'Educación y formación', active: true },
]

const statusColor = {
  'Pendiente': '#d97706',
  'Respondida': '#16a34a',
  'Revisando': '#005187',
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { posts: blogPosts, addPost, updatePost, deletePost } = useBlog()
  const { tickets: pqrsfTickets, updateTicket: updatePQRSF } = usePQRSF()
  const [section, setSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [bellOpen, setBellOpen] = useState(false)
  const [services, setServices] = useState(mockServices)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [blogModal, setBlogModal] = useState(null)
  const [settings, setSettings] = useState({
    phone: '+57 300 123 4567',
    email: 'info@lidessa.co',
    address: 'Calle 100 # 19-61, Bogotá D.C.',
    schedule: 'Lunes a viernes: 7:30 am – 5:30 pm',
  })

  function handleLogout() {
    logout()
    toast('info', 'Sesión cerrada', 'Has cerrado sesión del panel de administración.')
    navigate('/')
  }

  function toggleService(id) {
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s))
    const svc = services.find(s => s.id === id)
    toast(svc.active ? 'warning' : 'success', `Servicio ${svc.active ? 'desactivado' : 'activado'}`, svc.name)
  }

  function handleDeleteConfirm() {
    if (deleteConfirm.type === 'blog') {
      deletePost(deleteConfirm.id)
      toast('success', 'Publicación eliminada', deleteConfirm.label)
    } else {
      toast('success', 'Elemento eliminado', 'El registro fue eliminado correctamente.')
    }
    setDeleteConfirm(null)
  }

  function handleSaveBlogPost(form) {
    if (blogModal.mode === 'edit') {
      updatePost(blogModal.post.id, form)
      toast('success', 'Publicación actualizada', form.title)
    } else {
      addPost(form)
      toast('success', 'Publicación creada', form.title)
    }
    setBlogModal(null)
  }

  function handleSettingsSave(e) {
    e.preventDefault()
    toast('success', 'Configuración guardada', 'Los cambios fueron aplicados exitosamente.')
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'services', label: 'Servicios', icon: Building },
    { id: 'blog', label: 'Blog / Noticias', icon: FileText },
    { id: 'courses', label: 'Cursos', icon: GraduationCap },
    { id: 'users', label: 'Clientes', icon: Users },
    { id: 'pqrsf', label: 'PQRSF', icon: Clipboard },
    { id: 'settings', label: 'Configuración', icon: Sliders },
  ]

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 64,
        minHeight: '100vh',
        backgroundColor: '#141414',
        transition: 'width 0.25s ease',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #005187, #4d82bc)', fontSize: 14 }}>L</div>
            {sidebarOpen && (
              <div>
                <span className="font-bold text-white text-sm block truncate" style={{ fontFamily: 'var(--font-display)' }}>Lidessa</span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Panel Admin</span>
              </div>
            )}
          </div>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <button key={item.id}
              onClick={() => setSection(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '10px 16px',
                backgroundColor: section === item.id ? 'rgba(77,130,188,0.2)' : 'transparent',
                color: section === item.id ? '#84b6f4' : 'rgba(255,255,255,0.55)',
                border: 'none', cursor: 'pointer', transition: 'background-color 0.15s', textAlign: 'left',
                borderLeft: section === item.id ? '3px solid #4d82bc' : '3px solid transparent',
              }}
              onMouseEnter={e => { if (section !== item.id) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if (section !== item.id) e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <span style={{ flexShrink: 0, width: 20, display: 'flex', justifyContent: 'center' }}><item.icon size={16} /></span>
              {sidebarOpen && <span className="text-sm font-medium truncate">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={() => setSidebarOpen(s => !s)} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '8px 4px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.35)', fontSize: 12,
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
          height: 60, borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', backgroundColor: 'var(--card)', flexShrink: 0,
        }}>
          <h1 className="font-bold text-sm" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>
            Administración — {navItems.find(n => n.id === section)?.label}
          </h1>
          <div className="flex items-center gap-4">
            {/* Bell */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setBellOpen(o => !o)}
                style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--foreground)' }}>
                <Bell size={20} />
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 18, height: 18, borderRadius: '50%',
                  backgroundColor: '#dc2626', color: 'white',
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{user?.unreadNotifications ?? 0}</span>
              </button>
              {bellOpen && (
                <div style={{
                  position: 'absolute', top: 36, right: 0, width: 300,
                  backgroundColor: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                  zIndex: 100, overflow: 'hidden', animation: 'fadeUp 0.2s ease',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Notificaciones admin</span>
                  </div>
                  {[
                    { icon: Clipboard, text: 'Nueva PQRSF de María García', time: 'Hace 1 hora' },
                    { icon: User, text: 'Nuevo cliente registrado: Ana Martínez', time: 'Hace 3 horas' },
                    { icon: GraduationCap, text: '3 nuevas inscripciones en "Auditoría Interna"', time: 'Ayer' },
                    { icon: AlertTriangle, text: 'Servicio "PEI" requiere actualización normativa', time: 'Hace 2 días' },
                    { icon: FileText, text: 'Publicación programada lista para revisión', time: 'Hace 3 días' },
                  ].map((n, i) => (
                    <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', backgroundColor: i < 2 ? 'rgba(0,81,135,0.05)' : 'transparent' }}>
                      <div className="flex gap-3">
                        <span style={{ flexShrink: 0, color: 'var(--muted-foreground)' }}><n.icon size={16} /></span>
                        <div>
                          <p className="text-xs" style={{ color: 'var(--foreground)' }}>{n.text}</p>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
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

          {/* ── DASHBOARD ── */}
          {section === 'dashboard' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <p className="text-2xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                Panel de administración
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Resumen general de Lidessa</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Clientes registrados', value: 47, icon: Users, color: '#005187' },
                  { label: 'PQRSF pendientes', value: pqrsfTickets.filter(p => p.status === 'Pendiente').length, icon: Clipboard, color: '#d97706' },
                  { label: 'Cursos activos', value: 12, icon: GraduationCap, color: '#16a34a' },
                  { label: 'Publicaciones del mes', value: 4, icon: FileText, color: '#7c3aed' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-5"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span style={{ color: s.color }}><s.icon size={26} /></span>
                      <AnimatedCounter target={s.value} suffix="" style={{ fontSize: 32, fontFamily: 'var(--font-display)', color: s.color, fontWeight: 900 }} />
                    </div>
                    <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>Acciones rápidas</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                {[
                  { label: 'Nueva publicación', icon: Edit2, section: 'blog' },
                  { label: 'Agregar curso', icon: Plus, section: 'courses' },
                  { label: 'Ver PQRSF', icon: Send, section: 'pqrsf' },
                  { label: 'Gestionar usuarios', icon: User, section: 'users' },
                ].map(a => (
                  <button key={a.label} onClick={() => setSection(a.section)}
                    className="rounded-xl p-4 text-left transition-all hover:shadow-md"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#4d82bc' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                  >
                    <span style={{ display: 'block', marginBottom: 8, color: 'var(--primary)' }}><a.icon size={22} /></span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{a.label}</span>
                  </button>
                ))}
              </div>

              {/* Recent PQRSF */}
              <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>Últimas solicitudes PQRSF</h2>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {pqrsfTickets.slice(0, 3).map((p, i) => (
                  <div key={p.id} style={{
                    display: 'flex', gap: 12, padding: '12px 16px', alignItems: 'center',
                    borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                    backgroundColor: 'var(--card)',
                  }}>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{p.subject}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{p.from} · {p.type} · {p.date}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full font-semibold shrink-0"
                      style={{ backgroundColor: `${statusColor[p.status]}22`, color: statusColor[p.status] }}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SERVICES ── */}
          {section === 'services' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Servicios</h2>
                <button onClick={() => toast('info', 'Próximamente', 'Formulario de creación de servicio en desarrollo.')}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white"
                  style={{ backgroundColor: '#005187' }}>
                  + Nuevo servicio
                </button>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {services.map((s, i) => (
                  <div key={s.id} style={{
                    display: 'flex', gap: 12, padding: '14px 16px', alignItems: 'center',
                    borderBottom: i < services.length - 1 ? '1px solid var(--border)' : 'none',
                    backgroundColor: 'var(--card)',
                  }}>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{s.name}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.category}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full font-semibold"
                      style={{ backgroundColor: s.active ? 'rgba(22,163,74,0.12)' : 'var(--muted)', color: s.active ? '#16a34a' : 'var(--muted-foreground)' }}>
                      {s.active ? 'Activo' : 'Inactivo'}
                    </span>
                    <button onClick={() => toggleService(s.id)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                      style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = s.active ? '#dc2626' : '#16a34a'; e.currentTarget.style.color = s.active ? '#dc2626' : '#16a34a' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
                    >
                      {s.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button onClick={() => toast('info', 'Editor', `Editando: ${s.name}`)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                      style={{ backgroundColor: 'rgba(0,81,135,0.1)', color: '#005187', border: '1px solid rgba(0,81,135,0.2)' }}>
                      Editar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── BLOG ── */}
          {section === 'blog' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Blog / Noticias</h2>
                <button onClick={() => setBlogModal({ mode: 'new' })}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white"
                  style={{ backgroundColor: '#005187' }}>
                  + Nueva publicación
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {blogPosts.map(post => (
                  <div key={post.id} className="rounded-xl overflow-hidden"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                    <img src={post.image} alt={post.title} className="w-full h-36 object-cover" />
                    <div className="p-4">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                        {post.category}
                      </span>
                      <h3 className="font-bold text-sm mt-2 mb-1 leading-snug" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                        {post.title}
                      </h3>
                      <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>{post.date} · {post.author}</p>
                      <div className="flex gap-2">
                        <button onClick={() => setBlogModal({ mode: 'edit', post })}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white"
                          style={{ backgroundColor: '#005187' }}>
                          Editar
                        </button>
                        <button onClick={() => setDeleteConfirm({ type: 'blog', id: post.id, label: post.title })}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold"
                          style={{ border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626' }}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── COURSES ── */}
          {section === 'courses' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Cursos</h2>
                <button onClick={() => toast('info', 'Próximamente', 'Formulario de creación de curso en desarrollo.')}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white"
                  style={{ backgroundColor: '#005187' }}>
                  + Nuevo curso
                </button>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {courses.map((c, i) => (
                  <div key={c.id} style={{
                    display: 'flex', gap: 12, padding: '14px 16px', alignItems: 'center',
                    borderBottom: i < courses.length - 1 ? '1px solid var(--border)' : 'none',
                    backgroundColor: 'var(--card)',
                  }}>
                    <img src={c.image} alt={c.name} className="w-12 h-10 object-cover rounded-lg shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{c.name}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{c.category} · {c.duration} · {c.modality}</p>
                    </div>
                    <span className="text-sm font-black shrink-0" style={{ color: '#16a34a', fontFamily: 'var(--font-display)' }}>{c.price}</span>
                    <button onClick={() => toast('info', 'Editar curso', c.name)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium"
                      style={{ backgroundColor: 'rgba(0,81,135,0.1)', color: '#005187', border: '1px solid rgba(0,81,135,0.2)' }}>
                      Editar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {section === 'users' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Clientes registrados</h2>
                <button onClick={() => toast('info', 'Próximamente', 'Creación de usuario en desarrollo.')}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white"
                  style={{ backgroundColor: '#005187' }}>
                  + Nuevo usuario
                </button>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0 16px', padding: '10px 16px', backgroundColor: 'var(--muted)' }}>
                  {['Nombre', 'Empresa', 'Fecha de registro', ''].map(h => (
                    <span key={h} className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{h}</span>
                  ))}
                </div>
                {mockUsers.map((u, i) => (
                  <div key={u.id} style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto',
                    gap: '0 16px', padding: '14px 16px', alignItems: 'center',
                    borderTop: '1px solid var(--border)', backgroundColor: 'var(--card)',
                  }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{u.name}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{u.email}</p>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{u.company}</p>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{u.joined}</p>
                    <button onClick={() => setDeleteConfirm({ type: 'user', label: `usuario ${u.name}` })}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium shrink-0"
                      style={{ border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626' }}
                      key={i}>
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PQRSF ── */}
          {section === 'pqrsf' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <h2 className="text-xl font-black mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Bandeja PQRSF</h2>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {pqrsfTickets.map((p, i) => (
                  <div key={p.id} style={{
                    display: 'flex', gap: 12, padding: '16px', alignItems: 'flex-start',
                    borderBottom: i < pqrsfTickets.length - 1 ? '1px solid var(--border)' : 'none',
                    backgroundColor: p.status === 'Pendiente' ? 'rgba(217,119,6,0.05)' : 'var(--card)',
                  }}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold" style={{ color: 'var(--muted-foreground)' }}>{p.id}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ backgroundColor: `${statusColor[p.status]}22`, color: statusColor[p.status] }}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--foreground)' }}>{p.subject}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{p.from} · {p.type} · {p.date}</p>
                    </div>
                    <button onClick={() => toast('info', 'Responder', `Respondiendo a ${p.from}`)}
                      className="text-xs px-3 py-1.5 rounded-lg font-bold text-white shrink-0"
                      style={{ backgroundColor: '#005187' }}>
                      Responder
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {section === 'settings' && (
            <div style={{ animation: 'fadeUp 0.4s ease', maxWidth: 560 }}>
              <h2 className="text-xl font-black mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Configuración del sitio</h2>
              <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                <form onSubmit={handleSettingsSave} className="space-y-4">
                  {[
                    { key: 'phone', label: 'Teléfono principal', placeholder: '+57 300 123 4567' },
                    { key: 'email', label: 'Correo de contacto', placeholder: 'info@lidessa.co' },
                    { key: 'address', label: 'Dirección', placeholder: 'Calle 100 # 19-61, Bogotá D.C.' },
                    { key: 'schedule', label: 'Horario de atención', placeholder: 'Lunes a viernes: 7:30 am – 5:30 pm' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>{f.label}</label>
                      <input value={settings[f.key]} placeholder={f.placeholder}
                        onChange={e => setSettings(prev => ({ ...prev, [f.key]: e.target.value }))}
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
                    Guardar configuración
                  </button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>
            <div className="flex justify-center mb-3" style={{ color: '#d97706' }}><AlertTriangle size={40} /></div>
            <h3 className="text-base font-black text-center mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
              ¿Confirmar eliminación?
            </h3>
            <p className="text-sm text-center mb-5" style={{ color: 'var(--muted-foreground)' }}>
              Está por eliminar <strong>{deleteConfirm.label}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors"
                style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                Cancelar
              </button>
              <button onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: '#dc2626' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {blogModal && (
        <BlogPostFormModal
          post={blogModal.mode === 'edit' ? blogModal.post : null}
          onSave={handleSaveBlogPost}
          onClose={() => setBlogModal(null)}
        />
      )}
    </div>
  )
}
