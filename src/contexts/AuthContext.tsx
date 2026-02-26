import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { authApi, tokenStore, type ApiUser } from "@/lib/api";

interface AuthState {
  user: ApiUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

interface AuthContextValue extends AuthState {
  login:    (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, district?: string) => Promise<void>;
  logout:   () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<ApiUser | null>(null);
  const [isLoading, setLoading] = useState(true);

  // On mount: if we have a stored token, fetch the current user
  useEffect(() => {
    const token = tokenStore.getAccess();
    if (!token) { setLoading(false); return; }

    authApi.me()
      .then((res) => setUser(res.data))
      .catch(() => tokenStore.clearTokens())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    tokenStore.setTokens(res.data.accessToken, res.data.refreshToken);
    setUser(res.data.user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, district?: string) => {
      const res = await authApi.register({ name, email, password, district });
      tokenStore.setTokens(res.data.accessToken, res.data.refreshToken);
      setUser(res.data.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    tokenStore.clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN" || user?.role === "SUPER_ADMIN",
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
