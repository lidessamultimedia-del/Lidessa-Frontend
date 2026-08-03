import { BookOpen, FileText, HelpCircle, Paperclip, Plus, Edit2, Trash } from '@/shared/components/Icons'

export default function CourseContentTab({
  course, lms, onAddTopic, onEditTopic, onDeleteTopic,
  onAddLesson, onEditLesson, onDeleteLesson,
  onAddAssignment, onEditAssignment, onDeleteAssignment,
  onAddQuiz, onEditQuiz, onDeleteQuiz,
}) {
  const topics = lms.topicsByCourse(course.id)
  const untitled = lms.itemsByTopic(null)
  const weekly = course.format === 'weekly'

  const sharedProps = {
    weekly, lms,
    onAddLesson, onEditLesson, onDeleteLesson,
    onAddAssignment, onEditAssignment, onDeleteAssignment,
    onAddQuiz, onEditQuiz, onDeleteQuiz,
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={onAddTopic}
          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5" style={{ backgroundColor: '#005187' }}>
          <Plus size={13} /> {weekly ? 'Añadir semana' : 'Añadir tema'}
        </button>
      </div>

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

function TopicBlock({ topic, index, weekly, lms, plain, items, onEdit, onDelete, onAddLesson, onAddAssignment, onAddQuiz, onEditLesson, onDeleteLesson, onEditAssignment, onDeleteAssignment, onEditQuiz, onDeleteQuiz }) {
  const rows = plain ? items : lms.itemsByTopic(topic.id)

  function editHandler(kind) {
    return kind === 'lesson' ? onEditLesson : kind === 'assignment' ? onEditAssignment : onEditQuiz
  }
  function deleteHandler(kind) {
    return kind === 'lesson' ? onDeleteLesson : kind === 'assignment' ? onDeleteAssignment : onDeleteQuiz
  }

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
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
      <div className="rounded-xl overflow-hidden mb-2" style={{ border: '1px solid var(--border)' }}>
        {rows.map(({ kind, item }, i) => {
          const Icon = KIND_ICON[kind]
          return (
            <div key={item.id} style={{ display: 'flex', gap: 12, padding: '12px 16px', alignItems: 'center', borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--card)' }}>
              <span style={{ color: KIND_COLOR[kind] }}>
                <Icon size={16} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{item.title}</p>
                {kind === 'lesson' && (
                  <div>
                    <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)', maxWidth: 480 }}>{item.content}</p>
                    {item.fileName && (
                      <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#005187' }}>
                        <Paperclip size={11} /> {item.fileName}
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
              <button onClick={() => editHandler(kind)(item)} title="Editar"
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                <Edit2 size={13} />
              </button>
              <button onClick={() => deleteHandler(kind)(item)} title="Eliminar"
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626' }}>
                <Trash size={13} />
              </button>
            </div>
          )
        })}
        {rows.length === 0 && <p className="text-sm px-4 py-4 text-center" style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}>Sin contenido en este {weekly ? 'semana' : 'tema'} todavía.</p>}
      </div>
      <div className="flex gap-2">
        <button onClick={onAddLesson} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>+ Lección</button>
        <button onClick={onAddAssignment} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>+ Tarea</button>
        <button onClick={onAddQuiz} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}>+ Examen</button>
      </div>
    </div>
  )
}
