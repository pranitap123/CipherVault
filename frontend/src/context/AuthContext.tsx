import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "../api";
import type { Session, User } from "../types";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  setSessionExpired: () => void;
  sessionExpired: boolean;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setExpired] = useState(false);

  // On mount, try to restore the session (real backend: via refresh cookie).
  useEffect(() => {
    const restore = async () => {
      const raw = localStorage.getItem("sv_session");
      if (raw) {
        try {
          const s = JSON.parse(raw) as Session;
          setUser(s.user);
        } catch {
          localStorage.removeItem("sv_session");
        }
      }
      setLoading(false);
    };
    void restore();
  }, []);

  const persist = (s: Session) => {
    localStorage.setItem("sv_session", JSON.stringify(s));
    setUser(s.user);
    setExpired(false);
  };

  const login: AuthState["login"] = async (email, password) => {
    const res = await api.login(email, password);
    if (res.ok) {
      persist(res.data);
      return null;
    }
    return res.error.message;
  };

  const register: AuthState["register"] = async (name, email, password) => {
    const res = await api.register(name, email, password);
    if (res.ok) {
      persist(res.data);
      return null;
    }
    return res.error.message;
  };

  const logout = async () => {
    await api.logout();
    localStorage.removeItem("sv_session");
    setUser(null);
  };

  const setSessionExpired = () => {
    localStorage.removeItem("sv_session");
    setUser(null);
    setExpired(true);
  };

  return (
    <AuthCtx.Provider
      value={{ user, loading, login, register, logout, setSessionExpired, sessionExpired }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
