import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { servicesData } from '../data/servicesData'

export default function ServicePage() {
  const { slug } = useParams()
  const [activeTab, setActiveTab] = useState(0)

  const service = servicesData.find(s => s.slug === slug)

  if (!service) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="text-5xl mb-4">📋</div>
        <h1 className="text-2xl font-black mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          Servicio en preparación
        </h1>
        <p className="text-sm mb-6 text-center" style={{ color: 'var(--muted-foreground)' }}>
          Estamos preparando el contenido de este servicio. Contáctenos para más información.
        </p>
        <div className="flex gap-3">
          <Link
            to="/"
            className="px-4 py-2 rounded-lg text-sm font-bold border transition-colors"
            style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
          >
            ← Ir al inicio
          </Link>
          <a
            href="https://wa.me/573001234567"
            className="px-4 py-2 rounded-lg text-sm font-bold text-white"
            style={{ backgroundColor: '#25D366' }}
          >
            💬 Consultar por WhatsApp
          </a>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--muted-foreground)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
        >
          ← Regresar
        </Link>
      </div>

      {/* Hero */}
      <section
        className="py-20 mt-4 relative"
        style={{
          backgroundImage: `url(${service.hero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(20,20,20,0.93) 0%, rgba(20,20,20,0.7) 100%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#e8c766' }}>Servicio</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-5" style={{ fontFamily: 'var(--font-display)' }}>
            {service.title}
          </h1>
          <p className="text-base max-w-2xl leading-relaxed" style={{ color: '#cbb98a' }}>
            {service.description}
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex gap-2 flex-wrap mb-8" style={{ borderBottom: '2px solid var(--border)', paddingBottom: '2px' }}>
          {service.tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className="px-5 py-2.5 text-sm font-semibold transition-all relative"
              style={{
                color: activeTab === i ? 'var(--primary)' : 'var(--muted-foreground)',
                borderBottom: activeTab === i ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom: '-2px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--muted-foreground)' }}>
              {service.tabs[activeTab].content}
            </p>
            <ul className="space-y-3">
              {service.tabs[activeTab].bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                  >
                    ✓
                  </span>
                  <span className="text-sm" style={{ color: 'var(--foreground)' }}>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
              ¿Por qué implementar este servicio?
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              Nuestro equipo de especialistas acompaña cada etapa del proceso con metodologías probadas, asegurando resultados sostenibles y el cumplimiento de todos los requisitos legales y normativos vigentes.
            </p>
          </div>
        </div>
      </section>

      {/* Scope */}
      <section className="py-14" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Alcance del servicio</p>
          <h2 className="text-2xl font-black mb-8" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            Actividades y entregables
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
              <h3 className="font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
                🏢 Actividades presenciales
              </h3>
              <ul className="space-y-2">
                {service.presencial.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    <span style={{ color: 'var(--accent)', marginTop: '2px' }}>→</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
              <h3 className="font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
                💻 Actividades virtuales / a distancia
              </h3>
              <ul className="space-y-2">
                {service.virtual.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    <span style={{ color: 'var(--accent)', marginTop: '2px' }}>→</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div
          className="rounded-2xl p-8 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #141414, #3d3115)' }}
        >
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #c9a227 0%, transparent 50%), radial-gradient(circle at 80% 50%, #e8c766 0%, transparent 50%)' }} />
          <div className="relative">
            <h2 className="text-2xl font-black text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              ¿Listo para comenzar?
            </h2>
            <p className="text-sm mb-6" style={{ color: '#cbb98a' }}>
              Contáctenos hoy y reciba una consulta inicial sin costo. Nuestro equipo analizará las necesidades de su organización y le presentará una propuesta personalizada.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/573001234567?text=Hola, me interesa el servicio de {service.title}"
                className="px-6 py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#25D366' }}
              >
                💬 Escribirnos por WhatsApp
              </a>
              <a
                href="mailto:comercial@lidessa.co"
                className="px-6 py-3 rounded-lg text-sm font-bold border transition-all hover:bg-white/10"
                style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
              >
                📧 Enviar correo
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
