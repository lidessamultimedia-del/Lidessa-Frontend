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

  useEffect(() => {
    const stored = localStorage.getItem('lidessa_user')
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
    localStorage.setItem('lidessa_user', JSON.stringify(safe))
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
    localStorage.setItem('lidessa_user', JSON.stringify(safe))
    return safe
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('lidessa_user')
  }

  function updateProfile(data) {
    if (!user) return
    const updated = { ...user, ...data }
    setUser(updated)
    localStorage.setItem('lidessa_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, initialized, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
