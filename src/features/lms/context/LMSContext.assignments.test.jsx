import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import * as api from '@/shared/lib/api'
import { LMSProvider, useLMS } from './LMSContext'

// Todas las funciones de la API quedan como vi.fn(); cada prueba define qué
// responde el "backend".
vi.mock('@/shared/lib/api')

let auth
vi.mock('@/features/auth/context/AuthContext', () => ({ useAuth: () => auth }))

const TOKEN = 'jwt-de-prueba'
const teacher = { id: '2', role: 'profesor', token: TOKEN }
const student = { id: '10', role: 'estudiante', token: TOKEN }

// ── Respuestas del backend (shape de los DTOs de Lidessa.Api) ──
const apiCourse = {
  id: 5, name: 'Curso real', teacherId: 2, teacherName: 'Profe', format: 'topics', published: true,
  requiresPassword: false, selfEnrollment: false, guestAccess: false, capacity: 30, listed: false,
  students: [{ id: 10, name: 'Estudiante real', email: 'e@x.co' }, { id: 11, name: 'Compañero', email: 'c@x.co' }],
}
const apiTopic = { id: 9, courseId: 5, title: 'Tema real', sortOrder: 1 }
const apiAssignment = {
  id: 7, courseId: 5, topicId: 9, title: 'Tarea real', description: 'Desc', dueDate: '2026-11-15T23:59:00',
  maxScore: 10.0, publishAt: '2026-10-01', attachmentFileName: 'guia.pdf', attachmentUrl: '/uploads/guia.pdf',
  attachmentSizeBytes: 1024, assignedStudentIds: [10],
}
const apiSubmission = {
  id: 70, assignmentId: 7, studentId: 10, attachmentFileName: 'ensayo.pdf', attachmentUrl: '/uploads/ensayo.pdf',
  attachmentSizeBytes: 2048, textResponse: 'Respuesta', notes: '', status: 'submitted',
  submittedAt: '2026-10-20T10:00:00', grade: null, feedback: '', gradedAt: null, retryAllowed: false, seen: false,
}

function mockBackend({ courses = [apiCourse], topics = [apiTopic], assignments = [apiAssignment], submissions = [apiSubmission] } = {}) {
  api.apiGetMyCourses.mockResolvedValue(courses)
  api.apiGetTopics.mockResolvedValue(topics)
  api.apiGetLessons.mockResolvedValue([])
  api.apiGetQuizzes.mockResolvedValue([])
  api.apiGetAssignments.mockResolvedValue(assignments)
  api.apiGetSubmissions.mockResolvedValue(submissions)
  api.apiGetSubmission.mockImplementation(async id => submissions.find(s => s.assignmentId === id) ?? null)
}

function renderLMS() {
  return renderHook(() => useLMS(), { wrapper: LMSProvider })
}

// Monta el LMS y espera a que termine la carga inicial desde la API.
async function renderSynced() {
  const hook = renderLMS()
  await waitFor(() => expect(hook.result.current.assignments.some(a => a.remoteId === 7)).toBe(true))
  return hook
}

beforeEach(() => {
  vi.clearAllMocks()
  auth = { user: teacher, registeredStudents: [], allUsers: [] }
  mockBackend()
})

describe('carga inicial de tareas y entregas', () => {
  it('sin sesión no llama a la API y deja las tareas mock', () => {
    auth = { user: null, registeredStudents: [], allUsers: [] }
    const { result } = renderLMS()

    expect(api.apiGetMyCourses).not.toHaveBeenCalled()
    expect(result.current.assignments.some(a => a.id === 'a1')).toBe(true)
  })

  it('traduce las tareas del backend al shape de la UI', async () => {
    const { result } = await renderSynced()

    const assignment = result.current.assignments.find(a => a.remoteId === 7)
    expect(assignment).toMatchObject({
      id: '7', courseId: '5', topicId: '9', title: 'Tarea real', description: 'Desc',
      dueDate: '2026-11-15T23:59', maxScore: 10, publishAt: '2026-10-01',
      fileName: 'guia.pdf', fileUrl: '/uploads/guia.pdf', fileSize: 1024, fileData: '',
      assignedStudentIds: ['10'],
    })
    expect(api.apiGetAssignments).toHaveBeenCalledWith(5, TOKEN)
    // Las tareas mock conviven con las reales.
    expect(result.current.assignments.some(a => a.id === 'a1')).toBe(true)
  })

  it('el staff carga todas las entregas y quedan enlazadas a su tarea', async () => {
    const { result } = await renderSynced()

    expect(api.apiGetSubmissions).toHaveBeenCalledWith(7, TOKEN)
    expect(api.apiGetSubmission).not.toHaveBeenCalled()
    // assignmentId tiene que ser el id local (string) para que submissionFor la encuentre.
    const sub = result.current.submissionFor('7', '10')
    expect(sub).toMatchObject({ id: 'sub_api_70', remoteId: 70, assignmentId: '7', studentId: '10', status: 'submitted', fileUrl: '/uploads/ensayo.pdf' })
    expect(result.current.submissionsPendingForTeacher('2').map(s => s.id)).toContain('sub_api_70')
  })

  it('el estudiante carga solo su entrega e ignora 403/404', async () => {
    auth = { user: student, registeredStudents: [], allUsers: [] }
    const other = { ...apiAssignment, id: 8, title: 'Sin entrega' }
    const forbidden = { ...apiAssignment, id: 9, title: 'No asignada' }
    mockBackend({ assignments: [apiAssignment, other, forbidden] })
    api.apiGetSubmission.mockImplementation(async id => {
      if (id === 9) throw Object.assign(new Error('Forbidden'), { status: 403 })
      return id === 7 ? apiSubmission : null
    })

    const { result } = await renderSynced()

    expect(api.apiGetSubmissions).not.toHaveBeenCalled()
    expect(api.apiGetSubmission).toHaveBeenCalledTimes(3)
    expect(result.current.submissions.filter(s => s.remoteId)).toHaveLength(1)
    expect(result.current.remoteSyncError).toBe('')
  })

  it('una nueva sincronización reemplaza las tareas reales sin duplicarlas', async () => {
    const { result, rerender } = await renderSynced()
    auth = { ...auth, user: { ...teacher, token: 'otro-token' } }
    rerender()

    await waitFor(() => expect(api.apiGetMyCourses).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(result.current.assignments.filter(a => a.remoteId === 7)).toHaveLength(1))
    expect(result.current.submissions.filter(s => s.remoteId === 70)).toHaveLength(1)
  })
})

describe('CRUD de tareas', () => {
  it('crear en un curso mock queda solo en local', async () => {
    const { result } = await renderSynced()

    let created
    await act(async () => { created = await result.current.addAssignment('c1', { title: 'Local', dueDate: '2026-12-01T10:00' }) })

    expect(api.apiCreateAssignment).not.toHaveBeenCalled()
    expect(created.id).toMatch(/^a\d+$/)
    expect(created.maxScore).toBe(10)
    expect(result.current.assignments.some(a => a.id === created.id)).toBe(true)
  })

  it('crear en un curso real sube el adjunto y manda ids del backend', async () => {
    api.apiUploadAttachment.mockResolvedValue({ fileName: 'guia.pdf', url: '/uploads/nuevo.pdf', sizeBytes: 5 })
    api.apiCreateAssignment.mockResolvedValue({ ...apiAssignment, id: 8, title: 'Nueva', attachmentUrl: '/uploads/nuevo.pdf' })
    const { result } = await renderSynced()

    await act(async () => {
      await result.current.addAssignment('5', {
        title: 'Nueva', description: '', dueDate: '2026-12-01T10:00', topicId: '9', publishAt: '',
        fileName: 'guia.pdf', fileData: 'data:application/pdf;base64,aG9sYQ==', fileSize: 4,
        assignedStudentIds: ['10', '11'],
      })
    })

    expect(api.apiUploadAttachment).toHaveBeenCalledTimes(1)
    const uploaded = api.apiUploadAttachment.mock.calls[0][0]
    expect(uploaded).toBeInstanceOf(File)
    expect(uploaded.name).toBe('guia.pdf')
    expect(api.apiCreateAssignment).toHaveBeenCalledWith(5, {
      title: 'Nueva', description: '', dueDate: '2026-12-01T10:00', topicId: 9, publishAt: null,
      assignedStudentIds: [10, 11],
      attachmentFileName: 'guia.pdf', attachmentUrl: '/uploads/nuevo.pdf', attachmentSizeBytes: 5,
    }, TOKEN)
    expect(result.current.assignments.find(a => a.id === '8')).toMatchObject({ remoteId: 8, title: 'Nueva', fileUrl: '/uploads/nuevo.pdf' })
  })

  it('un tema mock no se manda como topicId al backend', async () => {
    api.apiCreateAssignment.mockResolvedValue({ ...apiAssignment, id: 8, topicId: null })
    const { result } = await renderSynced()

    await act(async () => { await result.current.addAssignment('5', { title: 'X', dueDate: '2026-12-01T10:00', topicId: 't1_1' }) })

    expect(api.apiCreateAssignment.mock.calls[0][1].topicId).toBeNull()
  })

  it('si la API falla al crear, el error sube y no se agrega nada', async () => {
    api.apiCreateAssignment.mockRejectedValue(new Error('El título de la tarea es obligatorio'))
    const { result } = await renderSynced()
    const before = result.current.assignments.length

    await act(async () => {
      await expect(result.current.addAssignment('5', { title: '', dueDate: '2026-12-01T10:00' })).rejects.toThrow('El título de la tarea es obligatorio')
    })

    expect(result.current.assignments).toHaveLength(before)
  })

  it('un cambio parcial (publicar) manda la tarea completa y conserva el adjunto', async () => {
    api.apiUpdateAssignment.mockResolvedValue({ ...apiAssignment, publishAt: null })
    const { result } = await renderSynced()

    await act(async () => { await result.current.updateAssignment('7', { publishAt: null }) })

    expect(api.apiUploadAttachment).not.toHaveBeenCalled()
    expect(api.apiUpdateAssignment).toHaveBeenCalledWith(7, {
      title: 'Tarea real', description: 'Desc', dueDate: '2026-11-15T23:59', topicId: 9, publishAt: null,
      assignedStudentIds: [10],
      attachmentFileName: 'guia.pdf', attachmentUrl: '/uploads/guia.pdf', attachmentSizeBytes: 1024,
    }, TOKEN)
    expect(result.current.assignments.find(a => a.id === '7').publishAt).toBeNull()
  })

  it('quitar el adjunto lo borra en el backend', async () => {
    api.apiUpdateAssignment.mockResolvedValue({ ...apiAssignment, attachmentFileName: null, attachmentUrl: null, attachmentSizeBytes: null })
    const { result } = await renderSynced()

    await act(async () => { await result.current.updateAssignment('7', { fileName: '', fileData: '', fileSize: 0 }) })

    expect(api.apiUpdateAssignment.mock.calls[0][1]).toMatchObject({ attachmentFileName: null, attachmentUrl: null, attachmentSizeBytes: null })
    expect(result.current.assignments.find(a => a.id === '7').fileName).toBe('')
  })

  it('editar una tarea mock no llama a la API', async () => {
    const { result } = await renderSynced()

    await act(async () => { await result.current.updateAssignment('a1', { title: 'Editada' }) })

    expect(api.apiUpdateAssignment).not.toHaveBeenCalled()
    expect(result.current.assignments.find(a => a.id === 'a1').title).toBe('Editada')
  })

  it('borrar una tarea real llama a la API y limpia sus entregas', async () => {
    api.apiDeleteAssignment.mockResolvedValue(null)
    const { result } = await renderSynced()

    await act(async () => { await result.current.deleteAssignment('7') })

    expect(api.apiDeleteAssignment).toHaveBeenCalledWith(7, TOKEN)
    expect(result.current.assignments.some(a => a.id === '7')).toBe(false)
    expect(result.current.submissions.some(s => s.assignmentId === '7')).toBe(false)
  })

  it('si la API falla al borrar, la tarea se queda', async () => {
    api.apiDeleteAssignment.mockRejectedValue(new Error('Forbidden'))
    const { result } = await renderSynced()

    await act(async () => { await expect(result.current.deleteAssignment('7')).rejects.toThrow('Forbidden') })

    expect(result.current.assignments.some(a => a.id === '7')).toBe(true)
    expect(result.current.submissionFor('7', '10')).not.toBeNull()
  })

  it('borrar una tarea mock no llama a la API', async () => {
    const { result } = await renderSynced()

    await act(async () => { await result.current.deleteAssignment('a1') })

    expect(api.apiDeleteAssignment).not.toHaveBeenCalled()
    expect(result.current.assignments.some(a => a.id === 'a1')).toBe(false)
    expect(result.current.submissions.some(s => s.assignmentId === 'a1')).toBe(false)
  })
})

describe('entregas', () => {
  beforeEach(() => { auth = { user: student, registeredStudents: [], allUsers: [] } })

  it('loadSubmission usa el id del backend', async () => {
    const { result } = await renderSynced()
    api.apiGetSubmission.mockClear()

    let loaded
    await act(async () => { loaded = await result.current.loadSubmission('7') })

    expect(api.apiGetSubmission).toHaveBeenCalledWith(7, TOKEN)
    expect(loaded).toMatchObject({ remoteId: 70, assignmentId: '7' })
  })

  it('loadSubmission de una tarea mock no llama a la API', async () => {
    const { result } = await renderSynced()
    api.apiGetSubmission.mockClear()

    let loaded
    await act(async () => { loaded = await result.current.loadSubmission('a1') })

    expect(api.apiGetSubmission).not.toHaveBeenCalled()
    expect(loaded).toBeNull()
  })

  it('entregar una tarea real guarda en la API con su id', async () => {
    mockBackend({ submissions: [] })
    api.apiSaveSubmission.mockResolvedValue({ ...apiSubmission, status: 'draft', submittedAt: null })
    const { result } = await renderSynced()

    await act(async () => {
      await result.current.submitAssignment({ assignmentId: '7', fileName: 'e.pdf', fileUrl: '/uploads/e.pdf', fileSize: 3, textResponse: 'Hola', draft: true })
    })

    expect(api.apiSaveSubmission).toHaveBeenCalledWith(7, {
      textResponse: 'Hola', notes: '', attachmentFileName: 'e.pdf', attachmentUrl: '/uploads/e.pdf', attachmentSizeBytes: 3, submit: false,
    }, TOKEN)
    expect(result.current.submissionFor('7', '10').status).toBe('draft')
  })

  it('entregar una tarea mock queda en local sin llamar a la API', async () => {
    const { result } = await renderSynced()

    await act(async () => { await result.current.submitAssignment({ assignmentId: 'a3', textResponse: 'Borrador', draft: true }) })
    const draft = result.current.submissionFor('a3', '10')
    await act(async () => { await result.current.submitAssignment({ assignmentId: 'a3', textResponse: 'Final' }) })
    const submitted = result.current.submissionFor('a3', '10')

    expect(api.apiSaveSubmission).not.toHaveBeenCalled()
    expect(draft).toMatchObject({ status: 'draft', submittedAt: null, textResponse: 'Borrador' })
    expect(submitted).toMatchObject({ id: draft.id, status: 'submitted', textResponse: 'Final', grade: null })
    expect(submitted.submittedAt).toBeTruthy()
    expect(result.current.submissions.filter(s => s.assignmentId === 'a3' && s.studentId === '10')).toHaveLength(1)
  })

  it('si la API rechaza la entrega, el error sube', async () => {
    api.apiSaveSubmission.mockRejectedValue(new Error('Ya entregaste esta tarea; no puedes volver a guardarla como borrador.'))
    const { result } = await renderSynced()

    await act(async () => {
      await expect(result.current.submitAssignment({ assignmentId: '7', draft: true })).rejects.toThrow('Ya entregaste')
    })
    expect(result.current.submissionFor('7', '10').status).toBe('submitted')
  })
})

describe('calificar y reintentos (staff)', () => {
  it('calificar una entrega real usa su remoteId', async () => {
    api.apiGradeSubmission.mockResolvedValue({ ...apiSubmission, status: 'graded', grade: 9, feedback: 'Bien', gradedAt: '2026-10-21T00:00:00' })
    const { result } = await renderSynced()

    await act(async () => { await result.current.gradeSubmission('sub_api_70', 9, 'Bien') })

    expect(api.apiGradeSubmission).toHaveBeenCalledWith(70, { grade: 9, feedback: 'Bien', retryAllowed: false }, TOKEN)
    expect(result.current.submissionFor('7', '10')).toMatchObject({ status: 'graded', grade: 9 })
  })

  it('permitir reintento en una entrega real lo guarda en la API', async () => {
    api.apiAllowSubmissionRetry.mockResolvedValue({ ...apiSubmission, retryAllowed: true })
    const { result } = await renderSynced()

    act(() => { result.current.allowRetry('assignment', 'sub_api_70') })

    expect(api.apiAllowSubmissionRetry).toHaveBeenCalledWith(70, TOKEN)
    expect(api.apiAllowQuizRetry).not.toHaveBeenCalled()
    expect(result.current.submissionFor('7', '10').retryAllowed).toBe(true)
  })

  it('permitir reintento en una entrega mock queda solo en local', async () => {
    const { result } = await renderSynced()

    act(() => { result.current.allowRetry('assignment', 'sub1') })

    expect(api.apiAllowSubmissionRetry).not.toHaveBeenCalled()
    expect(result.current.submissions.find(s => s.id === 'sub1').retryAllowed).toBe(true)
  })

  it('un fallo de la API al permitir reintento no rompe la UI', async () => {
    api.apiAllowSubmissionRetry.mockRejectedValue(new Error('caído'))
    const { result } = await renderSynced()

    act(() => { result.current.allowRetry('assignment', 'sub_api_70') })

    await waitFor(() => expect(api.apiAllowSubmissionRetry).toHaveBeenCalled())
    expect(result.current.submissionFor('7', '10').retryAllowed).toBe(true)
  })
})
