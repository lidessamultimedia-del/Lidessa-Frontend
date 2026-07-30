import { createContext, useContext, useState, useEffect } from 'react'
import {
  seedDirectory, seedCourses, seedTopics, seedLessons, seedAssignments, seedSubmissions, seedLessonProgress,
} from '../data/seed'

const LMSContext = createContext(null)
// v2: agrega Temas y nuevos campos de curso (publicación, fechas, formato, finalización).
// Se cambia la clave para que las sesiones con datos de la v1 (sin estos campos) reseeden en vez de quedar con forma incompleta.
const STORAGE_KEY = 'lidessa_lms_v2'

const defaultState = {
  directory: seedDirectory,
  courses: seedCourses,
  topics: seedTopics,
  lessons: seedLessons,
  assignments: seedAssignments,
  submissions: seedSubmissions,
  lessonProgress: seedLessonProgress,
}

export function LMSProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : defaultState
    } catch {
      return defaultState
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
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

  const { directory, courses, topics, lessons, assignments, submissions, lessonProgress } = state

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
    setState(s => ({
      ...s,
      courses: s.courses.filter(c => c.id !== id),
      topics: s.topics.filter(t => t.courseId !== id),
      lessons: s.lessons.filter(l => l.courseId !== id),
      assignments: s.assignments.filter(a => a.courseId !== id),
      submissions: s.submissions.filter(sub => !s.assignments.some(a => a.courseId === id && a.id === sub.assignmentId)),
      lessonProgress: s.lessonProgress.filter(p => p.courseId !== id),
    }))
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
    const assignment = { id: `a${Date.now()}`, courseId, maxScore: 100, ...data }
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
  const lessonsByCourse = courseId => lessons.filter(l => l.courseId === courseId).sort((a, b) => a.order - b.order)
  const assignmentsByCourse = courseId => assignments.filter(a => a.courseId === courseId)
  const submissionFor = (assignmentId, studentId) => submissions.find(sub => sub.assignmentId === assignmentId && sub.studentId === studentId) ?? null

  function progressForStudentCourse(studentId, courseId) {
    const total = lessonsByCourse(courseId).length
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
    ]
    return items.sort((x, y) => (x.item.order ?? 0) - (y.item.order ?? 0))
  }

  function courseCompletion(studentId, courseId) {
    const courseLessons = lessonsByCourse(courseId)
    const courseAssignments = assignmentsByCourse(courseId)
    const lessonStatus = courseLessons.map(l => ({
      kind: 'lesson', item: l,
      done: lessonProgress.some(p => p.studentId === studentId && p.lessonId === l.id),
    }))
    const assignmentStatus = courseAssignments.map(a => {
      const sub = submissionFor(a.id, studentId)
      return { kind: 'assignment', item: a, done: !!sub && sub.status !== 'draft' }
    })
    const all = [...lessonStatus, ...assignmentStatus]
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

  const value = {
    directory, courses, topics, lessons, assignments, submissions, lessonProgress,
    addDirectoryUser, updateDirectoryUser, toggleDirectoryUserActive, deleteDirectoryUser,
    addCourse, updateCourse, deleteCourse, enrollStudent, unenrollStudent,
    addTopic, updateTopic, deleteTopic,
    addLesson, updateLesson, deleteLesson, markLessonComplete,
    addAssignment, updateAssignment, deleteAssignment,
    submitAssignment, gradeSubmission,
    directoryById, teacherName, studentName,
    coursesByTeacher, coursesByStudent, lessonsByCourse, assignmentsByCourse, submissionFor,
    progressForStudentCourse, isLessonUnlocked,
    topicsByCourse, topicById, itemsByTopic, courseCompletion,
    submissionsPendingForTeacher, submissionsForTeacherCourse, gradesForStudent,
  }

  return <LMSContext.Provider value={value}>{children}</LMSContext.Provider>
}

export function useLMS() {
  const ctx = useContext(LMSContext)
  if (!ctx) throw new Error('useLMS must be used inside LMSProvider')
  return ctx
}
