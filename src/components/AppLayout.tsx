import React from 'react';
import { Layout, Badge, Dropdown, Button, message, Tag, Tooltip } from 'antd';
import {
  DashboardOutlined, AppstoreOutlined, UnorderedListOutlined, BarChartOutlined, LogoutOutlined, BellOutlined, PlusOutlined, CalendarOutlined,
  FileExcelOutlined, LockOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store';
import type { UserRole } from '../types';

const { Header, Sider, Content } = Layout;

// ── Role config ───────────────────────────────────────────────────────────────
const ROLE_COLOR: Record<UserRole, string> = {
  Admin: '#C8102E', Employee: '#1677ff', Agent: '#52c41a',
};
const ROLE_BG: Record<UserRole, string> = {
  Admin: '#fff1f0', Employee: '#e6f4ff', Agent: '#f6ffed',
};

// ── Nav items per role ────────────────────────────────────────────────────────
interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
  roles: UserRole[];        // which roles can see this
  badge?: number;
  dividerBefore?: boolean;
}

const ALL_NAV: NavItem[] = [
  { path: '/dashboard', icon: <DashboardOutlined />,      label: 'Dashboard',    roles: ['Admin', 'Employee'] },
  { path: '/board',     icon: <AppstoreOutlined />,       label: 'My Tickets',   roles: ['Admin', 'Employee'], badge: 59 },
  { path: '/tickets',   icon: <UnorderedListOutlined />,  label: 'All Tickets',  roles: ['Admin', 'Employee'] },
  { path: '/analytics', icon: <BarChartOutlined />,       label: 'Analytics',    roles: ['Admin', 'Employee'] },
  { path: '/calendar',  icon: <CalendarOutlined />,       label: 'Calendar',     roles: ['Admin', 'Employee'], dividerBefore: true },
  { path: '/timesheet', icon: <FileExcelOutlined />,      label: 'Time Sheet',   roles: ['Admin', 'Employee', 'Agent'], dividerBefore: true },
];

export default function AppLayout() {
  const navigate   = useNavigate();
  const { pathname } = useLocation();
  const dispatch   = useAppDispatch();
  const user       = useAppSelector(s => s.auth.user);
  const role       = (user?.role ?? 'Agent') as UserRole;
  const initials   = (user?.name ?? 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const doLogout = () => {
    dispatch(logout());
    message.success('Logged out');
    navigate('/login', { replace: true });
  };

  // Filter nav by role
  const navLinks = ALL_NAV.filter(n => n.roles.includes(role));

  // Agent: redirect to timesheet if on restricted route
  const agentHome = '/timesheet';

  return (
    <Layout style={{ minHeight: '100vh' }}>

      {/* ── Header ── */}
      <Header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#fff', borderBottom: '1px solid #f0f0f0',
        padding: '0 20px', position: 'sticky', top: 0, zIndex: 100, height: 52,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: '#C8102E', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 17, flexShrink: 0,
          }}>A</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111', lineHeight: '18px' }}>
              Ask Us Global Solutions
            </div>
            <div style={{ fontSize: 10, color: '#999', lineHeight: '14px' }}>
              Insurance Management System
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* New ticket — Admin & Employee only */}
          {(role === 'Admin' || role === 'Employee') && (
            <Button type="primary" icon={<PlusOutlined />} size="small"
              onClick={() => navigate('/tickets/new')}
              style={{ background: '#C8102E', borderColor: '#C8102E', fontSize: 12 }}>
              New Ticket
            </Button>
          )}

          {/* Bell — Admin & Employee */}
          {(role === 'Admin' || role === 'Employee') && (
            <Badge count={4} size="small">
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer', color: '#555' }} />
            </Badge>
          )}

          {/* Role badge */}
          <Tag color={ROLE_COLOR[role]} style={{ fontWeight: 600, fontSize: 11, margin: 0 }}>
            {role}
          </Tag>

          {/* User avatar + dropdown */}
          <Dropdown menu={{ items: [
            { key: 'profile', label: <span><UserOutlined /> {user?.name}</span>, disabled: true },
            { key: 'email',   label: <span style={{ fontSize: 11, color: '#8c8c8c' }}>{user?.email ?? user?.mobile}</span>, disabled: true },
            { type: 'divider' },
            { key: 'logout', label: 'Log out', icon: <LogoutOutlined />, danger: true, onClick: doLogout },
          ]}}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: ROLE_BG[role], color: ROLE_COLOR[role],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 12, cursor: 'pointer',
              border: `2px solid ${ROLE_COLOR[role]}33`,
            }}>
              {initials}
            </div>
          </Dropdown>
        </div>
      </Header>

      <Layout>
        {/* ── Sidebar ── */}
        <Sider width={200} style={{ background: '#fff', borderRight: '1px solid #f0f0f0', position: 'relative' }}>
          <div style={{ paddingTop: 8 }}>
            {navLinks.map(nav => {
              const active = pathname === nav.path || pathname.startsWith(nav.path + '/');
              return (
                <React.Fragment key={nav.path}>
                  {nav.dividerBefore && <div style={{ height: 1, background: '#f0f0f0', margin: '6px 8px' }} />}
                  <div
                    onClick={() => navigate(nav.path)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      padding: '8px 16px', margin: '2px 8px',
                      borderRadius: 7, cursor: 'pointer', fontSize: 13,
                      background: active ? '#fff1f0' : 'transparent',
                      color: active ? '#C8102E' : '#555',
                      fontWeight: active ? 600 : 400,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#f5f5f5'; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    {nav.icon}
                    <span style={{ flex: 1 }}>{nav.label}</span>
                    {nav.badge && <Badge count={nav.badge} style={{ background: '#C8102E', fontSize: 10 }} />}
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Role info + logout at bottom */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: 12, borderTop: '1px solid #f0f0f0', background: '#fff',
          }}>
            {/* Role description */}
            <div style={{
              fontSize: 10, color: '#8c8c8c', marginBottom: 8, padding: '0 4px',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <LockOutlined />
              {role === 'Admin' && 'Full access'}
              {role === 'Employee' && 'View + edit access'}
              {role === 'Agent' && 'Attendance entry only'}
            </div>
            <div
              onClick={doLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', borderRadius: 7, cursor: 'pointer',
                color: '#cf1322', fontSize: 13, fontWeight: 500,
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fff1f0'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <LogoutOutlined /> Log out
            </div>
          </div>
        </Sider>

        {/* ── Content ── */}
        <Content style={{ background: '#f8f8f8', padding: 20, overflow: 'auto', minHeight: 'calc(100vh - 52px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
