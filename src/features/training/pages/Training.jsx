import { useState } from 'react'
import { useLMS } from '@/features/lms/context/LMSContext'
import CourseModal from '../components/CourseModal'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'

export default function Training() {
  const { publicCourses: courses } = useLMS()
  const [selectedCourse, setSelectedCourse] = useState(null)
  const pageRef = useScrollReveal('reveal')
  useScrollReveal('reveal-scale')
  useScrollReveal('reveal-left')

  return (
    <div ref={pageRef}>
      {/* Hero */}
      <section
        className="relative min-h-[80vh] flex items-center overflow-hidden py-20"
        style={{ background: 'linear-gradient(135deg, #10294d 0%, #071426 55%, #0c0c0c 100%)' }}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full grid lg:grid-cols-2 gap-14 items-center">
          <div className="text-center lg:text-left">
            <img src="/assets/ceet.png" alt="CEET" className="w-32 h-32 object-contain mx-auto lg:mx-0 mb-4 reveal-scale" />
            <h1 className="text-4xl sm:text-5xl font-black mb-2 reveal" style={{ fontFamily: 'var(--font-display)', color: '#e8c766' }}>
              ¡Bienvenidos a CEET!
            </h1>
            <p className="text-lg sm:text-xl font-bold mb-6 reveal stagger-1" style={{ fontFamily: 'var(--font-display)', color: '#e8c766' }}>
              Centro Especializado en Educación para el Trabajo
            </p>
            <p className="text-base mb-8 reveal stagger-2" style={{ color: '#cbb98a' }}>
              Nos especializamos en ofrecer cursos y capacitaciones que aseguran el cumplimiento de normativas en Seguridad y Salud en el Trabajo (SST), Plan de Manejo Integral de Residuos Sólidos (PMIRS) y otros temas esenciales para Empresas, Instituciones Educativas, Propiedades Horizontales y más. Nuestra misión es ayudarle a mantenerse al día con las regulaciones, asegurando un entorno seguro y sostenible. ¡Juntos construimos un futuro más responsable!
            </p>
          </div>

          <div className="flex justify-center reveal-scale">
            <div style={{ position: 'relative', width: 'min(400px, 85vw)', height: 'min(400px, 85vw)' }}>
              {/* Glow ring */}
              <div
                className="pointer-events-none"
                style={{
                  position: 'absolute',
                  inset: '-6px',
                  borderRadius: '50%',
                  border: '3px solid #e8c766',
                  boxShadow: '0 0 90px 18px rgba(232,199,102,0.5), inset 0 0 45px rgba(232,199,102,0.2)',
                }}
              />
              {/* Pedestal glow */}
              <div
                className="pointer-events-none"
                style={{
                  position: 'absolute',
                  bottom: '-4%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '65%',
                  height: '13%',
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse at center, rgba(232,199,102,0.45), transparent 70%)',
                  filter: 'blur(6px)',
                }}
              />
              <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
                <img
                  src="/assets/ceet_1.jpg"
                  alt="CEET"
                  className="w-full h-full object-cover"
                  style={{ transition: 'transform 0.4s ease' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters + grid */}
      <section id="cursos" className="py-12 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <div key={course.id} className={`flip-card h-105 reveal-scale stagger-${i + 1}`}>
              <div className="flip-card-inner">
                {/* Front — image poster */}
                <div className="flip-card-front rounded-2xl overflow-hidden cursor-pointer"
                  style={{ backgroundColor: 'var(--secondary)', border: '1px solid var(--border)' }}
                  onClick={() => setSelectedCourse(course)}>
                  <img src={course.image} alt={course.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.15) 55%, transparent)' }} />
                  <div className="absolute top-3 right-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full text-white"
                      style={{
                        backgroundColor: course.modality === 'Virtual' ? 'rgba(16,185,129,0.9)' : course.modality === 'Presencial' ? 'rgba(59,130,246,0.9)' : 'rgba(234,179,8,0.9)',
                      }}>
                      {course.modality}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#e8c766' }}>
                      {course.category}
                    </span>
                    <h3 className="font-bold text-lg mt-2 leading-snug text-white" style={{ fontFamily: 'var(--font-display)' }}>
                      {course.name}
                    </h3>
                  </div>
                </div>

                {/* Back — details */}
                <div className="flip-card-back rounded-2xl overflow-hidden p-5 flex flex-col"
                  style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>
                      {course.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-base mt-2 mb-1 leading-snug"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                    {course.name}
                  </h3>
                  <p className="text-sm mb-3 leading-relaxed flex-1 overflow-hidden" style={{ color: 'var(--muted-foreground)' }}>
                    {course.description}
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    {course.duration && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                        {course.duration}
                      </span>
                    )}
                    {course.certified && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                        Certificado
                      </span>
                    )}
                  </div>
                  <button onClick={() => setSelectedCourse(course)}
                    className="w-full py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #005187 0%, #4d82bc 55%, #b8860b 100%)' }}>
                    Ver más
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — formación a la medida */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl overflow-hidden relative reveal-scale"
          style={{ background: 'linear-gradient(135deg, #005187 0%, #4d82bc 55%, #b8860b 100%)' }}>
          <div className="relative max-w-2xl mx-auto text-center py-14 px-6">
            <h2 className="text-3xl font-black mb-4 text-white" style={{ fontFamily: 'var(--font-display)' }}>
              ¿Necesita formación a la medida para su equipo?
            </h2>
            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Diseñamos programas de capacitación corporativa adaptados a los objetivos, la cultura y las necesidades específicas de su organización. Grupos desde 5 personas.
            </p>
            <a href="https://wa.me/573016280574?text=Hola, quiero cotizar un programa de formación a la medida para mi empresa"
              target="_blank" rel="noreferrer"
              className="inline-block px-8 py-3 rounded-lg text-sm font-bold transition-transform hover:scale-105"
              style={{ backgroundColor: 'white', color: '#005187' }}>
              Solicitar cotización por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {selectedCourse && (
        <CourseModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          key={selectedCourse.id}
        />
      )}
    </div>
  )
}
