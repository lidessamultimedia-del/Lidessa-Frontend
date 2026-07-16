import { useState } from 'react'
import { courses } from '../data/courses'
import CourseModal from '../components/CourseModal'

const categories = ['Todos', 'Normativa', 'Gestión', 'Habilidades blandas', 'Gestión educativa', 'Seguridad']

export default function Training() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [enrollTab, setEnrollTab] = useState('info')

  const filtered = activeCategory === 'Todos' ? courses : courses.filter(c => c.category === activeCategory)

  const openCourse = (course, tab = 'info') => {
    setSelectedCourse(course)
    setEnrollTab(tab)
  }

  return (
    <div>
      {/* Hero */}
      <section
        className="py-20 relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1400&h=500&fit=crop&auto=format)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(6,78,59,0.96) 50%, rgba(6,78,59,0.7))' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded" style={{ backgroundColor: 'rgba(16,185,129,0.2)', color: '#34D399' }}>
            Centro de formación
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Capacítate con los<br />mejores expertos
          </h1>
          <p className="text-base max-w-xl mb-6" style={{ color: '#A7F3D0' }}>
            Cursos certificados en normativa laboral, sistemas de gestión, habilidades gerenciales y gestión educativa. Modalidades presencial, virtual y mixta adaptadas a tus tiempos.
          </p>
          <div className="flex flex-wrap gap-3">
            {['🎓 Certificados avalados', '🌐 Virtual / Presencial / Mixto', '⏱ A tu ritmo'].map(f => (
              <span key={f} className="px-3 py-1.5 rounded-full text-sm" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>{f}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-6" style={{ backgroundColor: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: '45+', label: 'Cursos disponibles' },
              { value: '1.200+', label: 'Personas formadas' },
              { value: '95%', label: 'Satisfacción' },
              { value: '100%', label: 'Certificados' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>{s.value}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters + grid */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map((c) => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: activeCategory === c ? '#10B981' : 'var(--muted)',
                color: activeCategory === c ? 'white' : 'var(--muted-foreground)',
                border: '1px solid',
                borderColor: activeCategory === c ? '#10B981' : 'var(--border)',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <div key={course.id}
              className="rounded-2xl overflow-hidden group transition-shadow hover:shadow-xl"
              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="h-44 overflow-hidden relative cursor-pointer" style={{ backgroundColor: 'var(--secondary)' }}
                onClick={() => openCourse(course, 'info')}>
                <img src={course.image} alt={course.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3">
                  <span className="text-xs font-bold px-2 py-1 rounded-full text-white"
                    style={{
                      backgroundColor: course.modality === 'Virtual' ? 'rgba(16,185,129,0.9)' : course.modality === 'Presencial' ? 'rgba(59,130,246,0.9)' : 'rgba(234,179,8,0.9)',
                    }}>
                    {course.modality}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                    {course.category}
                  </span>
                  <span className="text-base font-black shrink-0" style={{ color: '#10B981', fontFamily: 'var(--font-display)' }}>
                    {course.price}
                  </span>
                </div>
                <h3 className="font-bold text-base mt-2 mb-1 leading-snug cursor-pointer"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
                  onClick={() => openCourse(course, 'info')}>
                  {course.name}
                </h3>
                <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  {course.description}
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                    ⏱ {course.duration}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                    🎓 Certificado
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openCourse(course, 'enroll')}
                    className="flex-1 py-2 rounded-lg text-sm font-bold transition-all hover:opacity-90"
                    style={{ backgroundColor: '#10B981', color: 'white' }}>
                    Inscribirme
                  </button>
                  <button onClick={() => openCourse(course, 'info')}
                    className="px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
                    style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.color = '#10B981' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
                  >
                    Ver más
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — formación a la medida */}
      <section className="py-16" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-black mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            ¿Necesitas formación a la medida para tu equipo?
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
            Diseñamos programas de capacitación corporativa adaptados a los objetivos, cultura y necesidades específicas de su organización. Grupos desde 5 personas.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://wa.me/573009876543?text=Hola, quiero cotizar un programa de formación a la medida para mi empresa"
              target="_blank" rel="noreferrer"
              className="px-6 py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#10B981' }}>
              💬 Solicitar cotización por WhatsApp
            </a>
            <a href="mailto:formacion@lidessa.co"
              className="px-6 py-3 rounded-lg text-sm font-bold border transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.color = '#10B981' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--foreground)' }}
            >
              📧 Enviar correo
            </a>
          </div>
        </div>
      </section>

      {selectedCourse && (
        <CourseModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          initialTab={enrollTab}
          key={`${selectedCourse.id}-${enrollTab}`}
        />
      )}
    </div>
  )
}
