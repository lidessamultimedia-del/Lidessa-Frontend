import { useState } from 'react'
import { useAuth } from '@/features/auth/context/AuthContext'
import { apiUploadAttachment } from '@/shared/lib/api'

// Reemplaza el viejo patrón de FileReader->base64 de los formularios de
// Suministros: ahora el archivo se sube de verdad al backend (mismo
// endpoint que usan adjuntos de lección/tarea) y lo que se guarda es la URL
// que devuelve, no el archivo completo codificado.
export function useFileUpload(maxBytes = 5 * 1024 * 1024) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)

  // Devuelve la URL subida, o null si hubo un error (ya reportado con onError).
  async function upload(file, onError) {
    if (!file) return null
    if (file.size > maxBytes) {
      onError(`La imagen no puede pesar más de ${Math.round(maxBytes / 1024 / 1024)} MB.`)
      return null
    }
    setUploading(true)
    try {
      const { url } = await apiUploadAttachment(file, user?.token)
      return url
    } catch (err) {
      onError(err.message)
      return null
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading }
}
