import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import SearchPalette from './SearchPalette.jsx';

// Header, footer and the <main> that every page renders into (through <Outlet />).
export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // A page opened from a link starts at the top ('instant': styles.css turns on smooth scrolling).
  // On Back and Forward the browser restores the earlier position after this runs.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  async function onLogout() {
    await logout();
    navigate('/');
  }

  return (
    <>
      <header className="site-header">
        <Link className="brand" to="/">
          Game<span>Sense</span>
        </Link>
        <nav className="site-nav" aria-label="Main">
          <NavLink to="/" end>
            Tracks
          </NavLink>
          <NavLink to="/tools">Tools</NavLink>
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <SearchPalette />
        {user ? (
          <>
            <span className="muted">{user.name}</span>
            <button type="button" className="btn btn-small" onClick={onLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link className="btn btn-small" to="/login">
              Log in
            </Link>
            <Link className="btn btn-small btn-primary" to="/register">
              Sign up
            </Link>
          </>
        )}
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        Game Sense is a Web Technologies course project. It is not affiliated with any game publisher.
      </footer>
    </>
  );
}
