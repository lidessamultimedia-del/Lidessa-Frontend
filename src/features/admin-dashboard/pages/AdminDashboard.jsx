import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import { useBlog } from '@/features/blog/context/BlogContext'
import { usePQRSF } from '@/features/pqrsf/context/PQRSFContext'
import { useLMS } from '@/features/lms/context/LMSContext'
import { useServicesData } from '@/features/services/context/ServicesDataContext'
import BlogPostFormModal from '@/features/blog/components/BlogPostFormModal'
import CourseFormModal from '@/features/lms/components/CourseFormModal'
import TopicFormModal from '@/features/lms/components/TopicFormModal'
import LessonFormModal from '@/features/lms/components/LessonFormModal'
import AssignmentFormModal from '@/features/lms/components/AssignmentFormModal'
import QuizFormModal from '@/features/lms/components/QuizFormModal'
import PublishCourseModal from '@/features/lms/components/PublishCourseModal'
import GradebookReport from '@/features/lms/components/GradebookReport'
import CompletionReport from '@/features/lms/components/CompletionReport'
import CourseContentTab from '@/features/lms/components/CourseContentTab'
import CourseSettingsForm from '@/features/lms/components/CourseSettingsForm'
import DirectoryUserFormModal from '@/features/lms/components/DirectoryUserFormModal'
import DirectoryUserDetailModal from '@/features/lms/components/DirectoryUserDetailModal'
import PQRSFReplyModal from '@/features/pqrsf/components/PQRSFReplyModal'
import ServiceFormModal from '../components/ServiceFormModal'
import CatalogCourseFormModal from '../components/CatalogCourseFormModal'
import CategoriesManagerView from '../components/CategoriesManagerView'
import AnimatedCounter from '@/shared/components/AnimatedCounter'
import ThemeToggle from '@/shared/components/ThemeToggle'
import { courseCardStyle } from '@/features/lms/utils/courseCard'
import { BarChart2, Building, FileText, GraduationCap, Users, Clipboard, Sliders, Bell, User, AlertTriangle, Edit2, Plus, Send, BookOpen, Trash, Search, Eye, Lock, X } from '@/shared/components/Icons'

const SETTINGS_KEY = 'lidessa_site_settings'

const defaultSettings = {
  phone: '+57 300 123 4567',
  email: 'info@lidessa.co',
  address: 'Calle 100 # 19-61, Bogotá D.C.',
  schedule: 'Lunes a viernes: 7:30 am – 5:30 pm',
}

const statusColor = {
  'Pendiente': '#d97706',
  'Respondida': '#16a34a',
  'Revisando': '#005187',
}

const ADMIN_NOTIFICATIONS = [
  { id: 'n1', icon: Clipboard, text: 'Nueva PQRSF de María García', time: 'Hace 1 hora', section: 'pqrsf' },
  { id: 'n2', icon: User, text: 'Nuevo cliente registrado: Ana Martínez', time: 'Hace 3 horas', section: 'students' },
  { id: 'n3', icon: GraduationCap, text: '3 nuevas inscripciones en "Auditoría Interna"', time: 'Ayer', section: 'lms-courses' },
  { id: 'n4', icon: AlertTriangle, text: 'Servicio "PEI" requiere actualización normativa', time: 'Hace 2 días', section: 'services' },
  { id: 'n5', icon: FileText, text: 'Publicación programada lista para revisión', time: 'Hace 3 días', section: 'blog' },
]

export default function AdminDashboard({ theme, setTheme }) {
  const { user, logout, updateProfile } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { posts: blogPosts, addPost, updatePost, deletePost } = useBlog()
  const { tickets: pqrsfTickets, updateTicket: updatePQRSF } = usePQRSF()
  const lms = useLMS()
  const catalogCourses = lms.listedCourses
  const { services, addService, updateService, deleteService, toggleServiceActive, categories: serviceCategories, addCategory, updateCategory, toggleCategoryActive, deleteCategory } = useServicesData()
  const [section, setSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [bellOpen, setBellOpen] = useState(false)
  const [notifications, setNotifications] = useState(() => {
    const alreadySeen = (user?.unreadNotifications ?? 0) === 0
    return ADMIN_NOTIFICATIONS.map(n => ({ ...n, read: alreadySeen }))
  })
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [blogModal, setBlogModal] = useState(null)
  const [lmsCourseModal, setLmsCourseModal] = useState(null)
  const [lmsSelectedCourseId, setLmsSelectedCourseId] = useState(null)
  const [lmsCourseTab, setLmsCourseTab] = useState('content')
  const [lmsParticipantsView, setLmsParticipantsView] = useState('list')
  const [lmsAddStudentId, setLmsAddStudentId] = useState('')
  const [lmsTopicModal, setLmsTopicModal] = useState(null)
  const [lmsLessonModal, setLmsLessonModal] = useState(null)
  const [lmsAssignmentModal, setLmsAssignmentModal] = useState(null)
  const [lmsQuizModal, setLmsQuizModal] = useState(null)
  const [lmsPublishModal, setLmsPublishModal] = useState(null)
  const [directoryModal, setDirectoryModal] = useState(null)
  const [directoryDetailModal, setDirectoryDetailModal] = useState(null)
  const [serviceModal, setServiceModal] = useState(null)
  const [catalogModal, setCatalogModal] = useState(null)
  const [servicesTab, setServicesTab] = useState('list')
  const [pqrsfReplyModal, setPqrsfReplyModal] = useState(null)
  const [servicesSearch, setServicesSearch] = useState('')
  const [servicesCategoryFilter, setServicesCategoryFilter] = useState('all')
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false)
  const categoryFilterRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (categoryFilterRef.current && !categoryFilterRef.current.contains(e.target)) setCategoryFilterOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])
  const [lmsCoursesSearch, setLmsCoursesSearch] = useState('')
  const [lmsCoursesSort, setLmsCoursesSort] = useState('name')
  const [lmsCoursesFilter, setLmsCoursesFilter] = useState('all')
  const [directorySearch, setDirectorySearch] = useState('')
  const lmsSelectedCourse = lmsSelectedCourseId ? lms.courses.find(c => c.id === lmsSelectedCourseId) : null
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY)
      return stored ? JSON.parse(stored) : defaultSettings
    } catch {
      return defaultSettings
    }
  })

  function handleLogout() {
    logout()
    toast('info', 'Sesión cerrada', 'Has cerrado sesión del panel de administración.')
    navigate('/')
  }

  function toggleService(slug) {
    const svc = services.find(s => s.slug === slug)
    toggleServiceActive(slug)
    toast(svc.active === false ? 'success' : 'warning', svc.active === false ? 'Servicio activado' : 'Servicio desactivado', svc.title)
  }

  function handleAddCategory(name) {
    addCategory(name)
    toast('success', 'Categoría creada', name)
  }

  function toggleCategory(name) {
    const cat = serviceCategories.find(c => c.name === name)
    toggleCategoryActive(name)
    toast(cat.active === false ? 'success' : 'warning', cat.active === false ? 'Categoría activada' : 'Categoría desactivada', name)
  }

  function handleSaveService(form) {
    if (serviceModal.mode === 'edit') {
      updateService(serviceModal.service.slug, form)
      toast('success', 'Servicio actualizado', form.title)
    } else {
      addService(form)
      toast('success', 'Servicio creado', form.title)
    }
    setServiceModal(null)
  }

  function handleRequestDeleteCategory(name, inUse) {
    if (inUse > 0) {
      toast('warning', 'No se puede eliminar', `${inUse} servicio(s) todavía usan "${name}". Cámbieles la categoría primero.`)
      return
    }
    setDeleteConfirm({ type: 'category', id: name, label: name })
  }

  function handleSaveCatalogCourse(form) {
    if (catalogModal.mode === 'edit') {
      lms.updateCourse(catalogModal.course.id, form)
      toast('success', 'Curso actualizado', form.name)
    } else {
      lms.addCourse({
        listed: true, published: false, visible: true,
        teacherId: null, format: 'topics', completionTrackingEnabled: true,
        requiresPassword: false, password: '', selfEnrollment: true, guestAccess: false,
        capacity: 100, color: '#005187', startDate: '', endDate: '',
        ...form,
      })
      toast('success', 'Curso creado', 'Ya aparece en la página pública de CEET y en Cursos (LMS) para que un profesor lo complete.')
    }
    setCatalogModal(null)
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10)
  }

  function lmsCourseAvgCompletion(courseId) {
    const course = lms.courses.find(c => c.id === courseId)
    if (!course || course.studentIds.length === 0) return 0
    const pcts = course.studentIds.map(sid => {
      const comp = lms.courseCompletion(sid, courseId)
      return comp.total ? (comp.completed / comp.total) * 100 : 0
    })
    return Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length)
  }

  function togglePublishLmsCourse(course) {
    lms.updateCourse(course.id, { published: !course.published })
    toast(course.published ? 'warning' : 'success', course.published ? 'Curso despublicado' : 'Curso publicado', course.name)
  }

  function handleOpenPublishModal(course) {
    if (!course.teacherId) {
      toast('warning', 'Falta asignar profesor', 'Asigna un profesor al curso antes de publicarlo.')
      return
    }
    setLmsPublishModal(course)
  }

  function openLmsCourseDetail(courseId, tab = 'content') {
    setLmsSelectedCourseId(courseId)
    setLmsCourseTab(tab)
    setLmsParticipantsView('list')
  }

  function handleReplyPQRSF(response) {
    updatePQRSF(pqrsfReplyModal.id, { status: 'Respondida', response })
    toast('success', 'Respuesta enviada', `Se respondió a ${pqrsfReplyModal.from}`)
    setPqrsfReplyModal(null)
  }

  function handleDeleteConfirm() {
    if (deleteConfirm.type === 'blog') {
      deletePost(deleteConfirm.id)
      toast('success', 'Publicación eliminada', deleteConfirm.label)
    } else if (deleteConfirm.type === 'lmsCourse') {
      lms.deleteCourse(deleteConfirm.id)
      if (lmsSelectedCourseId === deleteConfirm.id) setLmsSelectedCourseId(null)
      toast('success', 'Curso eliminado', deleteConfirm.label)
    } else if (deleteConfirm.type === 'topic') {
      lms.deleteTopic(deleteConfirm.id)
      toast('success', 'Eliminado', deleteConfirm.label)
    } else if (deleteConfirm.type === 'lesson') {
      lms.deleteLesson(deleteConfirm.id)
      toast('success', 'Eliminado', deleteConfirm.label)
    } else if (deleteConfirm.type === 'assignment') {
      lms.deleteAssignment(deleteConfirm.id)
      toast('success', 'Eliminado', deleteConfirm.label)
    } else if (deleteConfirm.type === 'quiz') {
      lms.deleteQuiz(deleteConfirm.id)
      toast('success', 'Eliminado', deleteConfirm.label)
    } else if (deleteConfirm.type === 'directory') {
      lms.deleteDirectoryUser(deleteConfirm.id)
      toast('success', 'Usuario eliminado', deleteConfirm.label)
    } else if (deleteConfirm.type === 'service') {
      deleteService(deleteConfirm.id)
      toast('success', 'Servicio eliminado', deleteConfirm.label)
    } else if (deleteConfirm.type === 'catalogCourse') {
      lms.deleteCourse(deleteConfirm.id)
      if (lmsSelectedCourseId === deleteConfirm.id) setLmsSelectedCourseId(null)
      toast('success', 'Curso eliminado', deleteConfirm.label)
    } else if (deleteConfirm.type === 'category') {
      deleteCategory(deleteConfirm.id)
      if (servicesCategoryFilter === deleteConfirm.id) setServicesCategoryFilter('all')
      toast('success', 'Categoría eliminada', deleteConfirm.label)
    } else {
      toast('success', 'Elemento eliminado', 'El registro fue eliminado correctamente.')
    }
    setDeleteConfirm(null)
  }

  function handleSaveLmsCourse(form) {
    if (lmsCourseModal.mode === 'edit') {
      lms.updateCourse(lmsCourseModal.course.id, form)
      toast('success', 'Curso actualizado', form.name)
    } else {
      const created = lms.addCourse(form)
      toast('success', 'Curso creado como borrador', form.name)
      openLmsCourseDetail(created.id)
    }
    setLmsCourseModal(null)
  }

  function handleSaveDirectoryUser(form) {
    if (directoryModal.mode === 'edit') {
      lms.updateDirectoryUser(directoryModal.user.id, form)
      toast('success', 'Usuario actualizado', form.name)
    } else {
      lms.addDirectoryUser(form)
      toast('success', `${form.role === 'profesor' ? 'Profesor' : 'Estudiante'} creado`, form.name)
    }
    setDirectoryModal(null)
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
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    toast('success', 'Configuración guardada', 'Los cambios fueron aplicados exitosamente.')
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'services', label: 'Servicios', icon: Building },
    { id: 'blog', label: 'Converge', icon: FileText },
    { id: 'courses', label: 'CEET', icon: GraduationCap },
    { id: 'pqrsf', label: 'PQRSF', icon: Clipboard },
    { id: 'lms-divider', divider: true, label: 'LMS' },
    { id: 'lms-courses', label: 'Cursos (LMS)', icon: BookOpen },
    { id: 'teachers', label: 'Profesores', icon: User },
    { id: 'students', label: 'Estudiantes', icon: Users },
    { id: 'settings', label: 'Configuración', icon: Sliders },
  ]

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 232 : 68,
        height: '100%',
        background: 'linear-gradient(180deg, #10294d 0%, #071426 55%, #0c0c0c 100%)',
        transition: 'width 0.25s ease',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRight: '1px solid rgba(232,199,102,0.15)',
      }}>
        <div style={{ padding: '22px 16px', borderBottom: '1px solid rgba(232,199,102,0.15)' }}>
          <div className="flex items-center gap-2.5">
            <img src="/assets/logolidessa.png" alt="Lidessa" className="shrink-0"
              style={{ width: 34, height: 34, objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(232,199,102,0.35))' }} />
            {sidebarOpen && (
              <div className="min-w-0">
                <span className="font-black text-white text-sm block truncate tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>LIDESSA</span>
                <span className="text-[11px] block truncate" style={{ color: '#e8c766', letterSpacing: '0.04em' }}>PANEL ADMIN</span>
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
            {navItems.map(item => item.divider ? (
              sidebarOpen && (
                <p key={item.id} className="text-[10px] font-bold px-3 pt-4 pb-1" style={{ color: 'rgba(232,199,102,0.5)', letterSpacing: '0.12em' }}>
                  {item.label}
                </p>
              )
            ) : (
              <button key={item.id}
                onClick={() => setSection(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 11,
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  width: '100%', padding: sidebarOpen ? '9px 11px' : '9px 0', borderRadius: 10,
                  background: sidebarOpen && section === item.id
                    ? 'linear-gradient(135deg, rgba(232,199,102,0.18) 0%, rgba(232,199,102,0.06) 100%)'
                    : 'transparent',
                  color: section === item.id ? '#e8c766' : 'rgba(255,255,255,0.6)',
                  border: sidebarOpen && section === item.id ? '1px solid rgba(232,199,102,0.35)' : '1px solid transparent',
                  boxShadow: sidebarOpen && section === item.id ? '0 4px 16px rgba(232,199,102,0.14)' : 'none',
                  cursor: 'pointer', textAlign: 'left',
                  transform: 'translateX(0)',
                  transition: 'background 0.35s ease, border-color 0.35s ease, color 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease',
                }}
                onMouseEnter={e => {
                  if (section === item.id) return
                  if (sidebarOpen) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(232,199,102,0.1) 0%, rgba(255,255,255,0.04) 100%)'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }
                  e.currentTarget.style.color = '#e8c766'
                }}
                onMouseLeave={e => {
                  if (section === item.id) return
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                  e.currentTarget.style.transform = 'translateX(0)'
                }}
              >
                <span style={{
                  flexShrink: 0, width: 28, height: 28, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: section === item.id ? 'rgba(232,199,102,0.16)' : 'rgba(255,255,255,0.05)',
                  border: !sidebarOpen && section === item.id ? '1px solid rgba(232,199,102,0.35)' : '1px solid transparent',
                  transition: 'background-color 0.35s ease, border-color 0.35s ease',
                }}>
                  <item.icon size={15} />
                </span>
                {sidebarOpen && <span className="text-sm font-semibold truncate">{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>

        <div style={{ padding: 12, borderTop: '1px solid rgba(232,199,102,0.15)' }}>
          <button onClick={() => setSidebarOpen(s => !s)} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '8px 10px', borderRadius: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.4)', fontSize: 12, transition: 'background-color 0.15s, color 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#e8c766' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
          >
            <span style={{ flexShrink: 0, fontSize: 14, transform: sidebarOpen ? 'none' : 'rotate(180deg)', transition: 'transform 0.25s ease' }}>◀</span>
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
            <ThemeToggle theme={theme} setTheme={setTheme} />
            {/* Bell */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => {
                const next = !bellOpen
                setBellOpen(next)
                if (next) {
                  setNotifications(ns => ns.map(n => ({ ...n, read: true })))
                  updateProfile({ unreadNotifications: 0 })
                }
              }}
                style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--foreground)' }}>
                <Bell size={20} />
                {(user?.unreadNotifications ?? 0) > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    width: 18, height: 18, borderRadius: '50%',
                    backgroundColor: '#dc2626', color: 'white',
                    fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{user.unreadNotifications}</span>
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
                    <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Notificaciones admin</span>
                  </div>
                  {notifications.map((n, i) => (
                    <div key={n.id}
                      onClick={() => { setSection(n.section); setBellOpen(false) }}
                      className="cursor-pointer transition-colors"
                      style={{
                        padding: '10px 16px',
                        borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                        backgroundColor: !n.read ? 'rgba(0,81,135,0.05)' : 'transparent',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,81,135,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = !n.read ? 'rgba(0,81,135,0.05)' : 'transparent'}
                    >
                      <div className="flex gap-3">
                        <span style={{ flexShrink: 0, color: 'var(--muted-foreground)', position: 'relative' }}>
                          <n.icon size={16} />
                          {!n.read && (
                            <span style={{
                              position: 'absolute', top: -2, right: -2,
                              width: 6, height: 6, borderRadius: '50%', backgroundColor: '#005187',
                            }} />
                          )}
                        </span>
                        <div>
                          <p className="text-xs" style={{ color: 'var(--foreground)', opacity: n.read ? 0.65 : 1 }}>{n.text}</p>
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
          {section === 'services' && (() => {
            const filteredServices = services
              .filter(s => s.title.toLowerCase().includes(servicesSearch.toLowerCase()))
              .filter(s => servicesCategoryFilter === 'all' || s.category === servicesCategoryFilter)
            return (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Servicios</h2>
                {servicesTab === 'list' && (
                  <button onClick={() => setServiceModal({ mode: 'new' })}
                    className="px-4 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-1.5 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #005187 0%, #4d82bc 55%, #b8860b 100%)', boxShadow: '0 4px 14px rgba(0,81,135,0.25)' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <Plus size={14} /> Nuevo servicio
                  </button>
                )}
              </div>
              <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>
                {services.length} servicios · {services.filter(s => s.active !== false).length} activos · {serviceCategories.length} categorías
              </p>

              {/* Tabs: Servicios / Categorías */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl mb-5 w-fit" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                {[{ id: 'list', label: 'Servicios' }, { id: 'categories', label: 'Categorías' }].map(t => (
                  <button key={t.id} onClick={() => setServicesTab(t.id)}
                    className="px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                    style={{
                      backgroundColor: servicesTab === t.id ? 'var(--card)' : 'transparent',
                      color: servicesTab === t.id ? '#005187' : 'var(--muted-foreground)',
                      boxShadow: servicesTab === t.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {servicesTab === 'categories' ? (
                <CategoriesManagerView
                  categories={serviceCategories}
                  services={services}
                  onAdd={handleAddCategory}
                  onUpdate={updateCategory}
                  onToggleActive={toggleCategory}
                  onRequestDelete={handleRequestDeleteCategory}
                />
              ) : (
              <>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl mb-4" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', maxWidth: 340 }}>
                <Search size={15} style={{ color: 'var(--muted-foreground)' }} />
                <input value={servicesSearch} onChange={e => setServicesSearch(e.target.value)} placeholder="Buscar servicio…"
                  className="text-sm outline-none bg-transparent flex-1" style={{ color: 'var(--foreground)' }} />
              </div>
              <div className="relative inline-block mb-5" ref={categoryFilterRef}>
                <button onClick={() => setCategoryFilterOpen(o => !o)}
                  className="text-sm px-3.5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors"
                  style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                >
                  Categoría: <strong style={{ color: '#005187' }}>{servicesCategoryFilter === 'all' ? 'Todas' : servicesCategoryFilter}</strong>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ transition: 'transform 0.2s ease', transform: categoryFilterOpen ? 'rotate(180deg)' : 'none' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {categoryFilterOpen && (
                  <div className="absolute top-full left-0 mt-1.5 rounded-xl overflow-hidden z-20"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 12px 32px rgba(0,0,0,0.15)', minWidth: 240, animation: 'fadeUp 0.15s ease' }}>
                    {['all', ...serviceCategories.map(c => c.name)].map(cat => (
                      <div key={cat}
                        onClick={() => { setServicesCategoryFilter(cat); setCategoryFilterOpen(false) }}
                        className="px-3.5 py-2.5 text-sm cursor-pointer transition-colors"
                        style={{
                          backgroundColor: servicesCategoryFilter === cat ? 'rgba(0,81,135,0.08)' : 'transparent',
                          color: servicesCategoryFilter === cat ? '#005187' : 'var(--foreground)',
                          fontWeight: servicesCategoryFilter === cat ? 700 : 500,
                        }}
                        onMouseEnter={e => { if (servicesCategoryFilter !== cat) e.currentTarget.style.backgroundColor = 'var(--muted)' }}
                        onMouseLeave={e => { if (servicesCategoryFilter !== cat) e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        {cat === 'all' ? 'Todas' : cat}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                {filteredServices.map((s, i) => {
                  const isActive = s.active !== false
                  return (
                  <div key={s.slug}
                    className="transition-colors"
                    style={{
                      display: 'flex', gap: 16, padding: '13px 20px', alignItems: 'center',
                      borderBottom: i < filteredServices.length - 1 ? '1px solid var(--border)' : 'none',
                      backgroundColor: 'var(--card)',
                      opacity: 0,
                      animation: 'fadeUpSoft 0.45s ease forwards',
                      animationDelay: `${Math.min(i * 0.04, 0.3)}s`,
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--card)'}
                  >
                    {s.hero ? (
                      <img src={s.hero} alt={s.title} className="w-14 h-11 object-cover rounded-lg shrink-0" style={{ border: '1px solid var(--border)' }} />
                    ) : (
                      <div className="w-14 h-11 rounded-lg shrink-0" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{s.title}</p>
                        {s.locked && (
                          <span title="Contenido protegido" style={{ color: 'var(--muted-foreground)', opacity: 0.6, display: 'inline-flex', shrink: 0 }}>
                            <Lock size={11} />
                          </span>
                        )}
                      </div>
                      <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{s.category}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Toggle activo/inactivo */}
                      <button
                        onClick={() => toggleService(s.slug)}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.94)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        role="switch"
                        aria-checked={isActive}
                        title={isActive ? 'Desactivar' : 'Activar'}
                        className="relative shrink-0"
                        style={{
                          width: 40, height: 22, borderRadius: 9999,
                          backgroundColor: isActive ? '#16a34a' : 'var(--border)',
                          boxShadow: isActive ? '0 0 0 4px rgba(22,163,74,0.15)' : '0 0 0 4px transparent',
                          transition: 'background-color 0.35s ease, box-shadow 0.35s ease, transform 0.15s ease',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute', top: 2, left: isActive ? 20 : 2,
                            width: 18, height: 18, borderRadius: '50%',
                            backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                            transition: 'left 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          }}
                        />
                      </button>

                      <a href={`/servicios/${s.slug}`} target="_blank" rel="noreferrer" title="Ver en el sitio"
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#4d82bc'; e.currentTarget.style.color = '#4d82bc' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
                      >
                        <Eye size={14} />
                      </a>

                      <button onClick={() => setServiceModal({ mode: 'edit', service: s })} title="Editar"
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ backgroundColor: 'rgba(0,81,135,0.1)', color: '#005187', border: '1px solid rgba(0,81,135,0.2)' }}>
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => setDeleteConfirm({ type: 'service', id: s.slug, label: s.title })} title="Eliminar"
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626' }}>
                        <Trash size={13} />
                      </button>
                    </div>
                  </div>
                  )
                })}
                {filteredServices.length === 0 && (
                  <p className="text-sm px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}>
                    Sin resultados para esa búsqueda.
                  </p>
                )}
              </div>
              </>
              )}
            </div>
            )
          })()}

          {/* ── BLOG ── */}
          {section === 'blog' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Converge</h2>
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
                      <h3 className="font-bold text-sm mb-1 leading-snug" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                        {post.title}
                      </h3>
                      <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>{post.date} · {post.author}</p>
                      <div className="flex gap-2">
                        <button onClick={() => setBlogModal({ mode: 'edit', post })} title="Editar"
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                          style={{ backgroundColor: 'rgba(0,81,135,0.1)', color: '#005187', border: '1px solid rgba(0,81,135,0.2)' }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteConfirm({ type: 'blog', id: post.id, label: post.title })} title="Eliminar"
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                          style={{ border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626' }}>
                          <Trash size={13} />
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
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>CEET</h2>
                <button onClick={() => setCatalogModal({ mode: 'new' })}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-1.5"
                  style={{ backgroundColor: '#005187' }}>
                  <Plus size={14} /> Nuevo curso
                </button>
              </div>
              <p className="text-xs mb-6" style={{ color: 'var(--muted-foreground)' }}>
                Aquí solo se registra la información pública del curso (nombre, categoría, descripción, duración, imagen, certificado).
                No aparece en la página web hasta que le des <strong style={{ color: 'var(--foreground)' }}>Publicar</strong>. Para armar el
                contenido real (temas, materiales, tareas, exámenes) y asignar un profesor, ábrelo en <strong style={{ color: 'var(--foreground)' }}>Cursos (LMS)</strong>.
              </p>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {catalogCourses.map((c, i) => (
                  <div key={c.id} style={{
                    display: 'flex', gap: 12, padding: '14px 16px', alignItems: 'center',
                    borderBottom: i < catalogCourses.length - 1 ? '1px solid var(--border)' : 'none',
                    backgroundColor: 'var(--card)',
                  }}>
                    {c.image ? (
                      <img src={c.image} alt={c.name} className="w-12 h-10 object-cover rounded-lg shrink-0" />
                    ) : (
                      <div className="w-12 h-10 rounded-lg shrink-0" style={{ backgroundColor: 'var(--muted)' }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{c.name}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{c.category} · {c.duration} · {c.modality}</p>
                    </div>
                    <button onClick={() => c.published ? togglePublishLmsCourse(c) : handleOpenPublishModal(c)}
                      className="text-xs px-2 py-0.5 rounded-full font-semibold w-fit shrink-0 transition-opacity hover:opacity-75"
                      title={c.published ? 'Click para despublicar' : 'Click para ver el resumen y publicar'}
                      style={{ backgroundColor: c.published ? 'rgba(22,163,74,0.12)' : 'rgba(217,119,6,0.12)', color: c.published ? '#16a34a' : '#d97706' }}>
                      {c.published ? '✓ Publicado en LMS' : c.teacherId ? '⏳ Sin publicar' : '⏳ Sin profesor'}
                    </button>
                    <button onClick={() => setCatalogModal({ mode: 'edit', course: c })} title="Editar"
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                      style={{ backgroundColor: 'rgba(0,81,135,0.1)', color: '#005187', border: '1px solid rgba(0,81,135,0.2)' }}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => setDeleteConfirm({ type: 'catalogCourse', id: c.id, label: c.name })} title="Eliminar"
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                      style={{ border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626' }}>
                      <Trash size={13} />
                    </button>
                  </div>
                ))}
                {catalogCourses.length === 0 && (
                  <p className="text-sm px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}>
                    No hay cursos en el catálogo todavía.
                  </p>
                )}
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
                      {p.response && (
                        <p className="text-xs mt-2 p-2 rounded-lg" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}>
                          <strong style={{ color: 'var(--foreground)' }}>Respuesta:</strong> {p.response}
                        </p>
                      )}
                    </div>
                    <button onClick={() => setPqrsfReplyModal(p)}
                      className="text-xs px-3 py-1.5 rounded-lg font-bold text-white shrink-0"
                      style={{ backgroundColor: '#005187' }}>
                      {p.status === 'Respondida' ? 'Editar respuesta' : 'Responder'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── LMS: CURSOS ── */}
          {section === 'lms-courses' && (
            lmsSelectedCourse ? (
              <AdminLmsCourseDetail
                course={lmsSelectedCourse}
                lms={lms}
                toast={toast}
                tab={lmsCourseTab}
                setTab={setLmsCourseTab}
                participantsView={lmsParticipantsView}
                setParticipantsView={setLmsParticipantsView}
                addStudentId={lmsAddStudentId}
                setAddStudentId={setLmsAddStudentId}
                onBack={() => setLmsSelectedCourseId(null)}
                onPublish={() => handleOpenPublishModal(lmsSelectedCourse)}
                onUnpublish={() => togglePublishLmsCourse(lmsSelectedCourse)}
                onEditCourse={() => setLmsCourseModal({ mode: 'edit', course: lmsSelectedCourse })}
                onAddTopic={() => setLmsTopicModal({ mode: 'new' })}
                onEditTopic={topic => setLmsTopicModal({ mode: 'edit', topic })}
                onDeleteTopic={topic => setDeleteConfirm({ type: 'topic', id: topic.id, label: topic.title })}
                onAddLesson={topicId => setLmsLessonModal({ mode: 'new', topicId })}
                onEditLesson={lesson => setLmsLessonModal({ mode: 'edit', lesson })}
                onDeleteLesson={lesson => setDeleteConfirm({ type: 'lesson', id: lesson.id, label: lesson.title })}
                onAddAssignment={topicId => setLmsAssignmentModal({ mode: 'new', topicId })}
                onEditAssignment={assignment => setLmsAssignmentModal({ mode: 'edit', assignment })}
                onDeleteAssignment={assignment => setDeleteConfirm({ type: 'assignment', id: assignment.id, label: assignment.title })}
                onAddQuiz={topicId => setLmsQuizModal({ mode: 'new', topicId })}
                onEditQuiz={quiz => setLmsQuizModal({ mode: 'edit', quiz })}
                onDeleteQuiz={quiz => setDeleteConfirm({ type: 'quiz', id: quiz.id, label: quiz.title })}
                onPublishLesson={lesson => {
                  const next = lesson.publishAt ? '' : todayISO()
                  lms.updateLesson(lesson.id, { publishAt: next })
                  toast(next ? 'success' : 'warning', next ? 'Material publicado' : 'Publicación cancelada', lesson.title)
                }}
                onPublishAssignment={assignment => {
                  const next = assignment.publishAt ? '' : todayISO()
                  lms.updateAssignment(assignment.id, { publishAt: next })
                  toast(next ? 'success' : 'warning', next ? 'Tarea publicada' : 'Publicación cancelada', assignment.title)
                }}
                onPublishQuiz={quiz => {
                  const next = quiz.publishAt ? '' : todayISO()
                  lms.updateQuiz(quiz.id, { publishAt: next })
                  toast(next ? 'success' : 'warning', next ? 'Examen publicado' : 'Publicación cancelada', quiz.title)
                }}
              />
            ) : (
              <div style={{ animation: 'fadeUp 0.4s ease' }}>
                <div className="mb-6">
                  <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Cursos del LMS</h2>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                    Los cursos se crean desde <strong style={{ color: 'var(--foreground)' }}>CEET</strong>. Aquí solo se asigna profesor, se arma el
                    contenido y se revisan calificaciones.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', width: 260 }}>
                    <Search size={14} style={{ color: 'var(--muted-foreground)' }} />
                    <input value={lmsCoursesSearch} onChange={e => setLmsCoursesSearch(e.target.value)} placeholder="Buscar…"
                      className="text-sm outline-none bg-transparent flex-1" style={{ color: 'var(--foreground)' }} />
                  </div>
                  <select value={lmsCoursesSort} onChange={e => setLmsCoursesSort(e.target.value)}
                    className="text-xs px-3 py-2 rounded-lg outline-none"
                    style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                    <option value="name">Ordenar: Nombre</option>
                    <option value="date">Ordenar: Más reciente</option>
                  </select>
                  <select value={lmsCoursesFilter} onChange={e => setLmsCoursesFilter(e.target.value)}
                    className="text-xs px-3 py-2 rounded-lg outline-none"
                    style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                    <option value="all">Todos los estados</option>
                    <option value="published">Publicados</option>
                    <option value="draft">Borradores</option>
                  </select>
                </div>
                {(() => {
                  let filteredCourses = lms.courses.filter(c => c.name.toLowerCase().includes(lmsCoursesSearch.toLowerCase()))
                  if (lmsCoursesFilter !== 'all') filteredCourses = filteredCourses.filter(c => lmsCoursesFilter === 'published' ? c.published : !c.published)
                  filteredCourses = [...filteredCourses].sort((a, b) => lmsCoursesSort === 'name' ? a.name.localeCompare(b.name) : (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
                  if (filteredCourses.length === 0) {
                    return (
                      <div className="rounded-xl" style={{ border: '1px solid var(--border)' }}>
                        <p className="text-sm px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}>
                          {lms.courses.length === 0 ? 'No hay cursos LMS todavía.' : 'Sin resultados para esa búsqueda.'}
                        </p>
                      </div>
                    )
                  }
                  return (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredCourses.map((c, i) => (
                        <div key={c.id} className="rounded-xl overflow-hidden transition-shadow hover:shadow-md" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                          <button onClick={() => openLmsCourseDetail(c.id)} className="block w-full text-left" style={{ height: 90, ...courseCardStyle(c, i) }} />
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-0.5">
                              <button onClick={() => openLmsCourseDetail(c.id)}
                                className="font-bold text-sm leading-snug text-left hover:underline"
                                style={{ fontFamily: 'var(--font-display)', color: '#005187' }}>
                                {c.name}
                              </button>
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0"
                                title={c.published && c.listed ? 'Visible en la página pública de CEET' : 'Aún no aparece en la página pública de CEET'}
                                style={{ backgroundColor: c.published && c.listed ? 'rgba(22,163,74,0.12)' : 'rgba(217,119,6,0.12)', color: c.published && c.listed ? '#16a34a' : '#d97706' }}>
                                {c.published && c.listed ? '✓ Publicado' : '⏳ Borrador'}
                              </span>
                            </div>
                            <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>
                              {lms.topicsByCourse(c.id).length} temas · {lms.lessonsByCourse(c.id).length} lecciones · {lms.assignmentsByCourse(c.id).length} tareas
                            </p>
                            <div className="mb-3">
                              <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
                                <span>Progreso</span><span>{lmsCourseAvgCompletion(c.id)}%</span>
                              </div>
                              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
                                <div style={{ width: `${lmsCourseAvgCompletion(c.id)}%`, height: '100%', backgroundColor: c.color ?? '#005187' }} />
                              </div>
                            </div>
                            <select
                              value={c.teacherId ?? ''}
                              onChange={e => {
                                const teacherId = e.target.value || null
                                lms.updateCourse(c.id, { teacherId })
                                toast('success', teacherId ? 'Profesor asignado' : 'Profesor removido', teacherId ? lms.teacherName(teacherId) : c.name)
                              }}
                              className="text-sm px-2 py-1.5 rounded-lg outline-none w-full mb-3"
                              style={{
                                backgroundColor: c.teacherId ? 'var(--muted)' : 'rgba(217,119,6,0.1)',
                                color: c.teacherId ? 'var(--foreground)' : '#d97706',
                                border: c.teacherId ? '1px solid var(--border)' : '1px solid rgba(217,119,6,0.3)',
                              }}
                            >
                              <option value="">Sin asignar</option>
                              {lms.directory.filter(u => u.role === 'profesor').map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
                                <Users size={13} /> {c.studentIds.length} estudiante{c.studentIds.length === 1 ? '' : 's'}
                              </span>
                              <div className="flex gap-2 shrink-0">
                                <button onClick={() => openLmsCourseDetail(c.id)} title="Ver contenido"
                                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                                  style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
                                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#4d82bc'; e.currentTarget.style.color = '#4d82bc' }}
                                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
                                >
                                  <Eye size={13} />
                                </button>
                                <button onClick={() => openLmsCourseDetail(c.id, 'grades')} title="Reportes"
                                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                                  style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
                                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#4d82bc'; e.currentTarget.style.color = '#4d82bc' }}
                                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
                                >
                                  <BarChart2 size={13} />
                                </button>
                                <button onClick={() => setDeleteConfirm({ type: 'lmsCourse', id: c.id, label: c.name })} title="Eliminar"
                                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                                  style={{ border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626' }}>
                                  <Trash size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            )
          )}

          {/* ── LMS: PROFESORES / ESTUDIANTES ── */}
          {(section === 'teachers' || section === 'students') && (() => {
            const role = section === 'teachers' ? 'profesor' : 'estudiante'
            const roleLabel = section === 'teachers' ? 'profesor' : 'estudiante'
            const rows = lms.directory.filter(u => u.role === role)
              .filter(u => u.name.toLowerCase().includes(directorySearch.toLowerCase()) || u.email.toLowerCase().includes(directorySearch.toLowerCase()))
            return (
              <div style={{ animation: 'fadeUp 0.4s ease' }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                    {section === 'teachers' ? 'Profesores' : 'Estudiantes'}
                  </h2>
                  <button onClick={() => setDirectoryModal({ mode: 'new', role })}
                    className="px-4 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-1.5"
                    style={{ backgroundColor: '#005187' }}>
                    <Plus size={14} /> Nuevo {roleLabel}
                  </button>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', width: 260 }}>
                  <Search size={14} style={{ color: 'var(--muted-foreground)' }} />
                  <input value={directorySearch} onChange={e => setDirectorySearch(e.target.value)} placeholder={`Buscar ${roleLabel}…`}
                    className="text-sm outline-none bg-transparent flex-1" style={{ color: 'var(--foreground)' }} />
                </div>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0 16px', padding: '10px 16px', backgroundColor: 'var(--muted)' }}>
                    {['Nombre', 'Ingreso', 'Estado', ''].map(h => (
                      <span key={h} className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{h}</span>
                    ))}
                  </div>
                  {rows.map(u => (
                    <div key={u.id} style={{
                      display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto',
                      gap: '0 16px', padding: '12px 16px', alignItems: 'center',
                      borderTop: '1px solid var(--border)', backgroundColor: 'var(--card)',
                    }}>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{u.name}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{u.email}</p>
                        {u.courseInterest && (
                          <p className="text-xs font-medium mt-0.5" style={{ color: '#005187' }}>Interesado en: {u.courseInterest}</p>
                        )}
                      </div>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{u.joined}</p>
                      <button onClick={() => lms.toggleDirectoryUserActive(u.id)}
                        className="text-xs px-2 py-1 rounded-full font-semibold w-fit"
                        style={{ backgroundColor: u.active ? 'rgba(22,163,74,0.12)' : 'var(--muted)', color: u.active ? '#16a34a' : 'var(--muted-foreground)' }}>
                        {u.active ? 'Activo' : 'Inactivo'}
                      </button>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => setDirectoryDetailModal({ role, user: u })} title="Ver detalle"
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#4d82bc'; e.currentTarget.style.color = '#4d82bc' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
                        >
                          <Eye size={14} />
                        </button>
                        <button onClick={() => setDirectoryModal({ mode: 'edit', role, user: u })} title="Editar"
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                          style={{ backgroundColor: 'rgba(0,81,135,0.1)', color: '#005187', border: '1px solid rgba(0,81,135,0.2)' }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteConfirm({ type: 'directory', id: u.id, label: u.name })}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium"
                          style={{ border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626' }}>
                          <Trash size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {rows.length === 0 && (
                    <p className="text-sm px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}>
                      {directorySearch ? 'Sin resultados para esa búsqueda.' : 'Sin registros todavía.'}
                    </p>
                  )}
                </div>
              </div>
            )
          })()}

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

      {lmsCourseModal && (
        <CourseFormModal
          course={lmsCourseModal.mode === 'edit' ? lmsCourseModal.course : null}
          teachers={lms.directory.filter(u => u.role === 'profesor')}
          showTeacherSelect
          onSave={handleSaveLmsCourse}
          onClose={() => setLmsCourseModal(null)}
        />
      )}
      {lmsTopicModal && lmsSelectedCourse && (
        <TopicFormModal
          topic={lmsTopicModal.mode === 'edit' ? lmsTopicModal.topic : null}
          onSave={form => {
            if (lmsTopicModal.mode === 'edit') { lms.updateTopic(lmsTopicModal.topic.id, form); toast('success', 'Tema actualizado', form.title) }
            else { lms.addTopic(lmsSelectedCourse.id, form); toast('success', 'Tema creado', form.title) }
            setLmsTopicModal(null)
          }}
          onClose={() => setLmsTopicModal(null)}
        />
      )}
      {lmsLessonModal && lmsSelectedCourse && (
        <LessonFormModal
          lesson={lmsLessonModal.mode === 'edit' ? lmsLessonModal.lesson : null}
          topics={lms.topicsByCourse(lmsSelectedCourse.id)}
          initialTopicId={lmsLessonModal.topicId}
          onSave={form => {
            if (lmsLessonModal.mode === 'edit') { lms.updateLesson(lmsLessonModal.lesson.id, form); toast('success', 'Lección actualizada', form.title) }
            else { lms.addLesson(lmsSelectedCourse.id, form); toast('success', 'Lección creada', form.title) }
            setLmsLessonModal(null)
          }}
          onClose={() => setLmsLessonModal(null)}
        />
      )}
      {lmsAssignmentModal && lmsSelectedCourse && (
        <AssignmentFormModal
          assignment={lmsAssignmentModal.mode === 'edit' ? lmsAssignmentModal.assignment : null}
          topics={lms.topicsByCourse(lmsSelectedCourse.id)}
          initialTopicId={lmsAssignmentModal.topicId}
          onSave={form => {
            if (lmsAssignmentModal.mode === 'edit') { lms.updateAssignment(lmsAssignmentModal.assignment.id, form); toast('success', 'Tarea actualizada', form.title) }
            else { lms.addAssignment(lmsSelectedCourse.id, form); toast('success', 'Tarea creada', form.title) }
            setLmsAssignmentModal(null)
          }}
          onClose={() => setLmsAssignmentModal(null)}
        />
      )}
      {lmsQuizModal && lmsSelectedCourse && (
        <QuizFormModal
          quiz={lmsQuizModal.mode === 'edit' ? lmsQuizModal.quiz : null}
          topics={lms.topicsByCourse(lmsSelectedCourse.id)}
          initialTopicId={lmsQuizModal.topicId}
          onSave={form => {
            if (lmsQuizModal.mode === 'edit') { lms.updateQuiz(lmsQuizModal.quiz.id, form); toast('success', 'Examen actualizado', form.title) }
            else { lms.addQuiz(lmsSelectedCourse.id, form); toast('success', 'Examen creado', form.title) }
            setLmsQuizModal(null)
          }}
          onClose={() => setLmsQuizModal(null)}
        />
      )}
      {lmsPublishModal && (
        <PublishCourseModal
          course={lmsPublishModal}
          topicsCount={lms.topicsByCourse(lmsPublishModal.id).length}
          lessonsCount={lms.lessonsByCourse(lmsPublishModal.id).length}
          assignmentsCount={lms.assignmentsByCourse(lmsPublishModal.id).length}
          quizzesCount={lms.quizzesByCourse(lmsPublishModal.id).length}
          onConfirm={() => {
            lms.updateCourse(lmsPublishModal.id, { published: true, listed: true })
            toast('success', 'Curso publicado', `${lmsPublishModal.name} ya aparece en la página pública de CEET.`)
            setLmsPublishModal(null)
          }}
          onClose={() => setLmsPublishModal(null)}
        />
      )}

      {directoryModal && (
        <DirectoryUserFormModal
          user={directoryModal.mode === 'edit' ? directoryModal.user : null}
          role={directoryModal.role}
          onSave={handleSaveDirectoryUser}
          onClose={() => setDirectoryModal(null)}
        />
      )}

      {directoryDetailModal && (
        <DirectoryUserDetailModal
          user={directoryDetailModal.user}
          role={directoryDetailModal.role}
          lms={lms}
          onClose={() => setDirectoryDetailModal(null)}
        />
      )}

      {serviceModal && (
        <ServiceFormModal
          service={serviceModal.mode === 'edit' ? serviceModal.service : null}
          categories={serviceCategories.map(c => c.name)}
          onAddCategory={addCategory}
          onSave={handleSaveService}
          onClose={() => setServiceModal(null)}
        />
      )}

      {catalogModal && (
        <CatalogCourseFormModal
          course={catalogModal.mode === 'edit' ? catalogModal.course : null}
          categories={serviceCategories.filter(c => c.active !== false).map(c => c.name)}
          onSave={handleSaveCatalogCourse}
          onClose={() => setCatalogModal(null)}
        />
      )}

      {pqrsfReplyModal && (
        <PQRSFReplyModal
          ticket={pqrsfReplyModal}
          onSave={handleReplyPQRSF}
          onClose={() => setPqrsfReplyModal(null)}
        />
      )}
    </div>
  )
}

function AdminLmsCourseDetail({
  course, lms, toast, tab, setTab, participantsView, setParticipantsView, addStudentId, setAddStudentId,
  onBack, onPublish, onUnpublish, onEditCourse,
  onAddTopic, onEditTopic, onDeleteTopic, onAddLesson, onEditLesson, onDeleteLesson, onAddAssignment, onEditAssignment, onDeleteAssignment,
  onAddQuiz, onEditQuiz, onDeleteQuiz, onPublishLesson, onPublishAssignment, onPublishQuiz,
}) {
  const enrolledStudents = course.studentIds.map(id => lms.directoryById(id)).filter(Boolean)
  const availableStudents = lms.directory.filter(u => u.role === 'estudiante' && u.active && !course.studentIds.includes(u.id))

  return (
    <div style={{ animation: 'fadeUp 0.4s ease' }}>
      <button onClick={onBack} className="text-xs font-semibold mb-3" style={{ color: '#005187' }}>← Volver a cursos del LMS</button>

      <div className="rounded-xl overflow-hidden mb-5" style={{ border: '1px solid var(--border)' }}>
        <div style={{ height: 10, backgroundColor: course.color ?? '#005187' }} />
        <div className="p-4 flex items-start justify-between gap-3" style={{ backgroundColor: 'var(--card)' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>{course.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ backgroundColor: course.published && course.listed ? 'rgba(22,163,74,0.12)' : 'rgba(217,119,6,0.12)', color: course.published && course.listed ? '#16a34a' : '#d97706' }}>
                {course.published && course.listed ? '✓ Publicado' : '⏳ Borrador'}
              </span>
            </div>
            <p className="text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>{course.description}</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Profesor: {lms.teacherName(course.teacherId)}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={onEditCourse}
              className="text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5"
              style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
              <Edit2 size={13} /> Editar curso
            </button>
            {(!course.published || !course.listed) ? (
              <button onClick={onPublish} disabled={!course.teacherId}
                title={!course.teacherId ? 'Asigna un profesor antes de publicar' : undefined}
                className="text-xs px-3 py-1.5 rounded-lg font-bold text-white"
                style={{ backgroundColor: '#16a34a', opacity: course.teacherId ? 1 : 0.5, cursor: course.teacherId ? 'pointer' : 'not-allowed' }}>
                Publicar
              </button>
            ) : (
              <button onClick={onUnpublish} title="Quita el curso de la página pública de CEET"
                className="text-xs px-3 py-1.5 rounded-lg font-bold"
                style={{ border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626' }}>
                Despublicar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-5 rounded-xl p-1" style={{ backgroundColor: 'var(--muted)', width: 'fit-content' }}>
        {[
          { id: 'content', label: 'Contenido', icon: BookOpen },
          { id: 'grades', label: 'Calificaciones', icon: BarChart2 },
          { id: 'participants', label: 'Participantes', icon: Users },
          { id: 'settings', label: 'Configuración', icon: FileText },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
            style={{ backgroundColor: tab === t.id ? 'var(--card)' : 'transparent', color: tab === t.id ? '#005187' : 'var(--muted-foreground)' }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'content' && (
        <CourseContentTab
          course={course}
          lms={lms}
          onAddTopic={onAddTopic}
          onEditTopic={onEditTopic}
          onDeleteTopic={onDeleteTopic}
          onAddLesson={onAddLesson}
          onEditLesson={onEditLesson}
          onDeleteLesson={onDeleteLesson}
          onAddAssignment={onAddAssignment}
          onEditAssignment={onEditAssignment}
          onDeleteAssignment={onDeleteAssignment}
          onAddQuiz={onAddQuiz}
          onEditQuiz={onEditQuiz}
          onDeleteQuiz={onDeleteQuiz}
          onPublishLesson={onPublishLesson}
          onPublishAssignment={onPublishAssignment}
          onPublishQuiz={onPublishQuiz}
        />
      )}

      {tab === 'grades' && <GradebookReport courseId={course.id} />}

      {tab === 'participants' && (
        <div>
          <div className="flex gap-1 mb-4 rounded-xl p-1" style={{ backgroundColor: 'var(--muted)', width: 'fit-content' }}>
            {[{ id: 'list', label: 'Lista' }, { id: 'completion', label: 'Finalización' }].map(t => (
              <button key={t.id} onClick={() => setParticipantsView(t.id)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold"
                style={{ backgroundColor: participantsView === t.id ? 'var(--card)' : 'transparent', color: participantsView === t.id ? '#005187' : 'var(--muted-foreground)' }}>
                {t.label}
              </button>
            ))}
          </div>
          {participantsView === 'list' ? (
            <div>
              <div className="flex gap-2 mb-4">
                <select value={addStudentId} onChange={e => setAddStudentId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                  <option value="">Seleccionar estudiante para inscribir…</option>
                  {availableStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                </select>
                <button disabled={!addStudentId}
                  onClick={() => { lms.enrollStudent(course.id, addStudentId); toast('success', 'Estudiante inscrito', lms.studentName(addStudentId)); setAddStudentId('') }}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ backgroundColor: '#005187' }}>
                  Inscribir
                </button>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {enrolledStudents.map((s, i, arr) => (
                  <div key={s.id} style={{ display: 'flex', gap: 12, padding: '12px 16px', alignItems: 'center', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--card)' }}>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{s.name}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.email}</p>
                    </div>
                    <button onClick={() => lms.unenrollStudent(course.id, s.id)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium shrink-0" style={{ border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626' }}>
                      Quitar
                    </button>
                  </div>
                ))}
                {enrolledStudents.length === 0 && <p className="text-sm px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}>Sin estudiantes inscritos.</p>}
              </div>
            </div>
          ) : (
            <CompletionReport courseId={course.id} />
          )}
        </div>
      )}

      {tab === 'settings' && (
        <CourseSettingsForm
          course={course}
          onSave={data => { lms.updateCourse(course.id, data); toast('success', 'Configuración guardada', course.name) }}
        />
      )}
    </div>
  )
}
