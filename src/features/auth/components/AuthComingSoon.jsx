import { Link } from 'react-router-dom'

export default function AuthComingSoon({ title, message }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <img src="/assets/logolidessa.png" alt="Lidessa" style={{ width: 34, height: 34, objectFit: 'contain' }} />
          <span className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
            Lide<span style={{ color: '#4d82bc' }}>ssa</span>
          </span>
        </Link>
        <h1 className="text-2xl font-black mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          {title}
        </h1>
        <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--muted-foreground)' }}>
          {message}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="https://wa.me/573332371006?text=Hola, quisiera más información" target="_blank" rel="noreferrer"
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#25D366' }}>
            Escribirnos por WhatsApp
          </a>
          <Link to="/" className="px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
            style={{ border: '2px solid var(--border)', color: 'var(--foreground)' }}>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
