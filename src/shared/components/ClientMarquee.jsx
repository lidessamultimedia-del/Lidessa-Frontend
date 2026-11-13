import { clients as allClients } from '@/shared/data/clients'

export default function ClientMarquee({ title = 'Empresas que confían en nosotros', items = allClients, speed = 28 }) {
  const renderClients = (group) => (
    <div className="flex gap-10 shrink-0 pr-10" aria-hidden={group > 0}>
      {items.map((c, i) => {
        const Tag = c.url ? 'a' : 'div'
        return (
          <Tag
            key={`${group}-${i}`}
            {...(c.url ? { href: c.url, tabIndex: group > 0 ? -1 : undefined } : {})}
            className={`flex items-center justify-center rounded-xl select-none shrink-0 ${c.url ? 'cursor-pointer' : 'cursor-default'}`}
            style={{
              height: 92,
              minWidth: 108,
              // `tight`: logos con mucho texto (p. ej. Andrea Iglesias) usan casi todo el alto.
              padding: c.tight ? '6px 12px' : '14px 20px',
              backgroundColor: c.dark ? '#1a1a1a' : 'var(--card)',
              border: '1px solid var(--border)',
              position: 'relative',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.12)'
              e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,81,135,0.22)'
              e.currentTarget.style.zIndex = 10
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = ''
              e.currentTarget.style.zIndex = ''
            }}
          >
            <img
              src={c.logo}
              alt={group === 0 ? c.name : ''}
              title={group === 0 ? c.name : undefined}
              style={{ height: '100%', width: 'auto', maxWidth: '100%', objectFit: 'contain' }}
            />
          </Tag>
        )
      })}
    </div>
  )

  return (
    <section
      className="py-10 overflow-hidden"
      style={{ backgroundColor: 'var(--muted)', borderBottom: '1px solid var(--border)' }}
    >
      <p
        className="text-center text-xs font-bold uppercase tracking-widest mb-7"
        style={{ color: 'var(--muted-foreground)' }}
      >
        {title}
      </p>

      <div className="relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
        <div className="flex animate-marquee w-max" style={{ animationDuration: `${speed}s` }}>
          {renderClients(0)}
          {renderClients(1)}
        </div>
      </div>
    </section>
  )
}
