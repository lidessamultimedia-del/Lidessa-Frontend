import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useBlog } from '@/features/blog/context/BlogContext'
import BlogModal from '@/features/blog/components/BlogModal'
import { useServicesData } from '@/features/services/context/ServicesDataContext'
import ServiceModal from '@/features/services/components/ServiceModal'
import ClientMarquee from '@/shared/components/ClientMarquee'
import LogoRevealSection from '@/shared/components/LogoRevealSection'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'
import { clients } from '@/shared/data/clients'
import { MapPin, Phone, Mail, Check } from '@/shared/components/Icons'

const allyNames = ['Dental Service', 'Hydro Bombas', 'Converge', 'CEET', 'Ópticas Visión Éxito']
const allies = allyNames.map(n => clients.find(c => c.name === n)).filter(Boolean)
const alliesLoop = [...allies, ...allies]

const FEATURED_SERVICE_IMAGES = {
  'seguridad-salud': '/assets/Inicio-destacados-sst.png',
  'manejo-residuos': '/assets/PMIRS.png',
  'evaluacion-docente': '/assets/PBR.png',
  'proyecto-educativo': '/assets/disenoPEI.png',
  'manuales-convivencia': '/assets/InstitucionesEducativasCarta.png',
  'formacion-medida': '/assets/Capacitacion.png',
}

const pillarIcons = {
  trophy: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6 M18 9h1.5a2.5 2.5 0 0 0 0-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0 0 12 0V2Z',
  refresh: 'M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8 M3 3v5h5 M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16 M16 16h5v5',
  star: 'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.6 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.363 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z',
}

const attributes = [
  { icon: pillarIcons.trophy, title: 'Liderazgo', points: ['Validación de procesos internos', 'Gestión proactiva de riesgos', 'Técnicas de trabajo colaborativo'] },
  { icon: pillarIcons.refresh, title: 'Transformación', points: ['Cambio organizacional sostenible', 'Desarrollo de capacidades internas', 'Crecimiento empresarial continuo'] },
  { icon: pillarIcons.star, title: 'Compromiso', points: ['Empresa especializada y certificada', 'Excelencia en cada entrega', 'Actualización normativa permanente'] },
]


export default function Home() {
  const { posts: blogPosts } = useBlog()
  const { services } = useServicesData()
  const featuredServices = Object.entries(FEATURED_SERVICE_IMAGES)
    .map(([slug, image]) => {
      const service = services.find(s => s.slug === slug && s.active !== false)
      return service ? { ...service, image } : null
    })
    .filter(Boolean)
  const [selectedPost, setSelectedPost] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const pageRef = useScrollReveal('reveal')
  useScrollReveal('reveal-left')
  useScrollReveal('reveal-scale')

  // Animated hero words
  const words = ['excelencia', 'cumplimiento', 'confianza', 'transformación']
  const [wordIdx, setWordIdx] = useState(0)
  const [fade, setFade] = useState(true)
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setWordIdx(i => (i + 1) % words.length)
        setFade(true)
      }, 300)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div ref={pageRef}>

      {/* ── Hero ── */}
      <section
        className="relative min-h-[90vh] flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #10294d 0%, #071426 55%, #0c0c0c 100%)' }}
      >
        {/* Animated orbs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '10%', right: '15%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(77,130,188,0.25) 0%, transparent 70%)', animation: 'orb1 14s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '5%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(132,182,244,0.18) 0%, transparent 70%)', animation: 'orb2 18s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 600, height: 600, transform: 'translate(-50%,-50%)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,81,135,0.12) 0%, transparent 65%)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 w-full grid lg:grid-cols-2 gap-14 items-center">
          {/* Copy */}
          <div style={{ animation: 'fadeUp 0.7s ease forwards' }}>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
              style={{ backgroundColor: 'rgba(77,130,188,0.25)', color: '#84b6f4', border: '1px solid rgba(132,182,244,0.3)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#84b6f4', display: 'inline-block' }} />
              Consultoría · CEET · Cumplimiento normativo
            </div>
            <h1 className="font-black leading-tight text-white mb-5"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)' }}>
              Su aliado en
              <br />
              <span
                style={{
                  color: '#84b6f4',
                  display: 'inline-block',
                  opacity: fade ? 1 : 0,
                  transform: fade ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                  minWidth: '260px',
                }}
              >
                {words[wordIdx]}
              </span>
              <br />
              <span style={{ color: '#c4dafa' }}>organizacional</span>
            </h1>
            <p className="text-lg leading-relaxed mb-8" style={{ color: '#84b6f4', maxWidth: 480 }}>
              Acompañamos a empresas, conjuntos residenciales e instituciones educativas a cumplir la normativa vigente, optimizar procesos y desarrollar a su equipo.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/nosotros"
                className="px-7 py-3.5 rounded-xl text-sm font-bold text-white btn-shimmer"
                style={{ display: 'inline-block' }}
              >
                Quiénes somos
              </Link>
              <a href="https://wa.me/573016280574?text=Hola, quisiera una asesoría"
                target="_blank" rel="noreferrer"
                className="px-7 py-3.5 rounded-xl text-sm font-bold"
                style={{
                  border: '2px solid rgba(201,162,39,0.6)',
                  color: '#e8c766',
                  transition: 'background-color 0.25s, border-color 0.25s',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(201,162,39,0.14)'; e.currentTarget.style.borderColor = '#e8c766' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(201,162,39,0.6)' }}
              >
                Solicitar asesoría →
              </a>
            </div>
          </div>

          <div className="flex justify-center reveal-scale">
            <div style={{ position: 'relative', width: 'min(440px, 85vw)', height: 'min(440px, 85vw)', transform: 'translateY(-32px)' }}>
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
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
                }}
              >
                <img
                  src="/assets/DD.png"
                  alt="Equipo Lidessa"
                  className="w-full h-full object-cover"
                  style={{ transition: 'transform 0.4s ease' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
              <img
                src="/assets/logolidessa.png"
                alt=""
                style={{ position: 'absolute', bottom: 0, right: 0, width: 120, height: 120 }}
              />
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, overflow: 'hidden' }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="var(--background)" />
          </svg>
        </div>
      </section>

      {/* ── Clients marquee ── */}
      <ClientMarquee />
      <LogoRevealSection />

      {/* ── Attributes + counters ── */}
      <section className="pt-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 reveal">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4d82bc' }}>Por qué elegirnos</p>
          <h2 className="text-4xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
            Nuestros <span className="gradient-text">pilares</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {attributes.map((a, i) => (
            <div key={i}
              className={`rounded-2xl p-7 card-interactive glow-hover reveal stagger-${i + 1}`}
              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, #005187 0%, #4d82bc 100%)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={a.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: '#005187' }}>{a.title}</h3>
              <ul className="space-y-1.5">
                {a.points.map((p, j) => (
                  <li key={j} className="text-sm flex items-start gap-2" style={{ color: 'var(--muted-foreground)' }}>
                    <span style={{ color: '#4d82bc', marginTop: 2 }}><Check size={13} strokeWidth="3" /></span> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* CTA card */}
          <Link to="/nosotros"
            className="rounded-2xl p-7 flex flex-col justify-between reveal stagger-4 card-interactive"
            style={{ background: 'linear-gradient(135deg, #005187 0%, #4d82bc 100%)', color: 'white' }}
          >
            <div>
              <p className="text-xs uppercase tracking-widest font-bold mb-3 opacity-70">Sobre nosotros</p>
              <h3 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
                12 años construyendo excelencia organizacional
              </h3>
            </div>
            <span
              className="mt-6 inline-block px-4 py-2.5 rounded-xl text-sm font-bold text-center w-fit"
              style={{ backgroundColor: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              Quiénes somos →
            </span>
          </Link>
        </div>
      </section>

      {/* ── Featured services ── */}
      <section className="py-20" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 reveal">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4d82bc' }}>Lo que hacemos</p>
            <h2 className="text-4xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
              Servicios <span className="gradient-text">destacados</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {featuredServices.map((s, i) => (
              <button
                type="button"
                onClick={() => setSelectedService(s)}
                key={s.slug}
                className={`block w-full text-left rounded-2xl p-3 card-interactive glow-hover reveal stagger-${(i % 3) + 1}`}
                style={{ backgroundColor: 'var(--card)', border: '1px solid rgba(77,130,188,0.35)' }}
              >
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(77,130,188,0.25)' }}>
                  <img src={s.image} alt={s.title} className="w-full h-auto block"
                    style={{ transition: 'transform 0.5s ease' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
                <h3 className="font-bold text-base text-center mt-4 mb-2" style={{ fontFamily: 'var(--font-display)', color: '#005187' }}>
                  {s.title}
                </h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Business units ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-2xl p-8 relative overflow-hidden card-interactive reveal"
            style={{ background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)' }}
          >
            <div style={{ position: 'absolute', right: -30, top: -30, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.2), transparent)', pointerEvents: 'none' }} />
            <div className="relative">
              <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-4"
                style={{ backgroundColor: 'rgba(52,211,153,0.2)', color: '#34D399', border: '1px solid rgba(52,211,153,0.3)' }}>
                CEET
              </span>
              <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Cursos certificados en línea
              </h3>
              <p className="text-sm mb-6" style={{ color: '#6EE7B7' }}>
                Capacitaciones en SST, ISO, gestión educativa y habilidades gerenciales. Modalidad virtual, presencial y mixta.
              </p>
              <Link to="/formacion"
                className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ backgroundColor: '#10B981', transition: 'opacity 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                Ver cursos →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Blog ── */}
      <section className="py-20" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4 reveal">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4d82bc' }}>Converge</p>
              <h2 className="text-4xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
                Novedades del <span className="gradient-text">sector</span>
              </h2>
            </div>
            <Link to="/blog" className="text-sm font-bold"
              style={{ color: '#4d82bc', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#005187'}
              onMouseLeave={e => e.currentTarget.style.color = '#4d82bc'}
            >
              Ver todos →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.slice(0, 3).map((post, i) => (
              <div key={post.id} className={`flip-card h-95 reveal-scale stagger-${i + 1}`}>
                <div className="flip-card-inner">
                  {/* Front — image poster */}
                  <div className="flip-card-front rounded-2xl overflow-hidden cursor-pointer"
                    style={{ backgroundColor: 'var(--secondary)', border: '1px solid var(--border)' }}
                    onClick={() => setSelectedPost(post)}>
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.15) 55%, transparent)' }} />
                    <div className="absolute top-3 right-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#c4dafa', color: '#005187' }}>
                        {post.category}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <span className="text-xs" style={{ color: '#cbd5e1' }}>{post.date}</span>
                      <h3 className="font-bold text-lg mt-1 leading-snug text-white" style={{ fontFamily: 'var(--font-display)' }}>
                        {post.title}
                      </h3>
                    </div>
                  </div>

                  {/* Back — details */}
                  <div className="flip-card-back rounded-2xl overflow-hidden p-5 flex flex-col cursor-pointer"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                    onClick={() => setSelectedPost(post)}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#c4dafa', color: '#005187' }}>
                        {post.category}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{post.date}</span>
                    </div>
                    <h3 className="font-bold text-base mb-3 leading-snug" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                      {post.title}
                    </h3>
                    <p className="text-sm mb-4 leading-relaxed flex-1 overflow-hidden" style={{ color: 'var(--muted-foreground)' }}>
                      {post.excerpt}
                    </p>
                    <button className="text-sm font-bold inline-flex items-center gap-1"
                      style={{ color: '#4d82bc', transition: 'color 0.2s, gap 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#005187'; e.currentTarget.style.gap = '6px' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#4d82bc'; e.currentTarget.style.gap = '4px' }}
                    >
                      Más información <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Map ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="reveal-left">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4d82bc' }}>Encuéntrenos</p>
            <h2 className="text-3xl font-black mb-4" style={{ fontFamily: 'var(--font-display)' }}>Nuestra oficina</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>
              Estamos en el corazón de Medellín, disponibles para atención presencial y virtual en todo el territorio nacional.
            </p>
            <ul className="space-y-3 text-sm">
              {[
                { icon: MapPin, text: 'Cra. 71 #46-28, Laureles, Medellín, Antioquia' },
                { icon: Phone, text: '+57 301 628 0574', href: 'https://wa.me/573016280574' },
                { icon: Mail, text: 'info@lidessa.co', href: 'mailto:info@lidessa.co' },
              ].map(c => (
                <li key={c.text}>
                  {c.href
                    ? <a href={c.href} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2"
                        style={{ color: '#005187', fontWeight: 600, transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#4d82bc'}
                        onMouseLeave={e => e.currentTarget.style.color = '#005187'}
                      >
                        <c.icon size={15} /> {c.text}
                      </a>
                    : <span className="flex items-center gap-2" style={{ color: 'var(--foreground)', fontWeight: 600 }}>
                        <c.icon size={15} /> {c.text}
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

      {/* ── Allies ── */}
      <section className="py-14 overflow-hidden" style={{ backgroundColor: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
        <p className="text-center text-xs font-bold uppercase tracking-widest mb-6 reveal" style={{ color: 'var(--muted-foreground)' }}>
          Aliados estratégicos
        </p>
        <div className="relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
          <div className="flex gap-6 animate-marquee w-max">
            {alliesLoop.map((a, i) => (
              <div key={i}
                title={a.name}
                className="flex items-center justify-center rounded-xl cursor-default select-none shrink-0 card-interactive"
                style={{
                  height: 76,
                  width: 150,
                  padding: '10px 18px',
                  backgroundColor: a.dark ? '#1a1a1a' : 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                <img
                  src={a.logo}
                  alt={a.name}
                  className="max-h-full max-w-full"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedPost && <BlogModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
      {selectedService && (
        <ServiceModal
          service={selectedService}
          image={selectedService.image}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  )
}
