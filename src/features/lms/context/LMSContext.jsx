import { createContext, useContext, useState, useEffect } from 'react'
import {
  seedDirectory, seedCourses, seedTopics, seedLessons, seedAssignments, seedSubmissions, seedLessonProgress,
  seedQuizzes, seedQuizAttempts,
} from '../data/seed'
import { useToast } from '@/shared/context/ToastContext'
import { useAuth } from '@/features/auth/context/AuthContext'

const LMSContext = createContext(null)
// v6: calificaciones pasan de escala 0-100 a escala 0-10 (con decimales), y el
// examen pesa el doble que una actividad en la nota final ponderada del curso.
// Se cambia la clave para que las sesiones con datos de v1-v5 reseeden.
const STORAGE_KEY = 'lidessa_lms_v6'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

// Escala de calificación: 0-10 con un decimal. El examen pesa el doble que
// una actividad en el promedio ponderado del curso; se aprueba con 8.0 o más.
export const MAX_GRADE = 10
export const PASS_THRESHOLD = 8
export const ASSIGNMENT_WEIGHT = 1
export const QUIZ_WEIGHT = 2

const defaultDocumentTypes = [
  { name: 'Cédula de ciudadanía' },
  { name: 'Cédula de extranjería' },
  { name: 'Pasaporte' },
  { name: 'Tarjeta de identidad' },
]

const defaultState = {
  directory: seedDirectory,
  courses: seedCourses,
  topics: seedTopics,
  lessons: seedLessons,
  assignments: seedAssignments,
  submissions: seedSubmissions,
  lessonProgress: seedLessonProgress,
  quizzes: seedQuizzes,
  quizAttempts: seedQuizAttempts,
  documentTypes: defaultDocumentTypes,
  messages: [],
  // El certificado se entrega presencial — aquí solo se deja constancia de
  // que el admin ya se puso en contacto con el estudiante que terminó el
  // curso, para no mostrárselo de nuevo en la lista de "por contactar".
  certifications: [],
}

export function LMSProvider({ children }) {
  const { toast } = useToast()
  const { registeredStudents, allUsers } = useAuth()
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      // Se fusiona con defaultState para que, si se agrega una clave nueva más
      // adelante (como `messages`), las sesiones ya guardadas no se rompan por
      // no tenerla — simplemente arrancan con el valor por defecto de esa clave.
      return stored ? { ...defaultState, ...JSON.parse(stored) } : defaultState
    } catch {
      return defaultState
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (err) {
      console.error('No se pudo guardar el LMS en localStorage:', err)
      toast('error', 'No se pudo guardar', 'El almacenamiento del navegador está lleno (probablemente por imágenes muy pesadas). El cambio se ve en pantalla pero no quedó guardado — usa una imagen más liviana o borra alguna existente.')
    }
  }, [state])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return
      try {
        setState(JSON.parse(e.newValue))
      } catch {
        // ignore malformed data from another tab
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const { directory, courses, topics, lessons, assignments, submissions, lessonProgress, quizzes, quizAttempts, documentTypes, messages, certifications } = state

  // Red de seguridad: el registro público (Register.jsx) agrega al estudiante
  // aquí en el mismo paso en que crea su cuenta, pero si esa llamada puntual
  // se pierde por cualquier motivo (recarga a mitad de camino, HMR, etc.), la
  // cuenta queda "huérfana" — existe para iniciar sesión pero es invisible
  // para el admin (no aparece en Estudiantes ni se puede inscribir en cursos).
  // Esto reconcilia automáticamente: cualquier cuenta con rol estudiante que
  // no esté todavía en el directorio se agrega sola.
  useEffect(() => {
    const directoryEmails = new Set(directory.map(u => u.email.toLowerCase()))
    const missing = registeredStudents.filter(s => !directoryEmails.has(s.email.toLowerCase()))
    if (missing.length === 0) return
    setState(s => ({
      ...s,
      directory: [
        ...missing.map(s => ({
          id: s.id, name: s.name, email: s.email, phone: s.phone ?? '',
          role: 'estudiante', active: true, joined: todayISO(),
        })),
        ...s.directory,
      ],
    }))
  }, [registeredStudents, directory])

  // ── Directory (profesores / estudiantes) ──
  function addDirectoryUser(data) {
    const user = { id: `u${Date.now()}`, active: true, joined: new Date().toISOString().slice(0, 10), ...data }
    setState(s => ({ ...s, directory: [user, ...s.directory] }))
    return user
  }
  function updateDirectoryUser(id, data) {
    setState(s => ({ ...s, directory: s.directory.map(u => u.id === id ? { ...u, ...data } : u) }))
  }
  function toggleDirectoryUserActive(id) {
    setState(s => ({ ...s, directory: s.directory.map(u => u.id === id ? { ...u, active: !u.active } : u) }))
  }
  function deleteDirectoryUser(id) {
    setState(s => ({
      ...s,
      directory: s.directory.filter(u => u.id !== id),
      courses: s.courses.map(c => {
        const next = c.studentIds.includes(id) ? { ...c, studentIds: c.studentIds.filter(sid => sid !== id) } : c
        return next.teacherId === id ? { ...next, teacherId: null } : next
      }),
      submissions: s.submissions.filter(sub => sub.studentId !== id),
      quizAttempts: s.quizAttempts.filter(a => a.studentId !== id),
      lessonProgress: s.lessonProgress.filter(p => p.studentId !== id),
      messages: s.messages.filter(m => m.fromId !== id && m.toId !== id),
      certifications: s.certifications.filter(c => c.studentId !== id),
    }))
  }

  // ── Tipos de documento (configurables desde Configuración) ──
  function addDocumentType(name) {
    const clean = name.trim()
    if (!clean) return
    setState(s => s.documentTypes.some(d => d.name.toLowerCase() === clean.toLowerCase())
      ? s
      : { ...s, documentTypes: [...s.documentTypes, { name: clean }] })
  }
  function updateDocumentType(oldName, newName) {
    const clean = newName.trim()
    if (!clean || clean === oldName) return
    setState(s => {
      if (s.documentTypes.some(d => d.name.toLowerCase() === clean.toLowerCase() && d.name !== oldName)) return s
      return {
        ...s,
        documentTypes: s.documentTypes.map(d => d.name === oldName ? { name: clean } : d),
        directory: s.directory.map(u => u.documentType === oldName ? { ...u, documentType: clean } : u),
      }
    })
  }
  function deleteDocumentType(name) {
    setState(s => ({ ...s, documentTypes: s.documentTypes.filter(d => d.name !== name) }))
  }

  // ── Courses ──
  function addCourse(data) {
    const course = { id: `c${Date.now()}`, studentIds: [], createdAt: new Date().toISOString().slice(0, 10), ...data }
    setState(s => ({ ...s, courses: [course, ...s.courses] }))
    return course
  }
  function updateCourse(id, data) {
    setState(s => ({ ...s, courses: s.courses.map(c => c.id === id ? { ...c, ...data } : c) }))
  }
  function deleteCourse(id) {
    setState(s => {
      const courseQuizIds = s.quizzes.filter(q => q.courseId === id).map(q => q.id)
      return {
        ...s,
        courses: s.courses.filter(c => c.id !== id),
        topics: s.topics.filter(t => t.courseId !== id),
        lessons: s.lessons.filter(l => l.courseId !== id),
        assignments: s.assignments.filter(a => a.courseId !== id),
        submissions: s.submissions.filter(sub => !s.assignments.some(a => a.courseId === id && a.id === sub.assignmentId)),
        lessonProgress: s.lessonProgress.filter(p => p.courseId !== id),
        quizzes: s.quizzes.filter(q => q.courseId !== id),
        quizAttempts: s.quizAttempts.filter(a => !courseQuizIds.includes(a.quizId)),
      }
    })
  }
  // Devuelve 'ok', 'already-enrolled' o 'full' — el llamador decide qué avisarle
  // al admin. La capacidad se valida acá (no solo en el formulario del curso)
  // para que sea imposible pasarse del cupo sin importar desde dónde se inscriba.
  function enrollStudent(courseId, studentId) {
    const course = courses.find(c => c.id === courseId)
    if (!course) return 'not-found'
    if (course.studentIds.includes(studentId)) return 'already-enrolled'
    if (course.capacity && course.studentIds.length >= course.capacity) return 'full'
    setState(s => ({
      ...s,
      courses: s.courses.map(c => c.id === courseId && !c.studentIds.includes(studentId)
        ? { ...c, studentIds: [...c.studentIds, studentId] } : c),
    }))
    return 'ok'
  }
  function unenrollStudent(courseId, studentId) {
    setState(s => ({
      ...s,
      courses: s.courses.map(c => c.id === courseId ? { ...c, studentIds: c.studentIds.filter(id => id !== studentId) } : c),
    }))
  }

  // ── Topics ──
  function addTopic(courseId, data) {
    const order = topics.filter(t => t.courseId === courseId).length + 1
    const topic = { id: `t${Date.now()}`, courseId, order, ...data }
    setState(s => ({ ...s, topics: [...s.topics, topic] }))
    return topic
  }
  function updateTopic(id, data) {
    setState(s => ({ ...s, topics: s.topics.map(t => t.id === id ? { ...t, ...data } : t) }))
  }
  function deleteTopic(id) {
    setState(s => ({
      ...s,
      topics: s.topics.filter(t => t.id !== id),
      lessons: s.lessons.map(l => l.topicId === id ? { ...l, topicId: null } : l),
      assignments: s.assignments.map(a => a.topicId === id ? { ...a, topicId: null } : a),
      quizzes: s.quizzes.map(q => q.topicId === id ? { ...q, topicId: null } : q),
    }))
  }

  // ── Lessons ──
  function addLesson(courseId, data) {
    const order = lessons.filter(l => l.courseId === courseId).length + 1
    const lesson = { id: `l${Date.now()}`, courseId, order, ...data }
    setState(s => ({ ...s, lessons: [...s.lessons, lesson] }))
    return lesson
  }
  function updateLesson(id, data) {
    setState(s => ({ ...s, lessons: s.lessons.map(l => l.id === id ? { ...l, ...data } : l) }))
  }
  function deleteLesson(id) {
    setState(s => ({ ...s, lessons: s.lessons.filter(l => l.id !== id) }))
  }
  function markLessonComplete(studentId, courseId, lessonId) {
    setState(s => {
      if (s.lessonProgress.some(p => p.studentId === studentId && p.lessonId === lessonId)) return s
      return { ...s, lessonProgress: [...s.lessonProgress, { studentId, courseId, lessonId, completedAt: new Date().toISOString() }] }
    })
  }

  // ── Assignments ──
  function addAssignment(courseId, data) {
    const assignment = { id: `a${Date.now()}`, courseId, maxScore: MAX_GRADE, ...data }
    setState(s => ({ ...s, assignments: [...s.assignments, assignment] }))
    return assignment
  }
  function updateAssignment(id, data) {
    setState(s => ({ ...s, assignments: s.assignments.map(a => a.id === id ? { ...a, ...data } : a) }))
  }
  function deleteAssignment(id) {
    setState(s => ({
      ...s,
      assignments: s.assignments.filter(a => a.id !== id),
      submissions: s.submissions.filter(sub => sub.assignmentId !== id),
    }))
  }

  // ── Cuestionarios (exámenes autocalificados) ──
  function addQuiz(courseId, data) {
    const quiz = { id: `q${Date.now()}`, courseId, questions: [], ...data }
    setState(s => ({ ...s, quizzes: [...s.quizzes, quiz] }))
    return quiz
  }
  function updateQuiz(id, data) {
    setState(s => ({ ...s, quizzes: s.quizzes.map(q => q.id === id ? { ...q, ...data } : q) }))
  }
  function deleteQuiz(id) {
    setState(s => ({
      ...s,
      quizzes: s.quizzes.filter(q => q.id !== id),
      quizAttempts: s.quizAttempts.filter(a => a.quizId !== id),
    }))
  }
  function submitQuizAttempt({ quizId, studentId, answers }) {
    const quiz = quizzes.find(q => q.id === quizId)
    // Las preguntas de respuesta abierta no se autocalifican — solo cuentan
    // las de selección múltiple para la nota automática. Si el examen tiene
    // alguna pregunta abierta, el intento queda pendiente de revisión manual
    // hasta que el profesor la lea y ajuste la nota final.
    const hasOpen = quiz.questions.some(q => q.type === 'open')
    const gradable = quiz.questions.map((q, i) => ({ q, i })).filter(({ q }) => q.type !== 'open')
    const correct = gradable.filter(({ q, i }) => answers[i] === q.correctIndex).length
    const score = gradable.length ? Math.round((correct / gradable.length) * MAX_GRADE * 10) / 10 : 0
    setState(s => ({
      ...s,
      // Un nuevo intento reemplaza el anterior — así un estudiante que reprobó
      // puede reintentar sin dejar intentos viejos regados. `retryAllowed` se
      // resetea: cada reintento hay que volver a autorizarlo.
      quizAttempts: [
        ...s.quizAttempts.filter(a => !(a.quizId === quizId && a.studentId === studentId)),
        { id: `qa${Date.now()}`, quizId, studentId, answers, score, feedback: '', reviewed: !hasOpen, retryAllowed: false, submittedAt: new Date().toISOString() },
      ],
    }))
    return score
  }

  // El profesor lee las respuestas abiertas y ajusta la nota final del intento.
  function reviewQuizAttempt(attemptId, score, feedback, retryAllowed = false) {
    setState(s => ({
      ...s,
      quizAttempts: s.quizAttempts.map(a => a.id === attemptId ? { ...a, score, feedback, reviewed: true, seen: false, retryAllowed } : a),
    }))
  }
  // El profesor autoriza puntualmente que el estudiante reintente una
  // actividad o examen ya reprobado, sin tener que volver a calificarlo.
  function allowRetry(kind, id) {
    setState(s => (
      kind === 'assignment'
        ? { ...s, submissions: s.submissions.map(sub => sub.id === id ? { ...sub, retryAllowed: true } : sub) }
        : { ...s, quizAttempts: s.quizAttempts.map(a => a.id === id ? { ...a, retryAllowed: true } : a) }
    ))
  }

  // ── Mensajes (estudiante ↔ profesor, por curso) ──
  function sendMessage({ courseId, fromId, toId, body }) {
    const msg = { id: `msg${Date.now()}`, courseId, fromId, toId, body, createdAt: new Date().toISOString(), read: false }
    setState(s => ({ ...s, messages: [...s.messages, msg] }))
    return msg
  }
  function threadMessages(courseId, userA, userB) {
    return messages
      .filter(m => m.courseId === courseId && (
        (m.fromId === userA && m.toId === userB) || (m.fromId === userB && m.toId === userA)
      ))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }
  function markThreadRead(courseId, readerId, otherId) {
    setState(s => ({
      ...s,
      messages: s.messages.map(m => (m.courseId === courseId && m.toId === readerId && m.fromId === otherId && !m.read) ? { ...m, read: true } : m),
    }))
  }
  function unreadMessageCount(userId) {
    return messages.filter(m => m.toId === userId && !m.read).length
  }
  // Agrupa los mensajes del profesor en conversaciones (una por curso+estudiante).
  // Conversaciones de un miembro del staff (profesor O admin) con estudiantes.
  // No se restringe a "mis cursos" — se arma directamente de los mensajes en
  // los que participó, así sirve igual para el profesor de un curso que para
  // el admin (que no es profesor de ninguno).
  function staffConversations(staffId) {
    const relevant = messages.filter(m => m.fromId === staffId || m.toId === staffId)
    const byKey = {}
    relevant.forEach(m => {
      const studentId = m.fromId === staffId ? m.toId : m.fromId
      const key = `${m.courseId}_${studentId}`
      if (!byKey[key] || m.createdAt > byKey[key].lastMessage.createdAt) {
        byKey[key] = { courseId: m.courseId, studentId, lastMessage: m }
      }
    })
    return Object.values(byKey)
      .map(c => ({ ...c, unreadCount: relevant.filter(m => m.courseId === c.courseId && m.fromId === c.studentId && m.toId === staffId && !m.read).length }))
      .sort((a, b) => b.lastMessage.createdAt.localeCompare(a.lastMessage.createdAt))
  }
  // Una conversación por curso inscrito, por cada persona con la que puede
  // escribirse (su profesor y el admin) — así siempre puede iniciar aunque
  // todavía no haya ningún mensaje con esa persona.
  function studentConversations(studentId) {
    const adminId = allUsers.find(u => u.role === 'admin')?.id
    return coursesByStudent(studentId).flatMap(course => {
      const parties = [...new Set([course.teacherId, adminId].filter(Boolean))]
      return parties.map(otherId => {
        const thread = threadMessages(course.id, studentId, otherId)
        const lastMessage = thread.length ? thread[thread.length - 1] : null
        const unreadCount = thread.filter(m => m.toId === studentId && !m.read).length
        return { course, otherId, lastMessage, unreadCount }
      })
    }).sort((a, b) => {
      if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount
      const at = a.lastMessage?.createdAt ?? ''
      const bt = b.lastMessage?.createdAt ?? ''
      return bt.localeCompare(at)
    })
  }
  function unreadMessagesForUser(userId) {
    return messages.filter(m => m.toId === userId && !m.read)
  }
  // Calificaciones que el estudiante todavía no ha visto (para la campanita).
  function unseenGradesForStudent(studentId) {
    const subs = submissions
      .filter(sub => sub.studentId === studentId && sub.status === 'graded' && sub.seen === false)
      .map(sub => ({ kind: 'assignment', id: sub.id, item: assignments.find(a => a.id === sub.assignmentId), grade: sub.grade, gradedAt: sub.gradedAt }))
    const atts = quizAttempts
      .filter(a => a.studentId === studentId && a.reviewed && a.seen === false)
      .map(a => ({ kind: 'quiz', id: a.id, item: quizzes.find(q => q.id === a.quizId), grade: a.score, gradedAt: a.submittedAt }))
    return [...subs, ...atts].filter(x => x.item)
  }

  // ── Submissions ──
  function submitAssignment({ assignmentId, studentId, fileName = '', fileData = '', fileSize = 0, textResponse = '', notes = '', draft = false }) {
    setState(s => {
      const existing = s.submissions.find(sub => sub.assignmentId === assignmentId && sub.studentId === studentId)
      const payload = {
        fileName, fileData, fileSize, textResponse, notes,
        status: draft ? 'draft' : 'submitted',
        submittedAt: draft ? (existing?.submittedAt ?? null) : new Date().toISOString(),
        // Cada envío consume el permiso de reintento — para volver a
        // intentarlo el profesor tiene que autorizarlo de nuevo.
        ...(draft ? {} : { retryAllowed: false }),
      }
      if (existing) {
        return { ...s, submissions: s.submissions.map(sub => sub.id === existing.id ? { ...sub, ...payload } : sub) }
      }
      const submission = { id: `sub${Date.now()}`, assignmentId, studentId, grade: null, feedback: '', gradedAt: null, retryAllowed: false, ...payload }
      return { ...s, submissions: [...s.submissions, submission] }
    })
  }
  function gradeSubmission(id, grade, feedback, retryAllowed = false) {
    setState(s => ({
      ...s,
      submissions: s.submissions.map(sub => sub.id === id
        ? { ...sub, grade, feedback, status: 'graded', gradedAt: new Date().toISOString(), seen: false, retryAllowed } : sub),
    }))
  }
  function markGradeSeen(kind, id) {
    setState(s => (
      kind === 'assignment'
        ? { ...s, submissions: s.submissions.map(sub => sub.id === id ? { ...sub, seen: true } : sub) }
        : { ...s, quizAttempts: s.quizAttempts.map(a => a.id === id ? { ...a, seen: true } : a) }
    ))
  }

  // ── Selectores (funciones simples, dataset pequeño así que no hace falta memoizar) ──
  // Cae a la cuenta de acceso (AuthContext) cuando el id no está en el
  // directorio del LMS — el admin nunca tuvo ficha ahí (solo profesores y
  // estudiantes), así que sin este fallback su nombre/foto saldrían vacíos
  // en cualquier vista que muestre "quién" hizo algo (ej. un mensaje suyo).
  const directoryById = id => directory.find(u => u.id === id) ?? allUsers.find(u => u.id === id)
  const teacherName = id => directoryById(id)?.name ?? 'Sin asignar'
  const studentName = id => directoryById(id)?.name ?? 'Estudiante'
  const coursesByTeacher = teacherId => courses.filter(c => c.teacherId === teacherId)
  const coursesByStudent = studentId => courses.filter(c => c.studentIds.includes(studentId))
  const listedCourses = courses.filter(c => c.listed)
  const publicCourses = courses.filter(c => c.listed && c.published)
  const isPublished = item => !!item?.publishAt && item.publishAt <= todayISO()
  // Una tarea/examen sin `assignedStudentIds` (o vacío) es para todo el curso —
  // si trae la lista, solo cuenta/aparece para esos estudiantes puntuales.
  const isAssignedTo = (item, studentId) => !item?.assignedStudentIds?.length || item.assignedStudentIds.includes(studentId)
  const lessonsByCourse = courseId => lessons.filter(l => l.courseId === courseId).sort((a, b) => a.order - b.order)
  const assignmentsByCourse = courseId => assignments.filter(a => a.courseId === courseId)
  const submissionFor = (assignmentId, studentId) => submissions.find(sub => sub.assignmentId === assignmentId && sub.studentId === studentId) ?? null
  const quizzesByCourse = courseId => quizzes.filter(q => q.courseId === courseId)
  const attemptFor = (quizId, studentId) => quizAttempts.find(a => a.quizId === quizId && a.studentId === studentId) ?? null

  // El progreso suma tareas y exámenes — el material de apoyo (lecciones)
  // no cuenta, porque es solo contenido de referencia para el estudiante,
  // no algo que se aprueba. Una tarea/examen solo cuenta como avance cuando
  // está aprobado (nota >= PASS_THRESHOLD), así que el progreso es
  // individual por estudiante y no todos avanzan igual aunque hayan
  // entregado lo mismo.
  function progressForStudentCourse(studentId, courseId) {
    const courseAssignments = assignmentsByCourse(courseId).filter(isPublished).filter(a => isAssignedTo(a, studentId))
    const courseQuizzes = quizzesByCourse(courseId).filter(isPublished).filter(q => isAssignedTo(q, studentId))
    const assignmentsDone = courseAssignments.filter(a => {
      const sub = submissionFor(a.id, studentId)
      return sub?.status === 'graded' && sub.grade >= PASS_THRESHOLD
    }).length
    const quizzesDone = courseQuizzes.filter(q => {
      const attempt = attemptFor(q.id, studentId)
      return !!attempt && attempt.reviewed !== false && attempt.score >= PASS_THRESHOLD
    }).length
    const completed = assignmentsDone + quizzesDone
    const total = courseAssignments.length + courseQuizzes.length
    return { completed, total, percent: total ? Math.round((completed / total) * 100) : 0 }
  }

  function isLessonUnlocked(studentId, courseId, lessonId) {
    const course = courses.find(c => c.id === courseId)
    if (course && course.completionTrackingEnabled === false) return true
    const list = lessonsByCourse(courseId).filter(isPublished)
    const idx = list.findIndex(l => l.id === lessonId)
    if (idx <= 0) return true
    const prev = list[idx - 1]
    return lessonProgress.some(p => p.studentId === studentId && p.lessonId === prev.id)
  }

  const topicsByCourse = courseId => topics.filter(t => t.courseId === courseId).sort((a, b) => a.order - b.order)
  const topicById = id => topics.find(t => t.id === id)

  function itemsByTopic(topicId) {
    const items = [
      ...lessons.filter(l => l.topicId === topicId).map(l => ({ kind: 'lesson', item: l })),
      ...assignments.filter(a => a.topicId === topicId).map(a => ({ kind: 'assignment', item: a })),
      ...quizzes.filter(q => q.topicId === topicId).map(q => ({ kind: 'quiz', item: q })),
    ]
    return items.sort((x, y) => (x.item.order ?? 0) - (y.item.order ?? 0))
  }

  function courseCompletion(studentId, courseId) {
    const courseLessons = lessonsByCourse(courseId).filter(isPublished)
    const courseAssignments = assignmentsByCourse(courseId).filter(isPublished).filter(a => isAssignedTo(a, studentId))
    const courseQuizzes = quizzesByCourse(courseId).filter(isPublished).filter(q => isAssignedTo(q, studentId))
    const lessonStatus = courseLessons.map(l => ({
      kind: 'lesson', item: l,
      done: lessonProgress.some(p => p.studentId === studentId && p.lessonId === l.id),
    }))
    const assignmentStatus = courseAssignments.map(a => {
      const sub = submissionFor(a.id, studentId)
      return { kind: 'assignment', item: a, done: !!sub && sub.status !== 'draft' }
    })
    const quizStatus = courseQuizzes.map(q => ({
      kind: 'quiz', item: q, done: !!attemptFor(q.id, studentId),
    }))
    const all = [...lessonStatus, ...assignmentStatus, ...quizStatus]
    const completed = all.filter(x => x.done).length
    return { items: all, completed, total: all.length, complete: all.length > 0 && completed === all.length }
  }

  function submissionsPendingForTeacher(teacherId) {
    const teacherCourseIds = coursesByTeacher(teacherId).map(c => c.id)
    const teacherAssignmentIds = assignments.filter(a => teacherCourseIds.includes(a.courseId)).map(a => a.id)
    return submissions.filter(sub => teacherAssignmentIds.includes(sub.assignmentId) && sub.status === 'submitted')
  }

  function submissionsForTeacherCourse(courseId) {
    const courseAssignmentIds = assignments.filter(a => a.courseId === courseId).map(a => a.id)
    return submissions.filter(sub => courseAssignmentIds.includes(sub.assignmentId))
  }

  // Intentos de examen con al menos una pregunta de respuesta abierta que el
  // profesor todavía no ha leído/calificado manualmente.
  function quizAttemptsPendingReview(teacherId) {
    const teacherCourseIds = coursesByTeacher(teacherId).map(c => c.id)
    const openQuizIds = quizzes
      .filter(q => teacherCourseIds.includes(q.courseId) && q.questions.some(qq => qq.type === 'open'))
      .map(q => q.id)
    return quizAttempts.filter(a => openQuizIds.includes(a.quizId) && !a.reviewed)
  }

  // Incluye tareas Y exámenes (antes solo mostraba tareas), y el promedio ya
  // usa la misma fórmula ponderada que ve el profesor (examen pesa el doble).
  function gradesForStudent(studentId) {
    return coursesByStudent(studentId).map(course => {
      const assignmentRows = assignmentsByCourse(course.id).filter(isPublished).filter(a => isAssignedTo(a, studentId)).map(a => {
        const sub = submissionFor(a.id, studentId)
        return {
          kind: 'assignment', item: a, topicId: a.topicId,
          graded: sub?.status === 'graded', grade: sub?.status === 'graded' ? sub.grade : null,
          maxScore: a.maxScore, gradedAt: sub?.gradedAt ?? null,
        }
      })
      const quizRows = quizzesByCourse(course.id).filter(isPublished).filter(q => isAssignedTo(q, studentId)).map(q => {
        const attempt = attemptFor(q.id, studentId)
        return {
          kind: 'quiz', item: q, topicId: q.topicId,
          graded: !!attempt, grade: attempt?.score ?? null,
          maxScore: MAX_GRADE, gradedAt: attempt?.submittedAt ?? null,
        }
      })
      const rows = [...assignmentRows, ...quizRows]
      const wg = courseWeightedGrade(studentId, course.id)
      return { course, rows, average: wg.average, allGraded: wg.allGraded, passed: wg.passed }
    })
  }

  // Nota final ponderada: cada examen pesa el doble que una actividad.
  // `allGraded` solo es true cuando el curso tiene contenido y todo está calificado —
  // eso es lo que determina si ya se puede decidir si el estudiante aprobó o no.
  function courseWeightedGrade(studentId, courseId) {
    const asg = assignmentsByCourse(courseId).filter(isPublished).filter(a => isAssignedTo(a, studentId))
    const qz = quizzesByCourse(courseId).filter(isPublished).filter(q => isAssignedTo(q, studentId))
    const asgGrades = asg.map(a => {
      const sub = submissionFor(a.id, studentId)
      return sub?.status === 'graded' ? sub.grade : null
    })
    // Si el examen tiene preguntas abiertas sin revisar todavía, no cuenta
    // como calificado — la nota podría cambiar cuando el profesor la revise.
    const qzGrades = qz.map(q => {
      const attempt = attemptFor(q.id, studentId)
      return attempt && attempt.reviewed !== false ? attempt.score : null
    })

    let weightedSum = 0
    let totalWeight = 0
    asgGrades.forEach(g => { if (g != null) { weightedSum += g * ASSIGNMENT_WEIGHT; totalWeight += ASSIGNMENT_WEIGHT } })
    qzGrades.forEach(g => { if (g != null) { weightedSum += g * QUIZ_WEIGHT; totalWeight += QUIZ_WEIGHT } })

    const average = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : null
    const allGraded = (asg.length > 0 || qz.length > 0) && asgGrades.every(g => g != null) && qzGrades.every(g => g != null)
    return { average, allGraded, passed: allGraded && average != null && average >= PASS_THRESHOLD }
  }

  // El certificado se entrega presencial, así que aquí no se genera ni se
  // envía nada — esto solo le avisa al admin quién ya terminó y aprobó el
  // curso, con sus datos de contacto, para que lo llame/escriba.
  function studentsReadyToCertify() {
    const results = []
    courses.forEach(course => {
      course.studentIds.forEach(studentId => {
        const already = certifications.some(c => c.studentId === studentId && c.courseId === course.id)
        if (already) return
        const grade = courseWeightedGrade(studentId, course.id)
        if (!grade.passed) return
        const courseGrades = gradesForStudent(studentId).find(g => g.course.id === course.id)
        const completedAt = (courseGrades?.rows ?? [])
          .map(r => r.gradedAt)
          .filter(Boolean)
          .sort()
          .at(-1) ?? null
        results.push({ studentId, courseId: course.id, course, student: directoryById(studentId), average: grade.average, completedAt })
      })
    })
    return results
  }

  function markCertified(studentId, courseId) {
    setState(s => ({
      ...s,
      certifications: [...s.certifications, { id: `cert_${Date.now()}`, studentId, courseId, markedAt: new Date().toISOString() }],
    }))
  }

  // Por si el admin marcó "contactado" por error — lo regresa a la lista de
  // pendientes por contactar.
  function unmarkCertified(id) {
    setState(s => ({ ...s, certifications: s.certifications.filter(c => c.id !== id) }))
  }

  function certifiedHistory() {
    return certifications
      .map(c => ({ ...c, course: courses.find(co => co.id === c.courseId), student: directoryById(c.studentId) }))
      .sort((a, b) => (b.markedAt ?? '').localeCompare(a.markedAt ?? ''))
  }

  const value = {
    directory, courses, topics, lessons, assignments, submissions, lessonProgress, quizzes, quizAttempts, documentTypes,
    addDirectoryUser, updateDirectoryUser, toggleDirectoryUserActive, deleteDirectoryUser,
    addDocumentType, updateDocumentType, deleteDocumentType,
    addCourse, updateCourse, deleteCourse, enrollStudent, unenrollStudent,
    addTopic, updateTopic, deleteTopic,
    addLesson, updateLesson, deleteLesson, markLessonComplete,
    addAssignment, updateAssignment, deleteAssignment,
    addQuiz, updateQuiz, deleteQuiz, submitQuizAttempt,
    submitAssignment, gradeSubmission,
    directoryById, teacherName, studentName,
    coursesByTeacher, coursesByStudent, listedCourses, publicCourses, isPublished, isAssignedTo, lessonsByCourse, assignmentsByCourse, submissionFor,
    quizzesByCourse, attemptFor,
    progressForStudentCourse, isLessonUnlocked,
    topicsByCourse, topicById, itemsByTopic, courseCompletion,
    submissionsPendingForTeacher, submissionsForTeacherCourse, gradesForStudent, courseWeightedGrade,
    reviewQuizAttempt, quizAttemptsPendingReview, allowRetry,
    sendMessage, threadMessages, markThreadRead, unreadMessageCount, staffConversations,
    studentConversations, unreadMessagesForUser, unseenGradesForStudent, markGradeSeen,
    certifications, studentsReadyToCertify, markCertified, unmarkCertified, certifiedHistory,
  }

  return <LMSContext.Provider value={value}>{children}</LMSContext.Provider>
}

export function useLMS() {
  const ctx = useContext(LMSContext)
  if (!ctx) throw new Error('useLMS must be used inside LMSProvider')
  return ctx
}
