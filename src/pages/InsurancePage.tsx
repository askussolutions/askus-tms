import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Input, Select, Button, Tabs } from 'antd';
import {
  SafetyCertificateOutlined,
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  DollarOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { api } from '../api/mockApi';
import PolicyAmountChecker from '../components/PolicyAmountChecker';
import type { Ticket } from '../types';

const { Option } = Select;

export default function InsurancePage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [checkerVisible, setCheckerVisible] = useState(false);
  const [regNo, setRegNo] = useState('');
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    api.getTickets().then(data => {
      setTickets(data);
      setLoading(false);
    });
  }, []);

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    const matchSearch =
      t.vehicleRegNo?.toLowerCase().includes(q) ||
      t.customerName?.toLowerCase().includes(q) ||
      t.policy?.insurer?.toLowerCase().includes(q) ||
      t.policy?.policyNumber?.toLowerCase().includes(q);
    const matchStatus = statusFilter
      ? t.policy?.insuranceStatus === statusFilter
      : true;
    return matchSearch && matchStatus;
  });

  const summaryCards = [
    {
      label: 'Total Policies',
      value: tickets.length,
      color: '#1565C0',
      bg: '#e8f0fe',
    },
    {
      label: 'Active',
      value: tickets.filter(t => t.policy?.insuranceStatus === 'Active').length,
      color: '#2e7d32',
      bg: '#e8f5e9',
    },
    {
      label: 'Expiring in 30 Days',
      value: tickets.filter(t => {
        const d = t.policy?.expiryDate;
        if (!d) return false;
        const days = Math.ceil(
          (new Date(d).getTime() - Date.now()) / 86400000
        );
        return days >= 0 && days <= 30;
      }).length,
      color: '#e65100',
      bg: '#fff3e0',
    },
    {
      label: 'Expired',
      value: tickets.filter(t => t.policy?.insuranceStatus === 'Expired')
        .length,
      color: '#c62828',
      bg: '#ffebee',
    },
  ];

  const columns = [
    {
      title: 'Policy No.',
      dataIndex: ['policy', 'policyNumber'],
      render: (v: string) => (
        <span style={{ fontWeight: 600, color: '#1565C0' }}>{v || '—'}</span>
      ),
    },
    {
      title: 'Reg. No.',
      dataIndex: 'vehicleRegNo',
      render: (v: string) => (
        <span
          style={{
            background: '#e8f0fe',
            color: '#1565C0',
            borderRadius: 6,
            padding: '2px 10px',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {v}
        </span>
      ),
    },
    {
      title: 'Owner',
      dataIndex: 'customerName',
      render: (v: string) => (
        <span style={{ fontWeight: 500 }}>{v || '—'}</span>
      ),
    },
    {
      title: 'Insurer',
      dataIndex: ['policy', 'insurer'],
      render: (v: string) => <Tag color="blue">{v || '—'}</Tag>,
    },
    {
      title: 'Policy Type',
      dataIndex: ['policy', 'policyType'],
      render: (v: string) => <Tag color="purple">{v || '—'}</Tag>,
    },
    {
      title: 'Start Date',
      dataIndex: ['policy', 'startDate'],
      render: (d: string) =>
        d ? new Date(d).toLocaleDateString('en-IN') : '—',
    },
    {
      title: 'Expiry Date',
      dataIndex: ['policy', 'expiryDate'],
      render: (d: string) => {
        if (!d) return '—';
        const days = Math.ceil(
          (new Date(d).getTime() - Date.now()) / 86400000
        );
        const color =
          days < 0 ? '#c62828' : days < 30 ? '#e65100' : '#2e7d32';
        return (
          <span style={{ color, fontWeight: 600 }}>
            {new Date(d).toLocaleDateString('en-IN')}
          </span>
        );
      },
    },
    {
      title: 'IDV',
      dataIndex: ['policy', 'idv'],
      render: (v: number) =>
        v ? `₹${v.toLocaleString('en-IN')}` : '—',
    },
    {
      title: 'Premium',
      dataIndex: ['policy', 'netPremium'],
      render: (v: number) =>
        v ? `₹${v.toLocaleString('en-IN')}` : '—',
    },
    {
      title: 'Status',
      dataIndex: ['policy', 'insuranceStatus'],
      render: (v: string) => {
        const color =
          v === 'Active'
            ? 'green'
            : v === 'Expired'
            ? 'red'
            : v === 'Pending'
            ? 'orange'
            : 'default';
        return <Tag color={color}>{v || '—'}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, r: Ticket) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={e => {
            e.stopPropagation();
            navigate(`/tickets/${r.id}`);
          }}
          style={{
            color: '#1565C0',
            borderColor: '#1565C0',
            borderRadius: 6,
            fontWeight: 600,
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* PolicyBazaar Hero Section */}
      {activeTab === '1' && (
        <div
          style={{
            background: 'linear-gradient(135deg, #E8F4F8 0%, #F0E8FF 50%, #FCE4EC 100%)',
            padding: '60px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <div style={{ display: 'flex', maxWidth: 1000, width: '100%', gap: 60, alignItems: 'center' }}>
            {/* Left Section - Illustration */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <svg viewBox="0 0 300 300" style={{ width: '100%', maxWidth: 320, height: 'auto' }}>
                {/* Tree */}
                <g transform="translate(60, 220)">
                  <rect x="-3" y="0" width="6" height="25" fill="#8B6F47" />
                  <path d="M 0 0 L -20 12 L -8 12 L -28 25 L -12 25 L -32 38 L 32 38 L 12 25 L 25 25 L 5 12 L 20 12 Z" fill="#66BB6A" />
                </g>

                {/* Car */}
                <g transform="translate(160, 160)">
                  <ellipse cx="0" cy="0" rx="85" ry="40" fill="#9C5DE8" opacity="0.08" />
                  <rect x="-75" y="-28" width="150" height="45" rx="10" fill="#6366F1" />
                  <rect x="-65" y="-40" width="55" height="22" rx="8" fill="#818CF8" />
                  <rect x="15" y="-40" width="55" height="22" rx="8" fill="#818CF8" />
                  {/* Windows */}
                  <rect x="-65" y="-38" width="50" height="18" rx="6" fill="rgba(255,255,255,0.3)" />
                  <rect x="18" y="-38" width="50" height="18" rx="6" fill="rgba(255,255,255,0.3)" />
                  {/* Wheels */}
                  <circle cx="-50" cy="30" r="14" fill="#333" />
                  <circle cx="50" cy="30" r="14" fill="#333" />
                  <circle cx="-50" cy="30" r="9" fill="#666" />
                  <circle cx="50" cy="30" r="9" fill="#666" />
                  {/* Door line */}
                  <line x1="0" y1="-28" x2="0" y2="17" stroke="#fff" strokeWidth="1" opacity="0.4" />
                </g>

                {/* Insurance Document */}
                <g transform="translate(85, 95)">
                  <rect x="0" y="0" width="60" height="85" rx="6" fill="#B3E5FC" stroke="#0277BD" strokeWidth="2" />
                  <text x="30" y="28" fontSize="14" fontWeight="700" fill="#0277BD" textAnchor="middle" fontFamily="Arial">
                    INSURANCE
                  </text>
                  <line x1="8" y1="38" x2="52" y2="38" stroke="#0277BD" strokeWidth="1" />
                  <circle cx="48" cy="62" r="8" fill="#4CAF50" />
                  <text x="48" y="67" fontSize="11" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="Arial">
                    ✓
                  </text>
                </g>

                {/* Shield */}
                <g transform="translate(240, 100)">
                  <path
                    d="M 0 5 L 0 45 C 0 65 18 78 35 85 C 52 78 70 65 70 45 L 70 5 Z"
                    fill="#4CAF50"
                    stroke="#2E7D32"
                    strokeWidth="2"
                  />
                  <circle cx="35" cy="40" r="14" fill="#fff" />
                  <text x="35" y="47" fontSize="18" fontWeight="700" fill="#4CAF50" textAnchor="middle" fontFamily="Arial">
                    ✓
                  </text>
                </g>
              </svg>
            </div>

            {/* Right Section - Form */}
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: '#1f1f1f',
                  margin: '0 0 8px 0',
                  lineHeight: 1.2,
                  marginBottom: 16,
                }}
              >
                Compare &{' '}
                <span style={{ color: '#2e7d32', fontWeight: 800 }}>
                  save upto 91%*
                </span>
              </h2>

              <p
                style={{
                  fontSize: 20,
                  color: '#666',
                  margin: '0 0 20px 0',
                  fontWeight: 500,
                }}
              >
                on Car insurance
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#f1f8e9',
                  color: '#2e7d32',
                  padding: '8px 16px',
                  borderRadius: 24,
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 28,
                }}
              >
                ⚡ Get policy in 10 minutes*
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <Input
                  placeholder="Enter car number (eg. DL-10-CB-1234)"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  style={{
                    fontSize: 14,
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid #ddd',
                    height: 48,
                  }}
                />
              </div>

              <Button
                block
                style={{
                  background: '#FF6B5B',
                  color: '#fff',
                  border: 'none',
                  height: 48,
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: 8,
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onClick={() => setCheckerVisible(true)}
              >
                View Prices
                <ArrowRightOutlined />
              </Button>

              <div style={{ textAlign: 'center', color: '#666', fontSize: 13 }}>
                Brand new car?{' '}
                <a
                  href="#"
                  style={{ color: '#2e7d32', fontWeight: 600, textDecoration: 'none' }}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/tickets/new');
                  }}
                >
                  Click here {'>'}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Policies Tab */}
      {activeTab === '2' && (
        <div style={{ padding: 32 }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <SafetyCertificateOutlined
                  style={{ fontSize: 32, color: '#1565C0' }}
                />
                <div>
                  <div
                    style={{ fontSize: 26, fontWeight: 800, color: '#1565C0' }}
                  >
                    Insurance Policies
                  </div>
                  <div style={{ color: '#666', fontSize: 13 }}>
                    Manage all insurance policies across tickets
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, #1565C0, #1976D2)',
                    borderRadius: 10,
                    fontWeight: 700,
                  }}
                  onClick={() => navigate('/tickets/new')}
                >
                  New Policy
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginBottom: 24,
              flexWrap: 'wrap',
            }}
          >
            {[
              {
                label: 'Total Policies',
                value: tickets.length,
                color: '#1565C0',
                bg: '#e8f0fe',
              },
              {
                label: 'Active',
                value: tickets.filter(t => t.policy?.insuranceStatus === 'Active')
                  .length,
                color: '#2e7d32',
                bg: '#e8f5e9',
              },
              {
                label: 'Expiring in 30 Days',
                value: tickets.filter(t => {
                  const d = t.policy?.expiryDate;
                  if (!d) return false;
                  const days = Math.ceil(
                    (new Date(d).getTime() - Date.now()) / 86400000
                  );
                  return days >= 0 && days <= 30;
                }).length,
                color: '#e65100',
                bg: '#fff3e0',
              },
              {
                label: 'Expired',
                value: tickets.filter(t => t.policy?.insuranceStatus === 'Expired')
                  .length,
                color: '#c62828',
                bg: '#ffebee',
              },
            ].map(c => (
              <div
                key={c.label}
                style={{
                  flex: 1,
                  minWidth: 160,
                  background: c.bg,
                  borderRadius: 14,
                  padding: '20px 24px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <div
                  style={{ fontSize: 36, fontWeight: 800, color: c.color }}
                >
                  {c.value}
                </div>
                <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                  {c.label}
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: '18px 24px',
              boxShadow: '0 2px 16px rgba(21,101,192,0.08)',
              marginBottom: 20,
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Input
              placeholder="Search by reg. no., owner, insurer, policy no..."
              prefix={<SearchOutlined style={{ color: '#1565C0' }} />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 360, borderRadius: 8 }}
              allowClear
            />
            <Select
              placeholder="Filter by status"
              allowClear
              style={{ width: 200 }}
              onChange={(v: string | undefined) => setStatusFilter(v ?? '')}
            >
              <Option value="Active">Active</Option>
              <Option value="Expired">Expired</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
            <span style={{ color: '#888', fontSize: 13 }}>
              {filtered.length} of {tickets.length} policies
            </span>
          </div>

          {/* Table */}
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 2px 16px rgba(21,101,192,0.08)',
              overflow: 'hidden',
            }}
          >
            <Table
              columns={columns}
              dataSource={filtered}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 12, showSizeChanger: false }}
              scroll={{ x: 1300 }}
              onRow={r => ({
                onClick: () => navigate(`/tickets/${r.id}`),
                style: { cursor: 'pointer' },
              })}
            />
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'center',
          padding: '12px 0',
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            size="large"
            type={activeTab === '1' ? 'primary' : 'default'}
            style={{
              background: activeTab === '1' ? '#2e7d32' : '#f0f0f0',
              color: activeTab === '1' ? '#fff' : '#666',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
            }}
            onClick={() => setActiveTab('1')}
          >
            Check Policy Amount
          </Button>
          <Button
            size="large"
            type={activeTab === '2' ? 'primary' : 'default'}
            style={{
              background: activeTab === '2' ? '#1565C0' : '#f0f0f0',
              color: activeTab === '2' ? '#fff' : '#666',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
            }}
            onClick={() => setActiveTab('2')}
          >
            Manage Policies
          </Button>
        </div>
      </div>

      {/* Policy Amount Checker Modal */}
      <PolicyAmountChecker
        visible={checkerVisible}
        onClose={() => setCheckerVisible(false)}
      />
    </div>
  );
}