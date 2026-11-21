import { createContext, useContext, useMemo } from 'react';
import { useApi } from '../hooks/useApi.js';

const CatalogContext = createContext(null);

// Loads GET /api/catalog once for the whole app. Admin pages call reload() after they change content.
export function CatalogProvider({ children }) {
  const { data, error, loading, reload } = useApi('/catalog');
  const value = useMemo(() => ({ catalog: data, error, loading, reload }), [data, error, loading, reload]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

// { catalog, error, loading, reload }. catalog is null until loaded.
export function useCatalog() {
  return useContext(CatalogContext);
}
