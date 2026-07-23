import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { megaMenu } from '@/shared/data/megaMenu'

export default function Header({ theme, setTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 })
  const megaRef = useRef(null)
  const navRef = useRef(null)
  const linkRefs = useRef({})
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
    { label: 'Converge', href: '/blog' },
    { label: 'Formación', href: '/formacion' },
  ]

  const activeKey = navLinks.find(l => l.href === location.pathname)?.href
    || (location.pathname.startsWith('/servicios') ? 'servicios' : null)

  function moveIndicatorTo(key) {
    const el = linkRefs.current[key]
    const nav = navRef.current
    if (!el || !nav) return
    const elRect = el.getBoundingClientRect()
    const navRect = nav.getBoundingClientRect()
    setIndicator({ left: elRect.left - navRect.left, width: elRect.width, opacity: 1 })
  }

  function resetIndicator() {
    if (activeKey) moveIndicatorTo(activeKey)
    else setIndicator(i => ({ ...i, opacity: 0 }))
  }

  useEffect(() => {
    resetIndicator()
    const onResize = () => resetIndicator()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, scrolled])

  const isDark = theme === 'dark'

  return (
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          width: '100%',
          padding: scrolled ? '10px 16px' : '16px 16px 8px',
          transition: 'padding 0.3s ease',
        }}
      >
        <div className="max-w-7xl mx-auto relative">
          {/* Floating pill */}
          <div
            style={{
              borderRadius: 9999,
              backgroundColor: `color-mix(in srgb, var(--card) ${scrolled ? 90 : 78}%, transparent)`,
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: '1px solid color-mix(in srgb, var(--border) 70%, transparent)',
              boxShadow: scrolled ? '0 10px 34px rgba(0,81,135,0.16)' : '0 6px 22px rgba(0,81,135,0.08)',
              transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
            }}
          >
        <div
          className="px-4 sm:px-6 flex items-center gap-4"
          style={{
            height: scrolled ? '52px' : '64px',
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
          <nav
            ref={navRef}
            className="hidden lg:flex items-center gap-0.5 flex-1 relative"
            onMouseLeave={resetIndicator}
          >
            {/* Liquid sliding indicator */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                height: '34px',
                borderRadius: 9999,
                backgroundColor: '#c4dafa',
                opacity: indicator.opacity,
                transform: `translate(${indicator.left}px, -50%)`,
                width: indicator.width,
                transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), width 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
            {navLinks.map((l) => {
              const active = location.pathname === l.href
              return (
                <Link
                  key={l.href}
                  ref={el => { linkRefs.current[l.href] = el }}
                  to={l.href}
                  className="px-3 py-2 rounded-lg text-sm font-semibold relative"
                  style={{
                    color: active ? '#005187' : 'var(--foreground)',
                    transition: 'color 0.2s',
                    zIndex: 1,
                  }}
                  onMouseEnter={() => moveIndicatorTo(l.href)}
                >
                  {l.label}
                </Link>
              )
            })}

            {/* Mega-menu */}
            <div className="relative" ref={megaRef} onMouseEnter={() => moveIndicatorTo('servicios')}>
              <button
                ref={el => { linkRefs.current['servicios'] = el }}
                onClick={() => setMegaOpen(!megaOpen)}
                className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 relative"
                style={{
                  color: megaOpen || activeKey === 'servicios' ? '#005187' : 'var(--foreground)',
                  transition: 'color 0.2s',
                  zIndex: 1,
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
            {/* Theme toggle — sun / moon switch */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label="Cambiar tema"
              title="Cambiar tema"
              className="hidden sm:block relative shrink-0"
              style={{
                width: 56,
                height: 28,
                borderRadius: 9999,
                border: '1px solid var(--border)',
                background: isDark
                  ? 'linear-gradient(135deg, #0f1b3d 0%, #1b2a4a 100%)'
                  : 'linear-gradient(135deg, #bfe0ff 0%, #eaf6ff 100%)',
                transition: 'background 0.4s ease',
                overflow: 'hidden',
              }}
            >
              {/* stars (dark mode) */}
              <span style={{ position: 'absolute', top: 6, left: 9, width: 2, height: 2, borderRadius: '50%', backgroundColor: 'white', opacity: isDark ? 0.85 : 0, transition: 'opacity 0.4s ease' }} />
              <span style={{ position: 'absolute', top: 16, left: 18, width: 2, height: 2, borderRadius: '50%', backgroundColor: 'white', opacity: isDark ? 0.6 : 0, transition: 'opacity 0.4s ease' }} />
              <span style={{ position: 'absolute', top: 9, left: 26, width: 1.5, height: 1.5, borderRadius: '50%', backgroundColor: 'white', opacity: isDark ? 0.7 : 0, transition: 'opacity 0.4s ease' }} />

              {/* sliding thumb */}
              <span
                style={{
                  position: 'absolute',
                  top: 3,
                  left: isDark ? 31 : 3,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  backgroundColor: isDark ? '#e8eef7' : '#ffd35c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  transition: 'left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.35s ease',
                }}
              >
                {isDark ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#3d4d6b">
                    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b8860b" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="4" fill="#b8860b" stroke="none" />
                    <line x1="12" y1="1.5" x2="12" y2="3.5" />
                    <line x1="12" y1="20.5" x2="12" y2="22.5" />
                    <line x1="1.5" y1="12" x2="3.5" y2="12" />
                    <line x1="20.5" y1="12" x2="22.5" y2="12" />
                    <line x1="4.6" y1="4.6" x2="6" y2="6" />
                    <line x1="18" y1="18" x2="19.4" y2="19.4" />
                    <line x1="4.6" y1="19.4" x2="6" y2="18" />
                    <line x1="18" y1="6" x2="19.4" y2="4.6" />
                  </svg>
                )}
              </span>
            </button>

            <Link
              to="/login"
              className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold text-white btn-shimmer"
            >
              Iniciar sesión
              <svg className="icon-nudge" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </Link>

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
          </div>

          {/* Mobile drawer — floating panel */}
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              left: 0,
              right: 0,
              borderRadius: 20,
              overflow: 'hidden',
              backgroundColor: `color-mix(in srgb, var(--card) 96%, transparent)`,
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 50px rgba(0,81,135,0.18)',
              maxHeight: mobileOpen ? '600px' : '0',
              opacity: mobileOpen ? 1 : 0,
              transition: 'max-height 0.35s ease, opacity 0.25s ease',
              zIndex: 40,
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
              <Link to="/login" onClick={() => setMobileOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold rounded-lg text-white btn-shimmer">
                Iniciar sesión
                <svg className="icon-nudge" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        </div>
      </header>
  )
}
