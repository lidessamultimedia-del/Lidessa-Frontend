import { createContext, useContext, useState, useEffect, useRef } from 'react'
import {
  apiLogin, apiRegister, apiMe, apiRefresh, apiLogout, apiInviteAccount,
  apiActivateAccount, apiForgotPassword, apiResetPassword,
} from '@/shared/lib/api'

const AuthContext = createContext(null)

// Directorio de referencia (sin contraseñas): solo sirve para que el LMS mock
// encuentre nombres/avatares y al admin de los mensajes por id. Las cuentas
// reales de admin/profesor/estudiante viven en el backend; esto se reemplaza
// cuando exista un endpoint para listar usuarios.
const REFERENCE_ACCOUNTS = [
  { id: '1', name: 'Admin Lidessa', email: 'admin@lidessa.co', role: 'admin', phone: '+57 300 123 4567', unreadNotifications: 5 },
  { id: 't1', name: 'Carlos Rodríguez', email: 'profesor@lidessa.co', role: 'profesor', phone: '+57 301 555 0102', unreadNotifications: 3 },
  { id: 's1', name: 'Juan Pérez', email: 'estudiante@lidessa.co', role: 'estudiante', phone: '+57 302 555 0199', unreadNotifications: 2 },
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
    id, name, email, role,
    phone: role === 'profesor' ? `+57 31${i} 555 ${String(1200 + i * 37).padStart(4, '0')}` : `+57 32${i - 5} 555 ${String(3400 + (i - 5) * 53).padStart(4, '0')}`,
    documentType: 'Cédula de ciudadanía',
    documentNumber: role === 'profesor' ? String(79000000 + i * 104729) : String(1000000000 + (i - 5) * 7919311),
    unreadNotifications: 0,
  })),
]

// Clientes de V2 Suministros (contraseña: cliente123). El backend todavía no
// acepta el rol "cliente", así que estas cuentas siguen siendo locales.
const SEED_CLIENTS = [
  {
    id: 'cl-demo', name: 'Cliente Lidessa', firstName: 'Cliente', lastName: 'Lidessa',
    email: 'cliente@lidessa.co', phone: '+57 303 555 0144',
    documentType: 'Cédula de ciudadanía', documentNumber: '1012345678', address: 'Calle 100 # 15-20, Bogotá',
  },
  {
    id: 'cl-ejemplo-1', name: 'Constructora Andina S.A.S.', email: 'compras@constructoraandina.co', phone: '+57 310 555 2048',
    documentType: 'NIT', documentNumber: '900123456-7', address: 'Calle 45 # 12-30, Bodega 3, Bogotá',
  },
  {
    id: 'cl-ejemplo-2', name: 'María Fernanda López', firstName: 'María Fernanda', lastName: 'López',
    email: 'maria.lopez@correo.co', phone: '+57 315 555 7781',
    documentType: 'Cédula de ciudadanía', documentNumber: '52345678', address: 'Carrera 7 # 72-41, Apto 502, Bogotá',
  },
  {
    id: 'cl-ejemplo-3', name: 'Colegio San Rafael', email: 'administracion@colegiosanrafael.edu.co', phone: '+57 604 555 3320',
    documentType: 'NIT', documentNumber: '860045123-1', address: 'Calle 10 Sur # 43-15, Medellín',
  },
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
    id, name, email, phone: `+57 31${(i + 2) % 10} 555 ${String(5100 + i * 29).padStart(4, '0')}`,
    documentType, documentNumber, address,
  })),
].map(c => ({ ...c, password: 'cliente123', role: 'cliente', unreadNotifications: 0 }))

// Solo los clientes se guardan en el navegador, para que lo que el admin cree
// o edite no desaparezca al recargar. `lidessa_users` era la clave de cuando
// todas las cuentas vivían aquí: se migra una vez (solo sus clientes) y se borra.
const CLIENTS_STORAGE_KEY = 'lidessa_clients'
const LEGACY_USERS_KEYS = ['lidessa_users', 'lidessa_users_seed']

function loadClients() {
  try {
    const stored = JSON.parse(localStorage.getItem(CLIENTS_STORAGE_KEY) ?? 'null')
    if (Array.isArray(stored)) return stored
    const legacy = JSON.parse(localStorage.getItem(LEGACY_USERS_KEYS[0]) ?? 'null')
    if (Array.isArray(legacy)) return legacy.filter(u => u.role === 'cliente')
  } catch { /* almacenamiento no disponible o dañado */ }
  return SEED_CLIENTS
}

// La sesión vive en sessionStorage a propósito: así se olvida sola al cerrar
// la pestaña/navegador en vez de quedar iniciada para siempre.
// Forma: { user: { ...datos, token }, refreshToken, expiresAt } — los clientes
// locales no tienen token ni refreshToken.
const SESSION_KEY = 'lidessa_session'
const LEGACY_SESSION_KEY = 'lidessa_user'
// Se renueva el token un minuto antes de que venza.
const REFRESH_MARGIN_MS = 60 * 1000
const API_RESET_CODE_TTL_MS = 15 * 60 * 1000
const LOCAL_RESET_CODE_TTL_MS = 10 * 60 * 1000

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

function sessionFromLogin(data) {
  return {
    user: { ...data.user, id: String(data.user.id), token: data.token, unreadNotifications: 0 },
    refreshToken: data.refreshToken,
    expiresAt: data.expiresAt,
  }
}

function localSession(account) {
  return { user: { ...withoutPassword(account), token: null }, refreshToken: null, expiresAt: null }
}

function withoutPassword({ password: _pw, ...safe }) {
  return safe
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
  const [clients, setClients] = useState(loadClients)
  // Cuentas de la API que el admin creó en esta pestaña, más el directorio de
  // referencia. En memoria: sin endpoint de listado no hay de dónde recargarlas.
  const [knownAccounts, setKnownAccounts] = useState(REFERENCE_ACCOUNTS)
  const [resetCodes, setResetCodes] = useState({})
  // El refresh token rota en cada uso: si dos llamadas lo usan a la vez (p. ej.
  // StrictMode montando dos veces el efecto de restauración), la segunda
  // fallaría y cerraría la sesión. Por eso se comparte la promesa en curso.
  const refreshInFlight = useRef(null)

  const user = session?.user ?? null

  useEffect(() => {
    try {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients))
      LEGACY_USERS_KEYS.forEach(k => localStorage.removeItem(k))
    } catch { /* sin almacenamiento */ }
  }, [clients])

  useEffect(() => {
    if (initialized) writeSession(session)
  }, [session, initialized])

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
        if (!cancelled) setSession({ ...current, user: { ...current.user, name: me.name, email: me.email, role: me.role } })
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
    const client = clients.find(c => sameEmail(c.email, email) && c.password === password)
    if (client) {
      setSession(localSession(client))
      return
    }
    setSession(sessionFromLogin(await apiLogin(email.trim(), password)))
  }

  // Registro público: siempre crea una cuenta de estudiante en la API.
  async function register({ name, email, password, phone }) {
    await apiRegister({ name, email, password, phone, role: 'estudiante' })
    const next = sessionFromLogin(await apiLogin(email, password))
    setSession(next)
    return next.user
  }

  function addClient({ name, firstName, lastName, email, password, phone, documentType, documentNumber, address }) {
    if (clients.some(c => sameEmail(c.email, email))) {
      throw new Error('Ya existe una cuenta registrada con ese correo.')
    }
    const client = {
      id: `cl${Date.now()}`, name, email: email.trim(), password, role: 'cliente',
      ...(firstName ? { firstName } : {}), ...(lastName ? { lastName } : {}),
      phone: phone ?? '', documentType: documentType ?? '', documentNumber: documentNumber ?? '', address: address ?? '',
      unreadNotifications: 0,
    }
    setClients(prev => [...prev, client])
    return client
  }

  // Registro de clientes de la tienda de Suministros (local, ver SEED_CLIENTS).
  function registerClient(data) {
    const next = localSession(addClient(data))
    setSession(next)
    return next.user
  }

  // Crea una cuenta real desde el panel de admin.
  // - profesor/estudiante: invitación (/api/auth/invite). La cuenta queda
  //   inactiva y la persona elige su contraseña con el enlace que le llega;
  //   `password` se ignora.
  // - admin: registro con el token del admin, con la contraseña indicada.
  // - cliente: local.
  async function createUser({ name, firstName, lastName, email, password, phone, role, documentType, documentNumber, address }) {
    if (role === 'cliente') {
      return withoutPassword(addClient({ name, firstName, lastName, email, password, phone, documentType, documentNumber, address }))
    }
    if (!user?.token) throw new Error('Su sesión no está conectada a la API. Cierre sesión e ingrese de nuevo.')
    const invited = role !== 'admin'
    const created = invited
      ? await apiInviteAccount({ name, email, phone, role }, user.token)
      : await apiRegister({ name, email, password, phone, role }, user.token)
    const account = {
      ...created, id: String(created.id),
      ...(firstName ? { firstName } : {}), ...(lastName ? { lastName } : {}),
      documentType: documentType ?? '', documentNumber: documentNumber ?? '', address: address ?? '',
      pendingActivation: invited, unreadNotifications: 0,
    }
    setKnownAccounts(prev => [...prev.filter(u => u.id !== account.id), account])
    return account
  }

  // Desde el enlace de invitación: la persona elige su contraseña.
  async function activateAccount(token, password) {
    await apiActivateAccount(token, password)
  }

  const isClient = id => clients.some(c => c.id === id)

  // Clientes: se guarda de verdad. Cuentas de la API: el backend todavía no
  // tiene endpoint para editarlas, así que solo cambia la vista local (y una
  // contraseña nueva se rechaza en vez de fingir que se guardó).
  function updateUserCredentials(id, data) {
    if (isClient(id)) {
      setClients(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)))
      return
    }
    if (data.password) {
      throw new Error('Todavía no se puede cambiar la contraseña de otra cuenta. La persona puede usar "¿Olvidó su contraseña?".')
    }
    setKnownAccounts(prev => prev.map(u => (u.id === id ? { ...u, ...data } : u)))
  }

  // Mismo límite que updateUserCredentials para cuentas de la API.
  function updateUserRole(id, role) {
    if (isClient(id)) setClients(prev => prev.map(c => (c.id === id ? { ...c, role } : c)))
    else setKnownAccounts(prev => prev.map(u => (u.id === id ? { ...u, role } : u)))
    if (user?.id === id) setSession(s => ({ ...s, user: { ...s.user, role } }))
  }

  // Clientes: se borra la cuenta. Cuentas de la API: solo se quita de la
  // vista local — sin endpoint de borrado, la persona puede seguir entrando.
  function deleteUser(id) {
    if (isClient(id)) setClients(prev => prev.filter(c => c.id !== id))
    else setKnownAccounts(prev => prev.filter(u => u.id !== id))
    if (user?.id === id) logout()
  }

  function updateProfile(data) {
    if (!user) return
    setSession(s => ({ ...s, user: { ...s.user, ...data } }))
    if (isClient(user.id)) setClients(prev => prev.map(c => (c.id === user.id ? { ...c, ...data } : c)))
    else setKnownAccounts(prev => prev.map(u => (u.id === user.id ? { ...u, ...data } : u)))
  }

  async function changePassword(currentPassword, newPassword) {
    const client = clients.find(c => c.id === user?.id)
    if (!client) {
      throw new Error('El cambio de contraseña desde la cuenta todavía no está disponible. Cierre sesión y use "¿Olvidó su contraseña?".')
    }
    if (client.password !== currentPassword) throw new Error('La contraseña actual es incorrecta.')
    setClients(prev => prev.map(c => (c.id === client.id ? { ...c, password: newPassword } : c)))
  }

  // Clientes: el código se genera aquí. Resto: lo genera la API, que mientras
  // no haya correo real lo devuelve en `devCode` (null si el correo no existe —
  // la API no lo revela, así que el error llega al momento de restablecer).
  async function requestPasswordReset(email) {
    const key = email.trim().toLowerCase()
    if (clients.some(c => sameEmail(c.email, email))) {
      const code = String(Math.floor(100000 + Math.random() * 900000))
      setResetCodes(prev => ({ ...prev, [key]: { code, local: true, expiresAt: Date.now() + LOCAL_RESET_CODE_TTL_MS } }))
      return code
    }
    const { devCode } = await apiForgotPassword(email.trim())
    setResetCodes(prev => ({ ...prev, [key]: { code: devCode ?? null, local: false, expiresAt: Date.now() + API_RESET_CODE_TTL_MS } }))
    return devCode ?? null
  }

  // Validación previa para avanzar de paso en el formulario. Con códigos de la
  // API es solo orientativa: la validación real la hace /reset-password.
  function verifyResetCode(email, code) {
    const entry = resetCodes[email.trim().toLowerCase()]
    if (!entry) throw new Error('Solicite un nuevo código de verificación.')
    if (Date.now() > entry.expiresAt) throw new Error('El código expiró. Solicite uno nuevo.')
    if (entry.code && entry.code !== code) throw new Error('El código ingresado es incorrecto.')
  }

  async function resetPassword(email, code, newPassword) {
    const key = email.trim().toLowerCase()
    if (resetCodes[key]?.local) {
      verifyResetCode(email, code)
      setClients(prev => prev.map(c => (sameEmail(c.email, email) ? { ...c, password: newPassword } : c)))
    } else {
      await apiResetPassword(email.trim(), code, newPassword)
    }
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
  const accountsById = new Map(
    [...knownAccounts, ...clients.map(withoutPassword)].map(u => [u.id, u]),
  )
  if (user && !isClient(user.id)) {
    const { token: _t, ...self } = user
    accountsById.set(user.id, { ...accountsById.get(user.id), ...self })
  }
  const allUsers = [...accountsById.values()]
  // Estudiantes para que LMSContext reconcilie su directorio (ver comentario allá).
  const registeredStudents = allUsers.filter(u => u.role === 'estudiante')

  return (
    <AuthContext.Provider value={{ user, initialized, login, register, registerClient, logout, updateProfile, changePassword, requestPasswordReset, verifyResetCode, resetPassword, activateAccount, registeredStudents, allUsers, updateUserRole, createUser, updateUserCredentials, deleteUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
