import { useState } from 'react'
import { products } from '../data/products'
import ProductModal from '../components/ProductModal'
import PQRSFModal from '@/shared/components/PQRSFModal'

const categories = ['Todos', 'EPP', 'Señalización', 'Primeros auxilios', 'Emergencias', 'Documentación']

export default function Store() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [cart, setCart] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [pqrsfOpen, setPqrsfOpen] = useState(false)

  const filtered = activeCategory === 'Todos' ? products : products.filter(p => p.category === activeCategory)

  const addToCart = (id) => {
    setCart(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div>
      {/* Hero */}
      <section
        className="py-20 relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1400&h=500&fit=crop&auto=format)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(20,20,20,0.95) 50%, rgba(20,20,20,0.6))' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded" style={{ backgroundColor: 'rgba(201,162,39,0.2)', color: '#e8c766' }}>
            Tienda en línea
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Equipos y materiales<br />de seguridad
          </h1>
          <p className="text-base max-w-xl mb-6" style={{ color: '#cbb98a' }}>
            Adquiera equipos de protección personal certificados, señalización industrial y herramientas para el cumplimiento normativo. Envíos a todo Colombia.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            {['✅ Productos certificados', '🚚 Envío a todo el país', '🔒 Compra segura', '📋 Factura electrónica'].map(f => (
              <span key={f} className="px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>{f}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Normative bar */}
      <section className="py-4" style={{ backgroundColor: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap gap-3 items-center">
            <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>📋 Normativa aplicable:</p>
            {['Resolución 0312 de 2019', 'NTC 3610 (cascos)', 'ANSI Z87.1 (gafas)', 'NTC 2171 (guantes)', 'Res. 4272/2021 (trabajo en alturas)'].map(n => (
              <span key={n} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--card)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
                {n}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Filters + grid */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeCategory === c ? 'var(--primary)' : 'var(--muted)',
                  color: activeCategory === c ? 'white' : 'var(--muted-foreground)',
                  border: '1px solid',
                  borderColor: activeCategory === c ? 'var(--primary)' : 'var(--border)',
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {cart.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                <span>🛒</span>
                <span className="text-sm font-bold">{cart.length} producto{cart.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            <a href="https://wa.me/573009876543?text=Hola, quiero hacer un pedido en la tienda" target="_blank" rel="noreferrer"
              className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#25D366' }}>
              💬 Pedir por WhatsApp
            </a>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((product) => {
            const inCart = cart.includes(product.id)
            return (
              <div key={product.id}
                className="rounded-2xl overflow-hidden group transition-shadow hover:shadow-xl"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="h-48 overflow-hidden cursor-pointer" style={{ backgroundColor: 'var(--secondary)' }}
                  onClick={() => setSelectedProduct(product)}>
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                    {product.category}
                  </span>
                  <h3 className="font-bold text-sm mt-2 mb-1 leading-snug cursor-pointer"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
                    onClick={() => setSelectedProduct(product)}>
                    {product.name}
                  </h3>
                  <p className="text-base font-black mb-3" style={{ color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
                    {product.price}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => addToCart(product.id)}
                      className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                      style={{
                        backgroundColor: inCart ? '#16A34A' : 'var(--primary)',
                        color: 'white',
                      }}
                    >
                      {inCart ? '✓ En carrito' : 'Agregar'}
                    </button>
                    <button onClick={() => setSelectedProduct(product)}
                      className="px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
                      style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
                    >
                      Ver más
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Educational content */}
        <div className="mt-16 rounded-2xl p-8" style={{ backgroundColor: 'var(--secondary)', border: '1px solid var(--border)' }}>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Cumplimiento normativo</p>
              <h3 className="text-2xl font-black mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                ¿Sabe qué EPP exige la normativa para su empresa?
              </h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>
                La Resolución 0312 de 2019 y el SG-SST determinan los equipos de protección personal obligatorios según el nivel de riesgo de su actividad económica. Nuestros asesores pueden orientarle sin costo.
              </p>
              <a href="https://wa.me/573001234567?text=Hola, quisiera asesoría sobre qué EPP necesita mi empresa" target="_blank" rel="noreferrer"
                className="inline-block px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--primary)' }}>
                Solicitar asesoría gratuita →
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🪖', label: 'Cascos y protección craneal', norm: 'NTC 3610' },
                { icon: '🧤', label: 'Guantes de protección', norm: 'NTC 2171' },
                { icon: '👓', label: 'Protección visual', norm: 'ANSI Z87.1' },
                { icon: '🦺', label: 'Trabajo en alturas', norm: 'Res. 4272/2021' },
              ].map(item => (
                <div key={item.label} className="rounded-xl p-3" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--foreground)' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.norm}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      {pqrsfOpen && <PQRSFModal onClose={() => setPqrsfOpen(false)} />}
    </div>
  )
}
