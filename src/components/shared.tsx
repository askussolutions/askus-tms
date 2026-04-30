import { Tag } from 'antd';
import type { TicketStatus, Priority, InsuranceStatus, PaymentStatus } from '../types';

// ── Status badge ─────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<TicketStatus, string> = {
  Open: 'blue', InProgress: 'orange', Completed: 'green', Closed: 'default',
};
const STATUS_LABEL: Record<TicketStatus, string> = {
  Open: 'Open', InProgress: 'In progress', Completed: 'Completed', Closed: 'Closed',
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <Tag color={STATUS_COLOR[status]}>{STATUS_LABEL[status]}</Tag>;
}

// ── Priority tag ─────────────────────────────────────────────────────────────
const PRIORITY_COLOR: Record<Priority, string> = { High: 'red', Medium: 'orange', Low: 'green' };

export function PriorityTag({ priority }: { priority: Priority }) {
  return <Tag color={PRIORITY_COLOR[priority]}>{priority}</Tag>;
}

// ── Expiry tag ───────────────────────────────────────────────────────────────
export function ExpiryTag({ date }: { date: string }) {
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  const color = days < 0 ? 'red' : days <= 10 ? 'red' : days <= 30 ? 'orange' : days <= 60 ? 'blue' : 'green';
  const label = days < 0 ? `Expired ${Math.abs(days)}d ago` : `${days}d left`;
  return <Tag color={color}>{label}</Tag>;
}

// ── Insurance status ─────────────────────────────────────────────────────────
const INS_COLOR: Record<InsuranceStatus, string> = {
  Active: 'green', ExpiringSoon: 'orange', Expired: 'red', Cancelled: 'default', NewPolicy: 'blue',
};

export function InsuranceStatusTag({ status }: { status: InsuranceStatus }) {
  return <Tag color={INS_COLOR[status]}>{status}</Tag>;
}

// ── Payment status ───────────────────────────────────────────────────────────
const PAY_COLOR: Record<PaymentStatus, string> = {
  Pending: 'orange', Paid: 'green', Partial: 'blue', Refunded: 'purple',
};

export function PaymentStatusTag({ status }: { status: PaymentStatus }) {
  return <Tag color={PAY_COLOR[status]}>{status}</Tag>;
}

// ── Document status dot ──────────────────────────────────────────────────────
export function DocStatus({ has, label }: { has: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: '0.5px solid #f0f0f0', fontSize: 12 }}>
      <span style={{ color: '#888' }}>{label}</span>
      <Tag color={has ? 'green' : 'red'}>{has ? 'Attached' : 'Missing'}</Tag>
    </div>
  );
}

// ── Workflow steps ───────────────────────────────────────────────────────────
const STEPS: { key: TicketStatus; label: string }[] = [
  { key: 'Open', label: 'Open' },
  { key: 'InProgress', label: 'In progress' },
  { key: 'Completed', label: 'Completed' },
  { key: 'Closed', label: 'Closed' },
];

export function WorkflowSteps({ current }: { current: TicketStatus }) {
  const idx = STEPS.findIndex(s => s.key === current);
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {STEPS.map((step, i) => (
        <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 60 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: i < idx ? '#52c41a' : i === idx ? '#1677ff' : '#f0f0f0',
              border: `2px solid ${i < idx ? '#52c41a' : i === idx ? '#1677ff' : '#d9d9d9'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {i < idx && <span style={{ color: '#fff', fontSize: 10 }}>✓</span>}
            </div>
            <span style={{ fontSize: 10, color: i === idx ? '#1677ff' : i < idx ? '#52c41a' : '#bbb', fontWeight: i === idx ? 600 : 400, whiteSpace: 'nowrap' }}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < idx ? '#52c41a' : '#f0f0f0', marginBottom: 14, marginLeft: 2, marginRight: 2 }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Avatar initials ──────────────────────────────────────────────────────────
export function AvatarInitials({ name, size = 28, bg = '#E6F1FB', color = '#0C447C' }: { name: string; size?: number; bg?: string; color?: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 600, flexShrink: 0 }}>
      {initials}
    </div>
  );
}
