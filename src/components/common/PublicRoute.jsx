import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PublicRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center p-6 rounded-2xl shadow-lg bg-white">
          <p className="text-lg font-semibold text-slate-700">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/user'} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
