import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../api/ApiError';
import * as authApi from '../api/auth';
import type { AuthUser } from '../api/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isAuthError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await authApi.me();
      setUser(response.user);
    } catch (error) {
      if (isAuthError(error)) {
        setUser(null);
        return;
      }
      throw error;
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      await authApi.login(username, password);
      await refresh();
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await refresh();
      } catch (error) {
        if (!cancelled && isAuthError(error)) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      refresh,
      login,
      logout,
    }),
    [user, isLoading, refresh, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return value;
}
