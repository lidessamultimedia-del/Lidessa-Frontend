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

export const seedOrders = []
