import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/context/AuthContext'
import {
  apiCreatePqrsf, apiGetPqrsfTickets, apiChangePqrsfStatus, apiRespondPqrsf, apiMarkPqrsfRead,
} from '@/shared/lib/api'

const PQRSFContext = createContext(null)

// Un ticket es "identificado" cuando hay una forma real de contactar a quien
// escribió — quedó vinculado a una cuenta real (accountId) o dejó un correo
// válido. Esos son los que el administrador puede responder y a los que se
// les avisa la respuesta. Sin correo ni cuenta, el ticket es anónimo: se le
// muestra al admin para que lo tenga en cuenta, pero no hay a quién
// responderle. El backend aplica la misma regla.
export function isIdentified(ticket) {
  return !!ticket.accountId || !!ticket.email?.trim()
}

// Traduce un PqrsfTicket del backend al shape que ya usa la UI. `id` es el
// radicado (lo que se muestra y se busca); `remoteId` es el Id de la base,
// que es el que piden los endpoints.
function fromApiTicket(t) {
  return {
    id: t.ticketCode,
    remoteId: t.id,
    type: t.ticketType,
    from: t.fromName,
    email: t.email,
    phone: t.phone,
    subject: t.subject,
    message: t.messageBody,
    date: t.ticketDate,
    status: t.status,
    response: t.response ?? undefined,
    respondedAt: t.respondedAt,
    emailSent: t.emailSent,
    accountId: t.accountId,
    read: t.isRead,
  }
}

export function PQRSFProvider({ children }) {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [error, setError] = useState('')

  // Solo el admin ve la bandeja; para cualquier otro usuario la lista queda
  // vacía y solo se usa addTicket.
  const adminToken = user?.role === 'admin' ? user.token : null

  useEffect(() => {
    if (!adminToken) {
      setTickets([])
      return
    }
    let cancelled = false
    apiGetPqrsfTickets(adminToken)
      .then(data => {
        if (cancelled) return
        setTickets(data.map(fromApiTicket))
        setError('')
      })
      .catch(err => { if (!cancelled) setError(err.message) })
    return () => { cancelled = true }
  }, [adminToken])

  function replaceTicket(updated) {
    setTickets(prev => prev.map(t => (t.remoteId === updated.remoteId ? updated : t)))
    return updated
  }

  function remoteIdOf(id) {
    const ticket = tickets.find(t => t.id === id)
    if (!ticket) throw new Error('PQRSF no encontrado')
    return ticket.remoteId
  }

  // `user` es la cuenta autenticada (si la hay) desde donde se envía el
  // PQRSF. Con token, el backend liga el ticket a esa cuenta real y toma de
  // ahí los datos de contacto; las cuentas sin token (clientes de la tienda,
  // todavía locales) mandan su nombre/correo/teléfono para quedar
  // identificadas por correo.
  async function addTicket(form, user) {
    const created = fromApiTicket(await apiCreatePqrsf({
      ticketType: form.type,
      name: user?.name || form.name?.trim() || null,
      email: user?.email || form.email?.trim() || null,
      phone: user?.phone || form.phone?.trim() || null,
      subject: form.subject.trim(),
      message: form.message.trim(),
    }, user?.token))
    if (adminToken) setTickets(prev => [created, ...prev])
    return created
  }

  // status: 'Pendiente' | 'Revisando'. 'Respondida' solo con respondTicket.
  async function changeStatus(id, status) {
    return replaceTicket(fromApiTicket(await apiChangePqrsfStatus(remoteIdOf(id), status, adminToken)))
  }

  async function markRead(id) {
    const remoteId = remoteIdOf(id)
    await apiMarkPqrsfRead(remoteId, adminToken)
    setTickets(prev => prev.map(t => (t.remoteId === remoteId ? { ...t, read: true } : t)))
  }

  // Guarda la respuesta (o la corrige si ya estaba respondido). El backend
  // le avisa al solicitante y devuelve en emailSent si el aviso salió.
  async function respondTicket(id, response) {
    const updated = replaceTicket(fromApiTicket(await apiRespondPqrsf(remoteIdOf(id), response, adminToken)))
    return { emailSent: updated.emailSent }
  }

  return (
    <PQRSFContext.Provider value={{ tickets, error, addTicket, changeStatus, markRead, respondTicket }}>
      {children}
    </PQRSFContext.Provider>
  )
}

export function usePQRSF() {
  const ctx = useContext(PQRSFContext)
  if (!ctx) throw new Error('usePQRSF must be used inside PQRSFProvider')
  return ctx
}
