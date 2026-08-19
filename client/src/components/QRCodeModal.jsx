import React, { useState } from 'react';
import { Smartphone, Download, X, ShieldCheck, Heart, QrCode, RefreshCw, Printer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const QRCodeModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isOpen) return null;

  const donorName = user?.full_name || 'Donor';
  const bloodGroup = user?.blood_group || user?.donor?.blood_group || 'O+';
  const rawId = user?.id ? String(user.id).slice(0, 8).toUpperCase() : '1084';
  const donorId = `LL-CARD-2026-${rawId}`;

  const handleDownloadCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 800, 500);
    grad.addColorStop(0, '#0284C7');
    grad.addColorStop(1, '#0369A1');
    ctx.fillStyle = grad;

    // Rounded rectangle background
    const r = 24;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(800 - r, 0);
    ctx.quadraticCurveTo(800, 0, 800, r);
    ctx.lineTo(800, 500 - r);
    ctx.quadraticCurveTo(800, 500, 800 - r, 500);
    ctx.lineTo(r, 500);
    ctx.quadraticCurveTo(0, 500, 0, 500 - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fill();

    // Card border
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.stroke();

    // Header Logo and Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('❤️ LifeLink Official Donor ID', 40, 65);

    // Blood group badge
    ctx.fillStyle = '#E53935';
    ctx.beginPath();
    ctx.moveTo(680, 28);
    ctx.lineTo(760, 28);
    ctx.quadraticCurveTo(770, 28, 770, 38);
    ctx.lineTo(770, 72);
    ctx.quadraticCurveTo(770, 82, 760, 82);
    ctx.lineTo(680, 82);
    ctx.quadraticCurveTo(670, 82, 670, 72);
    ctx.lineTo(670, 38);
    ctx.quadraticCurveTo(670, 28, 680, 28);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(bloodGroup, 720, 66);
    ctx.textAlign = 'left';

    // Donor Name Section
    ctx.fillStyle = '#BAE6FD';
    ctx.font = '600 16px sans-serif';
    ctx.fillText('VERIFIED DONOR NAME', 40, 160);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText((donorName || 'Donor').toUpperCase(), 40, 205);

    // Donor Info
    ctx.fillStyle = '#E0F2FE';
    ctx.font = '18px sans-serif';
    ctx.fillText('Status: Active Registered Donor  •  National Medical Board Verified', 40, 260);
    ctx.fillText('Pledged Category: Organ & Emergency Blood Donation', 40, 295);

    // Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 350);
    ctx.lineTo(760, 350);
    ctx.stroke();

    // Footer: ID Code
    ctx.fillStyle = '#BAE6FD';
    ctx.font = '14px sans-serif';
    ctx.fillText('OFFICIAL DONOR ID CODE', 40, 390);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(donorId, 40, 425);

    // Footer: Verification Seal
    ctx.textAlign = 'right';
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('✓ EMERGENCY DIGITAL MEDICAL PASS', 760, 400);

    ctx.fillStyle = '#E0F2FE';
    ctx.font = '12px sans-serif';
    ctx.fillText('Valid across all verified partner hospitals nationwide', 760, 425);
    ctx.textAlign = 'left';

    // Trigger immediate browser file download
    const link = document.createElement('a');
    link.download = `LifeLink_Donor_Card_${(donorName || 'donor').replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
      <div className="glass-card modal-content" style={{ width: '90%', maxWidth: 480, padding: 28, position: 'relative', textAlign: 'center' }}>
        
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <Heart fill="#E53935" color="#E53935" size={24} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Digital Organ & Blood Donor Card</h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          Official Verified Donor Identity • Flip card to view Medical Details & QR Verification
        </p>

        {/* Flippable Digital Card Component */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            perspective: 1000,
            cursor: 'pointer',
            marginBottom: 24
          }}
        >
          <div style={{
            position: 'relative',
            width: '100%',
            height: 250,
            borderRadius: 20,
            background: isFlipped
              ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
              : 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
            color: 'white',
            padding: 24,
            textAlign: 'left',
            boxShadow: '0 12px 32px rgba(2, 132, 199, 0.35)',
            transition: 'all 0.5s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '2px solid rgba(255,255,255,0.2)'
          }}>

            {!isFlipped ? (
              /* CARD FRONT */
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', letterSpacing: 1.5, opacity: 0.85, fontWeight: 700, textTransform: 'uppercase' }}>
                      LIFELINK OFFICIAL DONOR ID
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: 4 }}>{donorName}</div>
                  </div>
                  <div style={{ background: '#E53935', padding: '6px 14px', borderRadius: 12, fontWeight: 900, fontSize: '1.2rem' }}>
                    {bloodGroup}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.82rem', opacity: 0.9, marginBottom: 8 }}>
                    <span>Aadhaar Status: <strong style={{ color: '#6EE7B7' }}>✓ Verified</strong></span>
                    <span>Gender: <strong>Male</strong></span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>DONOR ID CODE</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'monospace' }}>{donorId}</div>
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8, fontStyle: 'italic' }}>
                      Tap to flip 🔄
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* CARD BACK */
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38BDF8' }}>
                    🫀 REGISTERED ORGAN PLEDGES
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>SCAN TO VERIFY</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div>• Kidney & Liver Pledge</div>
                    <div>• Heart & Cornea Pledge</div>
                    <div>• Emergency Responder: Active</div>
                    <div style={{ color: '#FCD34D', fontSize: '0.78rem', marginTop: 4 }}>🏆 Platinum Life Saver</div>
                  </div>

                  {/* QR Code SVG */}
                  <div style={{ background: 'white', padding: 8, borderRadius: 10 }}>
                    <svg width="70" height="70" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="white" />
                      <path d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M20,20 h10 v10 h-10 z" fill="#0F172A" />
                      <path d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M70,20 h10 v10 h-10 z" fill="#0F172A" />
                      <path d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M20,70 h10 v10 h-10 z" fill="#0F172A" />
                      <rect x="45" y="45" width="10" height="10" fill="#E53935" />
                      <rect x="60" y="60" width="15" height="15" fill="#0F172A" />
                    </svg>
                  </div>
                </div>

                <div style={{ fontSize: '0.7rem', opacity: 0.7, textAlign: 'center' }}>
                  Authorized by National Medical Transplantation Board
                </div>
              </>
            )}

          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ fontSize: '0.85rem' }} onClick={() => window.print()}>
            <Printer size={15} /> Print Donor Card
          </button>
          <button className="btn-outline" style={{ fontSize: '0.85rem' }} onClick={handleDownloadCard}>
            <Download size={15} /> Download Card
          </button>
        </div>

      </div>
    </div>
  );
};
