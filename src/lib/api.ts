const BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
const TOKEN_KEY = 'pp_token';

// Debug: log API URL em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('[API] Using BASE URL:', BASE || '(não configurado - usando /api)');
}

export type ApiUser = {
  id: string;
  nome: string;
  email: string;
  createdAt: string;
};

// Comunidades
export type Community = {
  slug: string;
  nome: string;
  descricao: string;
  membros: number;
  tags: string[];
  capa?: string;
};

function buildUrl(path: string) {
  if (path.startsWith('http')) return path;
  const base = BASE || '/api';
  const prefix = base.endsWith('/') ? base.slice(0, -1) : base;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${prefix}${suffix}`;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export async function api(path: string, init: RequestInit = {}) {
  const url = buildUrl(path);
  const headers = new Headers(init.headers || {});
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  return fetch(url, { ...init, headers, credentials: init.credentials ?? 'omit' });
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await api(path, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data?.error || 'Erro de requisição'), { status: res.status, data });
  return data as T;
}

export async function apiSignup(params: { nome: string; email: string; senha: string }) {
  const data = await request<{ ok: boolean; token?: string; user: ApiUser }>(`/auth/signup`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
  if (data?.token) setToken(data.token);
  return data.user;
}

export async function apiLogin(params: { email: string; senha: string }) {
  const payload = { email: params.email, senha: params.senha, password: params.senha };
  const data = await request<{ ok: boolean; token?: string; user?: ApiUser }>(`/auth/login`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (data?.token) setToken(data.token);
  if (!data?.user) throw new Error('login_failed');
  return data.user;
}

export async function apiLogout() {
  try {
    await request(`/auth/logout`, { method: 'POST' });
  } catch {}
  setToken(null);
}

export async function apiResetPasswordLookup(email: string): Promise<{ found: boolean }> {
  try {
    const data = await request<{ ok: boolean; found: boolean }>(`/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return { found: Boolean(data.found) };
  } catch (error: any) {
    if (error?.status === 404) {
      return { found: false };
    }
    throw error;
  }
}

export async function apiResetPasswordUpdate(params: { email: string; senha: string }) {
  await request(`/auth/reset-password`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function apiMe(): Promise<ApiUser | null> {
  try {
    const data = await request<{ ok: boolean; user: ApiUser | null }>(`/auth/me`, { method: 'GET' });
    return data.user ?? null;
  } catch {
    return null;
  }
}

export async function apiMyCommunities(): Promise<string[]> {
  try {
    const data = await request<{ communities: string[] }>(`/me/communities`, { method: 'GET' });
    return data.communities ?? [];
  } catch {
    return [];
  }
}

export async function apiJoinCommunity(slug: string) {
  await request(`/communities/${encodeURIComponent(slug)}/join`, { method: 'POST' });
}

export async function apiLeaveCommunity(slug: string) {
  await request(`/communities/${encodeURIComponent(slug)}/join`, { method: 'DELETE' });
}

export async function apiChangePassword(params: { current: string; next: string }) {
  await request(`/me/password`, { method: 'POST', body: JSON.stringify(params) });
}

// Quick login helpers
export async function apiCreateQuickToken(): Promise<{ token: string; expiresAt: string } | null> {
  try {
    const data = await request<{ ok: boolean; token: string; expiresAt: string }>(`/auth/quick-token`, { method: 'POST' });
    return { token: data.token, expiresAt: data.expiresAt };
  } catch {
    return null;
  }
}

export async function apiQuickLogin(token: string): Promise<ApiUser | null> {
  try {
    const data = await request<{ ok: boolean; user: ApiUser; token?: string }>(`/auth/login/quick`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    if (data?.token) setToken(data.token);
    return data.user;
  } catch {
    return null;
  }
}

export async function apiGetCommunities(): Promise<Community[]> {
  const data = await request<{ communities: Community[] }>(`/communities`, { method: 'GET' });
  return data.communities;
}

export async function apiGetCommunity(slug: string): Promise<Community | null> {
  try {
    const data = await request<{ community: Community }>(`/communities/${encodeURIComponent(slug)}`, { method: 'GET' });
    return data.community;
  } catch { return null; }
}

// Reservations & Orders
export type Reservation = {
  id: string;
  userId: string;
  destinoSlug: string;
  destinoNome: string;
  destinoImagem?: string;
  createdAt: string;
  ida: string;
  volta: string;
  pessoas: number;
  formaPagamento?: string;
  totalEstimado: number;
  status: 'pendente' | 'confirmada' | 'cancelada';
};

export type Order = {
  id: string;
  userId: string;
  reservationId?: string;
  destinoSlug: string;
  destinoNome: string;
  total: number;
  metodo: string;
  parcelas?: number;
  pagoEm: string;
};

export async function apiAddReservation(params: {
  destinoSlug: string;
  destinoNome: string;
  destinoImagem?: string;
  ida: string;
  volta: string;
  pessoas: number;
  formaPagamento?: string;
  totalEstimado: number;
}): Promise<Reservation> {
  const data = await request<{ ok: boolean; reservation: Reservation }>(`/reservations`, {
    method: 'POST', body: JSON.stringify(params)
  });
  return data.reservation;
}

export async function apiGetMyReservations(): Promise<Reservation[]> {
  const data = await request<{ reservations: Reservation[] }>(`/reservations/me`, { method: 'GET' });
  return data.reservations;
}

export async function apiGetReservationById(id: string): Promise<Reservation | null> {
  try {
    const data = await request<{ reservation: Reservation }>(`/reservations/${encodeURIComponent(id)}`, { method: 'GET' });
    return data.reservation;
  } catch { return null; }
}

export async function apiUpdateReservationStatus(id: string, status: Reservation['status']): Promise<Reservation> {
  const data = await request<{ ok: boolean; reservation: Reservation }>(`/reservations/${encodeURIComponent(id)}/status`, {
    method: 'PATCH', body: JSON.stringify({ status })
  });
  return data.reservation;
}

export async function apiMarkReservationPaid(params: { reservationId: string; metodo: string; parcelas?: number }): Promise<Order> {
  const data = await request<{ ok: boolean; order: Order }>(`/orders/mark-paid`, {
    method: 'POST', body: JSON.stringify(params)
  });
  return data.order;
}

export async function apiGetMyOrders(): Promise<Order[]> {
  const data = await request<{ orders: Order[] }>(`/orders/me`, { method: 'GET' });
  return data.orders;
}

export async function apiGetOrderById(id: string): Promise<Order | null> {
  try {
    const data = await request<{ order: Order }>(`/orders/${encodeURIComponent(id)}`, { method: 'GET' });
    return data.order;
  } catch { return null; }
}

export async function apiGetOrderByReservationId(reservationId: string): Promise<Order | null> {
  try {
    const data = await request<{ order: Order }>(`/orders/by-reservation/${encodeURIComponent(reservationId)}`, { method: 'GET' });
    return data.order;
  } catch { return null; }
}
