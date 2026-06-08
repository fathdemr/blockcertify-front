import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import { authApi, userApi } from '../services/api';

function toUser(data: Record<string, unknown>): User {
  const firstName = (data.FirstName ?? data.firstName ?? data.first_name ?? '') as string;
  const lastName  = (data.LastName  ?? data.lastName  ?? data.last_name  ?? '') as string;
  const email     = (data.Email     ?? data.email     ?? '') as string;
  const role      = (data.Role      ?? data.role      ?? 'admin') as User['role'];
  const id        = (data.ID ?? data.Id ?? data.id ?? 0) as number;
  const fullName  = `${firstName} ${lastName}`.trim() || (data.Name ?? data.name ?? '') as string;
  return { id, firstName, lastName, name: fullName || email, email, role };
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
        const parsed = JSON.parse(stored);
        // migrate old format that only had `name` field
        if (!parsed.firstName && parsed.name) {
          const [fn = '', ...rest] = (parsed.name as string).split(' ');
          parsed.firstName = fn;
          parsed.lastName = rest.join(' ');
        }
        setUserState(parsed);
      } catch {
        localStorage.removeItem('bc_user');
      }
    }
    refreshUser().finally(() => setLoading(false));
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
