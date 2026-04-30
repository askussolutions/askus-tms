import type { Ticket, DashboardKPIs, PaginatedResponse, User, OTPResponse, AuthResponse } from '../types';

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

const MOCK_TICKETS: Ticket[] = [
  {
    id: 'tkt-001', ticketNumber: 'TKT-0041', title: 'RC copy missing — TN40AE6775',
    status: 'Open', priority: 'High',
    assignedToId: 'user-002', assignedToName: 'Karthik S',
    dueDate: '2026-04-28T00:00:00Z',
    customerId: 'cust-001', customerName: 'Rajesh R', customerMobile: '+919800000001',
    vehicleId: 'veh-001', vehicleRegNo: 'TN40AE6775', vehicleName: 'Mahindra XUV3XO MX2 PRO',
    policy: {
      id: 'pol-001', insurer: 'HDFC Ergo', policyNumber: 'HDFC-2026-TN40AE6775',
      policyType: 'Comprehensive', idv: 920000,
      netPremium: 18400, gst: 3312, totalPremium: 21712, ncbPercent: 20,
      startDate: '2025-04-28', expiryDate: '2026-04-28',
      renewalDate: '2026-04-28', insuranceStatus: 'ExpiringSoon',
    },
    payment: { amount: 21712, paymentStatus: 'Pending' },
    documents: [
      { id: 'doc-001', type: 'RC', fileName: 'RC_TN40AE6775.pdf', fileUrl: '#', fileSizeBytes: 2100000, uploadedAt: '2026-04-18T11:32:00Z' },
    ],
    activityLog: [
      { id: 'log-001', action: 'created this ticket', performedByName: 'Karthik S', createdAt: '2026-04-18T11:32:00Z' },
    ],
    createdAt: '2026-04-18T11:32:00Z', updatedAt: '2026-04-18T14:45:00Z',
  },
  {
    id: 'tkt-002', ticketNumber: 'TKT-0040', title: 'Insurer follow-up pending',
    status: 'InProgress', priority: 'High',
    assignedToId: 'user-001', assignedToName: 'Rajesh Kumar',
    customerId: 'cust-002', customerName: 'Anand Raj', customerMobile: '+919700000002',
    vehicleId: 'veh-002', vehicleRegNo: 'TN07PQ5566', vehicleName: 'Tata Nexon',
    policy: {
      id: 'pol-002', insurer: 'Bajaj Allianz', policyType: 'Comprehensive',
      netPremium: 14200, gst: 2556, totalPremium: 16756, ncbPercent: 25,
      startDate: '2025-05-10', expiryDate: '2026-05-10', insuranceStatus: 'Active',
    },
    payment: { amount: 16756, paymentStatus: 'Paid', paymentMode: 'UPI', paidAt: '2026-04-15T10:00:00Z' },
    documents: [],
    activityLog: [
      { id: 'log-003', action: 'created this ticket', performedByName: 'Rajesh Kumar', createdAt: '2026-04-17T09:00:00Z' },
    ],
    createdAt: '2026-04-17T09:00:00Z', updatedAt: '2026-04-17T11:00:00Z',
  },
  {
    id: 'tkt-003', ticketNumber: 'TKT-0039', title: 'Insurance renewal due soon',
    status: 'Open', priority: 'Medium',
    assignedToId: 'user-003', assignedToName: 'Priya V',
    customerId: 'cust-003', customerName: 'Meena Devi', customerMobile: '+919400000003',
    vehicleId: 'veh-003', vehicleRegNo: 'KA05MN3421', vehicleName: 'Hyundai Creta',
    policy: {
      id: 'pol-003', insurer: 'Bajaj Allianz', policyType: 'Comprehensive',
      netPremium: 12000, gst: 2160, totalPremium: 14160, ncbPercent: 20,
      startDate: '2025-05-15', expiryDate: '2026-05-15', insuranceStatus: 'ExpiringSoon',
    },
    payment: { amount: 14160, paymentStatus: 'Pending' },
    documents: [],
    activityLog: [
      { id: 'log-005', action: 'created this ticket', performedByName: 'Priya V', createdAt: '2026-04-15T10:00:00Z' },
    ],
    createdAt: '2026-04-15T10:00:00Z', updatedAt: '2026-04-15T10:00:00Z',
  },
  {
    id: 'tkt-004', ticketNumber: 'TKT-0038', title: 'Policy verification with insurer',
    status: 'InProgress', priority: 'Medium',
    assignedToId: 'user-002', assignedToName: 'Karthik S',
    customerId: 'cust-004', customerName: 'Karthik S', customerMobile: '+919300000004',
    vehicleId: 'veh-004', vehicleRegNo: 'MH12AB7890', vehicleName: 'Maruti Swift',
    policy: {
      id: 'pol-004', insurer: 'New India Assurance', policyType: 'ThirdParty',
      netPremium: 4500, gst: 810, totalPremium: 5310, ncbPercent: 0,
      startDate: '2025-05-22', expiryDate: '2026-05-22', insuranceStatus: 'Active',
    },
    payment: { amount: 5310, paymentStatus: 'Paid', paymentMode: 'Cash', paidAt: '2026-04-10T10:00:00Z' },
    documents: [],
    activityLog: [
      { id: 'log-006', action: 'created this ticket', performedByName: 'Karthik S', createdAt: '2026-04-12T09:00:00Z' },
    ],
    createdAt: '2026-04-12T09:00:00Z', updatedAt: '2026-04-12T09:00:00Z',
  },
  {
    id: 'tkt-005', ticketNumber: 'TKT-0036', title: 'Renewal processed and paid',
    status: 'Completed', priority: 'Low',
    assignedToId: 'user-003', assignedToName: 'Priya V',
    customerId: 'cust-005', customerName: 'Priya V', customerMobile: '+919200000005',
    vehicleId: 'veh-005', vehicleRegNo: 'TN22BZ1100', vehicleName: 'Toyota Innova',
    policy: {
      id: 'pol-005', insurer: 'ICICI Lombard', policyType: 'Comprehensive',
      netPremium: 22000, gst: 3960, totalPremium: 25960, ncbPercent: 35,
      startDate: '2026-06-10', expiryDate: '2027-06-10', insuranceStatus: 'Active',
    },
    payment: { amount: 25960, paymentStatus: 'Paid', paymentMode: 'NEFT', transactionId: 'UTR123456789', paidAt: '2026-04-13T10:00:00Z' },
    documents: [],
    activityLog: [
      { id: 'log-007', action: 'created this ticket', performedByName: 'Priya V', createdAt: '2026-04-10T09:00:00Z' },
    ],
    createdAt: '2026-04-10T09:00:00Z', updatedAt: '2026-04-13T15:00:00Z',
  },
];

const MOCK_KPIS: DashboardKPIs = {
  totalTickets: 142, openTickets: 38, expiringIn30Days: 9,
  expiredPolicies: 4, premiumCollected: 2420000, pendingPayments: 680000,
};

let tickets = [...MOCK_TICKETS];
let nextNum = 42;

// ── Credential map for account login ─────────────────────────────────────────
const CREDENTIALS: Record<string, { password: string; userKey: keyof typeof MOCK_USERS }> = {
  'admin@askus.com':    { password: 'admin123',  userKey: 'admin' },
  'employee@askus.com': { password: 'emp123',    userKey: 'employee' },
  'agent@askus.com':    { password: 'agent123',  userKey: 'agent' },
};

export const api = {
  sendOTP: async (_mobile: string): Promise<OTPResponse> => {
    await delay(600);
    return { success: true, sessionId: 'mock-session-' + Date.now(), message: 'OTP sent' };
  },

  verifyOTP: async (emailOrMobile: string, otpOrPassword: string, _sessionId: string): Promise<AuthResponse> => {
    await delay(800);
    // Account login path
    const cred = CREDENTIALS[emailOrMobile.toLowerCase()];
    if (cred) {
      if (otpOrPassword !== cred.password) throw new Error('Invalid credentials');
      return {
        token: 'mock-jwt-' + Date.now(),
        expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
        user: MOCK_USERS[cred.userKey],
      };
    }
    // OTP path — defaults to Admin for demo
    return {
      token: 'mock-jwt-' + Date.now(),
      expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
      user: MOCK_USERS.admin,
    };
  },

  getKPIs: async (): Promise<DashboardKPIs> => { await delay(300); return MOCK_KPIS; },

  getExpiryAlerts: async (days = 30): Promise<Ticket[]> => {
    await delay(300);
    const cutoff = new Date(Date.now() + days * 86400000);
    return tickets.filter(t => new Date(t.policy.expiryDate) <= cutoff).slice(0, 8);
  },

  getMonthlyData: async () => {
    await delay(300);
    return [
      { month: 'Jan', tickets: 22, premium: 480000 },
      { month: 'Feb', tickets: 28, premium: 590000 },
      { month: 'Mar', tickets: 34, premium: 720000 },
      { month: 'Apr', tickets: 38, premium: 810000 },
    ];
  },

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
    if (params.status) result = result.filter(t => t.status === params.status);
    if (params.priority) result = result.filter(t => t.priority === params.priority);
    if (params.insurer) result = result.filter(t => t.policy.insurer === params.insurer);
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
