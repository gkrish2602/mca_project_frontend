import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import LoadingState from './components/common/LoadingState'
import ProtectedRoute from './features/auth/ProtectedRoute'
import ToastViewport from './components/common/ToastViewport'

const AuthPage = lazy(() => import('./features/auth/AuthPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const MeetingDetailPage = lazy(() => import('./pages/MeetingDetailPage'))
const MeetingsPage = lazy(() => import('./pages/MeetingsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const TasksPage = lazy(() => import('./pages/TasksPage'))

export default function App() {
  return (
    <>
      <Suspense fallback={<LoadingState label="Opening your workspace..." />}>
        <Routes>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="meetings" element={<MeetingsPage />} />
              <Route path="meetings/:id" element={<MeetingDetailPage />} />
              <Route path="tasks" element={<TasksPage />} />
            </Route>
          </Route>
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <ToastViewport />
    </>
  )
}
