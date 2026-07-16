const clients = [
  { name: 'Constructora Andina', initial: 'CA', color: '#005187' },
  { name: 'Colegio Bilingüe La Colina', initial: 'CB', color: '#4d82bc' },
  { name: 'Grupo Empresarial Nortex', initial: 'GN', color: '#005187' },
  { name: 'Torres del Lago PH', initial: 'TL', color: '#4d82bc' },
  { name: 'Clínica Salud Total', initial: 'ST', color: '#005187' },
  { name: 'Distribuidora Nacional', initial: 'DN', color: '#4d82bc' },
  { name: 'Alcaldía de Funza', initial: 'AF', color: '#005187' },
  { name: 'Instituto Técnico CDA', initial: 'IT', color: '#4d82bc' },
]

// duplicated for seamless loop
const items = [...clients, ...clients]

export default function ClientMarquee() {
  return (
    <section
      className="py-10 overflow-hidden"
      style={{ backgroundColor: 'var(--muted)', borderBottom: '1px solid var(--border)' }}
    >
      <p
        className="text-center text-xs font-bold uppercase tracking-widest mb-7"
        style={{ color: 'var(--muted-foreground)' }}
      >
        Empresas que confían en nosotros
      </p>

      <div className="relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
        <div className="flex gap-8 animate-marquee w-max">
          {items.map((c, i) => (
            <div
              key={i}
              className="group flex items-center gap-3 px-5 py-3 rounded-xl cursor-default select-none shrink-0"
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget
                el.style.transform = 'translateY(-3px)'
                el.style.boxShadow = '0 8px 24px rgba(0,81,135,0.14)'
                el.style.borderColor = c.color
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                el.style.transform = ''
                el.style.boxShadow = ''
                el.style.borderColor = 'var(--border)'
              }}
            >
              {/* Logo placeholder — grayscale normally, color on hover */}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{
                  backgroundColor: '#8c8c8c',
                  transition: 'background-color 0.3s ease',
                  filter: 'grayscale(1)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.backgroundColor = c.color
                  el.style.filter = 'grayscale(0)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.backgroundColor = '#8c8c8c'
                  el.style.filter = 'grayscale(1)'
                }}
              >
                {c.initial}
              </div>
              <span
                className="text-sm font-semibold whitespace-nowrap"
                style={{
                  color: 'var(--muted-foreground)',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = c.color }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-foreground)' }}
              >
                {c.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
