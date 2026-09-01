import { useState } from 'react'
import { useLMS, MAX_GRADE, PASS_THRESHOLD } from '../context/LMSContext'
import { GradeSubmissionForm, ReviewQuizAttemptForm } from './GradingForms'
import Avatar from '@/shared/components/Avatar'
import { useToast } from '@/shared/context/ToastContext'
import { Search } from '@/shared/components/Icons'
import Pagination, { paginate } from '@/shared/components/Pagination'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Cola de tareas/exámenes pendientes de calificar, acotada a UN curso — a
// diferencia de "Tareas por revisar" del profesor (que junta todos sus
// cursos), esto vive dentro del detalle de un curso puntual, así que lo
// puede usar tanto el profesor como el admin sin depender de `teacherId`.
export default function CourseGradingQueue({ courseId }) {
  const lms = useLMS()
  const { toast } = useToast()
  const course = lms.courses.find(c => c.id === courseId)

  const [gradingFilter, setGradingFilter] = useState('pending')
  const [gradingSearch, setGradingSearch] = useState('')
  const [gradingSubmissionId, setGradingSubmissionId] = useState(null)

  const [quizGradingFilter, setQuizGradingFilter] = useState('pending')
  const [quizGradingSearch, setQuizGradingSearch] = useState('')
  const [gradingAttemptId, setGradingAttemptId] = useState(null)

  const [gradingPage, setGradingPage] = useState(1)
  const [quizGradingPage, setQuizGradingPage] = useState(1)

  const courseAssignments = lms.assignmentsByCourse(courseId)
  const courseAssignmentIds = courseAssignments.map(a => a.id)
  const courseSubmissions = lms.submissions.filter(s => courseAssignmentIds.includes(s.assignmentId))
  const assignmentOf = sub => courseAssignments.find(a => a.id === sub.assignmentId)

  const gradingRows = courseSubmissions
    .filter(s => gradingFilter === 'all' ? true : gradingFilter === 'pending' ? s.status === 'submitted' : s.status === 'graded')
    .map(sub => ({ sub, assignment: assignmentOf(sub) }))
    .filter(row => {
      const q = gradingSearch.trim().toLowerCase()
      return !q || [lms.studentName(row.sub.studentId), row.assignment?.title].some(v => v?.toLowerCase().includes(q))
    })
    .sort((a, b) => (b.sub.submittedAt ?? '').localeCompare(a.sub.submittedAt ?? ''))
  const { pageItems: pagedGradingRows, totalPages: gradingTotalPages, safePage: gradingSafePage } = paginate(gradingRows, gradingPage)

  const gradingSubmission = gradingSubmissionId ? lms.submissions.find(s => s.id === gradingSubmissionId) : null
  const gradingAssignment = gradingSubmission ? assignmentOf(gradingSubmission) : null

  const courseQuizzes = lms.quizzesByCourse(courseId)
  const courseQuizIds = courseQuizzes.map(q => q.id)
  const courseQuizAttempts = lms.quizAttempts.filter(a => courseQuizIds.includes(a.quizId))
  const quizOf = attempt => courseQuizzes.find(q => q.id === attempt.quizId)

  const quizGradingRows = courseQuizAttempts
    .filter(a => quizGradingFilter === 'all' ? true : quizGradingFilter === 'pending' ? !a.reviewed : a.reviewed)
    .map(a => ({ attempt: a, quiz: quizOf(a) }))
    .filter(row => {
      const q = quizGradingSearch.trim().toLowerCase()
      return !q || [lms.studentName(row.attempt.studentId), row.quiz?.title].some(v => v?.toLowerCase().includes(q))
    })
    .sort((a, b) => (b.attempt.submittedAt ?? '').localeCompare(a.attempt.submittedAt ?? ''))
  const { pageItems: pagedQuizGradingRows, totalPages: quizGradingTotalPages, safePage: quizGradingSafePage } = paginate(quizGradingRows, quizGradingPage)

  const gradingAttempt = gradingAttemptId ? lms.quizAttempts.find(a => a.id === gradingAttemptId) : null
  const gradingQuiz = gradingAttempt ? quizOf(gradingAttempt) : null

  if (gradingSubmission) {
    return (
      <GradeSubmissionForm
        submission={gradingSubmission}
        assignment={gradingAssignment}
        course={course}
        studentName={lms.studentName(gradingSubmission.studentId)}
        onSave={(grade, feedback, retryAllowed) => {
          lms.gradeSubmission(gradingSubmission.id, grade, feedback, retryAllowed)
          toast('success', 'Calificación guardada', `${lms.studentName(gradingSubmission.studentId)} — ${gradingAssignment?.title}`)
          setGradingSubmissionId(null)
        }}
        onCancel={() => setGradingSubmissionId(null)}
      />
    )
  }

  if (gradingAttempt && gradingQuiz) {
    return (
      <ReviewQuizAttemptForm
        attempt={gradingAttempt}
        quiz={gradingQuiz}
        course={course}
        studentName={lms.studentName(gradingAttempt.studentId)}
        onSave={(score, feedback, retryAllowed) => {
          lms.reviewQuizAttempt(gradingAttempt.id, score, feedback, retryAllowed)
          toast('success', 'Examen revisado', `${lms.studentName(gradingAttempt.studentId)} — ${gradingQuiz.title}`)
          setGradingAttemptId(null)
        }}
        onCancel={() => setGradingAttemptId(null)}
      />
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Tareas</h3>
        <div className="flex gap-1 rounded-xl p-1" style={{ backgroundColor: 'var(--muted)' }}>
          {[{ id: 'pending', label: 'Pendientes' }, { id: 'graded', label: 'Calificadas' }, { id: 'all', label: 'Todas' }].map(f => (
            <button key={f.id} onClick={() => setGradingFilter(f.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ backgroundColor: gradingFilter === f.id ? 'var(--card)' : 'transparent', color: gradingFilter === f.id ? 'var(--accent)' : 'var(--muted-foreground)' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', maxWidth: 320 }}>
        <Search size={14} style={{ color: 'var(--muted-foreground)' }} />
        <input value={gradingSearch} onChange={e => setGradingSearch(e.target.value)}
          placeholder="Buscar por estudiante o tarea…"
          className="text-sm outline-none bg-transparent w-full" style={{ color: 'var(--foreground)' }} />
      </div>
      <div className="space-y-2 mb-8">
        {pagedGradingRows.map(({ sub, assignment }) => {
          const failed = sub.status === 'graded' && sub.grade < PASS_THRESHOLD
          const statusColor = sub.status === 'graded' ? (failed ? '#dc2626' : '#16a34a') : '#d97706'
          return (
            <div key={sub.id} className="rounded-lg" style={{
              display: 'flex', gap: 14, padding: '14px 16px', alignItems: 'center',
              backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderLeft: `3px solid ${statusColor}`,
            }}>
              <Avatar user={lms.directoryById(sub.studentId)} size={36} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{lms.studentName(sub.studentId)} — {assignment?.title}</p>
                <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>Entregado: {formatDate(sub.submittedAt)}</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1.5 rounded-lg shrink-0" style={{ backgroundColor: `${statusColor}1a`, color: statusColor }}>
                {sub.status === 'graded' ? `Calificada · ${sub.grade}/${assignment?.maxScore}` : 'Pendiente'}
              </span>
              {failed && !sub.retryAllowed && (
                <button onClick={() => { lms.allowRetry('assignment', sub.id); toast('success', 'Reintento permitido', `${lms.studentName(sub.studentId)} — ${assignment?.title}`) }}
                  className="text-xs px-3 py-1.5 rounded-lg font-bold shrink-0" style={{ border: '1px solid rgba(0,81,135,0.3)', color: 'var(--accent)' }}>
                  Permitir reintento
                </button>
              )}
              <button onClick={() => setGradingSubmissionId(sub.id)}
                className="text-xs px-3 py-1.5 rounded-lg font-bold text-white shrink-0" style={{ backgroundColor: '#005187' }}>
                {sub.status === 'graded' ? 'Ver / Editar' : 'Calificar'}
              </button>
            </div>
          )
        })}
        {gradingRows.length === 0 && (
          <p className="text-sm px-4 py-6 text-center rounded-lg" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
            {gradingSearch ? 'Nada coincide con esa búsqueda.' : 'No hay entregas para este filtro.'}
          </p>
        )}
        <Pagination page={gradingSafePage} totalPages={gradingTotalPages} onChange={setGradingPage} />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Exámenes</h3>
        <div className="flex gap-1 rounded-xl p-1" style={{ backgroundColor: 'var(--muted)' }}>
          {[{ id: 'pending', label: 'Pendientes' }, { id: 'graded', label: 'Calificados' }, { id: 'all', label: 'Todos' }].map(f => (
            <button key={f.id} onClick={() => setQuizGradingFilter(f.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ backgroundColor: quizGradingFilter === f.id ? 'var(--card)' : 'transparent', color: quizGradingFilter === f.id ? 'var(--accent)' : 'var(--muted-foreground)' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>Las de selección múltiple se califican solas; las de respuesta abierta hay que leerlas y ponerles nota.</p>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', maxWidth: 320 }}>
        <Search size={14} style={{ color: 'var(--muted-foreground)' }} />
        <input value={quizGradingSearch} onChange={e => setQuizGradingSearch(e.target.value)}
          placeholder="Buscar por estudiante o examen…"
          className="text-sm outline-none bg-transparent w-full" style={{ color: 'var(--foreground)' }} />
      </div>
      <div className="space-y-2">
        {pagedQuizGradingRows.map(({ attempt: a, quiz }) => {
          const failed = a.reviewed && a.score < PASS_THRESHOLD
          const statusColor = !a.reviewed ? '#d97706' : (failed ? '#dc2626' : '#16a34a')
          return (
            <div key={a.id} className="rounded-lg" style={{
              display: 'flex', gap: 14, padding: '14px 16px', alignItems: 'center',
              backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderLeft: `3px solid ${statusColor}`,
            }}>
              <Avatar user={lms.directoryById(a.studentId)} size={36} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{lms.studentName(a.studentId)} — {quiz?.title}</p>
                <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>Presentado: {formatDate(a.submittedAt)}</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1.5 rounded-lg shrink-0" style={{ backgroundColor: `${statusColor}1a`, color: statusColor }}>
                {a.reviewed ? `Calificado · ${a.score}/${MAX_GRADE}` : 'Pendiente de revisión'}
              </span>
              {failed && !a.retryAllowed && (
                <button onClick={() => { lms.allowRetry('quiz', a.id); toast('success', 'Reintento permitido', `${lms.studentName(a.studentId)} — ${quiz?.title}`) }}
                  className="text-xs px-3 py-1.5 rounded-lg font-bold shrink-0" style={{ border: '1px solid rgba(0,81,135,0.3)', color: 'var(--accent)' }}>
                  Permitir reintento
                </button>
              )}
              <button onClick={() => setGradingAttemptId(a.id)}
                className="text-xs px-3 py-1.5 rounded-lg font-bold text-white shrink-0" style={{ backgroundColor: '#005187' }}>
                {a.reviewed ? 'Ver / Editar' : 'Revisar'}
              </button>
            </div>
          )
        })}
        {quizGradingRows.length === 0 && (
          <p className="text-sm px-4 py-6 text-center rounded-lg" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
            {quizGradingSearch ? 'Nada coincide con esa búsqueda.' : 'No hay exámenes presentados para este filtro.'}
          </p>
        )}
        <Pagination page={quizGradingSafePage} totalPages={quizGradingTotalPages} onChange={setQuizGradingPage} />
      </div>
    </div>
  )
}
