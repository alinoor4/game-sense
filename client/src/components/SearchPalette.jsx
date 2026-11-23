import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext.jsx';
import { searchLessons } from '../lib/catalog.js';

// The header's Search button plus the palette it opens. Ctrl+K (or Cmd+K) opens it from anywhere.
// Uses the native <dialog>, which traps focus and closes on Escape by itself.
export default function SearchPalette() {
  const dialogRef = useRef(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const { catalog } = useCatalog();
  const navigate = useNavigate();

  const results = useMemo(() => (catalog ? searchLessons(catalog, query) : []), [catalog, query]);
  const pathOf = ({ lesson, game }) => `/games/${game.slug}/${lesson.slug}`;

  function open() {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    setQuery('');
    setActive(0);
    dialog.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  useEffect(() => {
    function onKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        open();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function onInputKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter' && results[active]) {
      event.preventDefault();
      close();
      navigate(pathOf(results[active]));
    }
  }

  return (
    <>
      <button type="button" className="btn btn-small" onClick={open}>
        Search <kbd>Ctrl</kbd> <kbd>K</kbd>
      </button>
      {/* a click on the backdrop lands on the dialog element itself */}
      <dialog ref={dialogRef} className="palette" aria-label="Search lessons" onClick={(e) => e.target === dialogRef.current && close()}>
        <label className="sr-only" htmlFor="palette-input">
          Search lessons
        </label>
        <input
          id="palette-input"
          type="search"
          placeholder="Search lessons…"
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onInputKeyDown}
        />
        <ul role="listbox" aria-label="Results">
          {results.map((result, i) => (
            <li key={result.lesson.id} role="option" aria-selected={i === active}>
              <Link to={pathOf(result)} onClick={close}>
                <strong>{result.lesson.title}</strong> <span className="badge">{result.game.name}</span>
                <br />
                <span className="muted">{result.lesson.summary}</span>
              </Link>
            </li>
          ))}
          {query.trim() && results.length === 0 && <li className="muted">No lessons match “{query.trim()}”.</li>}
        </ul>
      </dialog>
    </>
  );
}
