import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/context/AuthContext'
import { apiGetSiteSettings, apiUpdateSiteSettings } from '@/shared/lib/api'
import { BACKEND_LIVE } from '@/shared/lib/features'

const SiteSettingsContext = createContext(null)

// Valores por defecto = lo que el footer mostraba antes de conectarse a este
// panel, para que activarlo no cambie nada visible hasta que el admin edite.
// También se usan mientras el backend no está publicado (BACKEND_LIVE) o si
// la API no responde, para que el footer nunca quede vacío.
export const defaultSiteSettings = {
  phone: '+57 333 237 1006',
  email: 'administrativo@lidessa.com',
  address: 'Cra. 71 #46-28, Laureles, Medellín, Antioquia',
  schedule: 'Lunes – Viernes: 7:00 a.m. – 4:30 p.m.',
}

// Un campo vacío en la base (fila recién creada) cae al valor por defecto.
function fromApiSettings(s) {
  return {
    phone: s?.phone || defaultSiteSettings.phone,
    email: s?.email || defaultSiteSettings.email,
    address: s?.address || defaultSiteSettings.address,
    schedule: s?.schedule || defaultSiteSettings.schedule,
  }
}

export function SiteSettingsProvider({ children }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState(defaultSiteSettings)

  useEffect(() => {
    if (!BACKEND_LIVE) return
    let cancelled = false
    apiGetSiteSettings()
      .then(data => { if (!cancelled) setSettings(fromApiSettings(data)) })
      .catch(() => {}) // Se quedan los valores por defecto.
    return () => { cancelled = true }
  }, [])

  // Sin backend publicado el cambio solo vive en esta sesión del navegador.
  async function saveSettings(form) {
    const payload = {
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      schedule: form.schedule.trim(),
    }
    const saved = BACKEND_LIVE ? fromApiSettings(await apiUpdateSiteSettings(payload, user?.token)) : payload
    setSettings(saved)
    return saved
  }

  return (
    <SiteSettingsContext.Provider value={{ settings, saveSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext)
  if (!ctx) throw new Error('useSiteSettings must be used inside SiteSettingsProvider')
  return ctx
}
