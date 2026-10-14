import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, Suspense, lazy } from 'react'
import Header from '@/shared/components/Header'
import Footer from '@/shared/components/Footer'
import WhatsAppButton from '@/shared/components/WhatsAppButton'
import Home from '@/features/home/pages/Home'
import About from '@/features/about/pages/About'
import Blog from '@/features/blog/pages/Blog'
import Store from '@/features/store/pages/Store'
import ClientStore from '@/features/supplies/pages/ClientStore'
import Training from '@/features/training/pages/Training'
import ServicesOverview from '@/features/services/pages/ServicesOverview'
import ServicePage from '@/features/services/pages/ServicePage'
import PrivacyPolicy from '@/features/about/pages/PrivacyPolicy'
import NotFound from '@/shared/components/NotFound'
import Login from '@/features/auth/pages/Login'
import Register from '@/features/auth/pages/Register'
import ForgotPassword from '@/features/auth/pages/ForgotPassword'
import { useAuth } from '@/features/auth/context/AuthContext'
import { COURSES_ENABLED, CATALOG_ENABLED, LOGIN_ENABLED } from '@/shared/lib/features'

// Los paneles de admin y LMS son la parte más pesada del bundle y solo los
// usan usuarios autenticados con esos roles — se cargan aparte para que un
// visitante público no descargue ese JS.
const AdminDashboard = lazy(() => import('@/features/admin-dashboard/pages/AdminDashboard'))
const TeacherDashboard = lazy(() => import('@/features/lms/pages/TeacherDashboard'))
const StudentDashboard = lazy(() => import('@/features/lms/pages/StudentDashboard'))

function PanelLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid var(--border)', borderTopColor: '#005187' }} />
    </div>
  )
}

function PublicLayout({ theme, setTheme }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <Header theme={theme} setTheme={setTheme} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/tienda" element={<Store />} />
          <Route path="/tienda/catalogo" element={<Navigate to="/tienda" replace />} />
          <Route path="/formacion" element={<Training />} />
          <Route path="/servicios" element={<ServicesOverview />} />
          <Route path="/servicios/:slug" element={<ServicePage />} />
          <Route path="/privacidad" element={<PrivacyPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

// `enabled`: mientras Cursos/Suministros no estén abiertos al público, la
// ruta redirige a inicio sin importar si hay una sesión válida — así nadie
// llega al panel real de estudiante/cliente mientras esa parte del sitio
// sigue en "Próximamente". LOGIN_ENABLED corta todos los paneles por igual
// (incluido admin/profesor) mientras el sitio es solo visual.
function ProtectedRoute({ roles, enabled = true, children }) {
  const { user, initialized } = useAuth()
  if (!initialized) return null
  if (!LOGIN_ENABLED || !enabled) return <Navigate to="/" replace />
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function AppRoutes() {
  const [theme, setTheme] = useState('system')

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      const isDark = theme === 'system' ? media.matches : theme === 'dark'
      root.classList.toggle('dark', isDark)
    }

    applyTheme()

    if (theme === 'system') {
      if (media.addEventListener) media.addEventListener('change', applyTheme)
      else media.addListener(applyTheme) // Safari < 14 fallback
      return () => {
        if (media.removeEventListener) media.removeEventListener('change', applyTheme)
        else media.removeListener(applyTheme)
      }
    }
  }, [theme])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <Suspense fallback={<PanelLoading />}>
            <AdminDashboard theme={theme} setTheme={setTheme} />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/profesor" element={
        <ProtectedRoute roles={['profesor']}>
          <Suspense fallback={<PanelLoading />}>
            <TeacherDashboard theme={theme} setTheme={setTheme} />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/estudiante" element={
        <ProtectedRoute roles={['estudiante']} enabled={COURSES_ENABLED}>
          <Suspense fallback={<PanelLoading />}>
            <StudentDashboard theme={theme} setTheme={setTheme} />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/tienda/cliente" element={
        <ProtectedRoute roles={['cliente']} enabled={CATALOG_ENABLED}>
          <ClientStore theme={theme} setTheme={setTheme} />
        </ProtectedRoute>
      } />
      <Route path="/*" element={<PublicLayout theme={theme} setTheme={setTheme} />} />
    </Routes>
  )
}
