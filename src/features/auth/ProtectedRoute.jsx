import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { useGetMeQuery } from '../../services/api'
import LoadingState from '../../components/common/LoadingState'
import { ErrorToast } from '../../components/common/Feedback'

export default function ProtectedRoute() {
  const session = useAppSelector((state) => state.auth.session)
  const { isLoading, isError, error, refetch } = useGetMeQuery(undefined, { skip: !session })

  if (!session) return <Navigate to="/login" replace />
  if (isLoading) return <LoadingState label="Checking your session..." />
  if (isError) {
    if (error.status === 401) return <Navigate to="/login" replace />
    return <div className="auth-screen"><ErrorToast error={error} onRetry={refetch} /></div>
  }
  return <Outlet />
}
