import { getAuthOriginHandoffUrl, getValidAccessToken, handleAuthCallback, refreshSession } from '@/lib/auth';

const encode = (value: object) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const token = (exp: number) => `header.${encode({ sub: 'user', email: 'test@example.com', exp })}.signature`;

const env = process.env;
const fetchMock = jest.fn();

describe('auth session and PKCE handling', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
    fetchMock.mockReset();
    Object.defineProperty(globalThis, 'fetch', { value: fetchMock, configurable: true, writable: true });
    process.env = { ...env, NEXT_PUBLIC_COGNITO_DOMAIN: 'https://example.auth.us-east-1.amazoncognito.com', NEXT_PUBLIC_COGNITO_CLIENT_ID: 'client', NEXT_PUBLIC_COGNITO_REDIRECT_URI: 'http://localhost/auth/callback/', NEXT_PUBLIC_COGNITO_LOGOUT_URI: 'http://localhost/' };
    window.history.replaceState({}, '', '/');
  });
  afterAll(() => { process.env = env; });

  it('returns a current access token without refreshing', async () => {
    const current = token(Math.floor(Date.now() / 1000) + 3600);
    localStorage.setItem('vsc_access_token', current);
    localStorage.setItem('vsc_id_token', current);
    await expect(getValidAccessToken()).resolves.toBe(current);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refreshes expired tokens using the stored refresh token', async () => {
    const expired = token(Math.floor(Date.now() / 1000) - 60);
    const current = token(Math.floor(Date.now() / 1000) + 3600);
    localStorage.setItem('vsc_access_token', expired);
    localStorage.setItem('vsc_id_token', expired);
    localStorage.setItem('vsc_refresh_token', 'refresh-value');
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ access_token: current, id_token: current }), text: async () => '' });

    await expect(refreshSession()).resolves.toBe(true);
    expect(localStorage.getItem('vsc_access_token')).toBe(current);
    expect(localStorage.getItem('vsc_refresh_token')).toBe('refresh-value');
  });

  it('clears an unusable session when Cognito rejects refresh', async () => {
    const expired = token(Math.floor(Date.now() / 1000) - 60);
    localStorage.setItem('vsc_access_token', expired);
    localStorage.setItem('vsc_id_token', expired);
    localStorage.setItem('vsc_refresh_token', 'bad-refresh');
    fetchMock.mockResolvedValue({ ok: false, status: 400, json: async () => ({}), text: async () => 'invalid_grant' });

    await expect(refreshSession()).resolves.toBe(false);
    expect(localStorage.getItem('vsc_access_token')).toBeNull();
    expect(localStorage.getItem('vsc_refresh_token')).toBeNull();
  });

  it('creates an origin handoff when login starts on a different hostname', () => {
    expect(getAuthOriginHandoffUrl('https://video-short-converter.vercel.app/auth/callback/', 'https://preview.example')).toBe('https://video-short-converter.vercel.app/auth/callback/?auth_start=1');
    expect(getAuthOriginHandoffUrl('https://video-short-converter.vercel.app/auth/callback/', 'https://video-short-converter.vercel.app')).toBeNull();
  });

  it('exchanges a callback only with its matching state-bound verifier', async () => {
    const current = token(Math.floor(Date.now() / 1000) + 3600);
    localStorage.setItem('vsc_pkce_state-123', JSON.stringify({ verifier: 'verifier-123', redirectUri: 'http://localhost/auth/callback/', createdAt: Date.now() }));
    window.history.replaceState({}, '', '/auth/callback/?code=code-123&state=state-123');
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({ access_token: current, id_token: current, refresh_token: 'refresh-123' }) });

    await expect(handleAuthCallback()).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, request] = fetchMock.mock.calls[0];
    expect(String(request.body)).toContain('code_verifier=verifier-123');
    expect(String(request.body)).toContain('code=code-123');
    expect(localStorage.getItem('vsc_pkce_state-123')).toBeNull();
    expect(localStorage.getItem('vsc_refresh_token')).toBe('refresh-123');
  });

  it('rejects callbacks without OAuth state instead of using a global verifier', async () => {
    localStorage.setItem('vsc_code_verifier', 'legacy-verifier');
    window.history.replaceState({}, '', '/auth/callback/?code=code-123');
    await expect(handleAuthCallback()).rejects.toThrow('Missing OAuth state');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects callbacks whose state transaction is missing', async () => {
    window.history.replaceState({}, '', '/auth/callback/?code=code-123&state=unknown');
    await expect(handleAuthCallback()).rejects.toThrow('PKCE sign-in transaction was not found');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects expired PKCE transactions and removes them', async () => {
    localStorage.setItem('vsc_pkce_expired', JSON.stringify({ verifier: 'old', redirectUri: 'http://localhost/auth/callback/', createdAt: Date.now() - 11 * 60 * 1000 }));
    window.history.replaceState({}, '', '/auth/callback/?code=code-123&state=expired');
    await expect(handleAuthCallback()).rejects.toThrow('sign-in request expired');
    expect(localStorage.getItem('vsc_pkce_expired')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
