import { useScrollReveal } from '@/shared/hooks/useScrollReveal'
import AnimatedCounter from '@/shared/components/AnimatedCounter'

const team = [
  { name: 'Dra. Carolina Mejía', role: 'Gerente General', bio: 'Abogada especializada en derecho laboral y normativa empresarial. Más de 15 años liderando procesos de consultoría en SST y gestión de calidad en empresas del sector industrial y educativo.', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&auto=format' },
  { name: 'Ing. Andrés Castillo', role: 'Sub Gerente / Director de Consultoría', bio: 'Ingeniero industrial con maestría en gestión de organizaciones. Experto en implementación de sistemas integrados de gestión ISO 9001, ISO 14001 e ISO 45001.', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&auto=format' },
  { name: 'Lic. Patricia Vega', role: 'Directora de Gestión Educativa', bio: 'Licenciada en pedagogía con especialización en gestión educativa. Apoya a más de 40 instituciones educativas en el diseño de PEI, mallas curriculares y sistemas de evaluación docente.', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&auto=format' },
]

const acronym = [
  { letter: 'L', value: 'Liderazgo', description: 'Guiamos a nuestros clientes con visión estratégica y resultados comprobados.' },
  { letter: 'I', value: 'Integridad', description: 'Actuamos con transparencia y honestidad en cada proceso.' },
  { letter: 'D', value: 'Dedicación', description: 'Acompañamos cada proyecto con compromiso total desde el inicio hasta el cierre.' },
  { letter: 'E', value: 'Excelencia', description: 'Entregamos resultados que superan las expectativas de nuestros clientes.' },
  { letter: 'S', value: 'Sostenibilidad', description: 'Promovemos prácticas responsables y soluciones duraderas.' },
  { letter: 'S', value: 'Sinergia', description: 'Trabajamos en equipo contigo para alcanzar objetivos compartidos.' },
  { letter: 'A', value: 'Actualización', description: 'Permanecemos al día con la normativa vigente para proteger a nuestros clientes.' },
]

const differentials = [
  { icon: '🎯', text: 'Enfoque completamente personalizado a cada cliente' },
  { icon: '👥', text: 'Equipo multidisciplinario de especialistas certificados' },
  { icon: '📋', text: 'Experiencia comprobada en más de 280 proyectos exitosos' },
  { icon: '💰', text: 'Reducción demostrada de costos operativos y sanciones legales' },
  { icon: '⭐', text: 'Compromiso con la excelencia en cada entrega' },
  { icon: '🤝', text: 'Cercanía y acompañamiento permanente al cliente' },
  { icon: '📰', text: 'Actualización normativa permanente y oportuna' },
]

const objectives = [
  'Garantizar el cumplimiento normativo de nuestros clientes con el menor esfuerzo posible de su parte.',
  'Diseñar soluciones que generen valor real y medible en la operación de cada organización.',
  'Contribuir al desarrollo del talento humano mediante formación de alto impacto.',
  'Promover culturas organizacionales basadas en la excelencia y la mejora continua.',
  'Fortalecer la competitividad de nuestros clientes en sus respectivos sectores.',
]

const testimonials = [
  { text: 'Gracias al equipo de Lidessa implementamos el SG-SST en tiempo récord sin afectar nuestra operación. El acompañamiento fue excepcional.', author: 'Juan C. Rodríguez', role: 'Gerente Administrativo', company: 'Constructora Andina S.A.S', avatar: 'JR' },
  { text: 'El diseño de nuestro PEI y las mallas curriculares mejoró notablemente la coherencia de nuestra oferta educativa. Altamente recomendados.', author: 'Marta L. Gómez', role: 'Rectora', company: 'Colegio Bilingüe La Colina', avatar: 'MG' },
  { text: 'La consultoría de calidad nos permitió obtener la certificación ISO 9001 al primer intento. Proceso riguroso y profesional.', author: 'Carlos A. Torres', role: 'Director de Operaciones', company: 'Distribuidora Nacional Ltda.', avatar: 'CT' },
]

export default function About() {
  const pageRef = useScrollReveal('reveal')
  useScrollReveal('reveal-left')
  useScrollReveal('reveal-scale')

  return (
    <div ref={pageRef}>

      {/* Hero */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #005187 0%, #3d3115 50%, #141414 100%)' }}
      >
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '20%', right: '10%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(77,130,188,0.2) 0%, transparent 70%)', animation: 'orb1 12s ease-in-out infinite' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6" style={{ animation: 'fadeUp 0.7s ease forwards' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#84b6f4' }}>Conózcanos</p>
          <h1 className="font-black text-white mb-5" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 5vw, 3.4rem)' }}>
            Más que una consultora,<br />
            <span style={{ color: '#84b6f4' }}>somos su aliado estratégico</span>
          </h1>
          <p className="text-lg max-w-xl" style={{ color: '#c4dafa' }}>
            Desde 2012, acompañamos a empresas, instituciones y propiedades horizontales a cumplir sus obligaciones normativas y alcanzar la excelencia organizacional.
          </p>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, overflow: 'hidden' }}>
          <svg viewBox="0 0 1440 50" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path d="M0,25 C360,50 1080,0 1440,25 L1440,50 L0,50 Z" fill="var(--background)" />
          </svg>
        </div>
      </section>

      {/* Animated counters */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {[
            { n: 12, suf: '+', label: 'Años de experiencia', icon: '📅' },
            { n: 280, suf: '+', label: 'Clientes atendidos', icon: '🏢' },
            { n: 35, suf: '%', label: 'Reducción de costos promedio', icon: '💰' },
            { n: 90, suf: '%', label: 'Reducción riesgo de sanción', icon: '🛡️' },
          ].map((s, i) => (
            <div key={i}
              className={`rounded-2xl p-6 text-center card-interactive reveal stagger-${i + 1}`}
              style={{ background: 'linear-gradient(135deg, #005187 0%, #4d82bc 100%)', color: 'white' }}
            >
              <div className="text-3xl mb-2">{s.icon}</div>
              <p className="text-4xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: '#c4dafa' }}>
                <AnimatedCounter target={s.n} suffix={s.suf} />
              </p>
              <p className="text-xs opacity-80">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Acronym */}
      <section className="py-16" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="reveal-left">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4d82bc' }}>Nuestra identidad</p>
              <h2 className="text-3xl font-black mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Lo que representa <span className="gradient-text">Lidessa</span>
              </h2>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Cada letra de nuestro nombre representa un compromiso real con nuestros clientes y con la sociedad colombiana.
              </p>
            </div>
            <div className="space-y-3">
              {acronym.map((a, i) => (
                <div key={i}
                  className={`flex items-center gap-4 p-4 rounded-xl card-interactive glow-hover reveal stagger-${i + 1}`}
                  style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black shrink-0 text-white"
                    style={{ background: 'linear-gradient(135deg, #005187 0%, #4d82bc 100%)', fontFamily: 'var(--font-display)' }}>
                    {a.letter}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: '#005187', fontFamily: 'var(--font-display)' }}>{a.value}</p>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-3 reveal-left">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4d82bc' }}>Quiénes somos</p>
            <h2 className="text-3xl font-black mb-5" style={{ fontFamily: 'var(--font-display)' }}>
              Nuestra pasión por la excelencia
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>
              Fundada en 2012 en Bogotá, Lidessa nació con la convicción de que el cumplimiento normativo no debe ser una carga para las organizaciones, sino un motor de transformación. Con un equipo de más de 25 especialistas en gestión empresarial, derecho laboral, pedagogía y medio ambiente, hemos acompañado a más de <strong style={{ color: '#005187' }}>280 empresas</strong> en todo el territorio nacional.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              Nuestra propuesta de valor se fundamenta en la combinación de rigor técnico, actualización normativa permanente y un servicio humano, cercano y personalizado. Operamos bajo un modelo de consultoría tipo KPO (Knowledge Process Outsourcing) que permite a nuestros clientes acceder a conocimiento experto sin los costos de un área interna dedicada.
            </p>
          </div>
          <div className="md:col-span-2 space-y-4 reveal">
            {differentials.map((d, i) => (
              <div key={i}
                className={`flex items-start gap-3 p-3.5 rounded-xl reveal stagger-${Math.min(i + 1, 6)}`}
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <span className="text-xl shrink-0">{d.icon}</span>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{d.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="py-14" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 reveal">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4d82bc' }}>Dirección estratégica</p>
            <h2 className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>Nuestros objetivos</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {objectives.map((o, i) => (
              <div key={i}
                className={`p-5 rounded-xl card-interactive reveal stagger-${(i % 3) + 1}`}
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderLeft: '3px solid #4d82bc' }}
              >
                <p className="text-2xl font-black mb-2" style={{ color: '#c4dafa', fontFamily: 'var(--font-display)' }}>
                  0{i + 1}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{o}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 reveal">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4d82bc' }}>Equipo directivo</p>
          <h2 className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>Las personas detrás de Lidessa</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((p, i) => (
            <div key={p.name}
              className={`rounded-2xl overflow-hidden card-interactive glow-hover reveal stagger-${i + 1}`}
              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="h-52 overflow-hidden relative" style={{ backgroundColor: '#c4dafa' }}>
                <img src={p.image} alt={p.name} className="w-full h-full object-cover"
                  style={{ transition: 'transform 0.5s ease' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,81,135,0.6), transparent 50%)' }} />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-base" style={{ fontFamily: 'var(--font-display)', color: '#005187' }}>{p.name}</h3>
                <p className="text-xs font-semibold mb-2" style={{ color: '#4d82bc' }}>{p.role}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{p.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 reveal">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4d82bc' }}>Testimonios</p>
            <h2 className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
              ¿Qué dicen nuestros <span className="gradient-text">clientes</span>?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i}
                className={`rounded-2xl p-6 card-interactive glow-hover reveal stagger-${i + 1}`}
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <p className="text-4xl font-black mb-3" style={{ color: '#84b6f4', lineHeight: 1 }}>"</p>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--muted-foreground)' }}>{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg, #005187, #4d82bc)' }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#005187' }}>{t.author}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{t.role} · {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact block */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl p-8 reveal"
          style={{ background: 'linear-gradient(135deg, #005187 0%, #3d3115 100%)', color: 'white' }}>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-black mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                ¿Listo para transformar su organización?
              </h3>
              <p className="text-sm opacity-80 mb-5">
                Contáctenos hoy y reciba una consulta inicial sin costo. Nuestro equipo analizará las necesidades de su organización.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="https://wa.me/573001234567" target="_blank" rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: '#25D366', transition: 'opacity 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  💬 WhatsApp
                </a>
                <a href="mailto:comercial@lidessa.co"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold"
                  style={{ border: '2px solid rgba(255,255,255,0.4)', color: 'white', transition: 'background-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  📧 comercial@lidessa.co
                </a>
              </div>
            </div>
            <ul className="space-y-3 text-sm opacity-90">
              <li className="flex items-start gap-2"><span>📍</span> Cra. 71 #46-28, Laureles, Medellín, Antioquia</li>
              <li className="flex items-start gap-2"><span>📱</span> +57 300 123 4567 (General)</li>
              <li className="flex items-start gap-2"><span>📱</span> +57 300 987 6543 (Comercial)</li>
              <li className="flex items-start gap-2"><span>📧</span> mercadeo@lidessa.co</li>
              <li className="flex items-start gap-2"><span>📧</span> servicios@lidessa.co</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
