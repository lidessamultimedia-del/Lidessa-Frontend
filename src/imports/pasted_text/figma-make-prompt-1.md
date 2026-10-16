# Prompt para Figma Make — Versión completa

> Reemplaza los campos entre [ ] con los datos reales de tu marca (nombre, rubro, logo) antes de pegar esto en Figma Make. La paleta de colores, la estructura, el contenido y las animaciones ya están definidos.

---

## Prompt

Diseña un sitio web corporativo completo, moderno y con **animaciones sutiles de UX**, para **[NOMBRE DE LA EMPRESA]**, una empresa de **[RUBRO / SECTOR]**.

### Paleta de colores (usar exactamente estos tonos)

**Paleta principal — Azul corporativo**
- `#005187` — azul oscuro (color primario, headers, botones principales, footer)
- `#4d82bc` — azul medio (hover states, acentos secundarios)
- `#84b6f4` — azul claro (fondos de sección, íconos, bordes)
- `#c4dafa` — azul muy claro (fondos suaves, tarjetas, separadores)
- `#fcffff` — blanco casi puro (fondo base, texto sobre oscuro)

**Paleta secundaria — Escala de negros/grises** (para texto, modo oscuro y contrastes)
- `#000000` — negro puro (texto principal, modo oscuro base)
- `#272727` — gris muy oscuro (fondos modo oscuro, texto secundario)
- `#454546` — gris oscuro (texto de apoyo, íconos inactivos)
- `#666666` — gris medio (texto placeholder, bordes)
- `#8c8c8c` — gris claro (texto deshabilitado, divisores sutiles)

**Uso sugerido:** la paleta azul como identidad de marca (CTA, links, iconografía, hero), y la escala de grises/negro para tipografía, modo oscuro (dark mode) y elementos neutros. Mantener alto contraste AA/AAA en combinaciones de texto sobre fondo.

### Animaciones y microinteracciones (requisito clave)
El sitio debe sentirse fluido y guiar al usuario. Incluir:
- **Scroll reveal**: las secciones (tarjetas de servicios, testimonios, franja de valores) aparecen con fade-in + slide-up sutil al hacer scroll
- **Hover states animados**: botones con transición de color/escala (transform: scale 1.03-1.05), tarjetas de servicio con elevación (shadow) al pasar el mouse
- **Menú desplegable animado**: submenús de "Servicios" con transición suave (fade + slide) en vez de aparición abrupta
- **Acordeones animados**: en el buscador de servicios del hero y en las secciones de "Más información", expandir/colapsar con transición de altura suave
- **Carrusel de logos de clientes**: desplazamiento automático continuo (marquee) o carrusel con transición suave entre slides
- **Toggle de tema claro/oscuro**: transición de colores animada (no cambio abrupto) al cambiar entre modo claro y oscuro
- **Botón flotante de WhatsApp**: pequeña animación de pulso (pulse) para llamar la atención sin ser invasiva
- **Loading states**: skeleton loaders o spinners sutiles en tarjetas de blog/noticias mientras cargan
- **Números animados (contadores)**: si se muestran cifras como "años de experiencia" o "empresas atendidas", animarlos contando desde 0 al entrar en viewport
- Mantener las animaciones cortas (200-400ms), con easing suave (ease-in-out), sin saturar ni afectar la performance ni la accesibilidad (respetar `prefers-reduced-motion`)

---

## Estructura completa del sitio

### 1. Header / Navegación (fijo, con animación de reducción al hacer scroll)
- Logo a la izquierda
- Menú horizontal:
  - Inicio
  - Nosotros
  - Blog / Noticias
  - [Unidad de negocio o marca hermana 1]
  - [Unidad de negocio o marca hermana 2 — ej. centro de formación/cursos]
  - Servicios (con submenú desplegable animado, organizado en 4 categorías, cada una con sus subservicios):
    - **Gestión de empresas**: Gestión de calidad, Gestión de desarrollo empresarial, Consultoría gerencial
    - **Gestión de instituciones**: Manuales de convivencia, Diseño de proyecto institucional, Mallas curriculares, Evaluación de personal, Evaluación institucional
    - **Educación y formación**: Formación continua, Formación a la medida, Gestión para instituciones educativas
    - **Propiedades horizontales**: Seguridad y salud en el trabajo, Plan de manejo de residuos, Tratamiento de datos, Planes de emergencia
- Botones "Iniciar sesión" / "Registrarse"
- Toggle de tema claro/oscuro/automático (con transición animada)
- Versión mobile: menú hamburguesa con panel deslizante animado

### 2. Hero Section
- Buscador/selector rápido de servicios ("¿Buscas un servicio?") con acordeones animados por categoría
- Slogan de marca + imagen o ilustración destacada
- Video institucional embebido (banner)
- Texto de propuesta de valor (2-3 líneas) enfocado en confianza, tranquilidad y soluciones integrales para el cliente

### 3. Sección de clientes / logos aliados
- Carrusel automático (marquee) con 6-8 logos de clientes en escala de grises que se colorean al hover

### 4. Franja de valores/atributos (con contadores animados si aplica)
- 4 bloques con concepto central + 3 subconceptos cada uno. Ejemplos de estructura a adaptar:
  - Liderazgo → validación de procesos, gestión de riesgos, técnicas de trabajo
  - Transformación → cambio organizacional, características y capacidades, desarrollo empresarial
  - Compromiso → empresa especializada, compromiso, excelencia empresarial
  - Identidad → quiénes somos

### 5. Servicios destacados (grid de tarjetas animadas con hover elevation)
6 tarjetas (imagen + título + descripción corta + botón "Conozca más"), cubriendo por ejemplo:
- Seguridad y salud en el trabajo
- Plan de manejo de residuos sólidos
- Evaluación de riesgo psicosocial
- Diseño de proyecto educativo institucional
- Gestión para instituciones educativas
- Formación a la medida

### 6. Página/sección "Nosotros" (detalle)
- Encabezado: "Quiénes somos y nuestra pasión por la excelencia"
- Bloque de identidad de marca tipo acróstico con el nombre de la empresa (frase de valores que deletree el nombre — como recurso de storytelling de marca)
- Sección "CEOs / Equipo directivo": tarjetas con foto, nombre, cargo y biografía breve (2 perfiles mínimo: Gerente y Sub Gerente)
- Bloque "¿Quiénes somos?" (2-3 párrafos institucionales sobre trayectoria y enfoque)
- Bloque "¿Qué nos diferencia?" (lista de 6-7 diferenciales: enfoque personalizado, equipo multidisciplinario, experiencia comprobada, reducción de costos, compromiso con la excelencia, cercanía con el cliente, actualización normativa)
- Bloque "Nuestros objetivos" (lista de 5 objetivos institucionales)
- Bloque de cifras/trayectoria con **contadores animados**: años de experiencia, empresas acompañadas, % de reducción de costos, % de reducción de riesgo de sanción
- Explicación de modelo de servicio (ej. modelo de outsourcing/consultoría tipo KPO) con imagen de apoyo
- Sección de **testimonios en video** (carrusel animado con controles previous/next): 3-4 testimonios con video, nombre, cargo y empresa del cliente
- Bloque de contacto directo: dirección, correos por área (comercial, mercadeo, servicios), teléfonos con link a WhatsApp
- Mini-sección de 3 pilares de servicio al cliente (con íconos e imágenes)

### 7. Blog / Noticias
- 3 categorías de contenido (tabs animados): Noticias de actualidad, Consultas normativas, Publicaciones recientes
- Tarjetas de publicación (imagen + título + botón "Más información") que abren un modal/detalle animado (fade + scale in) con imagen grande, descripción completa, fecha y datos de contacto del autor invitado

### 8. Sección de cursos / formación (unidad de negocio educativa)
- Banner de bienvenida con logo de la unidad
- Texto institucional breve sobre la oferta de cursos y certificaciones
- Grid de tarjetas de cursos destacados (imagen + título + descripción corta + botón "Conoce más"), ejemplo de cursos: auditoría interna, inducción en seguridad laboral, formación para formadores
- CTA de inscripción destacado

### 9. Mapa de ubicación
- Mapa embebido (Google Maps) con marcador en la dirección de la oficina, con animación de entrada al hacer scroll

### 10. Aliados estratégicos / unidades de negocio (footer superior)
- Fila de logos de marcas o unidades relacionadas con links, hover animado

### 11. Footer
- Columna 1: identificación general / trayectoria (mensaje corto de años de experiencia)
- Columna 2: enlaces de interés (páginas institucionales o del sector relevantes al rubro)
- Columna 3: horario de atención
- Columna 4: "Acerca de" (Nosotros, Contáctenos)
- Columna 5: dirección física, correos de contacto por área, teléfonos con link directo a WhatsApp
- Íconos de redes sociales (Facebook, X/Twitter, Instagram, LinkedIn, Linktree, YouTube, TikTok) con hover animado
- Botón flotante de WhatsApp con animación de pulso
- Línea de copyright

---

## Guías generales de diseño
- Diseño responsive mobile-first
- Tarjetas con sombra suave y hover elevado para servicios, cursos y noticias
- Jerarquía tipográfica clara: hero grande y con peso, subtítulos medianos, cuerpo legible
- Espaciado generoso entre secciones para transmitir profesionalismo y orden visual
- Modo claro y modo oscuro usando la paleta de grises/negro definida arriba
- Accesibilidad: contraste adecuado, respetar `prefers-reduced-motion`, navegación por teclado en menús y acordeones
- [Aquí Felipe: agregar logo final, tipografía elegida y cualquier restricción adicional de marca]

---

**Nota:** este prompt reproduce la arquitectura de información, tipo de contenido y nivel de detalle de una página de referencia del mismo formato (consultoría de servicios con unidad educativa y blog), pero no copia textos literales, logos ni identidad visual — todo el copy final, nombres de secciones y detalles deben ajustarse a la marca nueva.