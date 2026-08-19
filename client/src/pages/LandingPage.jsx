import React, { useState, useEffect } from 'react';
import { Heart, Search, ShieldCheck, MapPin, Award, Users, ChevronRight, HelpCircle, PhoneCall, Wifi } from 'lucide-react';
import { fetchApi } from '../services/api';
import { useRealtime } from '../context/RealtimeContext';

export const LandingPage = ({ onOpenSos, onOpenQr, onSwitchTab, onOpenSignIn, onOpenSignUp }) => {
  const { liveStats, refreshVersion } = useRealtime();
  const [searchBg, setSearchBg] = useState('ALL');
  const [searchCity, setSearchCity] = useState('ALL');
  const [searchType, setSearchType] = useState('BLOOD');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    if (searchType === 'BLOOD') {
      const res = await fetchApi(`/inventory/blood?blood_group=${searchBg}&city=${searchCity}`);
      if (res.success) setResults(res.inventory || []);
    } else {
      const res = await fetchApi(`/inventory/organs?organ_type=${searchBg}&city=${searchCity}`);
      if (res.success) setResults(res.inventory || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    handleSearch();
  }, [searchType, refreshVersion]);

  return (
    <div style={{ paddingBottom: 60 }}>
      
      {/* Hero Section */}
      <section style={{
        padding: '60px 24px 40px 24px',
        textAlign: 'center',
        maxWidth: 1100,
        margin: '0 auto'
      }}>
        <div className="badge badge-danger" style={{ marginBottom: 16, fontSize: '0.85rem' }}>
          <Heart size={14} fill="#E53935" /> LifeLink Smart Organ & Blood Donation Network
        </div>

        <h1 style={{ fontSize: '3.2rem', fontWeight: 800, lineHeight: 1.15, marginBottom: 20, color: 'var(--text-main)' }}>
          Every Drop Counts. Every <span style={{ color: 'var(--primary)' }}>Organ Saves A Life.</span>
        </h1>

        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: 740, margin: '0 auto 32px auto', lineHeight: 1.6 }}>
          LifeLink bridges critical healthcare gaps by instantly matching blood donors, organ registries, and verified multi-specialty hospitals with emergency receivers in real time.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <button
            className="btn-primary"
            style={{ fontSize: '1.05rem', padding: '14px 32px', boxShadow: '0 8px 28px rgba(229,57,53,0.4)' }}
            onClick={onOpenSignUp}
          >
            ✨ Join LifeLink / Pledge Now <ChevronRight size={18} />
          </button>
          <button
            className="btn-outline"
            style={{ fontSize: '1.05rem', padding: '14px 28px' }}
            onClick={onOpenSignIn}
          >
            Sign In to Your Account
          </button>
          <button className="btn-sos" style={{ fontSize: '1.05rem', padding: '14px 24px' }} onClick={onOpenSos}>
            <PhoneCall size={18} /> SOS Emergency
          </button>
        </div>

        {/* Impact Counters (Real-time DB sync) */}
        <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, padding: 24, position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary)' }}>{liveStats.totalUsers || 0}</h2>
              <span className="pulse-dot" title="Real-time live database count" />
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>Registered Users</div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--secondary)' }}>{liveStats.totalBloodDonations || liveStats.totalBloodUnits || 0}</h2>
              <span className="pulse-dot" title="Real-time live database count" />
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>Blood Donations</div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent)' }}>{liveStats.totalOrganDonations || 0}</h2>
              <span className="pulse-dot" title="Real-time live database count" />
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>Organ Matches</div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--warning)' }}>{liveStats.totalHospitals || 0}</h2>
              <span className="pulse-dot" title="Real-time live database count" />
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>Partner Hospitals</div>
          </div>
        </div>
      </section>

      {/* Live Search Widget */}
      <section style={{ maxWidth: 1100, margin: '0 auto 60px auto', padding: '0 24px' }}>
        <div className="glass-card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>🔍 Live Blood & Organ Availability Search</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Search real-time stock across {liveStats.totalHospitals || 0} partner hospitals nationwide</p>
            </div>
            
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className={searchType === 'BLOOD' ? 'btn-primary' : 'btn-outline'}
                onClick={() => setSearchType('BLOOD')}
              >
                🩸 Blood Search
              </button>
              <button
                className={searchType === 'ORGAN' ? 'btn-secondary' : 'btn-outline'}
                onClick={() => setSearchType('ORGAN')}
              >
                🫀 Organ Search
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                {searchType === 'BLOOD' ? 'Blood Group' : 'Organ Category'}
              </label>
              <select
                value={searchBg}
                onChange={(e) => setSearchBg(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
              >
                <option value="ALL">All Categories</option>
                {searchType === 'BLOOD'
                  ? ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)
                  : ['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Eyes'].map(o => <option key={o} value={o}>{o}</option>)
                }
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>City / Region</label>
              <select
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
              >
                <option value="ALL">All Cities</option>
                {['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn-primary" style={{ padding: '12px 28px', width: '100%' }} onClick={handleSearch} disabled={loading}>
                <Search size={16} /> {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Results Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {results.slice(0, 6).map((item, idx) => (
              <div key={idx} style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg-main)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span className="badge badge-info">{item.city}</span>
                  <span className="badge badge-success">Available</span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>{item.hospital_name}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                  {searchType === 'BLOOD' ? `Group: ${item.blood_group}` : `Organ: ${item.organ_type}`}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 8, borderTop: '1px dashed var(--border)' }}>
                  <strong style={{ color: 'var(--primary)' }}>
                    {searchType === 'BLOOD' ? `${item.units_available} Units` : `Waiting List: ${item.waiting_list_count}`}
                  </strong>
                  <button className="btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => onSwitchTab('mobile')}>
                    Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ maxWidth: 1100, margin: '0 auto 60px auto', padding: '0 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>How LifeLink Works</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 40 }}>Simple 4-step medical matching process designed for emergency speed</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          <div className="glass-card" style={{ padding: 24, textAlign: 'left' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>1️⃣</div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Register & Verify</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Donors and Hospitals register with blood group, organ consent, and medical credentials.</p>
          </div>
          <div className="glass-card" style={{ padding: 24, textAlign: 'left' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>2️⃣</div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Instant SOS Request</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Receivers broadcast emergency blood or organ requests filtered by location and urgency.</p>
          </div>
          <div className="glass-card" style={{ padding: 24, textAlign: 'left' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>3️⃣</div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Smart Matching</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Algorithms match compatible blood groups and organ donors with nearby hospital centers.</p>
          </div>
          <div className="glass-card" style={{ padding: 24, textAlign: 'left' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>4️⃣</div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Life Saved</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hospitals approve verification and complete the safe transfer process with audit logging.</p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: 32 }}>Frequently Asked Questions</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { q: 'Who can register as a Blood or Organ Donor on LifeLink?', a: 'Any healthy individual above 18 years old can register for blood donation. Organ donation pledge requires official consent and verification.' },
            { q: 'How does the Emergency SOS Radar work?', a: 'When a receiver hits SOS, LifeLink sends instant notifications to all active donors and partner hospitals within a 15km radial distance.' },
            { q: 'Are medical documents verified before organ matching?', a: 'Yes. Hospital administrators verify medical eligibility documents and government medical licenses before approving any organ allocation.' }
          ].map((item, idx) => (
            <div key={idx} className="glass-card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
                <span><HelpCircle size={16} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--primary)' }} /> {item.q}</span>
                <span>{faqOpen === idx ? '−' : '+'}</span>
              </div>
              {faqOpen === idx && (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
      {/* Final CTA Banner */}
      <section style={{ maxWidth: 1100, margin: '60px auto 0 auto', padding: '0 24px' }}>
        <div style={{
          borderRadius: 24,
          background: 'linear-gradient(135deg, #E53935 0%, #C62828 40%, #1565C0 100%)',
          padding: '56px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -40, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

          <div style={{ fontSize: '2.8rem', marginBottom: 12 }}>❤️</div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'white', marginBottom: 14, position: 'relative' }}>
            Ready to Save a Life Today?
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.85)', maxWidth: 560, margin: '0 auto 32px auto', lineHeight: 1.6, position: 'relative' }}>
            Join {liveStats.totalUsers || 0}+ donors, hospitals, and receivers on India's most advanced donation platform.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
            <button
              onClick={onOpenSignUp}
              style={{
                padding: '14px 36px', borderRadius: 14, border: 'none',
                background: 'white', color: '#E53935',
                fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.3)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
            >
              ✨ Create Free Account
            </button>
            <button
              onClick={onOpenSignIn}
              style={{
                padding: '14px 36px', borderRadius: 14,
                border: '2px solid rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                color: 'white', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            >
              Sign In →
            </button>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginTop: 20, position: 'relative' }}>
            🔒 Free Forever · ABDM Compliant · 24/7 Emergency Support
          </p>
        </div>
      </section>

    </div>
  );
};
