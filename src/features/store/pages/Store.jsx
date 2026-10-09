import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import PQRSFModal from '@/shared/components/PQRSFModal'
import CheckoutModal from '@/features/supplies/components/CheckoutModal'
import { useSupplies } from '@/features/supplies/context/SuppliesContext'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'
import { formatAmountInput, parseAmountInput } from '@/shared/lib/money'
import ComingSoon from '@/shared/components/ComingSoon'
import { ShoppingCart, Plus, Minus, Trash, Check, ImageIcon, Package, ShieldCheck, MessageCircle } from '@/shared/components/Icons'

// El catálogo público todavía no está disponible: mientras sea false se
// muestra el bloque "Próximamente" en su lugar. Toda la lógica del catálogo
// (filtros, carrito, checkout) se conserva intacta para reactivarlo
// cambiando solo esta bandera.
const CATALOG_ENABLED = false

function formatCOP(value) {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

const SORT_OPTIONS = {
  destacados: (a, b) => 0,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
}

export default function Store() {
  const supplies = useSupplies()
  const { user } = useAuth()
  const [pqrsfOpen, setPqrsfOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [needAccountOpen, setNeedAccountOpen] = useState(false)
  const [orderDone, setOrderDone] = useState(null)
  const [sortBy, setSortBy] = useState('destacados')
  const [search, setSearch] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const pageRef = useScrollReveal('reveal')
  useScrollReveal('reveal-left')
  useScrollReveal('reveal-scale')

  // Un cliente logueado tiene su propia tienda (catálogo + carrito + sus
  // pedidos) en vez de esta página pública de mercadeo — se manda para allá.
  if (user?.role === 'cliente') {
    return <Navigate to="/tienda/cliente" replace />
  }

  const filteredProducts = supplies.activeProducts.filter(p => {
    if (search.trim() && !p.name.toLowerCase().includes(search.trim().toLowerCase())) return false
    if (minPrice && p.price < Number(minPrice)) return false
    if (maxPrice && p.price > Number(maxPrice)) return false
    return true
  })
  const sortedProducts = [...filteredProducts].sort(SORT_OPTIONS[sortBy])

  function handleAddToCart(product) {
    supplies.addToCart(product)
    setCartOpen(true)
  }

  function handleContinue() {
    setCartOpen(false)
    setNeedAccountOpen(true)
  }

  function handleOrderSubmit(details) {
    const order = supplies.createOrder({ ...details, items: supplies.cart })
    setOrderDone(order)
    supplies.clearCart()
    setCheckoutOpen(false)
  }

  return (
    <div ref={pageRef}>
      {/* Hero */}
      <section
        className="relative min-h-[80vh] flex items-center overflow-hidden py-20"
        style={{ background: 'linear-gradient(135deg, #10294d 0%, #071426 55%, #0c0c0c 100%)' }}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <img src="/assets/v2.png" alt="V2 Suministros" className="mb-4 reveal-scale" style={{ height: 96, width: 'auto' }} />
            <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded reveal" style={{ backgroundColor: 'rgba(201,162,39,0.2)', color: '#e8c766' }}>
              V2 Suministros
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4 reveal stagger-1" style={{ fontFamily: 'var(--font-display)' }}>
              ¡Bienvenidos a V2 Suministros!
            </h1>
            <p className="text-base max-w-2xl mb-3 leading-relaxed reveal stagger-2" style={{ color: '#cbb98a' }}>
              En Lidessa nos enorgullece acompañar a las empresas en el cumplimiento de la normativa de seguridad y salud en el trabajo, con información actualizada y asesoría permanente sobre los estándares que aplican a su actividad.
            </p>
            <p className="text-base max-w-2xl mb-6 leading-relaxed reveal stagger-3" style={{ color: '#cbb98a' }}>
              V2 Suministros es nuestro espacio especializado en seguridad y salud en el trabajo, enfocado en orientarle sobre los equipos de protección personal y elementos que exige la normativa vigente para cada nivel de riesgo.
            </p>
            <a
              href="#catalogo"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-bold text-white reveal stagger-3 transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#005187' }}
            >
              <ShoppingCart size={16} /> {CATALOG_ENABLED ? 'Ver catálogo y comprar' : 'Ver catálogo'}
            </a>
          </div>

          <div className="flex justify-center reveal-scale">
            <div style={{ position: 'relative', width: 'min(400px, 85vw)', height: 'min(400px, 85vw)' }}>
              {/* Glow ring */}
              <div
                className="pointer-events-none"
                style={{
                  position: 'absolute',
                  inset: '-6px',
                  borderRadius: '50%',
                  border: '3px solid #e8c766',
                  boxShadow: '0 0 90px 18px rgba(232,199,102,0.5), inset 0 0 45px rgba(232,199,102,0.2)',
                }}
              />
              {/* Pedestal glow */}
              <div
                className="pointer-events-none"
                style={{
                  position: 'absolute',
                  bottom: '-4%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '65%',
                  height: '13%',
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse at center, rgba(232,199,102,0.45), transparent 70%)',
                  filter: 'blur(6px)',
                }}
              />
              <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
                <img
                  src="/assets/insumos.png"
                  alt="V2 Suministros"
                  className="w-full h-full object-cover"
                  style={{ transition: 'transform 0.4s ease' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Botiquín / primeros auxilios */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="reveal-left">
            <h2 className="text-2xl sm:text-3xl font-black mb-5" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
              ¿Por qué recargar su botiquín de primeros auxilios?
            </h2>
            <ul className="space-y-3 mb-6">
              {[
                { label: 'Conformidad legal:', text: 'cumple con regulaciones, evita sanciones y asegura un entorno laboral conforme.' },
                { label: 'Máxima preparación:', text: 'estar siempre listo para emergencias y cumplir con normativas laborales.' },
                { label: 'Rápida respuesta:', text: 'recarga regular para suministros inmediatos y respuestas rápidas ante incidentes.' },
                { label: 'Protección del personal:', text: 'cuida a su equipo con insumos de calidad para un entorno seguro.' },
              ].map(item => (
                <li key={item.label} className="flex gap-2 text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  <span style={{ color: 'var(--primary)' }}>●</span>
                  <span><strong style={{ color: 'var(--foreground)' }}>{item.label}</strong> {item.text}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>
              Recuerde, nuestro asesoramiento es totalmente gratuito. ¡Estamos aquí para ayudarle!
            </p>
            <a href="https://wa.me/573332371006?text=Hola, quisiera asesoramiento gratuito sobre botiquines de primeros auxilios" target="_blank" rel="noreferrer"
              className="inline-block px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--primary)' }}>
              ¡Asesoramiento Gratis!
            </a>
          </div>
          <div className="rounded-2xl overflow-hidden reveal-scale">
            <img src="/assets/insumos.png" alt="Botiquín de primeros auxilios" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Catálogo de productos */}
      <section id="catalogo" className="py-14 max-w-7xl mx-auto px-4 sm:px-6">
        {!CATALOG_ENABLED ? (
          <ComingSoon
            icon={Package}
            eyebrow="Catálogo de productos"
            title="Nuestra tienda en línea está en camino"
            description="Estamos preparando un catálogo completo de elementos de protección personal y suministros de seguridad para que pueda consultarlos y pedirlos directamente desde aquí. Mientras tanto, nuestro equipo le atiende de forma personalizada."
            features={[
              { icon: Package, label: 'Catálogo completo', detail: 'EPP y suministros por nivel de riesgo.' },
              { icon: ShieldCheck, label: 'Productos certificados', detail: 'Alineados con la normativa vigente.' },
              { icon: ShoppingCart, label: 'Pedidos en línea', detail: 'Compre y haga seguimiento a sus pedidos.' },
            ]}
            cta={{
              label: <><MessageCircle size={16} /> Cotizar por WhatsApp</>,
              href: 'https://wa.me/573332371006?text=Hola, quisiera cotizar elementos de protección personal y suministros de V2 Suministros',
              note: 'Asesoría gratuita y sin compromiso.',
            }}
          />
        ) : (
        <>
        <div className="text-center mb-8 reveal">
          <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            Catálogo de productos
          </h2>
          <p className="text-sm max-w-2xl mx-auto mb-2 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            Elementos de protección personal y suministros de seguridad, listos para pedir.
          </p>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            ¿Ya tiene cuenta de cliente?{' '}
            <Link to="/login" className="underline font-semibold" style={{ color: 'var(--primary)' }}>Inicie sesión</Link>
          </p>
        </div>

        {supplies.activeProducts.length === 0 ? (
          <p className="text-sm text-center py-16" style={{ color: 'var(--muted-foreground)' }}>
            No hay productos disponibles por el momento.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-6 reveal">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre..."
                className="flex-1 min-w-45 text-sm px-3 py-2 rounded-lg outline-none"
                style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
              />
              <input
                type="text" inputMode="numeric"
                value={formatAmountInput(minPrice)}
                onChange={e => setMinPrice(parseAmountInput(e.target.value))}
                placeholder="Precio mín."
                className="w-28 text-sm px-3 py-2 rounded-lg outline-none"
                style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
              />
              <input
                type="text" inputMode="numeric"
                value={formatAmountInput(maxPrice)}
                onChange={e => setMaxPrice(parseAmountInput(e.target.value))}
                placeholder="Precio máx."
                className="w-28 text-sm px-3 py-2 rounded-lg outline-none"
                style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
              />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-xs px-3 py-2.5 rounded-lg outline-none"
                style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
              >
                <option value="destacados">Ordenar: Destacados</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
              </select>
            </div>

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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((p, i) => (
              <div key={p.id} className={`rounded-xl overflow-hidden reveal-scale stagger-${(i % 3) + 1}`} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                <div style={{ height: 180, backgroundColor: 'var(--muted)' }}>
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--muted-foreground)' }}><ImageIcon size={32} /></div>
                  )}
                </div>
                <div className="p-5">
                  <p className="font-bold mb-1" style={{ color: 'var(--foreground)' }}>{p.name}</p>
                  <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>{p.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-black" style={{ color: 'var(--primary)' }}>{formatCOP(p.price)}</span>
                    <button
                      onClick={() => handleAddToCart(p)}
                      disabled={p.stock <= 0}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-40"
                      style={{ backgroundColor: '#005187' }}
                    >
                      <ShoppingCart size={13} /> {p.stock <= 0 ? 'Agotado' : 'Agregar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </>
        )}
        </>
        )}
      </section>

      {/* Compliance CTA — norma 0705 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-2xl p-8 text-center reveal-scale" style={{ backgroundColor: '#141414' }}>
          <h3 className="flex items-center justify-center gap-2 text-xl sm:text-2xl font-black mb-3" style={{ fontFamily: 'var(--font-display)', color: '#e8c766' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8c766" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            ¿Qué pasa si no cumple con la norma 0705?
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8c766" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </h3>
          <p className="text-sm max-w-2xl mx-auto mb-2 leading-relaxed" style={{ color: '#cbb98a' }}>
            No cumplir con la Resolución 0705 de 2007 podría resultar en sanciones por parte de la autoridad competente, como multas, suspensiones o incluso cierres temporales del establecimiento.
          </p>
          <p className="text-sm max-w-2xl mx-auto mb-6 leading-relaxed" style={{ color: '#cbb98a' }}>
            ¿Cómo puede asegurarse de cumplir con la norma? Contar con un botiquín tipo A certificado y con asesoría de nuestro equipo. Actuar de manera proactiva garantiza la seguridad de su entorno laboral y evita riesgos y sanciones para su empresa.
          </p>
          <a href="https://wa.me/573332371006?text=Hola, quisiera asesoría para cumplir con la Resolución 0705 en mi empresa" target="_blank" rel="noreferrer"
            className="inline-block px-5 py-2.5 rounded-lg text-sm font-bold"
            style={{ backgroundColor: '#e8c766', color: '#141414' }}>
            Solicitar asesoría →
          </a>
        </div>

        {/* Educational content */}
        <div className="mt-8 rounded-2xl p-8 reveal" style={{ backgroundColor: 'var(--secondary)', border: '1px solid var(--border)' }}>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="reveal-left">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Cumplimiento normativo</p>
              <h3 className="text-2xl font-black mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                ¿Sabe qué EPP exige la normativa para su empresa?
              </h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>
                La Resolución 0312 de 2019 y el SG-SST determinan los equipos de protección personal obligatorios según el nivel de riesgo de su actividad económica. Nuestros asesores pueden orientarle sin costo.
              </p>
              <a href="https://wa.me/573332371006?text=Hola, quisiera asesoría sobre qué EPP necesita mi empresa" target="_blank" rel="noreferrer"
                className="inline-block px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--primary)' }}>
                Solicitar asesoría gratuita →
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 18h16" />
                      <path d="M5.5 18a6.5 6.5 0 0 1 13 0" />
                      <path d="M12 6.5v3" />
                    </svg>
                  ),
                  label: 'Cascos y protección craneal', norm: 'NTC 3610',
                  detail: 'Obligatorios en zonas con riesgo de golpes o caída de objetos.',
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7.5 11V6a1.5 1.5 0 0 1 3 0v4.5" />
                      <path d="M10.5 10V5a1.5 1.5 0 0 1 3 0v5" />
                      <path d="M13.5 10.5V6.5a1.5 1.5 0 0 1 3 0V12" />
                      <path d="M16.5 11v-.5a1.5 1.5 0 0 1 3 0V15a5.5 5.5 0 0 1-5.5 5.5h-1A6.5 6.5 0 0 1 6.5 14v-2.5a1.5 1.5 0 0 1 3-.3" />
                    </svg>
                  ),
                  label: 'Guantes de protección', norm: 'NTC 2171',
                  detail: 'Protegen las manos frente a cortes, químicos y superficies abrasivas.',
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="6.5" cy="12.5" r="3.2" />
                      <circle cx="17.5" cy="12.5" r="3.2" />
                      <path d="M9.7 12.5h4.6" />
                      <path d="M3.3 10.3 1.5 8.5" />
                      <path d="M20.7 10.3l1.8-1.8" />
                    </svg>
                  ),
                  label: 'Protección visual', norm: 'ANSI Z87.1',
                  detail: 'Evitan lesiones oculares por partículas, salpicaduras o radiación.',
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 20 9.5 6l3.5 6.5L16 8l5 12z" />
                      <circle cx="9.5" cy="6" r="1" fill="currentColor" stroke="none" />
                    </svg>
                  ),
                  label: 'Trabajo en alturas', norm: 'Res. 4272/2021',
                  detail: 'Arnés y líneas de vida certificadas para labores con riesgo de caída.',
                },
              ].map((item, i) => (
                <div key={item.label} className={`flip-card h-33 reveal-scale stagger-${i + 1}`}>
                  <div className="flip-card-inner">
                    <div className="flip-card-front rounded-xl p-3" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                      <div className="w-7 h-7 mb-1.5" style={{ color: 'var(--primary)' }}>{item.icon}</div>
                      <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--foreground)' }}>{item.label}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.norm}</p>
                    </div>
                    <div className="flip-card-back rounded-xl p-3 flex flex-col justify-center" style={{ backgroundColor: 'var(--primary)' }}>
                      <p className="text-xs font-semibold mb-1 text-white">{item.norm}</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>{item.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Botón flotante del carrito, en la esquina opuesta al botón de
          WhatsApp (fixed bottom-6 right-6): ese widget reserva un panel
          invisible de 240px de ancho aun cerrado, así que cualquier offset
          sobre el mismo lado derecho termina debajo de su área de clic. */}
      {supplies.cartCount > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 left-6 z-40 inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-bold text-white shadow-lg"
          style={{ backgroundColor: '#005187' }}
        >
          <ShoppingCart size={16} /> {supplies.cartCount} · {formatCOP(supplies.cartTotal)}
        </button>
      )}

      {/* Carrito */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={e => { if (e.target === e.currentTarget) setCartOpen(false) }}>
          <div className="rounded-xl p-6 max-w-md w-full max-h-full overflow-y-auto" style={{ backgroundColor: 'var(--card)' }}>
            <h2 className="text-lg font-black mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Tu pedido</h2>

            {supplies.cart.length === 0 ? (
              <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>Tu carrito está vacío.</p>
            ) : (
              <div className="space-y-3 mb-5">
                {supplies.cart.map(it => (
                  <div key={it.productId} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{it.name}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{formatCOP(it.price)} c/u</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => supplies.changeCartQty(it.productId, -1)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ border: '1px solid var(--border)' }}><Minus size={12} /></button>
                      <span className="text-sm font-semibold w-4 text-center">{it.qty}</span>
                      <button onClick={() => supplies.changeCartQty(it.productId, 1)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ border: '1px solid var(--border)' }}><Plus size={12} /></button>
                      <button onClick={() => supplies.removeFromCart(it.productId)} style={{ color: '#b3261e' }}><Trash size={14} /></button>
                    </div>
                  </div>
                ))}
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
                  onClick={handleContinue}
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

      {needAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={e => { if (e.target === e.currentTarget) setNeedAccountOpen(false) }}>
          <div className="rounded-xl p-6 max-w-sm w-full text-center" style={{ backgroundColor: 'var(--card)' }}>
            <h2 className="text-lg font-black mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Necesita una cuenta de cliente</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
              Para comprar en el catálogo, inicie sesión o cree una cuenta de cliente. Su carrito queda guardado.
            </p>
            <div className="flex gap-3">
              <Link to="/login" onClick={() => setNeedAccountOpen(false)} className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                Iniciar sesión
              </Link>
              <Link to="/registro?tipo=cliente" onClick={() => setNeedAccountOpen(false)} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#005187' }}>
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      )}

      {checkoutOpen && (
        <CheckoutModal
          user={user}
          items={supplies.cart.map(it => ({ ...it, image: supplies.products.find(p => p.id === it.productId)?.image }))}
          total={supplies.cartTotal}
          onSubmit={handleOrderSubmit}
          onCancel={() => setCheckoutOpen(false)}
        />
      )}

      {orderDone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={e => { if (e.target === e.currentTarget) setOrderDone(null) }}>
          <div className="rounded-xl p-8 max-w-sm w-full text-center" style={{ backgroundColor: 'var(--card)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-white" style={{ backgroundColor: '#1a7a3c' }}>
              <Check size={24} strokeWidth="3" />
            </div>
            <h2 className="text-lg font-black mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>¡Pedido enviado!</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
              Revisaremos tu comprobante de pago y te contactaremos pronto para confirmar tu pedido.
            </p>
            <button onClick={() => setOrderDone(null)} className="w-full py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#005187' }}>Entendido</button>
          </div>
        </div>
      )}

      {pqrsfOpen && <PQRSFModal onClose={() => setPqrsfOpen(false)} />}
    </div>
  )
}
