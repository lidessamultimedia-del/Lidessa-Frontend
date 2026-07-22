import { useRef, useEffect, useState } from 'react'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'
import { useIsDarkTheme } from '@/shared/hooks/useIsDarkTheme'
import PQRSFModal from '@/shared/components/PQRSFModal'

const whyChooseUs = [
  'Más de 12 años de experiencia acompañando organizaciones en Colombia.',
  'Más de 280 clientes atendidos exitosamente en múltiples sectores.',
  'Reducción promedio del 35% en costos operativos de nuestros clientes.',
  'Hasta 90% de reducción en el riesgo de sanciones normativas.',
]

const infoTabs = [
  { key: 'quienes', label: '¿Quiénes Somos?' },
  { key: 'servicios', label: 'Nuestros Servicios' },
  { key: 'porque', label: '¿Por qué Elegirnos?' },
  { key: 'contacto', label: 'Contáctanos' },
]

const timelineItems = [
  {
    image: '/assets/Servicio-cliente.png',
    title: 'Servicio al cliente',
    text: 'En nuestra empresa, el servicio al cliente es nuestra prioridad número uno. Nos esforzamos por brindar una experiencia excepcional a cada uno de nuestros clientes en cada interacción. Nuestro equipo de atención al cliente está altamente capacitado y dedicado a satisfacer sus necesidades y resolver cualquier pregunta o problema que pueda tener.',
  },
  {
    image: '/assets/SG-SST.png',
    title: 'SG-SST',
    text: 'El SG-SST se dedica a garantizar la seguridad y el bienestar en el entorno laboral. Nuestra prioridad es proporcionar soluciones efectivas en seguridad y salud en el trabajo. Contamos con un equipo altamente capacitado en normativas y medidas preventivas. Estamos aquí para acompañarlo en cualquier aspecto relacionado con la seguridad laboral: confíe en nosotros para un entorno laboral más seguro y saludable.',
  },
  {
    image: '/assets/Multimedia.png',
    title: 'Recursos',
    text: 'Contamos con una variedad de recursos, incluyendo videos educativos, infografías informativas y testimonios de clientes satisfechos. Estos recursos están diseñados para brindar información relevante y útil sobre SST y servicio al cliente, ayudando a nuestros clientes a comprender mejor estos temas y cómo pueden beneficiar a sus empresas.',
  },
]

function TimelineItem({ image, title, text, side, bodyText }) {
  const isLeft = side === 'left'
  return (
    <div className={`relative reveal sm:w-[45%] ${isLeft ? 'sm:mr-auto' : 'sm:ml-auto'}`}>
      <span
        className="hidden sm:block absolute rounded-full"
        style={{ [isLeft ? 'right' : 'left']: -41, top: 8, width: 14, height: 14, backgroundColor: '#b8860b', boxShadow: '0 0 0 4px var(--background)' }}
      />
      <img
        src={image}
        alt={title}
        className="w-full h-auto rounded-xl shadow-md mb-5"
        style={{ border: '1px solid var(--border)' }}
      />
      <h3 className="text-xl font-black mb-3" style={{ fontFamily: 'var(--font-display)', color: '#b8860b' }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: bodyText }}>{text}</p>
    </div>
  )
}

function highlightBrand(text) {
  const parts = text.split(/(Lidessa|Hydrobombas S\.A\.S\.?)/g)
  return parts.map((part, i) =>
    /Lidessa|Hydrobombas/.test(part)
      ? <strong key={i} style={{ color: '#b8860b' }}>{part}</strong>
      : part
  )
}

function CheckItem({ label, children }) {
  const isDark = useIsDarkTheme()
  const brandBlue = isDark ? '#84b6f4' : '#005187'
  return (
    <div className="flex items-start gap-3">
      <span
        className="shrink-0 flex items-center justify-center rounded-full text-white"
        style={{ width: 22, height: 22, marginTop: 1, fontSize: '0.65rem', fontWeight: 900, background: 'linear-gradient(135deg, #e6c158, #b8860b)', boxShadow: '0 2px 6px rgba(184,134,11,0.4)' }}
      >
        ✓
      </span>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
        {label && <strong style={{ color: brandBlue, fontFamily: 'var(--font-display)' }}>{label}: </strong>}
        {children}
      </p>
    </div>
  )
}

function CeoModal({ person, onClose }) {
  const isDark = useIsDarkTheme()
  const brandBlue = isDark ? '#84b6f4' : '#005187'
  const bodyText = isDark ? '#e4e4e7' : '#2a2a2a'

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.25s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl w-full max-w-2xl max-h-full overflow-y-auto"
        style={{ backgroundColor: 'var(--card)', animation: 'modalPop 0.4s cubic-bezier(0.22, 1, 0.36, 1)' }}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg z-10"
          style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
        >
          ×
        </button>

        <div className="flex flex-col sm:flex-row gap-6 p-6 sm:p-8">
          <div className="shrink-0 flex sm:block justify-center">
            <div
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden"
              style={{ border: '4px solid #d4af37', boxShadow: '0 0 22px rgba(212,175,55,0.5)' }}
            >
              <img
                src={person.image}
                alt={person.name}
                className="w-full h-full object-cover"
                style={{ objectPosition: person.imagePosition || 'center' }}
              />
            </div>
          </div>

          <div className="min-w-0 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#4d82bc' }}>Equipo directivo</p>
            <h2 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: brandBlue }}>
              {person.name}
            </h2>
            <p className="text-sm font-semibold mb-3" style={{ fontFamily: 'var(--font-display)', color: '#b8860b' }}>
              {person.role}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: bodyText }}>
              {person.bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const team = [
  {
    name: 'Lina Maria Aristizabal',
    role: 'Gerente',
    bio: 'Gerente y Fundadora de Lidessa, especialista en Diseño Curricular para IFTDH e IES, conferencista y especialista en SISTEMAS DE GESTIÓN. Se ha desempeñado como directora de IFTDH, Cogestora y Cofundadora de más de 10 Instituciones de educación para el trabajo y el desarrollo humano a nivel nacional y 7 de educación Formal, y de más de 10 empresas en otros sectores. Ha sido consultora en Gestión y Desarrollo de las Organizaciones en más de 70 empresas. Cuenta con experiencia como consultora en Diseño e implementación de Sistemas de Gestión de Calidad de diferentes sectores empresariales, como auditora de Sistemas de Gestión Ambientales, Calidad y SST, directora y rectora de diversas instituciones educativas, presidenta de la mesa Nacional de Consultoría Empresarial del SENA, evaluadora de Normas de competencia laboral y partícipe activa de otras mesas como Gestión del Riesgo, PYMES, BPO-KPO, y educativa.',
    image: '/assets/LINACEO-square.png',
  },
  {
    name: 'Diego Alonso Pérez',
    role: 'Sub Gerente',
    bio: 'Gerente y fundador de Hydrobombas S.A.S con Experiencia de 17 años en puestos directivos, desde hace 4 años asumió el rol de subgerente de Lidessa. Tecnólogo e ingeniero mecánico de profesión, con amplios conocimientos en neumática, hidráulica, manejo de herramientas técnicas y desarrollo de mediciones del campo. Ha recibido y perfeccionado sus habilidades con entrenamientos en enfermería, espacios confinados, trabajo en alturas, seguridad vial y manejo de extintores y protocolos contra incendios. Actualmente cuenta con certificaciones en primeros auxilios, supervisor de espacios confinados y coordinador de alturas, además de ser tallerista y conferencista en estas áreas. Su amplia experiencia le ha permitido especializarse en redes contra incendios RCI y mecanismos de prevención y control, esta misma trayectoria le ha aportado madurez y sólidas estructuras en la gestión del recurso humano, llevándolo a considerarse más que un líder, un miembro más de los equipos de intervención, y auto caracterizándose en tres palabras: "Conocimiento, experiencia y humanidad".',
    image: '/assets/CeoD.png',
  },
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
  { label: 'Enfoque Personalizado', text: 'Trabajamos estrechamente contigo para entender tus necesidades y ofrecer soluciones a medida.' },
  { label: 'Equipo Multidisciplinario', text: 'Contamos con expertos en diversas áreas para brindarte un servicio integral.' },
  { label: 'Experiencia Comprobada', text: 'Más de una década de experiencia respaldan nuestra calidad y excelencia.' },
  { label: 'Reducción de Costos', text: 'Nuestras soluciones eficientes pueden ayudarte a ahorrar recursos.' },
  { label: 'Compromiso con la Excelencia', text: 'Nuestra misión es superar tus expectativas y garantizar tu satisfacción.' },
  { label: 'Cercanía', text: 'Nos destacamos por trabajar por y para nuestros clientes. Sabemos que el empleado es fundamental para una empresa; entendemos que un buen apoyo a la administración hace la diferencia en el correcto manejo de una organización.' },
  { label: null, text: 'Somos claros en la actualización de la normativa, así que siempre estamos al corriente de la reglamentación.' },
]

export default function About() {
  const pageRef = useScrollReveal('reveal')
  useScrollReveal('reveal-left')
  useScrollReveal('reveal-scale')
  const isDark = useIsDarkTheme()
  const brandBlue = isDark ? '#84b6f4' : '#005187'
  const brandNavy = isDark ? '#84b6f4' : '#0a2540'
  const bodyText = isDark ? '#e4e4e7' : '#2a2a2a'
  const [activeCeo, setActiveCeo] = useState(null)
  const [infoTab, setInfoTab] = useState('quienes')
  const [pqrsfOpen, setPqrsfOpen] = useState(false)

  const logoVideoRef = useRef(null)
  const logoSectionRef = useRef(null)
  const hasPlayedLogoRef = useRef(false)

  useEffect(() => {
    const section = logoSectionRef.current
    const video = logoVideoRef.current
    if (!section || !video) return

    const playForCurrentTheme = () => {
      const nextSrc = isDark ? '/assets/modooscuro-logo.mp4' : '/assets/lidessa.mp4'
      if (video.getAttribute('data-src') === nextSrc) return
      video.setAttribute('data-src', nextSrc)
      video.src = nextSrc
      video.currentTime = 0
      video.load()
      video.play()
    }

    if (hasPlayedLogoRef.current) {
      playForCurrentTheme()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          hasPlayedLogoRef.current = true
          playForCurrentTheme()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [isDark])

  return (
    <div ref={pageRef}>

      {/* Hero */}
      <section
        className="py-28 relative overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(0,81,135,0.88) 0%, rgba(61,49,21,0.85) 50%, rgba(20,20,20,0.92) 100%), url(/assets/nosotros-hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '20%', right: '10%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(77,130,188,0.2) 0%, transparent 70%)', animation: 'orb1 12s ease-in-out infinite' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6" style={{ animation: 'fadeUp 0.7s ease forwards' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#84b6f4', fontFamily: 'var(--font-display)' }}>Conózcanos</p>
          <h1 className="font-black text-white mb-5" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 5vw, 3.4rem)' }}>
            Más que consultoría,<br />
            <span style={{ color: '#84b6f4' }}>resultados que transforman</span>
          </h1>
          <p className="text-lg max-w-xl" style={{ color: '#c4dafa', fontFamily: 'var(--font-display)' }}>
            12 años ayudando a empresas e instituciones colombianas a cumplir la norma y alcanzar la excelencia organizacional.
          </p>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, overflow: 'hidden' }}>
          <svg viewBox="0 0 1440 50" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path d="M0,25 C360,50 1080,0 1440,25 L1440,50 L0,50 Z" fill="var(--background)" />
          </svg>
        </div>
      </section>

      {/* Acronym */}
      <section ref={logoSectionRef} className="py-16" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex justify-center mb-12 reveal-scale">
            <div className="rounded-2xl px-10 py-5 shadow-lg" style={{ background: 'linear-gradient(135deg, #005187 0%, #4d82bc 55%, #b8860b 100%)' }}>
              <h2 className="text-2xl sm:text-3xl font-black text-center text-white" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.4em' }}>
                LIDESSA
              </h2>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-10 items-center">
            <div className="md:col-span-2 space-y-4">
              {acronym.map((a, i) => (
                <div key={i} className={`flex items-start gap-4 reveal-left stagger-${i + 1}`}>
                  <span className="text-2xl font-black shrink-0" style={{ fontFamily: 'var(--font-display)', color: '#4d82bc' }}>
                    {a.letter}
                  </span>
                  <p className="text-sm leading-relaxed pt-1" style={{ color: bodyText }}>
                    <strong style={{ color: brandBlue, fontFamily: 'var(--font-display)' }}>{a.value}.</strong> {a.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-center reveal-scale">
              <div style={{ backgroundColor: 'var(--muted)' }}>
                <video
                  ref={logoVideoRef}
                  muted
                  playsInline
                  preload="auto"
                  style={{ width: 'min(280px, 65vw)', mixBlendMode: isDark ? 'screen' : 'multiply', display: 'block' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex justify-center mb-12 reveal-scale">
          <div className="rounded-2xl px-10 py-5 shadow-lg" style={{ background: 'linear-gradient(135deg, #005187 0%, #4d82bc 55%, #b8860b 100%)' }}>
            <h2 className="text-2xl sm:text-3xl font-black text-center text-white" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.4em' }}>
              CEOS
            </h2>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-12">
          {team.map((p, i) => (
            <button
              key={p.name}
              onClick={() => setActiveCeo(p)}
              className={`text-center reveal stagger-${i + 1}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-10px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <span style={{ width: 36, height: 1, backgroundColor: '#d4af37' }} />
                <span style={{ color: '#d4af37', fontSize: '0.8rem' }}>✦</span>
                <span style={{ width: 36, height: 1, backgroundColor: '#d4af37' }} />
              </div>
              <h3 className="font-black text-xl leading-tight" style={{ fontFamily: 'var(--font-display)', color: brandNavy }}>
                {p.name}
              </h3>
              <div className="flex items-center justify-center gap-2 mt-1.5 mb-6">
                <span style={{ width: 22, height: 1, backgroundColor: '#d4af37' }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#b8860b' }}>{p.role}</span>
                <span style={{ width: 22, height: 1, backgroundColor: '#d4af37' }} />
              </div>

              <div className="relative mx-auto" style={{ width: 190, height: 210, marginTop: 14, marginBottom: 26 }}>
                <div
                  className="absolute"
                  style={{ top: -14, left: -14, width: 190, height: 210, border: '2px solid #d4af37' }}
                />
                <div
                  className="absolute overflow-hidden"
                  style={{
                    inset: 0,
                    transition: 'box-shadow 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: p.imagePosition || 'center' }}
                  />
                </div>
                <span className="absolute" style={{ top: -12, left: -12, width: 26, height: 26, background: 'linear-gradient(135deg, #e6c158, #b8860b)' }} />
                <span className="absolute" style={{ bottom: -12, right: -12, width: 26, height: 26, background: 'linear-gradient(135deg, #e6c158, #b8860b)' }} />
              </div>

              <div className="flex items-center justify-center gap-2 mb-4">
                <span style={{ width: 28, height: 1, backgroundColor: '#d4af37' }} />
                <span style={{ color: '#d4af37', fontSize: '0.7rem' }}>✦</span>
                <span style={{ width: 28, height: 1, backgroundColor: '#d4af37' }} />
              </div>

              <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: bodyText }}>
                {highlightBrand(p.bio.slice(0, 130).trim())}…
              </p>

              <span
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full"
                style={{ background: 'linear-gradient(135deg, #005187 0%, #4d82bc 55%, #b8860b 100%)', boxShadow: '0 4px 14px rgba(0,81,135,0.3)' }}
              >
                <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ border: '1px solid rgba(255,255,255,0.6)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
                  </svg>
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-white">Ver perfil completo</span>
                <span className="text-white">→</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Info tabs */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 reveal">
          <img
            src={isDark ? '/assets/logo-outline-dark.png' : '/assets/logo-light.png'}
            alt="Lidessa"
            className="w-16 h-16 object-contain mx-auto mb-4"
          />
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4d82bc' }}>Conózcanos a fondo</p>
          <h2 className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
            Todo lo que necesita <span className="gradient-text">saber de nosotros</span>
          </h2>
        </div>

        <div className="rounded-2xl shadow-xl overflow-hidden reveal" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
          <div
            className="flex flex-wrap justify-center gap-2 p-3.5"
            style={{ background: 'linear-gradient(135deg, #005187 0%, #4d82bc 55%, #b8860b 100%)' }}
          >
            {infoTabs.map(t => (
              <button
                key={t.key}
                onClick={() => setInfoTab(t.key)}
                className="px-5 py-2.5 rounded-full text-sm font-bold"
                style={{
                  fontFamily: 'var(--font-display)',
                  backgroundColor: infoTab === t.key ? 'white' : 'transparent',
                  color: infoTab === t.key ? '#005187' : 'rgba(255,255,255,0.85)',
                  boxShadow: infoTab === t.key ? '0 4px 14px rgba(0,0,0,0.2)' : 'none',
                  transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-10">
            {infoTab === 'quienes' && (
              <div className="grid md:grid-cols-2 gap-10 items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4d82bc' }}>Nuestra historia</p>
                  <h3 className="text-2xl font-black mb-4" style={{ fontFamily: 'var(--font-display)' }}>¿Quiénes somos?</h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: bodyText }}>
                    En Lidessa, no somos simplemente una empresa; nos consideramos un verdadero aliado estratégico en tu camino hacia el éxito empresarial. Con más de una década de experiencia en el mercado, nuestro compromiso con la excelencia y la innovación nos ha permitido desarrollar una profunda comprensión de las necesidades empresariales y de los desafíos del mercado actual.
                  </p>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: bodyText }}>
                    Desde nuestros inicios, hemos trabajado incansablemente para ofrecer soluciones integrales que no solo impulsan el crecimiento y la eficiencia de las empresas, sino que también aseguran la conformidad con las normativas vigentes. Nuestra amplia gama de servicios está diseñada para atender a empresas de todos los tamaños y sectores, adaptándonos a sus necesidades específicas para proporcionar soluciones personalizadas que realmente marquen la diferencia.
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: bodyText }}>
                    Nos enorgullece ofrecer un enfoque proactivo y orientado a resultados. Nuestro equipo de expertos está dedicado a entender a fondo tu negocio y a trabajar junto a ti para diseñar e implementar estrategias que optimicen tus operaciones, mejoren la eficiencia y fortalezcan tu posición en el mercado. Creemos que el éxito de nuestros clientes es nuestro propio éxito, y es por eso que ponemos todo nuestro conocimiento y recursos a tu disposición.
                  </p>
                </div>
                <div className="md:border-l md:pl-10" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4d82bc' }}>Nuestra ventaja</p>
                  <h3 className="text-2xl font-black mb-4" style={{ fontFamily: 'var(--font-display)' }}>¿Qué nos diferencia de los demás?</h3>
                  <div className="space-y-3">
                    {differentials.map((d, i) => (
                      <CheckItem key={i} label={d.label}>{d.text}</CheckItem>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {infoTab === 'servicios' && (
              <div>
                <div className="text-center mb-8">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4d82bc' }}>Lo que hacemos</p>
                  <h3 className="text-2xl font-black" style={{ fontFamily: 'var(--font-display)' }}>Nuestros Servicios</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-10 items-start mb-12">
                  <div>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: bodyText }}>
                      Lidessa, con más de 15 años de experiencia en procesos de consultoría de gestión, ha acompañado a más de 350 empresarios a nivel nacional en la gestión del cumplimiento normativo. Con un amplio portafolio empresarial, llegamos a nuestros usuarios con beneficios integradores que les permiten efectividad y eficiencia en el alcance de sus objetivos.
                    </p>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: bodyText }}>
                      Para facilitarle al empresario el acceso a recurso humano de alta calidad, nuestros servicios son desarrollados y orientados bajo un modelo de gestión potencializador interno.
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: bodyText }}>
                      Con el modelo de gestión KPO (Knowledge Process Outsourcing), la empresa entrega la gestión a un tercero denominado Lidessa, en aras de garantizar ventajas competitivas y reducción de costos, logrando potenciar las actividades de cumplimiento normativo asociadas al alcance mediante la tercerización de procesos de conocimiento. Es un modelo que garantiza el bienestar de la empresa por medio de procesos y equipos interdisciplinarios que se ponen a disposición de la organización, brindando acompañamiento permanente y apoyo con información actualizada sobre cambios de normativas y obligaciones empresariales.
                    </p>
                  </div>
                  <div className="md:border-l md:pl-10" style={{ borderColor: 'var(--border)' }}>
                    <div className="space-y-3">
                      <CheckItem>Más de 15 años de experiencia en consultoría de gestión.</CheckItem>
                      <CheckItem>Más de 350 empresarios acompañados a nivel nacional.</CheckItem>
                      <CheckItem>Hasta 70% de reducción en costos de recurso humano.</CheckItem>
                      <CheckItem>Hasta 89% de reducción en el riesgo de sanción.</CheckItem>
                    </div>
                  </div>
                </div>

                <div className="mb-12">
                  <div className="text-center mb-6">
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4d82bc' }}>Nuestro modelo</p>
                    <h3 className="text-2xl font-black" style={{ fontFamily: 'var(--font-display)' }}>Beneficios y proceso</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6 items-start max-w-5xl mx-auto">
                    <img src="/assets/descripcion2.png" alt="Beneficios de utilizar un equipo de outsourcing" className="w-full h-auto rounded-xl shadow-md mx-auto" style={{ border: '1px solid var(--border)' }} />
                    <img src="/assets/etapas_procesos.png" alt="Etapas de los procesos de gestión" className="w-full h-auto rounded-xl shadow-md mx-auto" style={{ border: '1px solid var(--border)' }} />
                  </div>
                </div>

                <div className="mb-12">
                  <div className="text-center mb-6">
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4d82bc' }}>Cómo trabajamos</p>
                    <h3 className="text-2xl font-black" style={{ fontFamily: 'var(--font-display)' }}>Metodología del Servicio</h3>
                  </div>
                  <div className="space-y-4 max-w-4xl mx-auto">
                    <p className="text-sm leading-relaxed" style={{ color: bodyText }}>
                      Según el tamaño y las condiciones de la entidad se establecen una cantidad mínima de horas presenciales, que se distribuyen en el año a necesidad y según actividad; por ejemplo, una capacitación puede durar 2 horas, pero una inspección locativa de 8 a 16 horas o más según el tamaño del edificio. Por lo tanto, las actividades se distribuyen según horas asignadas en el plan de priorización que se desarrolla al iniciar el proceso. Las actividades a distancia, por su parte, no cuentan con límite de tiempo establecido: nuestro equipo empleará el tiempo que sea necesario para su gestión y desarrollo. Es muy importante tener en cuenta que muchas de las actividades requieren la ejecución previa de otras para su finalización.
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: bodyText }}>
                      Según informes presentados por el BBVA, las MiPymes son el 99,5% del universo empresarial formal colombiano. El 58% de las MiPymes formales tienen menos de 5 años de operación y el 22% son empresas consolidadas con más de 10 años de vida; el 20% de las micro están consolidadas, el 44% de las pequeñas, el 63% de las medianas y el 71% de las grandes.
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: bodyText }}>
                      La capacidad de las microempresas de generar empleo contrasta con su tendencia a hacerlo de manera informal: el 15% del empleo que generan es formal y el 85% informal (lo que representa el 94% del empleo informal nacional). La formalidad empresarial no es fácil en el sector de las mipymes y es heterogénea por sectores y por tamaño de la empresa; los altos costos del recurso humano y los grandes cambios normativos obligan al empresario a dotarse de recurso humano diverso y especialista, que de tenerlo de tiempo completo dispararía los costos de nómina volviéndolas insostenibles. Es por ello que la tendencia al outsourcing, cada vez más en crecimiento, facilita al empresario el acceso a recurso humano cualificado a costos más asequibles sin perder principios de calidad y eficiencia.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {infoTab === 'porque' && (
              <div>
                <div className="text-center mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4d82bc' }}>Nuestros resultados</p>
                  <h3 className="text-2xl font-black" style={{ fontFamily: 'var(--font-display)' }}>¿Por qué elegirnos?</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  {whyChooseUs.map((reason, i) => (
                    <CheckItem key={i}>{reason}</CheckItem>
                  ))}
                </div>

                <p className="text-sm leading-relaxed text-center max-w-2xl mx-auto mt-8" style={{ color: bodyText }}>
                  Más de 15 años de experiencia respaldan nuestro compromiso con la excelencia. Estamos aquí para acompañarlo en el logro de sus metas empresariales, trabajando incansablemente por la seguridad de nuestros clientes y ofreciendo soluciones sólidas y confiables. Contáctenos hoy mismo y sea parte de este camino hacia el crecimiento y la prosperidad empresarial.
                </p>

                <div className="max-w-2xl mx-auto mt-10 p-6 rounded-2xl" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                  <p className="text-4xl font-black mb-2" style={{ color: '#84b6f4', lineHeight: 1 }}>"</p>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: bodyText }}>
                    Le doy un cordial saludo a la Doctora Lina Aristizabal y al equipo de Lidessa. Quiero agradecer su gran aporte en el proyecto y proceso de legalización del Centro Étnico de Educación Laboral de Colombia (CETELCO), en el Urabá antioqueño y chocoano. Recomiendo ampliamente sus servicios: soy una persona exigente y, gracias a Dios, han cumplido y superado las expectativas.
                  </p>
                  <p className="text-sm font-bold" style={{ color: brandBlue }}>Lic. Marco Bonett</p>
                  <p className="text-xs" style={{ color: bodyText }}>Representante legal, Centro Étnico de Educación Laboral de Colombia (CETELCO)</p>
                </div>
              </div>
            )}

            {infoTab === 'contacto' && (
              <div className="grid sm:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4d82bc' }}>Hablemos</p>
                  <h3 className="text-2xl font-black mb-4" style={{ fontFamily: 'var(--font-display)' }}>Contáctanos</h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: bodyText }}>
                    Escríbanos y un asesor le atenderá a la brevedad para resolver sus dudas o iniciar su proceso de consultoría.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a href="https://wa.me/573001234567" target="_blank" rel="noreferrer"
                      className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                      style={{ backgroundColor: '#25D366', transition: 'opacity 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      💬 WhatsApp
                    </a>
                    <a href="mailto:comercial@lidessa.co"
                      className="px-5 py-2.5 rounded-xl text-sm font-bold"
                      style={{ border: '2px solid var(--border)', color: 'var(--foreground)', transition: 'background-color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      📧 comercial@lidessa.co
                    </a>
                  </div>
                </div>
                <ul className="space-y-3 text-sm" style={{ color: bodyText }}>
                  <li className="flex items-start gap-2"><span>📍</span> Cra. 71 #46-28, Laureles, Medellín, Antioquia</li>
                  <li className="flex items-start gap-2"><span>📱</span> +57 300 123 4567 (General)</li>
                  <li className="flex items-start gap-2"><span>📱</span> +57 300 987 6543 (Comercial)</li>
                  <li className="flex items-start gap-2"><span>📧</span> mercadeo@lidessa.co</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Timeline: Servicio al cliente / SG-SST / Recursos */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative">
          <div className="hidden sm:block absolute" style={{ left: '50%', top: 0, bottom: 0, width: 2, backgroundColor: 'var(--border)', transform: 'translateX(-50%)' }} />
          <div className="flex flex-col gap-14">
            {timelineItems.map((item, i) => (
              <TimelineItem key={item.title} {...item} side={i % 2 === 0 ? 'left' : 'right'} bodyText={bodyText} />
            ))}
          </div>
        </div>
      </section>

      {/* PQRSF prompt */}
      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center rounded-2xl p-8 reveal" style={{ border: '1px solid #d4af37', backgroundColor: 'var(--card)' }}>
          <h3 className="text-2xl font-black mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            ¿Tienes alguna duda o sugerencia?
          </h3>
          <p className="text-sm font-semibold mb-6" style={{ color: '#b8860b' }}>
            Contáctanos, o envíanos tu comentario aquí
          </p>
          <button
            onClick={() => setPqrsfOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold"
            style={{ backgroundColor: '#e6b93d', color: '#1a1a1a', transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            📧 PQRSF
          </button>
        </div>
      </section>

      {/* Office / map */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="reveal-left">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4d82bc' }}>Encuéntrenos</p>
            <h2 className="text-3xl font-black mb-4" style={{ fontFamily: 'var(--font-display)' }}>Nuestra oficina</h2>
            <p className="text-sm mb-5" style={{ color: bodyText }}>
              Estamos en el corazón de Medellín, disponibles para atención presencial y virtual en todo el territorio nacional.
            </p>
            <ul className="space-y-3 text-sm">
              {[
                { icon: '📍', text: 'Cra. 71 #46-28, Laureles, Medellín, Antioquia' },
                { icon: '📞', text: '+57 300 123 4567', href: 'https://wa.me/573001234567' },
                { icon: '📧', text: 'info@lidessa.co', href: 'mailto:info@lidessa.co' },
              ].map(c => (
                <li key={c.text}>
                  {c.href
                    ? <a href={c.href} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2"
                        style={{ color: brandBlue, fontWeight: 600, transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#4d82bc'}
                        onMouseLeave={e => e.currentTarget.style.color = brandBlue}
                      >
                        <span>{c.icon}</span> {c.text}
                      </a>
                    : <span className="flex items-center gap-2" style={{ color: 'var(--foreground)', fontWeight: 600 }}>
                        <span>{c.icon}</span> {c.text}
                      </span>
                  }
                </li>
              ))}
            </ul>
          </div>
          <div
            className="rounded-2xl overflow-hidden reveal-scale"
            style={{ height: 320, border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,81,135,0.12)' }}
          >
            <iframe
              title="Ubicación Lidessa"
              src="https://www.google.com/maps?q=Cra.%2071%20%2346-28%2C%20Laureles%20-%20Estadio%2C%20Medell%C3%ADn%2C%20Laureles%2C%20Medell%C3%ADn%2C%20Antioquia&output=embed"
              width="100%" height="100%"
              style={{ border: 0 }}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {activeCeo && <CeoModal person={activeCeo} onClose={() => setActiveCeo(null)} />}
      {pqrsfOpen && <PQRSFModal onClose={() => setPqrsfOpen(false)} />}
    </div>
  )
}
