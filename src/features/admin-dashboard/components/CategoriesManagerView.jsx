import { useState } from 'react'
import { Plus, Edit2, Trash, Check, X } from '@/shared/components/Icons'
import CategoryFormModal from './CategoryFormModal'

function focusRing(e) { e.target.style.borderColor = '#4d82bc' }
function blurRing(e) { e.target.style.borderColor = 'var(--border)' }

export default function CategoriesManagerView({ categories, services, onAdd, onUpdate, onToggleActive, onRequestDelete }) {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [editingName, setEditingName] = useState('')

  function countInUse(name) {
    return services.filter(s => s.category === name).length
  }

  function handleAdd(name) {
    onAdd(name)
    setAddModalOpen(false)
  }

  function startEdit(i, name) {
    setEditingIndex(i)
    setEditingName(name)
  }

  function confirmEdit(oldName) {
    const clean = editingName.trim()
    if (clean && clean !== oldName) onUpdate(oldName, clean)
    setEditingIndex(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5">
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Cree, renombre, active/desactive o elimine las categorías usadas para clasificar los servicios. Las categorías inactivas dejan de mostrarse en el sitio público.
        </p>
        <button onClick={() => setAddModalOpen(true)}
          className="shrink-0 px-3.5 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-1.5 transition-transform"
          style={{ background: 'linear-gradient(135deg, #005187 0%, #4d82bc 55%, #b8860b 100%)', boxShadow: '0 4px 14px rgba(0,81,135,0.25)' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={14} /> Nueva categoría
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {categories.map((cat, i) => {
          const inUse = countInUse(cat.name)
          const isEditing = editingIndex === i
          const isActive = cat.active !== false
          return (
            <div key={cat.name}
              className="transition-colors"
              style={{
                display: 'flex', gap: 12, padding: '13px 20px', alignItems: 'center',
                borderBottom: i < categories.length - 1 ? '1px solid var(--border)' : 'none',
                backgroundColor: 'var(--card)',
              }}
            >
              {isEditing ? (
                <>
                  <input autoFocus value={editingName} onChange={e => setEditingName(e.target.value)}
                    onFocus={focusRing} onBlur={blurRing}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirmEdit(cat.name) } if (e.key === 'Escape') setEditingIndex(null) }}
                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-colors"
                    style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                  <button onClick={() => confirmEdit(cat.name)} title="Guardar"
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ color: '#16a34a' }}>
                    <Check size={15} />
                  </button>
                  <button onClick={() => setEditingIndex(null)} title="Cancelar"
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                    <X size={15} />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{cat.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                      {inUse} servicio{inUse === 1 ? '' : 's'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Toggle activo/inactivo */}
                    <button
                      onClick={() => onToggleActive(cat.name)}
                      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.94)'}
                      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      role="switch"
                      aria-checked={isActive}
                      title={isActive ? 'Desactivar' : 'Activar'}
                      className="relative shrink-0"
                      style={{
                        width: 40, height: 22, borderRadius: 9999,
                        backgroundColor: isActive ? '#16a34a' : 'var(--border)',
                        boxShadow: isActive ? '0 0 0 4px rgba(22,163,74,0.15)' : '0 0 0 4px transparent',
                        transition: 'background-color 0.35s ease, box-shadow 0.35s ease, transform 0.15s ease',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute', top: 2, left: isActive ? 20 : 2,
                          width: 18, height: 18, borderRadius: '50%',
                          backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                          transition: 'left 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                      />
                    </button>
                    <span className="text-xs font-medium shrink-0" style={{ width: 52, color: isActive ? '#16a34a' : 'var(--muted-foreground)', transition: 'color 0.35s ease' }}>
                      {isActive ? 'Activo' : 'Inactivo'}
                    </span>

                    <button onClick={() => startEdit(i, cat.name)} title="Renombrar"
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ backgroundColor: 'rgba(0,81,135,0.1)', color: '#005187', border: '1px solid rgba(0,81,135,0.2)' }}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => onRequestDelete(cat.name, inUse)} title="Eliminar"
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626' }}>
                      <Trash size={13} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        })}
        {categories.length === 0 && (
          <p className="text-sm px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}>
            No hay categorías todavía.
          </p>
        )}
      </div>

      {addModalOpen && (
        <CategoryFormModal
          categories={categories}
          onSave={handleAdd}
          onClose={() => setAddModalOpen(false)}
        />
      )}
    </div>
  )
}
