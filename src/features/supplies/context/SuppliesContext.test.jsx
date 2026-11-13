import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import * as api from '@/shared/lib/api'
import { SuppliesProvider, useSupplies } from './SuppliesContext'

// Las llamadas a la API quedan como vi.fn(); el resto de api.js es el real.
vi.mock('@/shared/lib/api', async importOriginal => {
  const actual = await importOriginal()
  const mocked = { ...actual }
  for (const key of Object.keys(actual)) if (key.startsWith('api')) mocked[key] = vi.fn()
  return mocked
})

let auth
vi.mock('@/features/auth/context/AuthContext', () => ({ useAuth: () => auth }))

const TOKEN = 'jwt-de-prueba'
// Mismo shape que deja AuthContext en la sesión (sessionFromLogin).
const users = {
  admin: { id: '1', role: 'admin', roles: ['admin'], token: TOKEN },
  profesor: { id: '2', role: 'profesor', roles: ['profesor'], token: TOKEN },
  estudiante: { id: '10', role: 'estudiante', roles: ['estudiante'], token: TOKEN },
  cliente: { id: '20', role: 'cliente', roles: ['cliente'], token: TOKEN },
  // Cuenta vinculada (ver 2.2): rol principal estudiante + cliente agregado.
  doble: { id: '30', role: 'estudiante', roles: ['estudiante', 'cliente'], token: TOKEN },
}

// ── Respuestas del backend (shape de los DTOs de Lidessa.Api) ──
const apiProducts = [
  { id: 1, name: 'Botiquín tipo A', description: 'Desc', price: 185000, imageUrl: '/assets/insumos.png', stock: 5, active: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 2, name: 'Oculto', description: '', price: 1000, imageUrl: null, stock: 1, active: false, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
]
const apiOrder = (over = {}) => ({
  id: 7, clientId: 30, customerName: 'Doble Rol', customerPhone: '300', customerEmail: 'd@x.co',
  address: 'Calle 1', city: 'Bogotá', notes: '', total: 370000, proofImageUrl: '/uploads/attachments/p.png',
  status: 'pending', statusUpdatedAt: '2026-11-13', paymentNote: null, shipment: null,
  rejectionReason: null, refundProofUrl: null, createdAt: '2026-11-13', updatedAt: '2026-11-13',
  items: [{ id: 1, productId: 1, productName: 'Botiquín tipo A', unitPrice: 185000, quantity: 2 }],
  statusHistory: [{ status: 'pending', changedAt: '2026-11-13' }],
  ...over,
})

function mockBackend() {
  api.apiGetSupplyProducts.mockResolvedValue(apiProducts.filter(p => p.active))
  api.apiGetAllSupplyProducts.mockResolvedValue(apiProducts)
  api.apiGetSupplyOrders.mockResolvedValue([apiOrder(), apiOrder({ id: 8, clientId: 20 })])
  api.apiGetMySupplyOrders.mockResolvedValue([apiOrder()])
}

async function renderAs(user) {
  auth = { user }
  const hook = renderHook(() => useSupplies(), { wrapper: SuppliesProvider })
  await waitFor(() => expect(hook.result.current.loading).toBe(false))
  return hook
}

beforeEach(() => {
  vi.clearAllMocks()
  mockBackend()
})

describe('SuppliesContext — qué carga cada rol', () => {
  it('visitante sin sesión: solo el catálogo público, ningún pedido', async () => {
    const { result } = await renderAs(null)

    expect(api.apiGetSupplyProducts).toHaveBeenCalled()
    expect(api.apiGetAllSupplyProducts).not.toHaveBeenCalled()
    expect(api.apiGetSupplyOrders).not.toHaveBeenCalled()
    expect(api.apiGetMySupplyOrders).not.toHaveBeenCalled()
    expect(result.current.products.map(p => p.id)).toEqual(['1'])
    expect(result.current.orders).toEqual([])
  })

  it('admin: productos ocultos incluidos y todos los pedidos', async () => {
    const { result } = await renderAs(users.admin)

    expect(api.apiGetAllSupplyProducts).toHaveBeenCalledWith(TOKEN)
    expect(api.apiGetSupplyOrders).toHaveBeenCalledWith(TOKEN)
    expect(api.apiGetMySupplyOrders).not.toHaveBeenCalled()
    expect(result.current.products).toHaveLength(2)
    expect(result.current.activeProducts).toHaveLength(1)
    expect(result.current.orders.map(o => o.id)).toEqual(['7', '8'])
    expect(result.current.pendingOrdersCount).toBe(2)
  })

  it('cliente: solo sus pedidos (/mine)', async () => {
    const { result } = await renderAs(users.cliente)

    expect(api.apiGetMySupplyOrders).toHaveBeenCalledWith(TOKEN)
    expect(api.apiGetSupplyOrders).not.toHaveBeenCalled()
    expect(result.current.orders.map(o => o.id)).toEqual(['7'])
  })

  it('cuenta doble estudiante + cliente: carga sus pedidos aunque el rol principal sea estudiante', async () => {
    const { result } = await renderAs(users.doble)

    expect(api.apiGetMySupplyOrders).toHaveBeenCalledWith(TOKEN)
    expect(api.apiGetSupplyOrders).not.toHaveBeenCalled()
    expect(result.current.orders).toHaveLength(1)
  })

  it.each([['profesor'], ['estudiante']])('%s sin rol cliente: no pide pedidos (el backend le daría 403)', async role => {
    const { result } = await renderAs(users[role])

    expect(api.apiGetMySupplyOrders).not.toHaveBeenCalled()
    expect(api.apiGetSupplyOrders).not.toHaveBeenCalled()
    expect(result.current.orders).toEqual([])
  })

  it('si la API está caída, la tienda queda vacía sin romper', async () => {
    api.apiGetSupplyProducts.mockRejectedValue(new Error('No se pudo conectar con el servidor.'))
    const { result } = await renderAs(null)

    expect(result.current.products).toEqual([])
  })
})

describe('SuppliesContext — traducción de pedidos', () => {
  it('fromApiOrder: ids como string y nombres de campos del frontend', async () => {
    api.apiGetMySupplyOrders.mockResolvedValue([apiOrder({
      status: 'shipped',
      paymentNote: { amount: 5000, message: 'Falta', date: '2026-11-13' },
      shipment: { carrier: 'Servientrega', trackingNumber: 'SRV-1', photoUrl: '/uploads/attachments/paq.png', date: '2026-11-14' },
      items: [{ id: 1, productId: null, productName: 'Producto borrado', unitPrice: 777, quantity: 1 }],
    })])
    const { result } = await renderAs(users.doble)

    const order = result.current.orders[0]
    expect(order).toMatchObject({
      id: '7', clientId: '30', proofImage: '/uploads/attachments/p.png',
      paymentNote: { amount: 5000, message: 'Falta' },
      shipment: { carrier: 'Servientrega', trackingNumber: 'SRV-1', photo: '/uploads/attachments/paq.png' },
    })
    // Un producto borrado deja la línea con nombre y precio congelados.
    expect(order.items).toEqual([{ productId: null, name: 'Producto borrado', price: 777, qty: 1 }])
    expect(order.statusHistory).toEqual([{ status: 'pending', date: '2026-11-13' }])
  })
})

describe('SuppliesContext — acciones', () => {
  it('createOrder (cuenta doble): manda productId numérico y quantity, y refresca el stock', async () => {
    api.apiCreateSupplyOrder.mockResolvedValue(apiOrder({ id: 9 }))
    const { result } = await renderAs(users.doble)
    api.apiGetSupplyProducts.mockClear()

    await act(() => result.current.createOrder({
      customerName: 'Doble Rol', customerPhone: '300', address: 'Calle 1',
      items: [{ productId: '1', name: 'Botiquín tipo A', price: 1, qty: 2 }],
      proofImage: '/uploads/attachments/p.png', clientId: '30',
    }))

    expect(api.apiCreateSupplyOrder).toHaveBeenCalledWith(expect.objectContaining({
      clientId: 30, customerEmail: '', city: '', notes: '', proofImageUrl: '/uploads/attachments/p.png',
      items: [{ productId: 1, quantity: 2 }], // sin el precio del carrito: lo pone el servidor
    }), TOKEN)
    expect(api.apiGetSupplyProducts).toHaveBeenCalled()
    expect(result.current.orders[0].id).toBe('9')
  })

  it('createOrder: el error del backend (sin stock / conflicto 409) llega al que llama y no agrega nada', async () => {
    const err = Object.assign(new Error('Otra operación cambió este pedido o el inventario al mismo tiempo. Intente de nuevo.'), { status: 409 })
    api.apiCreateSupplyOrder.mockRejectedValue(err)
    const { result } = await renderAs(users.cliente)

    await expect(act(() => result.current.createOrder({
      customerName: 'C', customerPhone: '1', address: 'x', items: [{ productId: '1', qty: 1 }],
    }))).rejects.toThrow('Intente de nuevo')
    expect(result.current.orders.map(o => o.id)).toEqual(['7'])
  })

  it('admin: confirmar, despachar (photo → photoUrl) y rechazar (refresca stock)', async () => {
    const { result } = await renderAs(users.admin)

    api.apiConfirmSupplyOrder.mockResolvedValue(apiOrder({ status: 'confirmed' }))
    await act(() => result.current.confirmOrder('7'))
    expect(api.apiConfirmSupplyOrder).toHaveBeenCalledWith('7', TOKEN)
    expect(result.current.orders.find(o => o.id === '7').status).toBe('confirmed')

    api.apiShipSupplyOrder.mockResolvedValue(apiOrder({ status: 'shipped' }))
    await act(() => result.current.shipOrder('7', { carrier: 'Servientrega', trackingNumber: 'SRV-1', photo: '/uploads/attachments/paq.png' }))
    expect(api.apiShipSupplyOrder).toHaveBeenCalledWith('7', { carrier: 'Servientrega', trackingNumber: 'SRV-1', photoUrl: '/uploads/attachments/paq.png' }, TOKEN)

    api.apiRejectSupplyOrder.mockResolvedValue(apiOrder({ id: 8, status: 'rejected', rejectionReason: 'Ilegible' }))
    api.apiGetAllSupplyProducts.mockClear()
    await act(() => result.current.rejectOrder('8', 'Ilegible'))
    expect(api.apiRejectSupplyOrder).toHaveBeenCalledWith('8', { reason: 'Ilegible', refundProofUrl: null }, TOKEN)
    expect(api.apiGetAllSupplyProducts).toHaveBeenCalled()
  })

  it('cliente: completeOrder marca su pedido como recibido', async () => {
    api.apiCompleteSupplyOrder.mockResolvedValue(apiOrder({ status: 'completed' }))
    const { result } = await renderAs(users.doble)

    await act(() => result.current.completeOrder('7'))

    expect(api.apiCompleteSupplyOrder).toHaveBeenCalledWith('7', TOKEN)
    expect(result.current.orders[0].status).toBe('completed')
  })

  it('carrito: suma cantidades del mismo producto y calcula total', async () => {
    const { result } = await renderAs(null)
    const product = { id: '1', name: 'Botiquín tipo A', price: 185000 }

    act(() => { result.current.addToCart(product); result.current.addToCart(product) })
    expect(result.current.cartCount).toBe(2)
    expect(result.current.cartTotal).toBe(370000)

    act(() => result.current.changeCartQty('1', -2))
    expect(result.current.cart).toEqual([])
  })
})
