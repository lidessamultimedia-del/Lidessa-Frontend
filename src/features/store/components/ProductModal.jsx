import { useState, useEffect } from 'react'

export default function ProductModal({ product, onClose }) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [onClose])

  const handleAdd = () => {
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden" style={{ backgroundColor: 'var(--card)' }}>
        <div className="grid sm:grid-cols-2">
          {/* Image */}
          <div className="h-56 sm:h-full overflow-hidden relative" style={{ backgroundColor: 'var(--secondary)', minHeight: '220px' }}>
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            <button onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            >×</button>
          </div>

          {/* Info */}
          <div className="p-5 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                {product.category}
              </span>
              <h2 className="text-lg font-black mt-2 mb-2 leading-snug" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                {product.name}
              </h2>
              <p className="text-2xl font-black mb-3" style={{ color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
                {product.price}
              </p>
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>
                {product.description}
              </p>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                  📋 {product.norm}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <label className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Cantidad:</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-lg"
                    style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}
                  >−</button>
                  <span className="w-8 text-center font-bold text-sm" style={{ color: 'var(--foreground)' }}>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-lg"
                    style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}
                  >+</button>
                </div>
              </div>
              <button onClick={handleAdd}
                className="w-full py-2.5 rounded-lg text-sm font-bold mb-2 transition-all"
                style={{ backgroundColor: added ? '#16A34A' : 'var(--primary)', color: 'white' }}
              >
                {added ? '✓ ¡Agregado al carrito!' : 'Agregar al carrito'}
              </button>
              <a
                href={`https://wa.me/573009876543?text=Hola, quiero cotizar: ${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#25D366', color: 'white' }}
              >
                💬 Cotizar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
