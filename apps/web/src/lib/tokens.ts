/**
 * Token storage. Only the short-lived access token is kept (localStorage, with
 * an in-memory mirror). The long-lived refresh token is NEVER stored in JS —
 * it lives in an httpOnly cookie the server sets, so an XSS cannot exfiltrate
 * it. On reload the access token is restored; once it expires, /auth/refresh
 * mints a new one using the cookie.
 */
const STORAGE_KEY = 'mm.auth.tokens';

interface StoredTokens {
  accessToken: string;
}

let cache: StoredTokens | null = null;

export function getTokens(): StoredTokens | null {
  if (cache) return cache;
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    cache = JSON.parse(raw) as StoredTokens;
    return cache;
  } catch {
    return null;
  }
}

export function setTokens(tokens: { accessToken: string }): void {
  cache = { accessToken: tokens.accessToken };
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
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
