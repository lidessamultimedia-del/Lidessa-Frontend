import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/context/AuthContext'
import {
  apiGetSupplyProducts, apiGetAllSupplyProducts, apiCreateSupplyProduct, apiUpdateSupplyProduct,
  apiToggleSupplyProductActive, apiDeleteSupplyProduct,
  apiGetSupplyOrders, apiGetMySupplyOrders, apiCreateSupplyOrder, apiUpdateSupplyOrder, apiDeleteSupplyOrder,
  apiConfirmSupplyOrder, apiRejectSupplyOrder, apiShipSupplyOrder, apiRequestSupplyPaymentShortfall, apiCompleteSupplyOrder,
} from '@/shared/lib/api'

const SuppliesContext = createContext(null)

// `image` se deja tal cual la devuelve el backend (ruta cruda) para poder
// reenviarla sin cambios al editar — ClientStore/AdminDashboard resuelven la
// URL de verdad con toDisplayUrl al mostrarla (ver api.js: las fotos de
// ejemplo son /assets/... del propio frontend; solo lo subido por la
// administradora vive en /uploads/... de la API).
function fromApiProduct(p) {
  return {
    id: String(p.id), name: p.name, description: p.description, price: p.price,
    image: p.imageUrl, stock: p.stock, active: p.active, createdAt: p.createdAt, updatedAt: p.updatedAt,
  }
}

function toApiProductPayload(data) {
  return {
    name: data.name, description: data.description ?? '', price: Number(data.price) || 0,
    stock: Number(data.stock) || 0, imageUrl: data.image || null, active: data.active ?? true,
  }
}

// Mismo shape que usaban los mock (ver OrderDetailModal/OrderFormModal/etc.):
// se traduce aquí el nombre de los campos del backend (proofImageUrl,
// shipment.photoUrl, statusHistory[].changedAt...) para no tener que tocar
// esos componentes.
function fromApiOrder(o) {
  return {
    id: String(o.id), clientId: o.clientId != null ? String(o.clientId) : null,
    customerName: o.customerName, customerPhone: o.customerPhone, customerEmail: o.customerEmail,
    address: o.address, city: o.city, notes: o.notes,
    items: o.items.map(i => ({ productId: i.productId != null ? String(i.productId) : null, name: i.productName, price: i.unitPrice, qty: i.quantity })),
    total: o.total, proofImage: o.proofImageUrl,
    status: o.status, statusUpdatedAt: o.statusUpdatedAt,
    paymentNote: o.paymentNote ? { amount: o.paymentNote.amount, message: o.paymentNote.message, date: o.paymentNote.date } : null,
    shipment: o.shipment ? { carrier: o.shipment.carrier, trackingNumber: o.shipment.trackingNumber, photo: o.shipment.photoUrl, date: o.shipment.date } : null,
    rejectionReason: o.rejectionReason, refundProof: o.refundProofUrl,
    statusHistory: o.statusHistory.map(h => ({ status: h.status, date: h.changedAt })),
    createdAt: o.createdAt, updatedAt: o.updatedAt,
  }
}

function toApiItemsPayload(items) {
  return items.map(it => ({ productId: Number(it.productId), quantity: Number(it.qty) }))
}

export function SuppliesProvider({ children }) {
  const { user } = useAuth()
  const roles = user?.roles ?? (user?.role ? [user.role] : [])
  const isAdmin = roles.includes('admin')
  const isClient = roles.includes('cliente')

  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  // El carrito vive aquí (no en la página de la tienda) para que sobreviva
  // la navegación a /login o /registro cuando un visitante sin cuenta
  // intenta comprar: esas rutas desmontan la página de la tienda, y un
  // useState local ahí perdería el carrito en ese salto. Es puramente local
  // (no existe como concepto en el backend) hasta que se confirma el pedido.
  const [cart, setCart] = useState([])

  async function refreshProducts() {
    const data = isAdmin ? await apiGetAllSupplyProducts(user.token) : await apiGetSupplyProducts()
    setProducts(data.map(fromApiProduct))
  }

  async function refreshOrders() {
    if (isAdmin) setOrders((await apiGetSupplyOrders(user.token)).map(fromApiOrder))
    else if (isClient && user?.token) setOrders((await apiGetMySupplyOrders(user.token)).map(fromApiOrder))
    else setOrders([])
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([refreshProducts(), refreshOrders()])
      .catch(() => { /* la tienda pública sigue mostrándose vacía; el catálogo es lo único público */ })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token, isAdmin, isClient])

  async function addProduct(data) {
    const created = fromApiProduct(await apiCreateSupplyProduct(toApiProductPayload(data), user.token))
    setProducts(prev => [created, ...prev])
    return created
  }

  async function updateProduct(id, data) {
    const updated = fromApiProduct(await apiUpdateSupplyProduct(id, toApiProductPayload(data), user.token))
    setProducts(prev => prev.map(p => (p.id === id ? updated : p)))
  }

  async function deleteProduct(id) {
    await apiDeleteSupplyProduct(id, user.token)
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  async function toggleProductActive(id) {
    const updated = fromApiProduct(await apiToggleSupplyProductActive(id, user.token))
    setProducts(prev => prev.map(p => (p.id === id ? updated : p)))
  }

  // El cliente arma su pedido en la tienda pública: datos de contacto +
  // artículos + foto del comprobante de pago (para revisión manual, todavía
  // no hay pasarela de pago real). El backend resuelve nombre/precio reales
  // del catálogo y descuenta el stock al crear el pedido.
  async function createOrder({ customerName, customerPhone, customerEmail, address, city, items, proofImage, notes, clientId }) {
    const payload = {
      clientId: clientId != null ? Number(clientId) : null,
      customerName, customerPhone, customerEmail: customerEmail ?? '', address, city: city ?? '', notes: notes ?? '',
      proofImageUrl: proofImage ?? null,
      items: toApiItemsPayload(items),
    }
    const created = fromApiOrder(await apiCreateSupplyOrder(payload, user.token))
    setOrders(prev => [created, ...prev])
    await refreshProducts() // el stock recién apartado
    return created
  }

  // Edición desde el panel admin (datos de contacto, artículos, comprobante).
  // Si no vienen artículos nuevos (pedido ya enviado/completado/rechazado,
  // ver itemsEditable en OrderFormModal), se mandan null y el backend no
  // los toca.
  async function updateOrder(id, data) {
    const order = orders.find(o => o.id === id)
    if (!order) return
    const payload = {
      clientId: data.clientId !== undefined ? (data.clientId ? Number(data.clientId) : null) : (order.clientId ? Number(order.clientId) : null),
      customerName: data.customerName ?? order.customerName,
      customerPhone: data.customerPhone ?? order.customerPhone,
      customerEmail: data.customerEmail ?? order.customerEmail,
      address: data.address ?? order.address,
      city: data.city ?? order.city,
      notes: data.notes ?? order.notes,
      proofImageUrl: data.proofImage !== undefined ? data.proofImage : order.proofImage,
      items: data.items ? toApiItemsPayload(data.items) : null,
    }
    const updated = fromApiOrder(await apiUpdateSupplyOrder(id, payload, user.token))
    setOrders(prev => prev.map(o => (o.id === id ? updated : o)))
    if (data.items) await refreshProducts()
  }

  async function deleteOrder(id) {
    await apiDeleteSupplyOrder(id, user.token)
    setOrders(prev => prev.filter(o => o.id !== id))
    await refreshProducts() // pudo devolver stock al inventario
  }

  async function confirmOrder(id) {
    const updated = fromApiOrder(await apiConfirmSupplyOrder(id, user.token))
    setOrders(prev => prev.map(o => (o.id === id ? updated : o)))
  }

  async function rejectOrder(id, reason, refundProof) {
    const updated = fromApiOrder(await apiRejectSupplyOrder(id, { reason, refundProofUrl: refundProof ?? null }, user.token))
    setOrders(prev => prev.map(o => (o.id === id ? updated : o)))
    await refreshProducts() // el rechazo devuelve el stock apartado
  }

  // El pedido ya se confirmó y la encargada lo empacó y despachó — queda
  // registrada la transportadora, el número de guía y una foto del paquete
  // para que el cliente pueda hacer seguimiento desde "Mis pedidos". El
  // backend también genera el token del botón "Ya me llegó" del correo.
  async function shipOrder(id, { carrier, trackingNumber, photo }) {
    const updated = fromApiOrder(await apiShipSupplyOrder(id, { carrier, trackingNumber, photoUrl: photo }, user.token))
    setOrders(prev => prev.map(o => (o.id === id ? updated : o)))
  }

  // Avisa que el comprobante subido no cubre el total y queda un monto
  // pendiente — el pedido sigue "pendiente" (no se confirma ni se rechaza
  // todavía), solo se le anota al cliente cuánto falta y por qué.
  async function requestPaymentShortfall(id, { amount, message }) {
    const updated = fromApiOrder(await apiRequestSupplyPaymentShortfall(id, { amount, message }, user.token))
    setOrders(prev => prev.map(o => (o.id === id ? updated : o)))
  }

  // El cliente confirma que ya le llegó el pedido — lo marca él mismo desde
  // su cuenta, o la administradora (pedidos walk-in sin cuenta).
  async function completeOrder(id) {
    const updated = fromApiOrder(await apiCompleteSupplyOrder(id, user.token))
    setOrders(prev => prev.map(o => (o.id === id ? updated : o)))
  }

  function addToCart(product) {
    setCart(prev => {
      const existing = prev.find(it => it.productId === product.id)
      if (existing) {
        return prev.map(it => (it.productId === product.id ? { ...it, qty: it.qty + 1 } : it))
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, qty: 1 }]
    })
  }

  function changeCartQty(productId, delta) {
    setCart(prev => prev
      .map(it => (it.productId === productId ? { ...it, qty: it.qty + delta } : it))
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
      loading,
      products, activeProducts, addProduct, updateProduct, deleteProduct, toggleProductActive,
      orders, createOrder, updateOrder, deleteOrder, confirmOrder, rejectOrder, shipOrder, requestPaymentShortfall, completeOrder, pendingOrdersCount,
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
