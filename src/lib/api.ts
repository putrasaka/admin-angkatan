const TOKEN_KEY = 'admin_token';

export const getToken = (): string | null => sessionStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => sessionStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);

export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const res = await fetch(input, { ...init, headers });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // body bukan JSON — pakai pesan default
    }
    throw new Error(message);
  }
  return res;
}

export async function adminOp(body: unknown): Promise<void> {
  await authFetch('/api/admin', { method: 'POST', body: JSON.stringify(body) });
}
