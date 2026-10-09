// Las fotos de servicio pesan varios MB (se muestran a tamaño completo en la
// página pública) — para mostrarlas en miniatura (listas, previews de
// formulario) usamos una versión liviana pre-generada en /assets/thumbs en
// vez de cargar el archivo grande solo para mostrarlo en unos pocos px. Si
// no existe una miniatura local (ej. imágenes externas de Unsplash), se le
// pide al proveedor una versión pequeña por URL.
export function serviceThumbUrl(hero) {
  if (!hero) return hero
  if (hero.startsWith('data:')) return hero // recién subida (base64) — ya es lo que hay, nada que resolver
  if (/^https?:\/\//.test(hero)) return hero.replace(/([?&])w=\d+&h=\d+/, '$1w=160&h=128')
  const filename = hero.replace(/^\/assets\//, '').replace(/\.(png|jpe?g)$/i, '.jpg')
  return `/assets/thumbs/${filename}`
}
