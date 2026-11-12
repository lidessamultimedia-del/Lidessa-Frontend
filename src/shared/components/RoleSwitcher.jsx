import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, ROLE_HOME } from '@/features/auth/context/AuthContext'
import { ArrowLeftRight, Check } from '@/shared/components/Icons'

const ROLE_LABEL = { admin: 'Administrador', profesor: 'Profesor', estudiante: 'Estudiante', cliente: 'Cliente' }

// Botón junto al selector de tema, solo visible para cuentas vinculadas (ver
// 2.2 del plan) — más de un rol en la misma cuenta. Cambia la vista activa
// sin cerrar sesión (sigue siendo la misma cuenta/token) y navega al panel
// de ese rol.
export default function RoleSwitcher({ className = '' }) {
  const { user, activeRole, setActiveRole } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!user?.roles || user.roles.length < 2) return null

  function switchTo(role) {
    setOpen(false)
    if (role === activeRole) return
    setActiveRole(role)
    navigate(ROLE_HOME[role] ?? '/')
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Cambiar de vista"
        title="Cambiar de vista"
        className="flex items-center justify-center rounded-full transition-colors"
        style={{ width: 38, height: 38, color: 'var(--foreground)', backgroundColor: open ? 'var(--muted)' : 'transparent' }}
      >
        <ArrowLeftRight size={17} />
      </button>
      {open && (
        <div className="absolute right-0 overflow-hidden"
          style={{ top: 46, width: 210, backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: '0 16px 40px rgba(0,0,0,0.16)', zIndex: 100, animation: 'fadeUp 0.2s ease' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
            <span className="text-xs font-bold" style={{ color: 'var(--muted-foreground)' }}>Cambiar de vista</span>
          </div>
          {user.roles.map(role => (
            <button key={role} type="button" onClick={() => switchTo(role)}
              className="w-full text-left flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm transition-colors"
              style={{ color: role === activeRole ? 'var(--primary)' : 'var(--foreground)', fontWeight: role === activeRole ? 700 : 500 }}
              onMouseEnter={e => { if (role !== activeRole) e.currentTarget.style.backgroundColor = 'var(--muted)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}>
              {ROLE_LABEL[role] ?? role}
              {role === activeRole && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
