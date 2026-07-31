import { createContext, useContext, useState, useEffect } from 'react'
import { servicesData as seedServices } from '../data/servicesData'

const ServicesDataContext = createContext(null)
// v2: agrega el campo `locked` para proteger el contenido de los 16 servicios
// originales. Se cambia la clave para que las sesiones con datos de la v1
// (sin ese campo) reseeden en vez de quedar sin la protección.
const STORAGE_KEY = 'lidessa_services_data_v2'
const CATEGORIES_KEY = 'lidessa_service_categories'

// Categorías originales del sitio (cada una con tarjeta/imagen propia en
// "Nuestros Servicios"). El admin puede agregar más desde el panel; esas
// nuevas quedan en la lista pero sin tarjeta curada en esa página.
export const SERVICE_CATEGORIES = [
  'Gestión empresarial',
  'Instituciones educativas',
  'Educación y formación',
  'Propiedades horizontales',
  'Supervisión e interventoría',
]

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Arma la pestaña "Información general" con el mismo formato (encabezados +
// texto + viñetas doradas) que usan los 16 servicios originales, a partir de
// las secciones simples que arma el admin en el panel.
// La descripción ya se muestra en el encabezado, así que la pestaña solo
// incluye las secciones extra que arma el admin. Si no agregó ninguna, no
// se genera pestaña (para no repetir el mismo texto de nuevo abajo).
export function buildInfoTab(description, extraSections = []) {
  const sections = []
  for (const s of extraSections) {
    const section = {}
    if (s.heading?.trim()) section.heading = s.heading.trim()
    if (s.text?.trim()) section.text = s.text.trim()
    const bullets = (s.bullets ?? []).map(b => b.trim()).filter(Boolean).map(text => ({ label: '', text }))
    if (bullets.length > 0) section.bullets = bullets
    if (section.heading || section.text || section.bullets) sections.push(section)
  }
  if (sections.length === 0) return []
  return [{ label: 'Información general', sections }]
}

export function ServicesDataProvider({ children }) {
  const [services, setServices] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch {
      // ignore malformed data
    }
    return seedServices.map(s => ({ active: true, locked: true, ...s }))
  })
  const [categories, setCategories] = useState(() => {
    try {
      const stored = localStorage.getItem(CATEGORIES_KEY)
      if (stored) return JSON.parse(stored)
    } catch {
      // ignore malformed data
    }
    return SERVICE_CATEGORIES
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services))
  }, [services])

  useEffect(() => {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
  }, [categories])

  function addCategory(name) {
    const clean = name.trim()
    if (!clean) return
    setCategories(prev => prev.some(c => c.toLowerCase() === clean.toLowerCase()) ? prev : [...prev, clean])
  }

  function deleteCategory(name) {
    setCategories(prev => prev.filter(c => c !== name))
  }

  function addService(data) {
    let slug = slugify(data.title)
    if (services.some(s => s.slug === slug)) slug = `${slug}-${Date.now()}`
    const { extraSections, ...rest } = data
    const service = { active: true, ...rest, tabs: buildInfoTab(data.description, extraSections), slug }
    setServices(prev => [service, ...prev])
    return service
  }

  function updateService(slug, data) {
    const { extraSections, ...rest } = data
    setServices(prev => prev.map(s => {
      if (s.slug !== slug) return s
      const updated = { ...s, ...rest }
      if (extraSections !== undefined) updated.tabs = buildInfoTab(data.description ?? s.description, extraSections)
      return updated
    }))
  }

  function deleteService(slug) {
    setServices(prev => prev.filter(s => s.slug !== slug))
  }

  function toggleServiceActive(slug) {
    setServices(prev => prev.map(s => s.slug === slug ? { ...s, active: s.active === false ? true : false } : s))
  }

  return (
    <ServicesDataContext.Provider value={{ services, addService, updateService, deleteService, toggleServiceActive, categories, addCategory, deleteCategory }}>
      {children}
    </ServicesDataContext.Provider>
  )
}

export function useServicesData() {
  const ctx = useContext(ServicesDataContext)
  if (!ctx) throw new Error('useServicesData must be used inside ServicesDataProvider')
  return ctx
}
