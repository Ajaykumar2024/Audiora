import { useContext } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'

export function RouteLoadingSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-label="Loading">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-400/20 border-t-emerald-400" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext) || {}
  const location = useLocation()

  if (loading) {
    return <RouteLoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children ? children : <Outlet />
}

export function ArtistRoute({ children }) {
  const { user, loading } = useContext(AuthContext) || {}
  const location = useLocation()

  if (loading) {
    return <RouteLoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user.role !== 'artist') {
    return <Navigate to="/" replace />
  }

  return children ? children : <Outlet />
}

export function GuestRoute({ children }) {
  const { user, loading } = useContext(AuthContext) || {}
  const location = useLocation()

  if (loading) {
    return <RouteLoadingSpinner />
  }

  if (user) {
    const rawFrom =
      location.state?.from?.pathname ||
      (typeof location.state?.from === 'string' ? location.state.from : null) ||
      '/'
    const destination = ['/login', '/register', '/signup'].includes(rawFrom)
      ? '/'
      : rawFrom

    return <Navigate to={destination} replace />
  }

  return children ? children : <Outlet />
}

export default {
  ProtectedRoute,
  ArtistRoute,
  GuestRoute,
  RouteLoadingSpinner,
}
