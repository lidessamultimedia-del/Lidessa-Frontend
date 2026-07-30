import { useState } from 'react'
import { useLMS } from '../context/LMSContext'
import { downloadCsv } from '../utils/csv'
import { Search, Download } from '@/shared/components/Icons'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function GradebookReport({ courseId }) {
  const lms = useLMS()
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState(null)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const course = lms.courses.find(c => c.id === courseId)
  const assignments = lms.assignmentsByCourse(courseId)
  const students = course.studentIds.map(id => lms.directoryById(id)).filter(Boolean)

  function gradeFor(studentId, assignmentId) {
    const sub = lms.submissionFor(assignmentId, studentId)
    return sub?.status === 'graded' ? sub.grade : null
  }
  function totalFor(studentId) {
    const grades = assignments.map(a => gradeFor(studentId, a.id)).filter(g => g != null)
    if (!grades.length) return null
    return Math.round((grades.reduce((s, g) => s + g, 0) / grades.length) * 10) / 10
  }

  const filtered = students
    .filter(s => s.name.toLowerCase().includes(query.toLowerCase()))
    .filter(s => !letter || s.name.toUpperCase().startsWith(letter))
    .sort((a, b) => a.name.localeCompare(b.name))

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  function handleExport() {
    const headers = ['Nombre', 'Correo', ...assignments.map(a => a.title), 'Total']
    const rows = filtered.map(s => [
      s.name, s.email,
      ...assignments.map(a => gradeFor(s.id, a.id) ?? ''),
      totalFor(s.id) ?? '',
    ])
    downloadCsv(`calificador-${course.shortName || course.id}.csv`, headers, rows)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>Informe del calificador</h3>
        <button onClick={handleExport}
          className="text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5"
          style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          <Download size={13} /> Descargar CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
          <Search size={14} style={{ color: 'var(--muted-foreground)' }} />
          <input value={query} onChange={e => { setQuery(e.target.value); setPage(1) }}
            placeholder="Buscar por nombre…"
            className="text-sm outline-none bg-transparent" style={{ color: 'var(--foreground)', width: 180 }} />
        </div>
        <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
          className="text-xs px-2 py-2 rounded-lg outline-none"
          style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
          {[5, 10, 25].map(n => <option key={n} value={n}>Mostrar {n}</option>)}
        </select>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
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

      <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid var(--border)' }}>
        <table className="text-sm" style={{ borderCollapse: 'collapse', width: '100%', minWidth: 480 + assignments.length * 120 }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--muted)' }}>
              <th className="text-left px-4 py-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)', position: 'sticky', left: 0, backgroundColor: 'var(--muted)' }}>Nombre / Correo</th>
              {assignments.map(a => (
                <th key={a.id} className="text-left px-4 py-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{a.title}</th>
              ))}
              <th className="text-left px-4 py-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map(s => (
              <tr key={s.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td className="px-4 py-2.5" style={{ position: 'sticky', left: 0, backgroundColor: 'var(--card)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{s.name}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.email}</p>
                </td>
                {assignments.map(a => {
                  const g = gradeFor(s.id, a.id)
                  return (
                    <td key={a.id} className="px-4 py-2.5 text-sm" style={{ color: g != null ? '#16a34a' : 'var(--muted-foreground)', fontWeight: g != null ? 700 : 400 }}>
                      {g != null ? `${g.toFixed(2)} ✓` : '—'}
                    </td>
                  )
                })}
                <td className="px-4 py-2.5 text-sm font-black" style={{ color: 'var(--foreground)' }}>
                  {totalFor(s.id) != null ? totalFor(s.id).toFixed(2) : '—'}
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr><td colSpan={assignments.length + 2} className="text-center py-6 text-sm" style={{ color: 'var(--muted-foreground)' }}>Sin estudiantes para este filtro.</td></tr>
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
