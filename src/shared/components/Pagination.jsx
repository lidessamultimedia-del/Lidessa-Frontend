// Paginador reusado por todas las listas largas del sitio — botones
// numerados simples, se oculta solo si todo cabe en una página.
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
        className="text-xs px-2.5 h-7 rounded-lg font-bold disabled:opacity-40"
        style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
        ‹
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onChange(p)}
          className="text-xs w-7 h-7 rounded-lg font-bold"
          style={{ backgroundColor: p === page ? '#005187' : 'var(--muted)', color: p === page ? 'white' : 'var(--muted-foreground)' }}>
          {p}
        </button>
      ))}
      <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
        className="text-xs px-2.5 h-7 rounded-lg font-bold disabled:opacity-40"
        style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
        ›
      </button>
    </div>
  )
}

// Recorta un arreglo ya filtrado/ordenado a la página actual (10 por
// página) y ajusta `page` si quedó fuera de rango (ej. tras un filtro).
export function paginate(items, page, pageSize = 10) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageItems = items.slice((safePage - 1) * pageSize, safePage * pageSize)
  return { pageItems, totalPages, safePage }
}
