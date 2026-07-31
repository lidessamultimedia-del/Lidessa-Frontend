import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useLMS } from '@/features/lms/context/LMSContext'
import { useToast } from '@/shared/context/ToastContext'
import DashboardShell from '@/features/lms/components/DashboardShell'
import AnimatedCounter from '@/shared/components/AnimatedCounter'
import { downloadCsv } from '@/features/lms/utils/csv'
import {
  BarChart2, GraduationCap, ClipboardCheck, Check, Lock, BookOpen, FileText, Upload, Users, Download, MoreVertical,
} from '@/shared/components/Icons'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
  { id: 'courses', label: 'Mis Cursos', icon: GraduationCap },
  { id: 'grades', label: 'Mis Calificaciones', icon: ClipboardCheck },
]

// Tarjetas de "Mis cursos" al estilo Moodle: en vez de una foto de portada
// (que no tenemos por curso), se genera un patrón geométrico sobre el color
// del curso — variando el patrón según la posición para que la grilla no se
// vea repetitiva.
const COURSE_CARD_PATTERNS = [
  { backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.16) 0 2px, transparent 2px 16px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.16) 0 2px, transparent 2px 16px)' },
  { backgroundImage: 'radial-gradient(rgba(255,255,255,0.28) 2px, transparent 2.5px)', backgroundSize: '18px 18px' },
  { backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.14) 0 1px, transparent 1px 18px), repeating-linear-gradient(90deg, rgba(255,255,255,0.14) 0 1px, transparent 1px 18px)' },
  { backgroundImage: 'repeating-conic-gradient(rgba(255,255,255,0.18) 0% 25%, transparent 0% 50%)', backgroundSize: '26px 26px' },
  { backgroundImage: 'radial-gradient(circle at 25% 30%, rgba(255,255,255,0.3) 0, transparent 45%), radial-gradient(circle at 75% 70%, rgba(255,255,255,0.24) 0, transparent 45%)' },
]

function courseCardStyle(course, i) {
  if (course.image) {
    return { backgroundImage: `url(${course.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  }
  return { backgroundColor: course.color ?? '#005187', ...COURSE_CARD_PATTERNS[i % COURSE_CARD_PATTERNS.length] }
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
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
    return lms.assignments.filter(a => courseIds.includes(a.courseId))
  }, [myCourses, lms.assignments])

  const pendingAssignments = myAssignments.filter(a => {
    const sub = lms.submissionFor(a.id, studentId)
    return !sub || sub.status !== 'submitted' && sub.status !== 'graded'
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

  function courseAverageGrade(courseId) {
    const graded = lms.assignmentsByCourse(courseId)
      .flatMap(a => lms.submissions.filter(s => s.assignmentId === a.id && s.status === 'graded'))
    if (!graded.length) return null
    return Math.round((graded.reduce((sum, s) => sum + s.grade, 0) / graded.length) * 10) / 10
  }

  const submitAssignment = submitAssignmentId ? lms.assignments.find(a => a.id === submitAssignmentId) : null
  const submitCourse = submitAssignment ? lms.courses.find(c => c.id === submitAssignment.courseId) : null
  const submitExisting = submitAssignment ? lms.submissionFor(submitAssignment.id, studentId) : null

  const sectionTitle = {
    dashboard: 'Panel del estudiante',
    courses: 'Mis cursos',
    courseDetail: selectedCourse?.name ?? 'Curso',
    submit: submitAssignment?.title ?? 'Entregar tarea',
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
      notifications={pendingAssignments.slice(0, 5).map(a => ({
        icon: ClipboardCheck,
        text: `"${a.title}" — ${daysUntil(a.dueDate)}`,
        time: lms.courses.find(c => c.id === a.courseId)?.name ?? '',
      }))}
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
              { label: 'Tareas Pendientes', value: pendingAssignments.length, icon: ClipboardCheck, color: '#d97706' },
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

          <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>Tareas próximas a vencer</h2>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {pendingAssignments.length === 0 && (
              <p className="text-sm px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}>¡Estás al día! No tienes tareas pendientes.</p>
            )}
            {pendingAssignments.slice(0, 6).map((a, i, arr) => (
              <div key={a.id} style={{ display: 'flex', gap: 12, padding: '14px 16px', alignItems: 'center', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--card)' }}>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{a.title}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{lms.courses.find(c => c.id === a.courseId)?.name} · {daysUntil(a.dueDate)}</p>
                </div>
                <button onClick={() => openSubmit(a.id)}
                  className="text-xs px-3 py-1.5 rounded-lg font-bold text-white shrink-0" style={{ backgroundColor: '#005187' }}>
                  Entregar
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
                              {courseGrades?.average != null ? `Calificación: ${courseGrades.average}/100` : 'Ver calificaciones'}
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
                    ? `${gradesByCourse.find(g => g.course.id === selectedCourse.id).average}/100` : 'Sin calificar'}
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
                  ['Calificación promedio del curso', courseAverageGrade(selectedCourse.id) != null ? `${courseAverageGrade(selectedCourse.id)}/100` : 'Sin datos aún'],
                  ['Lecciones', lms.lessonsByCourse(selectedCourse.id).length],
                ].map(([label, value], i) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--card)' }}>
                    <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{value}</span>
                  </div>
                ))}
              </div>

              <h3 className="text-sm font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Próximas actividades</h3>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {lms.assignmentsByCourse(selectedCourse.id).filter(a => {
                  const sub = lms.submissionFor(a.id, studentId)
                  return !sub || (sub.status !== 'submitted' && sub.status !== 'graded')
                }).map((a, i, arr) => (
                  <div key={a.id} style={{ display: 'flex', gap: 12, padding: '12px 16px', alignItems: 'center', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--card)' }}>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{a.title}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{daysUntil(a.dueDate)}</p>
                    </div>
                    <button onClick={() => openSubmit(a.id)} className="text-xs px-3 py-1.5 rounded-lg font-bold text-white shrink-0" style={{ backgroundColor: '#005187' }}>Ir a la tarea →</button>
                  </div>
                ))}
                {lms.assignmentsByCourse(selectedCourse.id).every(a => { const sub = lms.submissionFor(a.id, studentId); return sub?.status === 'submitted' || sub?.status === 'graded' }) && (
                  <p className="text-sm px-4 py-4 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}>No tienes actividades pendientes en este curso.</p>
                )}
              </div>
            </div>
          )}

          {courseTab === 'content' && (
            <div>
              {lms.topicsByCourse(selectedCourse.id).map((topic, ti) => (
                <div key={topic.id} className="mb-5">
                  <h4 className="text-sm font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                    {selectedCourse.format === 'weekly' ? 'Semana' : 'Tema'} {ti + 1}: {topic.title}
                  </h4>
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    {lms.itemsByTopic(topic.id).map(({ kind, item }, i, arr) => (
                      <div key={item.id} style={{ display: 'flex', gap: 12, padding: '12px 16px', alignItems: 'center', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--card)' }}>
                        {kind === 'lesson' ? (
                          <LessonRow lms={lms} studentId={studentId} course={selectedCourse} lesson={item} onToast={toast} />
                        ) : (
                          <AssignmentRow lms={lms} studentId={studentId} assignment={item} onSubmit={openSubmit} />
                        )}
                      </div>
                    ))}
                    {lms.itemsByTopic(topic.id).length === 0 && <p className="text-sm px-4 py-4 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}>Sin contenido en este tema todavía.</p>}
                  </div>
                </div>
              ))}
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
  return (
    <>
      <span style={{ color: '#7c3aed' }}><FileText size={18} /></span>
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{assignment.title}</p>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Vence: {formatDate(assignment.dueDate)}</p>
      </div>
      {sub?.status === 'graded' ? (
        <span className="text-xs px-3 py-1.5 rounded-full font-bold shrink-0" style={{ backgroundColor: 'rgba(22,163,74,0.12)', color: '#16a34a' }}>
          Calificada · {sub.grade}/{assignment.maxScore}
        </span>
      ) : sub?.status === 'submitted' ? (
        <span className="text-xs px-3 py-1.5 rounded-full font-bold shrink-0" style={{ backgroundColor: 'rgba(0,81,135,0.1)', color: '#005187' }}>Enviada</span>
      ) : (
        <button onClick={() => onSubmit(assignment.id)} className="text-xs px-3 py-1.5 rounded-lg font-bold text-white shrink-0" style={{ backgroundColor: '#005187' }}>
          {sub?.status === 'draft' ? 'Continuar' : 'Entregar'}
        </button>
      )}
    </>
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
