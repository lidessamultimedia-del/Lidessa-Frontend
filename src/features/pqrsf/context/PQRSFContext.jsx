import { createContext, useContext, useState } from 'react'

const PQRSFContext = createContext(null)

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
  // ── Datos de ejemplo adicionales (para probar búsquedas y paginación) ──
  ...[
    ['Petición', 'Julián Ospina', 'julian.ospina@empresa.co', 'Solicitud de certificado laboral del curso de alturas', 'Pendiente'],
    ['Queja', 'Liliana Mora', 'liliana.mora@correo.co', 'No recibí respuesta a mi solicitud anterior', 'Revisando'],
    ['Reclamo', 'Ferretería El Tornillo', 'gerencia@eltornillo.co', 'Pedido de V2 Suministros llegó incompleto', 'Pendiente'],
    ['Sugerencia', 'Héctor Valencia', 'hector.valencia@correo.co', 'Agregar pago con tarjeta en la tienda', 'Respondida'],
    ['Felicitación', 'Colegio Santa María', 'rectoria@santamaria.edu.co', 'Excelente capacitación en primeros auxilios', 'Respondida'],
    ['Solicitud', 'Transportes Andinos S.A.', 'talento@transandinos.co', 'Cotización de capacitación para 40 conductores', 'Pendiente'],
    ['Petición', 'Marcela Quiroga', 'marcela.quiroga@correo.co', 'Cambio de horario del curso SG-SST', 'Revisando'],
    ['Queja', 'Ricardo Benítez', 'ricardo.benitez@correo.co', 'El aula virtual no carga los videos', 'Pendiente'],
    ['Reclamo', 'Clínica Los Álamos', 'sst@clinicaalamos.co', 'Factura con valor diferente al cotizado', 'Revisando'],
    ['Sugerencia', 'Paula Jaramillo', 'paula.jaramillo@correo.co', 'Ofrecer cursos los sábados', 'Respondida'],
    ['Felicitación', 'Constructora Andina S.A.S.', 'compras@constructoraandina.co', 'Muy buena atención en la asesoría SG-SST', 'Respondida'],
    ['Solicitud', 'Alcaldía de Rionegro', 'contratacion@rionegro.gov.co', 'Información sobre formación para brigadistas', 'Pendiente'],
  ].map(([type, from, email, subject, status], i) => ({
    id: `PQRSF-2026-${String(101 + i).padStart(4, '0')}`, type, from, email,
    phone: `+57 30${i % 10} 555 ${String(2000 + i * 41).padStart(4, '0')}`,
    subject, message: `${subject}. Quedo atento(a) a su respuesta.`,
    date: `2026-${String(10 - Math.floor(i / 3)).padStart(2, '0')}-${String(7 - (i % 3) * 2).padStart(2, '0')}`,
    status, accountId: null, read: status !== 'Pendiente',
    ...(status === 'Respondida' ? { response: 'Gracias por escribirnos. Su solicitud fue atendida por nuestro equipo.' } : {}),
  })),
  ...[
    ['Sugerencia', 'Mejorar la señalización de la sede'],
    ['Queja', 'Demoras en la línea de WhatsApp'],
    ['Sugerencia', 'Publicar más artículos en Converge'],
    ['Felicitación', 'Gran trabajo del equipo de formación'],
    ['Queja', 'El parqueadero de la sede es muy pequeño'],
    ['Sugerencia', 'Incluir certificados digitales descargables'],
    ['Reclamo', 'Un instructor llegó tarde a la capacitación'],
    ['Sugerencia', 'Crear una app móvil para los cursos'],
    ['Felicitación', 'Muy buen material de estudio'],
    ['Sugerencia', 'Más productos de protección auditiva en la tienda'],
    ['Queja', 'La página carga lento en las noches'],
  ].map(([type, subject], i) => ({
    id: `PQRSF-2026-${String(201 + i).padStart(4, '0')}`, type, from: 'Anónimo', email: '', phone: '',
    subject, message: `${subject}.`,
    date: `2026-${String(10 - Math.floor(i / 3)).padStart(2, '0')}-${String(5 + (i % 3)).padStart(2, '0')}`,
    status: 'Pendiente', accountId: null, read: i % 2 === 1,
  })),
]

export function PQRSFProvider({ children }) {
  const [tickets, setTickets] = useState(defaultTickets)

  // `user` es la cuenta autenticada (si la hay) desde donde se envía el
  // PQRSF — si existe, el ticket queda ligado a esa cuenta real aunque el
  // formulario público no pida correo, porque ya sabemos quién es.
  function addTicket(form, user) {
    const year = new Date().getFullYear()
    const existingIds = new Set(tickets.map(t => t.id))
    let id
    do {
      id = `PQRSF-${year}-${String(Math.floor(Math.random() * 9000) + 1000)}`
    } while (existingIds.has(id))
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
