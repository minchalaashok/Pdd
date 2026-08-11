import React from 'react';
import { Heart, Shield, PhoneCall, QrCode } from 'lucide-react';

export const Footer = ({ onOpenSos, onOpenQr }) => {
  return (
    <footer style={{
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border)',
      padding: '40px 24px 20px 24px',
      marginTop: 60
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32, marginBottom: 32 }}>
        
        {/* Col 1: Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={18} fill="white" style={{ color: 'white' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>LifeLink</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Smart Organ & Blood Donation Management Platform connecting donors, receivers, and hospitals nationwide.
          </p>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>Platform Navigation</h4>
          <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Emergency SOS Radar</li>
            <li>Donor Registration</li>
            <li>Hospital Verification</li>
            <li>Blood & Organ Inventory</li>
          </ul>
        </div>

        {/* Col 3: Compliance & Legal */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>Compliance & Safety</h4>
          <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Privacy Policy & Consent</li>
            <li>Terms of Medical Service</li>
            <li>HIPAA & Medical Audit Compliance</li>
            <li>Government Organ Transplant Guidelines</li>
          </ul>
        </div>

        {/* Col 4: Emergency Contacts */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>24/7 Medical Helpline</h4>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>
            📞 1800-LIFELINK (543354)
          </div>
          <button className="btn-sos" style={{ width: '100%', justifyContent: 'center' }} onClick={onOpenSos}>
            <PhoneCall size={16} /> Broadcast Emergency SOS
          </button>
        </div>

      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        © 2026 LifeLink Smart Organ & Blood Donation System. All demo data strictly for academic engineering presentation.
      </div>
    </footer>
  );
};
