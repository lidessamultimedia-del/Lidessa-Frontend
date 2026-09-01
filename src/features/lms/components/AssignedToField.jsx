import FormField from '@/shared/components/FormField'

// Selector de "¿para quién es esta tarea/examen?" — reusado por
// AssignmentFormModal y QuizFormModal. `value` es un array de studentIds;
// vacío significa "todo el curso" (comportamiento de siempre).
export default function AssignedToField({ students, value, onChange }) {
  const allSelected = value.length === 0

  return (
    <FormField label="¿Para quién es?">
      <div className="flex gap-1 mb-2">
        <button type="button" onClick={() => onChange([])}
          className="text-xs px-3 py-1.5 rounded-full font-bold"
          style={{ backgroundColor: allSelected ? '#005187' : 'var(--muted)', color: allSelected ? 'white' : 'var(--muted-foreground)' }}>
          Todo el curso
        </button>
        <button type="button" onClick={() => { if (allSelected && students.length) onChange([students[0].id]) }}
          className="text-xs px-3 py-1.5 rounded-full font-bold"
          style={{ backgroundColor: !allSelected ? '#005187' : 'var(--muted)', color: !allSelected ? 'white' : 'var(--muted-foreground)' }}>
          Estudiantes específicos
        </button>
      </div>
      {!allSelected && (
        <div className="rounded-lg max-h-40 overflow-y-auto" style={{ border: '1px solid var(--border)' }}>
          {students.map((s, i) => (
            <label key={s.id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer"
              style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', color: 'var(--foreground)' }}>
              <input type="checkbox" checked={value.includes(s.id)}
                onChange={e => onChange(e.target.checked ? [...value, s.id] : value.filter(id => id !== s.id))} />
              {s.name}
            </label>
          ))}
          {students.length === 0 && (
            <p className="text-xs px-3 py-2" style={{ color: 'var(--muted-foreground)' }}>Sin estudiantes inscritos todavía.</p>
          )}
        </div>
      )}
    </FormField>
  )
}
