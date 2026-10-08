import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSupplies } from '../context/SuppliesContext'
import { useAuth } from '@/features/auth/context/AuthContext'
import CheckoutModal from '../components/CheckoutModal'
import AccountSettings from '@/shared/components/AccountSettings'
import ThemeToggle from '@/shared/components/ThemeToggle'
import ImageLightbox from '@/shared/components/ImageLightbox'
import { formatAmountInput, parseAmountInput } from '@/shared/lib/money'
import { ShoppingCart, Plus, Minus, Trash, Check, X, Bell, ImageIcon, Package, LogOut } from '@/shared/components/Icons'

function formatCOP(value) {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
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
const STATUS_COLOR = { pending: '#b8860b', confirmed: '#16a34a', rejected: '#dc2626', shipped: '#4d82bc', completed: '#16a34a' }

// El guard de rol (solo "cliente") ya lo hace ProtectedRoute en routes.jsx,
// igual que con /admin, /profesor y /estudiante — esta página no repite esa
// verificación.
const SORT_OPTIONS = {
  destacados: (a, b) => 0,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
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
  const [cartOpen, setCartOpen] = useState(false)
  const [orderDone, setOrderDone] = useState(null)
  const [detailProduct, setDetailProduct] = useState(null)
  const [bellOpen, setBellOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState(null) // { src, alt } | null
  const [openOrderId, setOpenOrderId] = useState(null)
  const bellRef = useRef(null)

  const myOrders = supplies.orders.filter(o => o.clientId === user.id)
  const filteredProducts = supplies.activeProducts.filter(p => {
    if (search.trim() && !p.name.toLowerCase().includes(search.trim().toLowerCase())) return false
    if (minPrice && p.price < Number(minPrice)) return false
    if (maxPrice && p.price > Number(maxPrice)) return false
    return true
  })
  const sortedProducts = [...filteredProducts].sort(SORT_OPTIONS[sortBy])

  useEffect(() => {
    function handleClick(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false)
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
        confirmed: { icon: Check, text: `Tu pedido de ${firstItem}${extra} fue confirmado` },
        rejected: { icon: X, text: `Tu pedido de ${firstItem}${extra} fue rechazado` },
        shipped: { icon: Package, text: `Tu pedido de ${firstItem}${extra} fue enviado — guía ${o.shipment?.trackingNumber ?? ''} (${o.shipment?.carrier ?? ''})` },
        completed: { icon: Check, text: `Marcaste como completado tu pedido de ${firstItem}${extra}` },
      }
      if (byStatus[o.status]) items.push({ id: `${o.id}_${o.status}`, date, ...byStatus[o.status] })
    })
    myOrders.filter(o => o.paymentNote).forEach(o => {
      const firstItem = o.items[0]?.name ?? 'tu pedido'
      items.push({
        id: `${o.id}_paymentNote_${o.paymentNote.date}`, icon: Bell, date: o.paymentNote.date,
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

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '70vh' }}>
      {/* Header de la tienda: logo + navegación + carrito arriba */}
      <header className="sticky top-0 z-30" style={{ backgroundColor: 'var(--supplies-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4 sm:gap-8">
          <Link to="/tienda/cliente" className="flex items-center gap-2 shrink-0">
            <img src="/assets/logolidessa.png" alt="Lidessa" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <span className="hidden sm:inline font-black" style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>
              <span style={{ color: 'var(--primary)' }}>Lide</span><span style={{ color: '#4d82bc' }}>ssa</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
            <button
              onClick={() => setTab('catalogo')}
              className="px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap"
              style={tab === 'catalogo' ? { color: 'var(--primary)', backgroundColor: 'rgba(0,81,135,0.08)' } : { color: 'var(--muted-foreground)' }}
            >
              Catálogo
            </button>
            <button
              onClick={() => setTab('pedidos')}
              className="px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap"
              style={tab === 'pedidos' ? { color: 'var(--primary)', backgroundColor: 'rgba(0,81,135,0.08)' } : { color: 'var(--muted-foreground)' }}
            >
              Mis pedidos {myOrders.length > 0 && `(${myOrders.length})`}
            </button>
            <button
              onClick={() => setTab('perfil')}
              className="px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap"
              style={tab === 'perfil' ? { color: 'var(--primary)', backgroundColor: 'rgba(0,81,135,0.08)' } : { color: 'var(--muted-foreground)' }}
            >
              Mi perfil
            </button>
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            <ThemeToggle theme={theme} setTheme={setTheme} className="hidden sm:flex" />

            <div ref={bellRef} style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  const next = !bellOpen
                  setBellOpen(next)
                  if (next) markAllNotificationsSeen()
                }}
                aria-label="Notificaciones"
                style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--foreground)' }}
              >
                <Bell size={20} />
                {unreadNotifications.length > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 flex items-center justify-center text-white font-bold rounded-full"
                    style={{ backgroundColor: '#dc2626', width: 16, height: 16, fontSize: 10 }}
                  >
                    {unreadNotifications.length}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div
                  style={{
                    position: 'absolute', top: 32, right: 0, width: 300,
                    backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)',
                    borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                    zIndex: 100, overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Notificaciones de tus pedidos</span>
                  </div>
                  {notifications.length === 0 && (
                    <p className="text-xs px-4 py-4" style={{ color: 'var(--muted-foreground)' }}>Sin novedades por ahora.</p>
                  )}
                  {notifications.map((n, i) => {
                    const wasUnread = !notifSeenIds.has(n.id)
                    return (
                      <div
                        key={n.id}
                        onClick={() => { setTab('pedidos'); setBellOpen(false) }}
                        className="cursor-pointer transition-colors"
                        style={{
                          padding: '10px 16px',
                          borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                          backgroundColor: wasUnread ? 'rgba(0,81,135,0.08)' : 'transparent',
                        }}
                      >
                        <div className="flex gap-3">
                          <span style={{ flexShrink: 0, color: 'var(--muted-foreground)' }}>
                            <n.icon size={16} />
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

            <button onClick={() => setCartOpen(true)} className="relative" aria-label="Carrito" style={{ color: 'var(--foreground)' }}>
              <ShoppingCart size={21} />
              {supplies.cartCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 flex items-center justify-center text-white font-bold rounded-full"
                  style={{ backgroundColor: '#005187', width: 16, height: 16, fontSize: 10 }}
                >
                  {supplies.cartCount}
                </span>
              )}
            </button>
            <div className="hidden sm:block text-right leading-tight">
              <p className="text-xs" style={{ color: 'var(--foreground)' }}>Hola, <strong>{user.name.split(' ')[0]}</strong></p>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                style={{ border: '1px solid rgba(220,38,38,0.35)', color: '#dc2626', backgroundColor: 'rgba(220,38,38,0.08)' }}
              >
                <LogOut size={13} /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {tab === 'perfil' && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <AccountSettings />
        </div>
      )}

      {tab === 'catalogo' && (
        <>
          {/* Hero editorial de categoría */}
          <div className="relative overflow-hidden" style={{ height: 230, backgroundColor: '#0c0c0c' }}>
            <img
              src="/assets/suministros.png" alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.9, objectPosition: 'center top' }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(7,20,38,0.45) 0%, rgba(7,20,38,0.3) 45%, rgba(7,20,38,0.1) 100%)' }} />
            <div className="relative h-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col justify-center">
              <span className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#e8c766', textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}>V2 Suministros</span>
              <h2 className="text-4xl sm:text-5xl font-black text-white" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em', textShadow: '0 2px 14px rgba(0,0,0,0.7)' }}>
                CATÁLOGO
              </h2>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {supplies.activeProducts.length === 0 ? (
              <p className="text-sm text-center py-16" style={{ color: 'var(--muted-foreground)' }}>
                No hay productos disponibles por el momento.
              </p>
            ) : (
              <>
                {/* Filtros: nombre, rango de precio y orden */}
                <div className="flex flex-wrap items-center gap-3 py-5">
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por nombre..."
                    className="flex-1 min-w-[180px] text-sm px-3 py-2 rounded-lg outline-none"
                    style={{ border: '1px solid var(--border)', backgroundColor: 'var(--supplies-surface)', color: 'var(--foreground)' }}
                  />
                  <input
                    type="text" inputMode="numeric"
                    value={formatAmountInput(minPrice)}
                    onChange={e => setMinPrice(parseAmountInput(e.target.value))}
                    placeholder="Precio mín."
                    className="w-28 text-sm px-3 py-2 rounded-lg outline-none"
                    style={{ border: '1px solid var(--border)', backgroundColor: 'var(--supplies-surface)', color: 'var(--foreground)' }}
                  />
                  <input
                    type="text" inputMode="numeric"
                    value={formatAmountInput(maxPrice)}
                    onChange={e => setMaxPrice(parseAmountInput(e.target.value))}
                    placeholder="Precio máx."
                    className="w-28 text-sm px-3 py-2 rounded-lg outline-none"
                    style={{ border: '1px solid var(--border)', backgroundColor: 'var(--supplies-surface)', color: 'var(--foreground)' }}
                  />
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="text-xs px-3 py-2.5 rounded-lg outline-none"
                    style={{ border: '1px solid var(--border)', backgroundColor: 'var(--supplies-surface)', color: 'var(--foreground)' }}
                  >
                    <option value="destacados">Ordenar: Destacados</option>
                    <option value="price-asc">Precio: menor a mayor</option>
                    <option value="price-desc">Precio: mayor a menor</option>
                  </select>
                </div>

                <p className="text-xs pb-5" style={{ color: 'var(--muted-foreground)' }}>
                  {sortedProducts.length} producto{sortedProducts.length !== 1 ? 's' : ''} encontrado{sortedProducts.length !== 1 ? 's' : ''}
                </p>

                {sortedProducts.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>No se encontraron productos con esos filtros.</p>
                    <button
                      onClick={() => { setSearch(''); setMinPrice(''); setMaxPrice('') }}
                      className="text-xs font-bold underline"
                      style={{ color: 'var(--primary)' }}
                    >
                      Limpiar filtros
                    </button>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
                  {sortedProducts.map(p => (
                    <div key={p.id}>
                      <button
                        onClick={() => setDetailProduct(p)}
                        className="relative overflow-hidden mb-3 group block w-full text-left"
                        style={{ aspectRatio: '3 / 4', backgroundColor: 'var(--muted)' }}
                        aria-label={`Ver detalle de ${p.name}`}
                      >
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--muted-foreground)' }}><ImageIcon size={32} /></div>
                        )}
                        {p.stock <= 0 && (
                          <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wide px-2 py-1" style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: 'white' }}>
                            Agotado
                          </span>
                        )}
                        <div
                          className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                          style={{ backgroundColor: 'rgba(7,20,38,0.35)' }}
                        >
                          <span className="text-xs font-bold uppercase tracking-wide px-3 py-1.5" style={{ backgroundColor: 'white', color: '#071426' }}>
                            Ver detalle
                          </span>
                        </div>
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
              </>
            )}
          </div>
        </>
      )}

      {tab === 'pedidos' && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="pb-16">
            {myOrders.length === 0 ? (
              <div className="text-center py-16">
                <Package size={32} style={{ color: 'var(--muted-foreground)', margin: '0 auto 12px' }} />
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Todavía no has hecho ningún pedido.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map(o => {
                  const open = openOrderId === o.id
                  return (
                    <div key={o.id} className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)' }}>
                      <button onClick={() => setOpenOrderId(open ? null : o.id)} className="w-full flex flex-wrap items-center justify-between gap-2 p-5 text-left">
                        <div className="min-w-0">
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            {new Date(o.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                            {o.items.length} artículo{o.items.length !== 1 ? 's' : ''} — {formatCOP(o.total)}
                          </p>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white shrink-0" style={{ backgroundColor: STATUS_COLOR[o.status] }}>
                          {STATUS_LABEL[o.status]}
                        </span>
                      </button>

                      {open && (
                        <div className="px-5 pb-5 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
                          <div className="grid sm:grid-cols-2 gap-4 my-4">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Datos de entrega</p>
                              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{o.customerPhone}</p>
                              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{o.address}{o.city ? `, ${o.city}` : ''}</p>
                              {o.notes && <p className="text-xs mt-1 italic" style={{ color: 'var(--muted-foreground)' }}>"{o.notes}"</p>}
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Tu comprobante de pago</p>
                              {o.proofImage ? (
                                <button type="button" onClick={() => setLightboxImage({ src: o.proofImage, alt: 'Comprobante de pago' })}>
                                  <img src={o.proofImage} alt="Comprobante de pago" className="rounded-lg max-h-32 object-contain" style={{ border: '1px solid var(--border)' }} />
                                </button>
                              ) : (
                                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No se adjuntó comprobante.</p>
                              )}
                            </div>
                          </div>

                          <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Artículos</p>
                          <div className="space-y-1 mb-3">
                            {o.items.map(it => (
                              <p key={it.productId} className="text-sm flex justify-between" style={{ color: 'var(--foreground)' }}>
                                <span>{it.qty} × {it.name}</span>
                                <span>{formatCOP(it.price * it.qty)}</span>
                              </p>
                            ))}
                          </div>
                          <p className="text-sm font-bold mb-3" style={{ color: 'var(--primary)' }}>Total: {formatCOP(o.total)}</p>

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
                            <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                              <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Envío</p>
                              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{o.shipment.carrier} — guía {o.shipment.trackingNumber}</p>
                              {o.shipment.photo && (
                                <button type="button" onClick={() => setLightboxImage({ src: o.shipment.photo, alt: 'Foto de tu paquete' })} className="mt-2">
                                  <img src={o.shipment.photo} alt="Foto del paquete" className="rounded-lg max-h-32 object-contain" style={{ border: '1px solid var(--border)' }} />
                                </button>
                              )}
                            </div>
                          )}

                          {o.status === 'shipped' && (
                            <button
                              onClick={() => supplies.completeOrder(o.id)}
                              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold text-white"
                              style={{ backgroundColor: '#16a34a' }}
                            >
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
        </div>
      )}

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

      {/* Carrito */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={e => { if (e.target === e.currentTarget) setCartOpen(false) }}>
          <div className="rounded-2xl p-6 max-w-md w-full max-h-full overflow-y-auto" style={{ backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)' }}>
            <h2 className="text-lg font-black mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Tu pedido</h2>

            {supplies.cart.length === 0 ? (
              <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>Tu carrito está vacío.</p>
            ) : (
              <div className="space-y-4 mb-5">
                {supplies.cart.map(it => {
                  const product = supplies.products.find(p => p.id === it.productId)
                  return (
                    <div key={it.productId} className="flex items-center gap-3">
                      <div className="rounded-lg overflow-hidden shrink-0" style={{ width: 56, height: 56, backgroundColor: 'var(--muted)' }}>
                        {product?.image ? (
                          <img src={product.image} alt={it.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--muted-foreground)' }}><ImageIcon size={18} /></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{it.name}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{formatCOP(it.price)} c/u</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => supplies.changeCartQty(it.productId, -1)} aria-label={`Restar una unidad de ${it.name}`} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ border: '1px solid var(--border)' }}><Minus size={12} /></button>
                        <span className="text-sm font-semibold w-4 text-center">{it.qty}</span>
                        <button onClick={() => supplies.changeCartQty(it.productId, 1)} aria-label={`Sumar una unidad de ${it.name}`} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ border: '1px solid var(--border)' }}><Plus size={12} /></button>
                        <button onClick={() => supplies.removeFromCart(it.productId)} aria-label={`Quitar ${it.name} del carrito`} style={{ color: '#b3261e' }}><Trash size={14} /></button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {supplies.cart.length > 0 && (
              <div className="flex items-center justify-between mb-5 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Total</span>
                <span className="text-lg font-black" style={{ color: 'var(--primary)' }}>{formatCOP(supplies.cartTotal)}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setCartOpen(false)} className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>Seguir viendo</button>
              {supplies.cart.length > 0 && (
                <button
                  onClick={() => { setCartOpen(false); setTab('checkout') }}
                  className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white"
                  style={{ backgroundColor: '#005187' }}
                >
                  Continuar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={e => { if (e.target === e.currentTarget) setDetailProduct(null) }}>
          <div className="rounded-xl overflow-hidden max-w-2xl w-full max-h-full overflow-y-auto grid sm:grid-cols-2" style={{ backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)' }}>
            <div style={{ aspectRatio: '3 / 4', backgroundColor: 'var(--muted)' }}>
              {detailProduct.image ? (
                <img src={detailProduct.image} alt={detailProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--muted-foreground)' }}><ImageIcon size={40} /></div>
              )}
            </div>
            <div className="p-6 flex flex-col">
              <button onClick={() => setDetailProduct(null)} className="self-end text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>Cerrar ✕</button>
              <h2 className="text-xl font-black mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>{detailProduct.name}</h2>
              <p className="text-lg font-bold mb-4" style={{ color: 'var(--primary)' }}>{formatCOP(detailProduct.price)}</p>
              <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Qué es y para qué sirve</p>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--foreground)' }}>
                {detailProduct.description || 'Sin descripción disponible por el momento.'}
              </p>
              <div className="mt-auto flex flex-col gap-2">
                <button
                  onClick={() => handleBuyNow(detailProduct)}
                  disabled={detailProduct.stock <= 0}
                  className="w-full py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-40"
                  style={{ backgroundColor: '#005187' }}
                >
                  {detailProduct.stock <= 0 ? 'Agotado' : 'Comprar ahora'}
                </button>
                <button
                  onClick={() => { handleAddToCart(detailProduct); setDetailProduct(null) }}
                  disabled={detailProduct.stock <= 0}
                  className="w-full py-2.5 rounded-lg text-sm font-bold disabled:opacity-40"
                  style={{ border: '1px solid #005187', color: 'var(--primary)' }}
                >
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {orderDone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={e => { if (e.target === e.currentTarget) setOrderDone(null) }}>
          <div className="rounded-xl p-8 max-w-sm w-full text-center" style={{ backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-white" style={{ backgroundColor: '#1a7a3c' }}>
              <Check size={24} strokeWidth="3" />
            </div>
            <h2 className="text-lg font-black mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>¡Pedido enviado!</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
              Revisaremos tu comprobante de pago y te contactaremos pronto para confirmar tu pedido.
            </p>
            <button onClick={() => { setOrderDone(null); setTab('pedidos') }} className="w-full py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#005187' }}>Ver mis pedidos</button>
          </div>
        </div>
      )}

      {lightboxImage && (
        <ImageLightbox src={lightboxImage.src} alt={lightboxImage.alt} caption={lightboxImage.alt} onClose={() => setLightboxImage(null)} />
      )}
    </div>
  )
}
