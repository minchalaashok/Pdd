import React, { useState, useEffect } from 'react';
import {
  Smartphone, Search, Heart, MapPin, Award, MessageSquare, ShieldCheck,
  PhoneCall, Upload, Send, CheckCircle, Clock, AlertTriangle, UserCheck, Plus, Activity
} from 'lucide-react';
import { fetchApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const MobileAppSimulator = ({ onOpenSos }) => {
  const { user } = useAuth();
  const [activeRoleTab, setActiveRoleTab] = useState('donor');
  const [mobileTab, setMobileTab] = useState('home');

  // Search States
  const [searchBg, setSearchBg] = useState('A+');
  const [searchOrgan, setSearchOrgan] = useState('Kidney');
  const [searchCity, setSearchCity] = useState('Mumbai');
  const [searchResults, setSearchResults] = useState([]);

  // Donor States
  const [donorAvailable, setDonorAvailable] = useState(true);
  const [myBadges] = useState(['Gold Donor', 'Hero of Life', 'Emergency Responder']);

  // Chat States
  const [messages, setMessages] = useState([
    { sender: 'Hospital Care', text: 'Hello! Your blood request for A+ has been received.', time: '10:42 AM' },
    { sender: 'You', text: 'Thank you! When can I come for donation verification?', time: '10:45 AM' },
    { sender: 'Hospital Care', text: 'You can visit Ward 4 today before 5 PM.', time: '10:48 AM' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  // Hospital Inventory States
  const [stockGroup, setStockGroup] = useState('O+');
  const [stockUnits, setStockUnits] = useState(25);
  const [stockMsg, setStockMsg] = useState('');

  const handleSearchDonors = async () => {
    const res = await fetchApi(`/donors/search?blood_group=${searchBg}&city=${searchCity}`);
    if (res.success) setSearchResults(res.donors || []);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setMessages((prev) => [
      ...prev,
      { sender: 'You', text: inputMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setInputMsg('');
  };

  const handleUpdateStock = async () => {
    await fetchApi('/hospital/stock', {
      method: 'POST',
      body: JSON.stringify({ hospital_id: 1, blood_group: stockGroup, units_available: Number(stockUnits) })
    });
    setStockMsg(`Updated ${stockGroup} stock to ${stockUnits} units`);
    setTimeout(() => setStockMsg(''), 3000);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 12px' }}>
      
      {/* Role Switcher Toolbar */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>📱 Cross-Platform Mobile Experience Simulator</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Simulating Flutter / React Native iOS & Android UI</p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={activeRoleTab === 'donor' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setActiveRoleTab('donor')}
          >
            🩸 Donor Portal
          </button>
          <button
            className={activeRoleTab === 'receiver' ? 'btn-secondary' : 'btn-outline'}
            onClick={() => setActiveRoleTab('receiver')}
          >
            🤲 Receiver Portal
          </button>
          <button
            className={activeRoleTab === 'hospital' ? 'btn-outline' : 'btn-outline'}
            style={{ background: activeRoleTab === 'hospital' ? 'var(--accent)' : 'transparent', color: activeRoleTab === 'hospital' ? 'white' : 'var(--text-main)' }}
            onClick={() => setActiveRoleTab('hospital')}
          >
            🏥 Hospital Dashboard
          </button>
        </div>
      </div>

      {/* Phone Mockup Frame Container */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 380,
          minHeight: 720,
          borderRadius: 40,
          border: '12px solid #1E293B',
          background: 'var(--bg-card)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}>
          
          {/* Top Notch & Status Bar */}
          <div style={{ background: '#1E293B', padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', fontSize: '0.75rem' }}>
            <span>9:41</span>
            <div style={{ width: 80, height: 14, background: '#0F172A', borderRadius: 10 }}></div>
            <span>100% ⚡</span>
          </div>

          {/* Mobile App Header */}
          <div style={{ padding: '16px 20px', background: 'var(--bg-glass)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Heart size={18} fill="white" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>LifeLink App</span>
            </div>
            <span className="badge badge-info">{activeRoleTab.toUpperCase()}</span>
          </div>

          {/* Phone Screen Body */}
          <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: 'var(--bg-main)' }}>
            
            {/* HOME VIEW */}
            {mobileTab === 'home' && (
              <div>
                {/* Emergency Card */}
                <div style={{ padding: 16, borderRadius: 16, background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)', color: 'white', marginBottom: 16 }}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: 4 }}>EMERGENCY RADAR</div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 8 }}>Immediate Blood / Organ Request</h4>
                  <button className="btn-sos" style={{ background: 'white', color: '#DC2626', border: 'none', width: '100%', justifyContent: 'center' }} onClick={onOpenSos}>
                    <PhoneCall size={16} /> Broadcast SOS
                  </button>
                </div>

                {/* Quick Services */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  <div className="glass-card" style={{ padding: 14, cursor: 'pointer' }} onClick={() => setMobileTab('search')}>
                    <Search size={22} style={{ color: 'var(--primary)', marginBottom: 6 }} />
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Search Donors</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Find blood & organs</div>
                  </div>
                  <div className="glass-card" style={{ padding: 14, cursor: 'pointer' }} onClick={() => setMobileTab('chat')}>
                    <MessageSquare size={22} style={{ color: 'var(--secondary)', marginBottom: 6 }} />
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Live Hospital Chat</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Direct messaging</div>
                  </div>
                </div>

                {/* Donor Status / Badges */}
                {activeRoleTab === 'donor' && (
                  <div className="glass-card" style={{ padding: 14, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Donation Availability</span>
                      <button
                        className={donorAvailable ? 'badge badge-success' : 'badge badge-danger'}
                        onClick={() => setDonorAvailable(!donorAvailable)}
                        style={{ border: 'none', cursor: 'pointer' }}
                      >
                        {donorAvailable ? 'AVAILABLE' : 'BUSY'}
                      </button>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                      Your Badges:
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {myBadges.map((b, i) => (
                        <span key={i} className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                          <Award size={12} /> {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nearby Hospitals Map Mock Visual */}
                <div className="glass-card" style={{ padding: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={16} style={{ color: 'var(--primary)' }} /> Nearby Hospitals (Live Map)
                  </div>
                  <div style={{
                    height: 120,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    padding: 10
                  }}>
                    📍 Apex Hospital (1.2 km)<br />📍 City Care Center (2.5 km)
                  </div>
                </div>
              </div>
            )}

            {/* SEARCH TAB */}
            {mobileTab === 'search' && (
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Filter & Search Donors</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Blood Group</label>
                    <select
                      value={searchBg}
                      onChange={(e) => setSearchBg(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>City</label>
                    <select
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                    >
                      {['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <button className="btn-primary" style={{ padding: '8px', justifyContent: 'center' }} onClick={handleSearchDonors}>
                    <Search size={16} /> Search Active Donors
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {searchResults.slice(0, 5).map((d, idx) => (
                    <div key={idx} className="glass-card" style={{ padding: 10, fontSize: '0.82rem' }}>
                      <div style={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{d.full_name}</span>
                        <span className="badge badge-danger">{d.blood_group}</span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{d.city} • {d.total_donations} Donations</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CHAT TAB */}
            {mobileTab === 'chat' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Hospital Emergency Chat</h4>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', marginBottom: 12 }}>
                  {messages.map((m, idx) => (
                    <div key={idx} style={{
                      alignSelf: m.sender === 'You' ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      padding: '8px 12px',
                      borderRadius: 12,
                      background: m.sender === 'You' ? 'var(--primary)' : 'var(--bg-card)',
                      color: m.sender === 'You' ? 'white' : 'var(--text-main)',
                      fontSize: '0.8rem',
                      border: '1px solid var(--border)'
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '0.7rem', opacity: 0.8 }}>{m.sender}</div>
                      <div>{m.text}</div>
                      <div style={{ fontSize: '0.65rem', textAlign: 'right', opacity: 0.7, marginTop: 2 }}>{m.time}</div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Type message..."
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none' }}
                  />
                  <button className="btn-primary" style={{ padding: '8px 12px', borderRadius: '50%' }}>
                    <Send size={14} />
                  </button>
                </form>
              </div>
            )}

            {/* HOSPITAL DASHBOARD VIEW */}
            {activeRoleTab === 'hospital' && (
              <div style={{ marginTop: 12 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>Hospital Stock Manager</h4>
                <div className="glass-card" style={{ padding: 12, fontSize: '0.82rem' }}>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: '0.75rem' }}>Blood Group</label>
                    <select
                      value={stockGroup}
                      onChange={(e) => setStockGroup(e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                    >
                      {['A+', 'B+', 'O+', 'AB+'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: '0.75rem' }}>Units Available</label>
                    <input
                      type="number"
                      value={stockUnits}
                      onChange={(e) => setStockUnits(e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                    />
                  </div>
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '6px' }} onClick={handleUpdateStock}>
                    Update Inventory
                  </button>
                  {stockMsg && <div style={{ color: 'var(--accent)', fontSize: '0.75rem', marginTop: 6, textAlign: 'center' }}>{stockMsg}</div>}
                </div>
              </div>
            )}

          </div>

          {/* Phone Bottom Navigation Bar */}
          <div style={{ background: 'var(--bg-glass)', borderTop: '1px solid var(--border)', padding: '8px 16px', display: 'flex', justifyContent: 'space-around' }}>
            <button style={{ background: 'none', border: 'none', color: mobileTab === 'home' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={() => setMobileTab('home')}>
              <Heart size={18} /> Home
            </button>
            <button style={{ background: 'none', border: 'none', color: mobileTab === 'search' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={() => setMobileTab('search')}>
              <Search size={18} /> Search
            </button>
            <button style={{ background: 'none', border: 'none', color: mobileTab === 'chat' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={() => setMobileTab('chat')}>
              <MessageSquare size={18} /> Chat
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
