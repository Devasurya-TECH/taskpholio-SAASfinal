import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import Spinner from './components/ui/Spinner'
import './styles/global.css'

const Login     = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Tasks     = lazy(() => import('./pages/Tasks'))
const Team      = lazy(() => import('./pages/Team'))
const Members   = lazy(() => import('./pages/Members'))
const Alerts    = lazy(() => import('./pages/Alerts'))
const Settings  = lazy(() => import('./pages/Settings'))

function ProtectedLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <TopBar />
        <div className="app-content">
          {children}
        </div>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <Spinner fullscreen />

  return (
    <Suspense fallback={<Spinner fullscreen />}>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
        {user ? (
          <>
            <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
            <Route path="/tasks"     element={<ProtectedLayout><Tasks /></ProtectedLayout>} />
            <Route path="/team"      element={<ProtectedLayout><Team /></ProtectedLayout>} />
            <Route path="/members"   element={<ProtectedLayout><Members /></ProtectedLayout>} />
            <Route path="/alerts"    element={<ProtectedLayout><Alerts /></ProtectedLayout>} />
            <Route path="/settings"  element={<ProtectedLayout><Settings /></ProtectedLayout>} />
            <Route path="*"          element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
