import { createContext, useContext, useState, useEffect } from 'react'
import {
  seedDirectory, seedCourses, seedTopics, seedLessons, seedAssignments, seedSubmissions, seedLessonProgress,
  seedQuizzes, seedQuizAttempts,
} from '../data/seed'
import { useToast } from '@/shared/context/ToastContext'

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
}

export function LMSProvider({ children }) {
  const { toast } = useToast()
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : defaultState
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

  const { directory, courses, topics, lessons, assignments, submissions, lessonProgress, quizzes, quizAttempts } = state

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
    setState(s => ({ ...s, directory: s.directory.filter(u => u.id !== id) }))
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
  function enrollStudent(courseId, studentId) {
    setState(s => ({
      ...s,
      courses: s.courses.map(c => c.id === courseId && !c.studentIds.includes(studentId)
        ? { ...c, studentIds: [...c.studentIds, studentId] } : c),
    }))
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
    // las de selección múltiple para la nota automática.
    const gradable = quiz.questions.map((q, i) => ({ q, i })).filter(({ q }) => q.type !== 'open')
    const correct = gradable.filter(({ q, i }) => answers[i] === q.correctIndex).length
    const score = gradable.length ? Math.round((correct / gradable.length) * MAX_GRADE * 10) / 10 : 0
    setState(s => ({
      ...s,
      // Un nuevo intento reemplaza el anterior — así un estudiante que reprobó
      // puede reintentar sin dejar intentos viejos regados.
      quizAttempts: [
        ...s.quizAttempts.filter(a => !(a.quizId === quizId && a.studentId === studentId)),
        { id: `qa${Date.now()}`, quizId, studentId, answers, score, submittedAt: new Date().toISOString() },
      ],
    }))
    return score
  }

  // ── Submissions ──
  function submitAssignment({ assignmentId, studentId, fileName = '', fileSize = 0, textResponse = '', notes = '', draft = false }) {
    setState(s => {
      const existing = s.submissions.find(sub => sub.assignmentId === assignmentId && sub.studentId === studentId)
      const payload = {
        fileName, fileSize, textResponse, notes,
        status: draft ? 'draft' : 'submitted',
        submittedAt: draft ? (existing?.submittedAt ?? null) : new Date().toISOString(),
      }
      if (existing) {
        return { ...s, submissions: s.submissions.map(sub => sub.id === existing.id ? { ...sub, ...payload } : sub) }
      }
      const submission = { id: `sub${Date.now()}`, assignmentId, studentId, grade: null, feedback: '', gradedAt: null, ...payload }
      return { ...s, submissions: [...s.submissions, submission] }
    })
  }
  function gradeSubmission(id, grade, feedback) {
    setState(s => ({
      ...s,
      submissions: s.submissions.map(sub => sub.id === id
        ? { ...sub, grade, feedback, status: 'graded', gradedAt: new Date().toISOString() } : sub),
    }))
  }

  // ── Selectores (funciones simples, dataset pequeño así que no hace falta memoizar) ──
  const directoryById = id => directory.find(u => u.id === id)
  const teacherName = id => directoryById(id)?.name ?? 'Sin asignar'
  const studentName = id => directoryById(id)?.name ?? 'Estudiante'
  const coursesByTeacher = teacherId => courses.filter(c => c.teacherId === teacherId)
  const coursesByStudent = studentId => courses.filter(c => c.studentIds.includes(studentId))
  const listedCourses = courses.filter(c => c.listed)
  const publicCourses = courses.filter(c => c.listed && c.published)
  const isPublished = item => !!item?.publishAt && item.publishAt <= todayISO()
  const lessonsByCourse = courseId => lessons.filter(l => l.courseId === courseId).sort((a, b) => a.order - b.order)
  const assignmentsByCourse = courseId => assignments.filter(a => a.courseId === courseId)
  const submissionFor = (assignmentId, studentId) => submissions.find(sub => sub.assignmentId === assignmentId && sub.studentId === studentId) ?? null
  const quizzesByCourse = courseId => quizzes.filter(q => q.courseId === courseId)
  const attemptFor = (quizId, studentId) => quizAttempts.find(a => a.quizId === quizId && a.studentId === studentId) ?? null

  function progressForStudentCourse(studentId, courseId) {
    const total = lessonsByCourse(courseId).filter(isPublished).length
    const completed = lessonProgress.filter(p => p.studentId === studentId && p.courseId === courseId).length
    return { completed, total, percent: total ? Math.round((completed / total) * 100) : 0 }
  }

  function isLessonUnlocked(studentId, courseId, lessonId) {
    const course = courses.find(c => c.id === courseId)
    if (course && course.completionTrackingEnabled === false) return true
    const list = lessonsByCourse(courseId)
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
    const courseAssignments = assignmentsByCourse(courseId).filter(isPublished)
    const courseQuizzes = quizzesByCourse(courseId).filter(isPublished)
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

  function gradesForStudent(studentId) {
    return coursesByStudent(studentId).map(course => {
      const courseAssignments = assignmentsByCourse(course.id)
      const rows = courseAssignments.map(a => ({
        assignment: a,
        submission: submissionFor(a.id, studentId),
      }))
      const graded = rows.filter(r => r.submission?.status === 'graded')
      const average = graded.length
        ? Math.round((graded.reduce((sum, r) => sum + r.submission.grade, 0) / graded.length) * 10) / 10
        : null
      return { course, rows, average }
    })
  }

  // Nota final ponderada: cada examen pesa el doble que una actividad.
  // `allGraded` solo es true cuando el curso tiene contenido y todo está calificado —
  // eso es lo que determina si ya se puede decidir si el estudiante aprobó o no.
  function courseWeightedGrade(studentId, courseId) {
    const asg = assignmentsByCourse(courseId).filter(isPublished)
    const qz = quizzesByCourse(courseId).filter(isPublished)
    const asgGrades = asg.map(a => {
      const sub = submissionFor(a.id, studentId)
      return sub?.status === 'graded' ? sub.grade : null
    })
    const qzGrades = qz.map(q => attemptFor(q.id, studentId)?.score ?? null)

    let weightedSum = 0
    let totalWeight = 0
    asgGrades.forEach(g => { if (g != null) { weightedSum += g * ASSIGNMENT_WEIGHT; totalWeight += ASSIGNMENT_WEIGHT } })
    qzGrades.forEach(g => { if (g != null) { weightedSum += g * QUIZ_WEIGHT; totalWeight += QUIZ_WEIGHT } })

    const average = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : null
    const allGraded = asg.length > 0 && qz.length > 0 && asgGrades.every(g => g != null) && qzGrades.every(g => g != null)
    return { average, allGraded, passed: allGraded && average != null && average >= PASS_THRESHOLD }
  }

  const value = {
    directory, courses, topics, lessons, assignments, submissions, lessonProgress, quizzes, quizAttempts,
    addDirectoryUser, updateDirectoryUser, toggleDirectoryUserActive, deleteDirectoryUser,
    addCourse, updateCourse, deleteCourse, enrollStudent, unenrollStudent,
    addTopic, updateTopic, deleteTopic,
    addLesson, updateLesson, deleteLesson, markLessonComplete,
    addAssignment, updateAssignment, deleteAssignment,
    addQuiz, updateQuiz, deleteQuiz, submitQuizAttempt,
    submitAssignment, gradeSubmission,
    directoryById, teacherName, studentName,
    coursesByTeacher, coursesByStudent, listedCourses, publicCourses, isPublished, lessonsByCourse, assignmentsByCourse, submissionFor,
    quizzesByCourse, attemptFor,
    progressForStudentCourse, isLessonUnlocked,
    topicsByCourse, topicById, itemsByTopic, courseCompletion,
    submissionsPendingForTeacher, submissionsForTeacherCourse, gradesForStudent, courseWeightedGrade,
  }

  return <LMSContext.Provider value={value}>{children}</LMSContext.Provider>
}

export function useLMS() {
  const ctx = useContext(LMSContext)
  if (!ctx) throw new Error('useLMS must be used inside LMSProvider')
  return ctx
}
