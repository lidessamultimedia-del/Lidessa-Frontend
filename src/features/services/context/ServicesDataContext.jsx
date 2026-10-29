import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/context/AuthContext'
import {
  API_URL, toFileUrl,
  apiGetServices, apiGetAllServices, apiCreateService, apiUpdateService, apiDeleteService,
  apiGetServiceCategories, apiCreateServiceCategory, apiUpdateServiceCategory, apiDeleteServiceCategory,
} from '@/shared/lib/api'
import { BACKEND_LIVE } from '@/shared/lib/features'
import { servicesData as seedServices } from '../data/servicesData'

const ServicesDataContext = createContext(null)

// Categorías originales del sitio (cada una con tarjeta/imagen propia en
// "Nuestros Servicios", que las toma por posición). El admin puede agregar
// más desde el panel; esas nuevas quedan en la lista pero sin tarjeta curada
// en esa página.
export const SERVICE_CATEGORIES = [
  'Gestión empresarial',
  'Instituciones educativas',
  'Educación y formación',
  'Propiedades horizontales',
  'Supervisión e interventoría',
]

// Mientras el backend no está publicado (BACKEND_LIVE) o si la API no
// responde, el sitio público muestra los 16 servicios originales, para que
// /servicios nunca quede vacío.
const seedServiceList = () => seedServices.map(s => ({ active: true, locked: true, ...s }))
const seedCategoryList = () => SERVICE_CATEGORIES.map(name => ({ name, active: true }))

// El backend ordena por nombre; se reordena para que las 5 originales queden
// primero y en su orden (ServicesOverview les asigna imagen por posición).
function sortCategories(list) {
  const rank = c => {
    const i = SERVICE_CATEGORIES.indexOf(c.name)
    return i === -1 ? SERVICE_CATEGORIES.length : i
  }
  return [...list].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
}

// Las portadas originales son archivos del propio frontend (/assets/...) o
// URLs externas; solo las subidas por el admin (/uploads/...) viven en la API.
function heroDisplayUrl(path) {
  return path?.startsWith('/uploads/') ? toFileUrl(path) : (path ?? '')
}

// Inverso de heroDisplayUrl: lo que se guarda en la base es la ruta relativa.
function heroStoredPath(hero) {
  return hero?.startsWith(`${API_URL}/uploads/`) ? hero.slice(API_URL.length) : (hero || null)
}

// Traduce un Service del backend al shape que ya usan las páginas públicas y
// el panel de admin (`category` por nombre, `hero` lista para mostrar).
function fromApiService(s) {
  return {
    id: s.id,
    slug: s.slug,
    categoryId: s.categoryId,
    category: s.categoryName,
    title: s.title,
    description: s.description,
    hero: heroDisplayUrl(s.heroImageUrl),
    active: s.active,
    locked: s.locked,
    tabs: Array.isArray(s.tabs) ? s.tabs : [],
  }
}

function fromApiCategory(c) {
  return { id: c.id, name: c.name, active: c.active }
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
  const { user } = useAuth()
  const [services, setServices] = useState(seedServiceList)
  const [categories, setCategories] = useState(seedCategoryList)
  const [error, setError] = useState('')

  // El admin trae también los servicios inactivos; el público, solo los
  // activos y únicamente cuando el backend ya está publicado.
  const adminToken = user?.role === 'admin' ? user.token : null

  useEffect(() => {
    if (!adminToken && !BACKEND_LIVE) {
      setServices(seedServiceList())
      setCategories(seedCategoryList())
      return
    }
    let cancelled = false
    Promise.all([adminToken ? apiGetAllServices(adminToken) : apiGetServices(), apiGetServiceCategories()])
      .then(([serviceData, categoryData]) => {
        if (cancelled) return
        setServices(serviceData.map(fromApiService))
        setCategories(sortCategories(categoryData.map(fromApiCategory)))
        setError('')
      })
      .catch(err => { if (!cancelled) setError(err.message) }) // Se queda la lista que había (semilla).
    return () => { cancelled = true }
  }, [adminToken])

  function findCategory(name) {
    const category = categories.find(c => c.name === name)
    if (!category?.id) throw new Error('Categoría no encontrada')
    return category
  }

  function findService(slug) {
    const service = services.find(s => s.slug === slug)
    if (!service?.id) throw new Error('Servicio no encontrado')
    return service
  }

  function categoryPayload(category, changes) {
    return { name: category.name, active: category.active !== false, ...changes }
  }

  function servicePayload(service) {
    return {
      categoryId: findCategory(service.category).id,
      title: service.title.trim(),
      description: service.description?.trim() ?? '',
      heroImageUrl: heroStoredPath(service.hero),
      active: service.active !== false,
      locked: !!service.locked,
      tabs: service.tabs ?? [],
    }
  }

  function replaceService(updated) {
    setServices(prev => prev.map(s => (s.id === updated.id ? updated : s)))
    return updated
  }

  function replaceCategory(updated) {
    setCategories(prev => sortCategories(prev.map(c => (c.id === updated.id ? updated : c))))
    return updated
  }

  async function addCategory(name) {
    const clean = name.trim()
    if (!clean || categories.some(c => c.name.toLowerCase() === clean.toLowerCase())) return
    const created = fromApiCategory(await apiCreateServiceCategory({ name: clean, active: true }, adminToken))
    setCategories(prev => sortCategories([...prev, created]))
    return created
  }

  async function updateCategory(oldName, newName) {
    const clean = newName.trim()
    if (!clean || clean === oldName) return
    if (categories.some(c => c.name.toLowerCase() === clean.toLowerCase() && c.name !== oldName)) return
    const category = findCategory(oldName)
    const updated = replaceCategory(fromApiCategory(await apiUpdateServiceCategory(category.id, categoryPayload(category, { name: clean }), adminToken)))
    setServices(prev => prev.map(s => (s.categoryId === updated.id ? { ...s, category: updated.name } : s)))
    return updated
  }

  async function toggleCategoryActive(name) {
    const category = findCategory(name)
    return replaceCategory(fromApiCategory(await apiUpdateServiceCategory(category.id, categoryPayload(category, { active: category.active === false }), adminToken)))
  }

  async function deleteCategory(name) {
    const category = findCategory(name)
    await apiDeleteServiceCategory(category.id, adminToken)
    setCategories(prev => prev.filter(c => c.id !== category.id))
  }

  async function addService(data) {
    const { extraSections, ...rest } = data
    const draft = { active: true, ...rest, tabs: buildInfoTab(data.description, extraSections) }
    const created = fromApiService(await apiCreateService(servicePayload(draft), adminToken))
    setServices(prev => [created, ...prev])
    return created
  }

  async function updateService(slug, data) {
    const { extraSections, ...rest } = data
    const current = findService(slug)
    const draft = { ...current, ...rest }
    if (extraSections !== undefined) draft.tabs = buildInfoTab(data.description ?? current.description, extraSections)
    return replaceService(fromApiService(await apiUpdateService(current.id, servicePayload(draft), adminToken)))
  }

  async function deleteService(slug) {
    const service = findService(slug)
    await apiDeleteService(service.id, adminToken)
    setServices(prev => prev.filter(s => s.id !== service.id))
  }

  async function toggleServiceActive(slug) {
    const service = findService(slug)
    return replaceService(fromApiService(await apiUpdateService(service.id, servicePayload({ ...service, active: service.active === false }), adminToken)))
  }

  return (
    <ServicesDataContext.Provider value={{ services, error, addService, updateService, deleteService, toggleServiceActive, categories, addCategory, updateCategory, toggleCategoryActive, deleteCategory }}>
      {children}
    </ServicesDataContext.Provider>
  )
}

export function useServicesData() {
  const ctx = useContext(ServicesDataContext)
  if (!ctx) throw new Error('useServicesData must be used inside ServicesDataProvider')
  return ctx
}
