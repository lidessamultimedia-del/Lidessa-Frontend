// Selector de tema (claro / automático / oscuro) — usado en el header público
// y en el panel de administración, para que ambos se vean y comporten igual.
export default function ThemeToggle({ theme, setTheme, className = '' }) {
  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className={`relative flex items-center shrink-0 ${className}`}
      style={{
        borderRadius: 9999,
        padding: 3,
        gap: 2,
        backgroundColor: 'color-mix(in srgb, var(--foreground) 6%, transparent)',
        border: '1px solid var(--border)',
      }}
    >
      {/* sliding highlight */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 3,
          bottom: 3,
          left: theme === 'light' ? 3 : theme === 'system' ? 31 : 59,
          width: 26,
          borderRadius: 9999,
          background:
            theme === 'dark'
              ? 'linear-gradient(135deg, #10294d 0%, #071426 100%)'
              : theme === 'system'
                ? 'linear-gradient(135deg, #4d82bc 0%, #b8860b 100%)'
                : 'linear-gradient(135deg, #ffd35c 0%, #f7b733 100%)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.22)',
          transition: 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease',
        }}
      />

      {/* Claro */}
      <button
        type="button"
        role="radio"
        aria-checked={theme === 'light'}
        aria-label="Tema claro"
        title="Tema claro"
        onClick={() => setTheme('light')}
        className="relative z-10 flex items-center justify-center"
        style={{ width: 26, height: 22, borderRadius: 9999 }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={theme === 'light' ? '#fff' : 'var(--muted-foreground)'} strokeWidth="2" strokeLinecap="round" style={{ transition: 'stroke 0.3s ease' }}>
          <circle cx="12" cy="12" r="4.2" fill={theme === 'light' ? '#fff' : 'none'} stroke={theme === 'light' ? '#fff' : 'var(--muted-foreground)'} />
          <line x1="12" y1="1.5" x2="12" y2="3.5" />
          <line x1="12" y1="20.5" x2="12" y2="22.5" />
          <line x1="1.5" y1="12" x2="3.5" y2="12" />
          <line x1="20.5" y1="12" x2="22.5" y2="12" />
          <line x1="4.6" y1="4.6" x2="6" y2="6" />
          <line x1="18" y1="18" x2="19.4" y2="19.4" />
          <line x1="4.6" y1="19.4" x2="6" y2="18" />
          <line x1="18" y1="6" x2="19.4" y2="4.6" />
        </svg>
      </button>

      {/* Automático (sigue el sistema) */}
      <button
        type="button"
        role="radio"
        aria-checked={theme === 'system'}
        aria-label="Tema automático (según el sistema)"
        title="Automático (según el sistema)"
        onClick={() => setTheme('system')}
        className="relative z-10 flex items-center justify-center"
        style={{ width: 26, height: 22, borderRadius: 9999 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" style={{ transition: 'opacity 0.3s ease' }}>
          <circle cx="12" cy="12" r="9" fill="none" stroke={theme === 'system' ? '#fff' : 'var(--muted-foreground)'} strokeWidth="2" />
          <path d="M12 3a9 9 0 0 0 0 18Z" fill={theme === 'system' ? '#fff' : 'var(--muted-foreground)'} />
        </svg>
      </button>

      {/* Oscuro */}
      <button
        type="button"
        role="radio"
        aria-checked={theme === 'dark'}
        aria-label="Tema oscuro"
        title="Tema oscuro"
        onClick={() => setTheme('dark')}
        className="relative z-10 flex items-center justify-center"
        style={{ width: 26, height: 22, borderRadius: 9999 }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill={theme === 'dark' ? '#fff' : 'var(--muted-foreground)'} style={{ transition: 'fill 0.3s ease' }}>
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />
        </svg>
      </button>
    </div>
  )
}
