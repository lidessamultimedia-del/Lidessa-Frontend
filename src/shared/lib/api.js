const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5144'

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Verifique que la API esté corriendo.')
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || 'Ocurrió un error inesperado.')
  }
  return data
}

export function apiLogin(email, password) {
  return request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export function apiRegister({ name, email, password, phone, role }) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, phone: phone ?? '', role: role ?? 'estudiante' }),
  })
}
