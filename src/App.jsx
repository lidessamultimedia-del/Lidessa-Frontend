import { BrowserRouter } from 'react-router-dom'
import ToastContainer from '@/shared/components/ToastContainer'
import ScrollToTop from '@/shared/components/ScrollToTop'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { ToastProvider } from '@/shared/context/ToastContext'
import { BlogProvider } from '@/features/blog/context/BlogContext'
import { PQRSFProvider } from '@/features/pqrsf/context/PQRSFContext'
import AppRoutes from './routes'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
        <AuthProvider>
          <BlogProvider>
            <PQRSFProvider>
              <AppRoutes />
              <ToastContainer />
            </PQRSFProvider>
          </BlogProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
