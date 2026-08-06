import { BookOpen, FileText, HelpCircle, Paperclip, Plus, Edit2, Trash, Check, X } from '@/shared/components/Icons'
import { ASSIGNMENT_WEIGHT, QUIZ_WEIGHT } from '../context/LMSContext'

export default function CourseContentTab({
  course, lms, onAddTopic, onEditTopic, onDeleteTopic,
  onAddLesson, onEditLesson, onDeleteLesson, onPublishLesson,
  onAddAssignment, onEditAssignment, onDeleteAssignment, onPublishAssignment,
  onAddQuiz, onEditQuiz, onDeleteQuiz, onPublishQuiz,
}) {
  const topics = lms.topicsByCourse(course.id)
  const untitled = lms.itemsByTopic(null)
  const weekly = course.format === 'weekly'

  // El profesor puede agregar todas las actividades/exámenes que quiera — el
  // peso de cada uno en la nota final se reparte solo entre lo que ya publicó,
  // así que siempre suma 100% sin importar cuántos items haya.
  const assignmentsCount = lms.assignmentsByCourse(course.id).filter(lms.isPublished).length
  const quizzesCount = lms.quizzesByCourse(course.id).filter(lms.isPublished).length
  const totalWeight = assignmentsCount * ASSIGNMENT_WEIGHT + quizzesCount * QUIZ_WEIGHT
  const assignmentPct = totalWeight ? Math.round((ASSIGNMENT_WEIGHT / totalWeight) * 1000) / 10 : 0
  const quizPct = totalWeight ? Math.round((QUIZ_WEIGHT / totalWeight) * 1000) / 10 : 0

  const sharedProps = {
    weekly, lms,
    onAddLesson, onEditLesson, onDeleteLesson, onPublishLesson,
    onAddAssignment, onEditAssignment, onDeleteAssignment, onPublishAssignment, assignmentPct,
    onAddQuiz, onEditQuiz, onDeleteQuiz, onPublishQuiz, quizPct,
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(124,58,237,0.12)', color: '#7c3aed' }}>
            Cada actividad publicada vale {assignmentPct}% de la nota
          </span>
          <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(217,119,6,0.12)', color: '#d97706' }}>
            Cada examen publicado vale {quizPct}% de la nota
          </span>
        </div>
        <button onClick={onAddTopic}
          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5" style={{ backgroundColor: '#005187' }}>
          <Plus size={13} /> {weekly ? 'Añadir semana' : 'Añadir tema'}
        </button>
      </div>
      <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
        Puedes agregar todo el material, las actividades y los exámenes que necesites. El peso de cada uno se reparte solo entre
        lo publicado y siempre suma 100% — cada examen vale el doble que cada actividad. En cada uno se aprueba con 8.0 a 10.
      </p>

      {topics.map((topic, ti) => (
        <TopicBlock key={topic.id} topic={topic} index={ti + 1} {...sharedProps}
          onEdit={() => onEditTopic(topic)} onDelete={() => onDeleteTopic(topic)}
          onAddLesson={() => onAddLesson(topic.id)} onAddAssignment={() => onAddAssignment(topic.id)} onAddQuiz={() => onAddQuiz(topic.id)}
        />
      ))}

      {untitled.length > 0 && (
        <TopicBlock topic={{ title: 'Sin tema' }} {...sharedProps} plain items={untitled}
          onEdit={null} onDelete={null}
          onAddLesson={() => onAddLesson(null)} onAddAssignment={() => onAddAssignment(null)} onAddQuiz={() => onAddQuiz(null)}
        />
      )}

      {topics.length === 0 && untitled.length === 0 && (
        <p className="text-sm px-4 py-6 text-center rounded-xl" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
          Crea tu primer {weekly ? 'semana' : 'tema'} para empezar a agregar lecciones, tareas y exámenes.
        </p>
      )}
    </div>
  )
}

const KIND_ICON = { lesson: BookOpen, assignment: FileText, quiz: HelpCircle }
const KIND_COLOR = { lesson: '#005187', assignment: '#7c3aed', quiz: '#d97706' }

function TopicBlock({
  topic, index, weekly, lms, plain, items, onEdit, onDelete,
  onAddLesson, onAddAssignment, onAddQuiz,
  onEditLesson, onDeleteLesson, onPublishLesson,
  onEditAssignment, onDeleteAssignment, onPublishAssignment, assignmentPct,
  onEditQuiz, onDeleteQuiz, onPublishQuiz, quizPct,
}) {
  const rows = plain ? items : lms.itemsByTopic(topic.id)
  const lessons = rows.filter(r => r.kind === 'lesson')
  const assignments = rows.filter(r => r.kind === 'assignment')
  const quizzes = rows.filter(r => r.kind === 'quiz')

  return (
    <div className="mb-7">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          {plain ? topic.title : `${weekly ? 'Semana' : 'Tema'} ${index}: ${topic.title}`}
        </h4>
        {!plain && (
          <div className="flex gap-2">
            <button onClick={onEdit} title="Editar" className="p-1 rounded flex items-center justify-center" style={{ color: 'var(--muted-foreground)' }}><Edit2 size={13} /></button>
            <button onClick={onDelete} title="Eliminar" className="p-1 rounded flex items-center justify-center" style={{ color: '#dc2626' }}><Trash size={13} /></button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <KindSection kind="lesson" label="Material de apoyo" addLabel="Agregar material" emptyText="Sin material de apoyo todavía."
          rows={lessons} lms={lms} onAdd={onAddLesson} onEdit={onEditLesson} onDelete={onDeleteLesson} onPublish={onPublishLesson} />
        <KindSection kind="assignment" label="Tareas" addLabel="Agregar tarea" emptyText="Sin tareas todavía." weightPct={assignmentPct}
          rows={assignments} lms={lms} onAdd={onAddAssignment} onEdit={onEditAssignment} onDelete={onDeleteAssignment} onPublish={onPublishAssignment} />
        <KindSection kind="quiz" label="Exámenes" addLabel="Agregar examen" emptyText="Sin exámenes todavía." weightPct={quizPct}
          rows={quizzes} lms={lms} onAdd={onAddQuiz} onEdit={onEditQuiz} onDelete={onDeleteQuiz} onPublish={onPublishQuiz} />
      </div>
    </div>
  )
}

function StatusBadge({ item, lms, color }) {
  if (!item.publishAt) {
    return <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>Borrador</span>
  }
  if (lms.isPublished(item)) {
    return <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(22,163,74,0.12)', color: '#16a34a' }}>✓ Publicado {new Date(item.publishAt).toLocaleDateString('es-CO')}</span>
  }
  return <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${color}1a`, color }}>Programado: {new Date(item.publishAt).toLocaleDateString('es-CO')}</span>
}

function KindSection({ kind, label, addLabel, emptyText, rows, lms, onAdd, onEdit, onDelete, onPublish, weightPct }) {
  const Icon = KIND_ICON[kind]
  const color = KIND_COLOR[kind]
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span style={{ color }}><Icon size={13} /></span>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
          <span className="text-xs font-semibold rounded-full px-1.5" style={{ backgroundColor: `${color}1a`, color }}>{rows.length}</span>
        </div>
        <button onClick={onAdd} className="text-xs font-bold flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color }}>
          <Plus size={11} /> {addLabel}
        </button>
      </div>
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', borderLeft: `3px solid ${color}` }}>
        {rows.map(({ item }, i) => (
          <div key={item.id} style={{ display: 'flex', gap: 12, padding: '10px 14px', alignItems: 'center', borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--card)' }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{item.title}</p>
                <StatusBadge item={item} lms={lms} color={color} />
                {kind !== 'lesson' && lms.isPublished(item) && weightPct > 0 && (
                  <span className="text-xs font-semibold" style={{ color }}>vale {weightPct}%</span>
                )}
              </div>
              {kind === 'lesson' && (
                <div>
                  <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)', maxWidth: 480 }}>{item.content}</p>
                  {item.fileName && (
                    <p className="text-xs flex items-start gap-1 mt-0.5" style={{ color }}>
                      <Paperclip size={11} className="shrink-0 mt-0.5" /> <span className="wrap-break-word">{item.fileName}</span>
                    </p>
                  )}
                </div>
              )}
              {kind === 'assignment' && (
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Vence: {new Date(item.dueDate).toLocaleDateString('es-CO')} · {lms.submissions.filter(s => s.assignmentId === item.id).length} entregas · /{item.maxScore} pts
                </p>
              )}
              {kind === 'quiz' && (
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Vence: {new Date(item.dueDate).toLocaleDateString('es-CO')} · {item.questions?.length ?? 0} preguntas · {lms.quizAttempts.filter(a => a.quizId === item.id).length} presentados
                </p>
              )}
            </div>
            {item.publishAt ? (
              <button onClick={() => onPublish(item)} title="Cancelar publicación"
                className="text-xs px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 shrink-0" style={{ border: '1px solid rgba(217,119,6,0.35)', color: '#d97706' }}>
                <X size={12} /> Cancelar publicación
              </button>
            ) : (
              <button onClick={() => onPublish(item)} title="Publicar ahora"
                className="text-xs px-2.5 py-1.5 rounded-lg font-bold text-white flex items-center gap-1 shrink-0" style={{ backgroundColor: '#16a34a' }}>
                <Check size={12} /> Publicar
              </button>
            )}
            <button onClick={() => onEdit(item)} title="Editar"
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
              <Edit2 size={13} />
            </button>
            <button onClick={() => onDelete(item)} title="Eliminar"
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626' }}>
              <Trash size={13} />
            </button>
          </div>
        ))}
        {rows.length === 0 && <p className="text-xs px-4 py-3 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}>{emptyText}</p>}
      </div>
    </div>
  )
}
