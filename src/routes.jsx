import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, Suspense, lazy } from 'react'
import Header from '@/shared/components/Header'
import Footer from '@/shared/components/Footer'
import WhatsAppButton from '@/shared/components/WhatsAppButton'
import Home from '@/features/home/pages/Home'
import About from '@/features/about/pages/About'
import Blog from '@/features/blog/pages/Blog'
import Store from '@/features/store/pages/Store'
import Training from '@/features/training/pages/Training'
import ServicesOverview from '@/features/services/pages/ServicesOverview'
import ServicePage from '@/features/services/pages/ServicePage'
import Login from '@/features/auth/pages/Login'
import Register from '@/features/auth/pages/Register'
import ForgotPassword from '@/features/auth/pages/ForgotPassword'
import { useAuth } from '@/features/auth/context/AuthContext'

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
          <Route path="/formacion" element={<Training />} />
          <Route path="/servicios" element={<ServicesOverview />} />
          <Route path="/servicios/:slug" element={<ServicePage />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

function ProtectedRoute({ roles, children }) {
  const { user, initialized } = useAuth()
  if (!initialized) return null
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function AppRoutes() {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('lidessa_theme')
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
    return 'system'
  })

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      const isDark = theme === 'system' ? media.matches : theme === 'dark'
      root.classList.toggle('dark', isDark)
    }

    applyTheme()
    localStorage.setItem('lidessa_theme', theme)

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
        <ProtectedRoute roles={['estudiante']}>
          <Suspense fallback={<PanelLoading />}>
            <StudentDashboard theme={theme} setTheme={setTheme} />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/*" element={<PublicLayout theme={theme} setTheme={setTheme} />} />
    </Routes>
  )
}
