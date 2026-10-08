import { createContext, useContext, useState, useEffect } from 'react'
import { apiLogin, apiRegister } from '@/shared/lib/api'

const AuthContext = createContext(null)

const BASE_USERS = [
  {
    id: '1',
    name: 'Admin Lidessa',
    email: 'admin@lidessa.co',
    password: 'admin123',
    role: 'admin',
    phone: '+57 300 123 4567',
    unreadNotifications: 5,
  },
  {
    id: 't1',
    name: 'Carlos Rodríguez',
    email: 'profesor@lidessa.co',
    password: 'profesor123',
    role: 'profesor',
    phone: '+57 301 555 0102',
    unreadNotifications: 3,
  },
  {
    id: 's1',
    name: 'Juan Pérez',
    email: 'estudiante@lidessa.co',
    password: 'estudiante123',
    role: 'estudiante',
    phone: '+57 302 555 0199',
    unreadNotifications: 2,
  },
  // Clientes de ejemplo de V2 Suministros (contraseña: cliente123).
  {
    id: 'cl-demo',
    name: 'Cliente Lidessa',
    firstName: 'Cliente',
    lastName: 'Lidessa',
    email: 'cliente@lidessa.co',
    password: 'cliente123',
    role: 'cliente',
    phone: '+57 303 555 0144',
    documentType: 'Cédula de ciudadanía',
    documentNumber: '1012345678',
    address: 'Calle 100 # 15-20, Bogotá',
    unreadNotifications: 0,
  },
  {
    id: 'cl-ejemplo-1',
    name: 'Constructora Andina S.A.S.',
    email: 'compras@constructoraandina.co',
    password: 'cliente123',
    role: 'cliente',
    phone: '+57 310 555 2048',
    documentType: 'NIT',
    documentNumber: '900123456-7',
    address: 'Calle 45 # 12-30, Bodega 3, Bogotá',
    unreadNotifications: 0,
  },
  {
    id: 'cl-ejemplo-2',
    name: 'María Fernanda López',
    firstName: 'María Fernanda',
    lastName: 'López',
    email: 'maria.lopez@correo.co',
    password: 'cliente123',
    role: 'cliente',
    phone: '+57 315 555 7781',
    documentType: 'Cédula de ciudadanía',
    documentNumber: '52345678',
    address: 'Carrera 7 # 72-41, Apto 502, Bogotá',
    unreadNotifications: 0,
  },
  {
    id: 'cl-ejemplo-3',
    name: 'Colegio San Rafael',
    email: 'administracion@colegiosanrafael.edu.co',
    password: 'cliente123',
    role: 'cliente',
    phone: '+57 604 555 3320',
    documentType: 'NIT',
    documentNumber: '860045123-1',
    address: 'Calle 10 Sur # 43-15, Medellín',
    unreadNotifications: 0,
  },
  // ── Cuentas de ejemplo adicionales (contraseña: demo123) ──
  // Profesores y estudiantes coinciden (id/correo) con el directorio del LMS.
  ...[
    ['t3', 'Andrés Felipe Restrepo', 'andres.restrepo@lidessa.co', 'profesor'],
    ['t4', 'Paola Andrea Cárdenas', 'paola.cardenas@lidessa.co', 'profesor'],
    ['t5', 'Jorge Iván Salazar', 'jorge.salazar@lidessa.co', 'profesor'],
    ['t6', 'Diana Marcela Rojas', 'diana.rojas@lidessa.co', 'profesor'],
    ['t7', 'Luis Eduardo Pineda', 'luis.pineda@lidessa.co', 'profesor'],
    ['s5', 'Camilo Andrés Torres', 'camilo.torres@correo.co', 'estudiante'],
    ['s6', 'Valentina Ríos Arango', 'valentina.rios@correo.co', 'estudiante'],
    ['s7', 'Santiago Morales Gil', 'santiago.morales@correo.co', 'estudiante'],
    ['s8', 'Daniela Patiño Zapata', 'daniela.patino@correo.co', 'estudiante'],
    ['s9', 'Juan David Londoño', 'juandavid.londono@correo.co', 'estudiante'],
  ].map(([id, name, email, role], i) => ({
    id, name, email, password: 'demo123', role,
    phone: role === 'profesor' ? `+57 31${i} 555 ${String(1200 + i * 37).padStart(4, '0')}` : `+57 32${i - 5} 555 ${String(3400 + (i - 5) * 53).padStart(4, '0')}`,
    documentType: 'Cédula de ciudadanía',
    documentNumber: role === 'profesor' ? String(79000000 + i * 104729) : String(1000000000 + (i - 5) * 7919311),
    unreadNotifications: 0,
  })),
  ...[
    ['cl-ejemplo-4', 'Ferretería El Tornillo', 'gerencia@eltornillo.co', 'NIT', '901234567-1', 'Cra. 50 # 30-12, Itagüí'],
    ['cl-ejemplo-5', 'Clínica Los Álamos', 'sst@clinicaalamos.co', 'NIT', '890456789-3', 'Av. 80 # 25-40, Medellín'],
    ['cl-ejemplo-6', 'Transportes Andinos S.A.', 'talento@transandinos.co', 'NIT', '800987654-2', 'Calle 13 # 68-90, Bogotá'],
    ['cl-ejemplo-7', 'Héctor Valencia', 'hector.valencia@correo.co', 'Cédula de ciudadanía', '71654321', 'Calle 33 # 70-15, Medellín'],
    ['cl-ejemplo-8', 'Restaurante La Cosecha', 'admin@lacosecha.co', 'NIT', '901567890-4', 'Cra. 43A # 9-50, Medellín'],
    ['cl-ejemplo-9', 'Liliana Mora', 'liliana.mora@correo.co', 'Cédula de ciudadanía', '43987654', 'Calle 5 # 38-20, Cali'],
    ['cl-ejemplo-10', 'Conjunto Residencial Altos del Río', 'administracion@altosdelrio.co', 'NIT', '900765432-8', 'Calle 75 Sur # 52-30, Sabaneta'],
    ['cl-ejemplo-11', 'Industrias Metálicas del Valle', 'compras@imvalle.co', 'NIT', '805123987-6', 'Zona Industrial Acopi, Yumbo'],
  ].map(([id, name, email, documentType, documentNumber, address], i) => ({
    id, name, email, password: 'cliente123', role: 'cliente',
    phone: `+57 31${(i + 2) % 10} 555 ${String(5100 + i * 29).padStart(4, '0')}`,
    documentType, documentNumber, address, unreadNotifications: 0,
  })),
]

// Las cuentas se guardan en el navegador (localStorage) para que lo que se
// cree o edite desde el panel no desaparezca al recargar. Es una solución
// temporal mientras el backend no tenga endpoints de usuarios/clientes.
const USERS_STORAGE_KEY = 'lidessa_users'
const USERS_SEED_VERSION_KEY = 'lidessa_users_seed'
const USERS_SEED_VERSION = '4'

function loadUsers() {
  try {
    const stored = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) ?? 'null')
    if (Array.isArray(stored) && stored.length > 0) {
      // Si los datos guardados son de antes de agregar los clientes de
      // ejemplo, se suman una sola vez (sin pisar lo ya editado). Después
      // ya no se re-agregan, para que borrar uno de ejemplo sea definitivo.
      if (localStorage.getItem(USERS_SEED_VERSION_KEY) === USERS_SEED_VERSION) return stored
      const ids = new Set(stored.map(u => u.id))
      const emails = new Set(stored.map(u => u.email?.toLowerCase()))
      const missing = BASE_USERS.filter(u => !ids.has(u.id) && !emails.has(u.email.toLowerCase()))
      return [...stored, ...missing]
    }
  } catch { /* almacenamiento no disponible o dañado */ }
  return BASE_USERS
}

export const ROLE_HOME = {
  admin: '/admin',
  profesor: '/profesor',
  estudiante: '/estudiante',
  cliente: '/tienda/cliente',
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers)

  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
      localStorage.setItem(USERS_SEED_VERSION_KEY, USERS_SEED_VERSION)
    } catch { /* sin almacenamiento */ }
  }, [users])
  const [user, setUser] = useState(null)
  const [initialized, setInitialized] = useState(false)
  const [resetCodes, setResetCodes] = useState({})

  useEffect(() => {
    // La sesión vive en sessionStorage a propósito: así se olvida sola al
    // cerrar la pestaña/navegador en vez de quedar iniciada para siempre.
    const stored = sessionStorage.getItem('lidessa_user')
    if (stored) setUser(JSON.parse(stored))
    setInitialized(true)
  }, [])

  // Login real contra la API (Lidessa-Backend). El directorio mock (`users`,
  // `allUsers`, `registeredStudents`) sigue siendo estado en memoria aparte —
  // el backend todavía no tiene endpoints para listar/gestionar usuarios, así
  // que un usuario autenticado por esta vía no aparece ahí (gap conocido,
  // aceptado mientras se agregan esos endpoints).
  async function login(email, password) {
    // Clientes de la tienda de Suministros: todavía no existen en el backend
    // real (ese rol no está entre los que acepta el registro), así que viven
    // aparte, en memoria, igual que todo el sitio antes de conectarse a la
    // API. El día que el backend soporte el rol "cliente" esto se reemplaza
    // por un login real igual que admin/profesor/estudiante.
    const clientMatch = users.find(u => u.role === 'cliente' && u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password)
    if (clientMatch) {
      const { password: _pw, ...safe } = clientMatch
      const session = { ...safe, token: null }
      setUser(session)
      sessionStorage.setItem('lidessa_user', JSON.stringify(session))
      return
    }

    const data = await apiLogin(email, password)
    const safe = { ...data.user, id: String(data.user.id), token: data.token, unreadNotifications: 0 }
    setUser(safe)
    sessionStorage.setItem('lidessa_user', JSON.stringify(safe))
  }

  // Registro de clientes de la tienda de Suministros (mock, ver nota en login).
  function registerClient({ name, email, password, phone, documentNumber, address }) {
    if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      throw new Error('Ya existe una cuenta registrada con ese correo.')
    }
    const newUser = {
      id: `cl${Date.now()}`, name, email, password, role: 'cliente',
      phone: phone ?? '', documentNumber: documentNumber ?? '', address: address ?? '',
      unreadNotifications: 0,
    }
    setUsers(prev => [...prev, newUser])
    const { password: _pw, ...safe } = newUser
    const session = { ...safe, token: null }
    setUser(session)
    sessionStorage.setItem('lidessa_user', JSON.stringify(session))
    return session
  }

  async function register({ name, email, password, phone }) {
    await apiRegister({ name, email, password, phone, role: 'estudiante' })
    const data = await apiLogin(email, password)
    const safe = { ...data.user, id: String(data.user.id), token: data.token, unreadNotifications: 0 }
    setUser(safe)
    sessionStorage.setItem('lidessa_user', JSON.stringify(safe))
    return safe
  }

  // Crea una cuenta con acceso real (login) desde el panel de admin — a
  // diferencia del directorio del LMS, que solo guarda una ficha informativa.
  function createUser({ id, name, firstName, lastName, email, password, phone, role, documentType, documentNumber, address }) {
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Ya existe una cuenta registrada con ese correo.')
    }
    const newUser = {
      id: id ?? `u${Date.now()}`, name, email, password, role,
      ...(firstName ? { firstName } : {}), ...(lastName ? { lastName } : {}),
      phone: phone ?? '', documentType: documentType ?? '', documentNumber: documentNumber ?? '', address: address ?? '',
      unreadNotifications: 0,
    }
    setUsers(prev => [...prev, newUser])
    const { password: _pw, ...safe } = newUser
    return safe
  }

  // Actualiza la cuenta de acceso (login) vinculada a un usuario del directorio.
  function updateUserCredentials(id, data) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u))
  }

  // No hay servicio de correo real (backend pendiente): el código se genera
  // aquí mismo y se devuelve al llamador para mostrarlo en la UI a modo de demo.
  async function requestPasswordReset(email) {
    await new Promise(r => setTimeout(r, 900))
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!found) throw new Error('No existe una cuenta registrada con ese correo.')
    const code = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = Date.now() + 10 * 60 * 1000
    setResetCodes(prev => ({ ...prev, [email.toLowerCase()]: { code, expiresAt } }))
    return code
  }

  function verifyResetCode(email, code) {
    const entry = resetCodes[email.toLowerCase()]
    if (!entry) throw new Error('Solicite un nuevo código de verificación.')
    if (Date.now() > entry.expiresAt) throw new Error('El código expiró. Solicite uno nuevo.')
    if (entry.code !== code) throw new Error('El código ingresado es incorrecto.')
  }

  async function resetPassword(email, code, newPassword) {
    await new Promise(r => setTimeout(r, 900))
    verifyResetCode(email, code)
    setUsers(prev => prev.map(u =>
      u.email.toLowerCase() === email.toLowerCase() ? { ...u, password: newPassword } : u
    ))
    setResetCodes(prev => {
      const next = { ...prev }
      delete next[email.toLowerCase()]
      return next
    })
  }

  async function changePassword(currentPassword, newPassword) {
    await new Promise(r => setTimeout(r, 700))
    const found = users.find(u => u.id === user?.id)
    if (!found || found.password !== currentPassword) throw new Error('La contraseña actual es incorrecta.')
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, password: newPassword } : u))
  }

  function logout() {
    setUser(null)
    sessionStorage.removeItem('lidessa_user')
  }

  function updateProfile(data) {
    if (!user) return
    const updated = { ...user, ...data }
    setUser(updated)
    sessionStorage.setItem('lidessa_user', JSON.stringify(updated))
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...data } : u))
  }

  function updateUserRole(id, role) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
    if (user?.id === id) {
      const updated = { ...user, role }
      setUser(updated)
      sessionStorage.setItem('lidessa_user', JSON.stringify(updated))
    }
  }

  // Elimina la cuenta de acceso (login) — el admin la usa al borrar un usuario
  // del directorio del LMS que tenía cuenta vinculada, para que no pueda
  // seguir iniciando sesión ni reaparezca por la reconciliación automática.
  function deleteUser(id) {
    setUsers(prev => prev.filter(u => u.id !== id))
    if (user?.id === id) logout()
  }

  // Lista de estudiantes registrados (sin contraseña) para que LMSContext pueda
  // reconciliar su directorio — ver comentario en LMSContext sobre por qué
  // esto no puede depender únicamente de la llamada puntual a addDirectoryUser.
  const registeredStudents = users.filter(u => u.role === 'estudiante').map(({ password: _pw, ...safe }) => safe)
  // Todas las cuentas (sin contraseña), para la vista de Usuarios y Roles del admin.
  const allUsers = users.map(({ password: _pw, ...safe }) => safe)

  return (
    <AuthContext.Provider value={{ user, initialized, login, register, registerClient, logout, updateProfile, changePassword, requestPasswordReset, verifyResetCode, resetPassword, registeredStudents, allUsers, updateUserRole, createUser, updateUserCredentials, deleteUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
