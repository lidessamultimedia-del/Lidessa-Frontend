import { useState, useMemo } from 'react'
import { useAuth } from '@/features/auth/context/AuthContext'
import { useLMS, MAX_GRADE, PASS_THRESHOLD } from '@/features/lms/context/LMSContext'
import { useToast } from '@/shared/context/ToastContext'
import DashboardShell from '@/features/lms/components/DashboardShell'
import CourseFormModal from '@/features/lms/components/CourseFormModal'
import TopicFormModal from '@/features/lms/components/TopicFormModal'
import LessonFormModal from '@/features/lms/components/LessonFormModal'
import AssignmentFormModal from '@/features/lms/components/AssignmentFormModal'
import QuizFormModal from '@/features/lms/components/QuizFormModal'
import ConfirmDeleteModal from '@/features/lms/components/ConfirmDeleteModal'
import GradebookReport from '@/features/lms/components/GradebookReport'
import CompletionReport from '@/features/lms/components/CompletionReport'
import CourseContentTab from '@/features/lms/components/CourseContentTab'
import AnimatedCounter from '@/shared/components/AnimatedCounter'
import FormField, { errorInputStyle } from '@/shared/components/FormField'
import {
  BarChart2, GraduationCap, ClipboardCheck, Plus, Users,
  BookOpen, Search,
} from '@/shared/components/Icons'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
  { id: 'courses', label: 'Mis Cursos', icon: GraduationCap },
  { id: 'grading', label: 'Tareas por Revisar', icon: ClipboardCheck },
]

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function TeacherDashboard() {
  const { user } = useAuth()
  const teacherId = user.id
  const lms = useLMS()
  const { toast } = useToast()

  const [section, setSection] = useState('dashboard')
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [courseTab, setCourseTab] = useState('content')
  const [participantsView, setParticipantsView] = useState('list')
  const [gradingSubmissionId, setGradingSubmissionId] = useState(null)
  const [gradingFilter, setGradingFilter] = useState('pending')

  const [coursesSearch, setCoursesSearch] = useState('')
  const [coursesSort, setCoursesSort] = useState('name')
  const [coursesFilter, setCoursesFilter] = useState('all')
  const [openMenuId, setOpenMenuId] = useState(null)

  const [courseModal, setCourseModal] = useState(null)
  const [topicModal, setTopicModal] = useState(null)
  const [lessonModal, setLessonModal] = useState(null)
  const [assignmentModal, setAssignmentModal] = useState(null)
  const [quizModal, setQuizModal] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const myCourses = lms.coursesByTeacher(teacherId)
  const selectedCourse = selectedCourseId ? lms.courses.find(c => c.id === selectedCourseId) : null

  const totalStudents = useMemo(() => {
    const set = new Set()
    myCourses.forEach(c => c.studentIds.forEach(id => set.add(id)))
    return set.size
  }, [myCourses])

  const pendingSubmissions = lms.submissionsPendingForTeacher(teacherId)

  const allTeacherSubmissions = useMemo(() => {
    const courseIds = myCourses.map(c => c.id)
    const assignmentIds = lms.assignments.filter(a => courseIds.includes(a.courseId)).map(a => a.id)
    return lms.submissions.filter(sub => assignmentIds.includes(sub.assignmentId))
  }, [myCourses, lms.assignments, lms.submissions])

  const gradedSubmissions = allTeacherSubmissions.filter(s => s.status === 'graded')
  const averageGrade = gradedSubmissions.length
    ? Math.round((gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length) * 10) / 10
    : 0

  function assignmentOf(sub) { return lms.assignments.find(a => a.id === sub.assignmentId) }
  function courseOf(assignment) { return lms.courses.find(c => c.id === assignment?.courseId) }

  function courseAvgCompletion(courseId) {
    const course = lms.courses.find(c => c.id === courseId)
    if (!course || course.studentIds.length === 0) return 0
    const pcts = course.studentIds.map(sid => {
      const comp = lms.courseCompletion(sid, courseId)
      return comp.total ? (comp.completed / comp.total) * 100 : 0
    })
    return Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length)
  }

  function openCourseDetail(courseId, tab = 'content') {
    setSelectedCourseId(courseId)
    setCourseTab(tab)
    setParticipantsView('list')
    setSection('courseDetail')
  }

  function goGrade(submissionId) {
    setGradingSubmissionId(submissionId)
    setSection('gradeSubmission')
  }

  function handleSaveCourse(form) {
    if (courseModal.mode === 'edit') {
      lms.updateCourse(courseModal.course.id, form)
      toast('success', 'Curso actualizado', form.name)
    } else {
      const created = lms.addCourse({ ...form, teacherId })
      toast('success', 'Curso creado como borrador', form.name)
      openCourseDetail(created.id)
    }
    setCourseModal(null)
  }

  function handleDeleteConfirm() {
    const { type, id, label } = deleteConfirm
    if (type === 'course') {
      lms.deleteCourse(id)
      if (selectedCourseId === id) { setSelectedCourseId(null); setSection('courses') }
    } else if (type === 'topic') {
      lms.deleteTopic(id)
    } else if (type === 'lesson') {
      lms.deleteLesson(id)
    } else if (type === 'assignment') {
      lms.deleteAssignment(id)
    } else if (type === 'quiz') {
      lms.deleteQuiz(id)
    }
    toast('success', 'Eliminado', label)
    setDeleteConfirm(null)
  }

  const enrolledStudents = selectedCourse ? selectedCourse.studentIds.map(id => lms.directoryById(id)).filter(Boolean) : []

  const gradingRows = allTeacherSubmissions
    .filter(s => gradingFilter === 'all' ? true : gradingFilter === 'pending' ? s.status !== 'graded' : s.status === 'graded')
    .map(sub => ({ sub, assignment: assignmentOf(sub) }))
    .map(row => ({ ...row, course: courseOf(row.assignment) }))
    .sort((a, b) => (b.sub.submittedAt ?? '').localeCompare(a.sub.submittedAt ?? ''))

  const gradingSubmission = gradingSubmissionId ? lms.submissions.find(s => s.id === gradingSubmissionId) : null
  const gradingAssignment = gradingSubmission ? assignmentOf(gradingSubmission) : null
  const gradingCourse = gradingAssignment ? courseOf(gradingAssignment) : null

  const displayedCourses = useMemo(() => {
    let list = myCourses.filter(c => c.name.toLowerCase().includes(coursesSearch.toLowerCase()))
    if (coursesFilter !== 'all') list = list.filter(c => coursesFilter === 'published' ? c.published : !c.published)
    list = [...list].sort((a, b) => coursesSort === 'name' ? a.name.localeCompare(b.name) : (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    return list
  }, [myCourses, coursesSearch, coursesFilter, coursesSort])

  const sectionTitle = {
    dashboard: 'Panel del profesor',
    courses: 'Mis cursos',
    courseDetail: selectedCourse?.name ?? 'Curso',
    grading: 'Tareas por revisar',
    gradeSubmission: 'Calificar tarea',
  }[section]

  return (
    <DashboardShell
      roleLabel="PANEL DOCENTE"
      navItems={navItems}
      activeSection={['dashboard', 'courses', 'grading'].includes(section) ? section : (section === 'grading' ? 'grading' : 'courses')}
      onSectionChange={id => { setSection(id); setSelectedCourseId(null) }}
      title={sectionTitle}
      notifications={pendingSubmissions.slice(0, 5).map(sub => ({
        id: sub.id,
        icon: ClipboardCheck,
        text: `${lms.studentName(sub.studentId)} entregó "${assignmentOf(sub)?.title ?? 'una tarea'}"`,
        time: formatDate(sub.submittedAt),
        onClick: () => goGrade(sub.id),
      }))}
    >
      {/* ── DASHBOARD ── */}
      {section === 'dashboard' && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <p className="text-2xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            Hola, {user.name.split(' ')[0]}
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Resumen de tus cursos y tareas.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Mis Cursos', value: myCourses.length, icon: GraduationCap, color: '#005187' },
              { label: 'Estudiantes Totales', value: totalStudents, icon: Users, color: '#16a34a' },
              { label: 'Tareas por Revisar', value: pendingSubmissions.length, icon: ClipboardCheck, color: '#d97706' },
              { label: 'Promedio de Calificación', value: averageGrade, icon: BarChart2, color: '#7c3aed' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-5" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span style={{ color: s.color }}><s.icon size={26} /></span>
                  <AnimatedCounter target={s.value} style={{ fontSize: 32, fontFamily: 'var(--font-display)', color: s.color, fontWeight: 900 }} />
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
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', borderLeft: `4px solid ${c.color ?? '#005187'}` }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#4d82bc'}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.borderLeftColor = c.color ?? '#005187' }}>
                {c.name}
              </button>
            ))}
            {myCourses.length === 0 && <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Aún no tienes cursos. Crea el primero desde "Mis Cursos".</p>}
          </div>

          <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-display)' }}>Tareas pendientes de revisar</h2>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {pendingSubmissions.length === 0 && (
              <p className="text-sm px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}>No hay entregas pendientes por calificar.</p>
            )}
            {pendingSubmissions.slice(0, 6).map((sub, i, arr) => {
              const a = assignmentOf(sub)
              return (
                <div key={sub.id} style={{
                  display: 'flex', gap: 12, padding: '14px 16px', alignItems: 'center',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--card)',
                }}>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{lms.studentName(sub.studentId)} — {a?.title}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{courseOf(a)?.name} · Entregado: {formatDate(sub.submittedAt)}</p>
                  </div>
                  <button onClick={() => goGrade(sub.id)}
                    className="text-xs px-3 py-1.5 rounded-lg font-bold text-white shrink-0" style={{ backgroundColor: '#005187' }}>
                    Calificar
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── MIS CURSOS ── */}
      {section === 'courses' && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Mis cursos</h2>
            <button onClick={() => setCourseModal({ mode: 'new' })}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-1.5" style={{ backgroundColor: '#005187' }}>
              <Plus size={14} /> Crear Nuevo Curso
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
              <Search size={14} style={{ color: 'var(--muted-foreground)' }} />
              <input value={coursesSearch} onChange={e => setCoursesSearch(e.target.value)} placeholder="Buscar…"
                className="text-sm outline-none bg-transparent" style={{ color: 'var(--foreground)', width: 160 }} />
            </div>
            <select value={coursesSort} onChange={e => setCoursesSort(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg outline-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
              <option value="name">Ordenar: Nombre</option>
              <option value="date">Ordenar: Más reciente</option>
            </select>
            <select value={coursesFilter} onChange={e => setCoursesFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg outline-none"
              style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
              <option value="all">Todos los estados</option>
              <option value="published">Publicados</option>
              <option value="draft">Borradores</option>
            </select>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedCourses.map(c => (
              <div key={c.id} className="rounded-xl overflow-hidden relative" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                <div style={{ height: 8, backgroundColor: c.color ?? '#005187' }} />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-sm leading-snug" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>{c.name}</h3>
                    <button onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                      className="text-sm px-1.5 rounded shrink-0" style={{ color: 'var(--muted-foreground)' }}>⋯</button>
                  </div>
                  {openMenuId === c.id && (
                    <div className="absolute right-4 mt-1 rounded-lg shadow-lg z-10" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                      <button onClick={() => { setDeleteConfirm({ type: 'course', id: c.id, label: c.name }); setOpenMenuId(null) }}
                        className="text-xs px-4 py-2 font-medium block w-full text-left" style={{ color: '#dc2626' }}>
                        Eliminar
                      </button>
                    </div>
                  )}
                  <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>{c.category}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold inline-block mb-3"
                    style={{ backgroundColor: c.published ? 'rgba(22,163,74,0.12)' : 'rgba(217,119,6,0.12)', color: c.published ? '#16a34a' : '#d97706' }}>
                    {c.published ? '✓ Publicado' : '⏳ Borrador'}
                  </span>
                  <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Estudiantes: <strong style={{ color: 'var(--foreground)' }}>{c.studentIds.length}</strong></p>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
                      <span>Progreso</span><span>{courseAvgCompletion(c.id)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
                      <div style={{ width: `${courseAvgCompletion(c.id)}%`, height: '100%', backgroundColor: c.color ?? '#005187' }} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openCourseDetail(c.id)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: '#005187' }}>
                      Ver Detalle
                    </button>
                    <button onClick={() => openCourseDetail(c.id, 'grades')}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                      Reportes
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {displayedCourses.length === 0 && <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Sin cursos para este filtro.</p>}
          </div>
        </div>
      )}

      {/* ── DETALLE DE CURSO ── */}
      {section === 'courseDetail' && selectedCourse && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <button onClick={() => setSection('courses')} className="text-xs font-semibold mb-3" style={{ color: '#005187' }}>← Volver a mis cursos</button>

          <div className="rounded-xl overflow-hidden mb-5" style={{ border: '1px solid var(--border)' }}>
            <div style={{ height: 10, backgroundColor: selectedCourse.color ?? '#005187' }} />
            <div className="p-4 flex items-start justify-between gap-3" style={{ backgroundColor: 'var(--card)' }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>{selectedCourse.name}</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: selectedCourse.published ? 'rgba(22,163,74,0.12)' : 'rgba(217,119,6,0.12)', color: selectedCourse.published ? '#16a34a' : '#d97706' }}>
                    {selectedCourse.published ? '✓ Publicado' : '⏳ Borrador'}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{selectedCourse.description}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  {selectedCourse.published ? 'El administrador ya publicó este curso para inscripción.' : 'El administrador aún no ha publicado este curso — el contenido que publiques ya queda listo para cuando lo haga.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-1 mb-5 rounded-xl p-1" style={{ backgroundColor: 'var(--muted)', width: 'fit-content' }}>
            {[
              { id: 'content', label: 'Contenido', icon: BookOpen },
              { id: 'grades', label: 'Calificaciones', icon: BarChart2 },
              { id: 'participants', label: 'Participantes', icon: Users },
            ].map(t => (
              <button key={t.id} onClick={() => setCourseTab(t.id)}
                className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
                style={{ backgroundColor: courseTab === t.id ? 'var(--card)' : 'transparent', color: courseTab === t.id ? '#005187' : 'var(--muted-foreground)' }}>
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>

          {courseTab === 'content' && (
            <CourseContentTab
              course={selectedCourse}
              lms={lms}
              onAddTopic={() => setTopicModal({ mode: 'new' })}
              onEditTopic={topic => setTopicModal({ mode: 'edit', topic })}
              onDeleteTopic={topic => setDeleteConfirm({ type: 'topic', id: topic.id, label: topic.title })}
              onAddLesson={topicId => setLessonModal({ mode: 'new', topicId })}
              onEditLesson={lesson => setLessonModal({ mode: 'edit', lesson })}
              onDeleteLesson={lesson => setDeleteConfirm({ type: 'lesson', id: lesson.id, label: lesson.title })}
              onAddAssignment={topicId => setAssignmentModal({ mode: 'new', topicId })}
              onEditAssignment={assignment => setAssignmentModal({ mode: 'edit', assignment })}
              onDeleteAssignment={assignment => setDeleteConfirm({ type: 'assignment', id: assignment.id, label: assignment.title })}
              onAddQuiz={topicId => setQuizModal({ mode: 'new', topicId })}
              onEditQuiz={quiz => setQuizModal({ mode: 'edit', quiz })}
              onDeleteQuiz={quiz => setDeleteConfirm({ type: 'quiz', id: quiz.id, label: quiz.title })}
              onPublishLesson={lesson => {
                const next = lesson.publishAt ? '' : todayISO()
                lms.updateLesson(lesson.id, { publishAt: next })
                toast(next ? 'success' : 'warning', next ? 'Material publicado' : 'Publicación cancelada', lesson.title)
              }}
              onPublishAssignment={assignment => {
                const next = assignment.publishAt ? '' : todayISO()
                lms.updateAssignment(assignment.id, { publishAt: next })
                toast(next ? 'success' : 'warning', next ? 'Tarea publicada' : 'Publicación cancelada', assignment.title)
              }}
              onPublishQuiz={quiz => {
                const next = quiz.publishAt ? '' : todayISO()
                lms.updateQuiz(quiz.id, { publishAt: next })
                toast(next ? 'success' : 'warning', next ? 'Examen publicado' : 'Publicación cancelada', quiz.title)
              }}
            />
          )}

          {courseTab === 'grades' && <GradebookReport courseId={selectedCourse.id} />}

          {courseTab === 'participants' && (
            <div>
              <div className="flex gap-1 mb-4 rounded-xl p-1" style={{ backgroundColor: 'var(--muted)', width: 'fit-content' }}>
                {[{ id: 'list', label: 'Lista' }, { id: 'completion', label: 'Finalización' }].map(t => (
                  <button key={t.id} onClick={() => setParticipantsView(t.id)}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold"
                    style={{ backgroundColor: participantsView === t.id ? 'var(--card)' : 'transparent', color: participantsView === t.id ? '#005187' : 'var(--muted-foreground)' }}>
                    {t.label}
                  </button>
                ))}
              </div>
              {participantsView === 'list' ? (
                <div>
                  <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>Las inscripciones las gestiona el administrador — aquí puedes ver quién está inscrito.</p>
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    {enrolledStudents.map((s, i, arr) => (
                      <div key={s.id} style={{ display: 'flex', gap: 12, padding: '12px 16px', alignItems: 'center', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--card)' }}>
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{s.name}</p>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.email}</p>
                        </div>
                      </div>
                    ))}
                    {enrolledStudents.length === 0 && <p className="text-sm px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}>Sin estudiantes inscritos.</p>}
                  </div>
                </div>
              ) : (
                <CompletionReport courseId={selectedCourse.id} />
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAREAS POR REVISAR ── */}
      {section === 'grading' && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Tareas por revisar</h2>
            <div className="flex gap-1 rounded-xl p-1" style={{ backgroundColor: 'var(--muted)' }}>
              {[{ id: 'pending', label: 'Pendientes' }, { id: 'graded', label: 'Calificadas' }, { id: 'all', label: 'Todas' }].map(f => (
                <button key={f.id} onClick={() => setGradingFilter(f.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{ backgroundColor: gradingFilter === f.id ? 'var(--card)' : 'transparent', color: gradingFilter === f.id ? '#005187' : 'var(--muted-foreground)' }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {gradingRows.map(({ sub, assignment, course }, i, arr) => (
              <div key={sub.id} style={{ display: 'flex', gap: 12, padding: '14px 16px', alignItems: 'center', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--card)' }}>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{lms.studentName(sub.studentId)} — {assignment?.title}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{course?.name} · Entregado: {formatDate(sub.submittedAt)}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-semibold shrink-0"
                  style={{ backgroundColor: sub.status === 'graded' ? 'rgba(22,163,74,0.12)' : 'rgba(217,119,6,0.12)', color: sub.status === 'graded' ? '#16a34a' : '#d97706' }}>
                  {sub.status === 'graded' ? `Calificada · ${sub.grade}/${assignment?.maxScore}` : 'Pendiente'}
                </span>
                <button onClick={() => goGrade(sub.id)}
                  className="text-xs px-3 py-1.5 rounded-lg font-bold text-white shrink-0" style={{ backgroundColor: '#005187' }}>
                  {sub.status === 'graded' ? 'Ver / Editar' : 'Calificar'}
                </button>
              </div>
            ))}
            {gradingRows.length === 0 && <p className="text-sm px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)' }}>No hay entregas para este filtro.</p>}
          </div>
        </div>
      )}

      {/* ── CALIFICAR TAREA ── */}
      {section === 'gradeSubmission' && gradingSubmission && (
        <GradeSubmissionForm
          submission={gradingSubmission}
          assignment={gradingAssignment}
          course={gradingCourse}
          studentName={lms.studentName(gradingSubmission.studentId)}
          onSave={(grade, feedback) => {
            lms.gradeSubmission(gradingSubmission.id, grade, feedback)
            toast('success', 'Calificación guardada', `${lms.studentName(gradingSubmission.studentId)} — ${gradingAssignment?.title}`)
            setSection('grading')
          }}
          onCancel={() => setSection('grading')}
        />
      )}

      {courseModal && (
        <CourseFormModal
          course={courseModal.mode === 'edit' ? courseModal.course : null}
          onSave={handleSaveCourse}
          onClose={() => setCourseModal(null)}
        />
      )}
      {topicModal && selectedCourse && (
        <TopicFormModal
          topic={topicModal.mode === 'edit' ? topicModal.topic : null}
          onSave={form => {
            if (topicModal.mode === 'edit') { lms.updateTopic(topicModal.topic.id, form); toast('success', 'Tema actualizado', form.title) }
            else { lms.addTopic(selectedCourse.id, form); toast('success', 'Tema creado', form.title) }
            setTopicModal(null)
          }}
          onClose={() => setTopicModal(null)}
        />
      )}
      {lessonModal && selectedCourse && (
        <LessonFormModal
          lesson={lessonModal.mode === 'edit' ? lessonModal.lesson : null}
          topics={lms.topicsByCourse(selectedCourse.id)}
          initialTopicId={lessonModal.topicId}
          onSave={form => {
            if (lessonModal.mode === 'edit') { lms.updateLesson(lessonModal.lesson.id, form); toast('success', 'Lección actualizada', form.title) }
            else { lms.addLesson(selectedCourse.id, form); toast('success', 'Lección creada', form.title) }
            setLessonModal(null)
          }}
          onClose={() => setLessonModal(null)}
        />
      )}
      {assignmentModal && selectedCourse && (
        <AssignmentFormModal
          assignment={assignmentModal.mode === 'edit' ? assignmentModal.assignment : null}
          topics={lms.topicsByCourse(selectedCourse.id)}
          initialTopicId={assignmentModal.topicId}
          onSave={form => {
            if (assignmentModal.mode === 'edit') { lms.updateAssignment(assignmentModal.assignment.id, form); toast('success', 'Tarea actualizada', form.title) }
            else { lms.addAssignment(selectedCourse.id, form); toast('success', 'Tarea creada', form.title) }
            setAssignmentModal(null)
          }}
          onClose={() => setAssignmentModal(null)}
        />
      )}
      {quizModal && selectedCourse && (
        <QuizFormModal
          quiz={quizModal.mode === 'edit' ? quizModal.quiz : null}
          topics={lms.topicsByCourse(selectedCourse.id)}
          initialTopicId={quizModal.topicId}
          onSave={form => {
            if (quizModal.mode === 'edit') { lms.updateQuiz(quizModal.quiz.id, form); toast('success', 'Examen actualizado', form.title) }
            else { lms.addQuiz(selectedCourse.id, form); toast('success', 'Examen creado', form.title) }
            setQuizModal(null)
          }}
          onClose={() => setQuizModal(null)}
        />
      )}
      {deleteConfirm && (
        <ConfirmDeleteModal label={deleteConfirm.label} onConfirm={handleDeleteConfirm} onClose={() => setDeleteConfirm(null)} />
      )}
    </DashboardShell>
  )
}

function GradeSubmissionForm({ submission, assignment, course, studentName, onSave, onCancel }) {
  const [grade, setGrade] = useState(submission.grade ?? '')
  const [feedback, setFeedback] = useState(submission.feedback ?? '')
  const [gradeError, setGradeError] = useState('')
  const maxScore = assignment?.maxScore ?? MAX_GRADE

  return (
    <div style={{ animation: 'fadeUp 0.4s ease', maxWidth: 640 }}>
      <button onClick={onCancel} className="text-xs font-semibold mb-3" style={{ color: '#005187' }}>← Volver</button>
      <h2 className="text-xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
        Calificar: {studentName} — {assignment?.title}
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>{course?.name}</p>

      <div className="rounded-xl p-5 mb-5" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
        {submission.fileName && (
          <p className="text-sm mb-2" style={{ color: 'var(--foreground)' }}>Archivo: <strong>{submission.fileName}</strong></p>
        )}
        {submission.textResponse && (
          <div className="mb-2">
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Respuesta escrita</p>
            <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>{submission.textResponse}</p>
          </div>
        )}
        {submission.notes && (
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Observaciones del estudiante</p>
            <p className="text-sm" style={{ color: 'var(--foreground)' }}>{submission.notes}</p>
          </div>
        )}
        <p className="text-xs mt-3" style={{ color: 'var(--muted-foreground)' }}>Enviado: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString('es-CO') : '—'}</p>
      </div>

      <form onSubmit={e => {
        e.preventDefault()
        if (grade === '' || grade === null) { setGradeError('Ingrese una calificación.'); return }
        const num = Math.round(Number(grade) * 10) / 10
        if (Number.isNaN(num) || num < 0 || num > maxScore) { setGradeError(`Debe estar entre 0 y ${maxScore}.`); return }
        setGradeError('')
        onSave(num, feedback)
      }} className="space-y-4" noValidate>
        <FormField label={`Calificación (sobre ${maxScore})`} required error={gradeError}
          helperText={`Admite decimales, ej. 7.9. Se aprueba con ${PASS_THRESHOLD.toFixed(1)} o más.`}>
          <input type="number" min={0} max={maxScore} step={0.1} value={grade}
            onChange={e => { setGrade(e.target.value); setGradeError('') }}
            className="w-40 px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!gradeError) }} />
        </FormField>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Feedback</label>
          <textarea rows={5} value={feedback} onChange={e => setFeedback(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
            style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>Cancelar</button>
          <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#005187' }}>Guardar</button>
        </div>
      </form>
    </div>
  )
}
