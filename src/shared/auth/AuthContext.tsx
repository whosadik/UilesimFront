import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../api/ApiError';
import * as authApi from '../api/auth';
import type { AuthUser } from '../api/auth';
import { getAdminHealth } from '../api/adminMetrics';

interface AuthContextValue {
  user: AuthUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  login: (username: string, password: string) => Promise<{ isAdmin: boolean }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isAuthError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

function hasAdminRole(user: AuthUser | null): boolean {
  if (!user) {
    return false;
  }

  if (user.is_admin || user.is_staff || user.is_superuser) {
    return true;
  }

  const directRole = [user.role, user.staff_role].find(
    (value) => typeof value === 'string' && value.trim(),
  );

  if (typeof directRole === 'string' && directRole.toLowerCase() === 'admin') {
    return true;
  }

  if (Array.isArray(user.roles)) {
    return user.roles.some((role) => typeof role === 'string' && role.toLowerCase() === 'admin');
  }

  return false;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const resolveAdminStatus = useCallback(async (nextUser: AuthUser | null): Promise<boolean> => {
    if (!nextUser) {
      return false;
    }

    if (hasAdminRole(nextUser)) {
      return true;
    }

    try {
      await getAdminHealth();
      return true;
    } catch (error) {
      if (isAuthError(error)) {
        return false;
      }
      return false;
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const response = await authApi.me();
      setUser(response.user);
      const nextIsAdmin = await resolveAdminStatus(response.user);
      setIsAdmin(nextIsAdmin);
      return nextIsAdmin;
    } catch (error) {
      if (isAuthError(error)) {
        setUser(null);
        setIsAdmin(false);
        return false;
      }
      throw error;
    }
  }, [resolveAdminStatus]);

  const refresh = useCallback(async () => {
    await refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async (username: string, password: string) => {
      await authApi.login(username, password);
      const nextIsAdmin = await refreshSession();
      return { isAdmin: nextIsAdmin };
    },
    [refreshSession],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await refreshSession();
      } catch (error) {
        if (!cancelled && isAuthError(error)) {
          setUser(null);
          setIsAdmin(false);
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
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAdmin,
      isLoading,
      refresh,
      login,
      logout,
    }),
    [user, isAdmin, isLoading, refresh, login, logout],
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
