import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
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
import AdminDashboard from '@/features/admin-dashboard/pages/AdminDashboard'
import Login from '@/features/auth/pages/Login'
import { useAuth } from '@/features/auth/context/AuthContext'

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

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

export default function AppRoutes() {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('lidessa_theme')
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('lidessa_theme', theme)
  }, [theme])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/*" element={<PublicLayout theme={theme} setTheme={setTheme} />} />
    </Routes>
  )
}
