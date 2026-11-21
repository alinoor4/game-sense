import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

// Route wrapper: anyone who is not an admin sees the normal "not found" page. The server enforces this again.
export default function RequireAdmin() {
  const { user, loading } = useAuth();
  if (loading) return <p className="container muted">Loading…</p>;
  if (user?.role !== 'admin') return <NotFoundPage />;
  return <Outlet />;
}
