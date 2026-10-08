import { createContext, useContext, useState } from 'react'
import { seedProducts, seedOrders } from '../data/suppliesSeed'

const SuppliesContext = createContext(null)

// Todo en memoria por ahora (igual que el resto del sitio antes de
// conectarse al backend real) — visual/funcional para la demo, sin
// persistir todavía. El día que se conecte al backend, solo cambian estas
// funciones para hablar con la API en vez de con setState.
export function SuppliesProvider({ children }) {
  const [products, setProducts] = useState(seedProducts)
  const [orders, setOrders] = useState(seedOrders)
  // El carrito vive aquí (no en la página de la tienda) para que sobreviva
  // la navegación a /login o /registro cuando un visitante sin cuenta
  // intenta comprar: esas rutas desmontan la página de la tienda, y un
  // useState local ahí perdería el carrito en ese salto.
  const [cart, setCart] = useState([]) // [{productId, name, price, qty}]

  function addProduct(data) {
    const product = { id: `sp${Date.now()}`, active: true, stock: 0, ...data }
    setProducts(prev => [product, ...prev])
    return product
  }

  function updateProduct(id, data) {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
  }

  function deleteProduct(id) {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  function toggleProductActive(id) {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p))
  }

  // El cliente arma su pedido en la tienda pública: datos de contacto +
  // artículos + foto del comprobante de pago (para revisión manual, todavía
  // no hay pasarela de pago real).
  function createOrder({ customerName, customerPhone, customerEmail, address, city, items, proofImage, notes, clientId }) {
    const total = items.reduce((sum, it) => sum + it.price * it.qty, 0)
    const now = new Date().toISOString()
    const order = {
      id: `ord${Date.now()}`,
      clientId: clientId ?? null,
      customerName, customerPhone, customerEmail: customerEmail ?? '', address, city: city ?? '', notes: notes ?? '',
      items, total, proofImage: proofImage ?? null,
      status: 'pending',
      statusHistory: [{ status: 'pending', date: now }],
      paymentNote: null, // { amount, message, date } — cuando se le avisa que falta pago
      shipment: null, // { carrier, trackingNumber, photo, date } — cuando se despacha
      createdAt: now,
    }
    setOrders(prev => [order, ...prev])
    // Descuenta el stock al hacer el pedido (no al confirmarlo): así ningún
    // otro cliente puede seguir comprando unidades ya apartadas mientras el
    // comprobante está pendiente de revisión.
    setProducts(prev => prev.map(p => {
      const ordered = items.find(it => it.productId === p.id)
      return ordered ? { ...p, stock: Math.max(0, p.stock - ordered.qty) } : p
    }))
    return order
  }

  // Agrega una entrada al historial de estados del pedido — se usa desde
  // cada acción (confirmar, rechazar, despachar, completar) para que el
  // detalle del pedido pueda mostrar la línea de tiempo completa.
  function pushStatus(order, status, date) {
    return { ...order, status, statusUpdatedAt: date, statusHistory: [...(order.statusHistory ?? []), { status, date }] }
  }

  function confirmOrder(id) {
    const now = new Date().toISOString()
    setOrders(prev => prev.map(o => o.id === id ? pushStatus(o, 'confirmed', now) : o))
  }

  function rejectOrder(id, reason, refundProof) {
    const now = new Date().toISOString()
    setOrders(prev => {
      const order = prev.find(o => o.id === id)
      // Si se rechaza, el stock que se apartó al crear el pedido se devuelve
      // al inventario — ya no se vendió.
      if (order && order.status !== 'rejected') {
        setProducts(ps => ps.map(p => {
          const ordered = order.items.find(it => it.productId === p.id)
          return ordered ? { ...p, stock: p.stock + ordered.qty } : p
        }))
      }
      return prev.map(o => o.id === id
        ? pushStatus({ ...o, rejectionReason: reason ?? null, refundProof: refundProof ?? null }, 'rejected', now)
        : o)
    })
  }

  // El pedido ya se confirmó y la encargada lo empacó y despachó — queda
  // registrada la transportadora, el número de guía y una foto del paquete
  // para que el cliente pueda hacer seguimiento desde "Mis pedidos".
  function shipOrder(id, { carrier, trackingNumber, photo }) {
    const now = new Date().toISOString()
    setOrders(prev => prev.map(o => o.id === id
      ? pushStatus({ ...o, shipment: { carrier, trackingNumber, photo: photo ?? null, date: now } }, 'shipped', now)
      : o))
  }

  // Avisa que el comprobante subido no cubre el total y queda un monto
  // pendiente — el pedido sigue "pendiente" (no se confirma ni se rechaza
  // todavía), solo se le anota al cliente cuánto falta y por qué.
  function requestPaymentShortfall(id, { amount, message }) {
    const now = new Date().toISOString()
    setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentNote: { amount, message, date: now } } : o))
  }

  // El cliente confirma que ya le llegó el pedido — lo marca él mismo desde
  // su cuenta (no hay correo real todavía para mandarle un botón ahí, ver
  // plan de trabajo), que es el equivalente más fiel que se puede construir
  // hoy sin backend.
  function completeOrder(id) {
    const now = new Date().toISOString()
    setOrders(prev => prev.map(o => o.id === id ? pushStatus(o, 'completed', now) : o))
  }

  function addToCart(product) {
    setCart(prev => {
      const existing = prev.find(it => it.productId === product.id)
      if (existing) {
        return prev.map(it => it.productId === product.id ? { ...it, qty: it.qty + 1 } : it)
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, qty: 1 }]
    })
  }

  function changeCartQty(productId, delta) {
    setCart(prev => prev
      .map(it => it.productId === productId ? { ...it, qty: it.qty + delta } : it)
      .filter(it => it.qty > 0))
  }

  function removeFromCart(productId) {
    setCart(prev => prev.filter(it => it.productId !== productId))
  }

  function clearCart() {
    setCart([])
  }

  const activeProducts = products.filter(p => p.active)
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length
  const cartCount = cart.reduce((sum, it) => sum + it.qty, 0)
  const cartTotal = cart.reduce((sum, it) => sum + it.price * it.qty, 0)

  return (
    <SuppliesContext.Provider value={{
      products, activeProducts, addProduct, updateProduct, deleteProduct, toggleProductActive,
      orders, createOrder, confirmOrder, rejectOrder, shipOrder, requestPaymentShortfall, completeOrder, pendingOrdersCount,
      cart, addToCart, changeCartQty, removeFromCart, clearCart, cartCount, cartTotal,
    }}>
      {children}
    </SuppliesContext.Provider>
  )
}

export function useSupplies() {
  const ctx = useContext(SuppliesContext)
  if (!ctx) throw new Error('useSupplies must be used inside SuppliesProvider')
  return ctx
}
