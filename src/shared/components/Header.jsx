import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { megaMenu } from '@/shared/data/megaMenu'
import AuthModal from '@/features/auth/components/AuthModal'

export default function Header({ theme, setTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)
  const [authModal, setAuthModal] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const megaRef = useRef(null)
  const location = useLocation()

  // Shrink header on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setMegaOpen(false)
  }, [location])

  useEffect(() => {
    const handleClick = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) setMegaOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const navLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'Nosotros', href: '/nosotros' },
    { label: 'Blog', href: '/blog' },
    { label: 'Tienda', href: '/tienda' },
    { label: 'Formación', href: '/formacion' },
  ]

  const themeOpts = [
    { value: 'light', icon: '☀️', label: 'Claro' },
    { value: 'dark',  icon: '🌙', label: 'Oscuro' },
    { value: 'auto',  icon: '⚙️', label: 'Auto' },
  ]
  const nextTheme = { light: 'dark', dark: 'auto', auto: 'light' }
  const currentThemeOpt = themeOpts.find(t => t.value === theme)

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          width: '100%',
          backgroundColor: 'var(--card)',
          borderBottom: '1px solid var(--border)',
          boxShadow: scrolled ? '0 4px 24px rgba(0,81,135,0.10)' : '0 1px 4px rgba(0,0,0,0.04)',
          transition: 'box-shadow 0.3s ease, padding 0.3s ease',
        }}
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4"
          style={{
            height: scrolled ? '56px' : '68px',
            transition: 'height 0.3s ease',
          }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src="/assets/logolidessa.png"
              alt="Lidessa"
              style={{
                width: scrolled ? '34px' : '40px',
                height: scrolled ? '34px' : '40px',
                objectFit: 'contain',
                transition: 'width 0.3s ease, height 0.3s ease',
              }}
            />
            <div className="hidden sm:block leading-none">
              <span
                className="font-black tracking-tight"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: '#005187',
                  fontSize: scrolled ? '18px' : '22px',
                  transition: 'font-size 0.3s ease',
                }}
              >
                Lide
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  color: '#4d82bc',
                  fontSize: scrolled ? '18px' : '22px',
                  fontWeight: 800,
                  transition: 'font-size 0.3s ease',
                }}
              >
                ssa
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1">
            {navLinks.map((l) => {
              const active = location.pathname === l.href
              return (
                <Link
                  key={l.href}
                  to={l.href}
                  className="px-3 py-2 rounded-lg text-sm font-semibold relative"
                  style={{
                    color: active ? '#005187' : 'var(--foreground)',
                    backgroundColor: active ? '#c4dafa' : 'transparent',
                    transition: 'color 0.2s, background-color 0.2s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'var(--muted)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  {l.label}
                </Link>
              )
            })}

            {/* Mega-menu */}
            <div className="relative" ref={megaRef}>
              <button
                onClick={() => setMegaOpen(!megaOpen)}
                className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1"
                style={{
                  color: megaOpen ? '#005187' : 'var(--foreground)',
                  backgroundColor: megaOpen ? '#c4dafa' : 'transparent',
                  transition: 'color 0.2s, background-color 0.2s',
                }}
              >
                Servicios
                <svg
                  className="w-3.5 h-3.5"
                  style={{ transition: 'transform 0.25s ease', transform: megaOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Mega dropdown — animated */}
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: '50%',
                  width: '740px',
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  boxShadow: '0 20px 60px rgba(0,81,135,0.15)',
                  overflow: 'hidden',
                  opacity: megaOpen ? 1 : 0,
                  pointerEvents: megaOpen ? 'all' : 'none',
                  transition: 'opacity 0.22s ease, transform 0.22s ease',
                  translate: megaOpen ? '-50% 0' : '-50% -8px',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr' }}>
                  {/* Categories */}
                  <div style={{ backgroundColor: 'var(--muted)', borderRight: '1px solid var(--border)' }}>
                    {megaMenu.map((cat, i) => (
                      <button
                        key={i}
                        className="w-full text-left px-4 py-3.5 text-sm font-semibold flex items-center justify-between"
                        style={{
                          fontFamily: 'var(--font-display)',
                          color: activeCategory === i ? '#005187' : 'var(--foreground)',
                          backgroundColor: activeCategory === i ? '#c4dafa' : 'transparent',
                          transition: 'background-color 0.18s, color 0.18s',
                        }}
                        onMouseEnter={() => setActiveCategory(i)}
                      >
                        {cat.label}
                        <svg className="w-3.5 h-3.5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>

                  {/* Sub-items */}
                  <div className="p-4">
                    <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#4d82bc' }}>
                      {megaMenu[activeCategory].label}
                    </p>
                    <div className="grid gap-0.5">
                      {megaMenu[activeCategory].items.map((item, j) => (
                        <Link
                          key={j}
                          to={`/servicios/${item.slug}`}
                          className="px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2"
                          style={{
                            color: 'var(--foreground)',
                            transition: 'background-color 0.18s, color 0.18s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#c4dafa'; e.currentTarget.style.color = '#005187' }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--foreground)' }}
                        >
                          <span style={{ color: '#4d82bc', fontWeight: 700 }}>→</span> {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer strip */}
                <div
                  className="px-5 py-3 flex items-center justify-between"
                  style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}
                >
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>¿No encuentra su servicio?</p>
                  <a
                    href="https://wa.me/573001234567?text=Hola, quisiera información sobre un servicio"
                    target="_blank" rel="noreferrer"
                    className="text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                    style={{ backgroundColor: '#25D366', transition: 'opacity 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    💬 Consúltenos
                  </a>
                </div>
              </div>
            </div>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(nextTheme[theme])}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', transition: 'border-color 0.2s, color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#4d82bc'; e.currentTarget.style.color = '#005187' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
              title="Cambiar tema"
            >
              <span>{currentThemeOpt.icon}</span>
              <span>{currentThemeOpt.label}</span>
            </button>

            <button
              onClick={() => setAuthModal('login')}
              className="hidden md:block px-4 py-1.5 rounded-lg text-sm font-semibold border"
              style={{ borderColor: '#005187', color: '#005187', transition: 'background-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#c4dafa'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Iniciar sesión
            </button>

            <button
              onClick={() => setAuthModal('register')}
              className="hidden md:block px-4 py-1.5 rounded-lg text-sm font-bold text-white btn-shimmer"
            >
              Registrarme
            </button>

            {/* Hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg"
              style={{ color: 'var(--foreground)', transition: 'background-color 0.2s' }}
              onClick={() => setMobileOpen(!mobileOpen)}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--muted)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Menú"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile drawer — animated */}
        <div
          style={{
            overflow: 'hidden',
            maxHeight: mobileOpen ? '600px' : '0',
            transition: 'max-height 0.35s ease',
            borderTop: mobileOpen ? '1px solid var(--border)' : 'none',
            backgroundColor: 'var(--card)',
          }}
        >
          <div className="px-4 py-3">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className="flex items-center py-3 text-sm font-semibold"
                style={{
                  color: location.pathname === l.href ? '#005187' : 'var(--foreground)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {l.label}
              </Link>
            ))}

            <button
              className="w-full flex items-center justify-between py-3 text-sm font-semibold"
              style={{ color: 'var(--foreground)', borderBottom: '1px solid var(--border)' }}
              onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
            >
              Servicios
              <svg
                className="w-4 h-4"
                style={{ transition: 'transform 0.25s', transform: mobileServicesOpen ? 'rotate(180deg)' : 'rotate(0)' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div style={{ maxHeight: mobileServicesOpen ? '600px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
              <div className="pl-3 pb-2">
                {megaMenu.map((cat, i) => (
                  <div key={i}>
                    <p className="text-xs font-bold uppercase tracking-wider pt-3 pb-1" style={{ color: '#4d82bc' }}>{cat.label}</p>
                    {cat.items.map((item, j) => (
                      <Link key={j} to={`/servicios/${item.slug}`}
                        className="block py-1.5 text-sm"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-3 pb-1">
              <button onClick={() => { setAuthModal('login'); setMobileOpen(false) }}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg border"
                style={{ borderColor: '#005187', color: '#005187' }}>
                Iniciar sesión
              </button>
              <button onClick={() => { setAuthModal('register'); setMobileOpen(false) }}
                className="flex-1 py-2.5 text-sm font-bold rounded-lg text-white btn-shimmer">
                Registrarme
              </button>
            </div>
          </div>
        </div>
      </header>

      {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} />}
    </>
  )
}
