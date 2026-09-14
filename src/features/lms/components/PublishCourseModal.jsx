import { Check, AlertTriangle } from '@/shared/components/Icons'

const MIN_ACTIVITIES_TO_PUBLISH = 3
const MIN_EXAMS_TO_PUBLISH = 1

// Mismos requisitos que valida el backend en CourseService.BuildMissingForPublish
// — se replican aquí para que el admin vea qué falta antes de intentar publicar,
// en vez de enterarse solo cuando el backend rechace la solicitud.
function buildMissingForPublish(course, assignmentsCount, quizzesCount) {
  const missing = []
  if (!course.teacherId) missing.push('Asignar un profesor al curso')
  if (assignmentsCount < MIN_ACTIVITIES_TO_PUBLISH) missing.push(`Agregar al menos ${MIN_ACTIVITIES_TO_PUBLISH} actividades (tiene ${assignmentsCount})`)
  if (quizzesCount < MIN_EXAMS_TO_PUBLISH) missing.push(`Agregar al menos ${MIN_EXAMS_TO_PUBLISH} examen (tiene ${quizzesCount})`)
  return missing
}

export default function PublishCourseModal({ course, topicsCount, lessonsCount, assignmentsCount, quizzesCount, onConfirm, onClose }) {
  const missing = buildMissingForPublish(course, assignmentsCount, quizzesCount)
  const canPublish = missing.length === 0

  const rows = [
    ['Nombre', course.name],
    ['Temas', topicsCount],
    ['Lecciones', lessonsCount],
    ['Tareas', assignmentsCount],
    ['Exámenes', quizzesCount],
    ['Estudiantes', course.studentIds.length],
    ['Requisitos', course.requiresPassword ? 'Contraseña de acceso' : 'Ninguno'],
    ['Auto-inscripción', course.selfEnrollment ? 'Habilitada' : 'Deshabilitada'],
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rounded-2xl p-6 max-w-md w-full shadow-2xl"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>
        <div className="flex items-center gap-2 mb-1">
          <span style={{ color: '#16a34a' }}><Check size={20} /></span>
          <h3 className="text-lg font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            Publicar curso: {course.name}
          </h3>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>¿Estás seguro de que deseas publicar este curso?</p>

        <div className="rounded-lg p-3 mb-4 text-xs space-y-1" style={{ backgroundColor: 'var(--muted)' }}>
          <p style={{ color: 'var(--foreground)' }}>Una vez publicado:</p>
          <p style={{ color: 'var(--muted-foreground)' }}>✓ Los estudiantes podrán ver e inscribirse en el curso</p>
          <p style={{ color: 'var(--muted-foreground)' }}>✓ Se mantiene visible para los estudiantes ya inscritos</p>
        </div>

        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>Resumen del curso</p>
        <div className="rounded-lg overflow-hidden mb-5" style={{ border: '1px solid var(--border)' }}>
          {rows.map(([label, value], i) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', padding: '8px 12px',
              borderTop: i > 0 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--card)',
            }}>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{value}</span>
            </div>
          ))}
        </div>

        {!canPublish && (
          <div className="rounded-lg p-3 mb-5 text-xs" style={{ backgroundColor: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.3)' }}>
            <p className="flex items-center gap-1.5 font-bold mb-1.5" style={{ color: '#d97706' }}>
              <AlertTriangle size={14} /> Falta esto para poder publicar:
            </p>
            <ul className="space-y-0.5 list-disc list-inside" style={{ color: 'var(--foreground)' }}>
              {missing.map(m => <li key={m}>{m}</li>)}
            </ul>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
            Cancelar
          </button>
          <button onClick={onConfirm}
            disabled={!canPublish}
            title={canPublish ? undefined : 'Completa los requisitos antes de publicar'}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#16a34a' }}>
            Publicar ahora
          </button>
        </div>
      </div>
    </div>
  )
}
