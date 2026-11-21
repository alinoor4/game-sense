import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { useCatalog } from './context/CatalogContext.jsx';
import Layout from './components/Layout.jsx';
import Markdown from './components/Markdown.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// STARTER PLACEHOLDER. Phase 2 replaces this whole file with the real route table (plan/04-frontend-core.md).
// It only proves that the client can reach the API, load the catalog and render Markdown.
function StarterCheck() {
  const { user, loading: authLoading } = useAuth();
  const { catalog, loading, error } = useCatalog();
  return (
    <div className="container stack">
      <h1>Game Sense starter</h1>
      <p>Account: {authLoading ? 'checking…' : user ? user.email : 'not logged in'}</p>
      {loading && <p className="muted">Loading…</p>}
      {error && (
        <p className="alert alert-error" role="alert">
          {error.message}
        </p>
      )}
      {catalog && (
        <p className="alert alert-ok" role="status">
          Catalog loaded: {catalog.games.length} games, {catalog.lessons.length} lessons, {catalog.maps.length} maps.
        </p>
      )}
      <Markdown>{'Press `key:A` then `key:D`.\n\n```\nsv_cheats 1\n```'}</Markdown>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<StarterCheck />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
