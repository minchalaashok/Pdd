import React, { useState } from 'react';
import { Heart, Mail, Lock, Eye, EyeOff, Shield, Building2, Droplet, User, ArrowRight, Sparkles, Activity, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';

const ROLES = [
  { id: 'donor',    label: 'Donor',    icon: '🩸', color: '#E53935', demo: 'donor1@lifelink.org' },
  { id: 'receiver', label: 'Receiver', icon: '🤲', color: '#FB8C00', demo: 'receiver1@lifelink.org' },
  { id: 'hospital', label: 'Hospital', icon: '🏥', color: '#1976D2', demo: 'hospital1@lifelink.org' },
  { id: 'admin',    label: 'Admin',    icon: '🛡️', color: '#43A047', demo: 'admin@lifelink.org' },
];

export const SignInPage = ({ onSwitchToSignUp, onSuccess }) => {
  const { login, loginAsDemo } = useAuth();
  const { liveStats } = useRealtime();
  const [role, setRole]             = useState('donor');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [demoLoading, setDemoLoading] = useState('');
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    const res = await login(email, password, role);
    setLoading(false);
    if (res?.success) {
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => onSuccess && onSuccess(role), 900);
    } else {
      setError(res?.message || 'Invalid credentials. Try demo buttons below.');
    }
  };

  const handleDemo = async (roleName) => {
    setDemoLoading(roleName); setError(''); setSuccess('');
    const roleObj = ROLES.find(r => r.id === roleName);
    setEmail(roleObj.demo); setPassword('Password123!'); setRole(roleName);
    const res = await loginAsDemo(roleName);
    setDemoLoading('');
    if (res?.success) {
      setSuccess(`Logged in as ${roleName.toUpperCase()}! Redirecting...`);
      setTimeout(() => onSuccess && onSuccess(roleName), 900);
    } else {
      setError('Demo login failed. Please try manual login.');
    }
  };

  const selectedRole = ROLES.find(r => r.id === role);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-main)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Animated Background Blobs */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px', width: 400, height: 400,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,57,53,0.15) 0%, transparent 70%)',
          animation: 'blobPulse 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', right: '-60px', width: 500, height: 500,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(25,118,210,0.12) 0%, transparent 70%)',
          animation: 'blobPulse 8s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '40%', width: 300, height: 300,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(67,160,71,0.08) 0%, transparent 70%)',
          animation: 'blobPulse 10s ease-in-out infinite',
        }} />
      </div>

      <style>{`
        @keyframes blobPulse {
          0%, 100% { transform: scale(1) translate(0,0); opacity: 0.7; }
          50% { transform: scale(1.12) translate(10px, -10px); opacity: 1; }
        }
        @keyframes floatUp {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.3); }
          28% { transform: scale(1); }
          42% { transform: scale(1.2); }
          70% { transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .signin-card { animation: floatUp 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
        .role-btn:hover { transform: translateY(-2px) scale(1.04); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
        .role-btn { transition: all 0.2s cubic-bezier(0.4,0,0.2,1); cursor: pointer; }
        .demo-btn:hover { transform: translateY(-1px); }
        .demo-btn { transition: all 0.18s ease; }
        .input-focus:focus { outline: none; border-color: var(--primary) !important; box-shadow: 0 0 0 3px rgba(229,57,53,0.15); }
        .heart-icon { animation: heartbeat 1.8s ease-in-out infinite; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(229,57,53,0.45) !important; }
        .submit-btn { transition: all 0.2s ease; }
        .link-btn:hover { color: var(--primary) !important; text-decoration: underline; }
      `}</style>

      {/* LEFT PANEL — Decorative */}
      <div style={{
        display: 'none',
        flex: 1,
        background: 'linear-gradient(135deg, #E53935 0%, #C62828 40%, #1976D2 100%)',
        padding: '60px 50px',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        minWidth: 400,
        // show on desktop
        ...(typeof window !== 'undefined' && window.innerWidth >= 900 ? { display: 'flex' } : {}),
      }} className="left-panel">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Heart className="heart-icon" style={{ color: 'white', fill: 'white' }} size={26} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>LifeLink</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Donation Platform</div>
            </div>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 20 }}>
            Every Second<br />Counts. 💉<br />Be a Hero.
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, maxWidth: 340 }}>
            Join thousands of donors and hospitals on LifeLink — India's most advanced organ & blood donation coordination platform.
          </p>
        </div>

        {/* Stats — Real-time DB values */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
          {[
            { val: liveStats.completedRequests || 0, label: 'Lives Saved', icon: '❤️' },
            { val: liveStats.totalDonors || 0,       label: 'Donors Active', icon: '🩸' },
            { val: liveStats.totalHospitals || 0,    label: 'Partner Hospitals', icon: '🏥' },
            { val: liveStats.totalUsers || 0,        label: 'Registered Users', icon: '👥' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.12)', borderRadius: 14,
              padding: '16px', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white' }}>{s.val}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Decorative circles */}
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', bottom: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
      </div>

      {/* RIGHT PANEL — Sign In Form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', position: 'relative', zIndex: 1,
      }}>
        <div className="signin-card" style={{ width: '100%', maxWidth: 480 }}>

          {/* Logo (mobile only / centered) */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 64, height: 64, borderRadius: 18,
              background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
              boxShadow: '0 8px 24px rgba(229,57,53,0.35)',
              marginBottom: 16,
            }}>
              <Heart className="heart-icon" style={{ color: 'white', fill: 'white' }} size={32} />
            </div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>
              Welcome Back
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Sign in to your <strong style={{ color: 'var(--primary)' }}>LifeLink</strong> account
            </p>
          </div>

          {/* Role Selector */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              I am signing in as
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {ROLES.map(r => (
                <button
                  key={r.id}
                  className="role-btn"
                  onClick={() => setRole(r.id)}
                  style={{
                    padding: '12px 6px',
                    borderRadius: 12,
                    border: `2px solid ${role === r.id ? r.color : 'var(--border)'}`,
                    background: role === r.id ? `${r.color}18` : 'var(--bg-card)',
                    color: role === r.id ? r.color : 'var(--text-muted)',
                    fontWeight: role === r.id ? 700 : 500,
                    fontSize: '0.78rem',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  }}
                >
                  <span style={{ fontSize: '1.3rem' }}>{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Demo Buttons */}
          <div style={{
            padding: 14, borderRadius: 12, marginBottom: 20,
            background: 'linear-gradient(135deg, rgba(229,57,53,0.06) 0%, rgba(25,118,210,0.06) 100%)',
            border: '1px dashed var(--border)',
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Key size={13} /> QUICK DEMO LOGIN (one click)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {ROLES.map(r => (
                <button
                  key={r.id}
                  className="demo-btn"
                  onClick={() => handleDemo(r.id)}
                  disabled={!!demoLoading}
                  style={{
                    padding: '8px 10px', borderRadius: 8, fontSize: '0.76rem', fontWeight: 600,
                    border: `1px solid ${r.color}44`,
                    background: `${r.color}10`,
                    color: r.color,
                    cursor: demoLoading ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                    opacity: demoLoading && demoLoading !== r.id ? 0.5 : 1,
                  }}
                >
                  {demoLoading === r.id ? '⏳' : r.icon} {r.label} Demo
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OR SIGN IN MANUALLY</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Error / Success */}
          {error && (
            <div style={{ padding: '10px 14px', background: '#FEE2E2', color: '#DC2626', borderRadius: 10, fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{ padding: '10px 14px', background: '#DCFCE7', color: '#166534', borderRadius: 10, fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              ✅ {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="input-focus"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@lifelink.org"
                  style={{
                    width: '100%', padding: '12px 14px 12px 40px',
                    borderRadius: 10, border: '1.5px solid var(--border)',
                    background: 'var(--bg-card)', color: 'var(--text-main)',
                    fontSize: '0.9rem', transition: 'all 0.2s',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="input-focus"
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '12px 44px 12px 40px',
                    borderRadius: 10, border: '1.5px solid var(--border)',
                    background: 'var(--bg-card)', color: 'var(--text-main)',
                    fontSize: '0.9rem', transition: 'all 0.2s',
                  }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2,
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>
                  Forgot password?
                </span>
              </div>
            </div>

            {/* Submit */}
            <button
              className="submit-btn"
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: loading
                  ? 'var(--border)'
                  : `linear-gradient(135deg, ${selectedRole?.color || '#E53935'} 0%, #C62828 100%)`,
                color: 'white', fontWeight: 700, fontSize: '1rem',
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 16px rgba(229,57,53,0.3)',
              }}
            >
              {loading ? '⏳ Signing In...' : (
                <>{selectedRole?.icon} Sign In as {selectedRole?.label} <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <button
              className="link-btn"
              onClick={onSwitchToSignUp}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.2s' }}
            >
              Create Account →
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
            {['🔒 SSL Secured', '🇮🇳 ABDM Compliant', '⚡ 24/7 Emergency'].map(b => (
              <span key={b} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{b}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
