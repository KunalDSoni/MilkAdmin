'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { Role } from '@moderns-milk/contracts';
import { api } from './api';
import {
  clearTokens,
  decodeSession,
  getTokens,
  setTokens,
  type DecodedSession,
} from './tokens';

interface AuthState {
  session: DecodedSession | null;
  role: Role | null;
  ready: boolean;
  isAuthenticated: boolean;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<DecodedSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const tokens = getTokens();
    if (tokens?.accessToken) setSession(decodeSession(tokens.accessToken));
    setReady(true);
  }, []);

  const verifyOtp = useCallback(async (phone: string, code: string) => {
    const tokens = await api.auth.verifyOtp(phone, code);
    setTokens(tokens);
    setSession(decodeSession(tokens.accessToken));
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // Best-effort server revocation; always clear locally.
    }
    clearTokens();
    setSession(null);
    router.replace('/login');
  }, [router]);

  const value = useMemo<AuthState>(
    () => ({
      session,
      role: (session?.role as Role | undefined) ?? null,
      ready,
      isAuthenticated: Boolean(session),
      verifyOtp,
      logout,
    }),
    [session, ready, verifyOtp, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
