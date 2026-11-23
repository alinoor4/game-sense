import { useEffect } from 'react';

// Sets the browser tab title. Call it at the top of every page component.
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Game Sense` : 'Game Sense';
  }, [title]);
}
