import { createContext, useContext, useState, useEffect } from 'react'

const SiteSettingsContext = createContext(null)
const SETTINGS_KEY = 'lidessa_site_settings'

// Valores por defecto = lo que el footer mostraba antes de conectarse a este
// panel, para que activarlo no cambie nada visible hasta que el admin edite.
export const defaultSiteSettings = {
  phone: '+57 301 628 0574',
  email: 'comercial@lidessa.co',
  address: 'Cra. 71 #46-28, Laureles, Medellín, Antioquia',
  schedule: 'Lunes – Viernes: 7:00 a.m. – 4:30 p.m.',
}

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY)
      return stored ? { ...defaultSiteSettings, ...JSON.parse(stored) } : defaultSiteSettings
    } catch {
      return defaultSiteSettings
    }
  })

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  return (
    <SiteSettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext)
  if (!ctx) throw new Error('useSiteSettings must be used inside SiteSettingsProvider')
  return ctx
}
