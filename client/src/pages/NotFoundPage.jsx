import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function NotFoundPage() {
  usePageTitle('Page not found');
  return (
    <div className="container stack">
      <h1>Page not found</h1>
      <p className="muted">That page does not exist, or you do not have access to it.</p>
      <Link className="btn btn-primary" to="/">
        Back to the tracks
      </Link>
    </div>
  );
}
