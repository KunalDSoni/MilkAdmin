import type { AuthTokens } from '@moderns-milk/contracts';

/**
 * Token storage. Access + refresh tokens live in localStorage so the session
 * survives reloads; an in-memory mirror avoids redundant reads on hot paths.
 * The server remains the source of truth for authorization — these are only
 * carried as a Bearer credential.
 */
const STORAGE_KEY = 'mm.auth.tokens';

let cache: AuthTokens | null = null;

export function getTokens(): AuthTokens | null {
  if (cache) return cache;
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    cache = JSON.parse(raw) as AuthTokens;
    return cache;
  } catch {
    return null;
  }
}

export function setTokens(tokens: AuthTokens): void {
  cache = tokens;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  }
}

export function clearTokens(): void {
  cache = null;
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export interface DecodedSession {
  sub: string;
  role: string;
  distributorId?: string;
  retailerId?: string;
  exp?: number;
}

/** Decode (not verify) the JWT payload for UI gating only. */
export function decodeSession(accessToken: string): DecodedSession | null {
  try {
    const part = accessToken.split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as DecodedSession;
  } catch {
    return null;
  }
}
