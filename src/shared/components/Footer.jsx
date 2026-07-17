import { useState } from 'react'
import { Link } from 'react-router-dom'
import PQRSFModal from './PQRSFModal'

export default function Footer() {
  const [pqrsfOpen, setPqrsfOpen] = useState(false)

  const socialLinks = [
    { label: 'Facebook', icon: 'f', href: 'https://www.facebook.com/lidessa.co' },
    { label: 'Instagram', icon: '📷', href: 'https://www.instagram.com/lidessa.co' },
    { label: 'LinkedIn', icon: 'in', href: 'https://www.linkedin.com/company/lidessa' },
    { label: 'YouTube', icon: '▶', href: 'https://www.youtube.com/@lidessa' },
    { label: 'X', icon: 'X', href: 'https://x.com/lidessa_co' },
    { label: 'TikTok', icon: '♪', href: 'https://www.tiktok.com/@lidessa' },
    { label: 'Linktree', icon: '🌿', href: 'https://linktr.ee/lidessa' },
  ]

  const institutionalLinks = [
    { label: 'Ministerio de Trabajo', href: 'https://www.mintrabajo.gov.co' },
    { label: 'Ministerio de Educación', href: 'https://www.mineducacion.gov.co' },
    { label: 'ICONTEC', href: 'https://icontec.org' },
    { label: 'Superintendencia de Industria', href: 'https://www.sic.gov.co' },
    { label: 'SENA – Oferta educativa', href: 'https://www.sena.edu.co' },
    { label: 'Min. Ambiente y Des. Sostenible', href: 'https://www.minambiente.gov.co' },
  ]

  return (
    <>
      <footer style={{ backgroundColor: '#141414', color: '#cbb98a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">

            {/* Col 1 — Identificación */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ background: 'linear-gradient(135deg, #005187, #4d82bc)' }}>
                  L
                </div>
                <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  Lide<span style={{ color: '#84b6f4' }}>ssa</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                Más de <strong className="text-white">12 años</strong> acompañando a empresas e instituciones en el cumplimiento normativo, la excelencia organizacional y el desarrollo sostenible.
              </p>
              <div className="mt-4 flex flex-col gap-1.5 text-xs">
                <span className="flex items-center gap-1.5">
                  <span style={{ color: '#c9a227' }}>✓</span> NIT: 900.XXX.XXX-X
                </span>
                <span className="flex items-center gap-1.5">
                  <span style={{ color: '#c9a227' }}>✓</span> RUT vigente 2025
                </span>
              </div>
            </div>

            {/* Col 2 — Páginas de interés */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Páginas de interés
              </h4>
              <ul className="space-y-2 text-sm">
                {institutionalLinks.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} target="_blank" rel="noreferrer"
                      className="hover:text-white transition-colors flex items-center gap-1"
                    >
                      <span className="text-xs opacity-50">↗</span> {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Horario */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Horario de atención
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <span className="text-white font-medium">Lunes – Viernes</span><br />
                  8:00 a.m. – 6:00 p.m.
                </li>
                <li>
                  <span className="text-white font-medium">Sábados</span><br />
                  9:00 a.m. – 1:00 p.m.
                </li>
                <li className="pt-1 text-xs" style={{ color: '#8a7d5a' }}>
                  Domingos y festivos: cerrado
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
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Acerca de
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/nosotros" className="hover:text-white transition-colors">Quiénes somos</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors">Blog y Noticias</Link></li>
                <li><Link to="/formacion" className="hover:text-white transition-colors">Centro de formación</Link></li>
                <li><Link to="/tienda" className="hover:text-white transition-colors">Tienda en línea</Link></li>
                <li>
                  <button onClick={() => setPqrsfOpen(true)} className="hover:text-white transition-colors text-left">
                    Formulario PQRSF
                  </button>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Política de privacidad</a>
                </li>
                <li>
                  <Link to="/servicios/datos-personales" className="hover:text-white transition-colors">
                    Tratamiento de datos
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 5 — Contacto */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Contacto
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-start gap-2">
                  <span>📍</span>
                  <span>Cra. 15 #93-75 Piso 8,<br />Bogotá D.C., Colombia</span>
                </li>
                <li>
                  <a href="mailto:comercial@lidessa.co" className="flex items-center gap-1.5 hover:text-white transition-colors">
                    📧 comercial@lidessa.co
                  </a>
                </li>
                <li>
                  <a href="mailto:mercadeo@lidessa.co" className="flex items-center gap-1.5 hover:text-white transition-colors">
                    📧 mercadeo@lidessa.co
                  </a>
                </li>
                <li>
                  <a href="mailto:servicios@lidessa.co" className="flex items-center gap-1.5 hover:text-white transition-colors">
                    📧 servicios@lidessa.co
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/573001234567" target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-white transition-colors">
                    📱 +57 300 123 4567 (General)
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/573009876543" target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-white transition-colors">
                    📱 +57 300 987 6543 (Comercial)
                  </a>
                </li>
                <li className="pt-1">
                  <button onClick={() => setPqrsfOpen(true)}
                    className="text-xs underline hover:text-white transition-colors text-left">
                    Radicar PQRSF en línea →
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Social + copyright */}
          <div className="mt-10 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {socialLinks.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.label}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:scale-110"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
              <p className="text-xs" style={{ color: '#6b6152' }}>
                © {new Date().getFullYear()} Lidessa. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {pqrsfOpen && <PQRSFModal onClose={() => setPqrsfOpen(false)} />}
    </>
  )
}
