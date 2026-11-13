import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

// Holds the logged-in user (or null). `loading` is true until the first /auth/me call has finished.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('GET', '/auth/me')
      .then(
        (data) => setUser(data.user),
        () => setUser(null),
      )
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      // Pages call setUser(data.user) after any request that returns an updated user.
      setUser,
      async login(email, password) {
        const data = await api('POST', '/auth/login', { email, password });
        setUser(data.user);
        return data.user;
      },
      async register(name, email, password) {
        const data = await api('POST', '/auth/register', { name, email, password });
        setUser(data.user);
        return data.user;
      },
      async logout() {
        await api('POST', '/auth/logout');
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
