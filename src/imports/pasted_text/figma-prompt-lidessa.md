Prompt para Figma Make — Versión completa


Reemplaza los campos entre [ ] con los datos reales de tu marca (nombre, rubro, logo) antes de pegar esto en Figma Make. La paleta de colores, la estructura, el contenido y las animaciones ya están definidos.




Prompt

Diseña un sitio web corporativo completo, moderno y con animaciones sutiles de UX, para Lidessa, una empresa de [RUBRO / SECTOR].

Paleta de colores (usar exactamente estos tonos)

Paleta principal — Azul corporativo


#005187 — azul oscuro (color primario, headers, botones principales, footer)
#4d82bc — azul medio (hover states, acentos secundarios)
#84b6f4 — azul claro (fondos de sección, íconos, bordes)
#c4dafa — azul muy claro (fondos suaves, tarjetas, separadores)
#fcffff — blanco casi puro (fondo base, texto sobre oscuro)


Paleta secundaria — Escala de negros/grises (para texto, modo oscuro y contrastes)


#000000 — negro puro (texto principal, modo oscuro base)
#272727 — gris muy oscuro (fondos modo oscuro, texto secundario)
#454546 — gris oscuro (texto de apoyo, íconos inactivos)
#666666 — gris medio (texto placeholder, bordes)
#8c8c8c — gris claro (texto deshabilitado, divisores sutiles)


Uso sugerido: la paleta azul como identidad de marca (CTA, links, iconografía, hero), y la escala de grises/negro para tipografía, modo oscuro (dark mode) y elementos neutros. Mantener alto contraste AA/AAA en combinaciones de texto sobre fondo.

Animaciones y microinteracciones (requisito clave)

El sitio debe sentirse fluido y guiar al usuario. Incluir:


Scroll reveal: las secciones (tarjetas de servicios, testimonios, franja de valores) aparecen con fade-in + slide-up sutil al hacer scroll
Hover states animados: botones con transición de color/escala (transform: scale 1.03-1.05), tarjetas de servicio con elevación (shadow) al pasar el mouse
Menú desplegable animado: submenús de "Servicios" con transición suave (fade + slide) en vez de aparición abrupta
Acordeones animados: en el buscador de servicios del hero y en las secciones de "Más información", expandir/colapsar con transición de altura suave
Carrusel de logos de clientes: desplazamiento automático continuo (marquee) o carrusel con transición suave entre slides
Toggle de tema claro/oscuro: transición de colores animada (no cambio abrupto) al cambiar entre modo claro y oscuro
Botón flotante de WhatsApp: pequeña animación de pulso (pulse) para llamar la atención sin ser invasiva
Loading states: skeleton loaders o spinners sutiles en tarjetas de blog/noticias mientras cargan
Números animados (contadores): si se muestran cifras como "años de experiencia" o "empresas atendidas", animarlos contando desde 0 al entrar en viewport
Mantener las animaciones cortas (200-400ms), con easing suave (ease-in-out), sin saturar ni afectar la performance ni la accesibilidad (respetar prefers-reduced-motion)



Sistema de dos vistas: Administrador y Cliente

El sitio debe contemplar autenticación con dos roles distintos, cada uno con su propia interfaz tras iniciar sesión (los botones "Iniciar sesión" / "Registrarse" del header llevan a este sistema).

Vista Cliente (usuario registrado)

El cliente tiene exactamente las mismas capacidades que un usuario tiene hoy en el sitio de referencia (cgvertice.com) — es decir, la experiencia pública/funcional normal del sitio, sin permisos de edición de contenido:


Registro e inicio de sesión con su cuenta
Navegar y consultar libremente todas las secciones públicas: servicios (con sus categorías y subservicios), Nosotros, Blog/Noticias, cursos/formación
Solicitar cotización de un servicio (botón "Cotizar" que redirige a WhatsApp con mensaje predefinido, igual que en el sitio de referencia)
Leer noticias/publicaciones en detalle (modal con imagen, descripción completa, autor y fecha)
Inscribirse a cursos a través del formulario de inscripción (igual al "Inscribirse" del sitio de referencia)
Enviar solicitudes, quejas, reclamos o sugerencias (PQRSF) mediante el formulario correspondiente
Contactar directamente por WhatsApp, correo o el mapa de ubicación
Editar su perfil: datos de contacto y de la cuenta
El cliente no puede crear, editar ni eliminar contenido del sitio (servicios, noticias, cursos) — solo consumirlo e interactuar con los formularios de contacto/solicitud


Vista Administrador (equipo interno)

El administrador tiene acceso total al sitio para poder publicar y mantener actualizado todo el contenido que el cliente ve en la parte pública — replicando y ampliando el panel de gestión que ya existe en el sitio de referencia (donde cada noticia tenía su propio "Crear/Editar noticia"):


Dashboard general: métricas clave con contadores animados (clientes registrados, solicitudes pendientes, cursos con inscripciones, publicaciones del mes) y gráficos simples con animación de entrada
Publicar y gestionar servicios: crear, editar, activar/desactivar cualquier servicio y subservicio que se muestra en el sitio público (nombre, descripción, categoría, imagen, botón de cotización)
Publicar y gestionar blog/noticias: control total de publicaciones — crear, editar, eliminar, subir imagen/video, elegir categoría (Noticias de actualidad / Consultas normativas / Publicaciones recientes), programar fecha de publicación — igual al panel "Crear/Editar Noticia" visto en el sitio de referencia, pero accesible de forma centralizada
Publicar y gestionar cursos: control total sobre la oferta de cursos (nombre, descripción, imagen, cupos, requisitos) y ver inscritos
Gestionar clientes: ver y administrar todas las cuentas de clientes registrados
Gestionar solicitudes/PQRSF: bandeja de entrada de todas las solicitudes de clientes, con posibilidad de responder y cambiar estado
Gestionar usuarios y roles: crear otras cuentas de administrador y definir permisos
Editar configuración general del sitio: datos de contacto, horarios, redes sociales, textos institucionales del footer, logos e imágenes de marca
En resumen: si algo aparece en la parte pública del sitio (servicios, noticias, cursos, información de contacto), el administrador debe poder publicarlo, editarlo o eliminarlo desde su panel


Consideraciones de diseño para ambas vistas


Login único con redirección automática según el rol (cliente → dashboard cliente; administrador → panel admin), con transición animada al iniciar sesión
Sidebar de navegación lateral colapsable (con animación de expandir/colapsar) para ambos paneles, distinta según el rol
Mantener la misma paleta de colores e identidad visual del sitio público, pero con una superficie más "funcional" (más blancos/grises neutros de la paleta secundaria y azul como color de acento para botones y estados activos)
Tablas con estados vacíos y de carga (skeleton loaders) animados
Notificaciones tipo toast animadas (entrada/salida) para confirmar acciones (guardado, error, éxito)
Diseño responsive también para ambos paneles, priorizando escritorio pero usable en tablet


Sistema de alertas y notificaciones (aplica a todo el sitio)

Toda acción relevante, tanto en la parte pública como en los paneles de Cliente y Administrador, debe dar una retroalimentación visual clara mediante alertas animadas (toasts/notificaciones tipo banner, con entrada y salida animada, auto-desaparición después de unos segundos salvo errores críticos):


Confirmaciones de éxito (verde): registro exitoso, inicio de sesión correcto, formulario de cotización/PQRSF enviado, curso inscrito, publicación creada/editada/eliminada, datos de perfil actualizados
Alertas de error (rojo): credenciales incorrectas, campos obligatorios vacíos, error al subir imagen/video, fallo de conexión, permisos insuficientes
Alertas de advertencia (amarillo/naranja): confirmación antes de eliminar algo (servicio, noticia, curso, usuario) con modal de "¿Estás seguro?", sesión próxima a expirar, campos con formato inválido mientras se escribe
Alertas informativas (azul, usando la paleta de marca): nueva notificación recibida (ej. una nueva solicitud PQRSF para el administrador, respuesta a una solicitud para el cliente), recordatorios (curso por iniciar, documento nuevo disponible)
Indicador de notificaciones no leídas: ícono de campana con contador animado en el header de ambos paneles (Cliente y Administrador), que despliega un listado al hacer clic
Las alertas deben ser accesibles (anunciadas para lectores de pantalla) y no bloquear la interacción del usuario con el resto de la página



Estructura completa del sitio

1. Header / Navegación (fijo, con animación de reducción al hacer scroll)


Logo a la izquierda
Menú horizontal:

Inicio
Nosotros
Blog / Noticias
[Unidad de negocio o marca hermana 1]
[Unidad de negocio o marca hermana 2 — ej. centro de formación/cursos]
Servicios (con submenú desplegable animado, organizado en 4 categorías, cada una con sus subservicios):

Gestión de empresas: Gestión de calidad, Gestión de desarrollo empresarial, Consultoría gerencial
Gestión de instituciones: Manuales de convivencia, Diseño de proyecto institucional, Mallas curriculares, Evaluación de personal, Evaluación institucional
Educación y formación: Formación continua, Formación a la medida, Gestión para instituciones educativas
Propiedades horizontales: Seguridad y salud en el trabajo, Plan de manejo de residuos, Tratamiento de datos, Planes de emergencia






Botones "Iniciar sesión" / "Registrarse"
Toggle de tema claro/oscuro/automático (con transición animada)
Versión mobile: menú hamburguesa con panel deslizante animado


2. Hero Section


Buscador/selector rápido de servicios ("¿Buscas un servicio?") con acordeones animados por categoría
Slogan de marca + imagen o ilustración destacada
Video institucional embebido (banner)
Texto de propuesta de valor (2-3 líneas) enfocado en confianza, tranquilidad y soluciones integrales para el cliente


3. Sección de clientes / logos aliados


Carrusel automático (marquee) con 6-8 logos de clientes en escala de grises que se colorean al hover


4. Franja de valores/atributos (con contadores animados si aplica)


4 bloques con concepto central + 3 subconceptos cada uno. Ejemplos de estructura a adaptar:

Liderazgo → validación de procesos, gestión de riesgos, técnicas de trabajo
Transformación → cambio organizacional, características y capacidades, desarrollo empresarial
Compromiso → empresa especializada, compromiso, excelencia empresarial
Identidad → quiénes somos





5. Servicios destacados (grid de tarjetas animadas con hover elevation)

6 tarjetas (imagen + título + descripción corta + botón "Conozca más"), cubriendo por ejemplo:


Seguridad y salud en el trabajo
Plan de manejo de residuos sólidos
Evaluación de riesgo psicosocial
Diseño de proyecto educativo institucional
Gestión para instituciones educativas
Formación a la medida


6. Página/sección "Nosotros" (detalle)


Encabezado: "Quiénes somos y nuestra pasión por la excelencia"
Bloque de identidad de marca tipo acróstico con el nombre de la empresa (frase de valores que deletree el nombre — como recurso de storytelling de marca)
Sección "CEOs / Equipo directivo": tarjetas con foto, nombre, cargo y biografía breve (2 perfiles mínimo: Gerente y Sub Gerente)
Bloque "¿Quiénes somos?" (2-3 párrafos institucionales sobre trayectoria y enfoque)
Bloque "¿Qué nos diferencia?" (lista de 6-7 diferenciales: enfoque personalizado, equipo multidisciplinario, experiencia comprobada, reducción de costos, compromiso con la excelencia, cercanía con el cliente, actualización normativa)
Bloque "Nuestros objetivos" (lista de 5 objetivos institucionales)
Bloque de cifras/trayectoria con contadores animados: años de experiencia, empresas acompañadas, % de reducción de costos, % de reducción de riesgo de sanción
Explicación de modelo de servicio (ej. modelo de outsourcing/consultoría tipo KPO) con imagen de apoyo
Sección de testimonios en video (carrusel animado con controles previous/next): 3-4 testimonios con video, nombre, cargo y empresa del cliente
Bloque de contacto directo: dirección, correos por área (comercial, mercadeo, servicios), teléfonos con link a WhatsApp
Mini-sección de 3 pilares de servicio al cliente (con íconos e imágenes)


7. Blog / Noticias


3 categorías de contenido (tabs animados): Noticias de actualidad, Consultas normativas, Publicaciones recientes
Tarjetas de publicación (imagen + título + botón "Más información") que abren un modal/detalle animado (fade + scale in) con imagen grande, descripción completa, fecha y datos de contacto del autor invitado


8. Sección de cursos / formación (unidad de negocio educativa)


Banner de bienvenida con logo de la unidad
Texto institucional breve sobre la oferta de cursos y certificaciones
Grid de tarjetas de cursos destacados (imagen + título + descripción corta + botón "Conoce más"), ejemplo de cursos: auditoría interna, inducción en seguridad laboral, formación para formadores
CTA de inscripción destacado


9. Mapa de ubicación


Mapa embebido (Google Maps) con marcador en la dirección de la oficina, con animación de entrada al hacer scroll


10. Aliados estratégicos / unidades de negocio (footer superior)


Fila de logos de marcas o unidades relacionadas con links, hover animado


11. Footer


Columna 1: identificación general / trayectoria (mensaje corto de años de experiencia)
Columna 2: enlaces de interés (páginas institucionales o del sector relevantes al rubro)
Columna 3: horario de atención
Columna 4: "Acerca de" (Nosotros, Contáctenos)
Columna 5: dirección física, correos de contacto por área, teléfonos con link directo a WhatsApp
Íconos de redes sociales (Facebook, X/Twitter, Instagram, LinkedIn, Linktree, YouTube, TikTok) con hover animado
Botón flotante de WhatsApp con animación de pulso
Línea de copyright



Guías generales de diseño


Diseño responsive mobile-first
Tarjetas con sombra suave y hover elevado para servicios, cursos y noticias
Jerarquía tipográfica clara: hero grande y con peso, subtítulos medianos, cuerpo legible
Espaciado generoso entre secciones para transmitir profesionalismo y orden visual
Modo claro y modo oscuro usando la paleta de grises/negro definida arriba
Accesibilidad: contraste adecuado, respetar prefers-reduced-motion, navegación por teclado en menús y acordeones
[Aquí Felipe: agregar logo final, tipografía elegida y cualquier restricción adicional de marca]



Nota: este prompt reproduce la arquitectura de información, tipo de contenido y nivel de detalle de una página de referencia del mismo formato (consultoría de servicios con unidad educativa y blog), pero no copia textos literales, logos ni identidad visual — todo el copy final, nombres de secciones y detalles deben ajustarse a la marca nueva.