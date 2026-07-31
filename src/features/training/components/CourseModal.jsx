import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Check } from '@/shared/components/Icons'

export default function CourseModal({ course, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [onClose])

  const modalityColor = {
    Virtual: '#10B981',
    Presencial: '#3B82F6',
    Mixto: '#F59E0B',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-6 px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--card)' }}>
        {/* Image header */}
        <div className="h-48 overflow-hidden relative" style={{ backgroundColor: 'var(--secondary)' }}>
          <img src={course.image} alt={course.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >×</button>
          <div className="absolute bottom-4 left-5">
            <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: modalityColor[course.modality] ?? '#6B7280' }}>
              {course.modality}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-4">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
              {course.category}
            </span>
            <h2 className="text-xl font-black mt-2 leading-snug" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
              {course.name}
            </h2>
          </div>

          <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--muted-foreground)' }}>
            {course.description}
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Duración', value: course.duration },
              { label: 'Modalidad', value: course.modality },
              { label: 'Certificado', value: 'Sí' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--muted)' }}>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
                <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{s.value}</p>
              </div>
            ))}
          </div>

          {course.intro && (
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ fontFamily: 'var(--font-display)', color: '#b8860b' }}>
                Introducción
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                {course.intro}
              </p>
            </div>
          )}

          {course.objectives?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ fontFamily: 'var(--font-display)', color: '#b8860b' }}>
                Objetivos
              </h3>
              <ul className="space-y-1.5">
                {course.objectives.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    <span style={{ color: '#b8860b' }} className="shrink-0 mt-0.5"><Check size={13} strokeWidth="3" /></span> {o}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {course.modules?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ fontFamily: 'var(--font-display)', color: '#b8860b' }}>
                Qué verás en el curso
              </h3>
              <ul className="space-y-1.5">
                {course.modules.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--foreground)' }}>
                    <span style={{ color: '#b8860b' }}>•</span> {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link
            to={`/registro?curso=${encodeURIComponent(course.name)}`}
            className="block w-full text-center py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #005187 0%, #4d82bc 55%, #b8860b 100%)' }}
          >
            Crear cuenta e inscribirme
          </Link>
          <a
            href={`https://wa.me/573009876543?text=${encodeURIComponent(`Hola, quiero inscribirme en el curso "${course.name}"`)}`}
            target="_blank"
            rel="noreferrer"
            className="block w-full text-center py-2.5 mt-2 rounded-lg text-sm font-medium transition-colors"
            style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
          >
            O consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
