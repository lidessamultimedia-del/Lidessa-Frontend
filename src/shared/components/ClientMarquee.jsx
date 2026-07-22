import { clients } from '@/shared/data/clients'

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
        <div className="flex gap-6 animate-marquee w-max">
          {items.map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-center rounded-xl cursor-default select-none shrink-0"
              style={{
                height: 76,
                width: 150,
                padding: '10px 18px',
                backgroundColor: c.dark ? '#1a1a1a' : 'var(--card)',
                border: '1px solid var(--border)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,81,135,0.14)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = ''
              }}
            >
              <img
                src={c.logo}
                alt={c.name}
                title={c.name}
                className="max-h-full max-w-full"
                style={{ objectFit: 'contain' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
