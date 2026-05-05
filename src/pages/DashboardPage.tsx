import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Alert, Skeleton, Tag, Tooltip } from 'antd';
import {
  ArrowUpOutlined,
  WarningOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  PhoneOutlined,
  CarOutlined,
  CalendarOutlined,
  UserOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useKPIs, useExpiryAlerts, useMonthlyData } from '../hooks';
import { ExpiryTag, StatusBadge, PriorityTag, AvatarInitials } from '../components/shared';
import type { Ticket } from '../types';

const BAR_COLORS = ['#C8102E', '#E8A0A8', '#A0BBD8', '#9DCCA8'];

export default function DashboardPage() {
  const { data: kpis, loading: kloading } = useKPIs();
  const { data: alerts } = useExpiryAlerts(60);
  const { data: monthly } = useMonthlyData();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  const maxTickets = Math.max(...(monthly?.map(m => m.tickets) ?? [1]));

  // ── List view columns ──
  const expiryColumns = [
    {
      title: 'Reg. No.',
      dataIndex: 'vehicleRegNo',
      render: (v: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CarOutlined style={{ color: '#C8102E', fontSize: 13 }} />
          <strong style={{ fontSize: 12 }}>{v}</strong>
        </div>
      ),
    },
    {
      title: 'Vehicle',
      dataIndex: 'vehicleName',
      render: (v: string, r: Ticket) => (
        <div>
          <div style={{ fontSize: 12, fontWeight: 500 }}>{v}</div>
          <div style={{ fontSize: 11, color: '#888' }}>{(r as any).vehicleType ?? '—'}</div>
        </div>
      ),
    },
    {
      title: 'Owner',
      dataIndex: 'customerName',
      render: (v: string, r: Ticket) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <UserOutlined style={{ fontSize: 11, color: '#888' }} />
            <span style={{ fontSize: 12, fontWeight: 500 }}>{v}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <PhoneOutlined style={{ fontSize: 11, color: '#888' }} />
            <span style={{ fontSize: 11, color: '#666' }}>{(r as any).customerPhone ?? '—'}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Insurer',
      dataIndex: ['policy', 'insurer'],
      render: (v: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <SafetyOutlined style={{ fontSize: 11, color: '#1677ff' }} />
          <span style={{ fontSize: 12 }}>{v}</span>
        </div>
      ),
    },
    {
      title: 'Expiry',
      dataIndex: ['policy', 'expiryDate'],
      render: (d: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <CalendarOutlined style={{ fontSize: 11, color: '#d46b08' }} />
          <ExpiryTag date={d} />
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (v: string) => <StatusBadge status={v as import('../types').TicketStatus} />,
    },
    {
      title: '',
      key: 'action',
      render: (_: unknown, r: Ticket) => (
        <Button size="small" type="primary" ghost
          style={{ borderColor: '#C8102E', color: '#C8102E', fontSize: 11 }}
          onClick={() => navigate(`/tickets/${r.id}`)}>
          View
        </Button>
      ),
    },
  ];

  // ── Card view ──
  const CardView = ({ tickets }: { tickets: Ticket[] }) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 14,
      padding: '4px 0',
    }}>
      {(tickets ?? []).map((r: any) => (
        <div
          key={r.id}
          onClick={() => navigate(`/tickets/${r.id}`)}
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #f0f0f0',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(200,16,46,0.12)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)')}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: '#fff0f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CarOutlined style={{ color: '#C8102E', fontSize: 16 }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{r.vehicleRegNo}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{r.vehicleType ?? 'Vehicle'}</div>
              </div>
            </div>
            <StatusBadge status={r.status} />
          </div>

          {/* Vehicle name */}
          <div style={{ fontSize: 13, fontWeight: 600, color: '#222', marginBottom: 10 }}>
            {r.vehicleName}
          </div>

          {/* Details grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <UserOutlined style={{ fontSize: 12, color: '#888', width: 14 }} />
              <span style={{ fontSize: 12, color: '#444' }}>{r.customerName}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <PhoneOutlined style={{ fontSize: 12, color: '#888', width: 14 }} />
              <span style={{ fontSize: 12, color: '#444' }}>{r.customerPhone ?? '—'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <SafetyOutlined style={{ fontSize: 12, color: '#1677ff', width: 14 }} />
              <span style={{ fontSize: 12, color: '#444' }}>{r.policy?.insurer ?? '—'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CalendarOutlined style={{ fontSize: 12, color: '#d46b08', width: 14 }} />
              <ExpiryTag date={r.policy?.expiryDate} />
            </div>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 12, paddingTop: 10,
            borderTop: '1px solid #f5f5f5',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <PriorityTag priority={r.priority} />
            <Button size="small" type="primary"
              style={{ background: '#C8102E', borderColor: '#C8102E', fontSize: 11 }}
              onClick={e => { e.stopPropagation(); navigate(`/tickets/${r.id}`); }}>
              View →
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      {/* Header */}
      {/* KPI cards */}
      <Row gutter={12} style={{ marginBottom: 20 }}>
        {[
          { label: 'Total tickets', value: kpis?.totalTickets, color: undefined, delta: '↑ 12 this week', up: true },
          { label: 'Open', value: kpis?.openTickets, color: '#1677ff', delta: 'Awaiting action' },
          { label: 'Expiring ≤ 30 days', value: kpis?.expiringIn30Days, color: '#d46b08', delta: '⚠ Renewal needed', warn: true },
          { label: 'Expired policies', value: kpis?.expiredPolicies, color: '#cf1322', delta: 'Immediate action', danger: true },
        ].map(k => (
          <Col span={6} key={k.label}>
            <Card style={{ borderRadius: 10 }} styles={{ body: { padding: '16px 20px' } }}>
              {kloading ? <Skeleton active paragraph={false} /> : (
                <>
                  <Statistic
                    title={<span style={{ fontSize: 12 }}>{k.label}</span>}
                    value={k.value ?? 0}
                    valueStyle={{ color: k.color, fontWeight: 600, fontSize: 28 }}
                  />
                  <div style={{ fontSize: 11, marginTop: 4, color: k.danger ? '#cf1322' : k.warn ? '#d46b08' : k.up ? '#389e0d' : '#888' }}>
                    {k.up && <ArrowUpOutlined style={{ marginRight: 3 }} />}{k.delta}
                  </div>
                </>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={14} style={{ marginBottom: 16 }}>
        {/* Monthly chart */}
        <Col span={10}>
          <Card title="Monthly ticket volume" style={{ borderRadius: 10 }} styles={{ body: { padding: '12px 16px' } }}>
            {monthly ? (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 110, paddingTop: 8 }}>
                {monthly.map((m, i) => (
                  <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ fontSize: 10, color: '#888', fontWeight: 500 }}>{m.tickets}</div>
                    <div style={{
                      width: '100%', borderRadius: '4px 4px 0 0',
                      background: i === monthly.length - 1 ? '#C8102E' : BAR_COLORS[i] ?? '#B5D4F4',
                      height: `${Math.round((m.tickets / maxTickets) * 80)}px`,
                      minHeight: 8, transition: 'height .4s',
                    }} />
                    <div style={{ fontSize: 11, color: i === monthly.length - 1 ? '#C8102E' : '#888', fontWeight: i === monthly.length - 1 ? 600 : 400 }}>
                      {m.month}
                    </div>
                  </div>
                ))}
              </div>
            ) : <Skeleton active />}
          </Card>
        </Col>

        {/* Payment overview */}
        <Col span={14}>
          <Card title="Payment overview" style={{ borderRadius: 10 }} styles={{ body: { padding: '12px 16px' } }}>
            <Row gutter={12}>
              <Col span={12}>
                <div style={{ background: '#f6ffed', borderRadius: 8, padding: '12px 16px', border: '1px solid #b7eb8f' }}>
                  <div style={{ fontSize: 11, color: '#389e0d', marginBottom: 4 }}>Collected this month</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#237804' }}>
                    ₹{((kpis?.premiumCollected ?? 0) / 100000).toFixed(1)}L
                  </div>
                  <div style={{ background: '#d9f7be', borderRadius: 4, height: 6, marginTop: 8, overflow: 'hidden' }}>
                    <div style={{ width: '78%', height: '100%', background: '#52c41a', borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#389e0d', marginTop: 3 }}>78% collection rate</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ background: '#fff7e6', borderRadius: 8, padding: '12px 16px', border: '1px solid #ffd591' }}>
                  <div style={{ fontSize: 11, color: '#d46b08', marginBottom: 4 }}>Pending collection</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#873800' }}>
                    ₹{((kpis?.pendingPayments ?? 0) / 100000).toFixed(1)}L
                  </div>
                  <Button size="small" style={{ marginTop: 12, fontSize: 11 }} onClick={() => navigate('/renewals')}>
                    View pending →
                  </Button>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Tickets section with view toggle */}
      <Card
        title="Upcoming insurance expiries"
        style={{ borderRadius: 10 }}
        extra={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* View toggle buttons */}
            <div style={{
              display: 'flex', border: '1px solid #e0e0e0',
              borderRadius: 6, overflow: 'hidden',
            }}>
              <Tooltip title="List view">
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '4px 10px', border: 'none', cursor: 'pointer',
                    background: viewMode === 'list' ? '#C8102E' : '#fff',
                    color: viewMode === 'list' ? '#fff' : '#888',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <UnorderedListOutlined style={{ fontSize: 14 }} />
                </button>
              </Tooltip>
              <Tooltip title="Card view">
                <button
                  onClick={() => setViewMode('card')}
                  style={{
                    padding: '4px 10px', border: 'none', cursor: 'pointer',
                    background: viewMode === 'card' ? '#C8102E' : '#fff',
                    color: viewMode === 'card' ? '#fff' : '#888',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <AppstoreOutlined style={{ fontSize: 14 }} />
                </button>
              </Tooltip>
            </div>
            <Button type="link" style={{ color: '#C8102E' }} onClick={() => navigate('/renewals')}>
              View all →
            </Button>
          </div>
        }
      >
        {viewMode === 'list' ? (
          <Table
            columns={expiryColumns}
            dataSource={alerts ?? []}
            rowKey="id"
            pagination={false}
            size="small"
            onRow={r => ({ onClick: () => navigate(`/tickets/${r.id}`), style: { cursor: 'pointer' } })}
          />
        ) : (
          <CardView tickets={alerts ?? []} />
        )}
      </Card>
    </div>
  );
}