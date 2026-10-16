const STATUS_LABEL = { pending: 'Pendiente de revisión', confirmed: 'Confirmado', rejected: 'Rechazado', shipped: 'Enviado', completed: 'Completado' }
const STATUS_COLOR = { pending: '#b8860b', confirmed: '#16a34a', rejected: '#dc2626', shipped: '#4d82bc', completed: '#16a34a' }

function formatCOP(value) {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

// Ficha de solo lectura de un cliente — datos de contacto + su historial de
// pedidos, para que la administradora no tenga que buscarlo entre todos los
// pedidos de la pestaña "Pedidos".
export default function ClientDetailModal({ client, orders, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="rounded-xl p-6 max-w-lg w-full max-h-full overflow-y-auto" style={{ backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>{client.name}</h2>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{client.email}</p>
          </div>
          <button onClick={onClose} className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Cerrar ✕</button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--muted-foreground)' }}>Teléfono</p>
            <p style={{ color: 'var(--foreground)' }}>{client.phone || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--muted-foreground)' }}>Documento</p>
            <p style={{ color: 'var(--foreground)' }}>{client.documentNumber ? `${client.documentType ? `${client.documentType} ` : ''}${client.documentNumber}` : '—'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--muted-foreground)' }}>Dirección</p>
            <p style={{ color: 'var(--foreground)' }}>{client.address || '—'}</p>
          </div>
        </div>

        <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--muted-foreground)' }}>
          Pedidos {orders.length > 0 && `(${orders.length})`}
        </p>
        {orders.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: 'var(--muted-foreground)' }}>Todavía no ha hecho ningún pedido.</p>
        ) : (
          <div className="space-y-2">
            {orders.map(o => (
              <div key={o.id} className="rounded-lg p-3 flex items-center justify-between gap-3" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                    {o.items.length} artículo{o.items.length !== 1 ? 's' : ''} — {formatCOP(o.total)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {new Date(o.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full text-white shrink-0" style={{ backgroundColor: STATUS_COLOR[o.status] }}>
                  {STATUS_LABEL[o.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
