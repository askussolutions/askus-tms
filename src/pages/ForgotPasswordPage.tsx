import insuranceBg from '../assets/insurance-bg.png';
import React, { useState, useRef } from 'react';
import { message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';

// ── Steps ─────────────────────────────────────────────────────────────────────
// Step 1 → Enter email → Send OTP
// Step 2 → Enter 6-digit OTP → Verify
// Step 3 → New password + confirm → Reset

type Step = 1 | 2 | 3;

// ── Password rules ─────────────────────────────────────────────────────────────
const PWD_RULES = [
  { label: '8 characters',           test: (p: string) => p.length >= 8 },
  { label: '1 lower case character', test: (p: string) => /[a-z]/.test(p) },
  { label: '1 upper case character', test: (p: string) => /[A-Z]/.test(p) },
  { label: '1 number',               test: (p: string) => /[0-9]/.test(p) },
  { label: '1 special character',    test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function StrengthPanel({ password }: { password: string }) {
  if (!password) return null;
  const passed = PWD_RULES.filter(r => r.test(password)).length;
  const color  = passed <= 2 ? '#f5222d' : passed <= 3 ? '#faad14' : '#52c41a';
  const label  = passed <= 2 ? 'Weak' : passed <= 3 ? 'Fair' : passed <= 4 ? 'Good' : 'Strong';
  return (
    <div style={{ background:'#f9f9ff', borderRadius:10, padding:'12px 14px',
                  border:'1px solid #e8e8f0', marginBottom:10 }}>
      <div style={{ fontSize:11, fontWeight:600, color:'#666', marginBottom:8 }}>Must contain at least:</div>
      {PWD_RULES.map(r => {
        const ok = r.test(password);
        return (
          <div key={r.label} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
            <span style={{
              width:15, height:15, borderRadius:'50%', flexShrink:0,
              background: ok ? '#52c41a' : '#e8e8e8',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:9, color: ok ? '#fff' : '#bbb', transition:'all 0.2s',
            }}>✓</span>
            <span style={{ fontSize:11, color: ok ? '#52c41a' : '#888', fontWeight: ok ? 500 : 400 }}>
              {r.label}
            </span>
          </div>
        );
      })}
      <div style={{ display:'flex', gap:3, marginTop:10 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{
            flex:1, height:4, borderRadius:2, transition:'background 0.3s',
            background: i <= passed ? color : '#e8e8e8',
          }} />
        ))}
      </div>
      <div style={{ fontSize:10, color, textAlign:'right', marginTop:3, fontWeight:600 }}>{label}</div>
    </div>
  );
}

// ── OTP Input ──────────────────────────────────────────────────────────────────
function OtpInput({ otp, onChange }: {
  otp: string[]; onChange: (otp: string[]) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const handleChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp]; next[i] = v; onChange(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };
  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };
  return (
    <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:12 }}>
      {otp.map((d, i) => (
        <input key={i}
          ref={el => { refs.current[i] = el; }}
          type="text" maxLength={1} value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          style={{
            width:44, height:48, textAlign:'center', borderRadius:10,
            border: d ? '2px solid #1565C0' : '1.5px solid #e0e0e0',
            background: d ? '#f0f5ff' : '#f9f9f9',
            fontSize:20, fontWeight:700, color:'#111', outline:'none',
            transition:'all 0.15s',
          }}
        />
      ))}
    </div>
  );
}

// ── Countdown timer ────────────────────────────────────────────────────────────
function useCountdown(seconds: number) {
  const [count, setCount] = useState(0);
  const start = () => {
    setCount(seconds);
    const interval = setInterval(() => {
      setCount(c => { if (c <= 1) { clearInterval(interval); return 0; } return c - 1; });
    }, 1000);
  };
  return { count, start, active: count > 0 };
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step,    setStep]    = useState<Step>(1);
  const [email,   setEmail]   = useState('');
  const [otp,     setOtp]     = useState(['','','','','','']);
  const [newPwd,  setNewPwd]  = useState('');
  const [confirm, setConfirm] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showCon, setShowCon] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useCountdown(60);

  const allPassed   = PWD_RULES.every(r => r.test(newPwd));
  const pwdMatch    = newPwd === confirm && confirm.length > 0;
  const otpFilled   = otp.join('').length === 6;

  // Step 1 — Send OTP
  const handleSendOTP = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.error('Enter a valid email address'); return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    timer.start();
    setStep(2);
    message.success('OTP sent to ' + email + ' (demo: any 6 digits)');
  };

  // Step 2 — Verify OTP
  const handleVerifyOTP = async () => {
    if (!otpFilled) { message.error('Enter all 6 digits'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setStep(3);
    message.success('OTP verified!');
  };

  // Step 3 — Reset Password
  const handleReset = async () => {
    if (!allPassed) { message.error('Password does not meet requirements'); return; }
    if (!pwdMatch)  { message.error('Passwords do not match'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    message.success('Password reset successfully! Please log in.');
    navigate('/login');
  };

  // Resend OTP
  const handleResend = async () => {
    if (timer.active) return;
    setOtp(['','','','','','']);
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    timer.start();
    message.success('OTP resent!');
  };

  // Step indicator
  const STEPS = [
    { num: 1, label: 'Enter Email' },
    { num: 2, label: 'Verify OTP' },
    { num: 3, label: 'New Password' },
  ];

  return (
    <div style={s.page}>

      {/* ── LEFT PANEL ── */}
      <div style={s.left}>

        {/* Logo */}
        <div style={{ position:'absolute', top:28, left:0, right:0, textAlign:'center' }}>
          <div style={{ fontSize:36, fontWeight:800, color:'#1565C0', lineHeight:1.2 }}>Ask Us</div>
          <div style={{ fontSize:36, fontWeight:800, color:'#1565C0', lineHeight:1.2 }}>Global Solutions</div>
        </div>

        {/* Step progress */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', marginBottom:24 }}>
          {STEPS.map((st, i) => (
            <React.Fragment key={st.num}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <div style={{
                  width:32, height:32, borderRadius:'50%', display:'flex',
                  alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13,
                  background: step > st.num ? '#52c41a' : step === st.num ? '#1565C0' : '#e0e0e0',
                  color: step >= st.num ? '#fff' : '#999',
                  transition:'all 0.3s',
                }}>
                  {step > st.num ? '✓' : st.num}
                </div>
                <div style={{ fontSize:10, color: step >= st.num ? '#1565C0' : '#bbb',
                              fontWeight: step === st.num ? 600 : 400, whiteSpace:'nowrap' }}>
                  {st.label}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex:1, height:2, margin:'0 8px', marginBottom:16,
                  background: step > st.num ? '#52c41a' : '#e0e0e0',
                  transition:'background 0.3s',
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── STEP 1: Email ── */}
        {step === 1 && (
          <div style={s.form}>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ fontSize:36, marginBottom:8 }}>🔐</div>
              <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:'#111' }}>Forgot Password?</h2>
              <p style={{ margin:'6px 0 0', fontSize:12, color:'#888' }}>
                Enter your registered email — we'll send you an OTP
              </p>
            </div>
            <label style={s.label}>Registered Email</label>
            <input style={s.input} type="email" placeholder="you@askus.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendOTP()} />
            <button style={s.btn} onClick={handleSendOTP} disabled={loading}>
              {loading ? <Spin size="small" /> : 'Send OTP →'}
            </button>
            <p style={s.backLink}>
              Remember your password?{' '}
              <a href="/login" style={s.link}>Sign In</a>
            </p>
          </div>
        )}

        {/* ── STEP 2: OTP Verify ── */}
        {step === 2 && (
          <div style={s.form}>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ fontSize:36, marginBottom:8 }}>📧</div>
              <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:'#111' }}>Check Your Email</h2>
              <p style={{ margin:'6px 0 0', fontSize:12, color:'#888' }}>
                OTP sent to <strong>{email}</strong>
              </p>
              <p style={{ margin:'4px 0 0', fontSize:11, color:'#aaa' }}>
                Demo: any 6-digit code works
              </p>
            </div>

            <label style={{ ...s.label, textAlign:'center' as any }}>Enter 6-digit OTP</label>
            <OtpInput otp={otp} onChange={setOtp} />

            {/* Timer */}
            <div style={{ textAlign:'center', fontSize:12, color:'#888', marginBottom:12 }}>
              {timer.active ? (
                <span>Resend OTP in <strong style={{ color:'#1565C0' }}>{timer.count}s</strong></span>
              ) : (
                <span>
                  Didn't receive?{' '}
                  <span onClick={handleResend}
                    style={{ color:'#1565C0', cursor:'pointer', fontWeight:600 }}>
                    Resend OTP
                  </span>
                </span>
              )}
            </div>

            <button style={s.btn} onClick={handleVerifyOTP} disabled={loading || !otpFilled}>
              {loading ? <Spin size="small" /> : 'Verify OTP →'}
            </button>
            <button style={s.backBtn} onClick={() => { setStep(1); setOtp(['','','','','','']); }}>
              ← Change Email
            </button>
          </div>
        )}

        {/* ── STEP 3: New Password ── */}
        {step === 3 && (
          <div style={s.form}>
            <div style={{ textAlign:'center', marginBottom:16 }}>
              <div style={{ fontSize:36, marginBottom:8 }}>🔑</div>
              <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:'#111' }}>Set New Password</h2>
              <p style={{ margin:'6px 0 0', fontSize:12, color:'#888' }}>
                Create a strong password for your account
              </p>
            </div>

            <label style={s.label}>New Password</label>
            <div style={{ position:'relative' }}>
              <input
                style={{ ...s.input, paddingRight:40 }}
                type={showNew ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
              />
              <button onClick={() => setShowNew(v => !v)} style={s.eyeBtn}>
                {showNew ? '🙈' : '👁️'}
              </button>
            </div>

            <StrengthPanel password={newPwd} />

            <label style={s.label}>Confirm New Password</label>
            <div style={{ position:'relative' }}>
              <input
                style={{
                  ...s.input, paddingRight:40,
                  borderColor: confirm.length > 0
                    ? pwdMatch ? '#52c41a' : '#f5222d'
                    : '#e0e0e0',
                }}
                type={showCon ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
              />
              <button onClick={() => setShowCon(v => !v)} style={s.eyeBtn}>
                {showCon ? '🙈' : '👁️'}
              </button>
            </div>
            {confirm.length > 0 && (
              <div style={{ fontSize:11, color: pwdMatch ? '#52c41a' : '#f5222d', marginTop:-6, marginBottom:8 }}>
                {pwdMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </div>
            )}

            <button
              style={{ ...s.btn, opacity: (allPassed && pwdMatch) ? 1 : 0.6 }}
              onClick={handleReset}
              disabled={loading || !allPassed || !pwdMatch}
            >
              {loading ? <Spin size="small" /> : '✓ Reset Password'}
            </button>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ ...s.right, backgroundImage:`url(${insuranceBg})` }}>
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
          <p style={s.rightHeading}>Secure · Reliable · Trusted</p>
          <p style={s.tagline}>Your data is always protected</p>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    display:'flex', minHeight:'100vh',
    fontFamily:"'Segoe UI', system-ui, sans-serif",
  },
  left: {
    flex: 3,
    background: 'linear-gradient(145deg, #e8f0fe 0%, #f0e8ff 50%, #fce4ec 100%)',
    padding: '100px 72px 36px',
    display:'flex', flexDirection:'column', justifyContent:'center',
    position:'relative', overflowY:'auto',
  },
  form: { display:'flex', flexDirection:'column' },
  label: { fontSize:11, color:'#666', marginBottom:5, marginTop:3 },
  input: {
    padding:'8px 12px', borderRadius:7, border:'1px solid #e0e0e0',
    background:'#fff', fontSize:12, color:'#111',
    marginBottom:10, outline:'none', width:'100%', boxSizing:'border-box' as any,
    transition:'border-color 0.2s',
  },
  btn: {
    width:'100%', padding:'10px 0',
    background:'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
    color:'#fff', border:'none', borderRadius:8,
    fontSize:13, fontWeight:600, cursor:'pointer', marginTop:4, marginBottom:8,
  },
  backBtn: {
    width:'100%', padding:'8px 0',
    background:'transparent', color:'#888',
    border:'1px solid #e0e0e0', borderRadius:8,
    fontSize:12, cursor:'pointer',
  },
  eyeBtn: {
    position:'absolute', right:10, top:'35%', transform:'translateY(-50%)',
    background:'none', border:'none', cursor:'pointer', color:'#888', fontSize:16,
  } as React.CSSProperties,
  backLink: { textAlign:'center', marginTop:14, fontSize:12, color:'#888' },
  link: { color:'#1565C0', textDecoration:'none', fontWeight:600, fontSize:12 },
  right: {
    flex:7, position:'relative', backgroundSize:'cover', backgroundPosition:'center',
    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', overflow:'hidden',
  },
  topStrip: {
    position:'absolute', top:0, left:0, right:0, height:56,
    background:'linear-gradient(to bottom, rgba(30,90,30,0.98) 55%, transparent 100%)', zIndex:1,
  },
  bottomStrip: {
    position:'absolute', bottom:0, left:0, right:0, height:72,
    background:'linear-gradient(to top, rgba(30,90,30,0.98) 55%, transparent 100%)', zIndex:1,
  },
  overlay: { position:'absolute', inset:0, background:'rgba(10,50,10,0.38)', zIndex:1 },
  rightHeading: {
    fontSize:36, fontWeight:600, color:'#fff', lineHeight:1.4,
    margin:'0 0 12px', textShadow:'0 2px 8px rgba(0,0,0,0.6)',
  },
  tagline: {
    fontSize:18, fontWeight:600, color:'rgba(255,255,255,0.92)',
    letterSpacing:'1.2px', textTransform:'uppercase',
    margin:'0 0 20px', textShadow:'0 1px 4px rgba(0,0,0,0.5)',
  },
};
