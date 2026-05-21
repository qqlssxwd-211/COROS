import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { loginCoros } from '../lib/corosClient';
import type { CorosCredentials, AuthState } from '../types/coros';

interface AuthContextType extends AuthState {
  login: (creds: CorosCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    userId: null,
    userName: null,
    region: 'cn',
    isLoggedIn: false,
  });

  const login = useCallback(async (creds: CorosCredentials) => {
    const { accessToken, userId } = await loginCoros(creds);
    setState({
      accessToken,
      userId,
      userName: creds.email,
      region: creds.region,
      isLoggedIn: true,
    });
  }, []);

  const logout = useCallback(() => {
    setState({
      accessToken: null,
      userId: null,
      userName: null,
      region: 'cn',
      isLoggedIn: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
