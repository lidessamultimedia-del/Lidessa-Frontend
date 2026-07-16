import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { megaMenu } from '@/shared/data/megaMenu'
import { blogPosts } from '@/features/blog/data/blogPosts'
import BlogModal from '@/features/blog/components/BlogModal'
import ClientMarquee from '@/shared/components/ClientMarquee'
import AnimatedCounter from '@/shared/components/AnimatedCounter'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'

const featuredServices = [
  { slug: 'seguridad-salud', title: 'Seguridad y salud en el trabajo', description: 'Diseñamos e implementamos el SG-SST de su empresa cumpliendo el Decreto 1072 y la Resolución 0312 con acompañamiento integral.', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop&auto=format' },
  { slug: 'manejo-residuos', title: 'Plan de manejo de residuos sólidos', description: 'Elaboramos planes PGIRS conformes al Decreto 1076/2015 promoviendo prácticas sostenibles y el cumplimiento ambiental.', image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&h=400&fit=crop&auto=format' },
  { slug: 'evaluacion-docente', title: 'Evaluación de riesgo psicosocial', description: 'Aplicamos la batería de instrumentos del Ministerio del Trabajo para la identificación y evaluación del riesgo psicosocial laboral.', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop&auto=format' },
  { slug: 'proyecto-educativo', title: 'Proyecto educativo institucional', description: 'Acompañamos colegios en la construcción del PEI articulando misión, modelo pedagógico y planes de mejoramiento.', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop&auto=format' },
  { slug: 'manuales-convivencia', title: 'Gestión para instituciones educativas', description: 'Diseñamos manuales de convivencia, mallas curriculares y sistemas de evaluación conforme a la normativa del MEN.', image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=400&fit=crop&auto=format' },
  { slug: 'formacion-medida', title: 'Formación a la medida', description: 'Diseñamos programas de capacitación corporativa personalizados, adaptados a los objetivos estratégicos de su organización.', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop&auto=format' },
]

const attributes = [
  { icon: '🏆', title: 'Liderazgo', points: ['Validación de procesos internos', 'Gestión proactiva de riesgos', 'Técnicas de trabajo colaborativo'] },
  { icon: '🔄', title: 'Transformación', points: ['Cambio organizacional sostenible', 'Desarrollo de capacidades internas', 'Crecimiento empresarial continuo'] },
  { icon: '⭐', title: 'Compromiso', points: ['Empresa especializada y certificada', 'Excelencia en cada entrega', 'Actualización normativa permanente'] },
]

const allies = ['ICONTEC', 'Ministerio de Trabajo', 'SENA', 'Cámara de Comercio', 'GS1 Colombia', 'Min. Educación']

export default function Home() {
  const [heroExpanded, setHeroExpanded] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)
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
        style={{ background: 'linear-gradient(135deg, #005187 0%, #003a63 40%, #001f38 100%)' }}
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
              Consultoría · Formación · Cumplimiento normativo
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
              <a href="https://wa.me/573001234567?text=Hola, quisiera una asesoría"
                target="_blank" rel="noreferrer"
                className="px-7 py-3.5 rounded-xl text-sm font-bold"
                style={{
                  border: '2px solid rgba(132,182,244,0.5)',
                  color: '#c4dafa',
                  transition: 'background-color 0.25s, border-color 0.25s',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(132,182,244,0.12)'; e.currentTarget.style.borderColor = '#84b6f4' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(132,182,244,0.5)' }}
              >
                Solicitar asesoría →
              </a>
            </div>

            {/* Stats mini-row */}
            <div className="flex gap-8 mt-10 pt-8" style={{ borderTop: '1px solid rgba(132,182,244,0.2)' }}>
              {[
                { n: 12, suf: '+', label: 'años' },
                { n: 280, suf: '+', label: 'clientes' },
                { n: 98, suf: '%', label: 'satisfacción' },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
                    <AnimatedCounter target={s.n} suffix={s.suf} />
                  </p>
                  <p className="text-xs" style={{ color: '#84b6f4' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Service accordion */}
          <div
            className="rounded-2xl p-5 reveal"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(132,182,244,0.2)',
              animationDelay: '0.15s',
            }}
          >
            <p className="text-white font-bold text-base mb-1" style={{ fontFamily: 'var(--font-display)' }}>¿Buscas un servicio?</p>
            <p className="text-xs mb-4" style={{ color: '#84b6f4' }}>Explora por categoría y encuentra tu solución.</p>
            <div className="space-y-2">
              {megaMenu.map((cat, i) => (
                <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(132,182,244,0.15)' }}>
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-white"
                    style={{
                      backgroundColor: heroExpanded === i ? 'rgba(77,130,188,0.25)' : 'rgba(255,255,255,0.04)',
                      transition: 'background-color 0.2s',
                    }}
                    onClick={() => setHeroExpanded(heroExpanded === i ? null : i)}
                  >
                    {cat.label}
                    <svg className="w-4 h-4 shrink-0"
                      style={{ transition: 'transform 0.25s', transform: heroExpanded === i ? 'rotate(180deg)' : 'rotate(0)' }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {/* Animated accordion */}
                  <div style={{ maxHeight: heroExpanded === i ? '300px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
                    <div className="px-4 pb-3 pt-1" style={{ backgroundColor: 'rgba(77,130,188,0.08)' }}>
                      {cat.items.map((item, j) => (
                        <Link key={j} to={`/servicios/${item.slug}`}
                          className="block text-sm py-1.5"
                          style={{ color: '#84b6f4', transition: 'color 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#c4dafa'}
                          onMouseLeave={e => e.currentTarget.style.color = '#84b6f4'}
                        >
                          → {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
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

      {/* ── Attributes + counters ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
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
              <div className="text-3xl mb-3">{a.icon}</div>
              <h3 className="text-lg font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: '#005187' }}>{a.title}</h3>
              <ul className="space-y-1.5">
                {a.points.map((p, j) => (
                  <li key={j} className="text-sm flex items-start gap-2" style={{ color: 'var(--muted-foreground)' }}>
                    <span style={{ color: '#4d82bc', marginTop: 2, fontWeight: 700 }}>✓</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* CTA card */}
          <div
            className="rounded-2xl p-7 flex flex-col justify-between reveal stagger-4"
            style={{ background: 'linear-gradient(135deg, #005187 0%, #4d82bc 100%)', color: 'white' }}
          >
            <div>
              <p className="text-xs uppercase tracking-widest font-bold mb-3 opacity-70">Sobre nosotros</p>
              <h3 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
                12 años construyendo excelencia organizacional
              </h3>
            </div>
            <Link to="/nosotros"
              className="mt-6 inline-block px-4 py-2.5 rounded-xl text-sm font-bold text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', transition: 'background-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.28)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)'}
            >
              Quiénes somos →
            </Link>
          </div>
        </div>

        {/* Animated counters strip */}
        <div
          className="mt-12 rounded-2xl p-8 reveal"
          style={{ background: 'linear-gradient(135deg, #005187 0%, #003a63 100%)', color: 'white' }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { n: 12, suf: '+', label: 'Años de experiencia' },
              { n: 280, suf: '+', label: 'Clientes atendidos' },
              { n: 25, suf: '+', label: 'Especialistas' },
              { n: 98, suf: '%', label: 'Satisfacción del cliente' },
            ].map((s, i) => (
              <div key={i} className={`reveal stagger-${i + 1}`}>
                <p className="text-4xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: '#84b6f4' }}>
                  <AnimatedCounter target={s.n} suffix={s.suf} />
                </p>
                <p className="text-sm opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((s, i) => (
              <div
                key={s.slug}
                className={`rounded-2xl overflow-hidden card-interactive glow-hover reveal stagger-${(i % 3) + 1}`}
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="h-44 overflow-hidden relative" style={{ backgroundColor: 'var(--secondary)' }}>
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover"
                    style={{ transition: 'transform 0.5s ease' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.07)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,81,135,0.5), transparent 50%)', opacity: 0, transition: 'opacity 0.3s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-base mb-2" style={{ fontFamily: 'var(--font-display)', color: '#005187' }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>{s.description}</p>
                  <Link to={`/servicios/${s.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-bold"
                    style={{ color: '#4d82bc', transition: 'gap 0.2s, color 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#005187'; e.currentTarget.style.gap = '6px' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#4d82bc'; e.currentTarget.style.gap = '4px' }}
                  >
                    Conozca más <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Business units ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div
            className="rounded-2xl p-8 relative overflow-hidden card-interactive reveal-left"
            style={{ background: 'linear-gradient(135deg, #005187 0%, #003a63 100%)' }}
          >
            <div style={{ position: 'absolute', right: -30, top: -30, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(132,182,244,0.2), transparent)', pointerEvents: 'none' }} />
            <div className="relative">
              <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-4"
                style={{ backgroundColor: 'rgba(132,182,244,0.2)', color: '#84b6f4', border: '1px solid rgba(132,182,244,0.3)' }}>
                Tienda en línea
              </span>
              <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Equipos y materiales de seguridad
              </h3>
              <p className="text-sm mb-6" style={{ color: '#84b6f4' }}>
                EPP certificados, señalización industrial, botiquines y documentación normativa. Envío a todo el país.
              </p>
              <Link to="/tienda"
                className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold text-white btn-shimmer"
              >
                Ver catálogo →
              </Link>
            </div>
          </div>

          <div
            className="rounded-2xl p-8 relative overflow-hidden card-interactive reveal"
            style={{ background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)' }}
          >
            <div style={{ position: 'absolute', right: -30, top: -30, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.2), transparent)', pointerEvents: 'none' }} />
            <div className="relative">
              <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-4"
                style={{ backgroundColor: 'rgba(52,211,153,0.2)', color: '#34D399', border: '1px solid rgba(52,211,153,0.3)' }}>
                Centro de formación
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
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4d82bc' }}>Blog y actualidad</p>
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
              <div
                key={post.id}
                className={`rounded-2xl overflow-hidden cursor-pointer card-interactive glow-hover reveal stagger-${i + 1}`}
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                onClick={() => setSelectedPost(post)}
              >
                <div className="h-44 overflow-hidden relative" style={{ backgroundColor: 'var(--secondary)' }}>
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover"
                    style={{ transition: 'transform 0.5s ease' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
                <div className="p-5">
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
                  <button className="text-sm font-bold inline-flex items-center gap-1"
                    style={{ color: '#4d82bc', transition: 'color 0.2s, gap 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#005187'; e.currentTarget.style.gap = '6px' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#4d82bc'; e.currentTarget.style.gap = '4px' }}
                  >
                    Más información <span>→</span>
                  </button>
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
              Estamos en el corazón de Bogotá, disponibles para atención presencial y virtual en todo el territorio nacional.
            </p>
            <ul className="space-y-3 text-sm">
              {[
                { icon: '📍', text: 'Cra. 15 #93-75 Piso 8, Bogotá D.C.' },
                { icon: '📞', text: '+57 300 123 4567', href: 'https://wa.me/573001234567' },
                { icon: '📧', text: 'info@lidessa.co', href: 'mailto:info@lidessa.co' },
              ].map(c => (
                <li key={c.text}>
                  {c.href
                    ? <a href={c.href} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2"
                        style={{ color: '#005187', fontWeight: 600, transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#4d82bc'}
                        onMouseLeave={e => e.currentTarget.style.color = '#005187'}
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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.5559764977413!2d-74.05258492393068!3d4.676023495312617!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9a5e1d8c6d5b%3A0x0!2sCra.+15+%2393-75%2C+Bogot%C3%A1!5e0!3m2!1ses!2sco!4v1720000000000"
              width="100%" height="100%"
              style={{ border: 0 }}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ── Allies ── */}
      <section className="py-14" style={{ backgroundColor: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-6 reveal" style={{ color: 'var(--muted-foreground)' }}>
            Aliados estratégicos
          </p>
          <div className="flex flex-wrap justify-center gap-3 reveal">
            {allies.map((a) => (
              <a key={a} href="#"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold card-interactive"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted-foreground)', transition: 'color 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#005187'; e.currentTarget.style.borderColor = '#4d82bc' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-foreground)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                {a}
              </a>
            ))}
          </div>
        </div>
      </section>

      {selectedPost && <BlogModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </div>
  )
}
