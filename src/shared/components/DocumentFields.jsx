import FormField, { errorInputStyle } from '@/shared/components/FormField'
import { Sliders } from '@/shared/components/Icons'

// Letras, números y guiones (cubre CC, TI, CE, pasaporte, NIT con DV, etc.).
const DOC_NUMBER_RE = /^[A-Za-z0-9-]{4,20}$/

// Valida tipo + número de documento. Devuelve { documentType?, documentNumber? }.
export function validateDocumentFields(documentType, documentNumber) {
  const errs = {}
  if (!documentType) errs.documentType = 'Seleccione un tipo de documento.'
  if (!documentNumber.trim()) errs.documentNumber = 'El número de documento es obligatorio.'
  else if (!DOC_NUMBER_RE.test(documentNumber.trim())) errs.documentNumber = 'Solo letras, números o guiones (4 a 20).'
  return errs
}

// Tipo de documento (opciones administrables en Configuración → Tipos de
// documento) + número, con un atajo para ir a esa configuración.
export default function DocumentFields({ documentTypes = [], documentType, documentNumber, onChange, errors = {}, inputStyle, onManageDocumentTypes }) {
  const inputClass = 'w-full px-3 py-2.5 rounded-lg text-sm outline-none'
  return (
    <>
      <div className="grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3">
        <FormField label="Tipo de documento" required error={errors.documentType}>
          <select value={documentType} disabled={documentTypes.length === 0}
            onChange={e => onChange({ documentType: e.target.value })}
            className={`${inputClass} disabled:opacity-50`}
            style={{ ...inputStyle, ...errorInputStyle(!!errors.documentType) }}>
            {documentTypes.length === 0
              ? <option value="">Sin tipos configurados</option>
              : <>
                  {!documentTypes.some(t => t.name === documentType) && <option value="">Seleccione…</option>}
                  {documentTypes.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </>}
          </select>
        </FormField>
        <FormField label="Número de documento" required error={errors.documentNumber}>
          <input value={documentNumber} onChange={e => onChange({ documentNumber: e.target.value.replace(/\s/g, '') })}
            autoComplete="off" placeholder="Ej. 1023456789"
            className={inputClass} style={{ ...inputStyle, ...errorInputStyle(!!errors.documentNumber) }} />
        </FormField>
      </div>
      {onManageDocumentTypes && (
        <button type="button" onClick={onManageDocumentTypes}
          className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
          style={{ color: 'var(--primary)' }}>
          <Sliders size={12} />
          {documentTypes.length === 0 ? 'Configurar tipos de documento' : 'Gestionar tipos de documento en Configuración'}
        </button>
      )}
    </>
  )
}
