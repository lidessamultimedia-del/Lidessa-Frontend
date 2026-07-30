import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { servicesData } from '../data/servicesData'
import { Clipboard, MessageCircle, Check } from '@/shared/components/Icons'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'

export default function ServicePage() {
  const { slug } = useParams()
  const [activeTab, setActiveTab] = useState(0)
  const pageRef = useScrollReveal('reveal')
  useScrollReveal('reveal-scale')

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
            target="_blank" rel="noreferrer"
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
    <div ref={pageRef}>
      {/* Hero */}
      <section
        className="py-20 relative"
        style={{
          backgroundImage: `url("${service.hero}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(16,41,77,0.9) 0%, rgba(7,20,38,0.75) 100%)' }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <img src="/assets/logolidessa.png" alt="Lidessa" className="mx-auto mb-5 reveal" style={{ width: 80, height: 80, objectFit: 'contain' }} />
          <p className="text-xs font-bold uppercase tracking-widest mb-3 reveal" style={{ color: '#e8c766' }}>Servicio</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-5 reveal stagger-1" style={{ fontFamily: 'var(--font-display)' }}>
            {service.title}
          </h1>
          <p className="text-base max-w-2xl mx-auto leading-relaxed reveal stagger-2" style={{ color: '#cbb98a' }}>
            {service.description}
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex gap-2 flex-wrap justify-center mb-8" style={{ borderBottom: '2px solid var(--border)', paddingBottom: '2px' }}>
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
          <div key={activeTab} className="max-w-3xl mx-auto animate-fade-up">
            {service.tabs[activeTab].title && (
              <h2 className="text-2xl font-black text-center mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
                {service.tabs[activeTab].title}
              </h2>
            )}
            {service.tabs[activeTab].intro && (
              <div
                className="rounded-2xl p-6 sm:p-7 mb-10 relative overflow-hidden text-left"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderLeft: '4px solid var(--primary)' }}
              >
                <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
                  {service.tabs[activeTab].intro}
                </p>
              </div>
            )}
            <ul className="grid gap-3 mb-12 text-left">
              {service.tabs[activeTab].checklist.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-xl p-4 animate-fade-up transition-transform"
                  style={{ animationDelay: `${i * 0.08}s`, opacity: 0, backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.borderColor = 'var(--primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                >
                  <span
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #005187 0%, #4d82bc 55%, #b8860b 100%)', color: 'white' }}
                  >
                    <Check size={13} strokeWidth="3" />
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{item}</p>
                </li>
              ))}
            </ul>
            {service.tabs[activeTab].structure && (
              <div className="text-left">
                <h3 className="text-lg font-bold mb-6 text-center" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
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
                  <ol className="relative">
                    <span
                      className="hidden sm:block absolute left-5 top-2 bottom-2 w-px"
                      style={{ backgroundColor: 'var(--border)' }}
                    />
                    {service.tabs[activeTab].structure.steps.map((step, i) => (
                      <li key={i} className="relative flex items-center gap-4 pb-6 last:pb-0 animate-fade-up" style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}>
                        <span
                          className="shrink-0 rounded-full flex items-center justify-center text-sm font-bold text-white relative z-10"
                          style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #005187 0%, #4d82bc 55%, #b8860b 100%)' }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span
                          className="text-sm font-medium rounded-lg px-4 py-3 flex-1"
                          style={{ color: 'var(--foreground)', backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                        >
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </div>
        ) : (
        <div key={activeTab} className="max-w-3xl mx-auto text-left animate-fade-up">
            {service.tabs[activeTab].sections ? (
              <div className="space-y-8">
                {service.tabs[activeTab].title && (
                  <h2 className="text-2xl font-black mb-2 text-center" style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
                    {service.tabs[activeTab].title}
                  </h2>
                )}
                {service.tabs[activeTab].sections.map((section, i) => {
                  const isLead = !section.heading && !section.boxed
                  return (
                  <div
                    key={i}
                    className="animate-fade-up"
                    style={{
                      animationDelay: `${i * 0.1}s`, opacity: 0,
                      ...(section.boxed ? { borderRadius: 16, padding: 24, border: '1px solid var(--border)', borderLeft: '4px solid #b8860b', backgroundColor: 'var(--card)' } : {}),
                    }}
                  >
                    {section.heading && (
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                        <span style={{ width: 6, height: 6, borderRadius: 999, background: 'linear-gradient(135deg, #005187, #b8860b)' }} />
                        {section.heading}
                      </h3>
                    )}
                    {section.text && (
                      <p
                        className="leading-relaxed"
                        style={isLead
                          ? { fontSize: '1.0625rem', color: 'var(--foreground)' }
                          : { fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: section.bullets ? 14 : 0 }}
                      >
                        {section.text}
                      </p>
                    )}
                    {section.bullets && (
                      <div className="space-y-3 mt-1">
                        {section.bullets.map((b, j) => (
                          <div
                            key={j}
                            className="flex items-start gap-3 rounded-xl p-4 animate-fade-up transition-transform"
                            style={{ animationDelay: `${j * 0.06}s`, opacity: 0, backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.borderColor = '#b8860b' }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                          >
                            <span
                              className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                              style={{ background: 'linear-gradient(135deg, #005187 0%, #4d82bc 55%, #b8860b 100%)', color: 'white' }}
                            >
                              <Check size={13} strokeWidth="3" />
                            </span>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
                              <strong>{b.label}</strong> {b.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  )
                })}
              </div>
            ) : (
              <>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--muted-foreground)' }}>
                  {service.tabs[activeTab].content}
                </p>
                <ul className="space-y-3 text-left">
                  {service.tabs[activeTab].bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 animate-fade-up" style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
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
          className="rounded-2xl p-8 text-center relative overflow-hidden reveal-scale"
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
                href={`https://wa.me/573001234567?text=Hola, me interesa el servicio de ${service.title}`}
                target="_blank" rel="noreferrer"
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
