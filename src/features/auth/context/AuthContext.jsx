import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const MOCK_USERS = [
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
  const [user, setUser] = useState(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('lidessa_user')
    if (stored) setUser(JSON.parse(stored))
    setInitialized(true)
  }, [])

  async function login(email, password) {
    await new Promise(r => setTimeout(r, 900))
    const found = MOCK_USERS.find(u => u.email === email && u.password === password)
    if (!found) throw new Error('Credenciales incorrectas')
    const { password: _pw, ...safe } = found
    setUser(safe)
    localStorage.setItem('lidessa_user', JSON.stringify(safe))
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
    <AuthContext.Provider value={{ user, initialized, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
