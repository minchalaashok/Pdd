import React, { useState } from 'react';
import { Heart, Mail, Lock, Eye, EyeOff, User, Phone, MapPin, Building, CheckCircle, ArrowRight, ArrowLeft, Droplet, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  {
    id: 'donor',
    label: 'Blood / Organ Donor',
    icon: '🩸',
    color: '#E53935',
    desc: 'Register to donate blood or organs and save lives',
  },
  {
    id: 'receiver',
    label: 'Patient / Receiver',
    icon: '🤲',
    color: '#FB8C00',
    desc: 'Looking for organ or blood donation',
  },
  {
    id: 'hospital',
    label: 'Hospital / Blood Bank',
    icon: '🏥',
    color: '#1976D2',
    desc: 'Hospital, clinic or certified blood bank',
  },
  {
    id: 'admin',
    label: 'Admin / NGO',
    icon: '🛡️',
    color: '#43A047',
    desc: 'Platform administrator or NGO partner',
  },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ORGANS = ['Kidney', 'Liver', 'Heart', 'Lungs', 'Cornea', 'Pancreas', 'Bone Marrow'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'];

export const SignUpPage = ({ onSwitchToSignIn, onSuccess }) => {
  const { register } = useAuth();

  const [step, setStep]                   = useState(1); // 1=role, 2=account, 3=details
  const [role, setRole]                   = useState('');
  const [fullName, setFullName]           = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPass, setConfirmPass]     = useState('');
  const [showPass, setShowPass]           = useState(false);
  const [phone, setPhone]                 = useState('');
  const [city, setCity]                   = useState('Mumbai');
  const [bloodGroup, setBloodGroup]       = useState('O+');
  const [organsRegistered, setOrgansReg]  = useState([]);
  const [organNeeded, setOrganNeeded]     = useState('Kidney');
  const [hospitalName, setHospitalName]   = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [consent, setConsent]             = useState(false);

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const selectedRole = ROLES.find(r => r.id === role);

  const toggleOrgan = (organ) => {
    setOrgansReg(prev =>
      prev.includes(organ) ? prev.filter(o => o !== organ) : [...prev, organ]
    );
  };

  const validateStep2 = () => {
    if (!fullName.trim()) return 'Full name is required';
    if (!email.includes('@')) return 'Enter a valid email address';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (password !== confirmPass) return 'Passwords do not match';
    return null;
  };

  const handleStep2Next = () => {
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError('');
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consent) { setError('Please accept the terms and consent to organ/blood donation policies.'); return; }
    setLoading(true); setError(''); setSuccess('');

    const res = await register({
      full_name: fullName,
      email,
      password,
      role,
      phone,
      city,
      blood_group: bloodGroup,
      organs_registered: organsRegistered.join(','),
      organ_needed: organNeeded,
      hospital_name: hospitalName,
      license_number: licenseNumber,
    });

    setLoading(false);
    if (res?.success) {
      setSuccess('Account created successfully! Welcome to LifeLink 🎉');
      setTimeout(() => onSuccess && onSuccess(role), 1200);
    } else {
      setError(res?.message || 'Registration failed. Please try again.');
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px 12px 40px',
    borderRadius: 10, border: '1.5px solid var(--border)',
    background: 'var(--bg-card)', color: 'var(--text-main)',
    fontSize: '0.9rem', outline: 'none', transition: 'all 0.2s',
    boxSizing: 'border-box',
  };

  const labelStyle = { fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-main)',
      overflow: 'hidden',
      position: 'relative',
    }}>

      <style>{`
        @keyframes blobPulse2 {
          0%, 100% { transform: scale(1) translate(0,0); opacity: 0.6; }
          50% { transform: scale(1.1) translate(-8px, 12px); opacity: 1; }
        }
        @keyframes slideIn {
          0% { transform: translateX(40px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes heartbeat2 {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.3); }
          28% { transform: scale(1); }
          42% { transform: scale(1.2); }
          70% { transform: scale(1); }
        }
        .step-card { animation: slideIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
        .organ-chip:hover { transform: scale(1.05); }
        .organ-chip { transition: all 0.15s ease; cursor: pointer; }
        .role-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.12); }
        .role-card { transition: all 0.22s cubic-bezier(0.4,0,0.2,1); cursor: pointer; }
        .input-field:focus { border-color: var(--primary) !important; box-shadow: 0 0 0 3px rgba(229,57,53,0.12) !important; }
        .submit-btn2:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(229,57,53,0.4) !important; }
        .submit-btn2 { transition: all 0.2s ease; }
        .heart-ani { animation: heartbeat2 2s ease-in-out infinite; }
      `}</style>

      {/* Background blobs */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,57,53,0.12) 0%, transparent 70%)', animation: 'blobPulse2 7s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: -120, left: -60, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(25,118,210,0.1) 0%, transparent 70%)', animation: 'blobPulse2 9s ease-in-out infinite reverse' }} />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: step === 1 ? 680 : 520 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 64, height: 64, borderRadius: 18,
              background: 'linear-gradient(135deg, #E53935 0%, #1976D2 100%)',
              boxShadow: '0 8px 24px rgba(229,57,53,0.3)', marginBottom: 16,
            }}>
              <Heart className="heart-ani" style={{ color: 'white', fill: 'white' }} size={32} />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>
              {step === 1 ? 'Join LifeLink' : step === 2 ? 'Create Your Account' : 'Complete Your Profile'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {step === 1 ? 'Select your role to get started' : step === 2 ? 'Set up your login credentials' : `Almost done, ${fullName.split(' ')[0] || 'there'}!`}
            </p>
          </div>

          {/* Step Progress */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
            {[1, 2, 3].map(s => (
              <React.Fragment key={s}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.9rem',
                  background: step >= s ? 'linear-gradient(135deg, #E53935, #C62828)' : 'var(--bg-card)',
                  color: step >= s ? 'white' : 'var(--text-muted)',
                  border: step >= s ? 'none' : '2px solid var(--border)',
                  boxShadow: step >= s ? '0 4px 12px rgba(229,57,53,0.3)' : 'none',
                  transition: 'all 0.3s ease',
                }}>
                  {step > s ? '✓' : s}
                </div>
                {s < 3 && <div style={{ width: 48, height: 2, borderRadius: 2, background: step > s ? '#E53935' : 'var(--border)', transition: 'all 0.3s ease' }} />}
              </React.Fragment>
            ))}
          </div>

          {/* Error / Success */}
          {error && (
            <div style={{ padding: '10px 14px', background: '#FEE2E2', color: '#DC2626', borderRadius: 10, fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} /> {error}
            </div>
          )}
          {success && (
            <div style={{ padding: '10px 14px', background: '#DCFCE7', color: '#166534', borderRadius: 10, fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={16} /> {success}
            </div>
          )}

          {/* ===================== STEP 1: ROLE ===================== */}
          {step === 1 && (
            <div className="step-card">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
                {ROLES.map(r => (
                  <div
                    key={r.id}
                    className="role-card glass-card"
                    onClick={() => { setRole(r.id); setStep(2); }}
                    style={{
                      padding: '24px 20px',
                      border: `2px solid ${role === r.id ? r.color : 'var(--border)'}`,
                      background: role === r.id ? `${r.color}10` : 'var(--bg-card)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '2.2rem', marginBottom: 10 }}>{r.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 6, color: role === r.id ? r.color : 'var(--text-main)' }}>
                      {r.label}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{r.desc}</div>
                    <div style={{
                      marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontSize: '0.8rem', fontWeight: 700, color: r.color,
                    }}>
                      Get started <ArrowRight size={14} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <button onClick={onSwitchToSignIn} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}>
                  Sign In →
                </button>
              </div>
            </div>
          )}

          {/* ===================== STEP 2: CREDENTIALS ===================== */}
          {step === 2 && (
            <div className="step-card glass-card" style={{ padding: 28 }}>
              {/* Selected role badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px',
                borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, marginBottom: 20,
                background: `${selectedRole?.color}15`, color: selectedRole?.color,
                border: `1px solid ${selectedRole?.color}33`,
              }}>
                {selectedRole?.icon} Registering as {selectedRole?.label}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Full Name */}
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input-field" style={inputStyle} type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Dr. Arjun Sharma" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input-field" style={inputStyle} type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="arjun@example.com" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input-field" style={{ ...inputStyle, paddingRight: 44 }} type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Password strength */}
                  {password && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 3, borderRadius: 2,
                          background: password.length >= i * 3
                            ? (password.length >= 10 ? '#43A047' : password.length >= 7 ? '#FB8C00' : '#E53935')
                            : 'var(--border)',
                          transition: 'all 0.2s',
                        }} />
                      ))}
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 4 }}>
                        {password.length >= 10 ? '💪 Strong' : password.length >= 7 ? '⚡ Medium' : '⚠️ Weak'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={labelStyle}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input-field" style={{ ...inputStyle, borderColor: confirmPass && confirmPass !== password ? '#E53935' : undefined }} type={showPass ? 'text' : 'password'} required value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Re-enter password" />
                    {confirmPass && (
                      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>
                        {confirmPass === password ? '✅' : '❌'}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" onClick={() => { setStep(1); setError(''); }} style={{
                    flex: 1, padding: '13px', borderRadius: 12, border: '1.5px solid var(--border)',
                    background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.9rem',
                  }}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="button" onClick={handleStep2Next} style={{
                    flex: 2, padding: '13px', borderRadius: 12, border: 'none',
                    background: `linear-gradient(135deg, ${selectedRole?.color || '#E53935'} 0%, #C62828 100%)`,
                    color: 'white', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.9rem',
                    boxShadow: '0 4px 14px rgba(229,57,53,0.3)',
                  }}>
                    Next: Profile Details <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================== STEP 3: DETAILS ===================== */}
          {step === 3 && (
            <form className="step-card glass-card" style={{ padding: 28 }} onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Phone + City */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input className="input-field" style={inputStyle} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210" />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>City</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <select className="input-field" style={{ ...inputStyle, appearance: 'none' }} value={city} onChange={e => setCity(e.target.value)}>
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Blood Group (all roles) */}
                <div>
                  <label style={labelStyle}>Blood Group</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {BLOOD_GROUPS.map(bg => (
                      <button key={bg} type="button" onClick={() => setBloodGroup(bg)} style={{
                        padding: '6px 14px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 700,
                        border: `2px solid ${bloodGroup === bg ? '#E53935' : 'var(--border)'}`,
                        background: bloodGroup === bg ? 'rgba(229,57,53,0.1)' : 'var(--bg-card)',
                        color: bloodGroup === bg ? '#E53935' : 'var(--text-muted)',
                        cursor: 'pointer', transition: 'all 0.15s ease',
                      }}>
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Donor: Organs to donate */}
                {role === 'donor' && (
                  <div>
                    <label style={labelStyle}>Organs You Wish to Donate</label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {ORGANS.map(organ => (
                        <div key={organ} className="organ-chip" onClick={() => toggleOrgan(organ)} style={{
                          padding: '6px 14px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600,
                          border: `2px solid ${organsRegistered.includes(organ) ? '#E53935' : 'var(--border)'}`,
                          background: organsRegistered.includes(organ) ? 'rgba(229,57,53,0.1)' : 'var(--bg-card)',
                          color: organsRegistered.includes(organ) ? '#E53935' : 'var(--text-muted)',
                          cursor: 'pointer',
                        }}>
                          {organsRegistered.includes(organ) ? '✓ ' : ''}{organ}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Receiver: Organ needed */}
                {role === 'receiver' && (
                  <div>
                    <label style={labelStyle}>Organ Needed</label>
                    <select className="input-field" style={{ ...inputStyle, paddingLeft: 14 }} value={organNeeded} onChange={e => setOrganNeeded(e.target.value)}>
                      {ORGANS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                )}

                {/* Hospital fields */}
                {role === 'hospital' && (
                  <>
                    <div>
                      <label style={labelStyle}>Hospital / Organization Name</label>
                      <div style={{ position: 'relative' }}>
                        <Building size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="input-field" style={inputStyle} required type="text" value={hospitalName} onChange={e => setHospitalName(e.target.value)} placeholder="City General Hospital" />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Medical License Number</label>
                      <div style={{ position: 'relative' }}>
                        <CheckCircle size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="input-field" style={inputStyle} required type="text" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} placeholder="LIC-MED-2026-XXXX" />
                      </div>
                    </div>
                  </>
                )}

                {/* Consent checkbox */}
                <label style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
                  padding: '12px', borderRadius: 10, background: 'var(--primary-light)',
                  border: '1px solid rgba(229,57,53,0.2)',
                }}>
                  <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, cursor: 'pointer', accentColor: '#E53935' }} />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                    I agree to the <strong style={{ color: 'var(--primary)' }}>LifeLink Terms of Service</strong> and the National Organ & Blood Donation Policy. I consent to my data being used for matching donors with recipients.
                  </span>
                </label>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" onClick={() => { setStep(2); setError(''); }} style={{
                    flex: 1, padding: '13px', borderRadius: 12, border: '1.5px solid var(--border)',
                    background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.9rem',
                  }}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button className="submit-btn2" type="submit" disabled={loading} style={{
                    flex: 2, padding: '13px', borderRadius: 12, border: 'none',
                    background: loading ? 'var(--border)' : `linear-gradient(135deg, ${selectedRole?.color || '#E53935'} 0%, #C62828 100%)`,
                    color: 'white', fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.9rem',
                    boxShadow: '0 4px 14px rgba(229,57,53,0.3)',
                  }}>
                    {loading ? '⏳ Creating Account...' : <>{selectedRole?.icon} Create My Account <ArrowRight size={16} /></>}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Footer sign-in link (visible on steps 2 and 3) */}
          {step > 1 && (
            <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <button onClick={onSwitchToSignIn} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}>
                Sign In →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
