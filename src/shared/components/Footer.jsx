import { useState } from 'react'
import { Link } from 'react-router-dom'
import PQRSFModal from './PQRSFModal'

const icons = {
  facebook: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 1.913-.287 1.754h-3.246v7.98H9.101Z',
  x: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.558V9h3.556v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  youtube: 'M23.498 6.186a2.999 2.999 0 0 0-2.112-2.121C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.386.52A2.999 2.999 0 0 0 .502 6.186 31.36 31.36 0 0 0 0 12a31.36 31.36 0 0 0 .502 5.814 2.999 2.999 0 0 0 2.112 2.121c1.881.52 9.386.52 9.386.52s7.505 0 9.386-.52a2.999 2.999 0 0 0 2.112-2.121A31.36 31.36 0 0 0 24 12a31.36 31.36 0 0 0-.502-5.814zM9.75 15.568V8.432L15.818 12l-6.068 3.568z',
  tiktok: 'M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
}

function Icon({ path }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d={path} />
    </svg>
  )
}

export default function Footer() {
  const [pqrsfOpen, setPqrsfOpen] = useState(false)

  const socialLinks = [
    { label: 'Facebook', icon: icons.facebook, href: 'https://www.facebook.com/lidessa.co' },
    { label: 'X', icon: icons.x, href: 'https://x.com/lidessa_co' },
    { label: 'Instagram', icon: icons.instagram, href: 'https://www.instagram.com/lidessa.co' },
    { label: 'LinkedIn', icon: icons.linkedin, href: 'https://www.linkedin.com/company/lidessa' },
    { label: 'Linktree', asterisk: true, href: 'https://linktr.ee/lidessa' },
    { label: 'YouTube', icon: icons.youtube, href: 'https://www.youtube.com/channel/UCoHXkPDBTLhk3LuOCxaPNlA' },
    { label: 'TikTok', icon: icons.tiktok, href: 'https://www.tiktok.com/@lidessa' },
  ]

  const institutionalLinks = [
    { label: 'Ministerio de Trabajo', href: 'https://www.mintrabajo.gov.co' },
    { label: 'Ministerio de Educación', href: 'https://www.mineducacion.gov.co' },
    { label: 'ICONTEC', href: 'https://icontec.org' },
    { label: 'Superintendencia de Industria', href: 'https://www.sic.gov.co' },
    { label: 'SENA – Oferta educativa', href: 'https://www.sena.edu.co' },
    { label: 'Min. Ambiente y Des. Sostenible', href: 'https://www.minambiente.gov.co' },
  ]

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <>
      <footer style={{ backgroundColor: '#141414', color: '#9fb7d6' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">

          {/* Social icons */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-8">
            {socialLinks.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.label}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'white' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(132,182,244,0.2)'; e.currentTarget.style.color = '#84b6f4' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white' }}
              >
                {s.asterisk ? <span className="text-lg leading-none">✳</span> : <Icon path={s.icon} />}
              </a>
            ))}
          </div>

          <div className="pt-8" style={{ borderTop: '1px solid rgba(132,182,244,0.15)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-center">

              {/* Col 1 — Identificación general */}
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ fontFamily: 'var(--font-display)', color: '#84b6f4' }}>
                  Identificación general
                </h4>
                <p className="text-sm leading-relaxed">
                  Más de <strong className="text-white">12 años</strong> acompañando a empresas e instituciones en el cumplimiento normativo, la excelencia organizacional y el desarrollo sostenible.
                </p>
                <div className="mt-4 flex flex-col items-center gap-1.5 text-xs">
                  <span>NIT: 900.XXX.XXX-X</span>
                  <span>RUT vigente 2025</span>
                </div>
              </div>

              {/* Col 2 — Páginas de interés */}
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ fontFamily: 'var(--font-display)', color: '#84b6f4' }}>
                  Páginas de interés
                </h4>
                <ul className="space-y-2 text-sm">
                  {institutionalLinks.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 3 — Horario de atención */}
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ fontFamily: 'var(--font-display)', color: '#84b6f4' }}>
                  Horario de atención
                </h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <span className="text-white font-medium">Lunes – Viernes</span><br />
                    7:00 a.m. – 4:30 p.m.
                  </li>
                  <li className="text-xs" style={{ color: '#5f7690' }}>
                    Sábados, domingos y festivos: cerrado
                  </li>
                  <li>
                    <a href="https://wa.me/573001234567" target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#25D366' }}>
                      💬 WhatsApp disponible
                    </a>
                  </li>
                </ul>
              </div>

              {/* Col 4 — Acerca de */}
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ fontFamily: 'var(--font-display)', color: '#84b6f4' }}>
                  Acerca de
                </h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/nosotros" className="hover:text-white transition-colors">Quiénes somos</Link></li>
                  <li><Link to="/blog" className="hover:text-white transition-colors">Converge</Link></li>
                  <li><Link to="/formacion" className="hover:text-white transition-colors">Centro de formación</Link></li>
                  <li>
                    <button onClick={() => setPqrsfOpen(true)} className="hover:text-white transition-colors">
                      Formulario PQRSF
                    </button>
                  </li>
                  <li><a href="#" className="hover:text-white transition-colors">Política de privacidad</a></li>
                  <li>
                    <Link to="/servicios/datos-personales" className="hover:text-white transition-colors">
                      Tratamiento de datos
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Col 5 — Dirección */}
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ fontFamily: 'var(--font-display)', color: '#84b6f4' }}>
                  Dirección
                </h4>
                <p className="text-sm">
                  Cra. 71 #46-28, Laureles,<br />Medellín, Antioquia
                </p>
              </div>
            </div>

            {/* Contact strip */}
            <div className="mt-10 pt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-center text-sm" style={{ borderTop: '1px solid rgba(132,182,244,0.15)' }}>
              <a href="mailto:comercial@lidessa.co" className="hover:text-white transition-colors">comercial@lidessa.co</a>
              <a href="mailto:mercadeo@lidessa.co" className="hover:text-white transition-colors">mercadeo@lidessa.co</a>
              <a href="mailto:servicios@lidessa.co" className="hover:text-white transition-colors">servicios@lidessa.co</a>
              <a href="https://wa.me/573001234567" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">+57 300 123 4567 (General)</a>
              <a href="https://wa.me/573009876543" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">+57 300 987 6543 (Comercial)</a>
            </div>

            <div className="text-center mt-6">
              <button onClick={() => setPqrsfOpen(true)}
                className="text-sm font-bold uppercase tracking-wider transition-colors"
                style={{ color: '#84b6f4' }}
                onMouseEnter={e => e.currentTarget.style.color = '#c4dafa'}
                onMouseLeave={e => e.currentTarget.style.color = '#84b6f4'}
              >
                PQRSF
              </button>
            </div>

            <div className="text-center mt-6">
              <p className="text-xs" style={{ color: '#5f7690' }}>
                © {new Date().getFullYear()} Lidessa. Todos los derechos reservados.
              </p>
              <button onClick={scrollTop} title="Volver arriba"
                className="mt-3 w-9 h-9 rounded-full flex items-center justify-center mx-auto transition-all hover:scale-110"
                style={{ backgroundColor: 'rgba(132,182,244,0.15)', color: '#84b6f4' }}
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      </footer>

      {pqrsfOpen && <PQRSFModal onClose={() => setPqrsfOpen(false)} />}
    </>
  )
}
