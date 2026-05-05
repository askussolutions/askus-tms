/**
 * Real API client — talks to the Express + MongoDB backend.
 * Falls back gracefully to the mock if VITE_API_BASE_URL is not set.
 */
import type {
  Ticket, DashboardKPIs, PaginatedResponse, AuthResponse, User,
} from '../types';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function getToken(): string | null {
  return sessionStorage.getItem('tms_token');
}

async function request<T>(
  method: string,
  endpoint: string,
  body?: unknown,
  isFormData = false,
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers,
    body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }

  const text = await res.text();
  return text ? JSON.parse(text) : undefined;
}

const get  = <T>(ep: string)                   => request<T>('GET',    ep);
const post = <T>(ep: string, b: unknown)       => request<T>('POST',   ep, b);
const put  = <T>(ep: string, b: unknown)       => request<T>('PUT',    ep, b);
const del  = <T>(ep: string)                   => request<T>('DELETE', ep);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const apiClient = {
  login: (email: string, password: string) =>
    post<AuthResponse>('/auth/login', { email, password }),

  register: (name: string, email: string, mobile: string, password: string, role: string) =>
    post<AuthResponse>('/auth/register', { name, email, mobile, password, role }),

  // ── Dashboard ──────────────────────────────────────────────────────────────
  getKPIs: () =>
    get<DashboardKPIs>('/dashboard/kpis'),

  getExpiryAlerts: (days = 60) =>
    get<Ticket[]>(`/dashboard/expiry-alerts?days=${days}`),

  getMonthlyData: () =>
    get<{ month: string; tickets: number; premium: number }[]>('/dashboard/monthly'),

  // ── Tickets ────────────────────────────────────────────────────────────────
  getTickets: (params: {
    search?: string; status?: string; priority?: string;
    insurer?: string; page?: number; pageSize?: number;
  }) => {
    const q = new URLSearchParams();
    if (params.search)   q.set('search',   params.search);
    if (params.status)   q.set('status',   params.status);
    if (params.priority) q.set('priority', params.priority);
    if (params.insurer)  q.set('insurer',  params.insurer);
    if (params.page)     q.set('page',     String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    return get<PaginatedResponse<Ticket>>(`/tickets?${q.toString()}`);
  },

  getTicketById: (id: string) =>
    get<Ticket | null>(`/tickets/${id}`),

  createTicket: (data: Partial<Ticket>) =>
    post<Ticket>('/tickets', data),

  updateTicket: (id: string, data: Partial<Ticket>) =>
    put<Ticket>(`/tickets/${id}`, data),

  updateTicketStatus: (id: string, status: string, note?: string) =>
    put<void>(`/tickets/${id}/status`, { status, note }),

  updatePayment: (id: string, paymentData: Partial<Ticket['payment']>) =>
    put<void>(`/tickets/${id}/payment`, paymentData),

  addComment: (id: string, note: string) =>
    post<void>(`/tickets/${id}/comment`, { note }),

  uploadDocument: async (id: string, file: File, type: string): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    await request<void>('POST', `/tickets/${id}/documents`, formData, true);
  },

  deleteDocument: (ticketId: string, docId: string) =>
    del<void>(`/tickets/${ticketId}/documents/${docId}`),

  sendReminder: (_ticketId: string): Promise<void> =>
    Promise.resolve(),

  // ── Users ──────────────────────────────────────────────────────────────────
  getUsers: () =>
    get<User[]>('/users'),

  // ── Timesheet ──────────────────────────────────────────────────────────────
  getTimesheet: (weekStart?: string) => {
    const q = weekStart ? `?weekStart=${weekStart}` : '';
    return get<unknown[]>(`/timesheet${q}`);
  },

  saveTimesheet: (weekStart: string, entries: { date: string; status: string; hours: number }[]) =>
    post<unknown>('/timesheet', { weekStart, entries }),

  // OTP (kept for compatibility — backend uses email/password only)
  sendOTP: (_mobile: string): Promise<{ success: boolean; sessionId: string; message: string }> =>
    Promise.resolve({ success: true, sessionId: 'n/a', message: 'Use email login' }),

  verifyOTP: (_mobile: string, _otp: string, _sessionId: string): Promise<AuthResponse> =>
    Promise.reject(new Error('Use email/password login')),
};

export default apiClient;
