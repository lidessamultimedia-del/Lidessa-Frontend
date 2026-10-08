import { useEffect, useRef, useState } from 'react'
import { Sliders, ChevronDown, Check } from '@/shared/components/Icons'

// Botón "Filtros" con menú desplegable para las tablas del panel admin.
// options: [{ id, label, count?, color? }] · value: id seleccionado.
// `defaultValue` es el filtro "sin filtrar" (para mostrar el botón resaltado
// y el enlace "Quitar filtro" solo cuando hay uno aplicado).
export default function FilterDropdown({ options, value, onChange, defaultValue, label = 'Filtros' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find(o => o.id === value)
  const isFiltered = defaultValue !== undefined && value !== defaultValue

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)} aria-haspopup="listbox" aria-expanded={open}
        className="inline-flex items-center gap-2 px-3.5 rounded-lg text-sm font-semibold transition-colors"
        style={{
          height: 38,
          border: `1px solid ${isFiltered ? '#005187' : 'var(--border)'}`,
          backgroundColor: isFiltered ? 'color-mix(in srgb, #005187 8%, var(--card))' : 'var(--card)',
          color: 'var(--foreground)',
        }}>
        <Sliders size={14} style={{ color: isFiltered ? '#005187' : 'var(--muted-foreground)' }} />
        <span>{label}</span>
        {selected && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: isFiltered ? '#005187' : 'var(--muted)', color: isFiltered ? 'white' : 'var(--muted-foreground)' }}>
            {selected.color && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: isFiltered ? 'white' : selected.color }} />}
            {selected.label}
          </span>
        )}
        <ChevronDown size={14} style={{ color: 'var(--muted-foreground)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div role="listbox" className="absolute left-0 z-40 overflow-hidden"
          style={{ top: 44, minWidth: 230, backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 14px 36px rgba(0,0,0,0.16)', animation: 'fadeUp 0.18s ease' }}>
          <div className="flex items-center justify-between px-3.5 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
            {isFiltered && (
              <button type="button" onClick={() => { onChange(defaultValue); setOpen(false) }}
                className="text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                Quitar filtro
              </button>
            )}
          </div>
          <div className="p-1.5">
            {options.map(o => {
              const active = o.id === value
              return (
                <button key={o.id} type="button" role="option" aria-selected={active}
                  onClick={() => { onChange(o.id); setOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left transition-colors"
                  style={{ backgroundColor: active ? 'color-mix(in srgb, #005187 9%, transparent)' : 'transparent', color: 'var(--foreground)' }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'var(--muted)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: o.color ?? 'transparent', border: o.color ? 'none' : '1px solid var(--border)', flexShrink: 0 }} />
                  <span className="flex-1" style={{ fontWeight: active ? 700 : 500 }}>{o.label}</span>
                  {o.count !== undefined && (
                    <span className="text-xs px-1.5 rounded-md" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}>{o.count}</span>
                  )}
                  <span style={{ width: 14, flexShrink: 0, color: '#005187' }}>{active && <Check size={14} />}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
