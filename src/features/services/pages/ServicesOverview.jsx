import { useState } from 'react'
import { Link } from 'react-router-dom'
import { servicesData } from '../data/servicesData'
import { megaMenu } from '@/shared/data/megaMenu'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'

const categoryMeta = [
  {
    image: '/assets/GestionEmpresas.png',
    summary: 'Ofrecemos soluciones integrales para optimizar la administración y operación de su empresa, enfocándonos en el desarrollo estratégico, eficiencia operativa y cumplimiento normativo para impulsar el crecimiento sostenible y el éxito empresarial.',
  },
  {
    image: '/assets/gestionIE.png',
    summary: 'Ofrecemos un servicio integral para optimizar la administración de instituciones educativas, incluyendo la creación de manuales de convivencia, el diseño de Proyectos Educativos Institucionales (PEI), y el desarrollo de mallas curriculares, asegurando un entorno educativo organizado, eficiente y alineado con los estándares de calidad.',
  },
  {
    image: '/assets/formacion.png',
    summary: 'Proveemos capacitación especializada en diversas áreas empresariales, incluyendo Sistemas de Gestión de Seguridad y Salud en el Trabajo (SG-SST), Bases de Datos, Plan de Manejo Integral de Residuos Sólidos (PMIRS), Mallas Curriculares, y más. Nuestro servicio está diseñado para asegurar que tanto empleados como directivos estén plenamente capacitados en normativas, procedimientos y buenas prácticas, garantizando un entorno laboral eficiente y seguro en todo tipo de empresas, incluyendo propiedades horizontales e instituciones educativas.',
  },
  {
    image: '/assets/ph1.png',
    summary: 'En el ámbito de la administración de Propiedades Horizontales (PH), asegurar el funcionamiento óptimo y la seguridad de las instalaciones es crucial para la satisfacción de los propietarios y la operatividad general del complejo. Una adecuada gestión de las PH requiere la implementación de una serie de servicios y normativas esenciales para garantizar un entorno seguro, conforme a las regulaciones y eficiente en su funcionamiento.',
  },
  {
    image: '/assets/SG-SST.png',
    summary: 'En Lidessa, nos comprometemos a ofrecer servicios de supervisión e interventoría de alta calidad, alineados con las normativas legales vigentes y las mejores prácticas en gestión de proyectos. Este servicio está diseñado para garantizar el cumplimiento de los objetivos de los contratos, supervisando cada etapa del proyecto con el fin de asegurar eficiencia, calidad, y sostenibilidad.',
  },
]

export default function ServicesOverview() {
  const pageRef = useScrollReveal('reveal')
  useScrollReveal('reveal-scale')
  const [openCategory, setOpenCategory] = useState(null)

  const categories = megaMenu.map((category, i) => ({
    ...category,
    ...categoryMeta[i],
    items: category.items.map(it => servicesData.find(s => s.slug === it.slug)).filter(Boolean),
  }))

  return (
    <div ref={pageRef}>
      {/* Hero */}
      <section
        className="relative min-h-[70vh] flex items-center overflow-hidden py-20"
        style={{ background: 'linear-gradient(135deg, #10294d 0%, #071426 55%, #0c0c0c 100%)' }}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full grid lg:grid-cols-2 gap-14 items-center">
          <div className="text-center lg:text-left">
            <p className="text-xs font-bold uppercase tracking-widest mb-3 reveal" style={{ color: '#84b6f4' }}>Lo que hacemos</p>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-5 reveal stagger-1" style={{ fontFamily: 'var(--font-display)' }}>
              Nuestros Servicios
            </h1>
            <p className="text-base max-w-2xl mx-auto lg:mx-0 leading-relaxed reveal stagger-2" style={{ color: '#c4dafa' }}>
              Un portafolio integral para acompañar a su organización en cada etapa de su cumplimiento normativo.
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
                  src="/assets/nuestrosServicios.jpeg"
                  alt="Nuestros Servicios"
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

      {/* Intro */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14 text-center reveal">
        <h2 className="text-2xl sm:text-3xl font-black mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Conozca todo acerca de<span className="gradient-text">...</span>
        </h2>
        <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          Lidessa, con más de 15 años de experiencia en procesos de consultoría de Gestión, ha acompañado a
          más de 350 empresarios a nivel nacional en la gestión del cumplimiento normativo. Con un amplio
          portafolio empresarial llegamos a nuestros usuarios con beneficios integradores, que les permite
          efectividad y eficiencia en el alcance de sus objetivos.
        </p>
      </section>

      {/* Timeline */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative">
          <div
            className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
            style={{ backgroundColor: 'var(--border)' }}
          />
          <div className="space-y-14">
            {categories.map((cat, i) => {
              const isOpen = openCategory === i
              const align = i % 2 === 0 ? 'right' : 'left'
              const card = (
                <CategoryCard
                  category={cat}
                  align={align}
                  isOpen={isOpen}
                  onToggle={() => setOpenCategory(isOpen ? null : i)}
                  className={`reveal-scale stagger-${(i % 3) + 1}`}
                />
              )
              return (
                <div key={cat.label} className="relative md:grid md:grid-cols-2 md:gap-10">
                  <div
                    className="hidden md:block absolute left-1/2 top-14 -translate-x-1/2 w-3.5 h-3.5 rounded-full z-10"
                    style={{ backgroundColor: '#4d82bc', border: '3px solid var(--background)' }}
                  />
                  {align === 'right' ? (<><div>{card}</div><div /></>) : (<><div /><div>{card}</div></>)}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div
          className="rounded-2xl p-8 text-center relative overflow-hidden reveal-scale"
          style={{ background: 'linear-gradient(135deg, #005187 0%, #141414 100%)' }}
        >
          <h2 className="text-2xl font-black text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            ¿No encuentra el servicio que necesita?
          </h2>
          <p className="text-sm mb-6 max-w-xl mx-auto" style={{ color: '#c4dafa' }}>
            Contáctenos y nuestro equipo le ayudará a identificar la solución adecuada para su organización.
          </p>
          <a
            href="https://wa.me/573001234567?text=Hola, quisiera información sobre sus servicios"
            target="_blank" rel="noreferrer"
            className="inline-block px-6 py-3 rounded-lg text-sm font-bold text-white"
            style={{ backgroundColor: '#25D366' }}
          >
            Escribirnos por WhatsApp →
          </a>
        </div>
      </section>
    </div>
  )
}

function CategoryCard({ category, align, isOpen, onToggle, className = '' }) {
  const isRight = align === 'right'
  return (
    <div className={`${isRight ? 'md:pr-14' : 'md:pl-14'} ${className}`}>
      <div
        className="rounded-2xl p-3 card-interactive glow-hover"
        style={{ backgroundColor: 'var(--card)', border: '1px solid rgba(77,130,188,0.35)' }}
      >
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(77,130,188,0.25)' }}>
          <img
            src={category.image}
            alt={category.label}
            loading="lazy"
            className="w-full h-auto block"
            style={{ transition: 'transform 0.5s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        </div>
        <div className="p-3">
          <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-display)', color: '#005187' }}>
            {category.label}
          </h3>
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>
            {category.summary}
          </p>
          <button
            type="button"
            onClick={onToggle}
            className="text-sm font-bold inline-flex items-center gap-1"
            style={{ color: '#4d82bc' }}
          >
            Más información <span style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>→</span>
          </button>

          <div style={{ maxHeight: isOpen ? '400px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
            <ul className="pt-3 mt-3 space-y-1.5" style={{ borderTop: '1px solid var(--border)' }}>
              {category.items.map((service, i) => (
                <li
                  key={service.slug}
                  style={{
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'translateX(0)' : 'translateX(-10px)',
                    transition: `opacity 0.35s ease ${i * 0.06}s, transform 0.35s ease ${i * 0.06}s`,
                  }}
                >
                  <Link
                    to={`/servicios/${service.slug}`}
                    className="text-sm inline-flex items-center gap-1.5"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <span style={{ color: '#4d82bc' }}>→</span> {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
