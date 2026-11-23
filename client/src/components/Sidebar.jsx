import { Fragment } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { sectionsWithLessons } from '../lib/catalog.js';

export default function Sidebar({ game }) {
  const { catalog } = useCatalog();
  const { user } = useAuth();

  return (
    <nav className="sidebar" aria-label={`${game.name} lessons`}>
      <Link to={`/games/${game.slug}`}>
        <strong>{game.name}</strong>
      </Link>
      {sectionsWithLessons(catalog, game)
        .filter(({ lessons }) => lessons.length > 0)
        .map(({ section, lessons }) => (
          <Fragment key={section.id}>
            <h2>{section.title}</h2>
            <ul>
              {lessons.map((lesson) => {
                const done = user?.completedLessons.includes(lesson.id);
                return (
                  <li key={lesson.id}>
                    <NavLink
                      to={`/games/${game.slug}/${lesson.slug}`}
                      className={({ isActive }) => [isActive && 'active', done && 'done'].filter(Boolean).join(' ') || undefined}
                    >
                      {lesson.title}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </Fragment>
        ))}
    </nav>
  );
}
