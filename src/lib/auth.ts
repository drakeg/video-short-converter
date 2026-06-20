export type JwtPayload = Record<string, unknown> & {
  sub?: string;
  email?: string;
  name?: string;
  exp?: number;
};

const STORAGE = {
  codeVerifier: "vsc_code_verifier",
  idToken: "vsc_id_token",
  accessToken: "vsc_access_token",
  refreshToken: "vsc_refresh_token",
};

function getRequiredEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getAuthConfig() {
  return {
    cognitoDomain: getRequiredEnv(
      process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
      "NEXT_PUBLIC_COGNITO_DOMAIN"
    ).replace(/\/$/, ""),

    clientId: getRequiredEnv(
      process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
      "NEXT_PUBLIC_COGNITO_CLIENT_ID"
    ),

    redirectUri: getRequiredEnv(
      process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI,
      "NEXT_PUBLIC_COGNITO_REDIRECT_URI"
    ),

    logoutUri: getRequiredEnv(
      process.env.NEXT_PUBLIC_COGNITO_LOGOUT_URI,
      "NEXT_PUBLIC_COGNITO_LOGOUT_URI"
    ),

    profileApiBaseUrl:
      process.env.NEXT_PUBLIC_PROFILE_API_BASE_URL?.replace(/\/$/, "") || "",
  };
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomString(byteLength = 64): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes.buffer);
}

async function sha256(value: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
}

export async function login() {
  const config = getAuthConfig();
  const verifier = randomString(64);
  const challenge = base64UrlEncode(await sha256(verifier));
  localStorage.setItem(STORAGE.codeVerifier, verifier);

  const url = new URL(`${config.cognitoDomain}/oauth2/authorize`);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("code_challenge", challenge);

  window.location.assign(url.toString());
}

export async function handleAuthCallback() {
  const config = getAuthConfig();
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const error = params.get("error");

  if (error) {
    throw new Error(params.get("error_description") || error);
  }

  if (!code) {
    throw new Error("Missing authorization code");
  }

  const verifier = localStorage.getItem(STORAGE.codeVerifier);
  if (!verifier) {
    throw new Error("Missing PKCE code verifier. Try signing in again.");
  }

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("client_id", config.clientId);
  body.set("code", code);
  body.set("redirect_uri", config.redirectUri);
  body.set("code_verifier", verifier);

  const response = await fetch(`${config.cognitoDomain}/oauth2/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token exchange failed: ${text}`);
  }

  const tokens = await response.json();
  localStorage.setItem(STORAGE.idToken, tokens.id_token);
  localStorage.setItem(STORAGE.accessToken, tokens.access_token);
  if (tokens.refresh_token) {
    localStorage.setItem(STORAGE.refreshToken, tokens.refresh_token);
  }
  localStorage.removeItem(STORAGE.codeVerifier);
}

export function logout() {
  const config = getAuthConfig();
  Object.values(STORAGE).forEach((key) => localStorage.removeItem(key));

  const url = new URL(`${config.cognitoDomain}/logout`);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("logout_uri", config.logoutUri);

  window.location.assign(url.toString());
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE.accessToken);
}

export function getIdToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE.idToken);
}

export function decodeJwt(token: string): JwtPayload {
  const payload = token.split(".")[1];
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return JSON.parse(atob(padded));
}

export function getCurrentUser(): JwtPayload | null {
  const token = getIdToken();
  if (!token) return null;

  try {
    const payload = decodeJwt(token);
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function fetchProfile() {
  const config = getAuthConfig();
  const token = getAccessToken();
  if (!config.profileApiBaseUrl) throw new Error("Profile API is not configured.");
  if (!token) throw new Error("Not signed in.");

  const response = await fetch(`${config.profileApiBaseUrl}/profile`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function saveProfile(profile: { display_name?: string; youtube_channel?: string }) {
  const config = getAuthConfig();
  const token = getAccessToken();
  if (!config.profileApiBaseUrl) throw new Error("Profile API is not configured.");
  if (!token) throw new Error("Not signed in.");

  const response = await fetch(`${config.profileApiBaseUrl}/profile`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(profile),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
