import React, { useState } from 'react';
import { User, Lock, Mail, Phone, MapPin, Building, Shield, CheckCircle, X, Sparkles, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('donor');
  
  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [organNeeded, setOrganNeeded] = useState('Kidney');
  const [organsRegistered, setOrgansRegistered] = useState('Kidney,Liver');
  const [hospitalName, setHospitalName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (isRegister) {
      const res = await register({
        full_name: fullName,
        email,
        password,
        role,
        phone,
        city,
        blood_group: bloodGroup,
        organ_needed: organNeeded,
        organs_registered: organsRegistered,
        hospital_name: hospitalName,
        license_number: licenseNumber
      });

      if (res.success) {
        setSuccessMsg('Account registered successfully! Opening portal...');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.message || 'Registration failed');
      }
    } else {
      const res = await login(email, password, role);
      if (res.success) {
        setSuccessMsg('Logged in successfully! Opening portal...');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.message || 'Login failed');
      }
    }

    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div className="glass-card" style={{ maxWidth: 520, width: '100%', padding: 28, position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            marginBottom: 8
          }}>
            <Shield size={24} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
            {isRegister ? 'Create Real LifeLink Account' : 'LifeLink Login & Authentication'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            ⚡ Supabase Cloud & Relational Auth Connected
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: 10, background: '#FEE2E2', color: '#DC2626', borderRadius: 8, fontSize: '0.85rem', marginBottom: 16 }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: 10, background: '#DCFCE7', color: '#166534', borderRadius: 8, fontSize: '0.85rem', marginBottom: 16 }}>
            <CheckCircle size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Role selector */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Role Selection</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {['donor', 'receiver', 'hospital', 'admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={role === r ? 'btn-primary' : 'btn-outline'}
                  style={{ padding: '6px', fontSize: '0.75rem', justifyContent: 'center', textTransform: 'capitalize' }}
                  onClick={() => setRole(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {isRegister && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. John Doe"
                style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', marginTop: 4 }}
              />
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@lifelink.org"
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', marginTop: 4 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', marginTop: 4 }}
            />
          </div>

          {isRegister && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', marginTop: 4 }}
                  />
                </div>
              </div>

              {role === 'hospital' && (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Hospital Name</label>
                    <input
                      type="text"
                      required
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      placeholder="City General Hospital"
                      style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', marginTop: 4 }}
                    />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Medical License Number</label>
                    <input
                      type="text"
                      required
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="LIC-MED-2026-99"
                      style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', marginTop: 4 }}
                    />
                  </div>
                </>
              )}

              {role === 'donor' && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', marginTop: 4 }}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              )}
            </>
          )}

          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? 'Opening Portal...' : isRegister ? 'Register Real Account' : 'Log In & Open App'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              {isRegister ? 'Already registered?' : "Don't have an account?"}
            </span>{' '}
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Log In Here' : 'Register Real Account'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
