import { useState } from 'react'
import { MAX_GRADE, PASS_THRESHOLD } from '../context/LMSContext'
import FormField, { errorInputStyle } from '@/shared/components/FormField'
import { Paperclip } from '@/shared/components/Icons'

// Calificar una tarea entregada y revisar un examen con preguntas de
// respuesta abierta — usados tanto por el profesor como por el admin
// (ninguno de los dos tiene lógica de permisos adentro; el llamador decide
// a dónde volver con onCancel/onSave).
export function GradeSubmissionForm({ submission, assignment, course, studentName, onSave, onCancel }) {
  const [grade, setGrade] = useState(submission.grade ?? '')
  const [feedback, setFeedback] = useState(submission.feedback ?? '')
  const [retryAllowed, setRetryAllowed] = useState(submission.retryAllowed ?? false)
  const [gradeError, setGradeError] = useState('')
  const maxScore = assignment?.maxScore ?? MAX_GRADE

  return (
    <div style={{ animation: 'fadeUp 0.4s ease', maxWidth: 640 }}>
      <button onClick={onCancel} className="text-xs font-semibold mb-3" style={{ color: 'var(--accent)' }}>← Volver</button>
      <h2 className="text-xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
        Calificar: {studentName} — {assignment?.title}
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>{course?.name}</p>

      <div className="rounded-xl p-5 mb-5" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>Lo que entregó el estudiante</p>
        {submission.fileName && (
          <div className="mb-3">
            {submission.fileData ? (
              <a href={submission.fileData} download={submission.fileName}
                className="flex items-start gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors max-w-full"
                style={{ backgroundColor: 'rgba(0,81,135,0.1)', color: 'var(--accent)', border: '1px solid rgba(0,81,135,0.2)' }}>
                <Paperclip size={14} className="shrink-0 mt-0.5" />
                <span className="wrap-break-word">
                  {submission.fileName}{' '}
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>({(submission.fileSize / 1024).toFixed(0)} KB) — descargar</span>
                </span>
              </a>
            ) : (
              <p className="text-sm wrap-break-word" style={{ color: 'var(--foreground)' }}>Archivo: <strong>{submission.fileName}</strong> <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>(entrega antigua, sin archivo descargable)</span></p>
            )}
          </div>
        )}
        {submission.textResponse && (
          <div className="mb-3">
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Respuesta escrita</p>
            <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>{submission.textResponse}</p>
          </div>
        )}
        {submission.notes && (
          <div className="mb-3">
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Observaciones del estudiante</p>
            <p className="text-sm" style={{ color: 'var(--foreground)' }}>{submission.notes}</p>
          </div>
        )}
        {!submission.fileName && !submission.textResponse && (
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>El estudiante no adjuntó archivo ni escribió una respuesta.</p>
        )}
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Enviado: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString('es-CO') : '—'}</p>
      </div>

      <form onSubmit={e => {
        e.preventDefault()
        if (grade === '' || grade === null) { setGradeError('Ingrese una calificación.'); return }
        const num = Math.round(Number(grade) * 10) / 10
        if (Number.isNaN(num) || num < 0 || num > maxScore) { setGradeError(`Debe estar entre 0 y ${maxScore}.`); return }
        setGradeError('')
        onSave(num, feedback, retryAllowed)
      }} className="space-y-4" noValidate>
        <FormField label={`Calificación (sobre ${maxScore})`} required error={gradeError}
          helperText={`Admite decimales, ej. 7.9. Se aprueba con ${PASS_THRESHOLD.toFixed(1)} o más.`}>
          <input type="number" min={0} max={maxScore} step={0.1} value={grade}
            onChange={e => { setGrade(e.target.value); setGradeError('') }}
            className="w-40 px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!gradeError) }} />
        </FormField>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Feedback</label>
          <textarea rows={5} value={feedback} onChange={e => setFeedback(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
            style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
        </div>
        <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground)' }}>
          <input type="checkbox" checked={retryAllowed} onChange={e => setRetryAllowed(e.target.checked)} />
          Permitir que el estudiante reintente esta actividad
        </label>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>Cancelar</button>
          <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#005187' }}>Guardar</button>
        </div>
      </form>
    </div>
  )
}

export function ReviewQuizAttemptForm({ attempt, quiz, course, studentName, onSave, onCancel }) {
  const [score, setScore] = useState(attempt.score ?? '')
  const [feedback, setFeedback] = useState(attempt.feedback ?? '')
  const [retryAllowed, setRetryAllowed] = useState(attempt.retryAllowed ?? false)
  const [gradeError, setGradeError] = useState('')

  return (
    <div style={{ animation: 'fadeUp 0.4s ease', maxWidth: 640 }}>
      <button onClick={onCancel} className="text-xs font-semibold mb-3" style={{ color: 'var(--accent)' }}>← Volver</button>
      <h2 className="text-xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
        Revisar examen: {studentName} — {quiz.title}
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>{course?.name}</p>

      <div className="rounded-xl p-5 mb-5" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>Respuestas del estudiante</p>
        {quiz.questions.map((q, qi) => (
          <div key={q.id} className="mb-3 pb-3" style={{ borderBottom: qi < quiz.questions.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{qi + 1}. {q.text}</p>
            {q.type === 'open' ? (
              <p className="text-sm whitespace-pre-wrap px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}>
                {attempt.answers[qi]?.trim() ? attempt.answers[qi] : '(sin respuesta)'}
              </p>
            ) : (
              <p className="text-xs" style={{ color: attempt.answers[qi] === q.correctIndex ? '#16a34a' : '#dc2626' }}>
                Respondió: {q.options[attempt.answers[qi]] ?? '(sin responder)'}
                {attempt.answers[qi] === q.correctIndex ? ' ✓' : ` — correcta: ${q.options[q.correctIndex]}`}
              </p>
            )}
          </div>
        ))}
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Nota automática de la parte de selección múltiple: {attempt.score}/{MAX_GRADE}. Ajusta la nota final abajo teniendo en cuenta las respuestas abiertas.
        </p>
      </div>

      <form onSubmit={e => {
        e.preventDefault()
        if (score === '' || score === null) { setGradeError('Ingrese una calificación final.'); return }
        const num = Math.round(Number(score) * 10) / 10
        if (Number.isNaN(num) || num < 0 || num > MAX_GRADE) { setGradeError(`Debe estar entre 0 y ${MAX_GRADE}.`); return }
        setGradeError('')
        onSave(num, feedback, retryAllowed)
      }} className="space-y-4" noValidate>
        <FormField label={`Calificación final (sobre ${MAX_GRADE})`} required error={gradeError}
          helperText={`Admite decimales, ej. 7.9. Se aprueba con ${PASS_THRESHOLD.toFixed(1)} o más.`}>
          <input type="number" min={0} max={MAX_GRADE} step={0.1} value={score}
            onChange={e => { setScore(e.target.value); setGradeError('') }}
            className="w-40 px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', ...errorInputStyle(!!gradeError) }} />
        </FormField>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>Feedback</label>
          <textarea rows={4} value={feedback} onChange={e => setFeedback(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
            style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
        </div>
        <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground)' }}>
          <input type="checkbox" checked={retryAllowed} onChange={e => setRetryAllowed(e.target.checked)} />
          Permitir que el estudiante reintente este examen
        </label>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-sm font-bold" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>Cancelar</button>
          <button type="submit" className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: '#005187' }}>Guardar calificación</button>
        </div>
      </form>
    </div>
  )
}
