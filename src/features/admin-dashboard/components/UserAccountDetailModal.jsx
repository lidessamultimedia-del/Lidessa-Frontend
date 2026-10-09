import Avatar from '@/shared/components/Avatar'
import { X, Edit2, Trash, Mail, Phone, IdCard, MapPin, User, BookOpen, ShoppingCart } from '@/shared/components/Icons'

export const ROLE_BADGE = {
  admin: { label: 'Administrador', color: '#005187' },
  profesor: { label: 'Profesor', color: '#7c3aed' },
  estudiante: { label: 'Estudiante', color: '#16a34a' },
  cliente: { label: 'Cliente', color: '#d97706' },
}

export function RoleBadge({ role }) {
  const r = ROLE_BADGE[role] ?? { label: role, color: '#64748b' }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ backgroundColor: `${r.color}1a`, color: r.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: r.color }} />
      {r.label}
    </span>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5" style={{ borderTop: '1px solid var(--border)' }}>
      <span className="flex items-center justify-center rounded-lg shrink-0" style={{ width: 30, height: 30, backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
        <Icon size={14} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
        <p className="text-sm break-words" style={{ color: value ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{value || '—'}</p>
      </div>
    </div>
  )
}

// Ficha de detalle de una cuenta (Configuración → Usuarios y Roles), con
// lo relacionado según el rol: cursos que dicta, cursos inscritos o pedidos.
export default function UserAccountDetailModal({ account, isSelf, related = [], relatedTitle, relatedIcon, onEdit, onDelete, onClose }) {
  const RelatedIcon = relatedIcon ?? (account.role === 'cliente' ? ShoppingCart : BookOpen)
  const doc = account.documentNumber ? `${account.documentType ? `${account.documentType} · ` : ''}${account.documentNumber}` : ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="rounded-2xl w-full shadow-2xl max-w-md max-h-full flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', animation: 'fadeUp 0.25s ease' }}>
        {/* Cabecera */}
        <div className="relative px-6 pt-6 pb-5" style={{ background: 'linear-gradient(135deg, #10294d 0%, #071426 100%)' }}>
          <button type="button" onClick={onClose} aria-label="Cerrar"
            className="absolute top-4 right-4 flex items-center justify-center rounded-full"
            style={{ width: 32, height: 32, color: 'rgba(255,255,255,0.7)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            <X size={18} />
          </button>
          <div className="flex items-center gap-4">
            <Avatar user={account} size={56} />
            <div className="min-w-0">
              <p className="text-lg font-black text-white truncate" style={{ fontFamily: 'var(--font-display)' }}>
                {account.name}
                {isSelf && <span className="ml-2 text-[11px] font-bold px-1.5 py-0.5 rounded-full align-middle" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>Tú</span>}
              </p>
              <p className="text-xs truncate mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>{account.email}</p>
              <span className="inline-block rounded-full" style={{ backgroundColor: 'white' }}><RoleBadge role={account.role} /></span>
            </div>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="overflow-y-auto px-6 py-4">
          <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--muted-foreground)' }}>Información</p>
          <div className="mb-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <InfoRow icon={User} label="Nombre completo" value={account.name} />
            <InfoRow icon={IdCard} label="Documento" value={doc} />
            <InfoRow icon={Mail} label="Correo electrónico" value={account.email} />
            <InfoRow icon={Phone} label="Teléfono" value={account.phone} />
            {account.role === 'cliente' && <InfoRow icon={MapPin} label="Dirección" value={account.address} />}
          </div>

          {relatedTitle && (
            <>
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--muted-foreground)' }}>
                {relatedTitle} ({related.length})
              </p>
              {related.length === 0 ? (
                <p className="text-xs py-3 text-center rounded-lg mb-2" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}>Sin registros.</p>
              ) : (
                <div className="space-y-1.5 mb-2">
                  {related.map(r => (
                    <div key={r.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                      <RelatedIcon size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span className="text-sm flex-1 min-w-0 truncate" style={{ color: 'var(--foreground)' }}>{r.label}</span>
                      {r.meta && <span className="text-xs shrink-0" style={{ color: 'var(--muted-foreground)' }}>{r.meta}</span>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          {!isSelf && (
            <button type="button" onClick={onDelete}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold"
              style={{ border: '1px solid rgba(220,38,38,0.35)', color: '#dc2626' }}>
              <Trash size={14} /> Eliminar
            </button>
          )}
          <button type="button" onClick={onEdit}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold text-white"
            style={{ backgroundColor: '#005187' }}>
            <Edit2 size={14} /> Editar usuario
          </button>
        </div>
      </div>
    </div>
  )
}
