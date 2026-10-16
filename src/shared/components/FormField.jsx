// Envoltorio de campo con label, mensaje de error y texto de ayuda,
// siguiendo el mismo lenguaje visual que ya usan los modales del sitio
// (var(--foreground)/var(--muted-foreground), sin un sistema de color aparte).
export default function FormField({ label, error, helperText, required, children }) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
          {label}{required && <span style={{ color: '#dc2626' }}> *</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-xs mt-1" style={{ color: '#dc2626' }}>⚠ {error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{helperText}</p>
      )}
    </div>
  )
}

// Estilo a fusionar en el `style` de un input/select/textarea cuando tiene error.
// Usa el shorthand `border` (no `borderColor`) porque el resto de inputs del
// sitio también lo definen con shorthand — mezclar shorthand y longhand en el
// mismo objeto de estilo hace que React emita un warning en cada re-render.
export function errorInputStyle(hasError) {
  return hasError
    ? { border: '1px solid #dc2626', backgroundColor: 'rgba(239,68,68,0.05)' }
    : {}
}
