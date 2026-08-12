import { useState } from 'react'
import { useLMS, PASS_THRESHOLD } from '../context/LMSContext'
import { downloadCsv } from '../utils/csv'
import { Search, Download, FileText, HelpCircle } from '@/shared/components/Icons'
import Avatar from '@/shared/components/Avatar'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const KIND_ICON = { assignment: FileText, quiz: HelpCircle }
const KIND_COLOR = { assignment: '#7c3aed', quiz: '#d97706' }

export default function GradebookReport({ courseId }) {
  const lms = useLMS()
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState(null)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const course = lms.courses.find(c => c.id === courseId)
  const students = course.studentIds.map(id => lms.directoryById(id)).filter(Boolean)

  const topics = lms.topicsByCourse(courseId)
  const untitledItems = lms.itemsByTopic(null).filter(r => r.kind !== 'lesson')
  const topicGroups = [
    ...topics.map(t => ({ id: t.id, title: t.title, items: lms.itemsByTopic(t.id).filter(r => r.kind !== 'lesson') })),
    ...(untitledItems.length > 0 ? [{ id: 'untitled', title: 'Sin tema', items: untitledItems }] : []),
  ].filter(g => g.items.length > 0)
  const allItems = topicGroups.flatMap(g => g.items)

  function gradeFor(studentId, kind, itemId) {
    if (kind === 'assignment') {
      const sub = lms.submissionFor(itemId, studentId)
      return sub?.status === 'graded' ? sub.grade : null
    }
    return lms.attemptFor(itemId, studentId)?.score ?? null
  }
  function retryRecordFor(studentId, kind, itemId) {
    return kind === 'assignment' ? lms.submissionFor(itemId, studentId) : lms.attemptFor(itemId, studentId)
  }
  function handleAllowRetry(kind, record) {
    lms.allowRetry(kind, record.id)
  }

  const filtered = students
    .filter(s => s.name.toLowerCase().includes(query.toLowerCase()))
    .filter(s => !letter || s.name.toUpperCase().startsWith(letter))
    .sort((a, b) => a.name.localeCompare(b.name))

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  function handleExport() {
    const headers = ['Nombre', 'Correo', ...allItems.map(({ item }) => item.title), 'Total (ponderado)', 'Estado']
    const rows = filtered.map(s => {
      const wg = lms.courseWeightedGrade(s.id, courseId)
      return [
        s.name, s.email,
        ...allItems.map(({ kind, item }) => gradeFor(s.id, kind, item.id) ?? ''),
        wg.average ?? '',
        wg.allGraded ? (wg.passed ? 'Aprobado' : 'Reprobado') : 'En curso',
      ]
    })
    downloadCsv(`calificador-${course.shortName || course.id}.csv`, headers, rows)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="text-sm font-bold pb-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)', borderBottom: '2px solid #b8860b', display: 'inline-block' }}>Informe del calificador</h3>
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

      {allItems.length === 0 ? (
        <p className="text-sm px-4 py-6 text-center rounded-xl" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
          Todavía no hay tareas ni exámenes en este curso.
        </p>
      ) : (
        <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid var(--border)' }}>
          <table className="text-sm" style={{ borderCollapse: 'collapse', width: '100%', minWidth: 260 + allItems.length * 130 }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--muted)' }}>
                <th rowSpan={2} className="text-left px-4 py-2 text-xs font-bold uppercase tracking-wider align-bottom"
                  style={{ color: 'var(--muted-foreground)', position: 'sticky', left: 0, backgroundColor: 'var(--muted)', borderRight: '1px solid var(--border)' }}>
                  Nombre / Correo
                </th>
                {topicGroups.map(g => (
                  <th key={g.id} colSpan={g.items.length} className="text-center px-3 py-1.5 text-xs font-bold"
                    style={{ color: 'var(--foreground)', borderLeft: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                    {g.title}
                  </th>
                ))}
                <th rowSpan={2} className="text-left px-4 py-2 text-xs font-bold uppercase tracking-wider align-bottom"
                  style={{ color: 'var(--muted-foreground)', borderLeft: '1px solid var(--border)' }}>
                  Total ponderado
                </th>
              </tr>
              <tr style={{ backgroundColor: 'var(--muted)' }}>
                {topicGroups.flatMap(g => g.items).map(({ kind, item }) => {
                  const Icon = KIND_ICON[kind]
                  return (
                    <th key={item.id} className="text-left px-3 py-2 text-xs font-semibold"
                      style={{ color: KIND_COLOR[kind], whiteSpace: 'nowrap', borderLeft: '1px solid var(--border)' }}>
                      <span className="flex items-center gap-1"><Icon size={11} /> {item.title}</span>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {pageRows.map(s => {
                const wg = lms.courseWeightedGrade(s.id, courseId)
                const rowTint = wg.allGraded ? (wg.passed ? 'rgba(22,163,74,0.06)' : 'rgba(220,38,38,0.06)') : 'transparent'
                return (
                <tr key={s.id} style={{ borderTop: '1px solid var(--border)', backgroundColor: rowTint }}>
                  <td className="px-4 py-2.5" style={{ position: 'sticky', left: 0, backgroundColor: wg.allGraded ? (wg.passed ? 'color-mix(in srgb, #16a34a 6%, var(--card))' : 'color-mix(in srgb, #dc2626 6%, var(--card))') : 'var(--card)', borderRight: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-2.5">
                      <Avatar user={s} size={30} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{s.name}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{s.email}</p>
                      </div>
                    </div>
                  </td>
                  {topicGroups.flatMap(g => g.items).map(({ kind, item }) => {
                    const g = gradeFor(s.id, kind, item.id)
                    const failed = g != null && g < PASS_THRESHOLD
                    const record = failed ? retryRecordFor(s.id, kind, item.id) : null
                    const cellColor = g == null ? 'var(--muted-foreground)' : failed ? '#dc2626' : '#16a34a'
                    return (
                      <td key={item.id} className="px-3 py-2.5 text-sm whitespace-nowrap" style={{ borderLeft: '1px solid var(--border)' }}>
                        {g != null ? (
                          <span className="inline-flex items-center gap-1 font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: `${cellColor}1a`, color: cellColor }}>
                            {g.toFixed(1)} {failed ? '✗' : '✓'}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--muted-foreground)' }}>—</span>
                        )}
                        {failed && record && !record.retryAllowed && (
                          <button onClick={() => handleAllowRetry(kind, record)} title="Permitir que reintente"
                            className="ml-1.5 text-xs font-bold" style={{ color: '#005187' }}>
                            🔓
                          </button>
                        )}
                        {failed && record?.retryAllowed && (
                          <span className="ml-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }} title="Ya puede reintentar">🔓✓</span>
                        )}
                      </td>
                    )
                  })}
                  <td className="px-4 py-2.5" style={{ borderLeft: '1px solid var(--border)', backgroundColor: wg.allGraded ? (wg.passed ? 'color-mix(in srgb, #16a34a 8%, var(--card))' : 'color-mix(in srgb, #dc2626 8%, var(--card))') : 'transparent' }}>
                    <p className="text-base font-black" style={{ color: 'var(--foreground)' }}>
                      {wg.average != null ? wg.average.toFixed(1) : '—'}
                    </p>
                    {wg.allGraded && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: wg.passed ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)', color: wg.passed ? '#16a34a' : '#dc2626' }}>
                        {wg.passed ? '✓ Aprobado' : '✗ Reprobado'}
                      </span>
                    )}
                  </td>
                </tr>
                )
              })}
              {pageRows.length === 0 && (
                <tr><td colSpan={allItems.length + 2} className="text-center py-6 text-sm" style={{ color: 'var(--muted-foreground)' }}>Sin estudiantes para este filtro.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

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
