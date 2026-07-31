import { X } from '@/shared/components/Icons'

export default function DirectoryUserDetailModal({ user, role, lms, onClose }) {
  const isStudent = role === 'estudiante'
  const courses = isStudent ? lms.coursesByStudent(user.id) : lms.coursesByTeacher(user.id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-6 pb-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #005187, #4d82bc)' }}>
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                {user.name}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold inline-block mt-1"
                style={{ backgroundColor: user.active ? 'rgba(22,163,74,0.12)' : 'var(--muted)', color: user.active ? '#16a34a' : 'var(--muted-foreground)' }}>
                {user.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar"
            className="shrink-0 p-1.5 rounded-lg transition-colors" style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--muted)'; e.currentTarget.style.color = 'var(--foreground)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <Info label="Correo" value={user.email} />
            <Info label="Teléfono" value={user.phone || '—'} />
            <Info label="Rol" value={isStudent ? 'Estudiante' : 'Profesor'} />
            <Info label="Fecha de ingreso" value={user.joined} />
          </div>

          {isStudent && user.courseInterest && (
            <div className="rounded-xl px-3.5 py-2.5" style={{ backgroundColor: 'rgba(0,81,135,0.06)', border: '1px solid rgba(0,81,135,0.2)' }}>
              <p className="text-xs font-semibold" style={{ color: '#005187' }}>Interesado en: {user.courseInterest}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-bold uppercase tracking-wider pb-1.5 mb-2" style={{ color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>
              {isStudent ? 'Cursos matriculados' : 'Cursos a cargo'}
            </p>
            <div className="space-y-2">
              {courses.map(c => (
                <div key={c.id} className="rounded-xl px-3.5 py-2.5" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{c.name}</p>
                  {isStudent ? (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      Progreso: {lms.progressForStudentCourse(user.id, c.id).percent}%
                    </p>
                  ) : (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      {c.studentIds.length} estudiante{c.studentIds.length === 1 ? '' : 's'} · {c.published ? 'Publicado' : 'Borrador'}
                    </p>
                  )}
                </div>
              ))}
              {courses.length === 0 && (
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {isStudent ? 'Aún no está matriculado en ningún curso.' : 'Aún no tiene cursos a cargo.'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 pt-4 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <button type="button" onClick={onClose}
            className="w-full py-2.5 rounded-lg text-sm font-bold transition-colors"
            style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
      <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{value}</p>
    </div>
  )
}
