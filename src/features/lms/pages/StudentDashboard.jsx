import { useState, useMemo, useEffect, useRef } from 'react'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useLMS, MAX_GRADE, PASS_THRESHOLD } from '@/features/lms/context/LMSContext'
import { useToast } from '@/shared/context/ToastContext'
import DashboardShell from '@/features/lms/components/DashboardShell'
import AnimatedCounter from '@/shared/components/AnimatedCounter'
import { downloadCsv } from '@/features/lms/utils/csv'
import { courseCardStyle } from '@/features/lms/utils/courseCard'
import {
  BarChart2, GraduationCap, ClipboardCheck, Check, Lock, BookOpen, FileText, Upload, Users, Download, MoreVertical,
  HelpCircle, Paperclip,
} from '@/shared/components/Icons'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
  { id: 'courses', label: 'Mis Cursos', icon: GraduationCap },
  { id: 'grades', label: 'Mis Calificaciones', icon: ClipboardCheck },
]

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  const datePart = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
  const hasTime = iso.includes('T') && !iso.endsWith('T00:00')
  return hasTime ? `${datePart}, ${d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}` : datePart
}

// Después de la fecha y hora límite, la actividad/examen deja de aparecerle
// al estudiante — a menos que ya la haya entregado/presentado (para que pueda
// seguir viendo su resultado).
function isStillVisible(kind, item, lms, studentId) {
  if (kind === 'lesson') return true
  if (new Date(item.dueDate) >= new Date()) return true
  return kind === 'assignment' ? !!lms.submissionFor(item.id, studentId) : !!lms.attemptFor(item.id, studentId)
}

function daysUntil(dateStr) {
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'Vencida'
  if (diff === 0) return 'Vence hoy'
  if (diff === 1) return 'Vence en 1 día'
  return `Vence en ${diff} días`
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const studentId = user.id
  const lms = useLMS()
  const { toast } = useToast()

  const [section, setSection] = useState('dashboard')
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [courseTab, setCourseTab] = useState('general')
  const [submitAssignmentId, setSubmitAssignmentId] = useState(null)
  const [openQuizId, setOpenQuizId] = useState(null)
  const [openCourseMenuId, setOpenCourseMenuId] = useState(null)

  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest('[data-course-menu]')) setOpenCourseMenuId(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const myCourses = lms.coursesByStudent(studentId)
  const selectedCourse = selectedCourseId ? lms.courses.find(c => c.id === selectedCourseId) : null

  const myAssignments = useMemo(() => {
    const courseIds = myCourses.map(c => c.id)
    return lms.assignments.filter(a => courseIds.includes(a.courseId)).filter(lms.isPublished)
  }, [myCourses, lms.assignments])

  const pendingAssignments = myAssignments.filter(a => new Date(a.dueDate) >= new Date()).filter(a => {
    const sub = lms.submissionFor(a.id, studentId)
    return !sub || sub.status === 'draft' || (sub.status === 'graded' && sub.grade < PASS_THRESHOLD)
  }).sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  const myQuizzes = useMemo(() => {
    const courseIds = myCourses.map(c => c.id)
    return lms.quizzes.filter(q => courseIds.includes(q.courseId)).filter(lms.isPublished)
  }, [myCourses, lms.quizzes])

  const pendingQuizzes = myQuizzes.filter(q => new Date(q.dueDate) >= new Date()).filter(q => {
    const attempt = lms.attemptFor(q.id, studentId)
    return !attempt || attempt.score < PASS_THRESHOLD
  }).sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  const gradesByCourse = lms.gradesForStudent(studentId)
  const overallGrades = gradesByCourse.flatMap(g => g.rows).filter(r => r.submission?.status === 'graded')
  const averageGrade = overallGrades.length
    ? Math.round((overallGrades.reduce((sum, r) => sum + r.submission.grade, 0) / overallGrades.length) * 10) / 10
    : 0
  const overallProgress = myCourses.length
    ? Math.round(myCourses.reduce((sum, c) => sum + lms.progressForStudentCourse(studentId, c.id).percent, 0) / myCourses.length)
    : 0

  function openCourseDetail(courseId, tab = 'general') {
    setSelectedCourseId(courseId)
    setCourseTab(tab)
    setSection('courseDetail')
  }

  function openSubmit(assignmentId) {
    setSubmitAssignmentId(assignmentId)
    setSection('submit')
  }

  function openQuiz(quizId) {
    setOpenQuizId(quizId)
    setSection('quiz')
  }

  function courseAverageGrade(courseId) {
    return lms.courseWeightedGrade(studentId, courseId).average
  }

  const submitAssignment = submitAssignmentId ? lms.assignments.find(a => a.id === submitAssignmentId) : null
  const submitCourse = submitAssignment ? lms.courses.find(c => c.id === submitAssignment.courseId) : null
  const submitExisting = submitAssignment ? lms.submissionFor(submitAssignment.id, studentId) : null

  const currentQuiz = openQuizId ? lms.quizzes.find(q => q.id === openQuizId) : null
  const currentQuizCourse = currentQuiz ? lms.courses.find(c => c.id === currentQuiz.courseId) : null
  const currentQuizAttempt = currentQuiz ? lms.attemptFor(currentQuiz.id, studentId) : null

  const sectionTitle = {
    dashboard: 'Panel del estudiante',
    courses: 'Mis cursos',
    courseDetail: selectedCourse?.name ?? 'Curso',
    submit: submitAssignment?.title ?? 'Entregar tarea',
    quiz: currentQuiz?.title ?? 'Examen',
    grades: 'Mis calificaciones',
  }[section]

  function handleExportGrades() {
    const headers = ['Curso', 'Tema', 'Actividad', 'Fecha', 'Nota']
    const rows = gradesByCourse.flatMap(({ course, rows: r }) =>
      r.map(({ assignment, submission }) => [
        course.name,
        lms.topicById(assignment.topicId)?.title ?? '—',
        assignment.title,
        submission?.status === 'graded' ? formatDate(submission.gradedAt) : '—',
        submission?.status === 'graded' ? `${submission.grade}/${assignment.maxScore}` : 'Pendiente',
      ]))
    downloadCsv(`mis-calificaciones-${user.name.replace(/\s+/g, '_')}.csv`, headers, rows)
  }

  return (
    <DashboardShell
      roleLabel="PANEL ESTUDIANTE"
      navItems={navItems}
      activeSection={['dashboard', 'courses', 'grades'].includes(section) ? section : (section === 'grades' ? 'grades' : 'courses')}
      onSectionChange={id => { setSection(id); setSelectedCourseId(null) }}
      title={sectionTitle}
      notifications={[
        ...pendingAssignments.map(a => ({
          id: a.id,
          icon: ClipboardCheck,
          text: `"${a.title}" — ${daysUntil(a.dueDate)}`,
          time: lms.courses.find(c => c.id === a.courseId)?.name ?? '',
          onClick: () => openSubmit(a.id),
          dueDate: a.dueDate,
        })),
        ...pendingQuizzes.map(q => ({
          id: q.id,
          icon: HelpCircle,
          text: `"${q.title}" — ${daysUntil(q.dueDate)}`,
          time: lms.courses.find(c => c.id === q.courseId)?.name ?? '',
          onClick: () => openQuiz(q.id),
          dueDate: q.dueDate,
        })),
      ].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5)}
    >
      {/* ── DASHBOARD ── */}
      {section === 'dashboard' && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <p className="text-2xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            Hola, {user.name.split(' ')[0]}
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Este es tu progreso en Lidessa Formación.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Mis Cursos', value: myCourses.length, icon: GraduationCap, color: '#005187' },
              { label: 'Actividades Pendientes', value: pendingAssignments.length + pendingQuizzes.length, icon: ClipboardCheck, color: '#d97706' },
              { label: 'Calificación Promedio', value: averageGrade, icon: BarChart2, color: '#7c3aed' },
              { label: 'Progreso General', value: overallProgress, suffix: '%', icon: Check, color: '#16a34a' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-5" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span style={{ color: s.color }}><s.icon size={26} /></span>
                  <AnimatedCounter target={s.value} suffix={s.suffix ?? ''} style={{ fontSize: 32, fontFamily: 'var(--font-display)', color: s.color, fontWeight: 900 }} />
                </div>
                <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>Mis cursos</h2>
          <div className="flex flex-wrap gap-3 mb-8">
            {myCourses.map(c => (
              <button key={c.id} onClick={() => openCourseDetail(c.id)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', borderLeft: `4px solid ${c.color ?? '#005187'}` }}>
                {c.name}
              </button>
            ))}
          </div>

          <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>Actividades próximas a vencer</h2>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {pendingAssignments.length === 0 && pendingQuizzes.length === 0 && (
              <p className="text-sm px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}>¡Estás al día! No tienes actividades pendientes.</p>
            )}
            {[
              ...pendingAssignments.map(a => ({ kind: 'assignment', item: a })),
              ...pendingQuizzes.map(q => ({ kind: 'quiz', item: q })),
            ].sort((x, y) => x.item.dueDate.localeCompare(y.item.dueDate)).slice(0, 6).map(({ kind, item }, i, arr) => (
              <div key={item.id} style={{ display: 'flex', gap: 12, padding: '14px 16px', alignItems: 'center', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--card)' }}>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{item.title}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{lms.courses.find(c => c.id === item.courseId)?.name} · {daysUntil(item.dueDate)}</p>
                </div>
                <button onClick={() => kind === 'assignment' ? openSubmit(item.id) : openQuiz(item.id)}
                  className="text-xs px-3 py-1.5 rounded-lg font-bold text-white shrink-0" style={{ backgroundColor: '#005187' }}>
                  {kind === 'assignment' ? 'Entregar' : 'Responder'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MIS CURSOS ── */}
      {section === 'courses' && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <h2 className="text-xl font-black mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Mis cursos</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myCourses.map((c, i) => {
              const progress = lms.progressForStudentCourse(studentId, c.id)
              const courseGrades = gradesByCourse.find(g => g.course.id === c.id)
              const menuOpen = openCourseMenuId === c.id
              return (
                <div key={c.id} className="rounded-xl overflow-hidden transition-shadow hover:shadow-md" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                  <button onClick={() => openCourseDetail(c.id)} className="block w-full text-left" style={{ height: 110, ...courseCardStyle(c, i) }} />
                  <div className="p-4">
                    <button onClick={() => openCourseDetail(c.id)}
                      className="font-bold text-sm mb-0.5 leading-snug text-left hover:underline"
                      style={{ fontFamily: 'var(--font-display)', color: '#005187' }}>
                      {c.name}
                    </button>
                    <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>{c.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{progress.percent}% completado</span>
                      <div className="relative" data-course-menu>
                        <button onClick={() => setOpenCourseMenuId(menuOpen ? null : c.id)}
                          className="p-1 rounded-lg transition-colors" style={{ color: 'var(--muted-foreground)' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                          aria-label="Más opciones">
                          <MoreVertical size={16} />
                        </button>
                        {menuOpen && (
                          <div className="absolute right-0 bottom-full mb-1.5 rounded-xl overflow-hidden z-20"
                            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 12px 32px rgba(0,0,0,0.15)', minWidth: 180, animation: 'fadeUp 0.15s ease' }}>
                            <button onClick={() => { openCourseDetail(c.id); setOpenCourseMenuId(null) }}
                              className="w-full text-left text-sm px-3.5 py-2.5 transition-colors" style={{ color: 'var(--foreground)' }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                              Ver curso
                            </button>
                            <button onClick={() => { setSection('grades'); setOpenCourseMenuId(null) }}
                              className="w-full text-left text-sm px-3.5 py-2.5 transition-colors" style={{ color: 'var(--foreground)' }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                              {courseGrades?.average != null ? `Calificación: ${courseGrades.average}/${MAX_GRADE}` : 'Ver calificaciones'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── DETALLE DE CURSO ── */}
      {section === 'courseDetail' && selectedCourse && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <button onClick={() => setSection('courses')} className="text-xs font-semibold mb-3" style={{ color: '#005187' }}>← Volver a mis cursos</button>

          <div className="rounded-xl overflow-hidden mb-5" style={{ border: '1px solid var(--border)' }}>
            <div style={{ height: 90, backgroundColor: selectedCourse.color ?? '#005187', display: 'flex', alignItems: 'flex-end', padding: 16 }}>
              <h2 className="text-xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>{selectedCourse.name}</h2>
            </div>
            <div className="p-4" style={{ backgroundColor: 'var(--card)' }}>
              <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>
                Profesor: {lms.teacherName(selectedCourse.teacherId)} | Categoría: {selectedCourse.category}
              </p>
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
                    <span>Progreso</span><span>{lms.progressForStudentCourse(studentId, selectedCourse.id).percent}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
                    <div style={{ width: `${lms.progressForStudentCourse(studentId, selectedCourse.id).percent}%`, height: '100%', backgroundColor: selectedCourse.color ?? '#005187' }} />
                  </div>
                </div>
                <p className="text-sm font-bold shrink-0" style={{ color: 'var(--foreground)' }}>
                  Calificación: {gradesByCourse.find(g => g.course.id === selectedCourse.id)?.average != null
                    ? `${gradesByCourse.find(g => g.course.id === selectedCourse.id).average}/${MAX_GRADE}` : 'Sin calificar'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-1 mb-5 rounded-xl p-1" style={{ backgroundColor: 'var(--muted)', width: 'fit-content' }}>
            {[
              { id: 'general', label: 'General', icon: FileText },
              { id: 'content', label: 'Contenido', icon: BookOpen },
              { id: 'participants', label: 'Participantes', icon: Users },
            ].map(t => (
              <button key={t.id} onClick={() => setCourseTab(t.id)}
                className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
                style={{ backgroundColor: courseTab === t.id ? 'var(--card)' : 'transparent', color: courseTab === t.id ? '#005187' : 'var(--muted-foreground)' }}>
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>

          {courseTab === 'general' && (
            <div>
              <h3 className="text-sm font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Descripción</h3>
              <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>{selectedCourse.description}</p>

              <h3 className="text-sm font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Información del curso</h3>
              <div className="rounded-xl overflow-hidden mb-5" style={{ border: '1px solid var(--border)' }}>
                {[
                  ['Fecha de inicio', formatDate(selectedCourse.startDate)],
                  ['Fecha de conclusión', formatDate(selectedCourse.endDate)],
                  ['Estudiantes inscritos', selectedCourse.studentIds.length],
                  ['Calificación promedio del curso', courseAverageGrade(selectedCourse.id) != null ? `${courseAverageGrade(selectedCourse.id)}/${MAX_GRADE}` : 'Sin datos aún'],
                  ['Lecciones', lms.lessonsByCourse(selectedCourse.id).filter(lms.isPublished).length],
                ].map(([label, value], i) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--card)' }}>
                    <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{value}</span>
                  </div>
                ))}
              </div>

              <h3 className="text-sm font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Próximas actividades</h3>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {(() => {
                  const notExpired = item => new Date(item.dueDate) >= new Date()
                  const pendingCourseAssignments = lms.assignmentsByCourse(selectedCourse.id).filter(lms.isPublished).filter(notExpired).filter(a => {
                    const sub = lms.submissionFor(a.id, studentId)
                    return !sub || sub.status === 'draft' || (sub.status === 'graded' && sub.grade < PASS_THRESHOLD)
                  })
                  const pendingCourseQuizzes = lms.quizzesByCourse(selectedCourse.id).filter(lms.isPublished).filter(notExpired).filter(q => {
                    const attempt = lms.attemptFor(q.id, studentId)
                    return !attempt || attempt.score < PASS_THRESHOLD
                  })
                  const rows = [
                    ...pendingCourseAssignments.map(a => ({ kind: 'assignment', item: a })),
                    ...pendingCourseQuizzes.map(q => ({ kind: 'quiz', item: q })),
                  ].sort((x, y) => x.item.dueDate.localeCompare(y.item.dueDate))
                  if (rows.length === 0) {
                    return <p className="text-sm px-4 py-4 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}>No tienes actividades pendientes en este curso.</p>
                  }
                  return rows.map(({ kind, item }, i, arr) => (
                    <div key={item.id} style={{ display: 'flex', gap: 12, padding: '12px 16px', alignItems: 'center', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--card)' }}>
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{item.title}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{daysUntil(item.dueDate)}</p>
                      </div>
                      <button onClick={() => kind === 'assignment' ? openSubmit(item.id) : openQuiz(item.id)}
                        className="text-xs px-3 py-1.5 rounded-lg font-bold text-white shrink-0" style={{ backgroundColor: '#005187' }}>
                        {kind === 'assignment' ? 'Ir a la tarea →' : 'Ir al examen →'}
                      </button>
                    </div>
                  ))
                })()}
              </div>
            </div>
          )}

          {courseTab === 'content' && (
            <div>
              {lms.topicsByCourse(selectedCourse.id).map((topic, ti) => {
                const publishedItems = lms.itemsByTopic(topic.id)
                  .filter(({ item }) => lms.isPublished(item))
                  .filter(({ kind, item }) => isStillVisible(kind, item, lms, studentId))
                return (
                <div key={topic.id} className="mb-5">
                  <h4 className="text-sm font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                    {selectedCourse.format === 'weekly' ? 'Semana' : 'Tema'} {ti + 1}: {topic.title}
                  </h4>
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    {publishedItems.map(({ kind, item }, i, arr) => (
                      <div key={item.id} style={{ display: 'flex', gap: 12, padding: '12px 16px', alignItems: 'center', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--card)' }}>
                        {kind === 'lesson' ? (
                          <LessonRow lms={lms} studentId={studentId} course={selectedCourse} lesson={item} onToast={toast} />
                        ) : kind === 'assignment' ? (
                          <AssignmentRow lms={lms} studentId={studentId} assignment={item} onSubmit={openSubmit} />
                        ) : (
                          <QuizRow lms={lms} studentId={studentId} quiz={item} onOpen={openQuiz} />
                        )}
                      </div>
                    ))}
                    {publishedItems.length === 0 && <p className="text-sm px-4 py-4 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}>Sin contenido en este tema todavía.</p>}
                  </div>
                </div>
                )
              })}
              {lms.topicsByCourse(selectedCourse.id).length === 0 && (
                <p className="text-sm px-4 py-6 text-center rounded-xl" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                  El profesor aún no ha publicado contenido en este curso.
                </p>
              )}
            </div>
          )}

          {courseTab === 'participants' && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <div style={{ padding: '12px 16px', backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{lms.teacherName(selectedCourse.teacherId)}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Profesor</p>
              </div>
              {selectedCourse.studentIds.map(id => lms.directoryById(id)).filter(Boolean).map((s, i, arr) => (
                <div key={s.id} style={{ padding: '12px 16px', backgroundColor: 'var(--card)', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{s.name}{s.id === studentId ? ' (Tú)' : ''}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Estudiante</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ENVIAR TAREA ── */}
      {section === 'submit' && submitAssignment && (
        <SubmitAssignmentForm
          assignment={submitAssignment}
          course={submitCourse}
          existing={submitExisting}
          onCancel={() => setSection('courseDetail')}
          onSubmit={(data, draft) => {
            lms.submitAssignment({ assignmentId: submitAssignment.id, studentId, ...data, draft })
            toast('success', draft ? 'Borrador guardado' : 'Tarea enviada', submitAssignment.title)
            setSection('courseDetail')
          }}
        />
      )}

      {/* ── RESPONDER EXAMEN ── */}
      {section === 'quiz' && currentQuiz && (
        <QuizAttemptForm
          quiz={currentQuiz}
          course={currentQuizCourse}
          existingAttempt={currentQuizAttempt}
          studentId={studentId}
          onCancel={() => setSection('courseDetail')}
          onSubmit={answers => {
            const score = lms.submitQuizAttempt({ quizId: currentQuiz.id, studentId, answers })
            toast('success', 'Examen entregado', `${currentQuiz.title} — ${score}/${MAX_GRADE}`)
          }}
          onTimeUp={() => toast('warning', 'Se acabó el tiempo', 'Tu examen se entregó automáticamente con las respuestas que tenías.')}
        />
      )}

      {/* ── MIS CALIFICACIONES ── */}
      {section === 'grades' && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Mis calificaciones</h2>
            <div className="flex gap-2">
              <button onClick={handleExportGrades}
                className="text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                <Download size={13} /> Descargar CSV
              </button>
              <button onClick={() => window.print()}
                className="text-xs px-3 py-1.5 rounded-lg font-bold" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                Imprimir / PDF
              </button>
            </div>
          </div>
          {gradesByCourse.map(({ course, rows, average }) => {
            const byTopic = {}
            rows.forEach(r => {
              const key = r.assignment.topicId ?? 'none'
              if (!byTopic[key]) byTopic[key] = []
              byTopic[key].push(r)
            })
            return (
              <div key={course.id} className="mb-6">
                <h3 className="font-bold text-sm mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                  {course.name} {average != null && <span style={{ color: '#005187' }}>(Promedio: {average})</span>}
                </h3>
                {Object.entries(byTopic).map(([topicId, topicRows]) => (
                  <div key={topicId} className="mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--muted-foreground)' }}>
                      {topicId === 'none' ? 'Sin tema' : lms.topicById(topicId)?.title}
                    </p>
                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '8px 16px', backgroundColor: 'var(--muted)' }}>
                        {['Actividad', 'Fecha', 'Nota'].map(h => (
                          <span key={h} className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{h}</span>
                        ))}
                      </div>
                      {topicRows.map(({ assignment, submission }) => (
                        <div key={assignment.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 16px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
                          <span className="text-sm" style={{ color: 'var(--foreground)' }}>{assignment.title}</span>
                          <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{submission?.status === 'graded' ? formatDate(submission.gradedAt) : '—'}</span>
                          <span className="text-sm font-bold" style={{ color: submission?.status === 'graded' ? '#16a34a' : 'var(--muted-foreground)' }}>
                            {submission?.status === 'graded' ? `${submission.grade}/${assignment.maxScore}` : '⏳'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </DashboardShell>
  )
}

function LessonRow({ lms, studentId, course, lesson, onToast }) {
  const done = lms.lessonProgress.some(p => p.studentId === studentId && p.lessonId === lesson.id)
  const unlocked = lms.isLessonUnlocked(studentId, course.id, lesson.id)
  return (
    <>
      <span style={{ color: done ? '#16a34a' : unlocked ? 'var(--muted-foreground)' : '#9ca3af' }}>
        {done ? <Check size={18} /> : unlocked ? <BookOpen size={18} /> : <Lock size={18} />}
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: unlocked ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{lesson.title}</p>
        {done && <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Completada</p>}
        {!done && unlocked && <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{lesson.content}</p>}
        {!unlocked && <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Bloqueada — completa la lección anterior</p>}
        {unlocked && lesson.fileName && (
          <a href={lesson.fileData} download={lesson.fileName}
            className="text-xs flex items-center gap-1 mt-0.5 w-fit" style={{ color: '#005187' }}>
            <Paperclip size={11} /> {lesson.fileName}
          </a>
        )}
      </div>
      {unlocked && !done && (
        <button onClick={() => { lms.markLessonComplete(studentId, course.id, lesson.id); onToast('success', 'Lección completada', lesson.title) }}
          className="text-xs px-3 py-1.5 rounded-lg font-bold text-white shrink-0" style={{ backgroundColor: '#005187' }}>
          Empezar Lección
        </button>
      )}
    </>
  )
}

function AssignmentRow({ lms, studentId, assignment, onSubmit }) {
  const sub = lms.submissionFor(assignment.id, studentId)
  const passed = sub?.status === 'graded' && sub.grade >= PASS_THRESHOLD
  const expired = new Date(assignment.dueDate) < new Date()
  return (
    <>
      <span style={{ color: '#7c3aed' }}><FileText size={18} /></span>
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{assignment.title}</p>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Vence: {formatDate(assignment.dueDate)}</p>
        {assignment.fileName && (
          <a href={assignment.fileData} download={assignment.fileName}
            className="text-xs flex items-center gap-1 mt-0.5 w-fit" style={{ color: '#7c3aed' }}>
            <Paperclip size={11} /> {assignment.fileName}
          </a>
        )}
      </div>
      {sub?.status === 'graded' && (
        <span className="text-xs px-3 py-1.5 rounded-full font-bold shrink-0"
          style={{ backgroundColor: passed ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)', color: passed ? '#16a34a' : '#dc2626' }}>
          {passed ? 'Aprobada' : 'No aprobada'} · {sub.grade}/{assignment.maxScore}
        </span>
      )}
      {sub?.status === 'submitted' && (
        <span className="text-xs px-3 py-1.5 rounded-full font-bold shrink-0" style={{ backgroundColor: 'rgba(0,81,135,0.1)', color: '#005187' }}>Enviada</span>
      )}
      {!passed && sub?.status !== 'submitted' && !expired && (
        <button onClick={() => onSubmit(assignment.id)} className="text-xs px-3 py-1.5 rounded-lg font-bold text-white shrink-0" style={{ backgroundColor: '#005187' }}>
          {sub?.status === 'draft' ? 'Continuar' : sub?.status === 'graded' ? 'Reintentar' : 'Entregar'}
        </button>
      )}
    </>
  )
}

function QuizRow({ lms, studentId, quiz, onOpen }) {
  const attempt = lms.attemptFor(quiz.id, studentId)
  const passed = attempt && attempt.score >= PASS_THRESHOLD
  const expired = new Date(quiz.dueDate) < new Date()
  return (
    <>
      <span style={{ color: '#d97706' }}><HelpCircle size={18} /></span>
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{quiz.title}</p>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Vence: {formatDate(quiz.dueDate)} · {quiz.questions?.length ?? 0} preguntas{quiz.timeLimitMinutes ? ` · ${quiz.timeLimitMinutes} min` : ''}
        </p>
      </div>
      {attempt && (
        <span className="text-xs px-3 py-1.5 rounded-full font-bold shrink-0"
          style={{ backgroundColor: passed ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)', color: passed ? '#16a34a' : '#dc2626' }}>
          {passed ? 'Aprobado' : 'No aprobado'} · {attempt.score}/{MAX_GRADE}
        </span>
      )}
      {!passed && !expired && (
        <button onClick={() => onOpen(quiz.id)} className="text-xs px-3 py-1.5 rounded-lg font-bold text-white shrink-0" style={{ backgroundColor: '#005187' }}>
          {attempt ? 'Reintentar' : 'Responder'}
        </button>
      )}
    </>
  )
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function QuizAttemptForm({ quiz, course, existingAttempt, studentId, onSubmit, onCancel, onTimeUp }) {
  const locked = existingAttempt && existingAttempt.score >= PASS_THRESHOLD
  const [answers, setAnswers] = useState(() => quiz.questions.map(q => q.type === 'open' ? '' : null))
  const [error, setError] = useState('')
  const answersRef = useRef(answers)
  answersRef.current = answers

  const timeLimitMs = quiz.timeLimitMinutes ? quiz.timeLimitMinutes * 60 * 1000 : null
  const startKey = `lidessa_quiz_start_${quiz.id}_${studentId}`
  const [remainingMs, setRemainingMs] = useState(() => {
    if (!timeLimitMs || locked) return null
    let startedAt = localStorage.getItem(startKey)
    if (!startedAt) {
      startedAt = Date.now().toString()
      localStorage.setItem(startKey, startedAt)
    }
    return Math.max(0, timeLimitMs - (Date.now() - Number(startedAt)))
  })

  useEffect(() => {
    if (remainingMs === null) return
    if (remainingMs <= 0) {
      localStorage.removeItem(startKey)
      onSubmit(answersRef.current)
      onTimeUp?.()
      onCancel()
      return
    }
    const id = setInterval(() => {
      setRemainingMs(ms => {
        if (ms === null || ms > 1000) return ms === null ? ms : ms - 1000
        clearInterval(id)
        localStorage.removeItem(startKey)
        onSubmit(answersRef.current)
        onTimeUp?.()
        onCancel()
        return 0
      })
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (locked) {
    return (
      <div style={{ animation: 'fadeUp 0.4s ease', maxWidth: 640 }}>
        <button onClick={onCancel} className="text-xs font-semibold mb-3" style={{ color: '#005187' }}>← Volver</button>
        <h2 className="text-xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>{quiz.title}</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>{course?.name}</p>
        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-sm font-bold mb-1" style={{ color: '#16a34a' }}>Ya aprobaste este examen</p>
          <p className="text-sm" style={{ color: 'var(--foreground)' }}>Tu calificación: <strong>{existingAttempt.score}/{MAX_GRADE}</strong></p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Entregado: {formatDate(existingAttempt.submittedAt)}</p>
        </div>
      </div>
    )
  }

  function handleSubmit() {
    const missing = quiz.questions.some((q, i) => q.type === 'open' ? !answers[i]?.trim() : answers[i] === null)
    if (missing) { setError('Responde todas las preguntas antes de entregar.'); return }
    setError('')
    localStorage.removeItem(startKey)
    onSubmit(answers)
    onCancel()
  }

  return (
    <div style={{ animation: 'fadeUp 0.4s ease', maxWidth: 640 }}>
      <button onClick={onCancel} className="text-xs font-semibold mb-3" style={{ color: '#005187' }}>← Volver</button>
      <div className="flex items-start justify-between gap-3 mb-1">
        <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>{quiz.title}</h2>
        {remainingMs !== null && (
          <span className="text-sm font-black px-3 py-1 rounded-lg shrink-0"
            style={{ backgroundColor: remainingMs < 5 * 60 * 1000 ? 'rgba(220,38,38,0.12)' : 'rgba(217,119,6,0.12)', color: remainingMs < 5 * 60 * 1000 ? '#dc2626' : '#d97706' }}>
            ⏱ {formatCountdown(remainingMs)}
          </span>
        )}
      </div>
      <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>{course?.name}</p>

      <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
        <p className="text-sm mb-2" style={{ color: 'var(--foreground)' }}>{quiz.description}</p>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Fecha límite: {formatDate(quiz.dueDate)} · {daysUntil(quiz.dueDate)}
          {quiz.timeLimitMinutes ? ` · Tienes ${quiz.timeLimitMinutes} minutos desde que abres el examen` : ''} · Se califica automáticamente al entregar
        </p>
      </div>

      {existingAttempt && !locked && (
        <p className="text-xs px-3 py-2 rounded-lg mb-4" style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: '#dc2626' }}>
          Tu intento anterior fue {existingAttempt.score}/{MAX_GRADE} (no aprobado). Este intento reemplaza al anterior.
        </p>
      )}

      <div className="space-y-4">
        {quiz.questions.map((q, qi) => (
          <div key={q.id} className="rounded-xl p-4" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>{qi + 1}. {q.text}</p>
            {q.type === 'open' ? (
              <textarea rows={4} value={answers[qi] ?? ''}
                onChange={e => { const v = e.target.value; setAnswers(a => a.map((val, i) => i === qi ? v : val)); setError('') }}
                placeholder="Escribe tu respuesta…"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
            ) : (
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <label key={oi} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--foreground)' }}>
                    <input type="radio" name={`q-${q.id}`} checked={answers[qi] === oi}
                      onChange={() => { setAnswers(a => a.map((v, i) => i === qi ? oi : v)); setError('') }} />
                    {opt}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        {error && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: '#dc2626' }}>⚠ {error}</p>
        )}
        <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(217,119,6,0.1)', color: '#d97706' }}>
          ⚠ Una vez entregado no podrás cambiar tus respuestas.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>Cancelar</button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#005187' }}>
            Entregar Examen
          </button>
        </div>
      </div>
    </div>
  )
}

function SubmitAssignmentForm({ assignment, course, existing, onSubmit, onCancel }) {
  const [file, setFile] = useState(null)
  const [textResponse, setTextResponse] = useState(existing?.textResponse ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [confirmed, setConfirmed] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const hasFile = !!(file || existing?.fileName)

  function handle(draft) {
    if (!draft && !hasFile && !textResponse.trim()) {
      setSubmitError('Adjunta un archivo o escribe una respuesta antes de entregar.')
      return
    }
    setSubmitError('')
    onSubmit({
      fileName: file?.name ?? existing?.fileName ?? '',
      fileSize: file?.size ?? existing?.fileSize ?? 0,
      textResponse, notes,
    }, draft)
  }

  return (
    <div style={{ animation: 'fadeUp 0.4s ease', maxWidth: 640 }}>
      <button onClick={onCancel} className="text-xs font-semibold mb-3" style={{ color: '#005187' }}>← Volver</button>
      <h2 className="text-xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Enviar: {assignment.title}</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>{course?.name}</p>

      <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
        <p className="text-sm mb-2" style={{ color: 'var(--foreground)' }}>{assignment.description}</p>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Fecha límite: {formatDate(assignment.dueDate)} · {daysUntil(assignment.dueDate)} · Calificación máxima: {assignment.maxScore} pts</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Cargar archivo (PDF, DOC, DOCX)</label>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
            <Upload size={16} style={{ color: 'var(--muted-foreground)' }} />
            <input type="file" accept=".pdf,.doc,.docx" onChange={e => { setFile(e.target.files?.[0] ?? null); setConfirmed(false); setSubmitError('') }} className="text-sm" style={{ color: 'var(--foreground)' }} />
          </div>
          {hasFile && <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Archivo actual: {file?.name ?? existing?.fileName}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>O escribir respuesta</label>
          <textarea rows={6} value={textResponse} onChange={e => { setTextResponse(e.target.value); setSubmitError('') }}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
            style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Observaciones (opcional)</label>
          <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
            style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
        </div>
        {hasFile && (
          <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground)' }}>
            <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
            Confirmar envío
          </label>
        )}
        {submitError && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: '#dc2626' }}>
            ⚠ {submitError}
          </p>
        )}
        <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(217,119,6,0.1)', color: '#d97706' }}>
          ⚠ Una vez entregues no podrás hacer cambios visibles como pendiente. Revisa bien antes de enviar.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>Cancelar</button>
          <button onClick={() => handle(true)} className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ border: '1px solid var(--border)', color: '#005187' }}>Guardar borrador</button>
          <button onClick={() => handle(false)} disabled={hasFile && !confirmed}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ backgroundColor: '#005187' }}>
            Entregar Tarea
          </button>
        </div>
      </div>
    </div>
  )
}
