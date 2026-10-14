// Aviso de privacidad / tratamiento de datos personales, exigido por la Ley
// 1581 de 2012 (Habeas Data) — el sitio recoge nombre, documento, dirección,
// teléfono y correo en el registro y en Suministros.
const SECTIONS = [
  {
    heading: '1. Responsable del tratamiento',
    body: 'Lidessa (en adelante, "Lidessa" o "nosotros") es responsable del tratamiento de los datos personales que usted suministra a través de este sitio web, de acuerdo con la Ley 1581 de 2012 y sus decretos reglamentarios.',
  },
  {
    heading: '2. Datos que recogemos',
    body: 'Según el formulario que use, podemos recoger: nombre completo, número de documento, dirección, teléfono, correo electrónico, y la información que usted incluya voluntariamente en mensajes, PQRSF o pedidos.',
  },
  {
    heading: '3. Finalidad del tratamiento',
    body: 'Usamos sus datos para: crear y administrar su cuenta, procesar pedidos de V2 Suministros y coordinar su entrega, inscribirlo en cursos de formación, responder sus solicitudes, quejas y reclamos (PQRSF), y comunicarnos con usted sobre el estado de sus trámites.',
  },
  {
    heading: '4. Derechos del titular',
    body: 'Como titular de sus datos, usted tiene derecho a conocer, actualizar, rectificar y solicitar la eliminación de su información, así como a revocar la autorización otorgada para su tratamiento, en los casos en que la ley lo permita.',
  },
  {
    heading: '5. Cómo ejercer sus derechos',
    body: 'Puede escribirnos a administrativo@lidessa.com indicando su solicitud y los datos que permitan identificarlo. Atenderemos su solicitud dentro de los términos establecidos por la ley.',
  },
  {
    heading: '6. Seguridad de la información',
    body: 'Adoptamos medidas razonables, técnicas y administrativas para proteger sus datos personales contra acceso no autorizado, pérdida o uso indebido.',
  },
]

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14" style={{ color: 'var(--foreground)' }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--primary)' }}>Lidessa</p>
      <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'var(--font-display)' }}>
        Aviso de privacidad y tratamiento de datos
      </h1>
      <p className="text-sm mb-10" style={{ color: 'var(--muted-foreground)' }}>
        De acuerdo con la Ley 1581 de 2012 (Habeas Data) de Colombia.
      </p>

      <div className="space-y-8">
        {SECTIONS.map(s => (
          <div key={s.heading}>
            <h2 className="text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
              {s.heading}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
