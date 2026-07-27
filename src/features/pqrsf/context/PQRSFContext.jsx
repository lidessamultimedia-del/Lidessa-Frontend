import { createContext, useContext, useState, useEffect } from 'react'

const PQRSFContext = createContext(null)
const STORAGE_KEY = 'lidessa_pqrsf'

const defaultTickets = [
  { id: 'PQRSF-2025-0041', type: 'Solicitud', from: 'María García', email: '', phone: '', subject: 'Cotización SG-SST para empresa de 25 empleados', message: '', date: '2025-07-10', status: 'Pendiente' },
  { id: 'PQRSF-2025-0038', type: 'Queja', from: 'Carlos Rodríguez', email: '', phone: '', subject: 'Demora en entrega de certificado de capacitación', message: '', date: '2025-07-03', status: 'Respondida' },
  { id: 'PQRSF-2025-0029', type: 'Sugerencia', from: 'Ana Martínez', email: '', phone: '', subject: 'Habilitar más horarios de cursos virtuales nocturnos', message: '', date: '2025-06-22', status: 'Revisando' },
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

  function addTicket(form) {
    const id = `PQRSF-2025-${String(Math.floor(Math.random() * 9000) + 1000)}`
    const newTicket = {
      id,
      type: form.type,
      from: form.name?.trim() || 'Anónimo',
      email: form.email?.trim() || '',
      phone: form.phone?.trim() || '',
      subject: form.subject,
      message: form.message,
      date: new Date().toISOString().slice(0, 10),
      status: 'Pendiente',
    }
    setTickets(prev => [newTicket, ...prev])
    return newTicket
  }

  function updateTicket(id, data) {
    setTickets(prev => prev.map(t => (t.id === id ? { ...t, ...data } : t)))
  }

  return (
    <PQRSFContext.Provider value={{ tickets, addTicket, updateTicket }}>
      {children}
    </PQRSFContext.Provider>
  )
}

export function usePQRSF() {
  const ctx = useContext(PQRSFContext)
  if (!ctx) throw new Error('usePQRSF must be used inside PQRSFProvider')
  return ctx
}
