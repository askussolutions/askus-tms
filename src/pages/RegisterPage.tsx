import insuranceBg from '../assets/insurance-bg.png';
import React, { useState } from 'react';
import { message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/api';
import { useAppDispatch } from '../store';
import { loginSuccess } from '../store';

// ── Password strength checker ─────────────────────────────────────────────────
interface PasswordRule { label: string; test: (p: string) => boolean; }
const PASSWORD_RULES: PasswordRule[] = [
  { label: '8 characters',           test: p => p.length >= 8 },
  { label: '1 lower case character', test: p => /[a-z]/.test(p) },
  { label: '1 upper case character', test: p => /[A-Z]/.test(p) },
  { label: '1 number',               test: p => /[0-9]/.test(p) },
  { label: '1 special character',    test: p => /[^A-Za-z0-9]/.test(p) },
];

function PasswordStrength({ password, show }: { password: string; show: boolean }) {
  if (!show || !password) return null;
  const passed = PASSWORD_RULES.filter(r => r.test(password)).length;
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '14px 16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '1px solid #e8e8e8',
      marginTop: 8,
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 10 }}>
        Must contain at least:
      </div>
      {PASSWORD_RULES.map(r => {
        const ok = r.test(password);
        return (
          <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
              background: ok ? '#52c41a' : '#f0f0f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, color: ok ? '#fff' : '#bbb',
              transition: 'all 0.2s',
            }}>✓</span>
            <span style={{ fontSize: 12, color: ok ? '#52c41a' : '#888', fontWeight: ok ? 500 : 400 }}>
              {r.label}
            </span>
          </div>
        );
      })}
      {/* Strength bar */}
      <div style={{ marginTop: 10 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i <= passed
                ? passed <= 2 ? '#f5222d' : passed <= 3 ? '#faad14' : '#52c41a'
                : '#f0f0f0',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
        <div style={{ fontSize: 10, color: '#888', marginTop: 4, textAlign: 'right' }}>
          {passed <= 2 ? 'Weak' : passed <= 3 ? 'Fair' : passed <= 4 ? 'Good' : 'Strong'}
        </div>
      </div>
    </div>
  );
}

// ── Main RegisterPage ─────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [fullName,  setFullName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [mobile,    setMobile]    = useState('');
  const [role,      setRole]      = useState('Agent');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [showCPwd,  setShowCPwd]  = useState(false);
  const [pwdFocus,  setPwdFocus]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const allRulesPassed = PASSWORD_RULES.every(r => r.test(password));
  const passwordMatch  = password === confirm && confirm.length > 0;

  const handleRegister = async () => {
    if (!fullName.trim()) { message.error('Enter your full name'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { message.error('Enter a valid email'); return; }
    if (!/^[6-9]\d{9}$/.test(mobile)) { message.error('Enter a valid 10-digit mobile'); return; }
    if (!allRulesPassed) { message.error('Password does not meet requirements'); return; }
    if (!passwordMatch)  { message.error('Passwords do not match'); return; }

    setLoading(true);
    try {
      const res = await apiClient.register(fullName.trim(), email.trim(), mobile, password, role);
      dispatch(loginSuccess({ token: res.token, user: res.user }));
      message.success(`Welcome, ${res.user.name}! Account created successfully.`);
      // Redirect based on role
      navigate(res.user.role === 'Agent' ? '/timesheet' : '/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>

      {/* ── LEFT PANEL ── */}
      <div style={s.left}>
        {/* Logo */}
        <div style={{ position: 'absolute', top: 28, left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 42, fontWeight: 800, color: '#1565C0', lineHeight: 1.2 }}>Ask Us</div>
          <div style={{ fontSize: 42, fontWeight: 800, color: '#1565C0', lineHeight: 1.2 }}>Global Solutions</div>
        </div>

        <h1 style={s.hello}>Create Account</h1>
        <p style={s.subtitle}>Join Ask Us Global Solutions · Fill in your details below</p>

        {/* Form */}
        <div style={s.form}>
          {/* Full Name */}
          <label style={s.label}>Full Name</label>
          <input style={s.input} placeholder="e.g. Rajesh Kumar"
            value={fullName} onChange={e => setFullName(e.target.value)} />

          {/* Work Email */}
          <label style={s.label}>Work Email</label>
          <input style={s.input} type="email" placeholder="you@askus.com"
            value={email} onChange={e => setEmail(e.target.value)} />

          {/* Mobile */}
          <label style={s.label}>Mobile Number</label>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <input readOnly value="+91"
              style={{ ...s.input, width: 52, textAlign: 'center', marginBottom: 0 }} />
            <input style={{ ...s.input, flex: 1, marginBottom: 0 }}
              type="tel" maxLength={10} placeholder="10-digit number"
              value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} />
          </div>

          {/* Role */}
          <label style={s.label}>Role</label>
          <select style={{ ...s.input, appearance: 'auto' as any }}
            value={role} onChange={e => setRole(e.target.value)}>
            <option value="Agent">Agent</option>
            <option value="Employee">Employee</option>
          </select>

          {/* Password */}
          <label style={s.label}>Password</label>
          <div style={{ position: 'relative', marginBottom: 0 }}>
            <input
              style={{ ...s.input, paddingRight: 40, marginBottom: 0,
                borderColor: pwdFocus ? '#1565C0' : '#e0e0e0',
                boxShadow: pwdFocus ? '0 0 0 2px rgba(21,101,192,0.12)' : 'none' }}
              type={showPwd ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setPwdFocus(true)}
              onBlur={() => setPwdFocus(false)}
            />
            <button onClick={() => setShowPwd(v => !v)}
              style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                       background:'none', border:'none', cursor:'pointer', color:'#888', fontSize:16 }}>
              {showPwd ? '🙈' : '👁️'}
            </button>
          </div>

          {/* Password strength panel */}
          <PasswordStrength password={password} show={password.length > 0} />

          {/* Confirm Password */}
          <label style={{ ...s.label, marginTop: 10 }}>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <input
              style={{ ...s.input, paddingRight: 40, marginBottom: 10,
                borderColor: confirm.length > 0 ? (passwordMatch ? '#52c41a' : '#f5222d') : '#e0e0e0' }}
              type={showCPwd ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
            <button onClick={() => setShowCPwd(v => !v)}
              style={{ position:'absolute', right:10, top:'30%', transform:'translateY(-50%)',
                       background:'none', border:'none', cursor:'pointer', color:'#888', fontSize:16 }}>
              {showCPwd ? '🙈' : '👁️'}
            </button>
            {confirm.length > 0 && (
              <div style={{ fontSize:11, color: passwordMatch ? '#52c41a' : '#f5222d',
                            marginTop: -8, marginBottom: 6 }}>
                {passwordMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </div>
            )}
          </div>

          {/* Submit */}
          <button style={{
            ...s.primaryBtn,
            opacity: loading ? 0.8 : 1,
            background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
          }} onClick={handleRegister} disabled={loading}>
            {loading ? <Spin size="small" /> : 'Create Account'}
          </button>
        </div>

        {/* Bottom */}
        <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#888' }}>
          Already have an account?{' '}
          <a href="/login" style={s.link}>Sign In</a>
        </p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ ...s.right, backgroundImage: `url(${insuranceBg})` }}>
        <div style={s.topStrip} />
        <div style={s.bottomStrip} />
        <div style={s.overlay} />

        <div style={{ position:'absolute', top:20, left:0, right:0, textAlign:'center', zIndex:2 }}>
          <div style={{ fontSize:72, fontWeight:800, color:'#fff', letterSpacing:0.5,
                        lineHeight:1.3, textShadow:'0 2px 8px rgba(0,0,0,0.6)' }}>Ask Us</div>
          <div style={{ fontSize:72, fontWeight:800, color:'#fff', letterSpacing:0.5,
                        lineHeight:1.3, textShadow:'0 2px 8px rgba(0,0,0,0.6)' }}>Global Solutions</div>
        </div>

        <div style={{ position:'absolute', bottom:30, left:0, right:0,
                      textAlign:'center', zIndex:2, padding:'0 32px' }}>
          <p style={s.rightHeading}>Your trusted insurance partner</p>
          <p style={s.tagline}>Get the right coverage without the hassle</p>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex', minHeight: '100vh',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  left: {
    flex: 3,
    background: 'linear-gradient(145deg, #e8f0fe 0%, #f0e8ff 50%, #fce4ec 100%)',
    padding: '100px 80px 36px',
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
    position: 'relative', overflowY: 'auto',
  },
  hello: { fontSize: 22, fontWeight: 600, color: '#111', margin: '0 0 4px' },
  subtitle: { fontSize: 12, color: '#888', margin: '0 0 18px' },
  form: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 11, color: '#666', marginBottom: 5, marginTop: 3 },
  input: {
    padding: '8px 12px', borderRadius: 7, border: '1px solid #e0e0e0',
    background: '#fff', fontSize: 12, color: '#111',
    marginBottom: 10, outline: 'none', width: '100%', boxSizing: 'border-box' as any,
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  primaryBtn: {
    width: '100%', padding: '9px 0', color: '#fff', border: 'none',
    borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4,
  },
  link: { color: '#1565C0', textDecoration: 'none', fontWeight: 500, fontSize: 12 },
  right: {
    flex: 7, position: 'relative', backgroundSize: 'cover', backgroundPosition: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  topStrip: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 56,
    background: 'linear-gradient(to bottom, rgba(30,90,30,0.98) 55%, transparent 100%)', zIndex: 1,
  },
  bottomStrip: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 72,
    background: 'linear-gradient(to top, rgba(30,90,30,0.98) 55%, transparent 100%)', zIndex: 1,
  },
  overlay: { position: 'absolute', inset: 0, background: 'rgba(10,50,10,0.38)', zIndex: 1 },
  rightHeading: {
    fontSize: 36, fontWeight: 600, color: '#fff', lineHeight: 1.4,
    margin: '0 0 12px', textShadow: '0 2px 8px rgba(0,0,0,0.6)',
  },
  tagline: {
    fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.92)',
    letterSpacing: '1.2px', textTransform: 'uppercase', margin: '0 0 20px',
    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
  },
};
