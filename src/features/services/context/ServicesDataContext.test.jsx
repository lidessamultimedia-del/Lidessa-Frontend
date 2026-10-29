import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import * as api from '@/shared/lib/api'
import { serviceThumbUrl } from '../utils/thumbnail'
import { ServicesDataProvider, useServicesData, buildInfoTab } from './ServicesDataContext'

// Las llamadas a la API quedan como vi.fn(); API_URL y toFileUrl son los reales.
vi.mock('@/shared/lib/api', async importOriginal => {
  const actual = await importOriginal()
  const mocked = { ...actual }
  for (const key of Object.keys(actual)) if (key.startsWith('api')) mocked[key] = vi.fn()
  return mocked
})

let auth
vi.mock('@/features/auth/context/AuthContext', () => ({ useAuth: () => auth }))

let backendLive
vi.mock('@/shared/lib/features', () => ({ get BACKEND_LIVE() { return backendLive } }))

const TOKEN = 'jwt-de-prueba'
const admin = { id: '1', role: 'admin', token: TOKEN }

// ── Respuestas del backend (shape de los DTOs de Lidessa.Api) ──
const apiCategories = [
  { id: 3, name: 'Asesoría jurídica', active: true },
  { id: 1, name: 'Educación y formación', active: true },
  { id: 2, name: 'Gestión empresarial', active: false },
]
const apiTabs = [{ label: 'ISO', sections: [{ heading: '¿Qué es ISO?', text: 'Norma' }] }]
const apiServices = [
  {
    id: 10, slug: 'gestion-de-calidad', categoryId: 2, categoryName: 'Gestión empresarial', title: 'Gestión de Calidad',
    description: 'Desc', heroImageUrl: '/assets/Ips.jpg', active: true, locked: true, tabs: apiTabs,
  },
  {
    id: 11, slug: 'contratos', categoryId: 3, categoryName: 'Asesoría jurídica', title: 'Contratos',
    description: 'Desc 2', heroImageUrl: '/uploads/attachments/foto.jpg', active: false, locked: false, tabs: [],
  },
]

function mockBackend({ services = apiServices, categories = apiCategories } = {}) {
  api.apiGetServices.mockResolvedValue(services.filter(s => s.active))
  api.apiGetAllServices.mockResolvedValue(services)
  api.apiGetServiceCategories.mockResolvedValue(categories)
}

function renderServices() {
  return renderHook(() => useServicesData(), { wrapper: ServicesDataProvider })
}

// Monta el contexto como admin y espera a que llegue la lista de la API.
async function renderAdmin() {
  auth = { user: admin }
  const hook = renderServices()
  await waitFor(() => expect(hook.result.current.services.some(s => s.id === 10)).toBe(true))
  return hook
}

beforeEach(() => {
  vi.clearAllMocks()
  auth = { user: null }
  backendLive = false
  mockBackend()
})

describe('carga inicial', () => {
  it('sin backend publicado ni admin muestra la semilla y no llama a la API', () => {
    const { result } = renderServices()

    expect(api.apiGetServices).not.toHaveBeenCalled()
    expect(api.apiGetServiceCategories).not.toHaveBeenCalled()
    expect(result.current.services).toHaveLength(16)
    expect(result.current.services.every(s => s.active && s.locked)).toBe(true)
    expect(result.current.categories.map(c => c.name)).toEqual([
      'Gestión empresarial', 'Instituciones educativas', 'Educación y formación', 'Propiedades horizontales', 'Supervisión e interventoría',
    ])
  })

  it('con backend publicado el público trae solo los activos', async () => {
    backendLive = true
    const { result } = renderServices()

    await waitFor(() => expect(result.current.services.map(s => s.slug)).toEqual(['gestion-de-calidad']))
    expect(api.apiGetServices).toHaveBeenCalledTimes(1)
    expect(api.apiGetAllServices).not.toHaveBeenCalled()
  })

  it('traduce los servicios del backend al shape de la UI', async () => {
    const { result } = await renderAdmin()

    expect(result.current.services.find(s => s.id === 10)).toEqual({
      id: 10, slug: 'gestion-de-calidad', categoryId: 2, category: 'Gestión empresarial', title: 'Gestión de Calidad',
      description: 'Desc', hero: '/assets/Ips.jpg', active: true, locked: true, tabs: apiTabs,
    })
    // Las portadas subidas viven en la API; las de /assets son del frontend.
    expect(result.current.services.find(s => s.id === 11).hero).toBe(`${api.API_URL}/uploads/attachments/foto.jpg`)
  })

  it('ordena las categorías originales primero y las nuevas al final', async () => {
    const { result } = await renderAdmin()

    expect(result.current.categories).toEqual([
      { id: 2, name: 'Gestión empresarial', active: false },
      { id: 1, name: 'Educación y formación', active: true },
      { id: 3, name: 'Asesoría jurídica', active: true },
    ])
  })

  it('el admin trae también los inactivos aunque el backend no esté publicado', async () => {
    const { result } = await renderAdmin()

    expect(api.apiGetAllServices).toHaveBeenCalledWith(TOKEN)
    expect(api.apiGetServices).not.toHaveBeenCalled()
    expect(result.current.services).toHaveLength(2)
  })

  it('si la API falla se queda la semilla y expone el error', async () => {
    backendLive = true
    api.apiGetServices.mockRejectedValue(new Error('No se pudo conectar con el servidor.'))
    const { result } = renderServices()

    await waitFor(() => expect(result.current.error).toBe('No se pudo conectar con el servidor.'))
    expect(result.current.services).toHaveLength(16)
  })

  it('al cerrar la sesión del admin vuelve a la semilla', async () => {
    const hook = await renderAdmin()

    auth = { user: null }
    hook.rerender()

    await waitFor(() => expect(hook.result.current.services).toHaveLength(16))
    expect(hook.result.current.categories).toHaveLength(5)
  })
})

describe('servicios (admin)', () => {
  it('crea un servicio con la categoría por Id y la pestaña armada', async () => {
    const { result } = await renderAdmin()
    api.apiCreateService.mockResolvedValue({
      id: 12, slug: 'nuevo', categoryId: 1, categoryName: 'Educación y formación', title: 'Nuevo',
      description: 'Algo', heroImageUrl: '/uploads/attachments/n.jpg', active: true, locked: false, tabs: [],
    })

    await act(() => result.current.addService({
      title: ' Nuevo ', category: 'Educación y formación', hero: '/uploads/attachments/n.jpg', description: ' Algo ',
      extraSections: [{ heading: 'Alcance', text: '', bullets: ['Uno', ' '] }],
    }))

    expect(api.apiCreateService).toHaveBeenCalledWith({
      categoryId: 1, title: 'Nuevo', description: 'Algo', heroImageUrl: '/uploads/attachments/n.jpg', active: true, locked: false,
      tabs: [{ label: 'Información general', sections: [{ heading: 'Alcance', bullets: [{ label: '', text: 'Uno' }] }] }],
    }, TOKEN)
    expect(result.current.services[0].slug).toBe('nuevo')
  })

  it('al editar sin tocar las secciones conserva las pestañas y guarda la ruta relativa de la portada', async () => {
    const { result } = await renderAdmin()
    api.apiUpdateService.mockResolvedValue({ ...apiServices[1], title: 'Contratos 2' })
    const current = result.current.services.find(s => s.id === 11)

    await act(() => result.current.updateService('contratos', { title: 'Contratos 2', hero: current.hero }))

    expect(api.apiUpdateService).toHaveBeenCalledWith(11, expect.objectContaining({
      categoryId: 3, title: 'Contratos 2', heroImageUrl: '/uploads/attachments/foto.jpg', active: false, tabs: [],
    }), TOKEN)
    expect(result.current.services.find(s => s.id === 11).title).toBe('Contratos 2')
  })

  it('al editar con secciones reemplaza las pestañas', async () => {
    const { result } = await renderAdmin()
    api.apiUpdateService.mockResolvedValue(apiServices[0])

    await act(() => result.current.updateService('gestion-de-calidad', { description: 'Desc', extraSections: [] }))

    expect(api.apiUpdateService.mock.calls[0][1].tabs).toEqual([])
    expect(api.apiUpdateService.mock.calls[0][1].locked).toBe(true)
  })

  it('activar/desactivar manda el servicio completo con el estado invertido', async () => {
    const { result } = await renderAdmin()
    api.apiUpdateService.mockResolvedValue({ ...apiServices[0], active: false })

    await act(() => result.current.toggleServiceActive('gestion-de-calidad'))

    expect(api.apiUpdateService).toHaveBeenCalledWith(10, {
      categoryId: 2, title: 'Gestión de Calidad', description: 'Desc', heroImageUrl: '/assets/Ips.jpg',
      active: false, locked: true, tabs: apiTabs,
    }, TOKEN)
    expect(result.current.services.find(s => s.id === 10).active).toBe(false)
  })

  it('elimina por Id y lo quita de la lista', async () => {
    const { result } = await renderAdmin()
    api.apiDeleteService.mockResolvedValue(null)

    await act(() => result.current.deleteService('contratos'))

    expect(api.apiDeleteService).toHaveBeenCalledWith(11, TOKEN)
    expect(result.current.services.some(s => s.id === 11)).toBe(false)
  })

  it('si el backend rechaza el borrado, el error sube y la lista no cambia', async () => {
    const { result } = await renderAdmin()
    api.apiDeleteService.mockRejectedValue(new Error('Este servicio es contenido protegido y no se puede eliminar'))

    await expect(act(() => result.current.deleteService('gestion-de-calidad'))).rejects.toThrow('contenido protegido')
    expect(result.current.services).toHaveLength(2)
  })

  it('falla sin llamar a la API si la categoría no existe', async () => {
    const { result } = await renderAdmin()

    await expect(act(() => result.current.addService({ title: 'X', category: 'Inexistente', hero: '/assets/a.jpg', description: 'D' })))
      .rejects.toThrow('Categoría no encontrada')
    expect(api.apiCreateService).not.toHaveBeenCalled()
  })
})

describe('categorías (admin)', () => {
  it('crea una categoría y la deja ordenada', async () => {
    const { result } = await renderAdmin()
    api.apiCreateServiceCategory.mockResolvedValue({ id: 4, name: 'Ambiental', active: true })

    await act(() => result.current.addCategory(' Ambiental '))

    expect(api.apiCreateServiceCategory).toHaveBeenCalledWith({ name: 'Ambiental', active: true }, TOKEN)
    expect(result.current.categories.map(c => c.name)).toEqual(['Gestión empresarial', 'Educación y formación', 'Ambiental', 'Asesoría jurídica'])
  })

  it('no llama a la API si el nombre ya existe (sin importar mayúsculas)', async () => {
    const { result } = await renderAdmin()

    await act(() => result.current.addCategory('asesoría JURÍDICA'))

    expect(api.apiCreateServiceCategory).not.toHaveBeenCalled()
  })

  it('al renombrar actualiza también la categoría de sus servicios', async () => {
    const { result } = await renderAdmin()
    api.apiUpdateServiceCategory.mockResolvedValue({ id: 3, name: 'Jurídica', active: true })

    await act(() => result.current.updateCategory('Asesoría jurídica', 'Jurídica'))

    expect(api.apiUpdateServiceCategory).toHaveBeenCalledWith(3, { name: 'Jurídica', active: true }, TOKEN)
    expect(result.current.services.find(s => s.id === 11).category).toBe('Jurídica')
  })

  it('activa una categoría inactiva', async () => {
    const { result } = await renderAdmin()
    api.apiUpdateServiceCategory.mockResolvedValue({ id: 2, name: 'Gestión empresarial', active: true })

    await act(() => result.current.toggleCategoryActive('Gestión empresarial'))

    expect(api.apiUpdateServiceCategory).toHaveBeenCalledWith(2, { name: 'Gestión empresarial', active: true }, TOKEN)
    expect(result.current.categories.find(c => c.id === 2).active).toBe(true)
  })

  it('elimina una categoría', async () => {
    const { result } = await renderAdmin()
    api.apiDeleteServiceCategory.mockResolvedValue(null)

    await act(() => result.current.deleteCategory('Educación y formación'))

    expect(api.apiDeleteServiceCategory).toHaveBeenCalledWith(1, TOKEN)
    expect(result.current.categories.some(c => c.id === 1)).toBe(false)
  })
})

describe('utilidades', () => {
  it('buildInfoTab omite secciones vacías y no genera pestaña si no queda ninguna', () => {
    expect(buildInfoTab('Desc', [{ heading: ' ', text: '', bullets: [''] }])).toEqual([])
    expect(buildInfoTab('Desc', [{ heading: 'H', text: ' T ', bullets: [] }]))
      .toEqual([{ label: 'Información general', sections: [{ heading: 'H', text: 'T' }] }])
  })

  it('serviceThumbUrl resuelve cada tipo de portada', () => {
    expect(serviceThumbUrl('/assets/Ips.png')).toBe('/assets/thumbs/Ips.jpg')
    expect(serviceThumbUrl('/uploads/attachments/f.jpg')).toBe(`${api.API_URL}/uploads/attachments/f.jpg`)
    expect(serviceThumbUrl(`${api.API_URL}/uploads/attachments/f.jpg`)).toBe(`${api.API_URL}/uploads/attachments/f.jpg`)
    expect(serviceThumbUrl('https://images.unsplash.com/p?w=1400&h=600&fit=crop')).toBe('https://images.unsplash.com/p?w=160&h=128&fit=crop')
  })
})
