import { X, Check, AlertTriangle, Package, Edit2, Trash, Phone, Mail, MapPin } from '@/shared/components/Icons'

export const ORDER_STATUS = {
  pending: { label: 'Pendiente de revisión', short: 'Pendiente', color: '#d97706' },
  confirmed: { label: 'Confirmado', short: 'Confirmado', color: '#16a34a' },
  shipped: { label: 'Enviado', short: 'Enviado', color: '#4d82bc' },
  completed: { label: 'Completado', short: 'Completado', color: '#005187' },
  rejected: { label: 'Rechazado', short: 'Rechazado', color: '#dc2626' },
}

export function orderNumber(order) {
  return `#${order.id.replace(/\D/g, '').slice(-6).padStart(4, '0') || order.id}`
}

export function OrderStatusBadge({ status }) {
  const s = ORDER_STATUS[status] ?? { short: status, color: '#64748b' }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ backgroundColor: `${s.color}1a`, color: s.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: s.color }} />
      {s.short}
    </span>
  )
}

function formatCOP(value) {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}
function formatDate(iso, withYear = true) {
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', ...(withYear ? { year: 'numeric' } : {}), hour: '2-digit', minute: '2-digit' })
}

function Label({ children }) {
  return <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--muted-foreground)' }}>{children}</p>
}

// Detalle completo de un pedido + acciones del flujo (confirmar, rechazar,
// avisar pago incompleto, despachar) y CRUD (editar / eliminar).
export default function OrderDetailModal({ order: o, onClose, onEdit, onDelete, onConfirm, onReject, onShortfall, onShip, onViewImage }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="rounded-2xl w-full shadow-2xl max-w-2xl max-h-full flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-lg font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                Pedido {orderNumber(o)}
              </h3>
              <OrderStatusBadge status={o.status} />
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Creado el {formatDate(o.createdAt)}{o.updatedAt ? ` · Editado el ${formatDate(o.updatedAt)}` : ''}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar"
            className="shrink-0 flex items-center justify-center rounded-full"
            style={{ width: 32, height: 32, color: 'var(--muted-foreground)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--muted)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <Label>Cliente</Label>
              <p className="text-sm font-bold mb-1.5" style={{ color: 'var(--foreground)' }}>{o.customerName}</p>
              <div className="space-y-1 text-sm" style={{ color: 'var(--foreground)' }}>
                <p className="flex items-center gap-2"><Phone size={13} style={{ color: 'var(--muted-foreground)' }} /> {o.customerPhone || '—'}</p>
                {o.customerEmail && <p className="flex items-center gap-2 break-all"><Mail size={13} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} /> {o.customerEmail}</p>}
                <p className="flex items-start gap-2"><MapPin size={13} style={{ color: 'var(--muted-foreground)', marginTop: 3, flexShrink: 0 }} /> {o.address}{o.city ? `, ${o.city}` : ''}</p>
              </div>
              {o.notes && <p className="text-xs mt-2 italic rounded-lg px-3 py-2" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}>"{o.notes}"</p>}
            </div>
            <div>
              <Label>Comprobante de pago</Label>
              {o.proofImage ? (
                <button type="button" onClick={() => onViewImage({ src: o.proofImage, alt: 'Comprobante de pago' })}>
                  <img src={o.proofImage} alt="Comprobante de pago" className="rounded-lg max-h-44 object-contain" style={{ border: '1px solid var(--border)' }} />
                </button>
              ) : (
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No se adjuntó comprobante.</p>
              )}
            </div>
          </div>

          <div>
            <Label>Artículos ({o.items.length})</Label>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {o.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                  style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', color: 'var(--foreground)' }}>
                  <span className="min-w-0 truncate"><strong>{it.qty}</strong> × {it.name}
                    <span className="text-xs ml-1.5" style={{ color: 'var(--muted-foreground)' }}>({formatCOP(it.price)} c/u)</span>
                  </span>
                  <span className="shrink-0 font-semibold">{formatCOP(it.price * it.qty)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
                <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Total</span>
                <span className="text-lg font-black" style={{ color: 'var(--primary)' }}>{formatCOP(o.total)}</span>
              </div>
            </div>
          </div>

          {o.paymentNote && (
            <div className="rounded-lg px-3 py-2.5 text-xs" style={{ backgroundColor: 'rgba(184,134,11,0.12)', border: '1px solid rgba(184,134,11,0.3)', color: '#b8860b' }}>
              <strong>Pago incompleto avisado</strong> — faltan {formatCOP(o.paymentNote.amount)}: "{o.paymentNote.message}"
            </div>
          )}

          {o.status === 'rejected' && o.rejectionReason && (
            <div className="rounded-lg px-3 py-2.5 text-xs" style={{ backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)', color: '#dc2626' }}>
              <strong>Causa del rechazo:</strong> "{o.rejectionReason}"
              {o.refundProof && (
                <button type="button" onClick={() => onViewImage({ src: o.refundProof, alt: 'Comprobante de devolución' })} className="mt-2 block">
                  <img src={o.refundProof} alt="Comprobante de devolución" className="rounded-lg max-h-32 object-contain" style={{ border: '1px solid var(--border)' }} />
                </button>
              )}
            </div>
          )}

          {o.shipment && (
            <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
              <Label>Envío</Label>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>{o.shipment.carrier} — guía {o.shipment.trackingNumber}</p>
              {o.shipment.photo && (
                <button type="button" onClick={() => onViewImage({ src: o.shipment.photo, alt: 'Foto del paquete' })} className="mt-2">
                  <img src={o.shipment.photo} alt="Foto del paquete" className="rounded-lg max-h-32 object-contain" style={{ border: '1px solid var(--border)' }} />
                </button>
              )}
            </div>
          )}

          {o.statusHistory?.length > 0 && (
            <div>
              <Label>Historial</Label>
              <ol className="space-y-2">
                {o.statusHistory.map((h, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs">
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: ORDER_STATUS[h.status]?.color, flexShrink: 0 }} />
                    <span className="flex-1 font-semibold" style={{ color: ORDER_STATUS[h.status]?.color }}>{ORDER_STATUS[h.status]?.label}</span>
                    <span style={{ color: 'var(--muted-foreground)' }}>{formatDate(h.date, false)}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Acciones del flujo */}
          {o.status === 'pending' && (
            <div className="space-y-2">
              <div className="flex gap-3">
                <button onClick={onConfirm} className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#16a34a' }}>
                  <Check size={14} /> Confirmar pedido
                </button>
                <button onClick={onReject} className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold" style={{ border: '1px solid #dc2626', color: '#dc2626' }}>
                  <X size={14} /> Rechazar
                </button>
              </div>
              <button onClick={onShortfall} className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold" style={{ border: '1px solid #b8860b', color: '#b8860b' }}>
                <AlertTriangle size={14} /> Avisar pago incompleto
              </button>
            </div>
          )}
          {o.status === 'confirmed' && (
            <button onClick={onShip} className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#005187' }}>
              <Package size={14} /> Marcar como enviado
            </button>
          )}
          {o.status === 'shipped' && (
            <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>Esperando que el cliente confirme que ya le llegó.</p>
          )}
        </div>

        {/* CRUD */}
        <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button type="button" onClick={onDelete}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold"
            style={{ border: '1px solid rgba(220,38,38,0.35)', color: '#dc2626' }}>
            <Trash size={14} /> Eliminar
          </button>
          <button type="button" onClick={onEdit}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold"
            style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
            <Edit2 size={14} /> Editar pedido
          </button>
        </div>
      </div>
    </div>
  )
}
