import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import { authApi, userApi } from '../services/api';

function toUser(data: Record<string, unknown>): User {
  const firstName = (data.firstName ?? data.first_name ?? '') as string;
  const lastName = (data.lastName ?? data.last_name ?? '') as string;
  return {
    id: data.id as number,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim() || (data.name as string) || 'Admin',
    email: data.email as string,
    role: data.role as User['role'],
  };
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (u: User) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const persistUser = (u: User) => {
    setUserState(u);
    localStorage.setItem('bc_user', JSON.stringify(u));
  };

  const refreshUser = useCallback(async () => {
    try {
      const res = await userApi.getMe();
      persistUser(toUser(res.data));
    } catch {
      // token expired or no session — keep existing state
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('bc_user');
    if (stored) {
      try {
        setUserState(JSON.parse(stored));
      } catch {
        localStorage.removeItem('bc_user');
      }
    }
    setLoading(false);
    // fetch fresh data from API on mount
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const raw = res.data.user ?? res.data;
    persistUser(toUser(raw));
    // fetch full profile after login
    try {
      const me = await userApi.getMe();
      persistUser(toUser(me.data));
    } catch {
      // fallback to login response data
    }
  };

  const logout = async () => {
    await authApi.logout().catch(() => {});
    setUserState(null);
    localStorage.removeItem('bc_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      refreshUser,
      setUser: persistUser,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
