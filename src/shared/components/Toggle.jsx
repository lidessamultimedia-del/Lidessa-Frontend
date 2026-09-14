// Interruptor deslizante genérico (on/off) — reemplaza los botones tipo
// "pastilla" para estados binarios (activo/inactivo, publicado/borrador, etc.)
// con un control más visual, consistente en toda la app.
export default function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onChange}
      className="relative shrink-0"
      style={{
        width: 40, height: 22, borderRadius: 9999, padding: 0, border: 'none',
        backgroundColor: checked ? '#16a34a' : 'var(--border)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 0.25s ease',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute', top: 2, left: checked ? 20 : 2,
          width: 18, height: 18, borderRadius: '50%',
          backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
          transition: 'left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
    </button>
  )
}
