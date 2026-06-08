import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import { authApi, userApi, setAuthToken } from '../services/api';

function toUser(data: Record<string, unknown>): User {
  const firstName = (data.firstName ?? '') as string;
  const lastName  = (data.lastName  ?? '') as string;
  const email     = (data.email     ?? '') as string;
  const role      = (data.role      ?? 'admin') as User['role'];
  const id        = (data.id        ?? '') as string;
  const fullName  = `${firstName} ${lastName}`.trim() || email;
  return { id, firstName, lastName, name: fullName, email, role };
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
    const data = res.data;
    // token varsa header'a set et (cookie çalışmasa da Bearer çalışır)
    const token = data.token ?? data.jwt ?? data.accessToken ?? null;
    if (token) setAuthToken(token);
    persistUser(toUser(data.user ?? data));
    // güncel profili API'den çek
    try {
      const me = await userApi.getMe();
      persistUser(toUser(me.data));
    } catch {
      // login response verisiyle devam et
    }
  };

  const logout = async () => {
    await authApi.logout().catch(() => {});
    setAuthToken(null);
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
