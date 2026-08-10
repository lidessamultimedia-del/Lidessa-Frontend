import { useState } from 'react'
import { Plus, Edit2, Trash, Check, X } from '@/shared/components/Icons'
import DocumentTypeFormModal from './DocumentTypeFormModal'

function focusRing(e) { e.target.style.borderColor = '#4d82bc' }
function blurRing(e) { e.target.style.borderColor = 'var(--border)' }

export default function DocumentTypesManagerView({ documentTypes, directory, onAdd, onUpdate, onRequestDelete }) {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [editingName, setEditingName] = useState('')

  function countInUse(name) {
    return directory.filter(u => u.documentType === name).length
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
          Cree, renombre o elimine los tipos de documento disponibles al crear o editar un profesor.
        </p>
        <button onClick={() => setAddModalOpen(true)}
          className="shrink-0 px-3.5 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-1.5 transition-transform"
          style={{ background: 'linear-gradient(135deg, #005187 0%, #4d82bc 55%, #b8860b 100%)', boxShadow: '0 4px 14px rgba(0,81,135,0.25)' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={14} /> Nuevo tipo de documento
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {documentTypes.map((dt, i) => {
          const inUse = countInUse(dt.name)
          const isEditing = editingIndex === i
          return (
            <div key={dt.name}
              className="transition-colors"
              style={{
                display: 'flex', gap: 12, padding: '13px 20px', alignItems: 'center',
                borderBottom: i < documentTypes.length - 1 ? '1px solid var(--border)' : 'none',
                backgroundColor: 'var(--card)',
                opacity: 0,
                animation: 'fadeUpSoft 0.45s ease forwards',
                animationDelay: `${Math.min(i * 0.04, 0.3)}s`,
              }}
            >
              {isEditing ? (
                <>
                  <input autoFocus value={editingName} onChange={e => setEditingName(e.target.value)}
                    onFocus={focusRing} onBlur={blurRing}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirmEdit(dt.name) } if (e.key === 'Escape') setEditingIndex(null) }}
                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-colors"
                    style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                  <button onClick={() => confirmEdit(dt.name)} title="Guardar"
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
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{dt.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                      {inUse} profesor{inUse === 1 ? '' : 'es'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => startEdit(i, dt.name)} title="Renombrar"
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ backgroundColor: 'rgba(0,81,135,0.1)', color: '#005187', border: '1px solid rgba(0,81,135,0.2)' }}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => onRequestDelete(dt.name, inUse)} title="Eliminar"
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
        {documentTypes.length === 0 && (
          <p className="text-sm px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}>
            No hay tipos de documento todavía.
          </p>
        )}
      </div>

      {addModalOpen && (
        <DocumentTypeFormModal
          documentTypes={documentTypes}
          onSave={handleAdd}
          onClose={() => setAddModalOpen(false)}
        />
      )}
    </div>
  )
}
