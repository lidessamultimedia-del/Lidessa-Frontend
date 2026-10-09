import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useToast } from '@/shared/context/ToastContext'
import { useBlog } from '@/features/blog/context/BlogContext'
import { usePQRSF, isIdentified } from '@/features/pqrsf/context/PQRSFContext'
import { useLMS, MAX_GRADE } from '@/features/lms/context/LMSContext'
import { downloadCsv } from '@/features/lms/utils/csv'
import { useServicesData } from '@/features/services/context/ServicesDataContext'
import { useSupplies } from '@/features/supplies/context/SuppliesContext'
import SupplyProductFormModal from '@/features/supplies/components/SupplyProductFormModal'
import ClientEditModal from '@/features/supplies/components/ClientEditModal'
import ClientDetailModal from '@/features/supplies/components/ClientDetailModal'
import ShipOrderModal from '@/features/supplies/components/ShipOrderModal'
import RejectOrderModal from '@/features/supplies/components/RejectOrderModal'
import PaymentShortfallModal from '@/features/supplies/components/PaymentShortfallModal'
import OrderFormModal from '@/features/supplies/components/OrderFormModal'
import OrderDetailModal, { ORDER_STATUS, OrderStatusBadge, orderNumber } from '@/features/supplies/components/OrderDetailModal'
import ImageLightbox from '@/shared/components/ImageLightbox'
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
import CourseGradingQueue from '@/features/lms/components/CourseGradingQueue'
import ChatThread from '@/features/lms/components/ChatThread'
import DirectoryUserFormModal from '@/features/lms/components/DirectoryUserFormModal'
import DirectoryUserDetailModal from '@/features/lms/components/DirectoryUserDetailModal'
import PQRSFReplyModal from '@/features/pqrsf/components/PQRSFReplyModal'
import ServiceFormModal from '../components/ServiceFormModal'
import CatalogCourseFormModal from '../components/CatalogCourseFormModal'
import CategoriesManagerView from '../components/CategoriesManagerView'
import DocumentTypesManagerView from '../components/DocumentTypesManagerView'
import UserAccountFormModal, { ROLE_OPTIONS } from '../components/UserAccountFormModal'
import UserAccountDetailModal, { RoleBadge } from '../components/UserAccountDetailModal'
import AnimatedCounter from '@/shared/components/AnimatedCounter'
import ThemeToggle from '@/shared/components/ThemeToggle'
import { courseCardStyle } from '@/features/lms/utils/courseCard'
import { BarChart2, Building, FileText, GraduationCap, Users, Clipboard, Sliders, Bell, User, AlertTriangle, Edit2, Plus, Send, BookOpen, Trash, Search, Eye, Lock, X, UserCog, ShieldCheck, IdCard, MessageCircle, Sparkle, Check, Inbox, Download, Mail, ClipboardCheck, Package, ShoppingCart, ImageIcon, ChevronDown, History } from '@/shared/components/Icons'
import AccountSettings from '@/shared/components/AccountSettings'
import Avatar from '@/shared/components/Avatar'
import Toggle from '@/shared/components/Toggle'
import Pagination, { paginate } from '@/shared/components/Pagination'
import FilterDropdown from '@/shared/components/FilterDropdown'
import { useSiteSettings } from '@/shared/context/SiteSettingsContext'
import { serviceThumbUrl } from '@/features/services/utils/thumbnail'

const statusColor = {
  'Pendiente': '#d97706',
  'Respondida': '#16a34a',
  'Revisando': '#005187',
}

const PQRSF_TYPE_STYLES = {
  'Petición': { color: 'var(--primary)', icon: MessageCircle },
  'Solicitud': { color: 'var(--primary)', icon: MessageCircle },
  'Queja': { color: '#dc2626', icon: AlertTriangle },
  'Reclamo': { color: '#d97706', icon: AlertTriangle },
  'Sugerencia': { color: '#7c3aed', icon: Sparkle },
  'Felicitación': { color: '#16a34a', icon: Check },
}
const BRAND_GRADIENT = 'linear-gradient(135deg, #005187 0%, #4d82bc 55%, #b8860b 100%)'

// Paleta del sidebar: un solo color (blanco) en distintas opacidades sobre el
// fondo azul oscuro — antes se mezclaba blanco con dorado y se veía disparejo.
const SIDEBAR = {
  text: '#ffffff',
  textMuted: 'rgba(255,255,255,0.62)',
  textSubtle: 'rgba(255,255,255,0.5)',
  textFaint: 'rgba(255,255,255,0.35)',
  divider: 'rgba(255,255,255,0.08)',
  hoverBg: 'rgba(255,255,255,0.06)',
  activeBg: 'rgba(255,255,255,0.1)',
  activeIconBg: 'rgba(255,255,255,0.14)',
  activeBorder: 'rgba(255,255,255,0.16)',
}

const ROLE_LABELS = { admin: 'Administrador', profesor: 'Profesor', estudiante: 'Estudiante', cliente: 'Cliente' }

function formatCOP(value) {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}
const SUPPLY_ORDER_STATUS_LABEL = { pending: 'Pendiente de revisión', confirmed: 'Confirmado', rejected: 'Rechazado', shipped: 'Enviado', completed: 'Completado' }
const SUPPLY_ORDER_STATUS_COLOR = { pending: '#b8860b', confirmed: '#16a34a', rejected: '#dc2626', shipped: '#4d82bc', completed: '#16a34a' }

const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
// Los posts de Converge guardan la fecha como texto libre "D mes AAAA" (ver
// BlogPostFormModal.jsx) — esto la vuelve a convertir en Date para poder
// calcular cuántos son de este mes.
function parseSpanishDate(str) {
  const parts = str?.trim().split(' ')
  if (parts?.length !== 3) return null
  const [day, monthName, year] = parts
  const month = MONTHS_ES.indexOf(monthName.toLowerCase())
  if (month === -1) return null
  return new Date(Number(year), month, Number(day))
}

// Convierte una fecha ISO en un texto relativo tipo "Hace 2 días" — se usa
// para las notificaciones reales del admin (antes eran texto fijo inventado).
function relativeTime(dateStr) {
  if (!dateStr) return ''
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days <= 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 7) return `Hace ${days} días`
  if (days < 30) return `Hace ${Math.floor(days / 7)} semana(s)`
  return new Date(dateStr).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}

export default function AdminDashboard({ theme, setTheme }) {
  const { user, logout, allUsers, updateUserRole, createUser, updateUserCredentials, deleteUser } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { posts: blogPosts, addPost, updatePost, deletePost } = useBlog()
  const { tickets: pqrsfTickets, updateTicket: updatePQRSF, markRead: markPQRSFRead, respondTicket: respondPQRSF } = usePQRSF()
  const lms = useLMS()
  const catalogCourses = lms.listedCourses
  const { services, addService, updateService, deleteService, toggleServiceActive, categories: serviceCategories, addCategory, updateCategory, toggleCategoryActive, deleteCategory } = useServicesData()
  const supplies = useSupplies()
  const clientUsers = allUsers.filter(u => u.role === 'cliente')
  const [productModal, setProductModal] = useState(null) // null | 'new' | product
  const [clientModal, setClientModal] = useState(null) // null | 'new' | cliente a editar
  const [clientDetailModal, setClientDetailModal] = useState(null) // cliente a ver en detalle
  const [openOrderId, setOpenOrderId] = useState(null)
  const [pedidosView, setPedidosView] = useState('activos') // 'activos' | 'all' | 'historial' | un estado puntual
  const [ordersSearch, setOrdersSearch] = useState('')
  const [productsSearch, setProductsSearch] = useState('')
  const [productsFilter, setProductsFilter] = useState('all')
  const [productsPage, setProductsPage] = useState(1)
  const [clientsSearch, setClientsSearch] = useState('')
  const [clientsPage, setClientsPage] = useState(1)
  const [ordersPage, setOrdersPage] = useState(1)
  const [orderModal, setOrderModal] = useState(null) // null | { mode: 'new' } | { mode: 'edit', order }
  const [shipOrderModal, setShipOrderModal] = useState(null) // pedido a marcar como enviado
  const [rejectOrderModal, setRejectOrderModal] = useState(null) // pedido a rechazar
  const [paymentShortfallModal, setPaymentShortfallModal] = useState(null) // pedido al que avisarle pago incompleto
  const [lightboxImage, setLightboxImage] = useState(null) // { src, alt } | null
  const [section, setSection] = useState('dashboard')
  const [messageConversation, setMessageConversation] = useState(null)
  const [messagesSearch, setMessagesSearch] = useState('')
  // En pantallas angostas (celular) el sidebar empieza colapsado — abierto
  // ocupa la mayoría del ancho y deja el contenido apretado en una franja.
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window === 'undefined' || window.innerWidth >= 768)
  // Qué categorías del menú están desplegadas — arranca todo colapsado para
  // que el sidebar no quede tan largo (se expande sola la categoría de la
  // sección activa, ver el useEffect junto a navGroups).
  const [expandedGroups, setExpandedGroups] = useState(() => new Set())
  const [bellOpen, setBellOpen] = useState(false)
  const bellRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Notificaciones reales, armadas a partir del estado actual: PQRSF
  // pendientes, anónimos sin leer, pedidos de Suministros por revisar,
  // alertas de inventario, cursos sin profesor, usuarios nuevos y
  // estudiantes listos para certificar.
  const notifications = useMemo(() => {
    const items = []
    pqrsfTickets.filter(p => isIdentified(p) && p.status === 'Pendiente').forEach(p => {
      items.push({ id: `pqrsf_${p.id}`, icon: Clipboard, color: '#d97706', text: `Nueva PQRSF de ${p.from}: "${p.subject}"`, date: p.date, section: 'pqrsf' })
    })
    pqrsfTickets.filter(p => !isIdentified(p) && !p.read).forEach(p => {
      items.push({ id: `pqrsf_${p.id}`, icon: Eye, color: '#7c3aed', text: `Comentario anónimo: "${p.subject}"`, date: p.date, section: 'pqrsf', anonTicketId: p.id })
    })
    supplies.orders.filter(o => o.status === 'pending').forEach(o => {
      items.push({
        id: `order_${o.id}`, icon: ShoppingCart, color: '#005187',
        text: `Nuevo pedido de ${o.customerName} por ${formatCOP(o.total)} — revisar comprobante`,
        date: o.createdAt, section: 'pedidos-suministros', orderId: o.id,
      })
    })
    catalogCourses.filter(c => c.published && !c.teacherId).forEach(c => {
      items.push({ id: `course_${c.id}`, icon: GraduationCap, color: '#dc2626', text: `Curso "${c.name}" publicado sin profesor asignado`, date: c.startDate || c.createdAt, section: 'lms-courses' })
    })
    const recentCutoff = Date.now() - 14 * 86400000
    lms.directory.filter(u => (u.role === 'profesor' || u.role === 'estudiante') && u.joined && new Date(u.joined).getTime() >= recentCutoff)
      .forEach(u => {
        items.push({
          id: `user_${u.id}`, icon: User, color: '#4d82bc',
          text: `Nuevo ${u.role === 'profesor' ? 'profesor' : 'estudiante'} registrado: ${u.name}`,
          date: u.joined, section: u.role === 'profesor' ? 'teachers' : 'students',
        })
      })
    lms.studentsReadyToCertify().forEach(r => {
      items.push({
        id: `cert_${r.studentId}_${r.courseId}`, icon: ShieldCheck, color: '#16a34a',
        text: `${r.student?.name ?? 'Estudiante'} terminó "${r.course.name}" — contactarlo`,
        date: r.completedAt, section: 'certifications',
      })
    })
    // Alertas de inventario de Suministros — no tienen una fecha propia (es
    // una condición vigente, no un evento puntual), así que se marcan con
    // la hora actual para que siempre aparezcan arriba mientras sigan activas.
    const now = new Date().toISOString()
    supplies.activeProducts.filter(p => p.stock === 0).forEach(p => {
      items.push({ id: `stock_out_${p.id}`, icon: AlertTriangle, color: '#dc2626', text: `"${p.name}" está agotado`, date: now, section: 'suministros' })
    })
    supplies.activeProducts.filter(p => p.stock > 0 && p.stock <= 5).forEach(p => {
      items.push({ id: `stock_low_${p.id}`, icon: AlertTriangle, color: '#d97706', text: `Quedan pocas unidades de "${p.name}" (${p.stock})`, date: now, section: 'suministros' })
    })
    return items
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
      .slice(0, 20)
      .map(n => ({ ...n, time: relativeTime(n.date) }))
  }, [pqrsfTickets, catalogCourses, lms.directory, lms.courses, lms.submissions, lms.quizAttempts, lms.certifications, supplies.activeProducts, supplies.orders])

  // Qué notificaciones ya marcó como leídas el admin — se guarda en el
  // navegador (por usuario) para que no vuelvan a salir como nuevas cada
  // vez que se recarga el panel. Abrir la campana ya no las marca solas:
  // se marcan al hacer clic en una, con el botón de cada una, o con
  // "Marcar todas como leídas".
  const notifSeenKey = `lidessa_admin_notif_seen_${user?.id ?? 'admin'}`
  const [notifSeenIds, setNotifSeenIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(notifSeenKey) ?? '[]')) } catch { return new Set() }
  })
  useEffect(() => {
    try { localStorage.setItem(notifSeenKey, JSON.stringify([...notifSeenIds])) } catch { /* sin almacenamiento */ }
  }, [notifSeenIds, notifSeenKey])
  const [notifTab, setNotifTab] = useState('unread') // 'unread' | 'all'
  const unreadNotifications = notifications.filter(n => !notifSeenIds.has(n.id))
  const visibleNotifications = notifTab === 'unread' ? unreadNotifications : notifications

  function markNotificationsRead(list) {
    setNotifSeenIds(prev => {
      const next = new Set(prev)
      list.forEach(n => next.add(n.id))
      return next
    })
    // Un comentario anónimo no tiene respuesta posible: marcar su aviso
    // como leído también lo marca leído en PQRSF (así deja de contar ahí).
    list.forEach(n => { if (n.anonTicketId) markPQRSFRead(n.anonTicketId) })
  }

  function markNotificationUnread(n) {
    setNotifSeenIds(prev => {
      const next = new Set(prev)
      next.delete(n.id)
      return next
    })
  }

  function toggleBell() {
    setBellOpen(open => !open)
    setNotifTab('unread')
  }

  function openNotification(n) {
    markNotificationsRead([n])
    setSection(n.section)
    if (n.orderId) {
      setPedidosView('activos')
      setOpenOrderId(n.orderId)
    }
    setBellOpen(false)
  }

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
  const [pqrsfSearch, setPqrsfSearch] = useState('')
  const [certSearch, setCertSearch] = useState('')
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
  const [rolesSearch, setRolesSearch] = useState('')
  const [rolesRoleFilter, setRolesRoleFilter] = useState('all')
  const [rolesPage, setRolesPage] = useState(1)
  const [accountModal, setAccountModal] = useState(null) // null | { mode: 'new' } | { mode: 'edit', account }
  const [accountDetail, setAccountDetail] = useState(null) // id de la cuenta a ver en detalle
  const [settingsTab, setSettingsTab] = useState('site')
  // Paginación (10 por página) de cada lista larga del panel.
  const [servicesPage, setServicesPage] = useState(1)
  const [blogPage, setBlogPage] = useState(1)
  const [catalogPage, setCatalogPage] = useState(1)
  const [pqrsfPage, setPqrsfPage] = useState(1)
  const [pqrsfAnonPage, setPqrsfAnonPage] = useState(1)
  const [certReadyPage, setCertReadyPage] = useState(1)
  const [certHistoryPage, setCertHistoryPage] = useState(1)
  const [lmsCoursesPage, setLmsCoursesPage] = useState(1)
  const [directoryPage, setDirectoryPage] = useState(1)
  const [adminMessagesPage, setAdminMessagesPage] = useState(1)
  const lmsSelectedCourse = lmsSelectedCourseId ? lms.courses.find(c => c.id === lmsSelectedCourseId) : null
  const { settings, setSettings } = useSiteSettings()

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

  function handleAddDocumentType(name) {
    lms.addDocumentType(name)
    toast('success', 'Tipo de documento creado', name)
  }

  function handleRequestDeleteDocumentType(name, inUse) {
    if (inUse > 0) {
      toast('warning', 'No se puede eliminar', `${inUse} usuario(s) todavía usan "${name}". Cámbieles el tipo de documento primero.`)
      return
    }
    setDeleteConfirm({ type: 'documentType', id: name, label: name })
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
        capacity: 100, color: 'var(--primary)', startDate: '', endDate: '',
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

  async function handleReplyPQRSF(response) {
    const { emailSent } = await respondPQRSF(pqrsfReplyModal.id, response)
    toast('success', 'Respuesta guardada',
      emailSent
        ? `Se notificará a ${pqrsfReplyModal.email} por correo (simulado — falta conectar el backend de envío).`
        : `Se guardó la respuesta para ${pqrsfReplyModal.from}.`)
    setPqrsfReplyModal(null)
  }

  function handlePQRSFMarkRead(ticket) {
    markPQRSFRead(ticket.id)
    toast('info', 'Marcado como leído', ticket.subject)
  }

  async function handleDeleteConfirm() {
    if (deleteConfirm.type === 'blog') {
      deletePost(deleteConfirm.id)
      toast('success', 'Publicación eliminada', deleteConfirm.label)
    } else if (deleteConfirm.type === 'lmsCourse') {
      lms.deleteCourse(deleteConfirm.id)
      if (lmsSelectedCourseId === deleteConfirm.id) setLmsSelectedCourseId(null)
      toast('success', 'Curso eliminado', deleteConfirm.label)
    } else if (deleteConfirm.type === 'topic') {
      try {
        await lms.deleteTopic(deleteConfirm.id)
        toast('success', 'Eliminado', deleteConfirm.label)
      } catch (err) {
        toast('error', 'No se pudo eliminar', err.message)
      }
    } else if (deleteConfirm.type === 'lesson') {
      lms.deleteLesson(deleteConfirm.id)
      toast('success', 'Eliminado', deleteConfirm.label)
    } else if (deleteConfirm.type === 'assignment') {
      lms.deleteAssignment(deleteConfirm.id)
      toast('success', 'Eliminado', deleteConfirm.label)
    } else if (deleteConfirm.type === 'quiz') {
      try {
        await lms.deleteQuiz(deleteConfirm.id)
        toast('success', 'Eliminado', deleteConfirm.label)
      } catch (err) {
        toast('error', 'No se pudo eliminar', err.message)
      }
    } else if (deleteConfirm.type === 'directory') {
      if (allUsers.some(u => u.id === deleteConfirm.id)) deleteUser(deleteConfirm.id)
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
    } else if (deleteConfirm.type === 'documentType') {
      lms.deleteDocumentType(deleteConfirm.id)
      toast('success', 'Tipo de documento eliminado', deleteConfirm.label)
    } else if (deleteConfirm.type === 'supplyProduct') {
      supplies.deleteProduct(deleteConfirm.id)
      toast('success', 'Producto eliminado', deleteConfirm.label)
    } else if (deleteConfirm.type === 'supplyOrder') {
      supplies.deleteOrder(deleteConfirm.id)
      if (openOrderId === deleteConfirm.id) setOpenOrderId(null)
      toast('success', 'Pedido eliminado', deleteConfirm.label)
    } else if (deleteConfirm.type === 'account') {
      deleteUser(deleteConfirm.id)
      if (lms.directory.some(d => d.id === deleteConfirm.id)) lms.deleteDirectoryUser(deleteConfirm.id)
      if (accountDetail === deleteConfirm.id) setAccountDetail(null)
      toast('success', 'Usuario eliminado', deleteConfirm.label)
    } else if (deleteConfirm.type === 'client') {
      deleteUser(deleteConfirm.id)
      toast('success', 'Cliente eliminado', deleteConfirm.label)
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
    const { password, ...directoryData } = form
    if (directoryModal.mode === 'edit') {
      const userId = directoryModal.user.id
      const hasAccount = allUsers.some(u => u.id === userId)
      try {
        if (hasAccount) {
          const creds = { name: directoryData.name, email: directoryData.email, phone: directoryData.phone }
          if (password) creds.password = password
          updateUserCredentials(userId, creds)
        } else if (password) {
          createUser({ id: userId, name: directoryData.name, email: directoryData.email, password, phone: directoryData.phone, role: directoryData.role })
        }
      } catch (err) {
        toast('error', 'No se pudo actualizar el acceso', err.message)
        return
      }
      lms.updateDirectoryUser(userId, directoryData)
      toast('success', 'Usuario actualizado', form.name)
    } else {
      let account
      try {
        account = createUser({ name: directoryData.name, email: directoryData.email, password, phone: directoryData.phone, role: directoryData.role })
      } catch (err) {
        toast('error', 'No se pudo crear el usuario', err.message)
        return
      }
      lms.addDirectoryUser({ ...directoryData, id: account.id })
      toast('success', `${form.role === 'profesor' ? 'Profesor' : 'Estudiante'} creado`, form.name)
    }
    setDirectoryModal(null)
  }

  function handleRoleChange(target, newRole) {
    if (newRole === target.role) return
    updateUserRole(target.id, newRole)
    // Mantiene sincronizado el directorio del LMS si esta persona ya tenía
    // una ficha ahí (para que Profesores/Estudiantes y los cursos reflejen
    // el rol nuevo en vez de quedarse con el viejo).
    const dirEntry = lms.directory.find(d => d.id === target.id)
    if (dirEntry && dirEntry.role !== newRole && (newRole === 'profesor' || newRole === 'estudiante')) {
      lms.updateDirectoryUser(target.id, { role: newRole })
    }
    toast('success', 'Rol actualizado', `${target.name} ahora es ${ROLE_LABELS[newRole]}.`)
  }

  // Une la cuenta de acceso con su ficha del directorio del LMS (si tiene),
  // para mostrar documento/teléfono aunque se hayan cargado desde ahí.
  function accountWithDirectory(account) {
    const dir = lms.directory.find(d => d.id === account.id)
    if (!dir) return account
    const merged = { ...dir, ...account }
    for (const k of ['documentType', 'documentNumber', 'phone', 'firstName', 'lastName']) {
      if (!merged[k] && dir[k]) merged[k] = dir[k]
    }
    return merged
  }

  // Crear / editar desde Configuración → Usuarios y Roles. Mantiene en
  // sincronía la ficha del LMS cuando el rol es profesor o estudiante.
  function handleSaveAccount(data) {
    const { role, password, ...fields } = data
    const isLmsRole = role === 'profesor' || role === 'estudiante'
    if (accountModal.mode === 'new') {
      let account
      try {
        account = createUser({ ...fields, password, role })
      } catch (err) {
        toast('error', 'No se pudo crear el usuario', err.message)
        return
      }
      if (isLmsRole) lms.addDirectoryUser({ ...fields, role, id: account.id })
      toast('success', 'Usuario creado', `${fields.name} · ${ROLE_LABELS[role]}`)
    } else {
      const target = accountModal.account
      updateUserCredentials(target.id, password ? { ...fields, password } : fields)
      if (role !== target.role) handleRoleChange(target, role)
      const dirEntry = lms.directory.find(d => d.id === target.id)
      if (dirEntry) lms.updateDirectoryUser(target.id, isLmsRole ? { ...fields, role } : fields)
      else if (isLmsRole) lms.addDirectoryUser({ ...fields, role, id: target.id })
      toast('success', 'Usuario actualizado', fields.name)
    }
    setAccountModal(null)
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

  const conversations = lms.staffConversations(user.id)
  const filteredConversations = conversations.filter(c => {
    if (!messagesSearch.trim()) return true
    const student = lms.directoryById(c.studentId)
    const q = messagesSearch.trim().toLowerCase()
    return student?.name?.toLowerCase().includes(q) || student?.email?.toLowerCase().includes(q)
  })
  const { pageItems: pagedConversations, totalPages: adminMessagesTotalPages, safePage: adminMessagesSafePage } = paginate(filteredConversations, adminMessagesPage)

  // El menú se agrupa por categoría (en vez de una lista plana con
  // separadores de solo texto) para que cada una se pueda colapsar y el
  // sidebar no quede tan largo. "Dashboard" y "Configuración" quedan sueltos
  // porque no pertenecen a ninguna categoría concreta.
  const navGroups = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    {
      group: 'Contenido del sitio',
      items: [
        { id: 'services', label: 'Servicios', icon: Building },
        { id: 'blog', label: 'Converge', icon: FileText },
        { id: 'courses', label: 'CEET', icon: GraduationCap },
        { id: 'pqrsf', label: 'PQRSF', icon: Clipboard },
      ],
    },
    {
      group: 'V2 Suministros',
      items: [
        { id: 'suministros', label: 'Suministros', icon: Package },
        { id: 'pedidos-suministros', label: 'Pedidos', icon: ShoppingCart },
        { id: 'clientes-suministros', label: 'Clientes', icon: Users },
      ],
    },
    {
      group: 'LMS',
      items: [
        { id: 'lms-courses', label: 'Cursos', icon: BookOpen },
        { id: 'teachers', label: 'Profesores', icon: User },
        { id: 'students', label: 'Estudiantes', icon: Users },
        { id: 'certifications', label: 'Certificaciones', icon: ShieldCheck },
        { id: 'messages', label: 'Mensajes', icon: Mail },
      ],
    },
    { id: 'settings', label: 'Configuración', icon: Sliders },
  ]
  // Todos los items, sin agrupar — para búsquedas por id (ej. el título del
  // topbar) sin tener que recorrer la estructura anidada cada vez.
  const navItems = navGroups.flatMap(entry => entry.group ? entry.items : [entry])

  useEffect(() => {
    const owner = navGroups.find(g => g.items?.some(i => i.id === section))
    if (owner) setExpandedGroups(prev => prev.has(owner.group) ? prev : new Set([owner.group]))
  }, [section])

  // Acordeón: abrir una categoría cierra la que estuviera abierta, para que
  // el sidebar no crezca con varias desplegadas a la vez.
  function toggleGroup(group) {
    setExpandedGroups(prev => (prev.has(group) ? new Set() : new Set([group])))
  }

  function renderNavButton(item, indent = false) {
    const iconBox = indent ? 22 : 28
    const iconSize = indent ? 13 : 15
    return (
      <button key={item.id}
        onClick={() => setSection(item.id)}
        style={{
          display: 'flex', alignItems: 'center', gap: indent ? 9 : 11,
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          width: '100%', padding: sidebarOpen ? (indent ? '6px 11px' : '9px 11px') : '9px 0', borderRadius: 9,
          marginLeft: sidebarOpen && indent ? 12 : 0,
          background: sidebarOpen && section === item.id ? SIDEBAR.activeBg : 'transparent',
          color: section === item.id ? SIDEBAR.text : SIDEBAR.textMuted,
          border: sidebarOpen && section === item.id ? `1px solid ${SIDEBAR.activeBorder}` : '1px solid transparent',
          boxShadow: sidebarOpen && section === item.id ? '0 4px 16px rgba(0,0,0,0.18)' : 'none',
          cursor: 'pointer', textAlign: 'left',
          transform: 'translateX(0)',
          transition: 'background 0.35s ease, border-color 0.35s ease, color 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease',
        }}
        onMouseEnter={e => {
          if (section === item.id) return
          if (sidebarOpen) {
            e.currentTarget.style.background = SIDEBAR.hoverBg
            e.currentTarget.style.transform = 'translateX(4px)'
          }
          e.currentTarget.style.color = SIDEBAR.text
        }}
        onMouseLeave={e => {
          if (section === item.id) return
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = SIDEBAR.textMuted
          e.currentTarget.style.transform = 'translateX(0)'
        }}
      >
        <span style={{
          flexShrink: 0, width: iconBox, height: iconBox, borderRadius: 7,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: section === item.id ? SIDEBAR.activeIconBg : 'rgba(255,255,255,0.05)',
          border: !sidebarOpen && section === item.id ? `1px solid ${SIDEBAR.activeBorder}` : '1px solid transparent',
          transition: 'background-color 0.35s ease, border-color 0.35s ease',
        }}>
          <item.icon size={iconSize} />
        </span>
        {sidebarOpen && <span className={`${indent ? 'text-xs' : 'text-sm'} font-semibold truncate`}>{item.label}</span>}
      </button>
    )
  }

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
        borderRight: `1px solid ${SIDEBAR.divider}`,
      }}>
        <div style={{ padding: '22px 16px', borderBottom: `1px solid ${SIDEBAR.divider}` }}>
          <div className="flex items-center gap-2.5">
            <img src="/assets/logolidessa.png" alt="Lidessa" className="shrink-0"
              style={{ width: 34, height: 34, objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.18))' }} />
            {sidebarOpen && (
              <div className="min-w-0">
                <span className="font-black text-white text-sm block truncate tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>LIDESSA</span>
                <span className="text-[11px] block truncate" style={{ color: SIDEBAR.textSubtle, letterSpacing: '0.04em' }}>PANEL ADMIN</span>
              </div>
            )}
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 overflow-y-auto overflow-x-hidden min-h-0">
          {sidebarOpen && (
            <p className="text-[10px] font-bold px-3 mb-2" style={{ color: SIDEBAR.textFaint, letterSpacing: '0.12em' }}>
              NAVEGACIÓN
            </p>
          )}
          <div className="space-y-1">
            {navGroups.map(entry => {
              if (!entry.group) return renderNavButton(entry)

              if (!sidebarOpen) {
                // Colapsado a solo íconos: no hay espacio para encabezados
                // de categoría, se listan los items directo (como antes).
                return <div key={entry.group} className="space-y-1">{entry.items.map(i => renderNavButton(i))}</div>
              }

              const isExpanded = expandedGroups.has(entry.group)
              return (
                <div key={entry.group}>
                  <button
                    onClick={() => toggleGroup(entry.group)}
                    className="w-full flex items-center justify-between px-3 pt-4 pb-1"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <span className="text-sm font-semibold" style={{ color: SIDEBAR.textSubtle }}>
                      {entry.group}
                    </span>
                    <ChevronDown size={13}
                      style={{
                        color: SIDEBAR.textFaint,
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                      }}
                    />
                  </button>
                  {isExpanded && (
                    <div className="space-y-1">
                      {entry.items.map(i => renderNavButton(i, true))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </nav>

        <div style={{ padding: 12, borderTop: `1px solid ${SIDEBAR.divider}` }}>
          <button onClick={() => setSidebarOpen(s => !s)} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '8px 10px', borderRadius: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: SIDEBAR.textFaint, fontSize: 12, transition: 'background-color 0.15s, color 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = SIDEBAR.hoverBg; e.currentTarget.style.color = SIDEBAR.text }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = SIDEBAR.textFaint }}
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
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: '0 16px', backgroundColor: 'var(--card)', flexShrink: 0,
        }}>
          <h1 className="font-bold text-sm truncate min-w-0" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>
            Administración — {navItems.find(n => n.id === section)?.label}
          </h1>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <ThemeToggle theme={theme} setTheme={setTheme} />
            {/* Bell */}
            <div ref={bellRef} style={{ position: 'relative' }}>
              <button onClick={toggleBell}
                aria-label={unreadNotifications.length > 0 ? `Notificaciones (${unreadNotifications.length} sin leer)` : 'Notificaciones'}
                aria-expanded={bellOpen}
                className="flex items-center justify-center rounded-full transition-colors"
                style={{
                  position: 'relative', width: 36, height: 36, border: 'none', cursor: 'pointer',
                  color: 'var(--foreground)', backgroundColor: bellOpen ? 'var(--muted)' : 'transparent',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = bellOpen ? 'var(--muted)' : 'transparent'}
              >
                <Bell size={20} />
                {unreadNotifications.length > 0 && (
                  <span style={{
                    position: 'absolute', top: 2, right: 2,
                    minWidth: 18, height: 18, padding: '0 4px', borderRadius: 9,
                    backgroundColor: '#dc2626', color: 'white',
                    fontSize: 10, fontWeight: 700, lineHeight: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid var(--card)',
                  }}>{unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}</span>
                )}
              </button>
              {bellOpen && (
                <div style={{
                  position: 'absolute', top: 44, right: 0, width: 'min(340px, calc(100vw - 32px))',
                  backgroundColor: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                  zIndex: 100, overflow: 'hidden', animation: 'fadeUp 0.2s ease',
                }}>
                  <div style={{ padding: '12px 16px 0', borderBottom: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Notificaciones</span>
                      {unreadNotifications.length > 0 && (
                        <button onClick={() => markNotificationsRead(unreadNotifications)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold hover:underline"
                          style={{ color: 'var(--primary)' }}>
                          <Check size={12} /> Marcar todas como leídas
                        </button>
                      )}
                    </div>
                    <div className="flex gap-4">
                      {[{ id: 'unread', label: `Sin leer (${unreadNotifications.length})` }, { id: 'all', label: `Todas (${notifications.length})` }].map(t => (
                        <button key={t.id} onClick={() => setNotifTab(t.id)}
                          className="text-xs font-semibold pb-2 -mb-px"
                          style={{
                            color: notifTab === t.id ? 'var(--primary)' : 'var(--muted-foreground)',
                            borderBottom: `2px solid ${notifTab === t.id ? 'var(--primary)' : 'transparent'}`,
                          }}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {visibleNotifications.length === 0 ? (
                    <div className="flex flex-col items-center text-center px-4 py-8">
                      <span className="flex items-center justify-center rounded-full mb-2" style={{ width: 40, height: 40, backgroundColor: '#16a34a1a', color: '#16a34a' }}>
                        <Check size={18} />
                      </span>
                      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Todo al día</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {notifTab === 'unread' ? 'No tiene notificaciones sin leer.' : 'Sin novedades por ahora.'}
                      </p>
                    </div>
                  ) : (
                    <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                      {visibleNotifications.map((n, i) => {
                        const isNew = !notifSeenIds.has(n.id)
                        const baseBg = isNew ? 'rgba(0,81,135,0.06)' : 'transparent'
                        return (
                          <div key={n.id}
                            className="flex gap-3 items-start transition-colors cursor-pointer"
                            style={{
                              padding: '10px 12px 10px 16px',
                              borderBottom: i < visibleNotifications.length - 1 ? '1px solid var(--border)' : 'none',
                              backgroundColor: baseBg,
                            }}
                            onClick={() => openNotification(n)}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,81,135,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = baseBg}
                          >
                            <span className="flex items-center justify-center rounded-lg shrink-0"
                              style={{ width: 30, height: 30, backgroundColor: `${n.color}1a`, color: n.color }}>
                              <n.icon size={15} />
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block text-xs leading-snug" style={{ color: 'var(--foreground)', fontWeight: isNew ? 600 : 400, opacity: isNew ? 1 : 0.7 }}>{n.text}</span>
                              <span className="block text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{n.time}</span>
                            </span>
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                if (isNew) markNotificationsRead([n])
                                else markNotificationUnread(n)
                              }}
                              title={isNew ? 'Marcar como leída' : 'Marcar como no leída'}
                              aria-label={isNew ? 'Marcar como leída' : 'Marcar como no leída'}
                              className="shrink-0 flex items-center justify-center rounded-full transition-colors"
                              style={{ width: 26, height: 26, color: isNew ? 'var(--primary)' : 'var(--muted-foreground)' }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              {isNew
                                ? <Check size={14} />
                                : <span style={{ width: 8, height: 8, borderRadius: '50%', border: '1.5px solid currentColor' }} />}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
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
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

          {/* ── DASHBOARD ── */}
          {section === 'dashboard' && (() => {
            const now = new Date()
            const isThisMonth = d => d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
            const hour = now.getHours()
            const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
            const firstName = user?.name?.split(' ')[0] ?? ''
            const todayLabel = now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

            const pqrsfPending = pqrsfTickets.filter(p => p.status === 'Pendiente')
            const pqrsfAnonUnread = pqrsfTickets.filter(p => !isIdentified(p) && !p.read)
            const activeCatalogCourses = catalogCourses.filter(c => c.published)
            const coursesWithoutTeacher = catalogCourses.filter(c => c.published && !c.teacherId)
            const postsThisMonth = blogPosts.filter(p => isThisMonth(parseSpanishDate(p.date)))
            const readyToCertify = lms.studentsReadyToCertify()
            const pendingOrders = supplies.orders.filter(o => o.status === 'pending')
            const openOrders = supplies.orders.filter(o => o.status !== 'rejected' && o.status !== 'completed')
            const monthSales = supplies.orders
              .filter(o => ['confirmed', 'shipped', 'completed'].includes(o.status) && isThisMonth(new Date(o.createdAt)))
              .reduce((sum, o) => sum + o.total, 0)
            const stockOut = supplies.activeProducts.filter(p => p.stock === 0)
            const stockLow = supplies.activeProducts.filter(p => p.stock > 0 && p.stock <= 5)
            const teachers = lms.directory.filter(u => u.role === 'profesor')
            const students = lms.directory.filter(u => u.role === 'estudiante')

            const kpis = [
              { label: 'PQRSF pendientes', value: pqrsfPending.length, icon: Clipboard, color: '#d97706', hint: `${pqrsfTickets.length} solicitudes en total`, section: 'pqrsf' },
              { label: 'Cursos activos', value: activeCatalogCourses.length, icon: GraduationCap, color: '#16a34a', hint: `${catalogCourses.length} cursos en catálogo`, section: 'courses' },
              { label: 'Publicaciones del mes', value: postsThisMonth.length, icon: FileText, color: '#7c3aed', hint: `${blogPosts.length} publicaciones en Converge`, section: 'blog' },
              { label: 'Estudiantes por certificar', value: readyToCertify.length, icon: ShieldCheck, color: '#005187', hint: `${lms.certifications.length} certificados emitidos`, section: 'certifications' },
            ]

            const TONES = {
              danger: { color: '#dc2626', label: 'Urgente' },
              warning: { color: '#d97706', label: 'Pendiente' },
              info: { color: '#005187', label: 'Seguimiento' },
            }
            const alerts = [
              stockOut.length > 0 && { tone: 'danger', icon: AlertTriangle, title: `${stockOut.length} producto(s) agotado(s)`, detail: stockOut.slice(0, 2).map(p => p.name).join(', ') + (stockOut.length > 2 ? '…' : ''), section: 'suministros' },
              coursesWithoutTeacher.length > 0 && { tone: 'danger', icon: GraduationCap, title: `${coursesWithoutTeacher.length} curso(s) sin profesor`, detail: 'Publicados sin profesor asignado', section: 'lms-courses' },
              pendingOrders.length > 0 && { tone: 'warning', icon: ShoppingCart, title: `${pendingOrders.length} pedido(s) por revisar`, detail: 'Verificar comprobante de pago', section: 'pedidos-suministros' },
              pqrsfPending.length > 0 && { tone: 'warning', icon: Clipboard, title: `${pqrsfPending.length} PQRSF sin responder`, detail: 'Responder dentro de los plazos de ley', section: 'pqrsf' },
              stockLow.length > 0 && { tone: 'warning', icon: Package, title: `${stockLow.length} producto(s) con stock bajo`, detail: '5 unidades o menos', section: 'suministros' },
              readyToCertify.length > 0 && { tone: 'info', icon: ShieldCheck, title: `${readyToCertify.length} estudiante(s) por certificar`, detail: 'Terminaron su curso', section: 'certifications' },
              pqrsfAnonUnread.length > 0 && { tone: 'info', icon: Eye, title: `${pqrsfAnonUnread.length} comentario(s) anónimo(s)`, detail: 'Sin leer', section: 'pqrsf' },
            ].filter(Boolean)
            const urgentCount = alerts.filter(a => a.tone !== 'info').length

            // Actividad reciente: eventos reales de todas las áreas, en orden cronológico.
            const activity = [
              ...pqrsfTickets.map(p => ({ id: `a_pqrsf_${p.id}`, icon: Clipboard, color: PQRSF_TYPE_STYLES[p.type]?.color ?? 'var(--primary)', text: `${p.type}: ${p.subject}`, meta: p.from, date: p.date, section: 'pqrsf' })),
              ...supplies.orders.map(o => ({ id: `a_order_${o.id}`, icon: ShoppingCart, color: SUPPLY_ORDER_STATUS_COLOR[o.status], text: `Pedido de ${o.customerName} — ${formatCOP(o.total)}`, meta: SUPPLY_ORDER_STATUS_LABEL[o.status], date: o.createdAt, section: 'pedidos-suministros' })),
              ...lms.directory.filter(u => (u.role === 'profesor' || u.role === 'estudiante') && u.joined).map(u => ({ id: `a_user_${u.id}`, icon: User, color: '#4d82bc', text: `Nuevo ${u.role === 'profesor' ? 'profesor' : 'estudiante'}: ${u.name}`, meta: u.email, date: u.joined, section: u.role === 'profesor' ? 'teachers' : 'students' })),
              ...lms.certifications.map(c => ({ id: `a_cert_${c.id}`, icon: ShieldCheck, color: '#16a34a', text: `Certificado: ${lms.studentName(c.studentId) ?? 'Estudiante'}`, meta: lms.courses.find(x => x.id === c.courseId)?.name ?? '', date: c.markedAt, section: 'certifications' })),
              ...blogPosts.map(p => {
                const d = parseSpanishDate(p.date)
                return d && { id: `a_post_${p.id}`, icon: FileText, color: '#7c3aed', text: `Publicación: ${p.title}`, meta: 'Converge', date: d.toISOString(), section: 'blog' }
              }).filter(Boolean),
            ]
              .filter(a => a.date)
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 6)

            // Ventas de V2 Suministros: últimos 6 meses. Solo cuentan los
            // pedidos aprobados (confirmados, enviados o completados).
            const APPROVED_STATUSES = ['confirmed', 'shipped', 'completed']
            const approvedOrders = supplies.orders.filter(o => APPROVED_STATUSES.includes(o.status))
            const rejectedOrders = supplies.orders.filter(o => o.status === 'rejected')
            const salesByMonth = Array.from({ length: 6 }, (_, i) => {
              const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
              const total = approvedOrders
                .filter(o => { const od = new Date(o.createdAt); return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear() })
                .reduce((sum, o) => sum + o.total, 0)
              return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('es-CO', { month: 'short' }).replace('.', ''), total, current: i === 5 }
            })
            const maxMonthSales = Math.max(...salesByMonth.map(m => m.total), 0)
            const totalSales6m = salesByMonth.reduce((sum, m) => sum + m.total, 0)
            const orderStatusSummary = [
              { label: 'Pendientes', count: pendingOrders.length, color: '#d97706', icon: ClipboardCheck },
              { label: 'Aprobados', count: approvedOrders.length, color: '#16a34a', icon: Check },
              { label: 'Rechazados', count: rejectedOrders.length, color: '#dc2626', icon: X },
            ]

            const pqrsfByStatus = ['Pendiente', 'Revisando', 'Respondida'].map(st => ({ status: st, count: pqrsfTickets.filter(p => p.status === st).length }))

            const quickActions = [
              { label: 'Nueva publicación', icon: Edit2, section: 'blog' },
              { label: 'Agregar curso', icon: Plus, section: 'courses' },
              { label: 'Ver PQRSF', icon: Send, section: 'pqrsf' },
              { label: 'Revisar pedidos', icon: ShoppingCart, section: 'pedidos-suministros' },
              { label: 'Inventario', icon: Package, section: 'suministros' },
              { label: 'Certificaciones', icon: ShieldCheck, section: 'certifications' },
            ]

            const areaSummary = [
              {
                title: 'Contenido del sitio', icon: Building, rows: [
                  ['Servicios activos', services.filter(s => s.active !== false).length],
                  ['Publicaciones Converge', blogPosts.length],
                  ['Cursos CEET en catálogo', catalogCourses.length],
                ],
              },
              {
                title: 'V2 Suministros', icon: Package, rows: [
                  ['Productos activos', supplies.activeProducts.length],
                  ['Pedidos en curso', openOrders.length],
                  ['Ventas del mes', formatCOP(monthSales)],
                  ['Clientes', clientUsers.length],
                ],
              },
              {
                title: 'LMS', icon: BookOpen, rows: [
                  ['Cursos', lms.courses.length],
                  ['Profesores', teachers.length],
                  ['Estudiantes', students.length],
                ],
              },
            ]

            const panel = { backgroundColor: 'var(--card)', border: '1px solid var(--border)' }
            const PanelHeader = ({ title, subtitle, action }) => (
              <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4">
                <div className="min-w-0">
                  <h2 className="font-bold text-sm" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>{title}</h2>
                  {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{subtitle}</p>}
                </div>
                {action && (
                  <button onClick={action.onClick} className="text-xs font-semibold shrink-0 hover:underline" style={{ color: 'var(--primary)' }}>
                    {action.label} →
                  </button>
                )}
              </div>
            )

            return (
            <div style={{ animation: 'fadeUp 0.4s ease' }} className="max-w-7xl mx-auto">
              {/* Encabezado */}
              <div className="rounded-2xl p-6 mb-6 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #10294d 0%, #071426 70%)', boxShadow: '0 10px 30px rgba(7,20,38,0.18)' }}>
                <div aria-hidden="true" className="absolute pointer-events-none"
                  style={{ right: -60, top: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(77,130,188,0.35), transparent 70%)' }} />
                <div className="relative flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold capitalize mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>{todayLabel}</p>
                    <p className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                      {greeting}{firstName ? `, ${firstName}` : ''}
                    </p>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Resumen general de Lidessa</p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: urgentCount > 0 ? '#f59e0b' : '#22c55e' }} />
                    {urgentCount > 0 ? `${urgentCount} asunto(s) requieren atención` : 'Todo al día'}
                  </span>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {kpis.map(s => (
                  <button key={s.label} onClick={() => setSection(s.section)}
                    className="rounded-2xl p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden"
                    style={panel}>
                    <span aria-hidden="true" className="absolute left-0 top-0 bottom-0" style={{ width: 3, backgroundColor: s.color }} />
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
                      <span className="flex items-center justify-center rounded-xl shrink-0"
                        style={{ width: 36, height: 36, backgroundColor: `${s.color}1a`, color: s.color }}>
                        <s.icon size={18} />
                      </span>
                    </div>
                    <AnimatedCounter target={s.value} suffix="" style={{ fontSize: 34, lineHeight: 1, fontFamily: 'var(--font-display)', color: 'var(--foreground)', fontWeight: 900 }} />
                    <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>{s.hint}</p>
                  </button>
                ))}
              </div>

              {/* Ventas de Suministros + Requiere atención */}
              <div className="grid lg:grid-cols-3 gap-4 mb-6">
                <div className="rounded-2xl lg:col-span-2 flex flex-col" style={panel}>
                  <PanelHeader title="Ventas de V2 Suministros" subtitle="Pedidos aprobados de los últimos 6 meses"
                    action={{ label: 'Ver pedidos', onClick: () => setSection('pedidos-suministros') }} />
                  <div className="px-5 pb-5 flex-1 flex flex-col">
                    <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
                      <div>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Ventas del mes</p>
                        <p className="text-2xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>{formatCOP(monthSales)}</p>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        Últimos 6 meses: <strong style={{ color: 'var(--foreground)' }}>{formatCOP(totalSales6m)}</strong>
                      </p>
                    </div>

                    {/* Gráfico de barras por mes */}
                    <div className="relative flex items-end gap-3 h-36 mb-1" style={{ borderBottom: '1px solid var(--border)' }}>
                      {salesByMonth.map(m => {
                        const pct = maxMonthSales > 0 ? (m.total / maxMonthSales) * 100 : 0
                        return (
                          <div key={m.key} className="flex-1 h-full flex flex-col justify-end items-center group" title={`${m.label}: ${formatCOP(m.total)}`}>
                            {m.total > 0 && (
                              <span className="text-[10px] font-semibold mb-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--foreground)' }}>
                                {formatCOP(m.total)}
                              </span>
                            )}
                            <div className="w-full max-w-12 rounded-t-md"
                              style={{
                                height: m.total > 0 ? `${Math.max(pct, 4)}%` : 4,
                                backgroundColor: m.total > 0 ? (m.current ? '#005187' : '#4d82bc') : 'var(--muted)',
                                transition: 'height 0.8s ease',
                              }} />
                          </div>
                        )
                      })}
                      {maxMonthSales === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <p className="text-xs text-center px-4 py-2 rounded-lg" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)', border: '1px dashed var(--border)' }}>
                            Aún no hay ventas registradas. Aparecerán aquí cuando se habilite el catálogo.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 mb-5">
                      {salesByMonth.map(m => (
                        <span key={m.key} className="flex-1 text-center text-[11px] capitalize"
                          style={{ color: m.current ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: m.current ? 700 : 400 }}>
                          {m.label}
                        </span>
                      ))}
                    </div>

                    {/* Pedidos por estado */}
                    <div className="grid grid-cols-3 gap-3 mt-auto">
                      {orderStatusSummary.map(st => (
                        <button key={st.label} onClick={() => setSection('pedidos-suministros')}
                          className="rounded-xl p-3 text-left transition-colors"
                          style={{ border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = st.color}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                          <span className="flex items-center gap-1.5 text-xs font-semibold mb-1" style={{ color: st.color }}>
                            <st.icon size={13} /> {st.label}
                          </span>
                          <span className="block text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>{st.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl flex flex-col" style={panel}>
                  <PanelHeader title="Requiere atención" subtitle={alerts.length > 0 ? `${alerts.length} elemento(s)` : 'Sin pendientes'} />
                  <div className="px-3 pb-3 flex-1">
                    {alerts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center py-8">
                        <span className="flex items-center justify-center rounded-full mb-3" style={{ width: 44, height: 44, backgroundColor: '#16a34a1a', color: '#16a34a' }}>
                          <Check size={20} />
                        </span>
                        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Todo al día</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>No hay asuntos pendientes.</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {alerts.map(a => {
                          const tone = TONES[a.tone]
                          return (
                            <button key={a.title} onClick={() => setSection(a.section)}
                              className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors"
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <span className="flex items-center justify-center rounded-lg shrink-0"
                                style={{ width: 32, height: 32, backgroundColor: `${tone.color}1a`, color: tone.color }}>
                                <a.icon size={15} />
                              </span>
                              <span className="flex-1 min-w-0">
                                <span className="block text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{a.title}</span>
                                <span className="block text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{a.detail}</span>
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0"
                                style={{ backgroundColor: `${tone.color}1a`, color: tone.color }}>{tone.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actividad reciente + Acciones rápidas */}
              <div className="grid lg:grid-cols-3 gap-4 mb-6">
                <div className="rounded-2xl lg:col-span-2" style={panel}>
                  <PanelHeader title="Actividad reciente" subtitle="Últimos movimientos en todas las áreas" />
                  <div className="px-5 pb-4">
                    {activity.length === 0 ? (
                      <p className="text-xs py-8 text-center" style={{ color: 'var(--muted-foreground)' }}>Sin actividad reciente.</p>
                    ) : (
                      <ol className="relative">
                        {activity.map((a, i) => (
                          <li key={a.id} className="relative flex gap-3 pb-4 last:pb-0">
                            {i < activity.length - 1 && (
                              <span aria-hidden="true" className="absolute" style={{ left: 15, top: 32, bottom: 0, width: 1, backgroundColor: 'var(--border)' }} />
                            )}
                            <span className="relative flex items-center justify-center rounded-full shrink-0"
                              style={{ width: 31, height: 31, backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: a.color }}>
                              <a.icon size={14} />
                            </span>
                            <button onClick={() => setSection(a.section)} className="flex-1 min-w-0 text-left pt-1 group">
                              <span className="flex items-baseline justify-between gap-3">
                                <span className="text-sm font-medium truncate group-hover:underline" style={{ color: 'var(--foreground)' }}>{a.text}</span>
                                <span className="text-xs shrink-0" style={{ color: 'var(--muted-foreground)' }}>{relativeTime(a.date)}</span>
                              </span>
                              {a.meta && <span className="block text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{a.meta}</span>}
                            </button>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl" style={panel}>
                  <PanelHeader title="Acciones rápidas" subtitle="Atajos a las tareas más frecuentes" />
                  <div className="grid grid-cols-2 gap-2 px-5 pb-5">
                    {quickActions.map(a => (
                      <button key={a.label} onClick={() => setSection(a.section)}
                        className="rounded-xl p-3 text-left transition-all"
                        style={{ border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#4d82bc'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
                      >
                        <span className="flex items-center justify-center rounded-lg mb-2"
                          style={{ width: 30, height: 30, backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}>
                          <a.icon size={15} />
                        </span>
                        <span className="text-xs font-semibold leading-tight block" style={{ color: 'var(--foreground)' }}>{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Últimas PQRSF + Resumen por área */}
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="rounded-2xl lg:col-span-2 overflow-hidden" style={panel}>
                  <PanelHeader title="Últimas solicitudes PQRSF" subtitle={`${pqrsfTickets.length} en total`}
                    action={{ label: 'Ver todas', onClick: () => setSection('pqrsf') }} />
                  {pqrsfTickets.length > 0 && (
                    <div className="px-5 pb-4">
                      <div className="flex h-2 rounded-full overflow-hidden mb-2" style={{ backgroundColor: 'var(--muted)' }}>
                        {pqrsfByStatus.filter(s => s.count > 0).map(s => (
                          <div key={s.status} style={{ width: `${(s.count / pqrsfTickets.length) * 100}%`, backgroundColor: statusColor[s.status] }} />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {pqrsfByStatus.map(s => (
                          <span key={s.status} className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: statusColor[s.status] }} />
                            {s.status} <strong style={{ color: 'var(--foreground)' }}>{s.count}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {pqrsfTickets.length === 0 ? (
                    <p className="text-xs pb-8 text-center" style={{ color: 'var(--muted-foreground)' }}>No hay solicitudes registradas.</p>
                  ) : (
                    <div style={{ borderTop: '1px solid var(--border)' }}>
                      {pqrsfTickets.slice(0, 4).map((p, i, arr) => {
                        const typeStyle = PQRSF_TYPE_STYLES[p.type] ?? { color: 'var(--primary)', icon: MessageCircle }
                        return (
                          <button key={p.id} onClick={() => setSection('pqrsf')}
                            className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors"
                            style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <span className="flex items-center justify-center rounded-lg shrink-0"
                              style={{ width: 32, height: 32, backgroundColor: `color-mix(in srgb, ${typeStyle.color} 12%, transparent)`, color: typeStyle.color }}>
                              <typeStyle.icon size={15} />
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{p.subject}</span>
                              <span className="block text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{p.from} · {p.type} · {p.date}</span>
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full font-semibold shrink-0"
                              style={{ backgroundColor: `${statusColor[p.status]}22`, color: statusColor[p.status] }}>
                              {p.status}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl" style={panel}>
                  <PanelHeader title="Resumen por área" />
                  <div className="px-5 pb-5 space-y-4">
                    {areaSummary.map(area => (
                      <div key={area.title}>
                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--muted-foreground)' }}>
                          <area.icon size={13} /> {area.title}
                        </p>
                        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                          {area.rows.map(([label, value], i) => (
                            <div key={label} className="flex items-center justify-between px-3 py-2 text-sm"
                              style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                              <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                              <span className="font-bold" style={{ color: 'var(--foreground)' }}>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            )
          })()}

          {/* ── SERVICES ── */}
          {section === 'services' && (() => {
            const filteredServices = services
              .filter(s => s.title.toLowerCase().includes(servicesSearch.toLowerCase()))
              .filter(s => servicesCategoryFilter === 'all' || s.category === servicesCategoryFilter)
            const { pageItems: pagedServices, totalPages: servicesTotalPages, safePage: servicesSafePage } = paginate(filteredServices, servicesPage)
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
                  Categoría: <strong style={{ color: 'var(--primary)' }}>{servicesCategoryFilter === 'all' ? 'Todas' : servicesCategoryFilter}</strong>
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
                {pagedServices.map((s, i) => {
                  const isActive = s.active !== false
                  return (
                  <div key={s.slug}
                    className="transition-colors"
                    style={{
                      display: 'flex', gap: 16, padding: '13px 20px', alignItems: 'center',
                      borderBottom: i < pagedServices.length - 1 ? '1px solid var(--border)' : 'none',
                      backgroundColor: 'var(--card)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--card)'}
                  >
                    {s.hero ? (
                      <img src={serviceThumbUrl(s.hero)} alt={s.title} loading="lazy" decoding="async"
                        className="w-14 h-11 object-cover rounded-lg shrink-0" style={{ border: '1px solid var(--border)' }} />
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
                        style={{ backgroundColor: 'rgba(0,81,135,0.1)', color: 'var(--primary)', border: '1px solid rgba(0,81,135,0.2)' }}>
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
              <Pagination page={servicesSafePage} totalPages={servicesTotalPages} onChange={setServicesPage} />
              </>
              )}
            </div>
            )
          })()}

          {/* ── BLOG ── */}
          {section === 'blog' && (() => {
            const { pageItems: pagedPosts, totalPages: blogTotalPages, safePage: blogSafePage } = paginate(blogPosts, blogPage)
            return (
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
                {pagedPosts.map(post => (
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
                          style={{ backgroundColor: 'rgba(0,81,135,0.1)', color: 'var(--primary)', border: '1px solid rgba(0,81,135,0.2)' }}>
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
              <Pagination page={blogSafePage} totalPages={blogTotalPages} onChange={setBlogPage} />
            </div>
            )
          })()}

          {/* ── COURSES ── */}
          {section === 'courses' && (() => {
            const { pageItems: pagedCatalog, totalPages: catalogTotalPages, safePage: catalogSafePage } = paginate(catalogCourses, catalogPage)
            return (
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
                {pagedCatalog.map((c, i) => (
                  <div key={c.id} style={{
                    display: 'flex', gap: 12, padding: '14px 16px', alignItems: 'center',
                    borderBottom: i < pagedCatalog.length - 1 ? '1px solid var(--border)' : 'none',
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
                      style={{ backgroundColor: 'rgba(0,81,135,0.1)', color: 'var(--primary)', border: '1px solid rgba(0,81,135,0.2)' }}>
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
              <Pagination page={catalogSafePage} totalPages={catalogTotalPages} onChange={setCatalogPage} />
            </div>
            )
          })()}

          {/* ── PQRSF ── */}
          {section === 'pqrsf' && (() => {
            const q = pqrsfSearch.trim().toLowerCase()
            const matches = p => !q || [p.id, p.from, p.subject, p.email, p.type].some(v => v?.toLowerCase().includes(q))
            const identifiedTickets = pqrsfTickets
              .filter(isIdentified)
              .filter(matches)
              .sort((a, b) => (a.status === 'Pendiente') === (b.status === 'Pendiente') ? b.date.localeCompare(a.date) : a.status === 'Pendiente' ? -1 : 1)
            const anonymousTickets = pqrsfTickets
              .filter(p => !isIdentified(p))
              .filter(matches)
              .sort((a, b) => b.date.localeCompare(a.date))
            const { pageItems: pagedIdentified, totalPages: identifiedTotalPages, safePage: identifiedSafePage } = paginate(identifiedTickets, pqrsfPage)
            const { pageItems: pagedAnonymous, totalPages: anonTotalPages, safePage: anonSafePage } = paginate(anonymousTickets, pqrsfAnonPage)
            const pendingCount = pqrsfTickets.filter(p => isIdentified(p) && p.status === 'Pendiente').length
            const respondedCount = pqrsfTickets.filter(p => p.status === 'Respondida').length
            const unreadAnonCount = pqrsfTickets.filter(p => !isIdentified(p) && !p.read).length

            return (
              <div style={{ animation: 'fadeUp 0.4s ease' }}>
                <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                  <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Bandeja PQRSF</h2>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                    <Search size={14} style={{ color: 'var(--muted-foreground)' }} />
                    <input value={pqrsfSearch} onChange={e => setPqrsfSearch(e.target.value)}
                      placeholder="Buscar por nombre, correo, asunto…"
                      className="text-sm outline-none bg-transparent" style={{ color: 'var(--foreground)', width: 220 }} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                  {[
                    { label: 'Total recibidos', value: pqrsfTickets.length, icon: Inbox, color: 'var(--primary)' },
                    { label: 'Prioritarios pendientes', value: pendingCount, icon: ShieldCheck, color: '#d97706' },
                    { label: 'Respondidos', value: respondedCount, icon: Check, color: '#16a34a' },
                    { label: 'Anónimos sin leer', value: unreadAnonCount, icon: Eye, color: '#7c3aed' },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-4" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ color: s.color }}><s.icon size={20} /></span>
                        <AnimatedCounter target={s.value} style={{ fontSize: 24, fontFamily: 'var(--font-display)', color: s.color, fontWeight: 900 }} />
                      </div>
                      <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color: 'var(--primary)' }}><ShieldCheck size={16} /></span>
                  <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Prioritarios — con datos de contacto</h3>
                  <span className="text-xs font-bold rounded-full px-1.5" style={{ backgroundColor: 'rgba(0,81,135,0.1)', color: 'var(--primary)' }}>{identifiedTickets.length}</span>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>
                  Vienen de una cuenta real o dejaron un correo válido — se les puede responder y, al hacerlo, se avisa a la persona por correo.
                </p>
                <div className="rounded-xl overflow-hidden mb-2 shadow-sm" style={{ border: '1px solid var(--border)' }}>
                  {pagedIdentified.map((p, i, arr) => {
                    const typeStyle = PQRSF_TYPE_STYLES[p.type] ?? { color: 'var(--primary)', icon: MessageCircle }
                    return (
                    <div key={p.id} style={{
                      display: 'flex', gap: 12, padding: '16px', alignItems: 'flex-start',
                      borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                      borderLeft: `3px solid ${statusColor[p.status]}`,
                      backgroundColor: p.status === 'Pendiente' ? 'rgba(217,119,6,0.05)' : 'var(--card)',
                    }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-xs font-bold" style={{ color: 'var(--muted-foreground)' }}>{p.id}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ backgroundColor: `${statusColor[p.status]}1a`, color: statusColor[p.status] }}>
                            {p.status}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1" style={{ backgroundColor: `${typeStyle.color}1a`, color: typeStyle.color }}>
                            <typeStyle.icon size={11} /> {p.type}
                          </span>
                          {p.accountId && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1" style={{ backgroundColor: 'rgba(22,163,74,0.12)', color: '#16a34a' }}>
                              <ShieldCheck size={11} /> Cuenta verificada
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold mb-0.5" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>{p.subject}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{p.from} · {p.email} · {p.date}</p>
                        {p.message && (
                          <p className="text-xs mt-2 wrap-break-word" style={{ color: 'var(--muted-foreground)' }}>{p.message}</p>
                        )}
                        {p.response && (
                          <p className="text-xs mt-2 p-2.5 rounded-lg wrap-break-word" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)', borderLeft: '3px solid #16a34a' }}>
                            <strong style={{ color: 'var(--foreground)' }}>Respuesta:</strong> {p.response}
                            {p.emailSent && <span style={{ color: '#16a34a' }}> · Correo simulado enviado</span>}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {p.status === 'Pendiente' && (
                          <button onClick={() => { updatePQRSF(p.id, { status: 'Revisando' }); toast('info', 'Marcado en revisión', p.subject) }}
                            className="text-xs px-3 py-1.5 rounded-lg font-bold transition-opacity hover:opacity-80"
                            style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                            Marcar en revisión
                          </button>
                        )}
                        <button onClick={() => setPqrsfReplyModal(p)}
                          className="text-xs px-3 py-1.5 rounded-lg font-bold text-white transition-opacity hover:opacity-90"
                          style={{ background: BRAND_GRADIENT, boxShadow: '0 2px 8px rgba(0,81,135,0.25)' }}>
                          {p.status === 'Respondida' ? 'Editar respuesta' : 'Responder'}
                        </button>
                      </div>
                    </div>
                    )
                  })}
                  {identifiedTickets.length === 0 && (
                    <p className="text-sm px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}>
                      {pqrsfSearch ? 'Nada coincide con esa búsqueda.' : 'No hay PQRSF con datos de contacto todavía.'}
                    </p>
                  )}
                </div>
                <Pagination page={identifiedSafePage} totalPages={identifiedTotalPages} onChange={setPqrsfPage} />

                <div className="flex items-center gap-2 mb-1 mt-6">
                  <span style={{ color: 'var(--muted-foreground)' }}><Inbox size={16} /></span>
                  <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Anónimos — solo para conocimiento</h3>
                  <span className="text-xs font-bold rounded-full px-1.5" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>{anonymousTickets.length}</span>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>
                  No dejaron cuenta ni correo real — no hay forma de responderles, pero quedan aquí para que los tenga en cuenta.
                </p>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px dashed var(--border)' }}>
                  {pagedAnonymous.map((p, i, arr) => (
                    <div key={p.id} style={{
                      display: 'flex', gap: 12, padding: '16px', alignItems: 'flex-start',
                      borderBottom: i < arr.length - 1 ? '1px dashed var(--border)' : 'none',
                      backgroundColor: 'var(--muted)', opacity: p.read ? 0.6 : 1,
                    }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-bold" style={{ color: 'var(--muted-foreground)' }}>{p.id}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1" style={{ backgroundColor: 'var(--card)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
                            <Eye size={11} /> Anónimo
                          </span>
                          {!p.read && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'rgba(217,119,6,0.12)', color: '#d97706' }}>Sin leer</span>
                          )}
                        </div>
                        <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--foreground)' }}>{p.subject}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{p.from} · {p.type} · {p.date}</p>
                        {p.message && (
                          <p className="text-xs mt-2 wrap-break-word" style={{ color: 'var(--muted-foreground)' }}>{p.message}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => { setPqrsfReplyModal(p); if (!p.read) markPQRSFRead(p.id) }}
                          className="text-xs px-3 py-1.5 rounded-lg font-bold transition-opacity hover:opacity-80"
                          style={{ border: '1px solid var(--border)', color: 'var(--foreground)', backgroundColor: 'var(--card)' }}>
                          Ver completo
                        </button>
                        {!p.read && (
                          <button onClick={() => handlePQRSFMarkRead(p)}
                            className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                            style={{ color: 'var(--muted-foreground)' }}>
                            Marcar como leído
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {anonymousTickets.length === 0 && (
                    <p className="text-sm px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}>
                      {pqrsfSearch ? 'Nada coincide con esa búsqueda.' : 'No hay comentarios anónimos por ahora.'}
                    </p>
                  )}
                </div>
                <Pagination page={anonSafePage} totalPages={anonTotalPages} onChange={setPqrsfAnonPage} />
              </div>
            )
          })()}

          {/* ── CERTIFICACIONES ── */}
          {section === 'certifications' && (() => {
            const q = certSearch.trim().toLowerCase()
            const matches = (student, course) => !q || [student?.name, student?.email, course?.name].some(v => v?.toLowerCase().includes(q))
            const ready = lms.studentsReadyToCertify()
              .filter(r => matches(r.student, r.course))
              .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
            const history = lms.certifiedHistory().filter(c => matches(c.student, c.course))
            const { pageItems: pagedReady, totalPages: readyTotalPages, safePage: readySafePage } = paginate(ready, certReadyPage)
            const { pageItems: pagedHistory, totalPages: historyTotalPages, safePage: historySafePage } = paginate(history, certHistoryPage)
            const fmt = iso => iso ? new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
            // Gmail compose en el navegador — a diferencia de mailto:, no depende
            // de tener un programa de correo instalado, solo de estar conectada
            // a su cuenta de Gmail/Workspace en el navegador.
            function gmailComposeUrl(to, subject, body) {
              const params = new URLSearchParams({ view: 'cm', fs: '1', to, su: subject, body })
              return `https://mail.google.com/mail/?${params.toString()}`
            }
            function certEmailUrl(r) {
              const firstName = (r.student?.name ?? '').trim().split(' ')[0] || 'estudiante'
              const body = [
                `¡Hola ${firstName}! 🎉`,
                '',
                `¡Felicitaciones! Nos complace informarte que finalizaste y aprobaste exitosamente el curso con Lidessa Formación.`,
                '',
                '📊 Resumen de tu logro',
                `   • Curso: ${r.course.name}`,
                `   • Calificación final: ${r.average}/${MAX_GRADE}`,
                '   • Estado: Aprobado ✅',
                '',
                '🎓 Sobre tu certificado',
                'Tu certificado de finalización ya está listo. La entrega se hace de forma presencial en nuestras instalaciones — cuéntanos qué día y hora te queda mejor para coordinarlo contigo.',
                '',
                'Si tienes alguna pregunta, con gusto te ayudamos.',
                '',
                '¡Gracias por tu esfuerzo y compromiso durante el curso!',
                '',
                'Saludos cordiales,',
                'Equipo Lidessa Formación',
                [settings.phone && `📞 ${settings.phone}`, settings.email && `✉️ ${settings.email}`].filter(Boolean).join('  ·  '),
                settings.address || '',
              ].join('\n')
              return gmailComposeUrl(r.student.email, `¡Felicitaciones! Terminaste ${r.course.name} 🎓`, body)
            }
            function handleExportCert() {
              const headers = ['Nombre', 'Correo', 'Teléfono', 'Curso', 'Promedio', 'Estado', 'Fecha']
              const rows = [
                ...ready.map(r => [r.student?.name ?? '', r.student?.email ?? '', r.student?.phone ?? '', r.course.name, r.average, 'Por contactar', fmt(r.completedAt)]),
                ...history.map(c => [c.student?.name ?? '', c.student?.email ?? '', c.student?.phone ?? '', c.course?.name ?? '', '', 'Contactado', fmt(c.markedAt)]),
              ]
              downloadCsv('certificaciones-lidessa.csv', headers, rows)
            }
            return (
              <div style={{ animation: 'fadeUp 0.4s ease' }}>
                <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
                  <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Certificaciones</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                      <Search size={14} style={{ color: 'var(--muted-foreground)' }} />
                      <input value={certSearch} onChange={e => setCertSearch(e.target.value)}
                        placeholder="Buscar por nombre, correo o curso…"
                        className="text-sm outline-none bg-transparent" style={{ color: 'var(--foreground)', width: 220 }} />
                    </div>
                    <button onClick={handleExportCert}
                      className="text-xs px-3 py-2 rounded-lg font-bold flex items-center gap-1.5"
                      style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                      <Download size={13} /> Descargar CSV
                    </button>
                  </div>
                </div>
                <p className="text-xs mb-6" style={{ color: 'var(--muted-foreground)' }}>
                  El certificado se entrega presencial — aquí solo ves quién ya terminó y aprobó el curso, con sus datos de contacto, para que te comuniques con esa persona. Cuando ya hayas hablado con ella, márcala como contactada para que salga de la lista.
                </p>

                <div className="flex items-center gap-2 mb-3">
                  <span style={{ color: '#16a34a' }}><ShieldCheck size={16} /></span>
                  <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Listos para certificar</h3>
                  <span className="text-xs font-bold rounded-full px-1.5" style={{ backgroundColor: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>{ready.length}</span>
                </div>
                <div className="rounded-xl overflow-hidden mb-2" style={{ border: '1px solid var(--border)' }}>
                  {pagedReady.map((r, i, arr) => (
                    <div key={`${r.studentId}_${r.courseId}`} style={{
                      display: 'flex', gap: 12, padding: '16px', alignItems: 'flex-start',
                      borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                      backgroundColor: 'rgba(22,163,74,0.04)',
                    }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold mb-0.5" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>{r.student?.name ?? 'Estudiante'}</p>
                        <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
                          {r.course.name} · Promedio ponderado: {r.average}/{MAX_GRADE} · Terminó: {fmt(r.completedAt)}
                        </p>
                        <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                          {[r.student?.email, r.student?.phone].filter(Boolean).join(' · ') || 'Sin datos de contacto registrados'}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {r.student?.email && (
                          <a href={certEmailUrl(r)} target="_blank" rel="noopener noreferrer"
                            className="text-xs px-3 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5"
                            style={{ border: '1px solid #005187', color: 'var(--primary)' }}>
                            <Mail size={12} /> Enviar correo
                          </a>
                        )}
                        <button onClick={() => { lms.markCertified(r.studentId, r.courseId); toast('success', 'Marcado como contactado', `${r.student?.name ?? 'Estudiante'} — ${r.course.name}`) }}
                          className="text-xs px-3 py-1.5 rounded-lg font-bold text-white" style={{ backgroundColor: '#16a34a' }}>
                          Marcar como contactado
                        </button>
                      </div>
                    </div>
                  ))}
                  {ready.length === 0 && (
                    <p className="text-sm px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}>
                      {certSearch ? 'Nada coincide con esa búsqueda.' : 'Nadie está pendiente por contactar por ahora.'}
                    </p>
                  )}
                </div>
                <Pagination page={readySafePage} totalPages={readyTotalPages} onChange={setCertReadyPage} />

                <div className="flex items-center gap-2 mb-3 mt-6">
                  <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Ya contactados</h3>
                  <span className="text-xs font-bold rounded-full px-1.5" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>{history.length}</span>
                </div>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  {pagedHistory.map((c, i, arr) => (
                    <div key={c.id} style={{
                      display: 'flex', gap: 12, padding: '14px 16px', alignItems: 'center',
                      borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--card)',
                    }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{c.student?.name ?? 'Estudiante'}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{c.course?.name ?? 'Curso eliminado'} · Contactado: {fmt(c.markedAt)}</p>
                      </div>
                      <button onClick={() => { lms.unmarkCertified(c.id); toast('info', 'Deshecho', `${c.student?.name ?? 'Estudiante'} vuelve a "Listos para certificar"`) }}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold shrink-0"
                        style={{ color: 'var(--muted-foreground)' }}>
                        Deshacer
                      </button>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <p className="text-sm px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}>
                      {certSearch ? 'Nada coincide con esa búsqueda.' : 'Todavía no has marcado a nadie como contactado.'}
                    </p>
                  )}
                </div>
                <Pagination page={historySafePage} totalPages={historyTotalPages} onChange={setCertHistoryPage} />
              </div>
            )
          })()}

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
                  const next = assignment.publishAt ? null : todayISO()
                  lms.updateAssignment(assignment.id, { publishAt: next })
                  toast(next ? 'success' : 'warning', next ? 'Tarea publicada' : 'Publicación cancelada', assignment.title)
                }}
                onPublishQuiz={async quiz => {
                  const next = quiz.publishAt ? null : todayISO()
                  try {
                    await lms.updateQuiz(quiz.id, { publishAt: next })
                  } catch (err) {
                    toast('error', 'No se pudo cambiar la publicación', err.message)
                    return
                  }
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
                  const { pageItems: pagedLmsCourses, totalPages: lmsCoursesTotalPages, safePage: lmsCoursesSafePage } = paginate(filteredCourses, lmsCoursesPage)
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
                    <>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pagedLmsCourses.map((c, i) => (
                        <div key={c.id} className="rounded-xl overflow-hidden transition-shadow hover:shadow-md" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                          <button onClick={() => openLmsCourseDetail(c.id)} className="block w-full text-left" style={{ height: 90, ...courseCardStyle(c, i) }} />
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-0.5">
                              <button onClick={() => openLmsCourseDetail(c.id)}
                                className="font-bold text-sm leading-snug text-left hover:underline"
                                style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
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
                    <Pagination page={lmsCoursesSafePage} totalPages={lmsCoursesTotalPages} onChange={setLmsCoursesPage} />
                    </>
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
            const { pageItems: pagedRows, totalPages: directoryTotalPages, safePage: directorySafePage } = paginate(rows, directoryPage)
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
                  {pagedRows.map(u => (
                    <div key={u.id} style={{
                      display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto',
                      gap: '0 16px', padding: '12px 16px', alignItems: 'center',
                      borderTop: '1px solid var(--border)', backgroundColor: 'var(--card)',
                    }}>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{u.name}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{u.email}</p>
                        {u.courseInterest && (
                          <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--primary)' }}>Interesado en: {u.courseInterest}</p>
                        )}
                      </div>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{u.joined}</p>
                      <div className="flex items-center gap-2 w-fit">
                        <Toggle checked={u.active} onChange={() => lms.toggleDirectoryUserActive(u.id)}
                          label={u.active ? 'Desactivar' : 'Activar'} />
                        <span className="text-xs font-semibold" style={{ color: u.active ? '#16a34a' : 'var(--muted-foreground)' }}>
                          {u.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => setDirectoryDetailModal({ role, user: { ...u, avatar: allUsers.find(au => au.id === u.id)?.avatar } })} title="Ver detalle"
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#4d82bc'; e.currentTarget.style.color = '#4d82bc' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
                        >
                          <Eye size={14} />
                        </button>
                        <button onClick={() => setDirectoryModal({ mode: 'edit', role, user: u })} title="Editar"
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                          style={{ backgroundColor: 'rgba(0,81,135,0.1)', color: 'var(--primary)', border: '1px solid rgba(0,81,135,0.2)' }}>
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
                <Pagination page={directorySafePage} totalPages={directoryTotalPages} onChange={setDirectoryPage} />
              </div>
            )
          })()}

          {/* ── MENSAJES ── */}
          {section === 'messages' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              {messageConversation ? (
                <div style={{ maxWidth: 640 }}>
                  <button onClick={() => setMessageConversation(null)} className="text-xs font-semibold mb-3" style={{ color: 'var(--primary)' }}>← Volver a mensajes</button>
                  <div className="flex items-center gap-3 mb-4 rounded-lg p-4" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderTop: '3px solid #005187' }}>
                    <Avatar user={lms.directoryById(messageConversation.studentId)} size={42} />
                    <div className="min-w-0">
                      <h2 className="text-lg font-black truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                        {lms.studentName(messageConversation.studentId)}
                      </h2>
                      <p className="text-xs truncate" style={{ color: 'var(--primary)' }}>
                        {lms.courses.find(c => c.id === messageConversation.courseId)?.name}
                      </p>
                    </div>
                  </div>
                  <ChatThread
                    messages={lms.threadMessages(messageConversation.courseId, user.id, messageConversation.studentId)}
                    currentUserId={user.id}
                    onSend={body => lms.sendMessage({ courseId: messageConversation.courseId, fromId: user.id, toId: messageConversation.studentId, body })}
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-black mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Mensajes</h2>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4 mt-3" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', maxWidth: 320 }}>
                    <Search size={14} style={{ color: 'var(--muted-foreground)' }} />
                    <input value={messagesSearch} onChange={e => setMessagesSearch(e.target.value)}
                      placeholder="Buscar por nombre o correo…"
                      className="text-sm outline-none bg-transparent w-full" style={{ color: 'var(--foreground)' }} />
                  </div>
                  <div className="space-y-2">
                    {pagedConversations.map(c => {
                      const unread = c.unreadCount > 0
                      const fromMe = c.lastMessage.fromId === user.id
                      return (
                      <div key={`${c.courseId}_${c.studentId}`}
                        onClick={() => {
                          setMessageConversation(c)
                          lms.markThreadRead(c.courseId, user.id, c.studentId)
                        }}
                        className="cursor-pointer rounded-lg transition-opacity hover:opacity-90"
                        style={{
                          display: 'flex', gap: 14, padding: '14px 16px', alignItems: 'center',
                          backgroundColor: 'var(--card)', border: '1px solid var(--border)',
                          borderLeft: unread ? '3px solid #005187' : '3px solid transparent',
                        }}>
                        <Avatar user={lms.directoryById(c.studentId)} size={38} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm truncate" style={{ color: 'var(--foreground)', fontWeight: unread ? 800 : 600 }}>{lms.studentName(c.studentId)}</p>
                            <span className="text-xs shrink-0" style={{ color: 'var(--muted-foreground)' }}>{new Date(c.lastMessage.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <p className="text-xs mb-0.5 font-medium" style={{ color: 'var(--primary)' }}>{lms.courses.find(course => course.id === c.courseId)?.name}</p>
                          <p className="text-xs truncate" style={{ color: unread ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: unread ? 600 : 400 }}>
                            {fromMe ? 'Tú: ' : ''}{c.lastMessage.body}
                          </p>
                        </div>
                        {unread && (
                          <span className="text-xs font-bold text-white rounded-full px-2 py-0.5 shrink-0" style={{ backgroundColor: '#005187' }}>{c.unreadCount}</span>
                        )}
                      </div>
                      )
                    })}
                    {filteredConversations.length === 0 && (
                      <p className="text-sm px-4 py-6 text-center rounded-lg" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                        {conversations.length === 0 ? 'Todavía no tienes mensajes de estudiantes.' : 'Ningún estudiante coincide con esa búsqueda.'}
                      </p>
                    )}
                  </div>
                  <Pagination page={adminMessagesSafePage} totalPages={adminMessagesTotalPages} onChange={setAdminMessagesPage} />
                </>
              )}
            </div>
          )}

          {/* ── CONFIGURACIÓN ── */}
          {section === 'suministros' && (() => {
            const q = productsSearch.trim().toLowerCase()
            const lowStock = p => p.stock > 0 && p.stock <= 5
            const chips = [
              { id: 'all', label: 'Todos', count: supplies.products.length },
              { id: 'active', label: 'Publicados', count: supplies.products.filter(p => p.active).length },
              { id: 'hidden', label: 'Ocultos', count: supplies.products.filter(p => !p.active).length },
              { id: 'low', label: 'Stock bajo', count: supplies.products.filter(lowStock).length, color: '#d97706' },
              { id: 'out', label: 'Agotados', count: supplies.products.filter(p => p.stock <= 0).length, color: '#dc2626' },
            ]
            const rows = supplies.products
              .filter(p => productsFilter === 'all' ? true
                : productsFilter === 'active' ? p.active
                : productsFilter === 'hidden' ? !p.active
                : productsFilter === 'low' ? lowStock(p)
                : p.stock <= 0)
              .filter(p => !q || p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q))
            const { pageItems: pagedProducts, totalPages: productsTotalPages, safePage: productsSafePage } = paginate(rows, productsPage)
            const iconBtn = { width: 32, height: 32, border: '1px solid var(--border)', borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }
            const cols = 'md:grid-cols-[minmax(0,2.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]'
            return (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
                <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Productos</h2>
                <button onClick={() => setProductModal('new')}
                  className="px-4 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-1.5"
                  style={{ backgroundColor: '#005187', boxShadow: '0 4px 14px rgba(0,81,135,0.25)' }}>
                  <Plus size={14} /> Nuevo producto
                </button>
              </div>
              <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>
                {supplies.products.length} productos · {supplies.products.filter(p => p.active).length} publicados en la tienda · {supplies.products.reduce((s, p) => s + p.stock, 0)} unidades en inventario
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', width: 280, maxWidth: '100%' }}>
                  <Search size={14} style={{ color: 'var(--muted-foreground)' }} />
                  <input value={productsSearch} onChange={e => { setProductsSearch(e.target.value); setProductsPage(1) }} placeholder="Buscar producto…"
                    className="text-sm outline-none bg-transparent flex-1 min-w-0" style={{ color: 'var(--foreground)' }} />
                </div>
                <FilterDropdown options={chips} value={productsFilter} defaultValue="all"
                  onChange={v => { setProductsFilter(v); setProductsPage(1) }} />
              </div>

              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <div className={`hidden md:grid ${cols}`} style={{ gap: '0 16px', padding: '10px 16px', backgroundColor: 'var(--muted)' }}>
                  {['Producto', 'Precio', 'Stock', 'Publicado', 'Acciones'].map(h => (
                    <span key={h} className={`text-xs font-bold uppercase tracking-wider ${h === 'Acciones' ? 'text-right' : ''}`}
                      style={{ color: 'var(--muted-foreground)', minWidth: h === 'Acciones' ? 72 : undefined }}>{h}</span>
                  ))}
                </div>
                {pagedProducts.map(p => {
                  const stockColor = p.stock <= 0 ? '#dc2626' : lowStock(p) ? '#d97706' : '#16a34a'
                  const stockLabel = p.stock <= 0 ? 'Agotado' : lowStock(p) ? 'Stock bajo' : 'Disponible'
                  return (
                    <div key={p.id}
                      className={`grid grid-cols-[minmax(0,1fr)_auto] ${cols} items-center cursor-pointer transition-colors`}
                      style={{ gap: '6px 16px', padding: '10px 16px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                      onClick={() => setProductModal(p)}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--card)'}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="rounded-lg overflow-hidden shrink-0" style={{ width: 48, height: 48, backgroundColor: 'var(--muted)', border: '1px solid var(--border)', opacity: p.active ? 1 : 0.5 }}>
                          {p.image ? (
                            <img src={p.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--muted-foreground)' }}><ImageIcon size={18} /></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{p.name}</p>
                          <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{p.description || 'Sin descripción'}</p>
                          <p className="md:hidden text-xs mt-0.5" style={{ color: 'var(--foreground)' }}>
                            <strong>{formatCOP(p.price)}</strong> · <span style={{ color: stockColor }}>{p.stock} unid.</span>{!p.active && ' · Oculto'}
                          </p>
                        </div>
                      </div>
                      <p className="hidden md:block text-sm font-bold" style={{ color: 'var(--foreground)' }}>{formatCOP(p.price)}</p>
                      <div className="hidden md:block">
                        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{p.stock} <span className="text-xs font-normal" style={{ color: 'var(--muted-foreground)' }}>unid.</span></p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: stockColor }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: stockColor }} /> {stockLabel}
                        </span>
                      </div>
                      <div className="hidden md:flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <Toggle checked={p.active} onChange={() => supplies.toggleProductActive(p.id)} label={p.active ? 'Ocultar de la tienda' : 'Publicar en la tienda'} />
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{p.active ? 'Sí' : 'No'}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1.5" style={{ minWidth: 72 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setProductModal(p)} title="Editar" aria-label="Editar" style={{ ...iconBtn, color: 'var(--primary)' }}><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteConfirm({ type: 'supplyProduct', id: p.id, label: p.name })} title="Eliminar" aria-label="Eliminar"
                          style={{ ...iconBtn, color: '#dc2626', borderColor: 'rgba(220,38,38,0.3)' }}><Trash size={14} /></button>
                      </div>
                    </div>
                  )
                })}
                {rows.length === 0 && (
                  <p className="text-sm px-4 py-10 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)', borderTop: '1px solid var(--border)' }}>
                    {supplies.products.length === 0 ? 'Todavía no se ha agregado ningún producto.' : 'No hay productos con ese filtro o búsqueda.'}
                  </p>
                )}
              </div>
              <Pagination page={productsSafePage} totalPages={productsTotalPages} onChange={setProductsPage} />
            </div>
            )
          })()}

          {section === 'pedidos-suministros' && (() => {
            const historialStatuses = ['rejected', 'completed']
            const statusCounts = supplies.orders.reduce((acc, o) => ({ ...acc, [o.status]: (acc[o.status] ?? 0) + 1 }), {})
            const activeCount = supplies.orders.filter(o => !historialStatuses.includes(o.status)).length
            const historialCount = supplies.orders.filter(o => historialStatuses.includes(o.status)).length
            const inHistorial = pedidosView === 'historial'
            const chips = [
              { id: 'activos', label: 'Activos', count: activeCount },
              { id: 'all', label: 'Todos', count: supplies.orders.length },
              ...Object.entries(ORDER_STATUS)
                .filter(([id]) => !historialStatuses.includes(id))
                .map(([id, s]) => ({ id, label: s.short, count: statusCounts[id] ?? 0, color: s.color })),
            ]
            const q = ordersSearch.trim().toLowerCase()
            const visibleOrders = supplies.orders
              .filter(o => pedidosView === 'all' ? true
                : pedidosView === 'activos' ? !historialStatuses.includes(o.status)
                : pedidosView === 'historial' ? historialStatuses.includes(o.status)
                : o.status === pedidosView)
              .filter(o => !q || o.customerName.toLowerCase().includes(q) || (o.customerEmail ?? '').toLowerCase().includes(q) || orderNumber(o).includes(q.replace('#', '')))
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            const { pageItems: pagedOrders, totalPages: ordersTotalPages, safePage: ordersSafePage } = paginate(visibleOrders, ordersPage)
            const iconBtn = { width: 32, height: 32, border: '1px solid var(--border)', borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }
            const cols = 'md:grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_auto]'
            return (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
                <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                  {inHistorial ? 'Historial de pedidos' : 'Pedidos'}
                </h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setPedidosView(inHistorial ? 'activos' : 'historial'); setOrdersPage(1) }}
                    className="px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-1.5"
                    style={inHistorial
                      ? { backgroundColor: '#005187', color: 'white', boxShadow: '0 4px 14px rgba(0,81,135,0.25)' }
                      : { border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                    <History size={14} /> {inHistorial ? 'Ver pedidos activos' : 'Historial de pedidos'}
                    {!inHistorial && historialCount > 0 && (
                      <span className="text-xs font-bold px-1.5 rounded-full" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>{historialCount}</span>
                    )}
                  </button>
                  <button onClick={() => setOrderModal({ mode: 'new' })}
                    className="px-4 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-1.5"
                    style={{ backgroundColor: '#005187', boxShadow: '0 4px 14px rgba(0,81,135,0.25)' }}>
                    <Plus size={14} /> Nuevo pedido
                  </button>
                </div>
              </div>
              <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>
                {inHistorial
                  ? `${historialCount} pedidos completados o rechazados · Haga clic en un pedido para ver su detalle.`
                  : `${supplies.orders.length} pedidos · ${statusCounts.pending ?? 0} por revisar · Haga clic en un pedido para ver su detalle y gestionarlo.`}
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', width: 280, maxWidth: '100%' }}>
                  <Search size={14} style={{ color: 'var(--muted-foreground)' }} />
                  <input value={ordersSearch} onChange={e => { setOrdersSearch(e.target.value); setOrdersPage(1) }} placeholder="Buscar por cliente, correo o # pedido…"
                    className="text-sm outline-none bg-transparent flex-1 min-w-0" style={{ color: 'var(--foreground)' }} />
                </div>
                {!inHistorial && (
                  <FilterDropdown options={chips} value={pedidosView} defaultValue="activos"
                    onChange={v => { setPedidosView(v); setOrdersPage(1) }} />
                )}
              </div>

              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <div className={`hidden md:grid ${cols}`} style={{ gap: '0 16px', padding: '10px 16px', backgroundColor: 'var(--muted)' }}>
                  {['Pedido', 'Cliente', 'Artículos', 'Total', 'Estado', 'Acciones'].map(h => (
                    <span key={h} className={`text-xs font-bold uppercase tracking-wider ${h === 'Acciones' ? 'text-right' : ''}`}
                      style={{ color: 'var(--muted-foreground)', minWidth: h === 'Acciones' ? 112 : undefined }}>{h}</span>
                  ))}
                </div>
                {pagedOrders.map(o => (
                  <div key={o.id}
                    className={`grid grid-cols-[minmax(0,1fr)_auto] ${cols} items-center cursor-pointer transition-colors`}
                    style={{ gap: '6px 16px', padding: '12px 16px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                    onClick={() => setOpenOrderId(o.id)}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--card)'}
                  >
                    <div className="hidden md:block min-w-0">
                      <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{orderNumber(o)}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{new Date(o.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{o.customerName}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                        <span className="md:hidden">{orderNumber(o)} · {formatCOP(o.total)} · </span>
                        {o.customerEmail || o.customerPhone}
                      </p>
                      <span className="md:hidden inline-block mt-1"><OrderStatusBadge status={o.status} /></span>
                    </div>
                    <p className="hidden md:block text-sm" style={{ color: 'var(--foreground)' }}>
                      {o.items.reduce((s, it) => s + it.qty, 0)} <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>unid.</span>
                    </p>
                    <p className="hidden md:block text-sm font-bold" style={{ color: 'var(--foreground)' }}>{formatCOP(o.total)}</p>
                    <div className="hidden md:block">
                      <OrderStatusBadge status={o.status} />
                      {o.paymentNote && o.status === 'pending' && (
                        <p className="text-[10px] mt-1 font-semibold" style={{ color: '#b8860b' }}>Pago incompleto</p>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-1.5" style={{ minWidth: 112 }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => setOpenOrderId(o.id)} title="Ver detalle" aria-label="Ver detalle" style={{ ...iconBtn, color: 'var(--foreground)' }}><Eye size={14} /></button>
                      <button onClick={() => setOrderModal({ mode: 'edit', order: o })} title="Editar" aria-label="Editar" style={{ ...iconBtn, color: 'var(--primary)' }}><Edit2 size={14} /></button>
                      <button onClick={() => setDeleteConfirm({ type: 'supplyOrder', id: o.id, label: `el pedido ${orderNumber(o)} de ${o.customerName}` })}
                        title="Eliminar" aria-label="Eliminar"
                        style={{ ...iconBtn, color: '#dc2626', borderColor: 'rgba(220,38,38,0.3)' }}><Trash size={14} /></button>
                    </div>
                  </div>
                ))}
                {visibleOrders.length === 0 && (
                  <div className="text-center py-12 px-4" style={{ backgroundColor: 'var(--card)', borderTop: '1px solid var(--border)' }}>
                    <p className="text-sm mb-1 font-semibold" style={{ color: 'var(--foreground)' }}>No hay pedidos para mostrar</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {q ? 'Pruebe con otra búsqueda.' : 'Cambie el filtro o cree un pedido nuevo.'}
                    </p>
                  </div>
                )}
              </div>
              <Pagination page={ordersSafePage} totalPages={ordersTotalPages} onChange={setOrdersPage} />
            </div>
            )
          })()}

          {section === 'clientes-suministros' && (() => {
            const q = clientsSearch.trim().toLowerCase()
            const rows = clientUsers
              .filter(c => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.documentNumber ?? '').toLowerCase().includes(q) || (c.phone ?? '').includes(q))
              .sort((a, b) => a.name.localeCompare(b.name))
            const { pageItems: pagedClients, totalPages: clientsTotalPages, safePage: clientsSafePage } = paginate(rows, clientsPage)
            const iconBtn = { width: 32, height: 32, border: '1px solid var(--border)', borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }
            const cols = 'md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.4fr)_minmax(0,1.1fr)_minmax(0,1fr)_auto]'
            return (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
                <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Clientes</h2>
                <button onClick={() => setClientModal('new')}
                  className="px-4 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-1.5"
                  style={{ backgroundColor: '#005187', boxShadow: '0 4px 14px rgba(0,81,135,0.25)' }}>
                  <Plus size={14} /> Nuevo cliente
                </button>
              </div>
              <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>
                {clientUsers.length} cliente(s) registrados en V2 Suministros.
              </p>

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', width: 320, maxWidth: '100%' }}>
                <Search size={14} style={{ color: 'var(--muted-foreground)' }} />
                <input value={clientsSearch} onChange={e => { setClientsSearch(e.target.value); setClientsPage(1) }} placeholder="Buscar por nombre, correo, documento o teléfono…"
                  className="text-sm outline-none bg-transparent flex-1 min-w-0" style={{ color: 'var(--foreground)' }} />
              </div>

              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <div className={`hidden md:grid ${cols}`} style={{ gap: '0 16px', padding: '10px 16px', backgroundColor: 'var(--muted)' }}>
                  {['Cliente', 'Documento', 'Teléfono', 'Pedidos', 'Acciones'].map(h => (
                    <span key={h} className={`text-xs font-bold uppercase tracking-wider ${h === 'Acciones' ? 'text-right' : ''}`}
                      style={{ color: 'var(--muted-foreground)', minWidth: h === 'Acciones' ? 112 : undefined }}>{h}</span>
                  ))}
                </div>
                {pagedClients.map(c => {
                  const clientOrders = supplies.orders.filter(o => o.clientId === c.id)
                  return (
                    <div key={c.id}
                      className={`grid grid-cols-[minmax(0,1fr)_auto] ${cols} items-center cursor-pointer transition-colors`}
                      style={{ gap: '6px 16px', padding: '12px 16px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                      onClick={() => setClientDetailModal(c)}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--card)'}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar user={c} size={36} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{c.name}</p>
                          <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{c.email}</p>
                        </div>
                      </div>
                      <p className="hidden md:block text-sm truncate" style={{ color: c.documentNumber ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                        {c.documentNumber ? <>{c.documentType && <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{c.documentType} · </span>}{c.documentNumber}</> : '—'}
                      </p>
                      <p className="hidden md:block text-sm truncate" style={{ color: c.phone ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{c.phone || '—'}</p>
                      <div className="hidden md:block">
                        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{clientOrders.length}</p>
                        {clientOrders.length > 0 && (
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{formatCOP(clientOrders.reduce((s, o) => s + o.total, 0))}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-end gap-1.5" style={{ minWidth: 112 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setClientDetailModal(c)} title="Ver detalle" aria-label="Ver detalle" style={{ ...iconBtn, color: 'var(--foreground)' }}><Eye size={14} /></button>
                        <button onClick={() => setClientModal(c)} title="Editar" aria-label="Editar" style={{ ...iconBtn, color: 'var(--primary)' }}><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteConfirm({ type: 'client', id: c.id, label: c.name })} title="Eliminar" aria-label="Eliminar"
                          style={{ ...iconBtn, color: '#dc2626', borderColor: 'rgba(220,38,38,0.3)' }}><Trash size={14} /></button>
                      </div>
                    </div>
                  )
                })}
                {rows.length === 0 && (
                  <p className="text-sm px-4 py-10 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)', borderTop: '1px solid var(--border)' }}>
                    {clientUsers.length === 0 ? 'Todavía no se ha registrado ningún cliente.' : 'Sin resultados para esa búsqueda.'}
                  </p>
                )}
              </div>
              <Pagination page={clientsSafePage} totalPages={clientsTotalPages} onChange={setClientsPage} />
            </div>
            )
          })()}

          {section === 'settings' && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div className="flex gap-1 mb-6 rounded-xl p-1" style={{ backgroundColor: 'var(--muted)', width: 'fit-content' }}>
                {[
                  { id: 'site', label: 'Sitio', icon: Sliders },
                  { id: 'roles', label: 'Usuarios y Roles', icon: ShieldCheck },
                  { id: 'documentTypes', label: 'Tipos de documento', icon: IdCard },
                  { id: 'account', label: 'Mi cuenta', icon: UserCog },
                ].map(t => (
                  <button key={t.id} onClick={() => setSettingsTab(t.id)}
                    className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    style={{ backgroundColor: settingsTab === t.id ? 'var(--card)' : 'transparent', color: settingsTab === t.id ? '#005187' : 'var(--muted-foreground)' }}>
                    <t.icon size={14} /> {t.label}
                  </button>
                ))}
              </div>

              {settingsTab === 'site' && (
                <div style={{ maxWidth: 560 }}>
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

              {settingsTab === 'roles' && (() => {
                // Cuentas + su ficha del LMS (si tiene) para mostrar datos completos.
                const accounts = allUsers.map(u => accountWithDirectory(u))
                const q = rolesSearch.trim().toLowerCase()
                const roleCounts = accounts.reduce((acc, u) => ({ ...acc, [u.role]: (acc[u.role] ?? 0) + 1 }), {})
                const rows = accounts
                  .filter(u => rolesRoleFilter === 'all' || u.role === rolesRoleFilter)
                  .filter(u => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.documentNumber ?? '').toLowerCase().includes(q))
                  .sort((a, b) => a.name.localeCompare(b.name))
                const { pageItems: pagedRows, totalPages: rolesTotalPages, safePage: rolesSafePage } = paginate(rows, rolesPage)
                const filterChips = [{ value: 'all', label: 'Todos', count: accounts.length }, ...ROLE_OPTIONS.map(r => ({ value: r.value, label: r.label, count: roleCounts[r.value] ?? 0 }))]
                const iconBtn = { width: 32, height: 32, border: '1px solid var(--border)', borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }
                return (
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
                      <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Usuarios y Roles</h2>
                      <button onClick={() => setAccountModal({ mode: 'new' })}
                        className="px-4 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-1.5"
                        style={{ backgroundColor: '#005187', boxShadow: '0 4px 14px rgba(0,81,135,0.25)' }}>
                        <Plus size={14} /> Nuevo usuario
                      </button>
                    </div>
                    <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>
                      Cree, consulte, edite o elimine cualquier cuenta del sistema. El rol se asigna dentro del formulario de cada usuario.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', width: 280, maxWidth: '100%' }}>
                        <Search size={14} style={{ color: 'var(--muted-foreground)' }} />
                        <input value={rolesSearch} onChange={e => { setRolesSearch(e.target.value); setRolesPage(1) }} placeholder="Buscar por nombre, correo o documento…"
                          className="text-sm outline-none bg-transparent flex-1 min-w-0" style={{ color: 'var(--foreground)' }} />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {filterChips.map(c => {
                          const active = rolesRoleFilter === c.value
                          return (
                            <button key={c.value} onClick={() => { setRolesRoleFilter(c.value); setRolesPage(1) }}
                              className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
                              style={{
                                backgroundColor: active ? '#005187' : 'var(--card)',
                                color: active ? 'white' : 'var(--muted-foreground)',
                                border: `1px solid ${active ? '#005187' : 'var(--border)'}`,
                              }}>
                              {c.label} <span style={{ opacity: 0.75 }}>({c.count})</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                      <div className="hidden md:grid" style={{ gridTemplateColumns: 'minmax(0,2.2fr) minmax(0,1fr) minmax(0,1.3fr) minmax(0,1.1fr) auto', gap: '0 16px', padding: '10px 16px', backgroundColor: 'var(--muted)' }}>
                        {['Usuario', 'Rol', 'Documento', 'Teléfono', 'Acciones'].map(h => (
                          <span key={h} className={`text-xs font-bold uppercase tracking-wider ${h === 'Acciones' ? 'text-right' : ''}`} style={{ color: 'var(--muted-foreground)', minWidth: h === 'Acciones' ? 112 : undefined }}>{h}</span>
                        ))}
                      </div>
                      {pagedRows.map(u => {
                        const isSelf = u.id === user.id
                        return (
                          <div key={u.id}
                            className="grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_auto] items-center cursor-pointer transition-colors"
                            style={{ gap: '8px 16px', padding: '12px 16px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                            onClick={() => setAccountDetail(u.id)}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--card)'}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar user={u} size={36} />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                                  {u.name}
                                  {isSelf && <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full align-middle" style={{ backgroundColor: 'rgba(0,81,135,0.1)', color: 'var(--primary)' }}>Tú</span>}
                                </p>
                                <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{u.email}</p>
                                <span className="md:hidden inline-block mt-1"><RoleBadge role={u.role} /></span>
                              </div>
                            </div>
                            <div className="hidden md:block"><RoleBadge role={u.role} /></div>
                            <p className="hidden md:block text-sm truncate" style={{ color: u.documentNumber ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                              {u.documentNumber ? <>{u.documentType && <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{u.documentType} · </span>}{u.documentNumber}</> : '—'}
                            </p>
                            <p className="hidden md:block text-sm truncate" style={{ color: u.phone ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{u.phone || '—'}</p>
                            <div className="flex items-center justify-end gap-1.5" style={{ minWidth: 112 }} onClick={e => e.stopPropagation()}>
                              <button onClick={() => setAccountDetail(u.id)} title="Ver detalle" aria-label="Ver detalle" style={{ ...iconBtn, color: 'var(--foreground)' }}><Eye size={14} /></button>
                              <button onClick={() => setAccountModal({ mode: 'edit', account: u })} title="Editar" aria-label="Editar" style={{ ...iconBtn, color: 'var(--primary)' }}><Edit2 size={14} /></button>
                              <button onClick={() => setDeleteConfirm({ type: 'account', id: u.id, label: u.name })} disabled={isSelf}
                                title={isSelf ? 'No puede eliminar su propia cuenta' : 'Eliminar'} aria-label="Eliminar"
                                className="disabled:opacity-30 disabled:cursor-not-allowed"
                                style={{ ...iconBtn, color: '#dc2626', borderColor: 'rgba(220,38,38,0.3)' }}><Trash size={14} /></button>
                            </div>
                          </div>
                        )
                      })}
                      {rows.length === 0 && (
                        <p className="text-sm px-4 py-8 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)', borderTop: '1px solid var(--border)' }}>
                          Sin resultados para esa búsqueda.
                        </p>
                      )}
                    </div>
                    <Pagination page={rolesSafePage} totalPages={rolesTotalPages} onChange={setRolesPage} />
                  </div>
                )
              })()}

              {settingsTab === 'documentTypes' && (
                <div>
                  <h2 className="text-xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Tipos de documento</h2>
                  <p className="text-xs mb-6" style={{ color: 'var(--muted-foreground)' }}>
                    Estas opciones aparecen en el campo "Tipo de documento" al crear o editar un profesor, un estudiante o un cliente de V2 Suministros. Puede agregar, renombrar o eliminar tipos; los que estén en uso no se pueden eliminar.
                  </p>
                  <DocumentTypesManagerView
                    documentTypes={lms.documentTypes}
                    directory={[...lms.directory, ...clientUsers]}
                    onAdd={handleAddDocumentType}
                    onUpdate={(oldName, newName) => {
                      const clean = newName.trim()
                      if (!clean || lms.documentTypes.some(d => d.name.toLowerCase() === clean.toLowerCase() && d.name !== oldName)) return
                      lms.updateDocumentType(oldName, newName)
                      // Los clientes viven en las cuentas (AuthContext), no en el
                      // directorio del LMS: se renombra ahí también.
                      clientUsers.filter(c => c.documentType === oldName)
                        .forEach(c => updateUserCredentials(c.id, { documentType: newName.trim() }))
                    }}
                    onRequestDelete={handleRequestDeleteDocumentType}
                  />
                </div>
              )}

              {settingsTab === 'account' && <AccountSettings />}
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

      {productModal && (
        <SupplyProductFormModal
          product={productModal === 'new' ? null : productModal}
          onSave={data => {
            if (productModal === 'new') supplies.addProduct(data)
            else supplies.updateProduct(productModal.id, data)
            toast('success', productModal === 'new' ? 'Producto creado' : 'Producto actualizado', data.name)
            setProductModal(null)
          }}
          onCancel={() => setProductModal(null)}
        />
      )}

      {accountModal && (
        <UserAccountFormModal
          account={accountModal.mode === 'edit' ? accountModal.account : null}
          isSelf={accountModal.mode === 'edit' && accountModal.account.id === user.id}
          documentTypes={lms.documentTypes}
          existingEmails={allUsers
            .filter(u => accountModal.mode !== 'edit' || u.id !== accountModal.account.id)
            .map(u => u.email.toLowerCase())}
          onSave={handleSaveAccount}
          onClose={() => setAccountModal(null)}
          onManageDocumentTypes={() => { setAccountModal(null); setAccountDetail(null); setSettingsTab('documentTypes') }}
        />
      )}

      {accountDetail && (() => {
        const raw = allUsers.find(u => u.id === accountDetail)
        if (!raw) return null
        const account = accountWithDirectory(raw)
        let related = []
        let relatedTitle = null
        if (account.role === 'profesor') {
          relatedTitle = 'Cursos que dicta'
          related = lms.coursesByTeacher(account.id).map(c => ({ id: c.id, label: c.name, meta: `${c.studentIds.length} est.` }))
        } else if (account.role === 'estudiante') {
          relatedTitle = 'Cursos inscritos'
          related = lms.coursesByStudent(account.id).map(c => {
            const comp = lms.courseCompletion(account.id, c.id)
            return { id: c.id, label: c.name, meta: comp.total ? `${Math.round((comp.completed / comp.total) * 100)}%` : '' }
          })
        } else if (account.role === 'cliente') {
          relatedTitle = 'Pedidos'
          related = supplies.orders.filter(o => o.clientId === account.id)
            .map(o => ({ id: o.id, label: `${formatCOP(o.total)} · ${SUPPLY_ORDER_STATUS_LABEL[o.status]}`, meta: new Date(o.createdAt).toLocaleDateString('es-CO') }))
        }
        return (
          <UserAccountDetailModal
            account={account}
            isSelf={account.id === user.id}
            related={related}
            relatedTitle={relatedTitle}
            onEdit={() => { setAccountDetail(null); setAccountModal({ mode: 'edit', account }) }}
            onDelete={() => { setAccountDetail(null); setDeleteConfirm({ type: 'account', id: account.id, label: account.name }) }}
            onClose={() => setAccountDetail(null)}
          />
        )
      })()}

      {clientModal && (
        <ClientEditModal
          client={clientModal === 'new' ? null : clientModal}
          documentTypes={lms.documentTypes}
          onManageDocumentTypes={() => { setClientModal(null); setSection('settings'); setSettingsTab('documentTypes') }}
          onSave={data => {
            try {
              if (clientModal === 'new') {
                createUser({ ...data, role: 'cliente' })
                toast('success', 'Cliente creado', data.name)
              } else {
                updateUserCredentials(clientModal.id, data)
                toast('success', 'Cliente actualizado', data.name)
              }
              setClientModal(null)
            } catch (err) {
              toast('error', 'No se pudo guardar', err.message)
            }
          }}
          onCancel={() => setClientModal(null)}
        />
      )}

      {clientDetailModal && (
        <ClientDetailModal
          client={clientDetailModal}
          orders={supplies.orders.filter(o => o.clientId === clientDetailModal.id)}
          onClose={() => setClientDetailModal(null)}
        />
      )}

      {orderModal && (
        <OrderFormModal
          order={orderModal.mode === 'edit' ? orderModal.order : null}
          products={supplies.products}
          clients={clientUsers}
          onSave={data => {
            if (orderModal.mode === 'new') {
              const created = supplies.createOrder(data)
              toast('success', 'Pedido creado', `${orderNumber(created)} · ${data.customerName}`)
            } else {
              supplies.updateOrder(orderModal.order.id, data)
              toast('success', 'Pedido actualizado', `${orderNumber(orderModal.order)} · ${data.customerName}`)
            }
            setOrderModal(null)
          }}
          onClose={() => setOrderModal(null)}
        />
      )}

      {openOrderId && !orderModal && (() => {
        const o = supplies.orders.find(x => x.id === openOrderId)
        if (!o) return null
        return (
          <OrderDetailModal
            order={o}
            onClose={() => setOpenOrderId(null)}
            onEdit={() => { setOpenOrderId(null); setOrderModal({ mode: 'edit', order: o }) }}
            onDelete={() => { setOpenOrderId(null); setDeleteConfirm({ type: 'supplyOrder', id: o.id, label: `el pedido ${orderNumber(o)} de ${o.customerName}` }) }}
            onConfirm={() => { supplies.confirmOrder(o.id); toast('success', 'Pedido confirmado', `${orderNumber(o)} · ${o.customerName}`) }}
            onReject={() => setRejectOrderModal(o)}
            onShortfall={() => setPaymentShortfallModal(o)}
            onShip={() => setShipOrderModal(o)}
            onViewImage={img => setLightboxImage(img)}
          />
        )
      })()}

      {shipOrderModal && (
        <ShipOrderModal
          order={shipOrderModal}
          onSave={data => {
            supplies.shipOrder(shipOrderModal.id, data)
            toast('success', 'Pedido marcado como enviado', shipOrderModal.customerName)
            setShipOrderModal(null)
          }}
          onCancel={() => setShipOrderModal(null)}
        />
      )}

      {rejectOrderModal && (
        <RejectOrderModal
          order={rejectOrderModal}
          onSave={(reason, refundProof) => {
            supplies.rejectOrder(rejectOrderModal.id, reason, refundProof)
            toast('success', 'Pedido rechazado', rejectOrderModal.customerName)
            setRejectOrderModal(null)
          }}
          onCancel={() => setRejectOrderModal(null)}
        />
      )}

      {paymentShortfallModal && (
        <PaymentShortfallModal
          order={paymentShortfallModal}
          onSave={data => {
            supplies.requestPaymentShortfall(paymentShortfallModal.id, data)
            toast('success', 'Aviso enviado', paymentShortfallModal.customerName)
            setPaymentShortfallModal(null)
          }}
          onCancel={() => setPaymentShortfallModal(null)}
        />
      )}

      {lightboxImage && (
        <ImageLightbox src={lightboxImage.src} alt={lightboxImage.alt} caption={lightboxImage.alt} onClose={() => setLightboxImage(null)} />
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
          onSave={async form => {
            try {
              if (lmsTopicModal.mode === 'edit') { await lms.updateTopic(lmsTopicModal.topic.id, form); toast('success', 'Tema actualizado', form.title) }
              else { await lms.addTopic(lmsSelectedCourse.id, form); toast('success', 'Tema creado', form.title) }
              setLmsTopicModal(null)
            } catch (err) {
              toast('error', 'No se pudo guardar el tema', err.message)
            }
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
          students={lmsSelectedCourse.studentIds.map(id => lms.directoryById(id)).filter(Boolean)}
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
          students={lmsSelectedCourse.studentIds.map(id => lms.directoryById(id)).filter(Boolean)}
          initialTopicId={lmsQuizModal.topicId}
          onSave={async form => {
            try {
              if (lmsQuizModal.mode === 'edit') { await lms.updateQuiz(lmsQuizModal.quiz.id, form); toast('success', 'Examen actualizado', form.title) }
              else { await lms.addQuiz(lmsSelectedCourse.id, form); toast('success', 'Examen creado', form.title) }
              setLmsQuizModal(null)
            } catch (err) {
              toast('error', 'No se pudo guardar el examen', err.message)
            }
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
          documentTypes={lms.documentTypes}
          onSave={handleSaveDirectoryUser}
          onClose={() => setDirectoryModal(null)}
          onManageDocumentTypes={() => { setDirectoryModal(null); setSection('settings'); setSettingsTab('documentTypes') }}
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
          readOnly={!isIdentified(pqrsfReplyModal)}
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
  const isFull = !!course.capacity && course.studentIds.length >= course.capacity

  return (
    <div style={{ animation: 'fadeUp 0.4s ease' }}>
      <button onClick={onBack} className="text-xs font-semibold mb-3" style={{ color: 'var(--primary)' }}>← Volver a cursos del LMS</button>

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
          { id: 'grading', label: 'Por revisar', icon: ClipboardCheck },
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

      {tab === 'grading' && <CourseGradingQueue courseId={course.id} />}

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
                <button disabled={!addStudentId || isFull}
                  onClick={() => {
                    const result = lms.enrollStudent(course.id, addStudentId)
                    if (result === 'full') toast('error', 'Cupo lleno', 'El curso ya alcanzó su capacidad máxima.')
                    else toast('success', 'Estudiante inscrito', lms.studentName(addStudentId))
                    setAddStudentId('')
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ backgroundColor: '#005187' }}>
                  Inscribir
                </button>
              </div>
              {isFull && <p className="text-xs mb-4" style={{ color: '#dc2626' }}>Este curso alcanzó su capacidad máxima ({course.capacity}).</p>}
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
