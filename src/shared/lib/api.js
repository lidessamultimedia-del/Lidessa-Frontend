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

// ── Intentos de examen ──
// null cuando el estudiante todavía no ha presentado ese examen.
export function apiGetQuizAttempt(quizId, token) {
  return request(`/api/quizzes/${quizId}/attempts/me`, { headers: authHeaders(token) }, { allow404: true })
}

// answers: alineado por posición con las preguntas — índice (multiple), texto (open) o null.
// El backend califica y devuelve el intento con la nota.
export function apiSubmitQuizAttempt(quizId, answers, token) {
  return request(`/api/quizzes/${quizId}/attempts/me`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ answers }),
  })
}

// payload: { score, feedback, retryAllowed }
export function apiReviewQuizAttempt(id, payload, token) {
  return request(`/api/quiz-attempts/${id}/review`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
}

export function apiAllowQuizRetry(id, token) {
  return request(`/api/quiz-attempts/${id}/allow-retry`, { method: 'PUT', headers: authHeaders(token) })
}

export function apiMarkQuizAttemptSeen(id, token) {
  return request(`/api/quiz-attempts/${id}/seen`, { method: 'PUT', headers: authHeaders(token) })
}

// Abre el examen: el servidor registra la hora de inicio y devuelve
// { startedAt, timeLimitMinutes, remainingSeconds } para armar el cronómetro.
export function apiStartQuizAttempt(quizId, token) {
  return request(`/api/quizzes/${quizId}/attempts/me/start`, { method: 'POST', headers: authHeaders(token) })
}

// Todos los intentos de un examen (admin / profesor dueño).
export function apiGetQuizAttempts(quizId, token) {
  return request(`/api/quizzes/${quizId}/attempts`, { headers: authHeaders(token) })
}

// ── LMS: cursos, temas y exámenes ──
// Cursos del usuario logueado (admin: todos; profesor: los suyos; estudiante:
// en los que está inscrito), cada uno con sus estudiantes en `students`.
export function apiGetMyCourses(token) {
  return request('/api/courses/mine', { headers: authHeaders(token) })
}

export function apiGetTopics(courseId, token) {
  return request(`/api/courses/${courseId}/topics`, { headers: authHeaders(token) })
}

export function apiCreateTopic(courseId, payload, token) {
  return request(`/api/courses/${courseId}/topics`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) })
}

export function apiUpdateTopic(id, payload, token) {
  return request(`/api/topics/${id}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(payload) })
}

export function apiDeleteTopic(id, token) {
  return request(`/api/topics/${id}`, { method: 'DELETE', headers: authHeaders(token) })
}

export function apiGetQuizzes(courseId, token) {
  return request(`/api/courses/${courseId}/quizzes`, { headers: authHeaders(token) })
}

export function apiCreateQuiz(courseId, payload, token) {
  return request(`/api/courses/${courseId}/quizzes`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) })
}

export function apiUpdateQuiz(id, payload, token) {
  return request(`/api/quizzes/${id}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(payload) })
}

export function apiDeleteQuiz(id, token) {
  return request(`/api/quizzes/${id}`, { method: 'DELETE', headers: authHeaders(token) })
}
