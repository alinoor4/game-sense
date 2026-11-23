import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

// GETs `path` and returns { data, error, loading, reload }.
// Pass null as the path to skip the request (for example while a route param is not ready).
// `error` is an ApiError: show error.message.
export function useApi(path) {
  const [state, setState] = useState({ data: null, error: null, loading: Boolean(path) });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) {
      setState({ data: null, error: null, loading: false });
      return undefined;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    api('GET', path).then(
      (data) => {
        if (!cancelled) setState({ data, error: null, loading: false });
      },
      (error) => {
        if (!cancelled) setState({ data: null, error, loading: false });
      },
    );
    // ignore a response that arrives after the path changed or the page was left
    return () => {
      cancelled = true;
    };
  }, [path, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
