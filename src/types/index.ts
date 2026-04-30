export type TicketStatus = 'Open' | 'InProgress' | 'Completed' | 'Closed';
export type Priority = 'High' | 'Medium' | 'Low';
export type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'CNG' | 'Hybrid';
export type PolicyType = 'Comprehensive' | 'ThirdParty' | 'OwnDamage' | 'ZeroDep';
export type PaymentStatus = 'Pending' | 'Paid' | 'Partial' | 'Refunded';
export type InsuranceStatus = 'Active' | 'ExpiringSoon' | 'Expired' | 'Cancelled' | 'NewPolicy';

// ── Roles ─────────────────────────────────────────────────────────────────────
// Admin    → full access to everything including user management
// Employee → dashboard, tickets, board, analytics, calendar, all timesheets
// Agent    → timesheet only (own attendance entry)
export type UserRole = 'Admin' | 'Employee' | 'Agent';

export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  role: UserRole;
  branchId: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  city?: string;
  pincode?: string;
}

export interface Vehicle {
  id: string;
  registrationNo: string;
  make: string;
  model: string;
  year: number;
  fuelType: FuelType;
  engineCC?: number;
  chassisNo?: string;
  engineNo?: string;
  colour?: string;
  customerId: string;
}

export interface InsurancePolicy {
  id: string;
  insurer: string;
  policyNumber?: string;
  policyType: PolicyType;
  idv?: number;
  netPremium: number;
  gst: number;
  totalPremium: number;
  ncbPercent: number;
  startDate: string;
  expiryDate: string;
  renewalDate?: string;
  insuranceStatus: InsuranceStatus;
}

export interface TicketPayment {
  amount: number;
  paymentStatus: PaymentStatus;
  paymentMode?: string;
  transactionId?: string;
  paidAt?: string;
}

export interface TicketDocument {
  id: string;
  type: 'RC' | 'Insurance' | 'Other';
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  note?: string;
  performedByName: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  status: TicketStatus;
  priority: Priority;
  assignedToId?: string;
  assignedToName?: string;
  dueDate?: string;
  internalNotes?: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  vehicleId: string;
  vehicleRegNo: string;
  vehicleName: string;
  policy: InsurancePolicy;
  payment: TicketPayment;
  documents: TicketDocument[];
  activityLog: ActivityLog[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardKPIs {
  totalTickets: number;
  openTickets: number;
  expiringIn30Days: number;
  expiredPolicies: number;
  premiumCollected: number;
  pendingPayments: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface OTPResponse {
  success: boolean;
  sessionId: string;
  message: string;
}
