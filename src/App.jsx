import { BrowserRouter } from 'react-router-dom'
import ToastContainer from '@/shared/components/ToastContainer'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { ToastProvider } from '@/shared/context/ToastContext'
import AppRoutes from './routes'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
          <ToastContainer />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
