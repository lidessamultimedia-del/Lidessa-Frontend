import { useState } from 'react'
import { useLMS } from '../context/LMSContext'
import { downloadCsv } from '../utils/csv'
import { Download } from '@/shared/components/Icons'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function CompletionReport({ courseId }) {
  const lms = useLMS()
  const [letter, setLetter] = useState(null)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const course = lms.courses.find(c => c.id === courseId)
  const items = [
    ...lms.lessonsByCourse(courseId).map(l => ({ kind: 'lesson', item: l })),
    ...lms.assignmentsByCourse(courseId).map(a => ({ kind: 'assignment', item: a })),
  ].sort((x, y) => (x.item.order ?? 0) - (y.item.order ?? 0))
  const students = course.studentIds.map(id => lms.directoryById(id)).filter(Boolean)

  const filtered = students
    .filter(s => !letter || s.name.toUpperCase().startsWith(letter))
    .sort((a, b) => a.name.localeCompare(b.name))

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  function handleExport() {
    const headers = ['Nombre', 'Correo', ...items.map(i => i.item.title), 'Curso completo']
    const rows = filtered.map(s => {
      const completion = lms.courseCompletion(s.id, courseId)
      return [
        s.name, s.email,
        ...completion.items.map(x => x.done ? 'Completado' : 'Incompleto'),
        completion.complete ? 'Completado' : 'Incompleto',
      ]
    })
    downloadCsv(`finalizacion-${course.shortName || course.id}.csv`, headers, rows)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Finalización del curso</h3>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{students.length} participantes</p>
        </div>
        <button onClick={handleExport}
          className="text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5"
          style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          <Download size={13} /> Descargar CSV
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-wrap gap-1">
          <button onClick={() => { setLetter(null); setPage(1) }}
            className="text-xs px-2 py-1 rounded font-bold"
            style={{ color: !letter ? '#005187' : 'var(--muted-foreground)', backgroundColor: !letter ? 'rgba(0,81,135,0.1)' : 'transparent' }}>
            Todos
          </button>
          {ALPHABET.map(l => (
            <button key={l} onClick={() => { setLetter(l); setPage(1) }}
              className="text-xs px-2 py-1 rounded font-bold"
              style={{ color: letter === l ? '#005187' : 'var(--muted-foreground)', backgroundColor: letter === l ? 'rgba(0,81,135,0.1)' : 'transparent' }}>
              {l}
            </button>
          ))}
        </div>
        <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
          className="text-xs px-2 py-2 rounded-lg outline-none shrink-0"
          style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          {[5, 10, 25].map(n => <option key={n} value={n}>Mostrar {n}</option>)}
        </select>
      </div>

      <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid var(--border)' }}>
        <table className="text-sm" style={{ borderCollapse: 'collapse', width: '100%', minWidth: 480 + items.length * 110 }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--muted)' }}>
              <th className="text-left px-4 py-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)', position: 'sticky', left: 0, backgroundColor: 'var(--muted)' }}>Nombre / Correo</th>
              {items.map(({ kind, item }) => (
                <th key={item.id} className="text-left px-4 py-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                  {kind === 'lesson' ? '📖 ' : '📝 '}{item.title}
                </th>
              ))}
              <th className="text-left px-4 py-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Curso</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map(s => {
              const completion = lms.courseCompletion(s.id, courseId)
              return (
                <tr key={s.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="px-4 py-2.5" style={{ position: 'sticky', left: 0, backgroundColor: 'var(--card)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{s.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.email}</p>
                  </td>
                  {completion.items.map(x => (
                    <td key={x.item.id} className="px-4 py-2.5">
                      <input type="checkbox" checked={x.done} disabled readOnly />
                    </td>
                  ))}
                  <td className="px-4 py-2.5">
                    <span className="text-xs px-2 py-1 rounded-full font-semibold"
                      style={{ backgroundColor: completion.complete ? 'rgba(22,163,74,0.12)' : 'var(--muted)', color: completion.complete ? '#16a34a' : 'var(--muted-foreground)' }}>
                      {completion.complete ? 'Completado' : 'Incompleto'}
                    </span>
                  </td>
                </tr>
              )
            })}
            {pageRows.length === 0 && (
              <tr><td colSpan={items.length + 2} className="text-center py-6 text-sm" style={{ color: 'var(--muted-foreground)' }}>Sin estudiantes para este filtro.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className="text-xs w-7 h-7 rounded-lg font-bold"
              style={{ backgroundColor: p === safePage ? '#005187' : 'var(--muted)', color: p === safePage ? 'white' : 'var(--muted-foreground)' }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
