import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import { store } from './store';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';
import TicketsPage from './pages/TicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';
import TicketFormPage from './pages/TicketFormPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CalendarPage from './pages/CalendarPage';
import TimesheetPage from './pages/TimesheetPage';
import type { UserRole } from './types';

// ── Auth guard ────────────────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = sessionStorage.getItem('tms_token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

// ── Role guard — redirects if role not allowed ────────────────────────────────
function RoleRoute({ allowed, children }: { allowed: UserRole[]; children: React.ReactNode }) {
  const userRaw = sessionStorage.getItem('tms_user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const role: UserRole = user?.role ?? 'Agent';

  if (!allowed.includes(role)) {
    // Agent → timesheet, others → dashboard
    return <Navigate to={role === 'Agent' ? '/timesheet' : '/dashboard'} replace />;
  }
  return <>{children}</>;
}

// ── Default route per role ────────────────────────────────────────────────────
function RoleHome() {
  const userRaw = sessionStorage.getItem('tms_user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const role: UserRole = user?.role ?? 'Agent';
  return <Navigate to={role === 'Agent' ? '/timesheet' : '/dashboard'} replace />;
}

// ── Placeholder for unbuilt pages ─────────────────────────────────────────────
function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
      <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14 }}>Coming in the next sprint</div>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ConfigProvider theme={{ token: { colorPrimary: '#C8102E', borderRadius: 8 } }}>
        <BrowserRouter>
          <Routes>
            <Route path="/login"            element={<LoginPage />} />
            <Route path="/register"         element={<RegisterPage />} />
            <Route path="/forgot-password"  element={<ForgotPasswordPage />} />

            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              {/* Default redirect based on role */}
              <Route index element={<RoleHome />} />

              {/* ── Admin + Employee ── */}
              <Route path="dashboard" element={
                <RoleRoute allowed={['Admin', 'Employee']}>
                  <DashboardPage />
                </RoleRoute>
              } />
              <Route path="board" element={
                <RoleRoute allowed={['Admin', 'Employee']}>
                  <BoardPage />
                </RoleRoute>
              } />
              <Route path="tickets" element={
                <RoleRoute allowed={['Admin', 'Employee']}>
                  <TicketsPage />
                </RoleRoute>
              } />
              <Route path="tickets/new" element={
                <RoleRoute allowed={['Admin', 'Employee']}>
                  <TicketFormPage />
                </RoleRoute>
              } />
              <Route path="tickets/:id" element={
                <RoleRoute allowed={['Admin', 'Employee']}>
                  <TicketDetailPage />
                </RoleRoute>
              } />
              <Route path="analytics" element={
                <RoleRoute allowed={['Admin', 'Employee']}>
                  <AnalyticsPage />
                </RoleRoute>
              } />
              <Route path="calendar" element={
                <RoleRoute allowed={['Admin', 'Employee']}>
                  <CalendarPage />
                </RoleRoute>
              } />

              {/* ── All roles — but TimesheetPage handles per-role view internally ── */}
              <Route path="timesheet" element={
                <RoleRoute allowed={['Admin', 'Employee', 'Agent']}>
                  <TimesheetPage />
                </RoleRoute>
              } />

              {/* ── Admin only ── */}
              <Route path="renewals" element={
                <RoleRoute allowed={['Admin']}>
                  <Placeholder title="Renewals" />
                </RoleRoute>
              } />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </Provider>
  );
}
