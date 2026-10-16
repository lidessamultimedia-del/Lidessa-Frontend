import { useState } from 'react'
import FormField from '@/shared/components/FormField'
import { formatAmountInput, parseAmountInput } from '@/shared/lib/money'

function formatCOP(value) {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

export default function PaymentShortfallModal({ order, onSave, onCancel }) {
  const [amount, setAmount] = useState('') // dígitos crudos, ej. "21435678"
  const [message, setMessage] = useState('El comprobante que enviaste no cubre el total del pedido.')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) { setError('Ingresa el monto que falta.'); return }
    if (!message.trim()) { setError('Escribe un mensaje para el cliente.'); return }
    onSave({ amount: Number(amount), message: message.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <form onSubmit={handleSubmit} className="rounded-xl p-6 max-w-md w-full max-h-full overflow-y-auto space-y-4" style={{ backgroundColor: 'var(--supplies-surface)', border: '1px solid var(--border)' }}>
        <div>
          <h2 className="text-lg font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Avisar pago incompleto</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Pedido de {order.customerName} por {formatCOP(order.total)} — el pedido se queda "Pendiente" hasta que complete el pago.
          </p>
        </div>

        <FormField label="Monto que falta por pagar" required>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--muted-foreground)' }}>$</span>
            <input
              type="text" inputMode="numeric" value={formatAmountInput(amount)}
              onChange={e => setAmount(parseAmountInput(e.target.value))}
              placeholder="0" className="w-full pl-6 pr-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>
        </FormField>

        <FormField label="Mensaje para el cliente" required helperText="Se le muestra junto con los datos de la cuenta para que transfiera el restante.">
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg text-sm resize-none" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
        </FormField>

        {error && <p className="text-xs" style={{ color: '#dc2626' }}>⚠ {error}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>Cancelar</button>
          <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#b8860b' }}>Enviar aviso</button>
        </div>
      </form>
    </div>
  )
}
