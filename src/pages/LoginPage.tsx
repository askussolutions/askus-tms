import insuranceBg from "../assets/insurance-bg.png";
import React, { useState, useRef, useEffect } from 'react';
import { message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  type ConfirmationResult,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { MOCK_USERS } from '../api/mockApi';
import { api } from '../api/mockApi';
import { useAppDispatch } from '../store';
import { loginSuccess } from '../store';

const FIREBASE_CONFIGURED = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_API_KEY !== 'your_api_key_here'
);

export default function LoginPage() {
  const [tab, setTab]                   = useState<'account' | 'otp' | 'google'>('account');
  const [step, setStep]                 = useState<1 | 2>(1);
  const [mobile, setMobile]             = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [otp, setOtp]                   = useState(['', '', '', '', '', '']);
  const [loading, setLoading]           = useState(false);
  const [resendTimer, setResendTimer]   = useState(0);
  const [recaptchaOk, setRecaptchaOk]   = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const refs         = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // ── Render visible reCAPTCHA whenever OTP tab / step 1 is shown ───────────
  useEffect(() => {
    if (tab !== 'otp' || step !== 1 || !FIREBASE_CONFIGURED) return;

    setRecaptchaOk(false);
    const timer = setTimeout(() => {
      try {
        recaptchaRef.current?.clear();
        recaptchaRef.current = null;
        recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'normal',
          callback:          () => setRecaptchaOk(true),
          'expired-callback': () => setRecaptchaOk(false),
        });
        recaptchaRef.current.render().catch(console.error);
      } catch { /* ignore */ }
    }, 150);

    return () => {
      clearTimeout(timer);
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    };
  }, [tab, step]);

  // Cleanup on unmount
  useEffect(() => () => { recaptchaRef.current?.clear(); recaptchaRef.current = null; }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setInterval(() => setResendTimer(t => t - 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resendTimer]);

  // ── OTP: Send ──────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      message.error('Enter a valid 10-digit Indian mobile number');
      return;
    }
    setLoading(true);
    try {
      if (FIREBASE_CONFIGURED) {
        if (!recaptchaRef.current) {
          message.error('reCAPTCHA not ready. Please wait a moment.');
          return;
        }
        const result = await signInWithPhoneNumber(auth, `+91${mobile}`, recaptchaRef.current);
        setConfirmation(result);
        setStep(2);
        setResendTimer(30);
        message.success('OTP sent to +91 ' + mobile);
        setTimeout(() => refs.current[0]?.focus(), 100);
      } else {
        setConfirmation(null);
        setStep(2);
        setResendTimer(30);
        message.success('Demo mode: any 6 digits work as OTP');
        setTimeout(() => refs.current[0]?.focus(), 100);
      }
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Failed to send OTP');
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
      setRecaptchaOk(false);
    } finally {
      setLoading(false);
    }
  };

  // ── OTP: Resend — go back to step 1, reCAPTCHA re-renders via useEffect ───
  const handleResend = () => {
    if (resendTimer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setConfirmation(null);
    setStep(1);
  };

  // ── OTP: Verify ────────────────────────────────────────────────────────────
  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { message.error('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      if (FIREBASE_CONFIGURED && confirmation) {
        await confirmation.confirm(code);
        const res = await api.verifyOTP(`+91${mobile}`, code, 'firebase-verified');
        dispatch(loginSuccess({ token: res.token, user: res.user }));
        message.success(`Welcome, ${res.user.name}!`);
        navigate('/dashboard', { replace: true });
      } else {
        const res = await api.verifyOTP(`+91${mobile}`, code, 'mock-session-demo');
        dispatch(loginSuccess({ token: res.token, user: res.user }));
        message.success(`Welcome, ${res.user.name}!`);
        navigate('/dashboard', { replace: true });
      }
    } catch {
      message.error('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input helpers ──────────────────────────────────────────────────────
  const handleOtpChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp]; next[i] = v; setOtp(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'Enter') handleVerify();
  };

  // ── Google OAuth login ─────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result   = await signInWithPopup(auth, provider);
      const gEmail   = result.user.email?.toLowerCase() ?? '';
      const entry    = Object.values(MOCK_USERS).find(u => u.email === gEmail);
      const appUser  = entry ?? {
        ...MOCK_USERS.admin,
        name:  result.user.displayName ?? MOCK_USERS.admin.name,
        email: result.user.email       ?? MOCK_USERS.admin.email,
      };
      dispatch(loginSuccess({ token: 'google-jwt-' + Date.now(), user: appUser }));
      message.success(`Welcome, ${appUser.name}!`);
      navigate(appUser.role === 'Agent' ? '/timesheet' : '/dashboard', { replace: true });
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Account login ──────────────────────────────────────────────────────────
  const handleAccountLogin = async () => {
    if (!email.trim() || !password.trim()) {
      message.error('Enter email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await api.verifyOTP(email.trim(), password.trim(), '');
      dispatch(loginSuccess({ token: res.token, user: res.user }));
      message.success(`Welcome, ${res.user.name}!`);
      navigate(res.user.role === 'Agent' ? '/timesheet' : '/dashboard', { replace: true });
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
      <div style={s.left}>
        <div style={s.brandTop}>
          <div style={s.brandName}>Ask Us</div>
          <div style={s.brandName}>Global Solutions</div>
        </div>

        <h1 style={s.hello}>Hello!</h1>
        <p style={s.subtitle}>Welcome back. Please sign in to continue.</p>

        {/* Tab bar */}
        <div style={s.tabBar}>
          <button
            style={{ ...s.tab, ...(tab === 'account' ? s.tabActive : {}) }}
            onClick={() => { setTab('account'); setStep(1); }}
          >
            Account
          </button>
          <button
            style={{ ...s.tab, ...(tab === 'otp' ? s.tabActive : {}) }}
            onClick={() => { setTab('otp'); setStep(1); setOtp(['','','','','','']); setConfirmation(null); }}
          >
            Mobile OTP
          </button>
          <button
            style={{ ...s.tab, ...(tab === 'google' ? s.tabActive : {}) }}
            onClick={() => { setTab('google'); setStep(1); }}
          >
            Google
          </button>
        </div>

        {/* ── Account tab ── */}
        {tab === 'account' && (
          <div style={s.form}>
            <label style={s.label}>Username / Email</label>
            <input
              type="text"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAccountLogin()}
              style={s.input}
              autoFocus
            />
            <label style={s.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAccountLogin()}
              style={s.input}
            />
            <div style={{ textAlign: 'right', marginBottom: 14 }}>
              <a href="/forgot-password" style={s.link}>Forgot Password?</a>
            </div>
            <button style={s.primaryBtn} onClick={handleAccountLogin} disabled={loading}>
              {loading ? <Spin size="small" /> : 'Log In'}
            </button>
            <div style={s.credHint}>
              <div style={s.credTitle}>Demo credentials</div>
              <div style={s.credRow}><span style={s.credRole}>Admin</span>admin@askus.com · admin123</div>
              <div style={s.credRow}><span style={s.credRole}>Employee</span>employee@askus.com · emp123</div>
              <div style={s.credRow}><span style={s.credRole}>Agent</span>agent@askus.com · agent123</div>
            </div>
          </div>
        )}

        {/* ── OTP tab ── */}
        {tab === 'otp' && (
          <div style={s.form}>
            {step === 1 ? (
              <>
                <label style={s.label}>Mobile Number</label>
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  <input
                    type="text" value="+91" readOnly
                    style={{ ...s.input, width: 52, textAlign: 'center', marginBottom: 0 }}
                  />
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={mobile}
                    maxLength={10}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={e => e.key === 'Enter' && recaptchaOk && handleSend()}
                    style={{ ...s.input, flex: 1, marginBottom: 0 }}
                    autoFocus
                  />
                </div>

                {/* Visible reCAPTCHA renders here */}
                {FIREBASE_CONFIGURED && (
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 10px' }}>
                    <div id="recaptcha-container" />
                  </div>
                )}

                {!FIREBASE_CONFIGURED && (
                  <div style={s.warningBox}>
                    Firebase not configured — demo mode. Any 6 digits work as OTP.
                  </div>
                )}

                <button
                  style={{
                    ...s.primaryBtn,
                    opacity: (FIREBASE_CONFIGURED && !recaptchaOk) ? 0.5 : 1,
                    cursor:  (FIREBASE_CONFIGURED && !recaptchaOk) ? 'not-allowed' : 'pointer',
                  }}
                  onClick={handleSend}
                  disabled={loading || (FIREBASE_CONFIGURED && !recaptchaOk)}
                >
                  {loading ? <Spin size="small" /> : 'Send OTP'}
                </button>

                {FIREBASE_CONFIGURED && !recaptchaOk && (
                  <p style={{ fontSize: 10, color: '#999', textAlign: 'center', marginTop: 6 }}>
                    Complete the reCAPTCHA above to enable Send OTP
                  </p>
                )}
              </>
            ) : (
              <>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 14, textAlign: 'center' }}>
                  OTP sent to <strong>+91 {mobile}</strong> ·{' '}
                  <span style={s.inlineLink} onClick={() => { setStep(1); setOtp(['','','','','','']); setConfirmation(null); }}>
                    Change
                  </span>
                </div>

                <label style={s.label}>Enter 6-digit OTP</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10, justifyContent: 'center' }}>
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      ref={el => { refs.current[i] = el; }}
                      type="text" inputMode="numeric" maxLength={1}
                      value={d}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKey(i, e)}
                      style={{
                        ...s.otpBox,
                        borderColor: d ? '#1565C0' : '#e0e0e0',
                        background:  d ? '#f0f5ff' : '#f9f9f9',
                      }}
                    />
                  ))}
                </div>

                <p style={{ fontSize: 11, color: '#888', marginBottom: 14, textAlign: 'center' }}>
                  {resendTimer > 0
                    ? `Resend OTP in ${resendTimer}s`
                    : <>Didn't receive?{' '}
                        <span style={s.inlineLink} onClick={handleResend}>Resend OTP</span>
                      </>
                  }
                </p>

                <button style={s.primaryBtn} onClick={handleVerify} disabled={loading}>
                  {loading ? <Spin size="small" /> : 'Verify & Login'}
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Google tab ── */}
        {tab === 'google' && (
          <div style={s.form}>
            <div style={{ textAlign: 'center', marginBottom: 20, marginTop: 8 }}>
              <p style={{ fontSize: 12, color: '#666', margin: '0 0 20px' }}>
                Sign in with your Google / Gmail account
              </p>
              <button style={s.googleBtn} onClick={handleGoogleLogin} disabled={loading}>
                {loading ? <Spin size="small" /> : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.3 33.6 29.7 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.4-.2-2.7-.5-4z"/>
                      <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-8 0-14.8 4.6-17.7 11.7z"/>
                      <path fill="#FBBC05" d="M24 45c5.5 0 10.6-1.8 14.5-5l-6.7-5.5C29.7 36.2 27 37 24 37c-5.7 0-10.3-3.4-11.8-8.4l-7 5.4C8.2 40.5 15.6 45 24 45z"/>
                      <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.8 2.3-2.3 4.3-4.3 5.7l6.7 5.5C42.7 36.2 45 30.6 45 24c0-1.4-.2-2.7-.5-4z"/>
                    </svg>
                    Sign in with Google
                  </span>
                )}
              </button>
              <p style={{ fontSize: 10, color: '#aaa', marginTop: 16 }}>
                A Google sign-in popup will open.<br />Allow popups if your browser blocks them.
              </p>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#888' }}>
          Don't have an account?{' '}
          <a href="/register" style={{ ...s.link, fontWeight: 600 }}>Register</a>
        </p>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────────── */}
      <div style={{ ...s.right, backgroundImage: `url(${insuranceBg})` }}>
        <div style={s.topStrip} />
        <div style={s.bottomStrip} />
        <div style={s.overlay} />

        <div style={s.topNav}>
          <a href="#" style={s.navLink}>Sign Up</a>
          <a href="#" style={s.navBtn}>Join Us</a>
        </div>

        <div style={{ position: 'absolute', top: 20, left: 0, right: 0, textAlign: 'center', zIndex: 2 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: 0.5, lineHeight: 1.3, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>Ask Us</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: 0.5, lineHeight: 1.3, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>Global Solutions</div>
        </div>

        <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center', zIndex: 2, padding: '0 32px' }}>
          <p style={s.rightHeading}>Your Trusted<br />Insurance Partner</p>
          <div style={s.dividerThin} />
          <p style={s.tagline}>Get the right coverage,<br />without the hassle</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={s.badge}><span style={s.badgeText}>Insurance Policy</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" },

  left: {
    flex: 3, background: 'linear-gradient(145deg, #e8f0fe 0%, #f0e8ff 50%, #fce4ec 100%)',
    padding: '36px 144px', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', position: 'relative',
  },
  brandTop: {
    position: 'absolute', top: 32, left: 0, right: 0,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  brandName: { fontSize: 32, fontWeight: 800, color: '#1565C0', letterSpacing: 0.5, lineHeight: 1.3 },

  hello:    { fontSize: 22, fontWeight: 600, color: '#111', margin: '0 0 4px' },
  subtitle: { fontSize: 12, color: '#888', margin: '0 0 20px' },

  tabBar: { display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 3, marginBottom: 18 },
  tab: {
    flex: 1, padding: '7px 0', border: 'none', borderRadius: 6,
    fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: '#888',
  },
  tabActive: { background: '#1565C0', color: '#fff' },

  form:  { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 11, color: '#666', marginBottom: 5, marginTop: 3 },
  input: {
    padding: '8px 12px', borderRadius: 7, border: '1px solid #e0e0e0',
    background: '#f9f9f9', fontSize: 12, color: '#111', marginBottom: 10,
    outline: 'none', width: '100%', boxSizing: 'border-box',
  },
  otpBox: {
    width: 40, height: 44, textAlign: 'center', borderRadius: 7,
    border: '1.5px solid #e0e0e0', background: '#f9f9f9',
    fontSize: 18, fontWeight: 700, color: '#111', outline: 'none', transition: 'all 0.15s',
  },
  primaryBtn: {
    width: '100%', padding: '9px 0', background: '#1565C0', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4,
  },
  googleBtn: {
    width: '100%', padding: '11px 0', background: '#fff', color: '#444',
    border: '1.5px solid #dadce0', borderRadius: 8, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  link:       { color: '#1565C0', textDecoration: 'none', fontWeight: 500, fontSize: 11 },
  inlineLink: { color: '#1565C0', cursor: 'pointer', fontWeight: 600, fontSize: 12 },

  warningBox: {
    background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 6,
    padding: '8px 12px', fontSize: 11, color: '#7c6d00', marginBottom: 12,
  },

  credHint: {
    marginTop: 16, padding: '10px 12px', background: 'rgba(21,101,192,0.06)',
    borderRadius: 8, border: '1px solid rgba(21,101,192,0.15)',
  },
  credTitle: { fontSize: 10, fontWeight: 700, color: '#1565C0', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 },
  credRow:   { fontSize: 11, color: '#444', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 },
  credRole:  { background: '#1565C0', color: '#fff', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 600 },

  /* RIGHT */
  right: {
    flex: 7, position: 'relative', backgroundSize: 'cover', backgroundPosition: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  topStrip: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 56, zIndex: 1,
    background: 'linear-gradient(to bottom, rgba(30,90,30,0.98) 55%, transparent 100%)',
  },
  bottomStrip: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 72, zIndex: 1,
    background: 'linear-gradient(to top, rgba(30,90,30,0.98) 55%, transparent 100%)',
  },
  overlay: { position: 'absolute', inset: 0, background: 'rgba(10,50,10,0.38)', zIndex: 1 },
  topNav:  { position: 'absolute', top: 16, right: 20, display: 'flex', gap: 12, zIndex: 2 },
  navLink: { fontSize: 13, color: 'rgba(255,255,255,0.85)', textDecoration: 'none' },
  navBtn:  {
    fontSize: 13, color: '#fff', background: 'rgba(255,255,255,0.15)',
    padding: '5px 16px', borderRadius: 20, textDecoration: 'none',
    border: '1px solid rgba(255,255,255,0.35)',
  },
  rightHeading: { fontSize: 20, fontWeight: 600, color: '#fff', lineHeight: 1.4, margin: '0 0 12px', textShadow: '0 2px 8px rgba(0,0,0,0.6)' },
  dividerThin:  { width: 36, height: 1.5, background: 'rgba(255,255,255,0.45)', borderRadius: 2, margin: '0 auto 16px' },
  tagline: {
    fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.92)',
    letterSpacing: '1.2px', textTransform: 'uppercase', lineHeight: 1.85,
    margin: '0 0 20px', textShadow: '0 1px 4px rgba(0,0,0,0.5)',
  },
  badge:     { display: 'inline-block', padding: '8px 26px', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.15)' },
  badgeText: { fontSize: 12, fontWeight: 600, color: '#fff', letterSpacing: 2, textTransform: 'uppercase' },
};
