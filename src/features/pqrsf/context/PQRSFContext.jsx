import { createContext, useContext, useState, useEffect } from 'react'

const PQRSFContext = createContext(null)
const STORAGE_KEY = 'lidessa_pqrsf'

// Un ticket es "identificado" cuando hay una forma real de contactar a quien
// escribió — quedó vinculado a una cuenta real (accountId) o dejó un correo
// válido. Esos son los que el administrador puede responder y a los que,
// una vez haya backend, se les envía la respuesta por correo. Sin correo ni
// cuenta, el ticket es anónimo: se le muestra al admin para que lo tenga en
// cuenta, pero no hay a quién responderle.
export function isIdentified(ticket) {
  return !!ticket.accountId || !!ticket.email?.trim()
}

const defaultTickets = [
  { id: 'PQRSF-2025-0041', type: 'Solicitud', from: 'María García', email: 'maria.garcia@empresa.co', phone: '', subject: 'Cotización SG-SST para empresa de 25 empleados', message: '', date: '2025-07-10', status: 'Pendiente', accountId: null, read: false },
  { id: 'PQRSF-2025-0038', type: 'Queja', from: 'Carlos Rodríguez', email: 'carlos.rodriguez@empresa.co', phone: '', subject: 'Demora en entrega de certificado de capacitación', message: '', date: '2025-07-03', status: 'Respondida', response: 'Su certificado ya fue generado y enviado a este correo.', accountId: null, read: true },
  { id: 'PQRSF-2025-0029', type: 'Sugerencia', from: 'Ana Martínez', email: 'ana.martinez@correo.co', phone: '', subject: 'Habilitar más horarios de cursos virtuales nocturnos', message: '', date: '2025-06-22', status: 'Revisando', accountId: null, read: true },
  { id: 'PQRSF-2025-0018', type: 'Sugerencia', from: 'Anónimo', email: '', phone: '', subject: 'El formulario de contacto tarda en cargar', message: 'A veces el formulario de PQRSF demora bastante en abrir desde el celular.', date: '2025-06-10', status: 'Pendiente', accountId: null, read: false },
]

export function PQRSFProvider({ children }) {
  const [tickets, setTickets] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : defaultTickets
    } catch {
      return defaultTickets
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets))
  }, [tickets])

  // Keep other open tabs/windows (e.g. the admin panel) in sync when a
  // PQRSF is submitted from a different tab, since localStorage writes
  // don't trigger a re-render on their own.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return
      try {
        setTickets(JSON.parse(e.newValue))
      } catch {
        // ignore malformed data from another tab
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // `user` es la cuenta autenticada (si la hay) desde donde se envía el
  // PQRSF — si existe, el ticket queda ligado a esa cuenta real aunque el
  // formulario público no pida correo, porque ya sabemos quién es.
  function addTicket(form, user) {
    const id = `PQRSF-2025-${String(Math.floor(Math.random() * 9000) + 1000)}`
    const newTicket = {
      id,
      type: form.type,
      from: user?.name || form.name?.trim() || 'Anónimo',
      email: user?.email || form.email?.trim() || '',
      phone: user?.phone || form.phone?.trim() || '',
      subject: form.subject,
      message: form.message,
      date: new Date().toISOString().slice(0, 10),
      status: 'Pendiente',
      accountId: user?.id ?? null,
      read: false,
    }
    setTickets(prev => [newTicket, ...prev])
    return newTicket
  }

  function updateTicket(id, data) {
    setTickets(prev => prev.map(t => (t.id === id ? { ...t, ...data } : t)))
  }

  function markRead(id) {
    setTickets(prev => prev.map(t => (t.id === id ? { ...t, read: true } : t)))
  }

  // Guarda la respuesta y, si el ticket tiene con quién contactarse (cuenta
  // real o correo real), dispara el aviso al solicitante. El envío de
  // correo de verdad necesita backend — por ahora queda simulado (con un
  // console.log) para que la lógica ya esté lista y solo haya que
  // reemplazar ese paso por la llamada real más adelante.
  async function respondTicket(id, response) {
    const ticket = tickets.find(t => t.id === id)
    if (!ticket) return { emailSent: false }
    const willEmail = isIdentified(ticket) && !!ticket.email?.trim()
    if (willEmail) {
      // TODO(backend): reemplazar por una llamada real al enviar el correo,
      // ej. await api.post('/pqrsf/notify', { to: ticket.email, ticketId: id, response })
      console.log(`[PQRSF] Simulando envío de correo de respuesta a ${ticket.email} (${id}):`, response)
    }
    setTickets(prev => prev.map(t => (t.id === id
      ? { ...t, status: 'Respondida', response, respondedAt: new Date().toISOString(), emailSent: willEmail, read: true }
      : t)))
    return { emailSent: willEmail }
  }

  return (
    <PQRSFContext.Provider value={{ tickets, addTicket, updateTicket, markRead, respondTicket }}>
      {children}
    </PQRSFContext.Provider>
  )
}

export function usePQRSF() {
  const ctx = useContext(PQRSFContext)
  if (!ctx) throw new Error('usePQRSF must be used inside PQRSFProvider')
  return ctx
}
