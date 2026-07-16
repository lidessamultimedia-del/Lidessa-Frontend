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
import ServicePage from '@/features/services/pages/ServicePage'
import ClientDashboard from '@/features/client-dashboard/pages/ClientDashboard'
import AdminDashboard from '@/features/admin-dashboard/pages/AdminDashboard'
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
          <Route path="/servicios/:slug" element={<ServicePage />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

function ProtectedRoute({ role, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  if (user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return <>{children}</>
}

export default function AppRoutes() {
  const [theme, setTheme] = useState('auto')

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      if (mq.matches) root.classList.add('dark')
      else root.classList.remove('dark')
    }
  }, [theme])

  return (
    <Routes>
      <Route path="/dashboard" element={
        <ProtectedRoute role="client">
          <ClientDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/*" element={<PublicLayout theme={theme} setTheme={setTheme} />} />
    </Routes>
  )
}
