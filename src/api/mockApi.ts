import type { Ticket, DashboardKPIs, PaginatedResponse, User, OTPResponse, AuthResponse } from '../types';
import { apiClient } from './api';

// ── Feature flag: use real backend when VITE_API_BASE_URL is set ──────────────
const USE_REAL_API = Boolean(import.meta.env.VITE_API_BASE_URL);

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

// ── Demo users (3 roles) ──────────────────────────────────────────────────────
// Login credentials (account tab):
//   admin@askus.com   / admin123   → Admin
//   employee@askus.com / emp123   → Employee
//   agent@askus.com   / agent123  → Agent
// Mobile OTP: any 6-digit code works

export const MOCK_USERS: Record<string, User> = {
  admin: {
    id: 'user-001', name: 'Rajesh Kumar', mobile: '+919800000001',
    email: 'admin@askus.com', role: 'Admin', branchId: 'branch-001',
  },
  employee: {
    id: 'user-002', name: 'Priya Sharma', mobile: '+919800000002',
    email: 'employee@askus.com', role: 'Employee', branchId: 'branch-001',
  },
  agent: {
    id: 'user-003', name: 'Karthik M', mobile: '+919800000003',
    email: 'agent@askus.com', role: 'Agent', branchId: 'branch-001',
  },
};

// Default for OTP login
export const MOCK_USER = MOCK_USERS.admin;

const MOCK_TICKETS: Ticket[] = [];

const MOCK_KPIS: DashboardKPIs = {
  totalTickets: 0, openTickets: 0, expiringIn30Days: 0,
  expiredPolicies: 0, premiumCollected: 0, pendingPayments: 0,
};

let tickets = [...MOCK_TICKETS];
let nextNum = 1;

// ── Credential map for account login ─────────────────────────────────────────
const CREDENTIALS: Record<string, { password: string; userKey: keyof typeof MOCK_USERS }> = {
  'admin@askus.com':    { password: 'admin123',  userKey: 'admin' },
  'employee@askus.com': { password: 'emp123',    userKey: 'employee' },
  'agent@askus.com':    { password: 'agent123',  userKey: 'agent' },
};

// ── Mock implementations ──────────────────────────────────────────────────────
const mockImpl = {
  sendOTP: async (_mobile: string): Promise<OTPResponse> => {
    await delay(600);
    return { success: true, sessionId: 'mock-session-' + Date.now(), message: 'OTP sent' };
  },

  verifyOTP: async (emailOrMobile: string, otpOrPassword: string, sessionId: string): Promise<AuthResponse> => {
    await delay(800);
    const cred = CREDENTIALS[emailOrMobile.toLowerCase()];
    if (cred) {
      // Account login: validate password
      if (otpOrPassword !== cred.password) throw new Error('Invalid credentials');
      return {
        token: 'mock-jwt-' + Date.now(),
        expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
        user: MOCK_USERS[cred.userKey],
      };
    }
    // Mobile OTP login — Firebase-verified or demo mock session
    if (sessionId && (sessionId.startsWith('mock-session-') || sessionId === 'firebase-verified')) {
      return {
        token: 'mock-jwt-' + Date.now(),
        expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
        user: MOCK_USERS.admin,
      };
    }
    throw new Error('Invalid email or password');
  },

  getKPIs: async (): Promise<DashboardKPIs> => { await delay(300); return MOCK_KPIS; },

  getExpiryAlerts: async (days = 30): Promise<Ticket[]> => {
    await delay(300);
    const cutoff = new Date(Date.now() + days * 86400000);
    return tickets.filter(t => new Date(t.policy.expiryDate) <= cutoff).slice(0, 8);
  },

  getMonthlyData: async () => { await delay(300); return []; },

  getTickets: async (params: { search?: string; status?: string; priority?: string; insurer?: string; page?: number; pageSize?: number; assignedToId?: string }): Promise<PaginatedResponse<Ticket>> => {
    await delay(350);
    let result = [...tickets];
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(t =>
        t.vehicleRegNo.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.ticketNumber.toLowerCase().includes(q) ||
        t.vehicleName.toLowerCase().includes(q)
      );
    }
    if (params.status)   result = result.filter(t => t.status === params.status);
    if (params.priority) result = result.filter(t => t.priority === params.priority);
    if (params.insurer)  result = result.filter(t => t.policy.insurer === params.insurer);
    if (params.assignedToId) result = result.filter(t => t.assignedToId === params.assignedToId);
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    return { data: result.slice((page - 1) * pageSize, page * pageSize), total: result.length, page, pageSize };
  },

  getTicketById: async (id: string): Promise<Ticket | null> => {
    await delay(250);
    return tickets.find(t => t.id === id) ?? null;
  },

  createTicket: async (data: Partial<Ticket>): Promise<Ticket> => {
    await delay(500);
    const ticket: Ticket = {
      id: 'tkt-' + Date.now(), ticketNumber: `TKT-00${nextNum++}`,
      title: data.title ?? 'New ticket', status: data.status ?? 'Open',
      priority: data.priority ?? 'Medium', assignedToName: data.assignedToName,
      customerId: data.customerId ?? '', customerName: data.customerName ?? '',
      customerMobile: data.customerMobile ?? '', vehicleId: data.vehicleId ?? '',
      vehicleRegNo: data.vehicleRegNo ?? '', vehicleName: data.vehicleName ?? '',
      internalNotes: data.internalNotes, dueDate: data.dueDate,
      policy: data.policy ?? { id: 'pol-' + Date.now(), insurer: '', policyType: 'Comprehensive', netPremium: 0, gst: 0, totalPremium: 0, ncbPercent: 0, startDate: '', expiryDate: '', insuranceStatus: 'Active' },
      payment: data.payment ?? { amount: 0, paymentStatus: 'Pending' },
      documents: [],
      activityLog: [{ id: 'log-' + Date.now(), action: 'created this ticket', performedByName: 'You', createdAt: new Date().toISOString() }],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    tickets.unshift(ticket);
    return ticket;
  },

  updateTicketStatus: async (id: string, status: string, note?: string): Promise<void> => {
    await delay(400);
    const t = tickets.find(t => t.id === id);
    if (t) {
      t.status = status as Ticket['status']; t.updatedAt = new Date().toISOString();
      t.activityLog.push({ id: 'log-' + Date.now(), action: `changed status to ${status}`, note, performedByName: 'You', createdAt: new Date().toISOString() });
    }
  },

  updateTicket: async (id: string, data: Partial<Ticket>): Promise<Ticket> => {
    await delay(500);
    const idx = tickets.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Ticket not found');
    tickets[idx] = { ...tickets[idx], ...data, updatedAt: new Date().toISOString() };
    tickets[idx].activityLog.push({ id: 'log-' + Date.now(), action: 'ticket updated', performedByName: 'You', createdAt: new Date().toISOString() });
    return tickets[idx];
  },

  updatePayment: async (id: string, paymentData: Partial<Ticket['payment']>): Promise<void> => {
    await delay(400);
    const t = tickets.find(t => t.id === id);
    if (t) {
      t.payment = { ...t.payment, ...paymentData };
      t.activityLog.push({ id: 'log-' + Date.now(), action: `payment updated — ${paymentData.paymentStatus}`, performedByName: 'You', createdAt: new Date().toISOString() });
    }
  },

  addComment: async (id: string, note: string): Promise<void> => {
    await delay(300);
    const t = tickets.find(t => t.id === id);
    if (t) t.activityLog.push({ id: 'log-' + Date.now(), action: 'added a comment', note, performedByName: 'You', createdAt: new Date().toISOString() });
  },

  uploadDocument: async (id: string, file: File, type: string): Promise<void> => {
    await delay(600);
    const t = tickets.find(t => t.id === id);
    if (t) {
      t.documents.push({ id: 'doc-' + Date.now(), type: type as 'RC' | 'Insurance' | 'Other', fileName: file.name, fileUrl: URL.createObjectURL(file), fileSizeBytes: file.size, uploadedAt: new Date().toISOString() });
      t.activityLog.push({ id: 'log-' + Date.now(), action: `uploaded ${type} copy`, performedByName: 'You', createdAt: new Date().toISOString() });
    }
  },

  deleteDocument: async (ticketId: string, docId: string): Promise<void> => {
    await delay(300);
    const t = tickets.find(t => t.id === ticketId);
    if (t) t.documents = t.documents.filter(d => d.id !== docId);
  },

  sendReminder: async (_ticketId: string): Promise<void> => { await delay(500); },
};

// ── Exported api — real backend when available, mock otherwise ────────────────
export const api: typeof mockImpl & {
  verifyOTP(email: string, password: string, sessionId: string): Promise<AuthResponse>;
} = USE_REAL_API
  ? {
      // Auth
      sendOTP: mockImpl.sendOTP,
      verifyOTP: (email: string, password: string, _sessionId: string) =>
        apiClient.login(email, password),

      // Dashboard
      getKPIs:         () => apiClient.getKPIs(),
      getExpiryAlerts: (days = 30) => apiClient.getExpiryAlerts(days),
      getMonthlyData:  () => apiClient.getMonthlyData(),

      // Tickets
      getTickets:          (params) => apiClient.getTickets(params),
      getTicketById:       (id) => apiClient.getTicketById(id),
      createTicket:        (data) => apiClient.createTicket(data),
      updateTicket:        (id, data) => apiClient.updateTicket(id, data),
      updateTicketStatus:  (id, status, note) => apiClient.updateTicketStatus(id, status, note),
      updatePayment:       (id, data) => apiClient.updatePayment(id, data),
      addComment:          (id, note) => apiClient.addComment(id, note),
      uploadDocument:      (id, file, type) => apiClient.uploadDocument(id, file, type),
      deleteDocument:      (ticketId, docId) => apiClient.deleteDocument(ticketId, docId),
      sendReminder:        (id) => apiClient.sendReminder(id),
    }
  : mockImpl;
