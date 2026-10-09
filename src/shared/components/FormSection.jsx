// Bloque con título e ícono para agrupar campos dentro de los formularios
// del panel admin (Datos personales, Identificación, Contacto, Acceso…).
export default function FormSection({ icon: Icon, title, children }) {
  return (
    <fieldset className="space-y-3">
      <legend className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--muted-foreground)' }}>
        <span className="flex items-center justify-center rounded-md" style={{ width: 22, height: 22, backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }}>
          <Icon size={12} />
        </span>
        {title}
      </legend>
      {children}
    </fieldset>
  )
}
