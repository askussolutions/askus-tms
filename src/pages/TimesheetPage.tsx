import React, { useState, useMemo } from 'react';
import {
  Card, Table, Button, Input, Select, DatePicker, Tag, message,
  Tabs, Row, Col, Popconfirm, Tooltip, Modal, Form, Avatar, Badge, Alert,
} from 'antd';
import {
  PlusOutlined, DownloadOutlined, DeleteOutlined, SaveOutlined,
  FileExcelOutlined, UserOutlined, ClockCircleOutlined, LockOutlined,
  CalendarOutlined, CheckCircleOutlined, TeamOutlined,
  EditOutlined, EyeOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useAppSelector } from '../store';
import type { UserRole } from '../types';

dayjs.extend(isoWeek);

// ── Types ──────────────────────────────────────────────────────────────────────
type Status = 'Present' | 'Absent' | 'Half Day' | 'Holiday' | 'Leave';

interface DayEntry { status: Status; hours: number; }

interface StaffRow {
  id: string;
  employeeName: string;
  employeeId: string;
  role: 'Admin' | 'Employee' | 'Agent';
  days: Record<string, DayEntry>; // key = 'YYYY-MM-DD'
}

// ── Constants ──────────────────────────────────────────────────────────────────
const STATUS_OPTIONS: Status[] = ['Present', 'Absent', 'Half Day', 'Holiday', 'Leave'];
const STATUS_COLOR: Record<Status, string> = {
  Present: '#52c41a', Absent: '#f5222d', 'Half Day': '#faad14',
  Holiday: '#1677ff', Leave: '#722ed1',
};
const STATUS_BG: Record<Status, string> = {
  Present: '#f6ffed', Absent: '#fff1f0', 'Half Day': '#fffbe6',
  Holiday: '#e6f4ff', Leave: '#f9f0ff',
};
const STATUS_ICON: Record<Status, string> = {
  Present: '✓', Absent: '✗', 'Half Day': '½', Holiday: '⊕', Leave: '◯',
};
// Mon=0 … Sat=5, Sun=6 (isoWeek: Mon is day 1)
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ROLE_COLOR: Record<string, string> = {
  Admin: '#C8102E', Employee: '#1677ff', Agent: '#52c41a',
};

// ── Staff master ───────────────────────────────────────────────────────────────
const INITIAL_STAFF: StaffRow[] = [
  { id: 'user-001', employeeName: 'Rajesh Kumar',  employeeId: 'EMP001', role: 'Admin',    days: {} },
  { id: 'user-002', employeeName: 'Priya Sharma',  employeeId: 'EMP002', role: 'Employee', days: {} },
  { id: 'user-003', employeeName: 'Karthik M',     employeeId: 'EMP003', role: 'Employee', days: {} },
  { id: 'user-004', employeeName: 'Anand Raj',     employeeId: 'AGT001', role: 'Agent',    days: {} },
  { id: 'user-005', employeeName: 'Meena Devi',    employeeId: 'AGT002', role: 'Agent',    days: {} },
  { id: 'user-006', employeeName: 'Suresh P',      employeeId: 'AGT003', role: 'Agent',    days: {} },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtDate    = (d: Dayjs) => d.format('YYYY-MM-DD');
const todayKey   = fmtDate(dayjs());
const getWkStart = (d: Dayjs) => d.startOf('isoWeek'); // Monday
const getWkDates = (ws: Dayjs) => Array.from({ length: 7 }, (_, i) => ws.add(i, 'day'));
const calcHours  = (row: StaffRow, dates: Dayjs[]) =>
  dates.reduce((s, d) => s + (row.days[fmtDate(d)]?.hours ?? 0), 0);
const calcDays   = (row: StaffRow, dates: Dayjs[]) =>
  dates.filter(d => ['Present', 'Half Day'].includes(row.days[fmtDate(d)]?.status ?? '')).length;

// Is the given date in the current ISO week?
const currentWkStart = getWkStart(dayjs());
const currentWkEnd   = currentWkStart.add(6, 'day');

function isCellEditable(date: Dayjs, isSunday: boolean): boolean {
  if (isSunday) return false; // Sunday always locked
  const isCurrentWeek = !date.isBefore(currentWkStart, 'day') && !date.isAfter(currentWkEnd, 'day');
  return isCurrentWeek;
}

// ── Day Cell ──────────────────────────────────────────────────────────────────
function DayCell({
  entry, onChange, editable, isSunday, isPastOrFuture,
}: {
  entry: DayEntry;
  onChange: (e: DayEntry) => void;
  editable: boolean;
  isSunday: boolean;
  isPastOrFuture: boolean;
}) {
  const [open, setOpen] = useState(false);

  const lockReason = isSunday
    ? 'Sunday — non-working day'
    : isPastOrFuture
    ? 'Only current week is editable'
    : '';

  // Locked cell
  if (!editable) {
    const hasEntry = entry.status !== 'Present' || entry.hours > 0;
    return (
      <Tooltip title={lockReason} placement="top">
        <div style={{
          padding: '4px 6px', borderRadius: 6, textAlign: 'center',
          background: isSunday ? '#f5f5f5' : hasEntry ? STATUS_BG[entry.status] : '#fafafa',
          minWidth: 72, border: `1px solid ${isSunday ? '#e0e0e0' : hasEntry ? STATUS_COLOR[entry.status] + '22' : '#e8e8e8'}`,
          cursor: 'not-allowed', opacity: isSunday ? 0.5 : 0.85,
          position: 'relative',
        }}>
          {isSunday ? (
            <div style={{ fontSize: 10, color: '#bfbfbf', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              <LockOutlined style={{ fontSize: 9 }} /> SUN
            </div>
          ) : hasEntry ? (
            <div style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLOR[entry.status], display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              {isPastOrFuture && <LockOutlined style={{ fontSize: 9 }} />}
              {STATUS_ICON[entry.status]}{' '}
              {(entry.status === 'Present' || entry.status === 'Half Day') ? `${entry.hours}h` : entry.status.slice(0, 3)}
            </div>
          ) : (
            <div style={{ fontSize: 10, color: '#d9d9d9' }}>—</div>
          )}
        </div>
      </Tooltip>
    );
  }

  // Editable — open state
  if (open) {
    return (
      <div style={{ minWidth: 108, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Select size="small" value={entry.status}
          onChange={v => onChange({ ...entry, status: v as Status })}
          options={STATUS_OPTIONS.map(s => ({ label: s, value: s }))}
          style={{ width: '100%' }} />
        <Input size="small" type="number" min={0} max={24} step={0.5}
          value={entry.hours} suffix="h"
          onChange={e => onChange({ ...entry, hours: parseFloat(e.target.value) || 0 })} />
        <Button size="small" type="primary" icon={<SaveOutlined />}
          onClick={() => setOpen(false)}
          style={{ background: '#C8102E', borderColor: '#C8102E' }}>
          Save
        </Button>
      </div>
    );
  }

  return (
    <Tooltip title="Click to edit" placement="top">
      <div onClick={() => setOpen(true)} style={{
        cursor: 'pointer', padding: '4px 6px', borderRadius: 6, textAlign: 'center',
        background: STATUS_BG[entry.status], minWidth: 72, transition: 'all 0.15s',
        border: `1px solid ${STATUS_COLOR[entry.status]}44`,
        boxShadow: '0 0 0 1.5px ' + STATUS_COLOR[entry.status] + '33',
      }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.75'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
      >
        <div style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLOR[entry.status] }}>
          <EditOutlined style={{ fontSize: 8, marginRight: 3 }} />
          {STATUS_ICON[entry.status]}{' '}
          {(entry.status === 'Present' || entry.status === 'Half Day')
            ? `${entry.hours}h` : entry.status.slice(0, 3)}
        </div>
      </div>
    </Tooltip>
  );
}

// ── My Entry Card (single user — Mon to Sat, current week only) ───────────────
function MyEntryTab({ userId, userName, allRows, setAllRows }: {
  userId: string; userName: string;
  allRows: StaffRow[]; setAllRows: React.Dispatch<React.SetStateAction<StaffRow[]>>;
}) {
  const dates  = useMemo(() => getWkDates(currentWkStart), []);
  const myRow  = allRows.find(r => r.id === userId);
  const weekLabel = `${currentWkStart.format('DD MMM')} – ${currentWkStart.add(6, 'day').format('DD MMM YYYY')}`;

  const updateDay = (dateKey: string, entry: DayEntry) =>
    setAllRows(prev => prev.map(r =>
      r.id === userId ? { ...r, days: { ...r.days, [dateKey]: entry } } : r
    ));

  const totalHrs  = myRow ? calcHours(myRow, dates) : 0;
  const workDays  = myRow ? calcDays(myRow, dates) : 0;
  const presentCt = myRow ? dates.filter(d => myRow.days[fmtDate(d)]?.status === 'Present').length : 0;
  const absentCt  = myRow ? dates.filter(d => myRow.days[fmtDate(d)]?.status === 'Absent').length : 0;

  if (!myRow) return (
    <Alert type="warning" message="Your profile not found in staff list. Please contact admin." style={{ margin: 20 }} />
  );

  return (
    <div style={{ padding: 20, background: '#fff', border: '1px solid #e8e8e8', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>

      {/* Week header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#1f1f1f' }}>
            My Attendance Entry
          </div>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
            <CalendarOutlined /> Current week: {weekLabel}
          </div>
        </div>
        <Alert
          type="info" showIcon
          message="Only current week (Mon–Sat) is editable. Sunday is non-working."
          style={{ fontSize: 11, padding: '4px 12px' }}
        />
      </div>

      {/* Stats */}
      <Row gutter={12} style={{ marginBottom: 18 }}>
        {[
          { label: 'Total Hours',  val: `${totalHrs}h`, color: '#52c41a' },
          { label: 'Days Worked',  val: workDays,        color: '#1677ff' },
          { label: 'Present',      val: presentCt,       color: '#52c41a' },
          { label: 'Absent',       val: absentCt,        color: '#f5222d' },
        ].map(s => (
          <Col key={s.label} xs={12} sm={6}>
            <Card style={{ borderRadius: 8 }} styles={{ body: { padding: '10px 14px' } }}>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Day entry grid — Mon to Sun */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
        {dates.map((d, i) => {
          const isSun    = i === 6;
          const dateKey  = fmtDate(d);
          const editable = isCellEditable(d, isSun);
          const entry    = myRow.days[dateKey] ?? { status: 'Present' as Status, hours: 8 };
          const isToday  = dateKey === todayKey;
          const isPastFut = !isSun && !editable;

          return (
            <div key={dateKey} style={{
              borderRadius: 10, overflow: 'hidden',
              border: isToday ? '2px solid #C8102E' : isSun ? '1px solid #e8e8e8' : editable ? '1px solid #d6e4ff' : '1px solid #e8e8e8',
              background: isSun ? '#fafafa' : editable ? '#fff' : '#f9f9f9',
              boxShadow: isToday ? '0 0 0 3px rgba(200,16,46,0.12)' : 'none',
            }}>
              {/* Day header */}
              <div style={{
                padding: '8px 10px',
                background: isSun ? '#f0f0f0' : isToday ? '#C8102E' : editable ? '#1677ff' : '#f5f5f5',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  color: isSun || (!isToday && !editable) ? '#8c8c8c' : '#fff' }}>
                  {WEEK_DAYS[i]}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800,
                  color: isSun || (!isToday && !editable) ? '#8c8c8c' : '#fff', lineHeight: 1.1 }}>
                  {d.format('DD')}
                </div>
                <div style={{ fontSize: 10, color: isSun || (!isToday && !editable) ? '#bfbfbf' : 'rgba(255,255,255,0.8)' }}>
                  {d.format('MMM')}
                </div>
              </div>

              {/* Entry area */}
              <div style={{ padding: 10 }}>
                {isSun ? (
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <LockOutlined style={{ color: '#d9d9d9', fontSize: 16 }} />
                    <div style={{ fontSize: 10, color: '#bfbfbf', marginTop: 4 }}>Sunday</div>
                    <div style={{ fontSize: 9, color: '#d9d9d9' }}>Non-working</div>
                  </div>
                ) : editable ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Select size="small" value={entry.status}
                      onChange={v => updateDay(dateKey, { ...entry, status: v as Status })}
                      options={STATUS_OPTIONS.map(s => ({
                        label: <span style={{ color: STATUS_COLOR[s], fontWeight: 500 }}>{STATUS_ICON[s]} {s}</span>,
                        value: s,
                      }))}
                      style={{ width: '100%' }} />
                    {(entry.status === 'Present' || entry.status === 'Half Day') && (
                      <Input size="small" type="number" min={0} max={24} step={0.5}
                        value={entry.hours} suffix="h" placeholder="Hours"
                        onChange={e => updateDay(dateKey, { ...entry, hours: parseFloat(e.target.value) || 0 })} />
                    )}
                    <div style={{
                      fontSize: 10, textAlign: 'center', fontWeight: 600,
                      color: STATUS_COLOR[entry.status], padding: '2px 0',
                    }}>
                      {STATUS_ICON[entry.status]} {(entry.status === 'Present' || entry.status === 'Half Day') ? `${entry.hours}h` : entry.status}
                    </div>
                  </div>
                ) : (
                  // Past or future — read-only
                  <div style={{ textAlign: 'center', padding: '6px 0' }}>
                    <LockOutlined style={{ color: '#d9d9d9', fontSize: 12, marginBottom: 4, display: 'block' }} />
                    <div style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLOR[entry.status] }}>
                      {STATUS_ICON[entry.status]}{' '}
                      {(entry.status === 'Present' || entry.status === 'Half Day') ? `${entry.hours}h` : entry.status}
                    </div>
                    <div style={{ fontSize: 9, color: '#bfbfbf', marginTop: 2 }}>
                      {d.isBefore(currentWkStart) ? 'Past' : 'Future'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 600 }}>Status:</span>
        {STATUS_OPTIONS.map(s => (
          <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: STATUS_COLOR[s], display: 'inline-block' }} />
            <span style={{ color: '#595959' }}>{s}</span>
          </span>
        ))}
        <span style={{ fontSize: 11, color: '#bfbfbf', marginLeft: 8 }}>
          <LockOutlined /> = Non-editable
        </span>
      </div>
    </div>
  );
}

// ── Add Staff Modal ────────────────────────────────────────────────────────────
function AddStaffModal({ open, onClose, onAdd }: {
  open: boolean; onClose: () => void; onAdd: (r: StaffRow) => void;
}) {
  const [form] = Form.useForm();
  return (
    <Modal open={open} onCancel={onClose} title="Add Staff Member"
      okText="Add" okButtonProps={{ style: { background: '#C8102E', borderColor: '#C8102E' } }}
      onOk={() => form.validateFields().then(v => {
        onAdd({ id: 'user-' + Date.now(), employeeName: v.name, employeeId: v.empId, role: v.role, days: {} });
        form.resetFields(); onClose();
      })}>
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
          <Input prefix={<UserOutlined />} placeholder="e.g. Rajesh Kumar" />
        </Form.Item>
        <Form.Item name="empId" label="Employee ID" rules={[{ required: true }]}>
          <Input placeholder="e.g. EMP004" />
        </Form.Item>
        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
          <Select options={[
            { label: 'Employee', value: 'Employee' },
            { label: 'Agent', value: 'Agent' },
          ]} placeholder="Select role" />
        </Form.Item>
      </Form>
    </Modal>
  );
}


async function exportXlsx(rows: StaffRow[], dates: Dayjs[], weekLabel: string) {
  const XLSX = await import('xlsx');
  const headers = ['Emp ID', 'Name', 'Role',
    ...dates.map((d, i) => `${WEEK_DAYS[i]} ${d.format('DD/MM')}`),
    'Total Hours', 'Working Days'];
  const data = rows.map(r => [
    r.employeeId, r.employeeName, r.role,
    ...dates.map((d, i) => {
      if (i === 6) return 'Sunday'; // Sunday
      const e = r.days[fmtDate(d)];
      if (!e || e.status === 'Absent') return '';
      if (e.status === 'Holiday') return 'Holiday';
      if (e.status === 'Leave')   return 'Leave';
      return `${e.status} - ${e.hours}h`;
    }),
    calcHours(r, dates), calcDays(r, dates),
  ]);
  const summaryHeaders = ['Name', 'Role', 'Present', 'Absent', 'Leave', 'Total Hours', 'Avg h/day'];
  const summaryData = rows.map(r => {
    const p = dates.filter(d => r.days[fmtDate(d)]?.status === 'Present').length;
    const a = dates.filter(d => r.days[fmtDate(d)]?.status === 'Absent').length;
    const l = dates.filter(d => r.days[fmtDate(d)]?.status === 'Leave').length;
    const h = calcHours(r, dates); const wd = calcDays(r, dates);
    return [r.employeeName, r.role, p, a, l, h, wd > 0 ? (h / wd).toFixed(1) : '0'];
  });
  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet([headers, ...data]);
  ws1['!cols'] = [{ wch: 10 }, { wch: 20 }, { wch: 10 }, ...dates.map(() => ({ wch: 16 })), { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Weekly Timesheet');
  const ws2 = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryData]);
  XLSX.utils.book_append_sheet(wb, ws2, 'Summary');
  XLSX.writeFile(wb, `Timesheet_${weekLabel.replace(/[\s–]/g, '_')}.xlsx`);
  message.success('Exported!');
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function TimesheetPage() {
  const authUser = useAppSelector(s => s.auth.user);
  const userRole = (authUser?.role ?? 'Agent') as UserRole;
  const userId   = authUser?.id   ?? 'user-003';
  const userName = authUser?.name ?? '';

  const [tab, setTab]             = useState(userRole === 'Admin' ? 'all' : 'my');
  const [weekStart, setWeekStart] = useState(getWkStart(dayjs()));
  const [filterRole, setFilterRole] = useState<string>('All');
  const [showAdd, setShowAdd]     = useState(false);
  const [allRows, setAllRows]     = useState<StaffRow[]>(INITIAL_STAFF);

  const dates     = useMemo(() => getWkDates(weekStart), [weekStart]);
  const weekLabel = `${weekStart.format('DD MMM')} – ${weekStart.add(6, 'day').format('DD MMM YYYY')}`;
  const isCurrentWeek = weekStart.isSame(currentWkStart, 'day');

  // Visible rows for admin list
  const visibleRows = useMemo(() => {
    if (filterRole === 'All') return allRows;
    return allRows.filter(r => r.role === filterRole);
  }, [allRows, filterRole]);

  const updateDay = (rowId: string, dateKey: string, entry: DayEntry) =>
    setAllRows(prev => prev.map(r =>
      r.id === rowId ? { ...r, days: { ...r.days, [dateKey]: entry } } : r
    ));

  const fillDefaults = () => {
    setAllRows(prev => prev.map(r => {
      const days = { ...r.days };
      // Only fill Mon-Sat of current week
      getWkDates(currentWkStart).forEach((d, i) => {
        if (i < 6) { // skip Sunday
          const k = fmtDate(d);
          if (!days[k]) days[k] = { status: 'Present', hours: 8 };
        }
      });
      return { ...r, days };
    }));
    message.success('Filled Mon–Sat with Present / 8h');
  };

  const totalHoursAll = allRows.reduce((s, r) => s + calcHours(r, dates), 0);

  // ── Admin table columns ────────────────────────────────────────────────────
  const adminColumns = [
    {
      title: 'Staff', key: 'emp', fixed: 'left' as const, width: 190,
      render: (_: any, r: StaffRow) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar size={32} style={{ background: ROLE_COLOR[r.role], fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
            {r.employeeName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>
              {r.employeeName}
              {r.id === userId && <Tag color="blue" style={{ marginLeft: 5, fontSize: 9 }}>You</Tag>}
            </div>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>
              {r.employeeId} · <span style={{ color: ROLE_COLOR[r.role] }}>{r.role}</span>
            </div>
          </div>
        </div>
      ),
    },
    ...dates.map((d, i) => {
      const isSun      = i === 6;
      const isToday    = fmtDate(d) === todayKey;
      const editable   = isCellEditable(d, isSun);
      const isPastFut  = !isSun && !editable;

      return {
        title: (
          <div style={{ textAlign: 'center' as const }}>
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const,
              color: isSun ? '#f5222d' : i >= 5 ? '#fa8c16' : '#8c8c8c',
            }}>
              {isSun ? '🔒' : ''}{WEEK_DAYS[i]}
            </div>
            <div style={{
              fontSize: 12, fontWeight: 600,
              color: isToday ? '#C8102E' : isSun ? '#bfbfbf' : '#262626',
            }}>
              {d.format('DD')}
            </div>
            {!editable && !isSun && (
              <div style={{ fontSize: 9, color: '#bfbfbf' }}>
                {isPastFut && <LockOutlined style={{ fontSize: 8 }} />}
              </div>
            )}
          </div>
        ),
        key: fmtDate(d), width: 95,
        render: (_: any, r: StaffRow) => {
          const dateKey = fmtDate(d);
          const entry   = r.days[dateKey] ?? { status: 'Present' as Status, hours: 8 };
          return (
            <DayCell
              entry={entry}
              editable={editable}
              isSunday={isSun}
              isPastOrFuture={isPastFut}
              onChange={e => updateDay(r.id, dateKey, e)}
            />
          );
        },
      };
    }),
    {
      title: 'Total', key: 'total', fixed: 'right' as const, width: 80,
      render: (_: any, r: StaffRow) => {
        const h = calcHours(r, dates); const d = calcDays(r, dates);
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: h >= 40 ? '#52c41a' : h > 0 ? '#faad14' : '#d9d9d9' }}>{h}h</div>
            <div style={{ fontSize: 10, color: '#8c8c8c' }}>{d}d</div>
          </div>
        );
      },
    },
    {
      title: '', key: 'del', width: 44, fixed: 'right' as const,
      render: (_: any, r: StaffRow) => (
        <Popconfirm title="Remove staff?" onConfirm={() => setAllRows(p => p.filter(x => x.id !== r.id))} okButtonProps={{ danger: true }}>
          <Button size="small" danger type="text" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const tabItems = [
    ...(userRole !== 'Agent' ? [{
      key: 'all',
      label: <span><TeamOutlined /> All Staff</span>,
      children: (
        <div style={{ padding: '0 0 16px' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            <Select value={filterRole} onChange={setFilterRole} style={{ width: 130 }} size="small"
              options={[{ label: 'All Roles', value: 'All' }, { label: 'Admin', value: 'Admin' }, { label: 'Employee', value: 'Employee' }, { label: 'Agent', value: 'Agent' }]} />
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <Tooltip title="Fill Mon–Sat with Present / 8h for current week">
                <Button size="small" icon={<CheckCircleOutlined />} onClick={fillDefaults}>
                  Fill Defaults
                </Button>
              </Tooltip>
              <Button size="small" icon={<PlusOutlined />} type="primary"
                style={{ background: '#C8102E', borderColor: '#C8102E' }}
                onClick={() => setShowAdd(true)}>
                Add Staff
              </Button>
              <Button size="small" icon={<DownloadOutlined />} onClick={() => exportXlsx(visibleRows, dates, weekLabel)}>
                Export XLSX
              </Button>
            </div>
          </div>
          <div style={{ marginBottom: 10, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#8c8c8c' }}>
              <TeamOutlined /> {visibleRows.length} staff &nbsp;·&nbsp;
              Total hours this week: <strong style={{ color: '#C8102E' }}>{totalHoursAll}h</strong>
            </span>
          </div>
          <Table
            columns={adminColumns}
            dataSource={visibleRows}
            rowKey="id"
            size="small"
            scroll={{ x: 'max-content' }}
            pagination={false}
            bordered
          />
        </div>
      ),
    }] : []),
    {
      key: 'my',
      label: <span><UserOutlined /> My Entry</span>,
      children: (
        <MyEntryTab
          userId={userId}
          userName={userName}
          allRows={allRows}
          setAllRows={setAllRows}
        />
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1f1f1f' }}>
            <FileExcelOutlined style={{ color: '#C8102E', marginRight: 8 }} />
            Time Sheet
          </div>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
            Weekly attendance &amp; hours tracker
          </div>
        </div>
        {/* Week navigation (admin view) */}
        {userRole !== 'Agent' && tab === 'all' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button size="small" icon={<span>‹</span>} onClick={() => setWeekStart(w => w.subtract(1, 'week'))} />
            <span style={{ fontSize: 13, fontWeight: 600, color: isCurrentWeek ? '#C8102E' : '#555' }}>
              <CalendarOutlined style={{ marginRight: 4 }} />{weekLabel}
            </span>
            <Button size="small" icon={<span>›</span>} onClick={() => setWeekStart(w => w.add(1, 'week'))} disabled={isCurrentWeek} />
            {!isCurrentWeek && (
              <Button size="small" onClick={() => setWeekStart(currentWkStart)} style={{ color: '#C8102E', borderColor: '#C8102E' }}>
                Current Week
              </Button>
            )}
          </div>
        )}
      </div>

      <Card style={{ borderRadius: 10 }} styles={{ body: { padding: '0 16px 16px' } }}>
        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={tabItems}
        />
      </Card>

      <AddStaffModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={r => { setAllRows(p => [...p, r]); message.success('Staff added!'); }}
      />
    </div>
  );
}
