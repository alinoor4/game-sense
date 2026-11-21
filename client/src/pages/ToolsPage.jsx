import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { TOOLS } from '../lib/tools.js';

export default function ToolsPage() {
  usePageTitle('Tools');
  return (
    <div className="container stack">
      <h1>Tools</h1>
      <p className="muted">Try the idea right away. Everything runs in your browser.</p>
      <div className="grid">
        {TOOLS.map((tool) => (
          <Link key={tool.path} className="card" to={tool.path}>
            <h3>{tool.title}</h3>
            <p className="muted">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
