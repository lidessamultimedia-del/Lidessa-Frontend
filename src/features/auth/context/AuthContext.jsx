import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const MOCK_USERS = [
  {
    id: '1',
    name: 'María García',
    email: 'cliente@lidessa.co',
    password: '123456',
    role: 'client',
    company: 'Construcciones García S.A.S.',
    phone: '+57 310 000 0001',
    unreadNotifications: 2,
  },
  {
    id: '2',
    name: 'Admin Lidessa',
    email: 'admin@lidessa.co',
    password: 'admin123',
    role: 'admin',
    phone: '+57 300 123 4567',
    unreadNotifications: 5,
  },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('lidessa_user')
    if (stored) setUser(JSON.parse(stored))
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
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
