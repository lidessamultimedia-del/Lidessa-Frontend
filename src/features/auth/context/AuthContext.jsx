import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)
const USERS_KEY = 'lidessa_users'

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
]

export const ROLE_HOME = {
  admin: '/admin',
  profesor: '/profesor',
  estudiante: '/estudiante',
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => {
    try {
      const stored = localStorage.getItem(USERS_KEY)
      if (stored) return JSON.parse(stored)
    } catch {
      // ignore malformed data
    }
    return BASE_USERS
  })
  const [user, setUser] = useState(null)
  const [initialized, setInitialized] = useState(false)
  const [resetCodes, setResetCodes] = useState({})

  useEffect(() => {
    // La sesión vive en sessionStorage (no localStorage) a propósito: así se
    // olvida sola al cerrar la pestaña/navegador en vez de quedar iniciada
    // para siempre, mientras que la lista de cuentas (USERS_KEY) sí persiste.
    const stored = sessionStorage.getItem('lidessa_user')
    if (stored) setUser(JSON.parse(stored))
    setInitialized(true)
  }, [])

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }, [users])

  async function login(email, password) {
    await new Promise(r => setTimeout(r, 900))
    const found = users.find(u => u.email === email && u.password === password)
    if (!found) throw new Error('Credenciales incorrectas')
    const { password: _pw, ...safe } = found
    setUser(safe)
    sessionStorage.setItem('lidessa_user', JSON.stringify(safe))
  }

  async function register({ name, email, password, phone }) {
    await new Promise(r => setTimeout(r, 700))
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Ya existe una cuenta registrada con ese correo.')
    }
    const newUser = {
      id: `s${Date.now()}`,
      name, email, password, role: 'estudiante', phone: phone ?? '',
      unreadNotifications: 0,
    }
    setUsers(prev => [...prev, newUser])
    const { password: _pw, ...safe } = newUser
    setUser(safe)
    sessionStorage.setItem('lidessa_user', JSON.stringify(safe))
    return safe
  }

  // Crea una cuenta con acceso real (login) desde el panel de admin — a
  // diferencia del directorio del LMS, que solo guarda una ficha informativa.
  function createUser({ id, name, email, password, phone, role }) {
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Ya existe una cuenta registrada con ese correo.')
    }
    const newUser = { id: id ?? `u${Date.now()}`, name, email, password, role, phone: phone ?? '', unreadNotifications: 0 }
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

  // Lista de estudiantes registrados (sin contraseña) para que LMSContext pueda
  // reconciliar su directorio — ver comentario en LMSContext sobre por qué
  // esto no puede depender únicamente de la llamada puntual a addDirectoryUser.
  const registeredStudents = users.filter(u => u.role === 'estudiante').map(({ password: _pw, ...safe }) => safe)
  // Todas las cuentas (sin contraseña), para la vista de Usuarios y Roles del admin.
  const allUsers = users.map(({ password: _pw, ...safe }) => safe)

  return (
    <AuthContext.Provider value={{ user, initialized, login, register, logout, updateProfile, changePassword, requestPasswordReset, verifyResetCode, resetPassword, registeredStudents, allUsers, updateUserRole, createUser, updateUserCredentials }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
