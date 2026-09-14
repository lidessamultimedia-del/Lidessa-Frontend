// Datos iniciales del LMS. Se cargan en memoria al arrancar la app.
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
    listed: false, image: '', duration: '', modality: '', certified: false,
  },
  {
    id: 'c2', name: 'Formación para Formadores', shortName: 'FORMA-002',
    description: 'Metodologías activas para el diseño de procesos formativos.', category: 'Formación',
    teacherId: 't1', studentIds: ['s1', 's4'], createdAt: '2025-05-10',
    published: true, visible: true, startDate: '2026-05-10', endDate: '2026-08-31',
    format: 'topics', completionTrackingEnabled: true,
    requiresPassword: false, password: '', selfEnrollment: false, guestAccess: false,
    capacity: 100, color: '#7c3aed',
    listed: true, image: '/assets/fundadores.png', duration: '40 horas', modality: 'Virtual', certified: false,
  },
  {
    id: 'c3', name: 'SG-SST Básico 50 Horas', shortName: 'SST-003',
    description: 'Fundamentos del Sistema de Gestión de Seguridad y Salud en el Trabajo.', category: 'SST',
    teacherId: 't2', studentIds: ['s2', 's3', 's4'], createdAt: '2025-05-20',
    published: false, visible: true, startDate: '2026-06-01', endDate: '2026-10-15',
    format: 'weekly', completionTrackingEnabled: false,
    requiresPassword: false, password: '', selfEnrollment: true, guestAccess: true,
    capacity: 200, color: '#d97706',
    listed: false, image: '', duration: '', modality: '', certified: false,
  },
  // ── Cursos publicados desde CEET (catálogo público) — sin profesor asignado
  // todavía; el profesor los completa con contenido real en Cursos (LMS). ──
  {
    id: 'c4', name: 'Auditoría interna HSEQ', shortName: '',
    description: 'Aprenda a evaluar y mejorar la gestión, el control y la eficiencia en su organización con nuestro curso especializado, y mejore la toma de decisiones para un crecimiento sostenible.',
    category: 'Gestión',
    teacherId: null, studentIds: [], createdAt: '2025-04-01',
    published: false, visible: true, startDate: '', endDate: '',
    format: 'topics', completionTrackingEnabled: true,
    requiresPassword: false, password: '', selfEnrollment: true, guestAccess: false,
    capacity: 100, color: '#005187',
    listed: true, image: '/assets/Auditoria.png', duration: '40 horas', modality: 'Virtual', certified: true,
    intro: '¿Le gustaría convertirse en un auditor interno experto? Este curso le brinda las competencias necesarias para evaluar y mejorar sistemas de gestión HSEQ. Descubra cómo aplicar las Normas ISO y realizar auditorías que impulsen el crecimiento sostenible de su organización. A lo largo del curso, descubrirá cómo interpretar y aplicar las Normas ISO más relevantes para asegurar el cumplimiento normativo y la eficiencia operativa. Aprenderá a leer y analizar normas técnicas colombianas y sectoriales, y se sumergirá en las reglas que todo auditor interno debe dominar para realizar evaluaciones efectivas y confiables. Todo esto mientras fortalece sus habilidades para identificar áreas de mejora y proponer soluciones estratégicas.',
    objectives: [
      'Dominar los fundamentos de las Normas ISO (9001, 14001, 45001).',
      'Desarrollar habilidades prácticas en auditoría interna.',
      'Comprender las Normas Técnicas Colombianas y Sectoriales.',
      'Aplicar las reglas del auditor interno de manera ética y profesional.',
      'Promover el crecimiento organizacional mediante procesos optimizados.',
    ],
    modules: [
      'Introducción a la Auditoría Interna',
      'Módulo 1 - Normas ISO 9000 y 9001 (2015)',
      'Módulo 2 - Auditoría Interna',
      'Módulo 3 - Auditorías a las Normas ISO',
      'Módulo 4 - Normas Auditor Interno',
    ],
  },
  {
    id: 'c5', name: 'Inducción y re-inducción a los SG-SST', shortName: '',
    description: 'Aprenda a implementar y fortalecer el Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST) en su organización con este curso especializado. Mejore la seguridad, el bienestar y el cumplimiento normativo mediante estrategias prácticas y efectivas.',
    category: 'Normativa',
    teacherId: null, studentIds: [], createdAt: '2025-04-05',
    published: false, visible: true, startDate: '', endDate: '',
    format: 'topics', completionTrackingEnabled: true,
    requiresPassword: false, password: '', selfEnrollment: true, guestAccess: false,
    capacity: 100, color: '#d97706',
    listed: true, image: '/assets/sst.png', duration: '40 horas', modality: 'Virtual', certified: true,
    intro: '¿Le interesa optimizar la seguridad y salud de su equipo de trabajo? Este curso está diseñado para brindarle las herramientas necesarias para realizar procesos efectivos de inducción y reinducción en el marco del SG-SST. Con un enfoque práctico y basado en normativas vigentes, aprenderá a identificar peligros, gestionar riesgos y fomentar una cultura de prevención en su organización. También desarrollará competencias clave para promover el bienestar físico y mental de los trabajadores, alineando las políticas y responsabilidades del SG-SST con las mejores prácticas internacionales.',
    objectives: [
      'Entender los fundamentos del SG-SST y sus principios fundamentales.',
      'Diferenciar entre los procesos de inducción y reinducción, adaptándolos a las necesidades de la organización.',
      'Interpretar y aplicar el marco legal y normativo en materia de SST.',
      'Establecer políticas de seguridad y roles claros dentro del SG-SST.',
      'Implementar métodos efectivos de identificación de peligros y gestión de riesgos.',
      'Diseñar y gestionar planes de emergencia y programas de promoción de la salud.',
      'Fomentar la mejora continua mediante la capacitación y el análisis de incidentes.',
    ],
    modules: [
      'Módulo 1: Fundamentos del SG-SST',
      'Módulo 2: Política y Responsabilidades en el SG-SST',
      'Módulo 3: Identificación de Peligros y Gestión de Riesgos',
      'Módulo 4: Planificación de Emergencias y Promoción de la Salud',
      'Módulo 5: Capacitación, Monitoreo y Mejora Continua',
    ],
  },
  {
    id: 'c6', name: 'Formación para formadores (CEET)', shortName: '',
    description: 'Conviértase en un formador experto con nuestro curso especializado de Formación para formadores. Aprenda a diseñar estrategias de enseñanza efectivas, desarrollar competencias y explorar metodologías innovadoras para la educación de adultos, integrando herramientas disruptivas y tecnológicas en sus procesos de formación.',
    category: 'Habilidades blandas',
    teacherId: null, studentIds: [], createdAt: '2025-04-10',
    published: false, visible: true, startDate: '', endDate: '',
    format: 'topics', completionTrackingEnabled: true,
    requiresPassword: false, password: '', selfEnrollment: true, guestAccess: false,
    capacity: 100, color: '#7c3aed',
    listed: true, image: '/assets/fundadores.png', duration: '40 horas', modality: 'Virtual', certified: true,
    intro: 'Este curso le brinda las competencias necesarias para liderar procesos educativos innovadores y efectivos. Con una sólida base en pedagogía, andragogía y educación disruptiva, será capaz de diseñar programas formativos adaptados a las necesidades de los adultos, empleando metodologías modernas y herramientas tecnológicas avanzadas.',
    objectives: [
      'Comprender las diferencias y aplicaciones de pedagogía, andragogía y pedagogía para adultos.',
      'Desarrollar competencias clave para diseñar e implementar programas educativos efectivos.',
      'Aplicar metodologías didácticas para la enseñanza y aprendizaje de adultos.',
      'Integrar fundamentos constructivistas y multididácticos en los procesos educativos.',
      'Identificar y aplicar diferentes tipos de pedagogía en diversos contextos.',
      'Diseñar estrategias de aprendizaje innovadoras mediante la incorporación de educación disruptiva y tecnologías modernas.',
    ],
    modules: [
      'Módulo 1 - Fundamentos de la Formación',
      'Módulo 2 - Didáctica de Adultos',
      'Módulo 3 - Métodos de Formación de Adultos',
      'Módulo 4 - Tipos de Pedagogía',
      'Módulo 5 - Andragogía',
      'Módulo 6 - Educación Disruptiva',
    ],
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
  { id: 'l1', courseId: 'c1', topicId: 't1_1', title: 'Fundamentos del Liderazgo', content: 'Qué es liderar con propósito, estilos de liderazgo y autoconocimiento.', order: 1, publishAt: '2025-06-01' },
  { id: 'l2', courseId: 'c1', topicId: 't1_1', title: 'Comunicación Efectiva', content: 'Escucha activa, retroalimentación y comunicación asertiva en equipos.', order: 2, publishAt: '2025-06-01' },
  { id: 'l3', courseId: 'c1', topicId: 't1_2', title: 'Toma de Decisiones', content: 'Modelos de decisión bajo incertidumbre y pensamiento crítico.', order: 3, publishAt: '2025-06-01' },
  { id: 'l4', courseId: 'c1', topicId: 't1_3', title: 'Resolución de Conflictos', content: 'Negociación, mediación y manejo de conversaciones difíciles.', order: 4, publishAt: '2025-06-01' },

  { id: 'l5', courseId: 'c2', topicId: 't2_1', title: 'Diseño de Contenidos Formativos', content: 'Cómo estructurar un contenido pedagógico efectivo.', order: 1, publishAt: '2025-06-01' },
  { id: 'l6', courseId: 'c2', topicId: 't2_2', title: 'Metodologías Activas de Enseñanza', content: 'Aprendizaje basado en problemas, gamificación y estudio de caso.', order: 2, publishAt: '2025-06-01' },
  { id: 'l7', courseId: 'c2', topicId: 't2_2', title: 'Evaluación del Aprendizaje', content: 'Diseño de rúbricas e instrumentos de evaluación.', order: 3, publishAt: '2025-06-01' },

  { id: 'l8', courseId: 'c3', topicId: 't3_1', title: 'Marco Legal SG-SST', content: 'Normatividad vigente y responsabilidades del empleador.', order: 1, publishAt: '2025-06-01' },
  { id: 'l9', courseId: 'c3', topicId: 't3_2', title: 'Identificación de Peligros', content: 'Matriz de riesgos y valoración de peligros laborales.', order: 2, publishAt: '2025-06-01' },
  { id: 'l10', courseId: 'c3', topicId: 't3_2', title: 'Plan de Emergencias', content: 'Elaboración de planes de prevención, preparación y respuesta.', order: 3, publishAt: '2025-06-01' },
]

export const seedAssignments = [
  { id: 'a1', courseId: 'c1', topicId: 't1_1', title: 'Ensayo sobre Liderazgo', description: 'Escribe un ensayo de 2-3 páginas sobre los elementos clave del liderazgo.', dueDate: '2026-08-02', maxScore: 10, publishAt: '2025-06-01' },
  { id: 'a2', courseId: 'c1', topicId: 't1_2', title: 'Caso Práctico', description: 'Analiza el caso de estudio entregado y propone un plan de acción.', dueDate: '2026-08-06', maxScore: 10, publishAt: '2025-06-01' },
  { id: 'a3', courseId: 'c1', topicId: 't1_3', title: 'Proyecto Final', description: 'Proyecto integrador del curso de liderazgo.', dueDate: '2026-08-20', maxScore: 10, publishAt: '2025-06-01' },

  { id: 'a4', courseId: 'c2', topicId: 't2_1', title: 'Diseño de una Sesión Formativa', description: 'Diseña una sesión de 1 hora usando una metodología activa.', dueDate: '2026-08-05', maxScore: 10, publishAt: '2025-06-01' },
  { id: 'a5', courseId: 'c2', topicId: 't2_2', title: 'Rúbrica de Evaluación', description: 'Construye una rúbrica para evaluar la sesión diseñada.', dueDate: '2026-08-12', maxScore: 10, publishAt: '2025-06-01' },

  { id: 'a6', courseId: 'c3', topicId: 't3_1', title: 'Quiz Marco Legal', description: 'Cuestionario sobre la normatividad SG-SST vista en clase.', dueDate: '2026-08-04', maxScore: 10, publishAt: '2025-06-01' },
  { id: 'a7', courseId: 'c3', topicId: 't3_2', title: 'Plan de Emergencias', description: 'Elabora un plan de emergencias para un lugar de trabajo real o hipotético.', dueDate: '2026-08-18', maxScore: 10, publishAt: '2025-06-01' },
]

export const seedSubmissions = [
  { id: 'sub1', assignmentId: 'a1', studentId: 's1', submittedAt: '2026-07-28T14:30:00', fileName: 'ensayo_juan.pdf', fileSize: 245000, textResponse: '', notes: '', status: 'graded', grade: 9.0, feedback: 'Excelente trabajo, muy bien estructurado y con ejemplos claros.', gradedAt: '2026-07-29T09:15:00' },
  { id: 'sub2', assignmentId: 'a2', studentId: 's1', submittedAt: '2026-07-29T10:00:00', fileName: 'caso_practico_juan.pdf', fileSize: 180000, textResponse: '', notes: '', status: 'submitted', grade: null, feedback: '', gradedAt: null },
  { id: 'sub3', assignmentId: 'a1', studentId: 's2', submittedAt: '2026-07-27T16:45:00', fileName: 'ensayo_ana.docx', fileSize: 90000, textResponse: '', notes: '', status: 'graded', grade: 8.5, feedback: 'Buen desarrollo, refuerza la conclusión.', gradedAt: '2026-07-28T08:00:00' },
  { id: 'sub4', assignmentId: 'a4', studentId: 's1', submittedAt: '2026-07-29T18:20:00', fileName: '', fileSize: 0, textResponse: 'La sesión formativa propuesta utiliza aprendizaje basado en problemas...', notes: '', status: 'submitted', grade: null, feedback: '', gradedAt: null },
]

export const seedQuizzes = [
  {
    id: 'q1', courseId: 'c3', topicId: 't3_1', title: 'Cuestionario: Marco Legal SG-SST',
    description: 'Evalúa los conceptos clave de la normatividad vista en el módulo.',
    dueDate: '2026-08-10', publishAt: '2025-06-01',
    questions: [
      { id: 'q1_1', text: '¿Qué entidad regula el Sistema de Gestión de SST en Colombia?', options: ['Ministerio de Trabajo', 'Ministerio de Educación', 'DIAN', 'Cámara de Comercio'], correctIndex: 0 },
      { id: 'q1_2', text: '¿Cuándo se debe actualizar la matriz de riesgos?', options: ['Cada 5 años sin excepción', 'Solo al crear la empresa', 'Cuando cambian las condiciones de trabajo', 'Nunca es necesario'], correctIndex: 2 },
      { id: 'q1_3', text: '¿Quién es responsable de implementar el SG-SST en una empresa?', options: ['Solo los trabajadores', 'El empleador', 'El Ministerio de Trabajo', 'Una ARL externa únicamente'], correctIndex: 1 },
    ],
  },
]

export const seedQuizAttempts = [
  { id: 'qa1', quizId: 'q1', studentId: 's2', answers: [0, 2, 1], score: 10.0, submittedAt: '2026-07-30T11:00:00' },
]

export const seedLessonProgress = [
  { studentId: 's1', courseId: 'c1', lessonId: 'l1', completedAt: '2026-07-20T12:00:00' },
  { studentId: 's1', courseId: 'c1', lessonId: 'l2', completedAt: '2026-07-22T12:00:00' },
  { studentId: 's1', courseId: 'c1', lessonId: 'l3', completedAt: '2026-07-25T12:00:00' },
  { studentId: 's1', courseId: 'c2', lessonId: 'l5', completedAt: '2026-07-21T12:00:00' },
  { studentId: 's2', courseId: 'c1', lessonId: 'l1', completedAt: '2026-07-19T12:00:00' },
]
