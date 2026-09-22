export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5144'

// Convierte una ruta relativa que devuelve el backend (ej. adjuntos subidos,
// "/uploads/attachments/xxx.pdf") en una URL absoluta que el navegador pueda
// abrir/descargar. Las URLs ya absolutas se dejan tal cual.
export function toFileUrl(path) {
  if (!path) return ''
  return /^https?:\/\//.test(path) ? path : `${API_URL}${path}`
}

async function request(path, options = {}, { allow404 = false } = {}) {
  const isFormData = options.body instanceof FormData
  const headers = { ...(isFormData ? {} : { 'Content-Type': 'application/json' }), ...options.headers }
  let res
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Verifique que la API esté corriendo.')
  }
  if (allow404 && res.status === 404) {
    return null
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || 'Ocurrió un error inesperado.')
  }
  return data
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
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

// null cuando el estudiante todavía no tiene entrega para esa tarea.
export function apiGetSubmission(assignmentId, token) {
  return request(`/api/assignments/${assignmentId}/submissions/me`, { headers: authHeaders(token) }, { allow404: true })
}

// payload: { textResponse, notes, attachmentFileName, attachmentUrl, attachmentSizeBytes, submit }
export function apiSaveSubmission(assignmentId, payload, token) {
  return request(`/api/assignments/${assignmentId}/submissions/me`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
}

export function apiMarkSubmissionSeen(id, token) {
  return request(`/api/submissions/${id}/seen`, { method: 'PUT', headers: authHeaders(token) })
}

// payload: { grade, feedback, retryAllowed }
export function apiGradeSubmission(id, payload, token) {
  return request(`/api/submissions/${id}/grade`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
}

export function apiUploadAttachment(file, token) {
  const formData = new FormData()
  formData.append('file', file)
  return request('/api/files/attachments', { method: 'POST', headers: authHeaders(token), body: formData })
}
