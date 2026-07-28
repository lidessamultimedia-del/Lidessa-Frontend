import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { servicesData } from '../data/servicesData'
import { Clipboard, MessageCircle, Check } from '@/shared/components/Icons'

export default function ServicePage() {
  const { slug } = useParams()
  const [activeTab, setActiveTab] = useState(0)

  const service = servicesData.find(s => s.slug === slug)

  if (!service) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="flex justify-center mb-4" style={{ color: 'var(--muted-foreground)' }}><Clipboard size={44} /></div>
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
            <span className="inline-flex items-center gap-1.5"><MessageCircle size={15} /> Consultar por WhatsApp</span>
          </a>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero */}
      <section
        className="py-20 relative"
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

        {service.tabs[activeTab].checklist ? (
          <div className="max-w-3xl mx-auto">
            {service.tabs[activeTab].title && (
              <h2 className="text-2xl font-black text-center mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
                {service.tabs[activeTab].title}
              </h2>
            )}
            {service.tabs[activeTab].intro && (
              <div className="rounded-2xl p-6 mb-8" style={{ border: '1px solid var(--primary)', backgroundColor: 'var(--card)' }}>
                <p className="text-sm text-center leading-relaxed" style={{ color: 'var(--foreground)' }}>
                  {service.tabs[activeTab].intro}
                </p>
              </div>
            )}
            <ul className="space-y-5 mb-10">
              {service.tabs[activeTab].checklist.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }}>
                    <Check size={18} strokeWidth="3" />
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{item}</p>
                </li>
              ))}
            </ul>
            {service.tabs[activeTab].structure && (
              <div>
                <h3 className="text-lg font-bold mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                  {service.tabs[activeTab].structure.title}
                </h3>
                {service.tabs[activeTab].structure.image ? (
                  <div className="flex justify-center">
                    <img
                      src={service.tabs[activeTab].structure.image}
                      alt={service.tabs[activeTab].structure.title}
                      className="max-w-sm w-full"
                    />
                  </div>
                ) : (
                  <ol className="space-y-4">
                    {service.tabs[activeTab].structure.steps.map((step, i) => (
                      <li key={i} className="flex items-center gap-4">
                        <span
                          className="shrink-0 rounded-full flex items-center justify-center text-sm font-bold text-white"
                          style={{ width: 40, height: 40, backgroundColor: i % 2 === 0 ? 'var(--primary)' : '#4d82bc' }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </div>
        ) : (
        <div className="max-w-3xl mx-auto text-center">
            {service.tabs[activeTab].sections ? (
              <div className="space-y-6">
                {service.tabs[activeTab].title && (
                  <h2 className="text-2xl font-black mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
                    {service.tabs[activeTab].title}
                  </h2>
                )}
                {service.tabs[activeTab].sections.map((section, i) => (
                  <div key={i} className={section.boxed ? 'rounded-2xl p-6 text-left' : ''} style={section.boxed ? { border: '1px solid var(--primary)', backgroundColor: 'var(--card)' } : undefined}>
                    {section.heading && (
                      <h3 className="font-bold text-base mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
                        {section.heading}
                      </h3>
                    )}
                    {section.text && (
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                        {section.text}
                      </p>
                    )}
                    {section.bullets && (
                      <ul className="space-y-3 mt-1 text-left">
                        {section.bullets.map((b, j) => (
                          <li key={j} className="flex items-start gap-3">
                            <span
                              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                              style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                            >
                              <Check size={12} strokeWidth="3" />
                            </span>
                            <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                              <strong style={{ color: 'var(--foreground)' }}>{b.label}</strong> {b.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--muted-foreground)' }}>
                  {service.tabs[activeTab].content}
                </p>
                <ul className="space-y-3 text-left">
                  {service.tabs[activeTab].bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                      >
                        <Check size={12} strokeWidth="3" />
                      </span>
                      <span className="text-sm" style={{ color: 'var(--foreground)' }}>{b}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
        </div>
        )}
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
                <span className="inline-flex items-center gap-1.5"><MessageCircle size={15} /> Escribirnos por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
