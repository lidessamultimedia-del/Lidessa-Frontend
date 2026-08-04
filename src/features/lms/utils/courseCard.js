// Tarjetas de curso al estilo Moodle: en vez de una foto de portada (que no
// tenemos por curso), se genera un patrón geométrico sobre el color del curso
// — variando el patrón según la posición para que la grilla no se vea repetitiva.
export const COURSE_CARD_PATTERNS = [
  { backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.16) 0 2px, transparent 2px 16px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.16) 0 2px, transparent 2px 16px)' },
  { backgroundImage: 'radial-gradient(rgba(255,255,255,0.28) 2px, transparent 2.5px)', backgroundSize: '18px 18px' },
  { backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.14) 0 1px, transparent 1px 18px), repeating-linear-gradient(90deg, rgba(255,255,255,0.14) 0 1px, transparent 1px 18px)' },
  { backgroundImage: 'repeating-conic-gradient(rgba(255,255,255,0.18) 0% 25%, transparent 0% 50%)', backgroundSize: '26px 26px' },
  { backgroundImage: 'radial-gradient(circle at 25% 30%, rgba(255,255,255,0.3) 0, transparent 45%), radial-gradient(circle at 75% 70%, rgba(255,255,255,0.24) 0, transparent 45%)' },
]

export function courseCardStyle(course, i) {
  if (course.image) {
    return { backgroundImage: `url(${course.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  }
  return { backgroundColor: course.color ?? '#005187', ...COURSE_CARD_PATTERNS[i % COURSE_CARD_PATTERNS.length] }
}
