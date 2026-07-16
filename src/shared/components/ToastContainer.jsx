import { useEffect, useState } from 'react'
import { useToast } from '@/shared/context/ToastContext'

const typeConfig = {
  success: { bg: '#16a34a', icon: '✓', label: 'Éxito' },
  error:   { bg: '#dc2626', icon: '✕', label: 'Error' },
  warning: { bg: '#d97706', icon: '⚠', label: 'Advertencia' },
  info:    { bg: '#005187', icon: 'ℹ', label: 'Información' },
}

function ToastItem({ t, onDismiss }) {
  const [visible, setVisible] = useState(false)
  const cfg = typeConfig[t.type]

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  function handleDismiss() {
    setVisible(false)
    setTimeout(onDismiss, 280)
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        background: 'var(--card)',
        border: `1px solid ${cfg.bg}33`,
        borderLeft: `4px solid ${cfg.bg}`,
        borderRadius: 12,
        padding: '14px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(32px)',
        transition: 'opacity 0.28s ease, transform 0.28s ease',
        minWidth: 280,
        maxWidth: 380,
        pointerEvents: 'all',
      }}
    >
      <span style={{
        width: 28, height: 28, borderRadius: 8,
        backgroundColor: cfg.bg,
        color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 700, flexShrink: 0,
      }}>
        {cfg.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--foreground)', marginBottom: t.message ? 2 : 0 }}>
          {t.title}
        </p>
        {t.message && (
          <p style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.4 }}>{t.message}</p>
        )}
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Cerrar notificación"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--muted-foreground)', fontSize: 16, lineHeight: 1,
          padding: '2px 4px', flexShrink: 0,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--foreground)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-foreground)' }}
      >
        ×
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const { toasts, dismiss } = useToast()

  return (
    <div
      aria-label="Notificaciones"
      style={{
        position: 'fixed',
        top: 80,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => (
        <ToastItem key={t.id} t={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  )
}
