import { Link } from 'react-router-dom'

// Página 404 — cualquier URL que no coincida con una ruta real del sitio
// cae aquí en vez de quedar en blanco.
export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-md">
        <p className="text-6xl font-black mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>404</p>
        <h1 className="text-2xl font-black mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          No encontramos esta página
        </h1>
        <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--muted-foreground)' }}>
          Puede que el enlace esté mal escrito o que la página ya no exista. Vuelva al inicio para seguir navegando.
        </p>
        <Link to="/" className="inline-block px-6 py-3 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--primary)' }}>
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
