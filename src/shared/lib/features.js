// Banderas temporales mientras Cursos y Suministros no tienen backend real
// conectado — controlan si el público ve la sección completa o un bloque
// "Próximamente" (catálogo, registro, paneles de cliente/estudiante). Un
// solo lugar para las dos: se activan juntas el día del despliegue completo
// (ver plan de trabajo, 17-19 de noviembre), no hay que tocar cada archivo
// por separado.
export const COURSES_ENABLED = false
export const CATALOG_ENABLED = false

// El 16 de octubre el sitio se publica solo para que el cliente lo vea —
// nadie, ni admin ni profesor, debe poder iniciar sesión ni manipular nada
// todavía. Se activa junto con el despliegue completo de noviembre.
export const LOGIN_ENABLED = false

// El Blog (Converge) y el formulario de PQRSF ya llaman al backend real,
// pero el backend no queda publicado hasta el despliegue completo de
// noviembre. Mientras tanto muestran un mensaje de "disponible pronto" en
// vez de intentar la llamada y fallar. Se activa el mismo día que LOGIN_ENABLED.
export const BACKEND_LIVE = false
