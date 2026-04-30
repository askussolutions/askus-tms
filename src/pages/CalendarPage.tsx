import React, { useState, useMemo } from 'react';
import { Badge, Button, Tooltip } from 'antd';
import {
  LeftOutlined, RightOutlined, WarningOutlined,
  ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useExpiryAlerts } from '../hooks';

// ── Constants ─────────────────────────────────────────────────────────────────
const DAYS_HEADER = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAYS_MINI   = ['S','M','T','W','T','F','S'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y: number, m: number)    { return new Date(y, m, 1).getDay(); }
function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

type Entry = { tickets: any[]; daysLeft: number };

function getUrgency(daysLeft: number) {
  if (daysLeft < 0)   return { color: '#f5222d', bg: '#fff1f0', border: '#ffa39e', icon: <ExclamationCircleOutlined />, tag: 'Expired' };
  if (daysLeft <= 7)  return { color: '#fa541c', bg: '#fff2e8', border: '#ffbb96', icon: <WarningOutlined />,           tag: `${daysLeft}d left` };
  if (daysLeft <= 15) return { color: '#faad14', bg: '#fffbe6', border: '#ffe58f', icon: <ClockCircleOutlined />,       tag: `${daysLeft}d left` };
  if (daysLeft <= 30) return { color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f', icon: <CheckCircleOutlined />,       tag: `${daysLeft}d left` };
  return                     { color: '#1677ff', bg: '#e6f4ff', border: '#91caff', icon: <CheckCircleOutlined />,       tag: `${daysLeft}d left` };
}

// ── Mini Month Calendar (left sidebar) ───────────────────────────────────────
function MiniCalendar({
  year, month, selected, onSelect, onPrev, onNext, ticketsByDate,
}: {
  year: number; month: number; selected: string | null;
  onSelect: (k: string) => void; onPrev: () => void; onNext: () => void;
  ticketsByDate: Record<string, Entry>;
}) {
  const today = new Date();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDay(year, month);

  return (
    <div style={{ padding: '12px 14px', userSelect: 'none' }}>
      {/* Mini header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Button type="text" size="small" icon={<LeftOutlined />} onClick={onPrev} style={{ color: '#595959' }} />
        <span style={{ fontWeight: 600, fontSize: 13, color: '#262626' }}>
          {MONTHS_SHORT[month]} {year}
        </span>
        <Button type="text" size="small" icon={<RightOutlined />} onClick={onNext} style={{ color: '#595959' }} />
      </div>

      {/* Mini day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {DAYS_MINI.map((d, i) => (
          <div key={i} style={{
            textAlign: 'center', fontSize: 10, fontWeight: 600,
            color: i === 0 || i === 6 ? '#C8102E' : '#8c8c8c',
            padding: '2px 0',
          }}>{d}</div>
        ))}
      </div>

      {/* Mini day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const key = toKey(year, month, day);
          const isToday    = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
          const isSelected = selected === key;
          const hasData    = !!ticketsByDate[key];
          const u          = hasData ? getUrgency(ticketsByDate[key].daysLeft) : null;

          return (
            <div
              key={day}
              onClick={() => onSelect(key)}
              style={{
                width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto', borderRadius: '50%', fontSize: 11, cursor: 'pointer',
                fontWeight: isToday ? 700 : 400,
                background: isSelected ? '#C8102E' : isToday ? '#fff0f0' : 'transparent',
                color: isSelected ? '#fff' : isToday ? '#C8102E' : '#262626',
                border: isToday && !isSelected ? '1.5px solid #C8102E' : '1.5px solid transparent',
                position: 'relative',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#f5f5f5'; }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = isSelected ? '#C8102E' : isToday ? '#fff0f0' : 'transparent';
              }}
            >
              {day}
              {hasData && !isSelected && (
                <span style={{
                  position: 'absolute', bottom: 1, left: '50%', transform: 'translateX(-50%)',
                  width: 4, height: 4, borderRadius: '50%', background: u!.color,
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Event Tag (in grid cell) ──────────────────────────────────────────────────
function EventTag({ ticket, daysLeft, onClick }: { ticket: any; daysLeft: number; onClick: () => void }) {
  const u = getUrgency(daysLeft);
  return (
    <div
      onClick={e => { e.stopPropagation(); onClick(); }}
      title={`${ticket.vehicleRegNo} — ${ticket.customerName}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: u.bg, borderLeft: `3px solid ${u.color}`,
        borderRadius: '0 4px 4px 0', padding: '2px 6px',
        fontSize: 11, color: '#262626', cursor: 'pointer',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        marginBottom: 2, transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.75'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
    >
      <span style={{ color: u.color, fontWeight: 700, fontSize: 10, flexShrink: 0 }}>{u.tag}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {ticket.vehicleRegNo} · {ticket.customerName}
      </span>
    </div>
  );
}

// ── Sidebar Event List (right panel for selected day) ─────────────────────────
function DayEventList({
  dateKey, entry, onClose,
}: { dateKey: string; entry: Entry; onClose: () => void }) {
  const navigate = useNavigate();
  const date = new Date(dateKey + 'T00:00:00');
  const u    = getUrgency(entry.daysLeft);

  return (
    <div style={{
      background: '#fff', borderRadius: 10, overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.10)', border: '1px solid #f0f0f0',
    }}>
      {/* Panel header */}
      <div style={{
        background: 'linear-gradient(135deg, #1f1f1f 0%, #434343 100%)',
        padding: '14px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
            {DAYS_FULL[date.getDay()]}
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
            {date.getDate()}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
            {MONTHS[date.getMonth()]} {date.getFullYear()}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
            width: 26, height: 26, cursor: 'pointer', color: '#fff', fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >✕</button>
      </div>

      {/* Urgency banner */}
      <div style={{
        padding: '8px 14px', background: u.bg, borderBottom: `1px solid ${u.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: u.color }}>
          {u.icon}
          {entry.daysLeft < 0
            ? `Expired ${Math.abs(entry.daysLeft)} days ago`
            : entry.daysLeft === 0 ? 'Expires TODAY!'
            : `Expires in ${entry.daysLeft} days`}
        </span>
        <Badge count={entry.tickets.length} color={u.color} />
      </div>

      {/* Ticket list */}
      <div style={{ maxHeight: 380, overflowY: 'auto' }}>
        {entry.tickets.map((t: any) => (
          <div
            key={t.id}
            onClick={() => navigate(`/tickets/${t.id}`)}
            style={{
              padding: '11px 14px', borderBottom: '1px solid #f5f5f5', cursor: 'pointer',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fafafa'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#1f1f1f' }}>{t.vehicleRegNo}</span>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '1px 8px', borderRadius: 20,
                background: u.bg, color: u.color, border: `1px solid ${u.border}`,
              }}>{t.policy?.insurer ?? '—'}</span>
            </div>
            <div style={{ fontSize: 12, color: '#434343', marginBottom: 2 }}>{t.vehicleName}</div>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>👤 {t.customerName}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Today's / Upcoming Events List (sidebar default state) ────────────────────
function UpcomingList({
  ticketsByDate, onSelect,
}: { ticketsByDate: Record<string, Entry>; onSelect: (k: string) => void }) {
  const today = new Date();
  const sorted = Object.entries(ticketsByDate)
    .filter(([k]) => new Date(k + 'T00:00:00') >= new Date(today.getFullYear(), today.getMonth(), today.getDate()))
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 8);

  if (sorted.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', color: '#bfbfbf' }}>
        <CheckCircleOutlined style={{ fontSize: 32, marginBottom: 8, display: 'block' }} />
        <div style={{ fontSize: 13 }}>No upcoming expirations</div>
      </div>
    );
  }

  return (
    <div>
      {sorted.map(([k, entry]) => {
        const d = new Date(k + 'T00:00:00');
        const u = getUrgency(entry.daysLeft);
        return (
          <div
            key={k}
            onClick={() => onSelect(k)}
            style={{
              padding: '10px 14px', borderBottom: '1px solid #f5f5f5', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12, transition: 'background 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fafafa'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}
          >
            {/* Date bubble */}
            <div style={{
              width: 40, height: 40, borderRadius: 8, background: u.bg, border: `1px solid ${u.border}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: u.color, textTransform: 'uppercase', lineHeight: 1 }}>
                {MONTHS_SHORT[d.getMonth()]}
              </span>
              <span style={{ fontSize: 16, fontWeight: 800, color: u.color, lineHeight: 1.1 }}>{d.getDate()}</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#262626', marginBottom: 2 }}>{u.tag}</div>
              <div style={{ fontSize: 11, color: '#8c8c8c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.tickets.length} policy{entry.tickets.length > 1 ? 's' : ''} expiring
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main CalendarPage ─────────────────────────────────────────────────────────
type ViewMode = 'Day' | 'Week' | 'Month' | 'Year';

export default function CalendarPage() {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string | null>(null);
  const [miniYear,  setMiniYear]  = useState(today.getFullYear());
  const [miniMonth, setMiniMonth] = useState(today.getMonth());
  const [view, setView] = useState<ViewMode>('Month');
  const { data: alerts } = useExpiryAlerts(365);
  const navigate = useNavigate();

  // Build tickets map
  const ticketsByDate = useMemo<Record<string, Entry>>(() => {
    const map: Record<string, Entry> = {};
    (alerts ?? []).forEach((t: any) => {
      const expiry = t.policy?.expiryDate;
      if (!expiry) return;
      const d   = new Date(expiry);
      const key = d.toISOString().split('T')[0];
      const daysLeft = Math.ceil((d.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86400000);
      if (!map[key]) map[key] = { tickets: [], daysLeft };
      map[key].tickets.push(t);
    });
    return map;
  }, [alerts]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const goToday   = () => {
    setYear(today.getFullYear()); setMonth(today.getMonth());
    setMiniYear(today.getFullYear()); setMiniMonth(today.getMonth());
    setSelected(null);
  };

  const daysInMonth   = getDaysInMonth(year, month);
  const firstDay      = getFirstDay(year, month);
  const prevMonthDays = getDaysInMonth(year, month === 0 ? 11 : month - 1);
  const totalCells    = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const selectedEntry = selected ? ticketsByDate[selected] : null;

  // Monthly summary
  const summary = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    let expired = 0, critical = 0, warning = 0, upcoming = 0, safe = 0;
    Object.entries(ticketsByDate)
      .filter(([k]) => k.startsWith(prefix))
      .forEach(([, v]) => {
        const n = v.tickets.length;
        if (v.daysLeft < 0) expired += n;
        else if (v.daysLeft <= 7)  critical += n;
        else if (v.daysLeft <= 15) warning  += n;
        else if (v.daysLeft <= 30) upcoming += n;
        else safe += n;
      });
    return { expired, critical, warning, upcoming, safe };
  }, [ticketsByDate, year, month]);

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 64px)',
      background: '#f5f5f5',
      fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif',
      overflow: 'hidden',
    }}>

      {/* ══ LEFT SIDEBAR ═══════════════════════════════════════════════════════ */}
      <div style={{
        width: 230,
        background: '#fff',
        borderRight: '1px solid #e8e8e8',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflowY: 'auto',
      }}>
        {/* Brand */}
        <div style={{ padding: '18px 16px 12px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#C8102E' }}>TMS Calendar</div>
          <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>Policy Expiry Tracker</div>
        </div>

        {/* Mini calendar */}
        <div style={{ borderBottom: '1px solid #f0f0f0' }}>
          <MiniCalendar
            year={miniYear} month={miniMonth} selected={selected}
            onSelect={k => {
              setSelected(k);
              const d = new Date(k + 'T00:00:00');
              setYear(d.getFullYear()); setMonth(d.getMonth());
            }}
            onPrev={() => { if (miniMonth === 0) { setMiniMonth(11); setMiniYear(y => y - 1); } else setMiniMonth(m => m - 1); }}
            onNext={() => { if (miniMonth === 11) { setMiniMonth(0); setMiniYear(y => y + 1); } else setMiniMonth(m => m + 1); }}
            ticketsByDate={ticketsByDate}
          />
        </div>

        {/* Legend */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
            Legend
          </div>
          {[
            { color: '#f5222d', label: 'Expired' },
            { color: '#fa541c', label: '≤ 7 days (Critical)' },
            { color: '#faad14', label: '≤ 15 days (Warning)' },
            { color: '#52c41a', label: '≤ 30 days (Upcoming)' },
            { color: '#1677ff', label: '> 30 days (Safe)' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#434343' }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Monthly summary */}
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
            {MONTHS_SHORT[month]} {year} · Summary
          </div>
          {[
            { label: 'Expired',  count: summary.expired,  color: '#f5222d', bg: '#fff1f0' },
            { label: 'Critical', count: summary.critical, color: '#fa541c', bg: '#fff2e8' },
            { label: 'Warning',  count: summary.warning,  color: '#faad14', bg: '#fffbe6' },
            { label: 'Upcoming', count: summary.upcoming, color: '#52c41a', bg: '#f6ffed' },
            { label: 'Safe',     count: summary.safe,     color: '#1677ff', bg: '#e6f4ff' },
          ].map(s => (
            <div key={s.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 5, padding: '5px 10px', borderRadius: 6, background: s.bg,
            }}>
              <span style={{ fontSize: 12, color: '#434343' }}>{s.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ MAIN CONTENT ═══════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── Toolbar (matches macOS screenshot toolbar) ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 20px', background: '#fff', borderBottom: '1px solid #e8e8e8',
          flexShrink: 0, gap: 12,
        }}>
          {/* Left: nav + today + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <Button size="small" icon={<LeftOutlined />} onClick={prevMonth} />
              <Button size="small" icon={<RightOutlined />} onClick={nextMonth} />
            </div>
            <Button size="small" onClick={goToday}>Today</Button>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#1f1f1f', letterSpacing: '-0.01em' }}>
              {MONTHS[month]}{' '}
              <span style={{ color: '#8c8c8c', fontWeight: 400 }}>{year}</span>
            </span>
          </div>

          {/* Right: Day / Week / Month / Year switcher */}
          <div style={{
            display: 'flex', background: '#f0f0f0', borderRadius: 8,
            padding: 3, gap: 2,
          }}>
            {(['Day', 'Week', 'Month', 'Year'] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '4px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 500, transition: 'all 0.15s',
                  background: view === v ? '#fff' : 'transparent',
                  color: view === v ? '#1f1f1f' : '#8c8c8c',
                  boxShadow: view === v ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                }}
              >{v}</button>
            ))}
          </div>
        </div>

        {/* ── Calendar Grid + Right Panel ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Grid */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Day column headers */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
              background: '#fff', borderBottom: '1px solid #e8e8e8', flexShrink: 0,
            }}>
              {DAYS_HEADER.map((d, i) => (
                <div key={d} style={{
                  textAlign: 'center', padding: '7px 0',
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                  color: i === 0 || i === 6 ? '#f5222d' : '#8c8c8c',
                }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Month grid */}
            <div style={{
              flex: 1, overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gridAutoRows: 'minmax(100px, 1fr)',
            }}>
              {Array.from({ length: totalCells }).map((_, idx) => {
                const dayNum = idx - firstDay + 1;
                const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;

                let displayDay: number, displayKey: string;
                if (dayNum < 1) {
                  displayDay = prevMonthDays + dayNum;
                  const pm = month === 0 ? 11 : month - 1;
                  const py = month === 0 ? year - 1 : year;
                  displayKey = toKey(py, pm, displayDay);
                } else if (dayNum > daysInMonth) {
                  displayDay = dayNum - daysInMonth;
                  const nm = month === 11 ? 0 : month + 1;
                  const ny = month === 11 ? year + 1 : year;
                  displayKey = toKey(ny, nm, displayDay);
                } else {
                  displayDay = dayNum;
                  displayKey = toKey(year, month, dayNum);
                }

                const isToday    = displayKey === toKey(today.getFullYear(), today.getMonth(), today.getDate());
                const isSelected = selected === displayKey;
                const isWeekend  = idx % 7 === 0 || idx % 7 === 6;
                const entry      = ticketsByDate[displayKey];

                return (
                  <div
                    key={idx}
                    onClick={() => setSelected(isSelected ? null : displayKey)}
                    style={{
                      borderRight: '1px solid #e8e8e8',
                      borderBottom: '1px solid #e8e8e8',
                      padding: '5px 5px 4px',
                      cursor: 'pointer',
                      background: isSelected
                        ? '#fff9f9'
                        : isWeekend && isCurrentMonth ? '#fafafa' : '#fff',
                      outline: isSelected ? '2px solid #C8102E' : 'none',
                      outlineOffset: -2,
                      transition: 'background 0.12s',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#f5f5f5'; }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = isSelected
                        ? '#fff9f9' : isWeekend && isCurrentMonth ? '#fafafa' : '#fff';
                    }}
                  >
                    {/* Day number */}
                    <div style={{ marginBottom: 3 }}>
                      <Tooltip title={isToday ? 'Today' : ''} placement="top">
                        <span style={{
                          width: 24, height: 24, borderRadius: '50%',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: isToday ? 800 : isCurrentMonth ? 400 : 300,
                          background: isToday ? '#C8102E' : 'transparent',
                          color: isToday ? '#fff'
                            : isCurrentMonth ? (isWeekend ? '#f5222d' : '#1f1f1f')
                            : '#d9d9d9',
                        }}>
                          {displayDay}
                        </span>
                      </Tooltip>
                    </div>

                    {/* Event tags — current month only, max 2 + more */}
                    {entry && isCurrentMonth && (
                      <>
                        {entry.tickets.slice(0, 2).map((t: any) => (
                          <EventTag
                            key={t.id}
                            ticket={t}
                            daysLeft={entry.daysLeft}
                            onClick={() => navigate(`/tickets/${t.id}`)}
                          />
                        ))}
                        {entry.tickets.length > 2 && (
                          <div style={{ fontSize: 10, color: '#8c8c8c', padding: '1px 5px' }}>
                            +{entry.tickets.length - 2} more…
                          </div>
                        )}
                      </>
                    )}

                    {/* Dot for adjacent months */}
                    {entry && !isCurrentMonth && (
                      <div style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: getUrgency(entry.daysLeft).color,
                        margin: '2px auto 0',
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div style={{
            width: 300, flexShrink: 0,
            borderLeft: '1px solid #e8e8e8',
            background: '#fafafa',
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
          }}>
            {selected && selectedEntry ? (
              <div style={{ padding: 14 }}>
                <DayEventList
                  dateKey={selected}
                  entry={selectedEntry}
                  onClose={() => setSelected(null)}
                />
              </div>
            ) : selected && !selectedEntry ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, color: '#bfbfbf' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
                <div style={{ fontSize: 13, color: '#8c8c8c', textAlign: 'center', fontWeight: 500 }}>
                  No policies expiring<br />on this date
                </div>
                <Button type="link" size="small" style={{ marginTop: 8 }} onClick={() => setSelected(null)}>
                  Clear selection
                </Button>
              </div>
            ) : (
              <>
                <div style={{ padding: '14px 14px 8px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Upcoming Expirations
                  </div>
                </div>
                <div style={{ flex: 1, background: '#fff' }}>
                  <UpcomingList ticketsByDate={ticketsByDate} onSelect={k => {
                    setSelected(k);
                    const d = new Date(k + 'T00:00:00');
                    setYear(d.getFullYear()); setMonth(d.getMonth());
                  }} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
