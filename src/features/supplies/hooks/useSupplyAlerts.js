import { useMemo } from 'react'
import { useSupplies } from '@/features/supplies/context/SuppliesContext'
import { Check, X, Truck, AlertTriangle } from '@/shared/components/Icons'

function formatCOP(value) {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

// Avisos de "Mis pedidos" (ver ClientStore) reutilizables desde fuera de la
// tienda — para cuentas vinculadas (ver 2.2) que también tienen un rol del
// LMS: así su panel de estudiante/profesor/admin también le avisa de sus
// pedidos, sin tener que entrar primero a la tienda.
export function useSupplyAlerts(clientId) {
  const supplies = useSupplies()

  return useMemo(() => {
    const myOrders = supplies.orders.filter(o => o.clientId === clientId)
    const items = []
    myOrders.filter(o => o.status !== 'pending').forEach(o => {
      const firstItem = o.items[0]?.name ?? 'tu pedido'
      const extra = o.items.length > 1 ? ` y ${o.items.length - 1} más` : ''
      const date = o.statusUpdatedAt ?? o.createdAt
      const byStatus = {
        confirmed: { icon: Check, color: '#16a34a', text: `Tu pedido de ${firstItem}${extra} fue confirmado` },
        rejected: { icon: X, color: '#dc2626', text: `Tu pedido de ${firstItem}${extra} fue rechazado` },
        shipped: { icon: Truck, color: '#4d82bc', text: `Tu pedido de ${firstItem}${extra} fue enviado` },
        completed: { icon: Check, color: '#005187', text: `Tu pedido de ${firstItem}${extra} quedó completado` },
      }
      if (byStatus[o.status]) items.push({ id: `${o.id}_${o.status}`, date, ...byStatus[o.status] })
    })
    myOrders.filter(o => o.paymentNote).forEach(o => {
      const firstItem = o.items[0]?.name ?? 'tu pedido'
      items.push({
        id: `${o.id}_paymentNote_${o.paymentNote.date}`, icon: AlertTriangle, color: '#d97706', date: o.paymentNote.date,
        text: `Tu pedido de ${firstItem} tiene un pago pendiente: faltan ${formatCOP(o.paymentNote.amount)}`,
      })
    })
    return items
  }, [supplies.orders, clientId])
}
