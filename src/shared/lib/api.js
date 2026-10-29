export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5144'

// Convierte una ruta relativa que devuelve el backend (ej. adjuntos subidos,
// "/uploads/attachments/xxx.pdf") en una URL absoluta que el navegador pueda
// abrir/descargar. Las URLs ya absolutas se dejan tal cual.
export function toFileUrl(path) {
  if (!path) return ''
  return /^(https?:|data:)/.test(path) ? path : `${API_URL}${path}`
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
    // `status` permite distinguir un 401 (sesión inválida) de un fallo de red,
    // que lanza el Error de arriba sin status.
    // Los errores de validación de ASP.NET (ProblemDetails) no traen `message`
    // sino `errors: { Campo: ['detalle', ...] }` — se muestra el primero.
    const validationError = data?.errors && Object.values(data.errors).flat()[0]
    const err = new Error(data?.message || validationError || 'Ocurrió un error inesperado.')
    err.status = res.status
    throw err
  }
  return data
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function apiLogin(email, password) {
  return request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

// Con token de admin se pueden crear también cuentas de profesor/admin.
export function apiRegister({ name, email, password, phone, role }, token) {
  return request('/api/auth/register', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ name, email, password, phone: phone ?? '', role: role ?? 'estudiante' }),
  })
}

export function apiMe(token) {
  return request('/api/auth/me', { headers: authHeaders(token) })
}

// Solo admin. Cuentas reales (sin contraseña); `role` opcional filtra.
export function apiGetUsers(token, role) {
  return request(`/api/auth/users${role ? `?role=${encodeURIComponent(role)}` : ''}`, { headers: authHeaders(token) })
}

// Cualquier rol autenticado. Null si no hay ningún admin.
export function apiGetAdminContact(token) {
  return request('/api/auth/admin-contact', { headers: authHeaders(token) }, { allow404: true })
}

// Devuelve { token, expiresAt, refreshToken } — el refresh token usado queda revocado.
export function apiRefresh(refreshToken) {
  return request('/api/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) })
}

export function apiLogout(refreshToken) {
  return request('/api/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) })
}

// Solo admin. Crea la cuenta inactiva (profesor/estudiante) y le envía a la
// persona el enlace para elegir su contraseña.
export function apiInviteAccount({ name, email, phone, role }, token) {
  return request('/api/auth/invite', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ name, email, phone: phone ?? '', role }),
  })
}

export function apiActivateAccount(token, password) {
  return request('/api/auth/activate-account', { method: 'POST', body: JSON.stringify({ token, password }) })
}

// Respuesta genérica exista o no el correo; `devCode` trae el código mientras
// no haya envío de correo real.
export function apiForgotPassword(email) {
  return request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
}

export function apiResetPassword(email, code, newPassword) {
  return request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, code, newPassword }) })
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

export function apiAllowSubmissionRetry(id, token) {
  return request(`/api/submissions/${id}/allow-retry`, { method: 'PUT', headers: authHeaders(token) })
}

// Todas las entregas de una tarea (solo profesor del curso / admin).
export function apiGetSubmissions(assignmentId, token) {
  return request(`/api/assignments/${assignmentId}/submissions`, { headers: authHeaders(token) })
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

// Solo admin.
export function apiCreateCourse(payload, token) {
  return request('/api/courses', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) })
}

export function apiUpdateCourse(id, payload, token) {
  return request(`/api/courses/${id}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(payload) })
}

export function apiDeleteCourse(id, token) {
  return request(`/api/courses/${id}`, { method: 'DELETE', headers: authHeaders(token) })
}

// Solo admin.
export function apiEnrollStudent(courseId, studentId, token) {
  return request(`/api/courses/${courseId}/enrollments`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify({ studentId }) })
}

export function apiUnenrollStudent(courseId, studentId, token) {
  return request(`/api/courses/${courseId}/enrollments/${studentId}`, { method: 'DELETE', headers: authHeaders(token) })
}

export function apiGetLessons(courseId, token) {
  return request(`/api/courses/${courseId}/lessons`, { headers: authHeaders(token) })
}

// Solo admin/profesor dueño del curso.
export function apiCreateLesson(courseId, payload, token) {
  return request(`/api/courses/${courseId}/lessons`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) })
}

export function apiUpdateLesson(id, payload, token) {
  return request(`/api/lessons/${id}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(payload) })
}

export function apiDeleteLesson(id, token) {
  return request(`/api/lessons/${id}`, { method: 'DELETE', headers: authHeaders(token) })
}

// Marca la lección como completada y devuelve el progreso ya recalculado
// del curso ({ completedLessonIds, lessonsCompleted, lessonsTotal, ... }).
export function apiCompleteLesson(lessonId, token) {
  return request(`/api/lessons/${lessonId}/complete`, { method: 'POST', headers: authHeaders(token) })
}

// Solo estudiante: { completedLessonIds, lessonsCompleted, lessonsTotal, ... }.
export function apiGetCourseProgress(courseId, token) {
  return request(`/api/courses/${courseId}/progress/me`, { headers: authHeaders(token) })
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

export function apiGetAssignments(courseId, token) {
  return request(`/api/courses/${courseId}/assignments`, { headers: authHeaders(token) })
}

export function apiCreateAssignment(courseId, payload, token) {
  return request(`/api/courses/${courseId}/assignments`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) })
}

export function apiUpdateAssignment(id, payload, token) {
  return request(`/api/assignments/${id}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(payload) })
}

export function apiDeleteAssignment(id, token) {
  return request(`/api/assignments/${id}`, { method: 'DELETE', headers: authHeaders(token) })
}

// ── Mensajería (estudiante ↔ profesor/admin, por curso) ──
export function apiSendMessage(courseId, toUserId, body, token) {
  return request(`/api/courses/${courseId}/messages`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify({ toUserId, body }) })
}

export function apiGetThread(courseId, otherUserId, token) {
  return request(`/api/courses/${courseId}/messages/${otherUserId}`, { headers: authHeaders(token) })
}

export function apiMarkThreadRead(courseId, otherUserId, token) {
  return request(`/api/courses/${courseId}/messages/${otherUserId}/read`, { method: 'PUT', headers: authHeaders(token) })
}

// Solo admin/profesor.
export function apiGetStaffConversations(token) {
  return request('/api/messages/staff-conversations', { headers: authHeaders(token) })
}

// Solo estudiante.
export function apiGetStudentConversations(token) {
  return request('/api/messages/student-conversations', { headers: authHeaders(token) })
}

// ── Certificaciones (constancia de que el admin ya contactó al estudiante) ──
// Solo admin. courseId/studentId opcionales filtran el historial.
export function apiGetCertifications(token, { courseId, studentId } = {}) {
  const params = new URLSearchParams()
  if (courseId) params.set('courseId', courseId)
  if (studentId) params.set('studentId', studentId)
  const query = params.toString()
  return request(`/api/certifications${query ? `?${query}` : ''}`, { headers: authHeaders(token) })
}

export function apiMarkCertification(studentId, courseId, token) {
  return request('/api/certifications', { method: 'POST', headers: authHeaders(token), body: JSON.stringify({ studentId, courseId }) })
}

export function apiUnmarkCertification(id, token) {
  return request(`/api/certifications/${id}`, { method: 'DELETE', headers: authHeaders(token) })
}

// ── Converge (blog) ──
// Lectura pública; crear/editar/borrar solo admin.
export function apiGetBlogPosts() {
  return request('/api/blog-posts')
}

// payload: { title, excerpt, publishedOn, imageUrl, author, phone, externalLink }
export function apiCreateBlogPost(payload, token) {
  return request('/api/blog-posts', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) })
}

export function apiUpdateBlogPost(id, payload, token) {
  return request(`/api/blog-posts/${id}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(payload) })
}

export function apiDeleteBlogPost(id, token) {
  return request(`/api/blog-posts/${id}`, { method: 'DELETE', headers: authHeaders(token) })
}

// ── PQRSF ──
// Radicar es público; si va con token, el ticket queda ligado a esa cuenta.
// payload: { ticketType, name, email, phone, subject, message }
export function apiCreatePqrsf(payload, token) {
  return request('/api/pqrsf-tickets', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) })
}

export function apiGetPqrsfTickets(token) {
  return request('/api/pqrsf-tickets', { headers: authHeaders(token) })
}

// status: 'Pendiente' | 'Revisando' ('Respondida' solo con apiRespondPqrsf).
export function apiChangePqrsfStatus(id, status, token) {
  return request(`/api/pqrsf-tickets/${id}/status`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify({ status }) })
}

export function apiRespondPqrsf(id, response, token) {
  return request(`/api/pqrsf-tickets/${id}/response`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify({ response }) })
}

export function apiMarkPqrsfRead(id, token) {
  return request(`/api/pqrsf-tickets/${id}/read`, { method: 'PUT', headers: authHeaders(token) })
}

// ── Servicios (/servicios) ──
// Lectura pública: solo los activos. El admin usa apiGetAllServices para ver
// también los inactivos.
export function apiGetServices() {
  return request('/api/services')
}

export function apiGetAllServices(token) {
  return request('/api/services/admin', { headers: authHeaders(token) })
}

// payload: { categoryId, title, description, heroImageUrl, active, locked, tabs }
// El slug lo genera el backend a partir del título.
export function apiCreateService(payload, token) {
  return request('/api/services', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) })
}

export function apiUpdateService(id, payload, token) {
  return request(`/api/services/${id}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(payload) })
}

// Los servicios con locked = true no se pueden borrar (el backend responde 400).
export function apiDeleteService(id, token) {
  return request(`/api/services/${id}`, { method: 'DELETE', headers: authHeaders(token) })
}

// Lectura pública (incluye inactivas, con `active`); el resto solo admin.
export function apiGetServiceCategories() {
  return request('/api/service-categories')
}

// payload: { name, active }
export function apiCreateServiceCategory(payload, token) {
  return request('/api/service-categories', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) })
}

export function apiUpdateServiceCategory(id, payload, token) {
  return request(`/api/service-categories/${id}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(payload) })
}

// Falla (400) si todavía hay servicios en esa categoría.
export function apiDeleteServiceCategory(id, token) {
  return request(`/api/service-categories/${id}`, { method: 'DELETE', headers: authHeaders(token) })
}

// ── Configuración del sitio (datos de contacto del footer) ──
// Lectura pública; guardar solo admin.
export function apiGetSiteSettings() {
  return request('/api/site-settings')
}

// payload: { phone, email, address, schedule }
export function apiUpdateSiteSettings(payload, token) {
  return request('/api/site-settings', { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(payload) })
}
