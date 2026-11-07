import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedRoute() {
  const location = useLocation();
  const hasAdminSession = Boolean(sessionStorage.getItem('brito-admin-token'));

  if (!hasAdminSession) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}