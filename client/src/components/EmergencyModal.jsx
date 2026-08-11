import React, { useState, useEffect } from 'react';
import { PhoneCall, AlertTriangle, MapPin, CheckCircle, Send, Navigation, Clock, ShieldAlert } from 'lucide-react';
import { fetchApi } from '../services/api';
import { useRealtime } from '../context/RealtimeContext';

export const EmergencyModal = ({ isOpen, onClose }) => {
  const { liveStats } = useRealtime();
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [requestType, setRequestType] = useState('BLOOD');
  const [organType, setOrganType] = useState('Kidney');
  const [city, setCity] = useState('Mumbai');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ambulanceDistance, setAmbulanceDistance] = useState(3.8);

  // Ambulance tracking countdown simulator
  useEffect(() => {
    let timer;
    if (submitted) {
      timer = setInterval(() => {
        setAmbulanceDistance(prev => Math.max((prev - 0.4), 0.2));
      }, 2000);
    } else {
      setAmbulanceDistance(3.8);
    }
    return () => clearInterval(timer);
  }, [submitted]);

  if (!isOpen) return null;

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setLoading(true);

    await fetchApi('/requests', {
      method: 'POST',
      body: JSON.stringify({
        receiver_id: 1,
        request_type: requestType,
        item_requested: requestType === 'BLOOD' ? bloodGroup : organType,
        units: 2,
        urgency: 'EMERGENCY',
        notes: `Emergency SOS Broadcast from ${city}`
      })
    });

    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
      <div className="glass-card modal-content" style={{ maxWidth: 520, width: '90%', padding: 28, position: 'relative' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: '#FEE2E2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#DC2626'
          }}>
            <AlertTriangle size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>🚨 LifeLink Emergency SOS Radar</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Broadcast instant alert to nearby registered donors & hospital ambulances within 15 km
            </p>
          </div>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: '8px 16px', fontSize: '0.9rem' }}>
              <Navigation size={16} /> Live Emergency Ambulance En Route
            </div>

            {/* Simulated Live Ambulance Tracking Progress */}
            <div className="glass-card" style={{ padding: 20, marginBottom: 24, textAlign: 'left', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary)' }}>🚑 Ambulance #108-APEX</span>
                <span className="badge badge-warning" style={{ fontSize: '0.8rem' }}>ETA: ~{Math.ceil(ambulanceDistance * 2)} Mins</span>
              </div>

              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                Distance to Receiver: <strong>{ambulanceDistance.toFixed(1)} km</strong> • Status: <strong>Siren Active</strong>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: 10, background: 'var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, Math.max(10, ((3.8 - ambulanceDistance) / 3.8) * 100))}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #E53935 0%, #10B981 100%)',
                  transition: 'width 1s ease'
                }} />
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Alert broadcasted to <strong>{liveStats.totalDonors || 0} Donors</strong> and <strong>{liveStats.totalHospitals || 0} Partner Hospitals</strong> near {city}. Emergency Helpline: <strong>+91 108</strong>
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <a href="tel:108" className="btn-sos" style={{ flex: 1, textDecoration: 'none', justifyContent: 'center' }}>
                <PhoneCall size={16} /> Direct Call 108
              </a>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setSubmitted(false); onClose(); }}>
                Close Radar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBroadcast}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Requirement Category</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className={requestType === 'BLOOD' ? 'btn-primary' : 'btn-outline'}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setRequestType('BLOOD')}
                >
                  🩸 Blood Unit
                </button>
                <button
                  type="button"
                  className={requestType === 'ORGAN' ? 'btn-secondary' : 'btn-outline'}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setRequestType('ORGAN')}
                >
                  🫀 Organ Donation
                </button>
              </div>
            </div>

            {requestType === 'BLOOD' ? (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Blood Group Required</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="form-input"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Organ Needed</label>
                <select
                  value={organType}
                  onChange={(e) => setOrganType(e.target.value)}
                  className="form-input"
                >
                  {['Kidney', 'Liver', 'Heart', 'Lungs', 'Eyes', 'Pancreas', 'Bone Marrow'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Emergency Location / City</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', background: 'var(--bg-main)' }}>
                <MapPin size={18} style={{ color: 'var(--primary)' }} />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city..."
                  className="form-input"
                  style={{ border: 'none', background: 'transparent' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" className="btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-sos" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
                <Send size={16} /> {loading ? 'Broadcasting...' : 'Broadcast SOS Radar'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
