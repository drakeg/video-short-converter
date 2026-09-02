export type JwtPayload = Record<string, unknown> & { sub?: string; email?: string; name?: string; exp?: number };

type TokenResponse = { id_token?: string; access_token?: string; refresh_token?: string };

const STORAGE = { codeVerifier: "vsc_code_verifier", idToken: "vsc_id_token", accessToken: "vsc_access_token", refreshToken: "vsc_refresh_token" };
export const AUTH_CHANGED_EVENT = "vsc-auth-changed";
let refreshPromise: Promise<boolean> | null = null;

function getRequiredEnv(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Authentication is not configured: ${name} is missing.`);
  return value;
}

export function getAuthConfig() {
  return {
    cognitoDomain: getRequiredEnv(process.env.NEXT_PUBLIC_COGNITO_DOMAIN, "NEXT_PUBLIC_COGNITO_DOMAIN").replace(/\/$/, ""),
    clientId: getRequiredEnv(process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID, "NEXT_PUBLIC_COGNITO_CLIENT_ID"),
    redirectUri: getRequiredEnv(process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI, "NEXT_PUBLIC_COGNITO_REDIRECT_URI"),
    logoutUri: getRequiredEnv(process.env.NEXT_PUBLIC_COGNITO_LOGOUT_URI, "NEXT_PUBLIC_COGNITO_LOGOUT_URI"),
    profileApiBaseUrl: process.env.NEXT_PUBLIC_PROFILE_API_BASE_URL?.replace(/\/$/, "") || "",
  };
}

function emitAuthChanged() { if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_CHANGED_EVENT)); }
function base64UrlEncode(buffer: ArrayBuffer): string { const bytes = new Uint8Array(buffer); let binary = ""; bytes.forEach((byte) => (binary += String.fromCharCode(byte))); return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function randomString(byteLength = 64): string { const bytes = new Uint8Array(byteLength); crypto.getRandomValues(bytes); return base64UrlEncode(bytes.buffer); }
async function sha256(value: string): Promise<ArrayBuffer> { return crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)); }
function storeTokens(tokens: TokenResponse) { if (tokens.id_token) localStorage.setItem(STORAGE.idToken, tokens.id_token); if (tokens.access_token) localStorage.setItem(STORAGE.accessToken, tokens.access_token); if (tokens.refresh_token) localStorage.setItem(STORAGE.refreshToken, tokens.refresh_token); emitAuthChanged(); }
function clearSession() { Object.values(STORAGE).forEach((key) => localStorage.removeItem(key)); emitAuthChanged(); }

export async function login() {
  const config = getAuthConfig(); const verifier = randomString(64); const challenge = base64UrlEncode(await sha256(verifier)); localStorage.setItem(STORAGE.codeVerifier, verifier);
  const url = new URL(`${config.cognitoDomain}/oauth2/authorize`); url.searchParams.set("client_id", config.clientId); url.searchParams.set("response_type", "code"); url.searchParams.set("scope", "openid email profile"); url.searchParams.set("redirect_uri", config.redirectUri); url.searchParams.set("code_challenge_method", "S256"); url.searchParams.set("code_challenge", challenge); window.location.assign(url.toString());
}

export async function handleAuthCallback() {
  const config = getAuthConfig(); const params = new URLSearchParams(window.location.search); const code = params.get("code"); const error = params.get("error");
  if (error) throw new Error(params.get("error_description") || error); if (!code) throw new Error("Missing authorization code");
  const verifier = localStorage.getItem(STORAGE.codeVerifier); if (!verifier) throw new Error("Missing PKCE code verifier. Try signing in again.");
  const body = new URLSearchParams({ grant_type: "authorization_code", client_id: config.clientId, code, redirect_uri: config.redirectUri, code_verifier: verifier });
  const response = await fetch(`${config.cognitoDomain}/oauth2/token`, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  if (!response.ok) throw new Error(`Sign-in token exchange failed (${response.status}). Please try signing in again.`);
  storeTokens(await response.json() as TokenResponse); localStorage.removeItem(STORAGE.codeVerifier);
}

export function logout() { const config = getAuthConfig(); clearSession(); const url = new URL(`${config.cognitoDomain}/logout`); url.searchParams.set("client_id", config.clientId); url.searchParams.set("logout_uri", config.logoutUri); window.location.assign(url.toString()); }
export function getAccessToken(): string | null { return typeof window === "undefined" ? null : localStorage.getItem(STORAGE.accessToken); }
export function getIdToken(): string | null { return typeof window === "undefined" ? null : localStorage.getItem(STORAGE.idToken); }
export function decodeJwt(token: string): JwtPayload { const payload = token.split(".")[1]; if (!payload) throw new Error("Invalid token"); const normalized = payload.replace(/-/g, "+").replace(/_/g, "/"); const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "="); return JSON.parse(atob(padded)); }
function isExpired(token: string | null, skewSeconds = 30) { if (!token) return true; try { const exp = decodeJwt(token).exp; return !exp || exp * 1000 <= Date.now() + skewSeconds * 1000; } catch { return true; } }

export function getCurrentUser(): JwtPayload | null { const token = getIdToken(); if (!token || isExpired(token, 0)) return null; try { return decodeJwt(token); } catch { return null; } }

export async function refreshSession(): Promise<boolean> {
  if (typeof window === "undefined") return false; if (!isExpired(getAccessToken()) && !isExpired(getIdToken())) return true; if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem(STORAGE.refreshToken); if (!refreshToken) return false;
    try {
      const config = getAuthConfig(); const body = new URLSearchParams({ grant_type: "refresh_token", client_id: config.clientId, refresh_token: refreshToken });
      const response = await fetch(`${config.cognitoDomain}/oauth2/token`, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
      if (!response.ok) { clearSession(); return false; }
      storeTokens(await response.json() as TokenResponse); return Boolean(getAccessToken() && getIdToken());
    } catch { return false; } finally { refreshPromise = null; }
  })(); return refreshPromise;
}

export async function getValidAccessToken(): Promise<string | null> { if (isExpired(getAccessToken()) || isExpired(getIdToken())) { if (!await refreshSession()) return null; } return getAccessToken(); }

async function authenticatedProfileFetch(method: "GET" | "POST", profile?: { display_name?: string; youtube_channel?: string }) {
  const config = getAuthConfig(); if (!config.profileApiBaseUrl) throw new Error("Profile API is not configured."); const token = await getValidAccessToken(); if (!token) throw new Error("Your session expired. Please sign in again.");
  const response = await fetch(`${config.profileApiBaseUrl}/profile`, { method, headers: { authorization: `Bearer ${token}`, ...(profile ? { "content-type": "application/json" } : {}) }, ...(profile ? { body: JSON.stringify(profile) } : {}) });
  if (!response.ok) throw new Error(await response.text()); return response.json();
}
export async function fetchProfile() { return authenticatedProfileFetch("GET"); }
export async function saveProfile(profile: { display_name?: string; youtube_channel?: string }) { return authenticatedProfileFetch("POST", profile); }
