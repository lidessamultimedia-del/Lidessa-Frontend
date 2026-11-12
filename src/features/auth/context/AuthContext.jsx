import { createContext, useContext, useState, useEffect, useRef } from 'react'
import {
  apiLogin, apiRegister, apiMe, apiRefresh, apiLogout, apiInviteAccount,
  apiActivateAccount, apiForgotPassword, apiResetPassword, apiGetUsers, apiAddRole,
} from '@/shared/lib/api'

const AuthContext = createContext(null)

// Directorio de referencia (sin contraseñas): solo sirve para que el LMS mock
// encuentre nombres/avatares y al admin de los mensajes por id. Las cuentas
// reales de admin/profesor/estudiante/cliente viven en el backend y se
// recargan de verdad (ver fetchKnownAccounts) apenas hay sesión de admin;
// esto es solo el relleno inicial antes de que esa carga termine.
const REFERENCE_ACCOUNTS = [
  { id: '1', name: 'Admin Lidessa', email: 'admin@lidessa.co', role: 'admin', phone: '+57 300 123 4567', unreadNotifications: 5 },
  { id: 't1', name: 'Carlos Rodríguez', email: 'profesor@lidessa.co', role: 'profesor', phone: '+57 301 555 0102', unreadNotifications: 3 },
  { id: 's1', name: 'Juan Pérez', email: 'estudiante@lidessa.co', role: 'estudiante', phone: '+57 302 555 0199', unreadNotifications: 2 },
]

// La sesión vive en sessionStorage a propósito: así se olvida sola al cerrar
// la pestaña/navegador en vez de quedar iniciada para siempre.
// Forma: { user: { ...datos, token, roles, activeRole }, refreshToken, expiresAt }.
const SESSION_KEY = 'lidessa_session'
const LEGACY_SESSION_KEY = 'lidessa_user'
// Se renueva el token un minuto antes de que venza.
const REFRESH_MARGIN_MS = 60 * 1000
const API_RESET_CODE_TTL_MS = 15 * 60 * 1000

function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null')
  } catch {
    return null
  }
}

function writeSession(session) {
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else sessionStorage.removeItem(SESSION_KEY)
  } catch { /* sin almacenamiento */ }
}

// Cuentas vinculadas (ver 2.2): roles con el principal primero, sin
// duplicados — mismo criterio que ToResponse en el backend.
function rolesOf(apiUser) {
  const roles = apiUser.roles?.length ? apiUser.roles : [apiUser.role]
  return [...new Set(roles)]
}

function sessionFromLogin(data) {
  const roles = rolesOf(data.user)
  return {
    user: { ...data.user, id: String(data.user.id), token: data.token, roles, unreadNotifications: 0 },
    activeRole: roles[0],
    refreshToken: data.refreshToken,
    expiresAt: data.expiresAt,
  }
}

const sameEmail = (a, b) => a?.trim().toLowerCase() === b?.trim().toLowerCase()

export const ROLE_HOME = {
  admin: '/admin',
  profesor: '/profesor',
  estudiante: '/estudiante',
  cliente: '/tienda/cliente',
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [initialized, setInitialized] = useState(false)
  // Cuentas de la API: se recargan de verdad cuando hay sesión de admin (ver
  // fetchKnownAccounts más abajo); mientras tanto, solo el directorio de
  // referencia y lo que esta pestaña haya creado/visto.
  const [knownAccounts, setKnownAccounts] = useState(REFERENCE_ACCOUNTS)
  const [resetCodes, setResetCodes] = useState({})
  // El refresh token rota en cada uso: si dos llamadas lo usan a la vez (p. ej.
  // StrictMode montando dos veces el efecto de restauración), la segunda
  // fallaría y cerraría la sesión. Por eso se comparte la promesa en curso.
  const refreshInFlight = useRef(null)

  const user = session?.user ?? null
  const activeRole = session?.activeRole ?? user?.role ?? null

  useEffect(() => {
    if (initialized) writeSession(session)
  }, [session, initialized])

  // El admin necesita las cuentas reales (todas, no solo profesor/estudiante
  // como hace LMSContext para su propio directorio) para Usuarios y Roles,
  // para la lista de Clientes de Suministros, y para armar OrderFormModal.
  useEffect(() => {
    if (!user?.token || user.role !== 'admin') return
    let cancelled = false
    apiGetUsers(user.token)
      .then(accounts => {
        if (cancelled) return
        setKnownAccounts(prev => {
          const byId = new Map(prev.map(u => [u.id, u]))
          accounts.forEach(a => byId.set(String(a.id), { ...a, id: String(a.id) }))
          return [...byId.values()]
        })
      })
      .catch(() => { /* el panel sigue funcionando con lo que ya había */ })
    return () => { cancelled = true }
  }, [user?.token, user?.role])

  function refreshTokens(current) {
    if (refreshInFlight.current?.refreshToken === current.refreshToken) return refreshInFlight.current.promise
    const promise = apiRefresh(current.refreshToken)
    refreshInFlight.current = { refreshToken: current.refreshToken, promise }
    return promise
  }

  function applyTokens(s, tokens) {
    return { ...s, user: { ...s.user, token: tokens.token }, refreshToken: tokens.refreshToken, expiresAt: tokens.expiresAt }
  }

  // Restaura la sesión guardada y la valida contra la API. Un 401 la descarta;
  // un fallo de red (API caída) la conserva para no sacar a nadie por eso.
  useEffect(() => {
    let cancelled = false
    async function restore() {
      try { sessionStorage.removeItem(LEGACY_SESSION_KEY) } catch { /* sin almacenamiento */ }
      const stored = readSession()
      if (!stored?.user) return
      if (!stored.refreshToken) {
        if (!cancelled) setSession(stored)
        return
      }
      try {
        let current = stored
        if (new Date(stored.expiresAt).getTime() - Date.now() < REFRESH_MARGIN_MS) {
          current = applyTokens(stored, await refreshTokens(stored))
        }
        const me = await apiMe(current.user.token)
        const roles = rolesOf(me)
        if (!cancelled) {
          setSession({
            ...current,
            user: { ...current.user, name: me.name, email: me.email, role: me.role, roles },
            // Si el rol activo guardado ya no es válido (se perdió un rol
            // vinculado, por ejemplo), vuelve al principal.
            activeRole: roles.includes(current.activeRole) ? current.activeRole : roles[0],
          })
        }
      } catch (err) {
        if (cancelled) return
        if (err.status) writeSession(null)
        else setSession(stored)
      }
    }
    restore().finally(() => { if (!cancelled) setInitialized(true) })
    return () => { cancelled = true }
  }, [])

  // Renovación automática antes de que venza el token de acceso.
  useEffect(() => {
    if (!session?.refreshToken || !session.expiresAt) return
    const current = session
    const delay = Math.max(new Date(current.expiresAt).getTime() - Date.now() - REFRESH_MARGIN_MS, 0)
    const timer = setTimeout(() => {
      refreshTokens(current)
        .then(tokens => setSession(s => (s?.refreshToken === current.refreshToken ? applyTokens(s, tokens) : s)))
        .catch(err => {
          // Refresh rechazado (revocado/vencido): la sesión ya no sirve.
          if (err.status) setSession(s => (s?.refreshToken === current.refreshToken ? null : s))
        })
    }, delay)
    return () => clearTimeout(timer)
  }, [session?.refreshToken, session?.expiresAt])

  async function login(email, password) {
    const next = sessionFromLogin(await apiLogin(email.trim(), password))
    setSession(next)
    return next.user
  }

  // Registro público: siempre crea una cuenta de estudiante en la API.
  async function register({ name, email, password, phone }) {
    await apiRegister({ name, email, password, phone, role: 'estudiante' })
    const next = sessionFromLogin(await apiLogin(email, password))
    setSession(next)
    return next.user
  }

  // Registro de clientes de la tienda de Suministros — cuenta real del
  // backend (rol "cliente"), igual que register() para estudiante.
  async function registerClient({ name, email, password, phone }) {
    await apiRegister({ name, email, password, phone, role: 'cliente' })
    const next = sessionFromLogin(await apiLogin(email, password))
    setSession(next)
    return next.user
  }

  // Crea una cuenta real desde el panel de admin.
  // - profesor/estudiante: invitación (/api/auth/invite). La cuenta queda
  //   inactiva y la persona elige su contraseña con el enlace que le llega;
  //   `password` se ignora.
  // - admin/cliente: registro directo con la contraseña indicada.
  async function createUser({ name, email, password, phone, role }) {
    if (!user?.token) throw new Error('Su sesión no está conectada a la API. Cierre sesión e ingrese de nuevo.')
    const invited = role === 'profesor' || role === 'estudiante'
    const created = invited
      ? await apiInviteAccount({ name, email, phone, role }, user.token)
      : await apiRegister({ name, email, password, phone, role }, user.token)
    const account = { ...created, id: String(created.id), pendingActivation: invited, unreadNotifications: 0 }
    setKnownAccounts(prev => [...prev.filter(u => u.id !== account.id), account])
    return account
  }

  // Cuentas vinculadas (ver 2.2): agrega un rol más a una cuenta que ya
  // existe — el backend decide quién puede llamarlo (solo admin). La
  // persona sigue entrando con el mismo correo/contraseña; el rol nuevo le
  // aparece desde su próximo login (el token ya trae un claim por rol).
  async function addRoleToAccount(userId, role) {
    if (!user?.token) throw new Error('Su sesión no está conectada a la API.')
    const updated = await apiAddRole(userId, role, user.token)
    const account = { ...updated, id: String(updated.id) }
    setKnownAccounts(prev => prev.map(u => (u.id === account.id ? { ...u, ...account } : u)))
    return account
  }

  // Cambia la vista activa de una cuenta con más de un rol (botón junto al
  // selector de tema) — no cierra sesión, solo cambia qué panel se muestra.
  function setActiveRole(role) {
    if (!user?.roles?.includes(role)) return
    setSession(s => (s ? { ...s, activeRole: role } : s))
  }

  // Desde el enlace de invitación: la persona elige su contraseña.
  async function activateAccount(token, password) {
    await apiActivateAccount(token, password)
  }

  // Cuentas de la API: el backend todavía no tiene endpoint para editar
  // datos de perfil de otra cuenta, así que solo cambia la vista local (y
  // una contraseña nueva se rechaza en vez de fingir que se guardó).
  function updateUserCredentials(id, data) {
    if (data.password) {
      throw new Error('Todavía no se puede cambiar la contraseña de otra cuenta. La persona puede usar "¿Olvidó su contraseña?".')
    }
    setKnownAccounts(prev => prev.map(u => (u.id === id ? { ...u, ...data } : u)))
  }

  // Mismo límite que updateUserCredentials: solo cambia la vista local.
  function updateUserRole(id, role) {
    setKnownAccounts(prev => prev.map(u => (u.id === id ? { ...u, role } : u)))
    if (user?.id === id) setSession(s => ({ ...s, user: { ...s.user, role } }))
  }

  // Solo quita la cuenta de la vista local — sin endpoint de borrado real,
  // la persona puede seguir entrando.
  function deleteUser(id) {
    setKnownAccounts(prev => prev.filter(u => u.id !== id))
    if (user?.id === id) logout()
  }

  function updateProfile(data) {
    if (!user) return
    setSession(s => ({ ...s, user: { ...s.user, ...data } }))
    setKnownAccounts(prev => prev.map(u => (u.id === user.id ? { ...u, ...data } : u)))
  }

  // Todavía no hay endpoint de cambio de contraseña con sesión iniciada para
  // ninguna cuenta real (admin/profesor/estudiante/cliente) — "¿Olvidó su
  // contraseña?" sigue siendo el único camino mientras tanto.
  async function changePassword() {
    throw new Error('El cambio de contraseña desde la cuenta todavía no está disponible. Cierre sesión y use "¿Olvidó su contraseña?".')
  }

  // El código lo genera la API, que mientras no haya correo real lo devuelve
  // en `devCode` (null si el correo no existe — la API no lo revela, así que
  // el error llega al momento de restablecer).
  async function requestPasswordReset(email) {
    const key = email.trim().toLowerCase()
    const { devCode } = await apiForgotPassword(email.trim())
    setResetCodes(prev => ({ ...prev, [key]: { code: devCode ?? null, expiresAt: Date.now() + API_RESET_CODE_TTL_MS } }))
    return devCode ?? null
  }

  // Validación previa para avanzar de paso en el formulario; la validación
  // real la hace /reset-password.
  function verifyResetCode(email, code) {
    const entry = resetCodes[email.trim().toLowerCase()]
    if (!entry) throw new Error('Solicite un nuevo código de verificación.')
    if (Date.now() > entry.expiresAt) throw new Error('El código expiró. Solicite uno nuevo.')
    if (entry.code && entry.code !== code) throw new Error('El código ingresado es incorrecto.')
  }

  async function resetPassword(email, code, newPassword) {
    const key = email.trim().toLowerCase()
    await apiResetPassword(email.trim(), code, newPassword)
    setResetCodes(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  function logout() {
    const refreshToken = session?.refreshToken
    setSession(null)
    if (refreshToken) apiLogout(refreshToken).catch(() => { /* el token vence solo */ })
  }

  // Todas las cuentas (sin contraseña), para la vista de Usuarios y Roles del
  // admin y para que el LMS resuelva nombres/avatares. Incluye al usuario de
  // la sesión aunque no esté en el directorio de referencia.
  const accountsById = new Map(knownAccounts.map(u => [u.id, u]))
  if (user) {
    const { token: _t, ...self } = user
    accountsById.set(user.id, { ...accountsById.get(user.id), ...self })
  }
  const allUsers = [...accountsById.values()]
  // Estudiantes para que LMSContext reconcilie su directorio (ver comentario allá).
  const registeredStudents = allUsers.filter(u => u.role === 'estudiante')

  return (
    <AuthContext.Provider value={{
      user, initialized, login, register, registerClient, logout, updateProfile, changePassword, requestPasswordReset, verifyResetCode, resetPassword, activateAccount, registeredStudents, allUsers, updateUserRole, createUser, updateUserCredentials, deleteUser,
      activeRole, setActiveRole, addRoleToAccount,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
