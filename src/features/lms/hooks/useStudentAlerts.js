import { useMemo } from 'react'
import { useLMS, MAX_GRADE, PASS_THRESHOLD } from '@/features/lms/context/LMSContext'
import { Check, ClipboardCheck, Mail } from '@/shared/components/Icons'

// Versión simplificada de las notificaciones de StudentDashboard, para
// cuentas vinculadas (ver 2.2): se usa fuera del panel de estudiante (p. ej.
// en la tienda de Suministros) para avisar de lo nuevo del lado LMS sin
// repetir toda la lógica de esa pantalla — por eso no trae pendientes de
// tarea/examen (son recordatorios "por hacer", no avisos de algo que
// cambió) ni abre nada directamente: solo informa, y quien haga clic
// termina en /estudiante para verlo con el detalle completo.
export function useStudentAlerts(studentId) {
  const lms = useLMS()

  return useMemo(() => {
    const grades = lms.unseenGradesForStudent(studentId).map(g => ({
      id: `grade_${g.kind}_${g.id}`,
      icon: g.grade >= PASS_THRESHOLD ? Check : ClipboardCheck,
      color: g.grade >= PASS_THRESHOLD ? '#16a34a' : '#d97706',
      text: `"${g.item.title}" fue calificada: ${g.grade}/${MAX_GRADE}`,
      date: g.gradedAt,
    }))
    const messages = lms.unreadMessagesForUser(studentId).map(m => ({
      id: `msg_${m.id}`,
      icon: Mail,
      color: '#005187',
      text: `Nuevo mensaje de ${lms.teacherName(m.fromId)}`,
      date: m.createdAt,
    }))
    return [...grades, ...messages]
  }, [lms, studentId])
}
