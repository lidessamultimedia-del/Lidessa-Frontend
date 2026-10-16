// Bloque "Próximamente" para secciones que todavía no están disponibles al
// público (catálogo de V2 Suministros, cursos de CEET). Se ve como una
// tarjeta intencional del sitio — no como una lista vacía o una sección rota.
export default function ComingSoon({ icon: Icon, eyebrow, title, description, features = [], cta }) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl px-6 py-14 sm:px-12 sm:py-16 text-center reveal-scale"
      style={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        backgroundImage:
          'radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--primary) 12%, transparent) 0%, transparent 60%)',
      }}
    >
      {/* Patrón de puntos decorativo, muy tenue */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(color-mix(in srgb, var(--primary) 14%, transparent) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
          opacity: 0.6,
        }}
      />

      <div className="relative max-w-2xl mx-auto">
        {Icon && (
          <div className="relative mx-auto mb-6" style={{ width: 88, height: 88 }}>
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full"
              style={{ border: '1.5px dashed color-mix(in srgb, var(--primary) 40%, transparent)', animation: 'spin 24s linear infinite' }}
            />
            <span
              className="absolute rounded-full flex items-center justify-center text-white"
              style={{
                inset: 10,
                background: 'linear-gradient(135deg, #005187 0%, #4d82bc 100%)',
                boxShadow: '0 10px 30px rgba(0,81,135,0.3)',
              }}
            >
              <Icon size={30} strokeWidth={1.75} />
            </span>
          </div>
        )}

        <span
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4"
          style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ backgroundColor: 'var(--primary)' }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
          </span>
          Próximamente
        </span>

        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted-foreground)' }}>{eyebrow}</p>
        )}
        <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          {title}
        </h2>
        <p className="text-sm sm:text-base leading-relaxed mb-8" style={{ color: 'var(--muted-foreground)' }}>
          {description}
        </p>

        {features.length > 0 && (
          <div className="grid sm:grid-cols-3 gap-3 mb-8 text-left">
            {features.map(f => (
              <div
                key={f.label}
                className="flex items-start gap-3 rounded-xl p-3.5"
                style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
              >
                {f.icon && (
                  <span
                    className="shrink-0 flex items-center justify-center rounded-lg"
                    style={{ width: 32, height: 32, backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}
                  >
                    <f.icon size={16} />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--foreground)' }}>{f.label}</p>
                  <p className="text-xs leading-snug" style={{ color: 'var(--muted-foreground)' }}>{f.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {cta && (
          <a
            href={cta.href}
            target={cta.href.startsWith('http') ? '_blank' : undefined}
            rel={cta.href.startsWith('http') ? 'noreferrer' : undefined}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#005187', boxShadow: '0 6px 18px rgba(0,81,135,0.25)' }}
          >
            {cta.label}
          </a>
        )}
        {cta?.note && (
          <p className="text-xs mt-3" style={{ color: 'var(--muted-foreground)' }}>{cta.note}</p>
        )}
      </div>
    </div>
  )
}
