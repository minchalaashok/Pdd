import React, { useState, useEffect } from 'react';
import { User, Heart, Droplet, MapPin, Award, ShieldCheck, Clock, FileText, QrCode, Upload, CheckCircle, AlertTriangle, PhoneCall, Plus, ExternalLink, Calendar } from 'lucide-react';
import { fetchApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const UserPortal = ({ onOpenSos, onOpenQr }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Organ consent states
  const [selectedOrgans, setSelectedOrgans] = useState(['Kidney', 'Liver', 'Heart', 'Cornea']);
  const [organConsentSaved, setOrganConsentSaved] = useState(false);

  // Blood availability states
  const [isAvailableForBlood, setIsAvailableForBlood] = useState(true);
  const [lastDonatedDate, setLastDonatedDate] = useState('2026-04-15');

  // Emergency Request state
  const [reqCategory, setReqCategory] = useState('BLOOD');
  const [reqBloodGroup, setReqBloodGroup] = useState('A+');
  const [reqOrgan, setReqOrgan] = useState('Kidney');
  const [reqCity, setReqCity] = useState('Mumbai');
  const [reqUrgency, setReqUrgency] = useState('EMERGENCY');
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [reqSuccessMsg, setReqSuccessMsg] = useState('');

  // Nearby Hospitals State
  const [hospitals, setHospitals] = useState([]);
  const [searchCity, setSearchCity] = useState('Mumbai');

  useEffect(() => {
    const loadHospitals = async () => {
      const res = await fetchApi(`/admin/hospitals`);
      if (res.success) setHospitals(res.hospitals || []);
    };
    loadHospitals();
  }, []);

  const handleToggleOrgan = (organName) => {
    setSelectedOrgans(prev =>
      prev.includes(organName)
        ? prev.filter(o => o !== organName)
        : [...prev, organName]
    );
  };

  const handleSaveOrganConsent = (e) => {
    e.preventDefault();
    setOrganConsentSaved(true);
    setTimeout(() => setOrganConsentSaved(false), 4000);
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    const res = await fetchApi('/requests', {
      method: 'POST',
      body: JSON.stringify({
        receiver_id: user?.id || 1,
        request_type: reqCategory,
        item_requested: reqCategory === 'BLOOD' ? reqBloodGroup : reqOrgan,
        units: 2,
        urgency: reqUrgency,
        notes: `User module request for ${reqCity}`
      })
    });
    if (res.success) {
      setReqSuccessMsg('🚨 Request successfully submitted & broadcasted to nearby hospitals!');
      setTimeout(() => setReqSuccessMsg(''), 5000);
    }
  };

  // Calculate Blood Donation Eligibility Days (90 days interval)
  const calculateDaysRemaining = () => {
    const lastDate = new Date(lastDonatedDate);
    const nextEligible = new Date(lastDate.getTime() + (90 * 24 * 60 * 60 * 1000));
    const today = new Date();
    const diff = Math.ceil((nextEligible - today) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 0);
  };

  const daysRemaining = calculateDaysRemaining();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      
      {/* User Header Profile Card */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: '1.5rem',
            boxShadow: '0 4px 14px rgba(2,132,199,0.3)'
          }}>
            {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{user?.full_name || 'Dr. Aarav Sharma'}</h2>
              <span className="badge badge-success" style={{ fontSize: '0.78rem' }}>
                <ShieldCheck size={14} /> Aadhaar Verified
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Blood Group: <strong style={{ color: 'var(--primary)' }}>{user?.blood_group || 'O+'}</strong> • City: <strong>{user?.city || 'Mumbai'}</strong> • Aadhaar: <strong>XXXX-XXXX-8921</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={onOpenQr} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <QrCode size={18} /> View Digital Donor Card
          </button>
          <button className="btn-sos" onClick={onOpenSos}>
            <PhoneCall size={18} /> Instant SOS Request
          </button>
        </div>
      </div>

      {/* User Module Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
        <button className={activeTab === 'overview' ? 'btn-primary' : 'btn-outline'} onClick={() => setActiveTab('overview')}>
          📊 Overview Dashboard
        </button>
        <button className={activeTab === 'organ' ? 'btn-primary' : 'btn-outline'} onClick={() => setActiveTab('organ')}>
          🫀 Organ Donation Registry
        </button>
        <button className={activeTab === 'blood' ? 'btn-primary' : 'btn-outline'} onClick={() => setActiveTab('blood')}>
          🩸 Emergency Blood Donation
        </button>
        <button className={activeTab === 'request' ? 'btn-primary' : 'btn-outline'} onClick={() => setActiveTab('request')}>
          🚨 Request Organ / Blood
        </button>
        <button className={activeTab === 'hospitals' ? 'btn-primary' : 'btn-outline'} onClick={() => setActiveTab('hospitals')}>
          🗺️ Nearby Hospitals & Maps
        </button>
      </div>

      {/* TAB 1: Overview Dashboard */}
      {activeTab === 'overview' && (
        <div>
          {/* Completion Progress & Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
            
            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>PROFILE COMPLETION</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', margin: '4px 0' }}>92%</div>
              <div style={{ height: 6, width: '100%', background: 'var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ width: '92%', height: '100%', background: 'var(--primary)' }} />
              </div>
            </div>

            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>BLOOD DONATION ELIGIBILITY</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: daysRemaining === 0 ? '#10B981' : '#F59E0B', margin: '4px 0' }}>
                {daysRemaining === 0 ? '🟢 ELIGIBLE NOW' : `⏳ ${daysRemaining} Days Left`}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Last donated: {lastDonatedDate}</div>
            </div>

            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>REGISTERED ORGANS PLEDGED</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)', margin: '4px 0' }}>
                {selectedOrgans.length} Organs
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{selectedOrgans.join(', ')}</div>
            </div>

            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>REWARD POINTS & BADGES</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)', margin: '4px 0' }}>1,250 PTS</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>🏆 Gold Hero • Community Shield</div>
            </div>

          </div>

          {/* Donation History Timeline */}
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Donation History & Digital Certificates</h3>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>🩸 Whole Blood Unit Donation (450ml)</h4>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Apex Care Hospital • Ward 2 • April 15, 2026</div>
                </div>
                <button className="btn-outline" style={{ fontSize: '0.8rem' }} onClick={() => alert('Certificate #LL-CERT-892 downloaded!')}>
                  📜 Download Certificate
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>🫀 Organ Donation Registry Pledge</h4>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Verified by National Medical Board • Feb 10, 2026</div>
                </div>
                <button className="btn-outline" style={{ fontSize: '0.8rem' }} onClick={onOpenQr}>
                  💳 View Digital Card
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Organ Donation Consent */}
      {activeTab === 'organ' && (
        <div className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>🫀 Official Organ & Tissue Pledge Registry</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>
            Select the organs and tissues you pledge to donate to save lives. You can update your consent anytime.
          </p>

          {organConsentSaved && (
            <div className="badge badge-success" style={{ padding: '12px 16px', marginBottom: 20, display: 'block' }}>
              ✅ Organ Donation Consent preferences updated successfully!
            </div>
          )}

          <form onSubmit={handleSaveOrganConsent}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
              {['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Cornea', 'Bone Marrow', 'Skin', 'Blood Vessels'].map(organ => {
                const isSelected = selectedOrgans.includes(organ);
                return (
                  <div
                    key={organ}
                    onClick={() => handleToggleOrgan(organ)}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                      background: isSelected ? 'rgba(2, 132, 199, 0.08)' : 'var(--bg-main)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontWeight: 700
                    }}
                  >
                    <input type="checkbox" checked={isSelected} onChange={() => {}} />
                    <span>{organ}</span>
                  </div>
                );
              })}
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>
              Save & Sign Organ Consent Form
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Blood Donation */}
      {activeTab === 'blood' && (
        <div className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>🩸 Blood Donor Availability & Health Status</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>
            Manage your blood donor availability to receive real-time emergency blood requests in your area.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, padding: 18, background: 'var(--bg-secondary)', borderRadius: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Active Emergency Responder Toggle</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                When set to AVAILABLE, nearby hospitals can contact you for critical blood shortages.
              </div>
            </div>

            <button
              className={isAvailableForBlood ? 'btn-primary' : 'btn-outline'}
              onClick={() => setIsAvailableForBlood(!isAvailableForBlood)}
              style={{ padding: '10px 20px', fontWeight: 800 }}
            >
              {isAvailableForBlood ? '🟢 AVAILABLE' : '🔴 BUSY / ON PAUSE'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Request Organ or Blood */}
      {activeTab === 'request' && (
        <div className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>🚨 Create Emergency Request for Organ or Blood</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>
            Submit an emergency requirement to connect with verified donors and partner hospital reserves.
          </p>

          {reqSuccessMsg && (
            <div className="badge badge-success" style={{ padding: '12px 16px', marginBottom: 20, display: 'block' }}>
              {reqSuccessMsg}
            </div>
          )}

          <form onSubmit={handleCreateRequest} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Requirement Category</label>
              <select className="form-input" value={reqCategory} onChange={e => setReqCategory(e.target.value)}>
                <option value="BLOOD">🩸 Blood Units</option>
                <option value="ORGAN">🫀 Organ Donation</option>
              </select>
            </div>

            {reqCategory === 'BLOOD' ? (
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Blood Group Required</label>
                <select className="form-input" value={reqBloodGroup} onChange={e => setReqBloodGroup(e.target.value)}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Organ Needed</label>
                <select className="form-input" value={reqOrgan} onChange={e => setReqOrgan(e.target.value)}>
                  {['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Cornea'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Location City</label>
              <input type="text" className="form-input" value={reqCity} onChange={e => setReqCity(e.target.value)} required />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Urgency Level</label>
              <select className="form-input" value={reqUrgency} onChange={e => setReqUrgency(e.target.value)}>
                <option value="EMERGENCY">🚨 EMERGENCY (Immediate)</option>
                <option value="HIGH">⚠️ HIGH</option>
                <option value="MEDIUM">🟡 MEDIUM</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Upload Doctor Prescription / Medical Report</label>
              <input type="file" className="form-input" onChange={e => setPrescriptionFile(e.target.files[0])} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn-sos" style={{ padding: '12px 24px' }}>
                Broadcast Request to LifeLink Network
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: Nearby Hospitals */}
      {activeTab === 'hospitals' && (
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Interactive Map of Partner Hospitals & Emergency Centers</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {hospitals.slice(0, 8).map(h => (
              <div key={h.id} className="glass-card" style={{ padding: 20 }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 6 }}>{h.hospital_name}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                  📍 {h.address || h.city} • <strong>2.4 km away</strong>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  <span className="badge badge-success">License Verified</span>
                  <span className="badge badge-info">Emergency Ward Open</span>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <a href={`tel:${h.phone}`} className="btn-primary" style={{ flex: 1, textDecoration: 'none', justifyContent: 'center', fontSize: '0.82rem' }}>
                    <PhoneCall size={14} /> Call Hospital
                  </a>
                  <button className="btn-outline" style={{ fontSize: '0.82rem' }} onClick={() => alert(`Directions to ${h.hospital_name} loaded in Google Maps!`)}>
                    <MapPin size={14} /> Directions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
