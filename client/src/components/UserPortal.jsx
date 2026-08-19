import React, { useState, useEffect } from 'react';
import { User, Heart, Droplet, MapPin, Award, ShieldCheck, Clock, FileText, QrCode, Upload, CheckCircle, AlertTriangle, PhoneCall, Plus, ExternalLink, Calendar } from 'lucide-react';
import { fetchApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const UserPortal = ({ onOpenSos, onOpenQr }) => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState(user?.role === 'receiver' ? 'request' : 'overview');

  // Organ consent states
  const [selectedOrgans, setSelectedOrgans] = useState(() => {
    if (user?.donor?.organs_registered) {
      return user.donor.organs_registered.split(',').map(o => o.trim()).filter(Boolean);
    }
    return ['Kidney', 'Liver', 'Heart', 'Cornea'];
  });
  const [organConsentSaved, setOrganConsentSaved] = useState(false);

  useEffect(() => {
    if (user?.donor?.organs_registered) {
      setSelectedOrgans(user.donor.organs_registered.split(',').map(o => o.trim()).filter(Boolean));
    }
  }, [user]);

  // Certificate verification states
  const [donationPhoto, setDonationPhoto] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('NOT_UPLOADED');
  const [showCertModal, setShowCertModal] = useState(false);

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
    loadContacts();
  }, []);

  // Chat state
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');

  const loadContacts = async () => {
    const res = await fetchApi('/chat/contacts');
    if (res.success) {
      setContacts(res.contacts || []);
    }
  };

  const loadChatMessages = async (contactId) => {
    const res = await fetchApi(`/chat/${contactId}`);
    if (res.success) {
      setChatMessages(res.messages || []);
    }
  };

  useEffect(() => {
    if (!activeContact) return;
    loadChatMessages(activeContact.id);
    const interval = setInterval(() => loadChatMessages(activeContact.id), 3000);
    return () => clearInterval(interval);
  }, [activeContact]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!newChatMessage.trim() || !activeContact) return;
    const res = await fetchApi('/chat', {
      method: 'POST',
      body: JSON.stringify({
        receiver_id: activeContact.id,
        message: newChatMessage
      })
    });
    if (res.success) {
      setNewChatMessage('');
      loadChatMessages(activeContact.id);
    }
  };

  useEffect(() => {
    if (activeTab === 'chats') {
      loadContacts();
      const interval = setInterval(loadContacts, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const handleToggleOrgan = (organName) => {
    setSelectedOrgans(prev =>
      prev.includes(organName)
        ? prev.filter(o => o !== organName)
        : [...prev, organName]
    );
  };

  const handleSaveOrganConsent = async (e) => {
    e.preventDefault();
    setOrganConsentSaved(false);

    const res = await fetchApi('/donor/profile', {
      method: 'PUT',
      body: JSON.stringify({
        organs_registered: selectedOrgans.join(',')
      })
    });

    if (res.success) {
      const updatedUser = { ...user, donor: res.donor };
      localStorage.setItem('lifelink_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setOrganConsentSaved(true);
      setTimeout(() => setOrganConsentSaved(false), 4000);
    } else {
      alert(res.message || 'Failed to save organ consent');
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDonationPhoto(URL.createObjectURL(file));
      setVerificationStatus('VERIFYING');
      
      // Simulate verification (AI scanning receipt/photo)
      setTimeout(() => {
        setVerificationStatus('VERIFIED');
      }, 3000);
    }
  };

  const handleDownloadCertificate = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#FAFAF9';
    ctx.fillRect(0, 0, 900, 640);

    // Gold borders
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, 860, 600);

    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 2;
    ctx.strokeRect(34, 34, 832, 572);

    // Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 44px Georgia, serif';
    ctx.fillText('CERTIFICATE OF APPRECIATION', 450, 110);

    ctx.fillStyle = '#78716C';
    ctx.font = 'italic 20px Georgia, serif';
    ctx.fillText('This certificate is proudly presented to', 450, 160);

    // Name
    ctx.fillStyle = '#1C1917';
    ctx.font = 'bold 38px Georgia, serif';
    ctx.fillText(user?.full_name || 'Donor', 450, 220);

    // Underline
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(250, 235);
    ctx.lineTo(650, 235);
    ctx.stroke();

    // Body
    ctx.fillStyle = '#44403C';
    ctx.font = '20px Georgia, serif';
    ctx.fillText('In recognition of your noble whole blood donation at Apex Care Hospital.', 450, 300);
    ctx.fillText('Your selfless act helps save lives and inspires hope in the community.', 450, 340);

    // Details Grid
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#1C1917';
    ctx.fillText('Date: April 15, 2026   •   Certificate ID: #LL-CERT-892', 450, 420);

    // Signatures
    ctx.strokeStyle = '#A8A29E';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(150, 520);
    ctx.lineTo(350, 520);
    ctx.moveTo(550, 520);
    ctx.lineTo(750, 520);
    ctx.stroke();

    ctx.font = 'italic 20px Georgia, serif';
    ctx.fillStyle = '#DC2626';
    ctx.fillText('Apex Care Hospital', 250, 505);
    ctx.fillText('LifeLink Medical Board', 650, 505);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#78716C';
    ctx.fillText('Hospital Chief Medical Officer', 250, 545);
    ctx.fillText('Authorized Verification Seal', 650, 545);

    // Download trigger
    const link = document.createElement('a');
    link.download = `LifeLink_Donation_Certificate_${(user?.full_name || 'donor').replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowCertModal(false);
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
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Role: <strong style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>{user?.role || 'User'}</strong> • City: <strong>{user?.city || 'Mumbai'}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {user?.role !== 'receiver' && (
            <button className="btn-primary" onClick={onOpenQr} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <QrCode size={18} /> View Digital Donor Card
            </button>
          )}
          <button className="btn-sos" onClick={onOpenSos}>
            <PhoneCall size={18} /> Instant SOS Request
          </button>
        </div>
      </div>

      {/* User Module Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
        {user?.role !== 'receiver' && (
          <>
            <button className={activeTab === 'overview' ? 'btn-primary' : 'btn-outline'} onClick={() => setActiveTab('overview')}>
              📊 Overview Dashboard
            </button>
            <button className={activeTab === 'organ' ? 'btn-primary' : 'btn-outline'} onClick={() => setActiveTab('organ')}>
              🫀 Organ Donation Registry
            </button>
            <button className={activeTab === 'blood' ? 'btn-primary' : 'btn-outline'} onClick={() => setActiveTab('blood')}>
              🩸 Emergency Blood Donation
            </button>
          </>
        )}
        {user?.role === 'receiver' && (
          <>
            <button className={activeTab === 'request' ? 'btn-primary' : 'btn-outline'} onClick={() => setActiveTab('request')}>
              🚨 Request Organ / Blood
            </button>
            <button className={activeTab === 'hospitals' ? 'btn-primary' : 'btn-outline'} onClick={() => setActiveTab('hospitals')}>
              🗺️ Nearby Hospitals & Maps
            </button>
          </>
        )}
        <button className={activeTab === 'chats' ? 'btn-primary' : 'btn-outline'} onClick={() => { setActiveTab('chats'); loadContacts(); }}>
          💬 Hospital Chats
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

          {/* Timeline and Card side-by-side */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>
            
            {/* Left side: Donation history */}
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Donation History & Digital Certificates</h3>
              <div className="glass-card" style={{ padding: 24, height: '100%', minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>🩸 Whole Blood Unit Donation (450ml)</h4>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>Apex Care Hospital • Ward 2 • April 15, 2026</div>
                  </div>

                  {verificationStatus === 'NOT_UPLOADED' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <label className="btn-outline" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', padding: '6px 12px' }}>
                        <Upload size={12} /> Upload Photo Proof
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                      </label>
                      <span style={{ fontSize: '0.75rem', color: '#E53935', fontWeight: 700 }}>🔒 Locked</span>
                    </div>
                  )}

                  {verificationStatus === 'VERIFYING' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="pulse-dot" style={{ background: '#F59E0B', width: 6, height: 6 }} />
                      <span style={{ fontSize: '0.78rem', color: '#D97706', fontWeight: 700 }}>🔍 Verifying photo proof...</span>
                    </div>
                  )}

                  {verificationStatus === 'VERIFIED' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: '0.82rem', color: '#10B981', fontWeight: 700 }}>✅ Verified by Hospital</span>
                      <button className="btn-primary" style={{ fontSize: '0.78rem', padding: '6px 12px' }} onClick={() => setShowCertModal(true)}>
                        📜 View Certificate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Digital Donor Card Preview */}
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>LifeLink Digital Donor ID Card</h3>
              <div
                onClick={onOpenQr}
                className="donor-card-preview"
                style={{
                  background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                  borderRadius: 20,
                  color: 'white',
                  padding: 24,
                  height: 220,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Background Shimmer */}
                <div style={{
                  position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)',
                  pointerEvents: 'none'
                }} />

                {/* Header: App Logo + Label */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6,
                      background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Heart fill="#E53935" color="#E53935" size={16} />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.5px' }}>LifeLink</span>
                  </div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: 20 }}>
                    DONOR ID
                  </span>
                </div>

                {/* Body: User Name */}
                <div style={{ margin: '20px 0 10px 0' }}>
                  <div style={{ fontSize: '0.65rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Verified Donor</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, textTransform: 'uppercase', marginTop: 2 }}>{user?.full_name || 'Donor'}</div>
                </div>

                {/* Footer: ID Code + Tap Instruction */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 10 }}>
                  <div>
                    <div style={{ fontSize: '0.55rem', opacity: 0.8 }}>DONOR ID</div>
                    <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 700 }}>LL-CARD-{user?.id ? String(user.id).slice(0, 8).toUpperCase() : '1084'}</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.9 }}>
                    Tap to Open Card 💳
                  </div>
                </div>
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

      {/* TAB: Hospital Chats */}
      {activeTab === 'chats' && (
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Hospital & Doctor Conversation Inbox</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, height: 500, overflow: 'hidden' }} className="glass-card">
            
            {/* Contacts Sidebar */}
            <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ padding: '16px', fontWeight: 800, borderBottom: '1px solid var(--border)' }}>Conversations</div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {contacts.length === 0 ? (
                  <div style={{ padding: 20, fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    No active hospital conversations yet.
                  </div>
                ) : (
                  contacts.map(c => (
                    <div
                      key={c.id}
                      onClick={() => setActiveContact(c)}
                      style={{
                        padding: '16px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                        background: activeContact?.id === c.id ? 'var(--primary-light)' : 'transparent',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>{c.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, textTransform: 'capitalize' }}>Role: {c.role}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Messages Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {activeContact ? (
                <>
                  {/* Chat Header */}
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>{activeContact.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activeContact.email}</div>
                  </div>

                  {/* Messages list */}
                  <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(0,0,0,0.01)' }}>
                    {chatMessages.length === 0 ? (
                      <div style={{ margin: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No messages yet. Send a message to start the conversation.
                      </div>
                    ) : (
                      chatMessages.map(m => {
                        const isMe = m.sender_id === user.id;
                        return (
                          <div
                            key={m.id}
                            style={{
                              alignSelf: isMe ? 'flex-end' : 'flex-start',
                              maxWidth: '70%',
                              padding: '10px 14px',
                              borderRadius: 12,
                              background: isMe ? 'var(--primary)' : 'var(--bg-card)',
                              color: isMe ? 'white' : 'var(--text-main)',
                              border: '1px solid var(--border)',
                              fontSize: '0.88rem'
                            }}
                          >
                            <div>{m.message}</div>
                            <div style={{ fontSize: '0.68rem', opacity: 0.6, marginTop: 4, textAlign: 'right' }}>
                              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleSendChat} style={{ padding: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      className="form-input"
                      value={newChatMessage}
                      onChange={e => setNewChatMessage(e.target.value)}
                      placeholder="Type your reply here..."
                      style={{ flex: 1, borderRadius: 20, padding: '8px 16px' }}
                      required
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '8px 20px', borderRadius: 20 }}>
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Select a conversation from the sidebar to start chatting.
                </div>
              )}
            </div>

          </div>
        </div>
      )}


      {/* Certificate Modal */}
      {showCertModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: 16
        }}>
          <div className="glass-card" style={{
            maxWidth: 600, width: '100%', padding: 32, background: 'var(--bg-card)',
            border: '8px double #D4AF37', borderRadius: 16, textAlign: 'center',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)', position: 'relative'
          }}>
            <button
              onClick={() => setShowCertModal(false)}
              style={{
                position: 'absolute', top: 16, right: 16, background: 'none',
                border: 'none', color: 'var(--text-main)', fontSize: '1.2rem', cursor: 'pointer'
              }}
            >
              ✕
            </button>
            <div style={{ color: '#D4AF37', fontSize: '2rem', marginBottom: 12 }}>🏆</div>
            <h2 style={{ fontFamily: 'Georgia, serif', color: '#D4AF37', marginBottom: 6, fontSize: '1.8rem' }}>Certificate of Appreciation</h2>
            <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-muted)' }}>This is proudly presented to</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '14px 0', textDecoration: 'underline', color: 'var(--text-main)' }}>
              {user?.full_name || 'Donor'}
            </h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, maxWidth: 460, margin: '0 auto 20px auto', color: 'var(--text-main)' }}>
              for their noble donation of **Whole Blood (450ml)** at **Apex Care Hospital** on **April 15, 2026**. Their selfless act helps save lives and inspires hope.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>#LL-CERT-892</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CERTIFICATE ID</div>
              </div>
              <div>
                <div style={{ fontStyle: 'italic', fontFamily: 'Georgia', fontSize: '0.9rem', color: 'var(--primary)' }}>LifeLink Board</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AUTHORIZED SIGNATURE</div>
              </div>
            </div>
            <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn-primary" onClick={handleDownloadCertificate}>
                📥 Save / Print Certificate
              </button>
              <button className="btn-outline" onClick={() => setShowCertModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
