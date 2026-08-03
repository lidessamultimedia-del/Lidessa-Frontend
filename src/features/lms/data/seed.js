// Datos iniciales del LMS. Se cargan una sola vez si no hay nada en localStorage.
// IDs de docentes/estudiantes coinciden con los usuarios demo de AuthContext
// (profesor@lidessa.co -> 't1', estudiante@lidessa.co -> 's1') para que el
// login de cada rol vea datos ya poblados desde el primer render.

export const seedDirectory = [
  { id: 't1', name: 'Carlos Rodríguez', email: 'profesor@lidessa.co', role: 'profesor', active: true, joined: '2025-02-10' },
  { id: 't2', name: 'María Fernanda Ospina', email: 'maria.ospina@lidessa.co', role: 'profesor', active: true, joined: '2025-03-04' },
  { id: 's1', name: 'Juan Pérez', email: 'estudiante@lidessa.co', role: 'estudiante', active: true, joined: '2025-05-12' },
  { id: 's2', name: 'Ana Martínez', email: 'ana.martinez@correo.co', role: 'estudiante', active: true, joined: '2025-05-18' },
  { id: 's3', name: 'Pedro Gómez', email: 'pedro.gomez@correo.co', role: 'estudiante', active: true, joined: '2025-06-01' },
  { id: 's4', name: 'Laura Sánchez', email: 'laura.sanchez@correo.co', role: 'estudiante', active: false, joined: '2025-06-15' },
]

export const seedCourses = [
  {
    id: 'c1', name: 'Liderazgo con Sentido y Propósito', shortName: 'LIDER-001',
    description: 'Desarrolla habilidades de liderazgo humano y estratégico.', category: 'Liderazgo',
    teacherId: 't1', studentIds: ['s1', 's2', 's3'], createdAt: '2025-05-01',
    published: true, visible: true, startDate: '2026-05-01', endDate: '2026-09-30',
    format: 'topics', completionTrackingEnabled: true,
    requiresPassword: false, password: '', selfEnrollment: true, guestAccess: false,
    capacity: 150, color: '#005187',
  },
  {
    id: 'c2', name: 'Formación para Formadores', shortName: 'FORMA-002',
    description: 'Metodologías activas para el diseño de procesos formativos.', category: 'Formación',
    teacherId: 't1', studentIds: ['s1', 's4'], createdAt: '2025-05-10',
    published: true, visible: true, startDate: '2026-05-10', endDate: '2026-08-31',
    format: 'topics', completionTrackingEnabled: true,
    requiresPassword: false, password: '', selfEnrollment: false, guestAccess: false,
    capacity: 100, color: '#7c3aed',
  },
  {
    id: 'c3', name: 'SG-SST Básico 50 Horas', shortName: 'SST-003',
    description: 'Fundamentos del Sistema de Gestión de Seguridad y Salud en el Trabajo.', category: 'SST',
    teacherId: 't2', studentIds: ['s2', 's3', 's4'], createdAt: '2025-05-20',
    published: false, visible: true, startDate: '2026-06-01', endDate: '2026-10-15',
    format: 'weekly', completionTrackingEnabled: false,
    requiresPassword: false, password: '', selfEnrollment: true, guestAccess: true,
    capacity: 200, color: '#d97706',
  },
]

export const seedTopics = [
  { id: 't1_1', courseId: 'c1', title: 'Fundamentos y Comunicación', order: 1 },
  { id: 't1_2', courseId: 'c1', title: 'Toma de Decisiones', order: 2 },
  { id: 't1_3', courseId: 'c1', title: 'Resolución de Conflictos', order: 3 },

  { id: 't2_1', courseId: 'c2', title: 'Diseño de Contenidos', order: 1 },
  { id: 't2_2', courseId: 'c2', title: 'Metodologías y Evaluación', order: 2 },

  { id: 't3_1', courseId: 'c3', title: 'Marco Legal', order: 1 },
  { id: 't3_2', courseId: 'c3', title: 'Identificación de Peligros y Emergencias', order: 2 },
]

export const seedLessons = [
  { id: 'l1', courseId: 'c1', topicId: 't1_1', title: 'Fundamentos del Liderazgo', content: 'Qué es liderar con propósito, estilos de liderazgo y autoconocimiento.', order: 1 },
  { id: 'l2', courseId: 'c1', topicId: 't1_1', title: 'Comunicación Efectiva', content: 'Escucha activa, retroalimentación y comunicación asertiva en equipos.', order: 2 },
  { id: 'l3', courseId: 'c1', topicId: 't1_2', title: 'Toma de Decisiones', content: 'Modelos de decisión bajo incertidumbre y pensamiento crítico.', order: 3 },
  { id: 'l4', courseId: 'c1', topicId: 't1_3', title: 'Resolución de Conflictos', content: 'Negociación, mediación y manejo de conversaciones difíciles.', order: 4 },

  { id: 'l5', courseId: 'c2', topicId: 't2_1', title: 'Diseño de Contenidos Formativos', content: 'Cómo estructurar un contenido pedagógico efectivo.', order: 1 },
  { id: 'l6', courseId: 'c2', topicId: 't2_2', title: 'Metodologías Activas de Enseñanza', content: 'Aprendizaje basado en problemas, gamificación y estudio de caso.', order: 2 },
  { id: 'l7', courseId: 'c2', topicId: 't2_2', title: 'Evaluación del Aprendizaje', content: 'Diseño de rúbricas e instrumentos de evaluación.', order: 3 },

  { id: 'l8', courseId: 'c3', topicId: 't3_1', title: 'Marco Legal SG-SST', content: 'Normatividad vigente y responsabilidades del empleador.', order: 1 },
  { id: 'l9', courseId: 'c3', topicId: 't3_2', title: 'Identificación de Peligros', content: 'Matriz de riesgos y valoración de peligros laborales.', order: 2 },
  { id: 'l10', courseId: 'c3', topicId: 't3_2', title: 'Plan de Emergencias', content: 'Elaboración de planes de prevención, preparación y respuesta.', order: 3 },
]

export const seedAssignments = [
  { id: 'a1', courseId: 'c1', topicId: 't1_1', title: 'Ensayo sobre Liderazgo', description: 'Escribe un ensayo de 2-3 páginas sobre los elementos clave del liderazgo.', dueDate: '2026-08-02', maxScore: 100 },
  { id: 'a2', courseId: 'c1', topicId: 't1_2', title: 'Caso Práctico', description: 'Analiza el caso de estudio entregado y propone un plan de acción.', dueDate: '2026-08-06', maxScore: 100 },
  { id: 'a3', courseId: 'c1', topicId: 't1_3', title: 'Proyecto Final', description: 'Proyecto integrador del curso de liderazgo.', dueDate: '2026-08-20', maxScore: 100 },

  { id: 'a4', courseId: 'c2', topicId: 't2_1', title: 'Diseño de una Sesión Formativa', description: 'Diseña una sesión de 1 hora usando una metodología activa.', dueDate: '2026-08-05', maxScore: 100 },
  { id: 'a5', courseId: 'c2', topicId: 't2_2', title: 'Rúbrica de Evaluación', description: 'Construye una rúbrica para evaluar la sesión diseñada.', dueDate: '2026-08-12', maxScore: 100 },

  { id: 'a6', courseId: 'c3', topicId: 't3_1', title: 'Quiz Marco Legal', description: 'Cuestionario sobre la normatividad SG-SST vista en clase.', dueDate: '2026-08-04', maxScore: 100 },
  { id: 'a7', courseId: 'c3', topicId: 't3_2', title: 'Plan de Emergencias', description: 'Elabora un plan de emergencias para un lugar de trabajo real o hipotético.', dueDate: '2026-08-18', maxScore: 100 },
]

export const seedSubmissions = [
  { id: 'sub1', assignmentId: 'a1', studentId: 's1', submittedAt: '2026-07-28T14:30:00', fileName: 'ensayo_juan.pdf', fileSize: 245000, textResponse: '', notes: '', status: 'graded', grade: 90, feedback: 'Excelente trabajo, muy bien estructurado y con ejemplos claros.', gradedAt: '2026-07-29T09:15:00' },
  { id: 'sub2', assignmentId: 'a2', studentId: 's1', submittedAt: '2026-07-29T10:00:00', fileName: 'caso_practico_juan.pdf', fileSize: 180000, textResponse: '', notes: '', status: 'submitted', grade: null, feedback: '', gradedAt: null },
  { id: 'sub3', assignmentId: 'a1', studentId: 's2', submittedAt: '2026-07-27T16:45:00', fileName: 'ensayo_ana.docx', fileSize: 90000, textResponse: '', notes: '', status: 'graded', grade: 85, feedback: 'Buen desarrollo, refuerza la conclusión.', gradedAt: '2026-07-28T08:00:00' },
  { id: 'sub4', assignmentId: 'a4', studentId: 's1', submittedAt: '2026-07-29T18:20:00', fileName: '', fileSize: 0, textResponse: 'La sesión formativa propuesta utiliza aprendizaje basado en problemas...', notes: '', status: 'submitted', grade: null, feedback: '', gradedAt: null },
]

export const seedQuizzes = [
  {
    id: 'q1', courseId: 'c3', topicId: 't3_1', title: 'Cuestionario: Marco Legal SG-SST',
    description: 'Evalúa los conceptos clave de la normatividad vista en el módulo.',
    dueDate: '2026-08-10',
    questions: [
      { id: 'q1_1', text: '¿Qué entidad regula el Sistema de Gestión de SST en Colombia?', options: ['Ministerio de Trabajo', 'Ministerio de Educación', 'DIAN', 'Cámara de Comercio'], correctIndex: 0 },
      { id: 'q1_2', text: '¿Cuándo se debe actualizar la matriz de riesgos?', options: ['Cada 5 años sin excepción', 'Solo al crear la empresa', 'Cuando cambian las condiciones de trabajo', 'Nunca es necesario'], correctIndex: 2 },
      { id: 'q1_3', text: '¿Quién es responsable de implementar el SG-SST en una empresa?', options: ['Solo los trabajadores', 'El empleador', 'El Ministerio de Trabajo', 'Una ARL externa únicamente'], correctIndex: 1 },
    ],
  },
]

export const seedQuizAttempts = [
  { id: 'qa1', quizId: 'q1', studentId: 's2', answers: [0, 2, 1], score: 100, submittedAt: '2026-07-30T11:00:00' },
]

export const seedLessonProgress = [
  { studentId: 's1', courseId: 'c1', lessonId: 'l1', completedAt: '2026-07-20T12:00:00' },
  { studentId: 's1', courseId: 'c1', lessonId: 'l2', completedAt: '2026-07-22T12:00:00' },
  { studentId: 's1', courseId: 'c1', lessonId: 'l3', completedAt: '2026-07-25T12:00:00' },
  { studentId: 's1', courseId: 'c2', lessonId: 'l5', completedAt: '2026-07-21T12:00:00' },
  { studentId: 's2', courseId: 'c1', lessonId: 'l1', completedAt: '2026-07-19T12:00:00' },
]
