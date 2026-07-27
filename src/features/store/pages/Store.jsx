import { useState } from 'react'
import PQRSFModal from '@/shared/components/PQRSFModal'
import { useScrollReveal } from '@/shared/hooks/useScrollReveal'

export default function Store() {
  const [pqrsfOpen, setPqrsfOpen] = useState(false)
  const pageRef = useScrollReveal('reveal')
  useScrollReveal('reveal-left')
  useScrollReveal('reveal-scale')

  return (
    <div ref={pageRef}>
      {/* Hero */}
      <section
        className="py-20 relative"
        style={{
          backgroundImage: 'url(/assets/nuestrosServicios.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(20,20,20,0.95) 50%, rgba(20,20,20,0.6))' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <img src="/assets/v2.png" alt="V2 Suministros" className="mb-4 reveal-scale" style={{ height: 96, width: 'auto' }} />
          <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded reveal" style={{ backgroundColor: 'rgba(201,162,39,0.2)', color: '#e8c766' }}>
            V2 Suministros
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4 reveal stagger-1" style={{ fontFamily: 'var(--font-display)' }}>
            ¡Bienvenidos a V2 Suministros!
          </h1>
          <p className="text-base max-w-2xl mb-3 leading-relaxed reveal stagger-2" style={{ color: '#cbb98a' }}>
            En Lidessa nos enorgullece acompañar a las empresas en el cumplimiento de la normativa de seguridad y salud en el trabajo, con información actualizada y asesoría permanente sobre los estándares que aplican a su actividad.
          </p>
          <p className="text-base max-w-2xl mb-6 leading-relaxed reveal stagger-3" style={{ color: '#cbb98a' }}>
            V2 Suministros es nuestro espacio especializado en seguridad y salud en el trabajo, enfocado en orientarle sobre los equipos de protección personal y elementos que exige la normativa vigente para cada nivel de riesgo.
          </p>
        </div>
      </section>

      {/* Botiquín / primeros auxilios */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="reveal-left">
            <h2 className="text-2xl sm:text-3xl font-black mb-5" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
              ¿Por qué recargar tu botiquín de primeros auxilios?
            </h2>
            <ul className="space-y-3 mb-6">
              {[
                { label: 'Conformidad legal:', text: 'cumple con regulaciones, evita sanciones y asegura un entorno laboral conforme.' },
                { label: 'Máxima preparación:', text: 'estar siempre listo para emergencias y cumplir con normativas laborales.' },
                { label: 'Rápida respuesta:', text: 'recarga regular para suministros inmediatos y respuestas rápidas ante incidentes.' },
                { label: 'Protección del personal:', text: 'cuida a tu equipo con insumos de calidad para un entorno seguro.' },
              ].map(item => (
                <li key={item.label} className="flex gap-2 text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  <span style={{ color: 'var(--primary)' }}>●</span>
                  <span><strong style={{ color: 'var(--foreground)' }}>{item.label}</strong> {item.text}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>
              Recuerda, nuestro asesoramiento es totalmente gratuito. ¡Estamos aquí para ayudarte!
            </p>
            <a href="https://wa.me/573009876543?text=Hola, quisiera asesoramiento gratuito sobre botiquines de primeros auxilios" target="_blank" rel="noreferrer"
              className="inline-block px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--primary)' }}>
              ¡Asesoramiento Gratis!
            </a>
          </div>
          <div className="rounded-2xl overflow-hidden reveal-scale">
            <img src="/assets/insumos.png" alt="Botiquín de primeros auxilios" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Normative bar */}
      <section className="py-4" style={{ backgroundColor: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap gap-3 items-center reveal">
            <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>📋 Normativa aplicable:</p>
            {['Resolución 0312 de 2019', 'NTC 3610 (cascos)', 'ANSI Z87.1 (gafas)', 'NTC 2171 (guantes)', 'Res. 4272/2021 (trabajo en alturas)'].map(n => (
              <span key={n} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--card)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
                {n}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Soluciones integrales */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 text-center reveal">
        <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          ¡Soluciones Integrales para la Seguridad y el Bienestar!
        </h2>
        <p className="text-sm max-w-3xl mx-auto mb-2 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          En V2 Suministros orientamos a empresas, instituciones educativas y propiedades horizontales sobre cómo fortalecer la seguridad y el bienestar de su gente. Nuestro objetivo es que cuente con la información y el acompañamiento necesarios para mantener un entorno seguro y conforme a las normativas vigentes.
        </p>
      </section>

      {/* Compliance CTA — norma 0705 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-2xl p-8 text-center reveal-scale" style={{ backgroundColor: '#141414' }}>
          <h3 className="text-xl sm:text-2xl font-black mb-3" style={{ fontFamily: 'var(--font-display)', color: '#e8c766' }}>
            ✨ ¿Qué pasa si no cumples con la norma 0705? ✨
          </h3>
          <p className="text-sm max-w-2xl mx-auto mb-2 leading-relaxed" style={{ color: '#cbb98a' }}>
            No cumplir con la Resolución 0705 de 2007 podría resultar en sanciones por parte de la autoridad competente, como multas, suspensiones o incluso cierres temporales del establecimiento.
          </p>
          <p className="text-sm max-w-2xl mx-auto mb-6 leading-relaxed" style={{ color: '#cbb98a' }}>
            ¿Cómo puede asegurarse de cumplir con la norma? Contar con un botiquín tipo A certificado y con asesoría de nuestro equipo. Actuar de manera proactiva garantiza la seguridad de su entorno laboral y evita riesgos y sanciones para su empresa.
          </p>
          <a href="https://wa.me/573009876543?text=Hola, quisiera asesoría para cumplir con la Resolución 0705 en mi empresa" target="_blank" rel="noreferrer"
            className="inline-block px-5 py-2.5 rounded-lg text-sm font-bold"
            style={{ backgroundColor: '#e8c766', color: '#141414' }}>
            Solicitar asesoría →
          </a>
        </div>

        {/* Educational content */}
        <div className="mt-8 rounded-2xl p-8 reveal" style={{ backgroundColor: 'var(--secondary)', border: '1px solid var(--border)' }}>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="reveal-left">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Cumplimiento normativo</p>
              <h3 className="text-2xl font-black mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                ¿Sabe qué EPP exige la normativa para su empresa?
              </h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>
                La Resolución 0312 de 2019 y el SG-SST determinan los equipos de protección personal obligatorios según el nivel de riesgo de su actividad económica. Nuestros asesores pueden orientarle sin costo.
              </p>
              <a href="https://wa.me/573001234567?text=Hola, quisiera asesoría sobre qué EPP necesita mi empresa" target="_blank" rel="noreferrer"
                className="inline-block px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--primary)' }}>
                Solicitar asesoría gratuita →
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 18h16" />
                      <path d="M5.5 18a6.5 6.5 0 0 1 13 0" />
                      <path d="M12 6.5v3" />
                    </svg>
                  ),
                  label: 'Cascos y protección craneal', norm: 'NTC 3610',
                  detail: 'Obligatorios en zonas con riesgo de golpes o caída de objetos.',
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7.5 11V6a1.5 1.5 0 0 1 3 0v4.5" />
                      <path d="M10.5 10V5a1.5 1.5 0 0 1 3 0v5" />
                      <path d="M13.5 10.5V6.5a1.5 1.5 0 0 1 3 0V12" />
                      <path d="M16.5 11v-.5a1.5 1.5 0 0 1 3 0V15a5.5 5.5 0 0 1-5.5 5.5h-1A6.5 6.5 0 0 1 6.5 14v-2.5a1.5 1.5 0 0 1 3-.3" />
                    </svg>
                  ),
                  label: 'Guantes de protección', norm: 'NTC 2171',
                  detail: 'Protegen las manos frente a cortes, químicos y superficies abrasivas.',
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="6.5" cy="12.5" r="3.2" />
                      <circle cx="17.5" cy="12.5" r="3.2" />
                      <path d="M9.7 12.5h4.6" />
                      <path d="M3.3 10.3 1.5 8.5" />
                      <path d="M20.7 10.3l1.8-1.8" />
                    </svg>
                  ),
                  label: 'Protección visual', norm: 'ANSI Z87.1',
                  detail: 'Evitan lesiones oculares por partículas, salpicaduras o radiación.',
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 20 9.5 6l3.5 6.5L16 8l5 12z" />
                      <circle cx="9.5" cy="6" r="1" fill="currentColor" stroke="none" />
                    </svg>
                  ),
                  label: 'Trabajo en alturas', norm: 'Res. 4272/2021',
                  detail: 'Arnés y líneas de vida certificadas para labores con riesgo de caída.',
                },
              ].map((item, i) => (
                <div key={item.label} className={`flip-card h-[132px] reveal-scale stagger-${i + 1}`}>
                  <div className="flip-card-inner">
                    <div className="flip-card-front rounded-xl p-3" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                      <div className="w-7 h-7 mb-1.5" style={{ color: 'var(--primary)' }}>{item.icon}</div>
                      <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--foreground)' }}>{item.label}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.norm}</p>
                    </div>
                    <div className="flip-card-back rounded-xl p-3 flex flex-col justify-center" style={{ backgroundColor: 'var(--primary)' }}>
                      <p className="text-xs font-semibold mb-1 text-white">{item.norm}</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>{item.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {pqrsfOpen && <PQRSFModal onClose={() => setPqrsfOpen(false)} />}
    </div>
  )
}
