import insuranceBg from "../assets/insurance-bg.png";
import React, { useState, useRef } from 'react';
import { message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/mockApi';
import { useAppDispatch } from '../store';
import { loginSuccess } from '../store';

export default function LoginPage() {
  const [tab, setTab] = useState<'account' | 'otp'>('account');
  const [step, setStep] = useState<1 | 2>(1);
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSend = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      message.error('Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      const res = await api.sendOTP(`+91${mobile}`);
      setSessionId(res.sessionId);
      setStep(2);
      message.success('OTP sent! (demo: any 6 digits work)');
      setTimeout(() => refs.current[0]?.focus(), 100);
    } catch {
      message.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handleOtpChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp]; next[i] = v; setOtp(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { message.error('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      const res = await api.verifyOTP(`+91${mobile}`, code, sessionId);
      dispatch(loginSuccess({ token: res.token, user: res.user }));
      message.success(`Welcome, ${res.user.name}!`);
      navigate('/dashboard', { replace: true });
    } catch {
      message.error('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const USERS: Record<string, { password: string; name: string; role: string }> = {
  rajesh:    { password: 'Rajesh@2026',  name: 'Rajesh',    role: 'admin'    },
  haripriya: { password: 'Rajesh@2026e', name: 'Haripriya', role: 'employee' },
  agent:     { password: 'Rajesh@2026a', name: 'Agent',     role: 'agent'    },
};

const handleAccountLogin = async () => {
  if (!email || !password) {
    message.error('Enter username and password');
    return;
  }

  const usernameLower = email.trim().toLowerCase();
  const matched = USERS[usernameLower];

  if (!matched) {
    message.error('Invalid username');
    return;
  }

  if (matched.password !== password) {
    message.error('Invalid password');
    return;
  }

  setLoading(true);
  try {
    const res = await api.verifyOTP(email, password, '');
    dispatch(loginSuccess({ token: res.token, user: { ...res.user, name: matched.name, role: matched.role } }));
    message.success(`Welcome, ${matched.name}!`);
    navigate('/dashboard', { replace: true });
  } catch {
    // Even if mock API fails, allow login with valid credentials
    dispatch(loginSuccess({ token: 'local-token', user: { name: matched.name, role: matched.role, email } }));
    message.success(`Welcome, ${matched.name}!`);
    navigate('/dashboard', { replace: true });
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={s.page}>

      {/* ── LEFT PANEL 40% ── */}
      <div style={s.left}>
        <div style={{ textAlign: 'center', marginBottom: 24, position: 'absolute', top: 32, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#1565C0', letterSpacing: 0.5, lineHeight: 1.3 }}>Ask Us</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#1565C0', letterSpacing: 0.5, lineHeight: 1.3 }}>Global Solutions</div>
        </div>
        <h1 style={s.hello}>Hello!</h1>
        <p style={s.subtitle}>Welcome back. Please sign in to continue.</p>

        <div style={s.tabBar}>
          <button
            style={{ ...s.tab, ...(tab === 'account' ? s.tabActive : {}) }}
            onClick={() => { setTab('account'); setStep(1); }}
          >
            Account
          </button>
          <button
            style={{ ...s.tab, ...(tab === 'otp' ? s.tabActive : {}) }}
            onClick={() => { setTab('otp'); setStep(1); setOtp(['','','','','','']); }}
          >
            Mobile OTP
          </button>
        </div>

        {tab === 'account' && (
          <div style={s.form}>
            <label style={s.label}>Username / Email</label>
            <input
              type="text"
              placeholder="Enter your email or username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={s.input}
            />
            <label style={s.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={s.input}
            />
            <div style={{ textAlign: 'right', marginBottom: 14 }}>
              <a href="/forgot-password" style={s.link}>Forgot Password?</a>
            </div>
            <button style={s.primaryBtn} onClick={handleAccountLogin} disabled={loading}>
              {loading ? <Spin size="small" /> : 'Log In'}
            </button>
          </div>
        )}

        {tab === 'otp' && (
          <div style={s.form}>
            {step === 1 ? (
              <>
                <label style={s.label}>Mobile Number</label>
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  <input
                    type="text"
                    value="+91"
                    readOnly
                    style={{ ...s.input, width: 52, textAlign: 'center', marginBottom: 0 }}
                  />
                  <input
                    type="tel"
                    placeholder="Enter mobile number"
                    value={mobile}
                    maxLength={10}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    style={{ ...s.input, flex: 1, marginBottom: 0 }}
                  />
                </div>
                <button style={s.primaryBtn} onClick={handleSend} disabled={loading}>
                  {loading ? <Spin size="small" /> : 'Send OTP'}
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 14, textAlign: 'center' }}>
                  OTP sent to +91 {mobile} ·{' '}
                  <span
                    style={{ color: '#1565C0', cursor: 'pointer', fontWeight: 500 }}
                    onClick={() => { setStep(1); setOtp(['','','','','','']); }}
                  >
                    Change
                  </span>
                </div>
                <label style={s.label}>Enter OTP</label>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      ref={el => { refs.current[i] = el; }}
                      type="text"
                      maxLength={1}
                      value={d}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKey(i, e)}
                      style={{
                        ...s.otpBox,
                        borderColor: d ? '#1565C0' : '#e0e0e0',
                        background: d ? '#f0f5ff' : '#f9f9f9',
                      }}
                    />
                  ))}
                </div>
                <p style={{ fontSize: 11, color: '#888', marginBottom: 14 }}>
                  Didn't receive?{' '}
                  <span
                    style={{ color: '#1565C0', cursor: 'pointer', fontWeight: 500 }}
                    onClick={async () => {
                      setOtp(['','','','','','']);
                      await api.sendOTP(`+91${mobile}`);
                      message.success('OTP resent!');
                    }}
                  >
                    Resend OTP
                  </span>
                </p>
                <button style={s.primaryBtn} onClick={handleVerify} disabled={loading}>
                  {loading ? <Spin size="small" /> : 'Verify & Login'}
                </button>
              </>
            )}
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#888' }}>
          Don't have an account?{' '}
          <a href="/register" style={{ ...s.link, fontWeight: 600 }}>Register</a>
        </p>
      </div>

      {/* ── RIGHT PANEL 60% ── */}
      <div style={{ ...s.right, backgroundImage: `url(${insuranceBg})` }}>
        <div style={s.topStrip} />
        <div style={s.bottomStrip} />
        <div style={s.overlay} />

        <div style={s.topNav}>
          <a href="#" style={s.navLink}>Sign Up</a>
          <a href="#" style={s.navBtn}>Join Us</a>
        </div>

        {/* Brand at top center of right panel */}
        <div style={{ position: 'absolute', top: 20, left: 0, right: 0, textAlign: 'center', zIndex: 2 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: 0.5, lineHeight: 1.3, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>Ask Us</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: 0.5, lineHeight: 1.3, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>Global Solutions</div>
        </div>

        {/* Bottom content */}
        <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center', zIndex: 2, padding: '0 32px' }}>
          <p style={s.rightHeading}>Your Trusted<br />Insurance Partner</p>
          <div style={s.dividerThin} />
          <p style={s.tagline}>Get the right coverage,<br />without the hassle</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={s.badge}>
              <span style={s.badgeText}>Insurance Policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  /* LEFT 40% */
  left: {
    flex: 3,
    background: 'linear-gradient(145deg, #e8f0fe 0%, #f0e8ff 50%, #fce4ec 100%)',
    padding: '36px 144px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
  },
  hello: {
    fontSize: 22,
    fontWeight: 600,
    color: '#111',
    margin: '0 0 4px',
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    margin: '0 0 20px',
  },
  tabBar: {
    display: 'flex',
    background: '#f3f4f6',
    borderRadius: 8,
    padding: 3,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    padding: '7px 0',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    background: 'transparent',
    color: '#888',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#1565C0',
    color: '#fff',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: 11,
    color: '#666',
    marginBottom: 5,
    marginTop: 3,
  },
  input: {
    padding: '8px 12px',
    borderRadius: 7,
    border: '1px solid #e0e0e0',
    background: '#f9f9f9',
    fontSize: 12,
    color: '#111',
    marginBottom: 10,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  otpBox: {
    width: 38,
    height: 38,
    textAlign: 'center',
    borderRadius: 7,
    border: '1.5px solid #e0e0e0',
    background: '#f9f9f9',
    fontSize: 16,
    fontWeight: 700,
    color: '#111',
    outline: 'none',
    transition: 'all 0.15s',
  },
  primaryBtn: {
    width: '100%',
    padding: '9px 0',
    background: '#1565C0',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 4,
  },
  link: {
    color: '#1565C0',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: 11,
  },
  /* RIGHT 60% */
  right: {
    flex: 7,
    position: 'relative',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  topStrip: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 56,
    background: 'linear-gradient(to bottom, rgba(30,90,30,0.98) 55%, transparent 100%)',
    zIndex: 1,
  },
  bottomStrip: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 72,
    background: 'linear-gradient(to top, rgba(30,90,30,0.98) 55%, transparent 100%)',
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(10,50,10,0.38)',
    zIndex: 1,
  },
  topNav: {
    position: 'absolute',
    top: 16, right: 20,
    display: 'flex',
    gap: 12,
    zIndex: 2,
  },
  navLink: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    textDecoration: 'none',
  },
  navBtn: {
    fontSize: 13,
    color: '#fff',
    background: 'rgba(255,255,255,0.15)',
    padding: '5px 16px',
    borderRadius: 20,
    textDecoration: 'none',
    border: '1px solid rgba(255,255,255,0.35)',
  },
  rightContent: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    padding: '32px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  brandHeading: {
    fontSize: 36,
    fontWeight: 800,
    color: '#fff',
    lineHeight: 1.3,
    margin: '0 0 4px',
    letterSpacing: 0.5,
    textShadow: '0 2px 10px rgba(0,0,0,0.7)',
  },
  dividerThick: {
    width: 50,
    height: 3,
    background: 'rgba(255,255,255,0.7)',
    borderRadius: 2,
    margin: '14px auto 18px',
  },
  rightHeading: {
    fontSize: 20,
    fontWeight: 600,
    color: '#fff',
    lineHeight: 1.4,
    margin: '0 0 12px',
    textShadow: '0 2px 8px rgba(0,0,0,0.6)',
  },
  dividerThin: {
    width: 36,
    height: 1.5,
    background: 'rgba(255,255,255,0.45)',
    borderRadius: 2,
    margin: '0 auto 16px',
  },
  tagline: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
    lineHeight: 1.85,
    margin: '0 0 20px',
    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
  },
  badge: {
    display: 'inline-block',
    padding: '8px 26px',
    borderRadius: 24,
    border: '1.5px solid rgba(255,255,255,0.5)',
    background: 'rgba(255,255,255,0.15)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 600,
    color: '#fff',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
};
