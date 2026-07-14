import { useEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { I18nProvider } from './lib/i18n'
import { ThemeProvider } from './lib/theme'
import { AuthProvider, useAuth } from './lib/auth'
import { StoreProvider } from './lib/store'
import { Landing } from './pages/Landing'
import { Login } from './pages/auth/Login'
import { Onboarding } from './pages/auth/Onboarding'
import { AppShell } from './components/app/AppShell'
import { Jobs } from './pages/app/Jobs'
import { JobDetail } from './pages/app/JobDetail'
import { Propose } from './pages/app/Propose'
import { Bravo } from './pages/app/Bravo'
import { Proposals } from './pages/app/Proposals'
import { Contracts } from './pages/app/Contracts'
import { Messages } from './pages/app/Messages'
import { Alerts } from './pages/app/Alerts'
import { Profile } from './pages/app/Profile'
import { Hiring } from './pages/app/Hiring'
import { Candidates } from './pages/app/Candidates'
import { LegalPage } from './pages/legal/LegalPage'
import { NotFound } from './pages/NotFound'

/** Reset scroll on route change (anchors within a page still work). */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

/** Employers land on hiring, students on the job feed. */
function AppIndexRedirect() {
  const { session } = useAuth()
  return (
    <Navigate to={session?.role === 'employer' ? 'hiring' : 'jobs'} replace />
  )
}

/** Gate for /app routes: needs a session, and a chosen role. */
function RequireAuth() {
  const { session, loading } = useAuth()
  const location = useLocation()

  // Wait for the Supabase session restore before deciding anything.
  if (loading) return null
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (!session.role) {
    return <Navigate to="/onboarding" replace />
  }
  return <Outlet />
}

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <StoreProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/onboarding" element={<Onboarding />} />

                <Route element={<RequireAuth />}>
                  <Route path="/app" element={<AppShell />}>
                    <Route index element={<AppIndexRedirect />} />
                    <Route path="jobs" element={<Jobs />} />
                    <Route path="jobs/:id" element={<JobDetail />} />
                    <Route path="jobs/:id/propose" element={<Propose />} />
                    <Route path="bravo" element={<Bravo />} />
                    <Route path="proposals" element={<Proposals />} />
                    <Route path="contracts" element={<Contracts />} />
                    <Route path="messages" element={<Messages />} />
                    <Route path="alerts" element={<Alerts />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="hiring" element={<Hiring />} />
                    <Route path="candidates" element={<Candidates />} />
                  </Route>
                </Route>

                <Route path="/impressum" element={<LegalPage page="impressum" />} />
                <Route path="/datenschutz" element={<LegalPage page="datenschutz" />} />
                <Route path="/agb" element={<LegalPage page="agb" />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </StoreProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}

export default App
