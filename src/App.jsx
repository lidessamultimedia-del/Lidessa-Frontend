import { BrowserRouter } from 'react-router-dom'
import ToastContainer from '@/shared/components/ToastContainer'
import ScrollToTop from '@/shared/components/ScrollToTop'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { ToastProvider } from '@/shared/context/ToastContext'
import { BlogProvider } from '@/features/blog/context/BlogContext'
import AppRoutes from './routes'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
        <AuthProvider>
          <BlogProvider>
            <AppRoutes />
            <ToastContainer />
          </BlogProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
