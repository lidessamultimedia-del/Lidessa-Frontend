import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSupplies } from '../context/SuppliesContext'
import { useAuth } from '@/features/auth/context/AuthContext'
import CheckoutModal from '../components/CheckoutModal'
import { orderNumber } from '../components/OrderDetailModal'
import AccountSettings from '@/shared/components/AccountSettings'
import ThemeToggle from '@/shared/components/ThemeToggle'
import ImageLightbox from '@/shared/components/ImageLightbox'
import Avatar from '@/shared/components/Avatar'
import { formatAmountInput, parseAmountInput } from '@/shared/lib/money'
import {
  ShoppingCart, Plus, Minus, Trash, Check, X, Bell, ImageIcon, Package, LogOut, Search, ShieldCheck,
  Truck, CreditCard, Headset, ChevronDown, ChevronRight, User, MessageCircle, AlertTriangle,
} from '@/shared/components/Icons'

function formatCOP(value) {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

function stepDateTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' })
}

function relativeTime(dateStr) {
  if (!dateStr) return ''
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days <= 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 7) return `Hace ${days} días`
  if (days < 30) return `Hace ${Math.floor(days / 7)} semana(s)`
  return new Date(dateStr).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}

const STATUS_LABEL = { pending: 'Pendiente de revisión', confirmed: 'Confirmado', rejected: 'Rechazado', shipped: 'Enviado', completed: 'Completado' }
const STATUS_COLOR = { pending: '#d97706', confirmed: '#16a34a', rejected: '#dc2626', shipped: '#4d82bc', completed: '#005187' }
const ORDER_STEPS = [
  { status: 'pending', label: 'Recibido' },
  { status: 'confirmed', label: 'Confirmado' },
  { status: 'shipped', label: 'Enviado' },
  { status: 'completed', label: 'Entregado' },
]

// El guard de rol (solo "cliente") ya lo hace ProtectedRoute en routes.jsx,
// igual que con /admin, /profesor y /estudiante — esta página no repite esa
// verificación.
const SORT_OPTIONS = {
  destacados: (a, b) => 0,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'name-asc': (a, b) => a.name.localeCompare(b.name),
}

const fieldStyle = { border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }

function StatusBadge({ status }) {
  const color = STATUS_COLOR[status]
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ backgroundColor: `${color}1a`, color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color }} />
      {STATUS_LABEL[status]}
    </span>
  )
}

function StockBadge({ stock }) {
  const info = stock <= 0
    ? { label: 'Agotado', color: '#f87171' }
    : stock <= 5
    ? { label: `Últimas ${stock} unid.`, color: '#fbbf24' }
    : { label: 'Disponible', color: '#4ade80' }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1.5 rounded-full"
      style={{ backgroundColor: 'rgba(7,20,38,0.6)', backdropFilter: 'blur(6px)', color: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: info.color, boxShadow: `0 0 6px ${info.color}` }} />
      {info.label}
    </span>
  )
}

// Línea de progreso del pedido (Recibido → Confirmado → Enviado → Entregado),
// con la fecha y hora en que ocurrió cada paso ya cumplido (statusHistory).
function OrderProgress({ status, history = [] }) {
  if (status === 'rejected') return null
  const current = ORDER_STEPS.findIndex(s => s.status === status)
  return (
    <div className="flex items-start">
      {ORDER_STEPS.map((step, i) => {
        const done = i <= current
        const entry = history.find(h => h.status === step.status)
        return (
          <div key={step.status} className="flex flex-col items-center flex-1 last:flex-none" style={{ minWidth: 0 }}>
            <div className="flex items-center w-full">
              <span className="flex items-center justify-center rounded-full text-white shrink-0"
                style={{ width: 22, height: 22, backgroundColor: done ? '#005187' : 'var(--muted)', border: done ? 'none' : '1px solid var(--border)' }}>
                {done ? <Check size={12} strokeWidth={3} /> : <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--border)' }} />}
              </span>
              {i < ORDER_STEPS.length - 1 && (
                <span className="flex-1 h-0.5 mx-1.5 rounded-full" style={{ backgroundColor: i < current ? '#005187' : 'var(--border)' }} />
              )}
            </div>
            <span className="text-[10px] font-semibold whitespace-nowrap mt-1" style={{ color: done ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{step.label}</span>
            <span className="text-[9px] whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>
              {done && entry ? stepDateTime(entry.date) : ' '}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function ClientStore({ theme, setTheme }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const supplies = useSupplies()
  const [tab, setTab] = useState('catalogo')
  const [sortBy, setSortBy] = useState('destacados')
  const [search, setSearch] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [orderDone, setOrderDone] = useState(null)
  const [detailProduct, setDetailProduct] = useState(null)
  const [bellOpen, setBellOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState(null) // { src, alt } | null
  const [openOrderId, setOpenOrderId] = useState(null)
  const [ordersFilter, setOrdersFilter] = useState('all') // 'all' | 'active' | 'done'
  const bellRef = useRef(null)
  const userMenuRef = useRef(null)

  const myOrders = supplies.orders
    .filter(o => o.clientId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const activeOrders = myOrders.filter(o => !['completed', 'rejected'].includes(o.status))
  const filteredProducts = supplies.activeProducts.filter(p => {
    if (search.trim() && !p.name.toLowerCase().includes(search.trim().toLowerCase())) return false
    if (minPrice && p.price < Number(minPrice)) return false
    if (maxPrice && p.price > Number(maxPrice)) return false
    if (onlyAvailable && p.stock <= 0) return false
    return true
  })
  const sortedProducts = [...filteredProducts].sort(SORT_OPTIONS[sortBy])
  const hasFilters = search || minPrice || maxPrice || onlyAvailable

  useEffect(() => {
    function handleClick(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Avisa cuando el admin confirma o rechaza un pedido — se arma a partir
  // del estado actual de los pedidos (igual que las notificaciones del
  // panel de admin), no de un registro de eventos aparte.
  const notifications = useMemo(() => {
    const items = []
    myOrders.filter(o => o.status !== 'pending').forEach(o => {
      const firstItem = o.items[0]?.name ?? 'tu pedido'
      const extra = o.items.length > 1 ? ` y ${o.items.length - 1} más` : ''
      const date = o.statusUpdatedAt ?? o.createdAt
      const byStatus = {
        confirmed: { icon: Check, color: '#16a34a', text: `Tu pedido de ${firstItem}${extra} fue confirmado` },
        rejected: { icon: X, color: '#dc2626', text: `Tu pedido de ${firstItem}${extra} fue rechazado` },
        shipped: { icon: Truck, color: '#4d82bc', text: `Tu pedido de ${firstItem}${extra} fue enviado — guía ${o.shipment?.trackingNumber ?? ''} (${o.shipment?.carrier ?? ''})` },
        completed: { icon: Check, color: '#005187', text: `Marcaste como completado tu pedido de ${firstItem}${extra}` },
      }
      if (byStatus[o.status]) items.push({ id: `${o.id}_${o.status}`, orderId: o.id, date, ...byStatus[o.status] })
    })
    myOrders.filter(o => o.paymentNote).forEach(o => {
      const firstItem = o.items[0]?.name ?? 'tu pedido'
      items.push({
        id: `${o.id}_paymentNote_${o.paymentNote.date}`, orderId: o.id, icon: AlertTriangle, color: '#d97706', date: o.paymentNote.date,
        text: `Tu pedido de ${firstItem} tiene un pago pendiente: faltan ${formatCOP(o.paymentNote.amount)}`,
      })
    })
    return items
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
      .map(n => ({ ...n, time: relativeTime(n.date) }))
  }, [myOrders])

  const [notifSeenIds, setNotifSeenIds] = useState(() => new Set())
  const unreadNotifications = notifications.filter(n => !notifSeenIds.has(n.id))

  function markAllNotificationsSeen() {
    setNotifSeenIds(prev => {
      const next = new Set(prev)
      notifications.forEach(n => next.add(n.id))
      return next
    })
  }

  function handleAddToCart(product) {
    supplies.addToCart(product)
    setCartOpen(true)
  }

  // Compra directa: deja el carrito solo con este producto (sin mezclarlo
  // con lo que ya hubiera) y pasa de una vez al apartado de pago.
  function handleBuyNow(product) {
    supplies.clearCart()
    supplies.addToCart(product)
    setDetailProduct(null)
    setCartOpen(false)
    setTab('checkout')
  }

  function handleOrderSubmit(details) {
    const order = supplies.createOrder({ ...details, items: supplies.cart, clientId: user.id })
    setOrderDone(order)
    supplies.clearCart()
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  function clearFilters() {
    setSearch(''); setMinPrice(''); setMaxPrice(''); setOnlyAvailable(false)
  }

  const navItems = [
    { id: 'catalogo', label: 'Catálogo', icon: Package },
  ]

  const visibleOrders = myOrders.filter(o =>
    ordersFilter === 'active' ? !['completed', 'rejected'].includes(o.status)
      : ordersFilter === 'done' ? ['completed', 'rejected'].includes(o.status)
      : true)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      {/* ── Header ── */}
      <header className="sticky top-0 z-30" style={{ backgroundColor: 'var(--supplies-surface)', borderBottom: '1px solid var(--border)', boxShadow: '0 1px 12px rgba(7,20,38,0.04)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3 sm:gap-6">
          <Link to="/tienda/cliente" onClick={() => setTab('catalogo')} className="flex items-center gap-2.5 shrink-0">
            <img src="/assets/v2.png" alt="V2 Suministros" style={{ height: 34, width: 'auto', objectFit: 'contain' }}
              onError={e => { e.currentTarget.src = '/assets/logolidessa.png' }} />
            <span className="hidden md:block leading-tight">
              <span className="block font-black text-sm" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>V2 Suministros</span>
              <span className="block text-[10px] uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>by Lidessa</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
            {navItems.map(item => {
              const active = tab === item.id || (item.id === 'catalogo' && tab === 'checkout')
              return (
                <button key={item.id} onClick={() => setTab(item.id)}
                  className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors"
                  style={{ color: active ? 'var(--primary)' : 'var(--muted-foreground)', backgroundColor: active ? 'color-mix(in srgb, var(--primary) 9%, transparent)' : 'transparent' }}>
                  <item.icon size={15} />
                  <span className="hidden sm:inline">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="text-[10px] font-bold px-1.5 rounded-full text-white" style={{ backgroundColor: '#005187', lineHeight: '16px' }}>{item.badge}</span>
                  )}
                </button>
              )
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <ThemeToggle theme={theme} setTheme={setTheme} className="hidden lg:flex" />

            {/* Notificaciones */}
            <div ref={bellRef} className="relative">
              <button
                onClick={() => {
                  const next = !bellOpen
                  setBellOpen(next)
                  if (next) markAllNotificationsSeen()
                }}
                aria-label="Notificaciones"
                className="relative flex items-center justify-center rounded-full transition-colors"
                style={{ width: 38, height: 38, color: 'var(--foreground)', backgroundColor: bellOpen ? 'var(--muted)' : 'transparent' }}
              >
                <Bell size={19} />
                {unreadNotifications.length > 0 && (
                  <span className="absolute flex items-center justify-center text-white font-bold rounded-full"
                    style={{ top: 3, right: 3, minWidth: 16, height: 16, padding: '0 4px', fontSize: 10, backgroundColor: '#dc2626', border: '2px solid var(--supplies-surface)' }}>
                    {unreadNotifications.length}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 overflow-hidden"
                  style={{ top: 46, width: 'min(340px, calc(100vw - 32px))', backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: '0 16px 40px rgba(0,0,0,0.16)', zIndex: 100, animation: 'fadeUp 0.2s ease' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Novedades de tus pedidos</span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center text-center px-4 py-8">
                      <Bell size={22} style={{ color: 'var(--muted-foreground)' }} />
                      <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>Sin novedades por ahora.</p>
                    </div>
                  ) : (
                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                      {notifications.map((n, i) => {
                        const wasUnread = !notifSeenIds.has(n.id)
                        return (
                          <button key={n.id}
                            onClick={() => { setTab('pedidos'); setOpenOrderId(n.orderId); setBellOpen(false) }}
                            className="w-full text-left flex gap-3 px-4 py-3 transition-colors"
                            style={{ borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: wasUnread ? 'rgba(0,81,135,0.06)' : 'transparent' }}>
                            <span className="flex items-center justify-center rounded-lg shrink-0" style={{ width: 30, height: 30, backgroundColor: `${n.color}1a`, color: n.color }}>
                              <n.icon size={15} />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-xs leading-snug" style={{ color: 'var(--foreground)', fontWeight: wasUnread ? 600 : 400 }}>{n.text}</span>
                              <span className="block text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{n.time}</span>
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Carrito */}
            <button onClick={() => setCartOpen(true)} aria-label="Carrito"
              className="relative inline-flex items-center gap-2 rounded-full px-3 transition-colors"
              style={{ height: 38, backgroundColor: supplies.cartCount > 0 ? '#005187' : 'transparent', color: supplies.cartCount > 0 ? 'white' : 'var(--foreground)' }}>
              <ShoppingCart size={18} />
              {supplies.cartCount > 0 && (
                <span className="text-xs font-bold">{supplies.cartCount} · <span className="hidden sm:inline">{formatCOP(supplies.cartTotal)}</span></span>
              )}
            </button>

            {/* Menú de usuario */}
            <div ref={userMenuRef} className="relative">
              <button onClick={() => setUserMenuOpen(o => !o)}
                className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 transition-colors"
                style={{ border: '1px solid var(--border)', backgroundColor: userMenuOpen ? 'var(--muted)' : 'transparent' }}
                aria-label="Menú de usuario">
                <Avatar user={user} size={30} />
                <span className="hidden sm:block text-xs font-semibold max-w-27.5 truncate" style={{ color: 'var(--foreground)' }}>{user.name.split(' ')[0]}</span>
                <ChevronDown size={13} style={{ color: 'var(--muted-foreground)' }} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 overflow-hidden"
                  style={{ top: 46, width: 240, backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: '0 16px 40px rgba(0,0,0,0.16)', zIndex: 100, animation: 'fadeUp 0.2s ease' }}>
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--foreground)' }}>{user.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{user.email}</p>
                  </div>
                  <div className="p-1.5">
                    {[
                      { label: 'Mi perfil', icon: User, onClick: () => setTab('perfil') },
                      { label: 'Mis pedidos', icon: ShoppingCart, onClick: () => setTab('pedidos'), badge: activeOrders.length },
                    ].map(item => (
                      <button key={item.label} onClick={() => { item.onClick(); setUserMenuOpen(false) }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors"
                        style={{ color: 'var(--foreground)' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <item.icon size={15} style={{ color: 'var(--muted-foreground)' }} /> <span className="flex-1">{item.label}</span>
                        {item.badge > 0 && (
                          <span className="text-[10px] font-bold px-1.5 rounded-full text-white" style={{ backgroundColor: '#005187', lineHeight: '16px' }}>{item.badge}</span>
                        )}
                      </button>
                    ))}
                    <div className="lg:hidden px-3 py-2"><ThemeToggle theme={theme} setTheme={setTheme} /></div>
                  </div>
                  <div className="p-1.5" style={{ borderTop: '1px solid var(--border)' }}>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-left"
                      style={{ color: '#dc2626' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <LogOut size={15} /> Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Perfil ── */}
        {tab === 'perfil' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            <h1 className="text-2xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Mi perfil</h1>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Administre sus datos personales y su contraseña.</p>
            <AccountSettings />
          </div>
        )}

        {/* ── Catálogo ── */}
        {tab === 'catalogo' && (
          <>
            {/* Bienvenida */}
            <section className="relative overflow-hidden" style={{ background: 'linear-gradient(120deg, #10294d 0%, #071426 60%, #0b1d36 100%)' }}>
              <img src="/assets/suministros.png" alt="" aria-hidden="true"
                className="absolute right-0 top-0 h-full w-1/2 object-cover hidden md:block"
                style={{ opacity: 0.35, maskImage: 'linear-gradient(90deg, transparent, black 45%)', WebkitMaskImage: 'linear-gradient(90deg, transparent, black 45%)' }} />
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>V2 Suministros · Catálogo</p>
                <h1 className="text-3xl sm:text-4xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  Hola, {user.name.split(' ')[0]}
                </h1>
                <p className="text-sm sm:text-base max-w-xl mb-6" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  Elementos de protección personal y suministros de seguridad certificados, listos para su empresa.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="#productos" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold" style={{ backgroundColor: 'white', color: '#071426' }}>
                    <Package size={15} /> Ver productos
                  </a>
                  {activeOrders.length > 0 && (
                    <button onClick={() => setTab('pedidos')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white"
                      style={{ border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                      <Truck size={15} /> {activeOrders.length} pedido(s) en curso
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Beneficios */}
            <section style={{ backgroundColor: 'var(--supplies-surface)', borderBottom: '1px solid var(--border)' }}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: ShieldCheck, title: 'Productos certificados', text: 'Cumplen la normativa vigente' },
                  { icon: Truck, title: 'Envíos a todo el país', text: 'Con guía de seguimiento' },
                  { icon: CreditCard, title: 'Pago por transferencia', text: 'Bre-B / Bancolombia' },
                  { icon: Headset, title: 'Asesoría gratuita', text: 'Le orientamos sin costo' },
                ].map(b => (
                  <div key={b.title} className="flex items-center gap-3">
                    <span className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 38, height: 38, backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)' }}>
                      <b.icon size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs sm:text-sm font-bold truncate" style={{ color: 'var(--foreground)' }}>{b.title}</span>
                      <span className="block text-[11px] sm:text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{b.text}</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section id="productos" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 scroll-mt-20">
              {supplies.activeProducts.length === 0 ? (
                <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)' }}>
                  <Package size={32} style={{ color: 'var(--muted-foreground)', margin: '0 auto 12px' }} />
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No hay productos disponibles por el momento.</p>
                </div>
              ) : (
                <>
                  {/* Barra de filtros */}
                  <div className="rounded-2xl p-3 sm:p-4 mb-6 flex flex-wrap items-center gap-3"
                    style={{ backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)' }}>
                    <div className="flex-1 min-w-50 flex items-center gap-2 px-3 rounded-lg" style={{ ...fieldStyle, height: 40 }}>
                      <Search size={15} style={{ color: 'var(--muted-foreground)' }} />
                      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar productos…"
                        className="flex-1 min-w-0 text-sm outline-none bg-transparent" style={{ color: 'var(--foreground)' }} />
                      {search && <button onClick={() => setSearch('')} aria-label="Limpiar búsqueda" style={{ color: 'var(--muted-foreground)' }}><X size={14} /></button>}
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="text" inputMode="numeric" value={formatAmountInput(minPrice)} onChange={e => setMinPrice(parseAmountInput(e.target.value))}
                        placeholder="Precio mín." aria-label="Precio mínimo"
                        className="w-28 text-sm px-3 rounded-lg outline-none" style={{ ...fieldStyle, height: 40 }} />
                      <span style={{ color: 'var(--muted-foreground)' }}>–</span>
                      <input type="text" inputMode="numeric" value={formatAmountInput(maxPrice)} onChange={e => setMaxPrice(parseAmountInput(e.target.value))}
                        placeholder="Precio máx." aria-label="Precio máximo"
                        className="w-28 text-sm px-3 rounded-lg outline-none" style={{ ...fieldStyle, height: 40 }} />
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none px-1" style={{ color: 'var(--foreground)' }}>
                      <input type="checkbox" checked={onlyAvailable} onChange={e => setOnlyAvailable(e.target.checked)} style={{ accentColor: '#005187', width: 16, height: 16 }} />
                      Solo disponibles
                    </label>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Ordenar"
                      className="text-sm px-3 rounded-lg outline-none" style={{ ...fieldStyle, height: 40 }}>
                      <option value="destacados">Destacados</option>
                      <option value="price-asc">Precio: menor a mayor</option>
                      <option value="price-desc">Precio: mayor a menor</option>
                      <option value="name-asc">Nombre: A–Z</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-3 mb-4">
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      <strong style={{ color: 'var(--foreground)' }}>{sortedProducts.length}</strong> producto{sortedProducts.length !== 1 ? 's' : ''}
                    </p>
                    {hasFilters && (
                      <button onClick={clearFilters} className="text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>Limpiar filtros</button>
                    )}
                  </div>

                  {sortedProducts.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: 'var(--supplies-surface)', border: '1px dashed var(--border)' }}>
                      <Search size={26} style={{ color: 'var(--muted-foreground)', margin: '0 auto 10px' }} />
                      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>No encontramos productos</p>
                      <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>Pruebe con otros filtros o términos de búsqueda.</p>
                      <button onClick={clearFilters} className="text-xs font-bold px-4 py-2 rounded-lg text-white" style={{ backgroundColor: '#005187' }}>Limpiar filtros</button>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-16">
                      {sortedProducts.map(p => (
                        <div key={p.id}>
                          <button
                            onClick={() => setDetailProduct(p)}
                            className="relative overflow-hidden mb-4 group block w-full text-left"
                            style={{ aspectRatio: '1 / 1', backgroundColor: 'var(--muted)', boxShadow: '0 0 0 1px var(--border), 0 0 26px 1px var(--card-glow)' }}
                            aria-label={`Ver detalle de ${p.name}`}
                          >
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--muted-foreground)' }}><ImageIcon size={32} /></div>
                            )}
                            <span className="absolute top-3 left-3"><StockBadge stock={p.stock} /></span>
                          </button>
                          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{p.name}</p>
                          <p className="text-sm font-bold mb-3" style={{ color: 'var(--primary)' }}>{formatCOP(p.price)}</p>
                          <button
                            onClick={() => handleAddToCart(p)}
                            disabled={p.stock <= 0}
                            className="w-full py-2.5 text-xs font-bold uppercase tracking-wide transition-colors disabled:opacity-40"
                            style={{ border: '1px solid #005187', color: 'var(--primary)', backgroundColor: 'transparent' }}
                            onMouseEnter={e => { if (p.stock > 0) { e.currentTarget.style.backgroundColor = '#005187'; e.currentTarget.style.color = 'white' } }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#005187' }}
                          >
                            {p.stock <= 0 ? 'Agotado' : 'Agregar al carrito'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}

        {/* ── Mis pedidos ── */}
        {tab === 'pedidos' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
            <h1 className="text-2xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Mis pedidos</h1>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Consulte el estado y el detalle de sus compras.</p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Pedidos totales', value: myOrders.length },
                { label: 'En curso', value: activeOrders.length },
                { label: 'Entregados', value: myOrders.filter(o => o.status === 'completed').length },
                { label: 'Total comprado', value: formatCOP(myOrders.filter(o => o.status !== 'rejected').reduce((s, o) => s + o.total, 0)) },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-4" style={{ backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)' }}>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
                  <p className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>{s.value}</p>
                </div>
              ))}
            </div>

            {myOrders.length > 0 && (
              <div className="flex gap-1 p-1 rounded-xl mb-5 w-fit" style={{ backgroundColor: 'var(--muted)' }}>
                {[{ id: 'all', label: 'Todos' }, { id: 'active', label: 'En curso' }, { id: 'done', label: 'Finalizados' }].map(f => (
                  <button key={f.id} onClick={() => setOrdersFilter(f.id)}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold"
                    style={ordersFilter === f.id ? { backgroundColor: 'var(--supplies-surface)', color: 'var(--primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' } : { color: 'var(--muted-foreground)' }}>
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {myOrders.length === 0 ? (
              <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: 'var(--supplies-surface)', border: '1px dashed var(--border)' }}>
                <ShoppingCart size={30} style={{ color: 'var(--muted-foreground)', margin: '0 auto 12px' }} />
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Todavía no ha hecho ningún pedido</p>
                <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>Explore el catálogo y haga su primera compra.</p>
                <button onClick={() => setTab('catalogo')} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#005187' }}>Ir al catálogo</button>
              </div>
            ) : visibleOrders.length === 0 ? (
              <p className="text-sm text-center py-12" style={{ color: 'var(--muted-foreground)' }}>No hay pedidos en esta categoría.</p>
            ) : (
              <div className="space-y-4">
                {visibleOrders.map(o => {
                  const open = openOrderId === o.id
                  return (
                    <div key={o.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)' }}>
                      <button onClick={() => setOpenOrderId(open ? null : o.id)} className="w-full p-5 text-left">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-sm font-black" style={{ color: 'var(--foreground)' }}>Pedido {orderNumber(o)}</span>
                              <StatusBadge status={o.status} />
                            </div>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                              {new Date(o.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })} · {o.items.reduce((s, it) => s + it.qty, 0)} unidades
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-black" style={{ color: 'var(--foreground)' }}>{formatCOP(o.total)}</span>
                            <ChevronRight size={16} style={{ color: 'var(--muted-foreground)', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                          </div>
                        </div>
                        {o.status === 'rejected' ? (
                          <p className="text-xs font-semibold" style={{ color: '#dc2626' }}>Este pedido fue rechazado. Vea el detalle para conocer la causa.</p>
                        ) : (
                          <OrderProgress status={o.status} history={o.statusHistory} />
                        )}
                      </button>

                      {open && (
                        <div className="px-5 pb-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                          <div className="grid sm:grid-cols-2 gap-5 mb-5">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--muted-foreground)' }}>Datos de entrega</p>
                              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{o.customerPhone}</p>
                              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{o.address}{o.city ? `, ${o.city}` : ''}</p>
                              {o.notes && <p className="text-xs mt-2 italic rounded-lg px-3 py-2" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}>"{o.notes}"</p>}
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--muted-foreground)' }}>Su comprobante de pago</p>
                              {o.proofImage ? (
                                <button type="button" onClick={() => setLightboxImage({ src: o.proofImage, alt: 'Comprobante de pago' })}>
                                  <img src={o.proofImage} alt="Comprobante de pago" className="rounded-lg max-h-32 object-contain" style={{ border: '1px solid var(--border)' }} />
                                </button>
                              ) : (
                                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No se adjuntó comprobante.</p>
                              )}
                            </div>
                          </div>

                          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--muted-foreground)' }}>Artículos</p>
                          <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1px solid var(--border)' }}>
                            {o.items.map((it, i) => {
                              const product = supplies.products.find(p => p.id === it.productId)
                              return (
                                <div key={it.productId} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                                  <div className="rounded-lg overflow-hidden shrink-0" style={{ width: 40, height: 40, backgroundColor: 'var(--muted)' }}>
                                    {product?.image && <img src={product.image} alt="" className="w-full h-full object-cover" />}
                                  </div>
                                  <span className="flex-1 min-w-0 text-sm truncate" style={{ color: 'var(--foreground)' }}><strong>{it.qty}</strong> × {it.name}</span>
                                  <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--foreground)' }}>{formatCOP(it.price * it.qty)}</span>
                                </div>
                              )
                            })}
                            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
                              <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Total</span>
                              <span className="text-base font-black" style={{ color: 'var(--primary)' }}>{formatCOP(o.total)}</span>
                            </div>
                          </div>

                          {o.paymentNote && (
                            <div className="rounded-lg px-3 py-2.5 mb-3 text-xs leading-relaxed" style={{ backgroundColor: 'rgba(184,134,11,0.12)', border: '1px solid rgba(184,134,11,0.3)', color: '#b8860b' }}>
                              <strong>Falta completar el pago:</strong> {o.paymentNote.message} Te faltan <strong>{formatCOP(o.paymentNote.amount)}</strong> — transfiere el restante a la misma cuenta Bre-B (Bancolombia, llave 0092362854, Lidessa SAS) y súbenos el nuevo comprobante escribiéndonos por WhatsApp.
                            </div>
                          )}

                          {o.status === 'rejected' && o.rejectionReason && (
                            <div className="rounded-lg px-3 py-2.5 mb-3 text-xs leading-relaxed" style={{ backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)', color: '#dc2626' }}>
                              <strong>Causa del rechazo:</strong> {o.rejectionReason}
                              {o.refundProof && (
                                <>
                                  <p className="mt-2 mb-1">Te devolvimos el dinero — comprobante:</p>
                                  <button type="button" onClick={() => setLightboxImage({ src: o.refundProof, alt: 'Comprobante de devolución' })}>
                                    <img src={o.refundProof} alt="Comprobante de devolución" className="rounded-lg max-h-32 object-contain" style={{ border: '1px solid var(--border)' }} />
                                  </button>
                                </>
                              )}
                            </div>
                          )}

                          {o.shipment && (
                            <div className="rounded-lg p-3 mb-3 flex items-start gap-3" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                              <Truck size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--muted-foreground)' }}>Envío</p>
                                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{o.shipment.carrier} — guía <strong>{o.shipment.trackingNumber}</strong></p>
                                {o.shipment.photo && (
                                  <button type="button" onClick={() => setLightboxImage({ src: o.shipment.photo, alt: 'Foto de tu paquete' })} className="mt-2">
                                    <img src={o.shipment.photo} alt="Foto del paquete" className="rounded-lg max-h-32 object-contain" style={{ border: '1px solid var(--border)' }} />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {o.status === 'shipped' && (
                            <button onClick={() => supplies.completeOrder(o.id)}
                              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold text-white"
                              style={{ backgroundColor: '#16a34a' }}>
                              <Check size={14} /> Ya me llegó el pedido
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Checkout ── */}
        {tab === 'checkout' && (
          supplies.cart.length === 0 ? (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
              <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>Tu carrito está vacío.</p>
              <button onClick={() => setTab('catalogo')} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#005187' }}>
                Ir al catálogo
              </button>
            </div>
          ) : (
            <CheckoutModal
              variant="section"
              user={user}
              items={supplies.cart.map(it => ({ ...it, image: supplies.products.find(p => p.id === it.productId)?.image }))}
              total={supplies.cartTotal}
              onSubmit={handleOrderSubmit}
              onCancel={() => setTab('catalogo')}
            />
          )
        )}
      </main>

      {/* ── Pie ── */}
      <footer style={{ backgroundColor: 'var(--supplies-surface)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>© {new Date().getFullYear()} Lidessa · V2 Suministros</p>
          <a href="https://wa.me/573332371006?text=Hola, necesito ayuda con un pedido de V2 Suministros" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
            <MessageCircle size={13} /> ¿Necesita ayuda? Escríbanos por WhatsApp
          </a>
        </div>
      </footer>

      {/* ── Carrito (panel lateral) ── */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ backgroundColor: 'rgba(7,20,38,0.55)', backdropFilter: 'blur(2px)' }}
          onClick={e => { if (e.target === e.currentTarget) setCartOpen(false) }}>
          <aside className="h-full w-full max-w-md flex flex-col" style={{ backgroundColor: 'var(--supplies-surface)', boxShadow: '-12px 0 40px rgba(0,0,0,0.2)', animation: 'slideInRight 0.25s ease' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 className="text-lg font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Tu carrito</h2>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{supplies.cartCount} artículo(s)</p>
              </div>
              <button onClick={() => setCartOpen(false)} aria-label="Cerrar carrito" className="flex items-center justify-center rounded-full" style={{ width: 34, height: 34, color: 'var(--muted-foreground)' }}>
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {supplies.cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <ShoppingCart size={32} style={{ color: 'var(--muted-foreground)' }} />
                  <p className="text-sm font-semibold mt-3" style={{ color: 'var(--foreground)' }}>Tu carrito está vacío</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Agregue productos desde el catálogo.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {supplies.cart.map(it => {
                    const product = supplies.products.find(p => p.id === it.productId)
                    return (
                      <div key={it.productId} className="flex gap-3">
                        <div className="rounded-xl overflow-hidden shrink-0" style={{ width: 64, height: 64, backgroundColor: 'var(--muted)' }}>
                          {product?.image ? (
                            <img src={product.image} alt={it.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--muted-foreground)' }}><ImageIcon size={18} /></div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--foreground)' }}>{it.name}</p>
                            <button onClick={() => supplies.removeFromCart(it.productId)} aria-label={`Quitar ${it.name} del carrito`} style={{ color: 'var(--muted-foreground)' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#dc2626'} onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}>
                              <Trash size={14} />
                            </button>
                          </div>
                          <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>{formatCOP(it.price)} c/u</p>
                          <div className="flex items-center justify-between">
                            <div className="inline-flex items-center rounded-lg" style={{ border: '1px solid var(--border)' }}>
                              <button onClick={() => supplies.changeCartQty(it.productId, -1)} aria-label={`Restar una unidad de ${it.name}`} className="w-8 h-8 flex items-center justify-center" style={{ color: 'var(--foreground)' }}><Minus size={12} /></button>
                              <span className="text-sm font-semibold w-7 text-center" style={{ color: 'var(--foreground)' }}>{it.qty}</span>
                              <button onClick={() => supplies.changeCartQty(it.productId, 1)} disabled={product && it.qty >= product.stock}
                                aria-label={`Sumar una unidad de ${it.name}`} className="w-8 h-8 flex items-center justify-center disabled:opacity-30" style={{ color: 'var(--foreground)' }}><Plus size={12} /></button>
                            </div>
                            <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{formatCOP(it.price * it.qty)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="px-5 py-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
              {supplies.cart.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Total</span>
                  <span className="text-xl font-black" style={{ color: 'var(--primary)' }}>{formatCOP(supplies.cartTotal)}</span>
                </div>
              )}
              {supplies.cart.length > 0 && (
                <button onClick={() => { setCartOpen(false); setTab('checkout') }}
                  className="w-full py-3 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#005187' }}>
                  Continuar con el pago
                </button>
              )}
              <button onClick={() => setCartOpen(false)} className="w-full py-2.5 rounded-lg text-sm font-bold" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                Seguir comprando
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Detalle de producto ── */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ backgroundColor: 'rgba(7,20,38,0.6)', backdropFilter: 'blur(2px)' }}
          onClick={e => { if (e.target === e.currentTarget) setDetailProduct(null) }}>
          <div className="relative rounded-2xl overflow-hidden max-w-3xl w-full max-h-full overflow-y-auto grid md:grid-cols-2"
            style={{ backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>
            <button onClick={() => setDetailProduct(null)} aria-label="Cerrar" className="absolute top-3 right-3 z-10 flex items-center justify-center rounded-full"
              style={{ width: 34, height: 34, backgroundColor: 'var(--supplies-surface)', color: 'var(--foreground)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
              <X size={16} />
            </button>
            <div className="relative aspect-[4/3] md:aspect-auto max-h-[46vh] md:max-h-none md:h-full" style={{ backgroundColor: 'var(--muted)' }}>
              {detailProduct.image ? (
                <img src={detailProduct.image} alt={detailProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--muted-foreground)' }}><ImageIcon size={40} /></div>
              )}
              <span className="absolute top-3 left-3"><StockBadge stock={detailProduct.stock} /></span>
            </div>
            <div className="p-6 flex flex-col">
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted-foreground)' }}>V2 Suministros</p>
              <h2 className="text-xl font-black mb-2 pr-8" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>{detailProduct.name}</h2>
              <p className="text-2xl font-black mb-5" style={{ color: 'var(--primary)' }}>{formatCOP(detailProduct.price)}</p>
              <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Descripción</p>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--foreground)' }}>
                {detailProduct.description || 'Sin descripción disponible por el momento.'}
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  { icon: ShieldCheck, text: 'Producto certificado según normativa vigente' },
                  { icon: Truck, text: 'Envío con número de guía para seguimiento' },
                  { icon: Package, text: detailProduct.stock > 0 ? `${detailProduct.stock} unidades disponibles` : 'Sin unidades disponibles' },
                ].map(f => (
                  <li key={f.text} className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <f.icon size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} /> {f.text}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-2">
                <button onClick={() => handleBuyNow(detailProduct)} disabled={detailProduct.stock <= 0}
                  className="w-full py-3 rounded-lg text-sm font-bold text-white disabled:opacity-40" style={{ backgroundColor: '#005187' }}>
                  {detailProduct.stock <= 0 ? 'Agotado' : 'Comprar ahora'}
                </button>
                <button onClick={() => { handleAddToCart(detailProduct); setDetailProduct(null) }} disabled={detailProduct.stock <= 0}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-lg text-sm font-bold disabled:opacity-40"
                  style={{ border: '1px solid #005187', color: 'var(--primary)' }}>
                  <ShoppingCart size={15} /> Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {orderDone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(7,20,38,0.6)' }} onClick={e => { if (e.target === e.currentTarget) setOrderDone(null) }}>
          <div className="rounded-2xl p-8 max-w-sm w-full text-center" style={{ backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white" style={{ backgroundColor: '#16a34a', boxShadow: '0 8px 24px rgba(22,163,74,0.35)' }}>
              <Check size={28} strokeWidth="3" />
            </div>
            <h2 className="text-xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>¡Pedido enviado!</h2>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted-foreground)' }}>Pedido {orderNumber(orderDone)} · {formatCOP(orderDone.total)}</p>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
              Revisaremos tu comprobante de pago y te contactaremos pronto para confirmar tu pedido.
            </p>
            <button onClick={() => { setOrderDone(null); setTab('pedidos'); setOpenOrderId(orderDone.id) }} className="w-full py-3 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#005187' }}>Ver mis pedidos</button>
          </div>
        </div>
      )}

      {lightboxImage && (
        <ImageLightbox src={lightboxImage.src} alt={lightboxImage.alt} caption={lightboxImage.alt} onClose={() => setLightboxImage(null)} />
      )}
    </div>
  )
}
