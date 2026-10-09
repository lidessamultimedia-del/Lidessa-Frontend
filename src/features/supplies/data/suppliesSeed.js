// Datos de ejemplo para que la demo del viernes no arranque vacía — se
// pueden editar/borrar desde el panel de Suministros sin problema.
export const seedProducts = [
  {
    id: 'sp1',
    name: 'Botiquín tipo A certificado',
    description: 'Botiquín de primeros auxilios completo, conforme a la Resolución 0705 de 2007.',
    price: 185000,
    image: '/assets/insumos.png',
    stock: 12,
    active: true,
  },
  {
    id: 'sp2',
    name: 'Casco de protección craneal',
    description: 'Casco certificado NTC 3610 para zonas con riesgo de golpes o caída de objetos.',
    price: 65000,
    image: '/assets/insumos.png',
    stock: 30,
    active: true,
  },
  {
    id: 'sp3',
    name: 'Gafas de protección visual',
    description: 'Gafas certificadas ANSI Z87.1, antiempañantes.',
    price: 22000,
    image: '/assets/insumos.png',
    stock: 50,
    active: true,
  },
]

// Pedido de ejemplo pendiente de revisión, para ver el flujo completo en el
// panel (Pedidos → confirmar / rechazar / enviar). Se crea "hace 2 horas"
// para que aparezca como reciente en el dashboard y en las notificaciones.
const sampleOrderDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

export const seedOrders = [
  {
    id: 'ord-ejemplo-1',
    clientId: 'cl-ejemplo-1',
    customerName: 'Constructora Andina S.A.S.',
    customerPhone: '+57 310 555 2048',
    customerEmail: 'compras@constructoraandina.co',
    address: 'Calle 45 # 12-30, Bodega 3',
    city: 'Bogotá',
    notes: 'Entregar en horario de oficina (8 a. m. – 5 p. m.). Preguntar por Laura Gómez.',
    items: [
      { productId: 'sp1', name: 'Botiquín tipo A certificado', price: 185000, qty: 1 },
      { productId: 'sp2', name: 'Casco de protección craneal', price: 65000, qty: 2 },
      { productId: 'sp3', name: 'Gafas de protección visual', price: 22000, qty: 5 },
    ],
    total: 185000 + 65000 * 2 + 22000 * 5,
    proofImage: '/assets/comprobante-ejemplo.svg',
    status: 'pending',
    statusHistory: [{ status: 'pending', date: sampleOrderDate }],
    paymentNote: null,
    shipment: null,
    createdAt: sampleOrderDate,
  },
  ...demoOrders(),
]

// Pedidos de ejemplo adicionales, repartidos en los últimos meses y en todos
// los estados, para probar la paginación, los filtros y el gráfico de ventas.
function demoOrders() {
  const PRICES = { sp1: ['Botiquín tipo A certificado', 185000], sp2: ['Casco de protección craneal', 65000], sp3: ['Gafas de protección visual', 22000] }
  const rows = [
    // [clientId, nombre, correo, teléfono, dirección, ciudad, díasAtrás, estado, artículos]
    ['cl-ejemplo-2', 'María Fernanda López', 'maria.lopez@correo.co', '+57 315 555 7781', 'Carrera 7 # 72-41, Apto 502', 'Bogotá', 1, 'pending', { sp3: 2 }],
    ['cl-ejemplo-3', 'Colegio San Rafael', 'administracion@colegiosanrafael.edu.co', '+57 604 555 3320', 'Calle 10 Sur # 43-15', 'Medellín', 3, 'confirmed', { sp1: 3 }],
    ['cl-ejemplo-4', 'Ferretería El Tornillo', 'gerencia@eltornillo.co', '+57 312 555 5100', 'Cra. 50 # 30-12', 'Itagüí', 6, 'shipped', { sp2: 4, sp3: 4 }],
    ['cl-ejemplo-5', 'Clínica Los Álamos', 'sst@clinicaalamos.co', '+57 313 555 5129', 'Av. 80 # 25-40', 'Medellín', 12, 'completed', { sp1: 2, sp3: 6 }],
    ['cl-ejemplo-6', 'Transportes Andinos S.A.', 'talento@transandinos.co', '+57 314 555 5158', 'Calle 13 # 68-90', 'Bogotá', 20, 'completed', { sp2: 10 }],
    ['cl-ejemplo-7', 'Héctor Valencia', 'hector.valencia@correo.co', '+57 315 555 5187', 'Calle 33 # 70-15', 'Medellín', 26, 'rejected', { sp1: 1 }],
    ['cl-ejemplo-8', 'Restaurante La Cosecha', 'admin@lacosecha.co', '+57 316 555 5216', 'Cra. 43A # 9-50', 'Medellín', 38, 'completed', { sp1: 1, sp3: 3 }],
    ['cl-ejemplo-9', 'Liliana Mora', 'liliana.mora@correo.co', '+57 317 555 5245', 'Calle 5 # 38-20', 'Cali', 52, 'completed', { sp3: 5 }],
    ['cl-ejemplo-10', 'Conjunto Residencial Altos del Río', 'administracion@altosdelrio.co', '+57 318 555 5274', 'Calle 75 Sur # 52-30', 'Sabaneta', 70, 'completed', { sp1: 4 }],
    ['cl-ejemplo-11', 'Industrias Metálicas del Valle', 'compras@imvalle.co', '+57 319 555 5303', 'Zona Industrial Acopi', 'Yumbo', 95, 'completed', { sp2: 12, sp3: 12 }],
    ['cl-ejemplo-1', 'Constructora Andina S.A.S.', 'compras@constructoraandina.co', '+57 310 555 2048', 'Calle 45 # 12-30, Bodega 3', 'Bogotá', 118, 'completed', { sp2: 6 }],
    ['cl-demo', 'Cliente Lidessa', 'cliente@lidessa.co', '+57 303 555 0144', 'Calle 100 # 15-20', 'Bogotá', 140, 'completed', { sp1: 1, sp2: 1 }],
    ['cl-demo', 'Cliente Lidessa', 'cliente@lidessa.co', '+57 303 555 0144', 'Calle 100 # 15-20', 'Bogotá', 9, 'shipped', { sp3: 2 }],
  ]
  const FLOW = ['pending', 'confirmed', 'shipped', 'completed']
  return rows.map(([clientId, customerName, customerEmail, customerPhone, address, city, daysAgo, status, qtys], i) => {
    const created = new Date(Date.now() - daysAgo * 86400000)
    const items = Object.entries(qtys).map(([productId, qty]) => ({ productId, name: PRICES[productId][0], price: PRICES[productId][1], qty }))
    const steps = status === 'rejected' ? ['pending', 'rejected'] : FLOW.slice(0, FLOW.indexOf(status) + 1)
    const statusHistory = steps.map((st, k) => ({ status: st, date: new Date(created.getTime() + k * 86400000 * 0.8).toISOString() }))
    return {
      id: `ord-demo-${String(i + 1).padStart(2, '0')}`,
      clientId, customerName, customerPhone, customerEmail, address, city, notes: '',
      items, total: items.reduce((sum, it) => sum + it.price * it.qty, 0),
      proofImage: '/assets/comprobante-ejemplo.svg',
      status, statusHistory, statusUpdatedAt: statusHistory[statusHistory.length - 1].date,
      paymentNote: null,
      shipment: ['shipped', 'completed'].includes(status)
        ? { carrier: ['Servientrega', 'Coordinadora', 'Interrapidísimo'][i % 3], trackingNumber: String(700012345 + i * 9173), photo: null, date: statusHistory[2]?.date }
        : null,
      ...(status === 'rejected' ? { rejectionReason: 'El comprobante de pago no corresponde al valor del pedido.', refundProof: null } : {}),
      createdAt: created.toISOString(),
    }
  })
}
