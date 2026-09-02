import { getValidAccessToken, refreshSession } from '@/lib/auth';

const encode = (value: object) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const token = (exp: number) => `header.${encode({ sub: 'user', email: 'test@example.com', exp })}.signature`;

const env = process.env;
const fetchMock = jest.fn();

describe('auth session refresh', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
    fetchMock.mockReset();
    Object.defineProperty(globalThis, 'fetch', { value: fetchMock, configurable: true, writable: true });
    process.env = { ...env, NEXT_PUBLIC_COGNITO_DOMAIN: 'https://example.auth.us-east-1.amazoncognito.com', NEXT_PUBLIC_COGNITO_CLIENT_ID: 'client', NEXT_PUBLIC_COGNITO_REDIRECT_URI: 'http://localhost/auth/callback/', NEXT_PUBLIC_COGNITO_LOGOUT_URI: 'http://localhost/' };
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
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}), text: async () => 'invalid_grant' });

    await expect(refreshSession()).resolves.toBe(false);
    expect(localStorage.getItem('vsc_access_token')).toBeNull();
    expect(localStorage.getItem('vsc_refresh_token')).toBeNull();
  });
});
