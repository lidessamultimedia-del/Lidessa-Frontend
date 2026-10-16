import { BrowserRouter } from 'react-router-dom'
import ToastContainer from '@/shared/components/ToastContainer'
import ScrollToTop from '@/shared/components/ScrollToTop'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { ToastProvider } from '@/shared/context/ToastContext'
import { BlogProvider } from '@/features/blog/context/BlogContext'
import { PQRSFProvider } from '@/features/pqrsf/context/PQRSFContext'
import { LMSProvider } from '@/features/lms/context/LMSContext'
import { ServicesDataProvider } from '@/features/services/context/ServicesDataContext'
import { SuppliesProvider } from '@/features/supplies/context/SuppliesContext'
import { SiteSettingsProvider } from '@/shared/context/SiteSettingsContext'
import AppRoutes from './routes'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
        <AuthProvider>
          <BlogProvider>
            <PQRSFProvider>
              <LMSProvider>
                <ServicesDataProvider>
                  <SuppliesProvider>
                    <SiteSettingsProvider>
                      <AppRoutes />
                      <ToastContainer />
                    </SiteSettingsProvider>
                  </SuppliesProvider>
                </ServicesDataProvider>
              </LMSProvider>
            </PQRSFProvider>
          </BlogProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
