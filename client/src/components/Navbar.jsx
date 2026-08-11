import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useRealtime } from '../context/RealtimeContext';
import { Heart, Sun, Moon, Bell, Shield, PhoneCall, QrCode, User, LogOut, Smartphone, Activity, Radio, Building2 } from 'lucide-react';

export const Navbar = ({ onOpenSos, onOpenQr, onOpenAuth, onOpenSignUp, onOpenAiBot, currentTab, setCurrentTab }) => {
  const { user, loginAsDemo, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isConnected, liveAlerts } = useRealtime();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <header className="glass-card" style={{ position: 'sticky', top: 12, zIndex: 100, margin: '12px 24px 0 24px', padding: '12px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setCurrentTab('landing')}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(229, 57, 53, 0.4)'
          }}>
            <Heart style={{ color: 'white', fill: 'white' }} size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 8 }}>
              Life<span style={{ color: 'var(--primary)' }}>Link</span>
              <span className={`badge ${isConnected ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem', padding: '2px 6px', textTransform: 'uppercase' }}>
                <Radio size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {isConnected ? 'LIVE REALTIME' : 'POLLING'}
              </span>
            </h2>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Organ & Blood Platform
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className={`btn-outline ${currentTab === 'landing' ? 'active-nav' : ''}`}
            onClick={() => setCurrentTab('landing')}
          >
            <Activity size={16} /> Home
          </button>

          <button
            className={`btn-outline ${currentTab === 'user' ? 'active-nav' : ''}`}
            onClick={() => setCurrentTab('user')}
          >
            <User size={16} /> User Module
          </button>

          <button
            className={`btn-outline ${currentTab === 'hospital' ? 'active-nav' : ''}`}
            onClick={() => setCurrentTab('hospital')}
          >
            <Building2 size={16} /> Hospital Portal
          </button>

          <button
            className={`btn-outline ${currentTab === 'admin' ? 'active-nav' : ''}`}
            onClick={() => setCurrentTab('admin')}
          >
            <Shield size={16} /> Admin Portal
          </button>

          <button
            className={`btn-outline ${currentTab === 'mobile' ? 'active-nav' : ''}`}
            onClick={() => setCurrentTab('mobile')}
          >
            <Smartphone size={16} /> Mobile Simulator
          </button>
        </nav>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          
          {/* AI Chatbot Launcher */}
          <button className="btn-outline" style={{ padding: '10px 14px', gap: 6 }} onClick={onOpenAiBot} title="LifeLink AI Medical Assistant">
            🤖 AI Assistant
          </button>

          {/* Emergency SOS Button */}
          <button className="btn-sos" onClick={onOpenSos}>
            <PhoneCall size={16} /> SOS Emergency
          </button>

          {/* Download App QR / Donor Card */}
          <button className="btn-outline" style={{ padding: '10px' }} onClick={onOpenQr} title="Digital Donor Card & App QR">
            <QrCode size={18} />
          </button>

          {/* Theme Toggle */}
          <button className="btn-outline" style={{ padding: '10px' }} onClick={toggleTheme} title="Toggle Theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Notifications Bell */}
          <div style={{ position: 'relative' }}>
            <button className="btn-outline" style={{ padding: '10px', position: 'relative' }} onClick={() => setShowNotifs(!showNotifs)}>
              <Bell size={18} />
              {liveAlerts.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  backgroundColor: 'var(--primary)',
                  borderRadius: '50%'
                }} />
              )}
            </button>

            {showNotifs && (
              <div className="glass-card" style={{
                position: 'absolute',
                top: 48,
                right: 0,
                width: 340,
                padding: 16,
                zIndex: 200
              }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>⚡ Real-Time Live Feed</span>
                  <span className="badge badge-danger">{liveAlerts.length} Alerts</span>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.82rem', maxHeight: 300, overflowY: 'auto' }}>
                  {liveAlerts.map((alert) => (
                    <div key={alert.id} style={{
                      padding: 10,
                      background: alert.type?.includes('EMERGENCY') ? 'var(--primary-light)' : 'var(--bg-main)',
                      borderRadius: 8,
                      borderLeft: `3px solid ${alert.type?.includes('EMERGENCY') ? 'var(--primary)' : 'var(--accent)'}`
                    }}>
                      <div style={{ fontWeight: 700 }}>{alert.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{alert.subtitle}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>{alert.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Auth Buttons */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 12, fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent)' }}>
              <User size={16} /> {user.full_name || user.email?.split('@')[0]} <span style={{ opacity: 0.7 }}>({user.role})</span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-outline" style={{ gap: 6, padding: '10px 16px' }} onClick={onOpenAuth}>
                <User size={15} /> Sign In
              </button>
              <button className="btn-primary" style={{ gap: 6, padding: '10px 16px' }} onClick={onOpenSignUp}>
                ✨ Sign Up
              </button>
            </div>
          )}

          {/* Role Switcher & User Profile */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn-primary"
              style={{ gap: 8, padding: '10px 16px' }}
              onClick={() => setShowRoleMenu(!showRoleMenu)}
            >
              <User size={18} />
              <span>{user ? user.role.toUpperCase() : 'DEMO LOGIN'}</span>
            </button>

            {showRoleMenu && (
              <div className="glass-card" style={{
                position: 'absolute',
                top: 48,
                right: 0,
                width: 220,
                padding: 8,
                zIndex: 200,
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}>
                <div style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  SWITCH DEMO ROLE
                </div>
                <button className="btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => { loginAsDemo('admin'); setCurrentTab('admin'); setShowRoleMenu(false); }}>
                  🛡️ Admin Portal
                </button>
                <button className="btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => { loginAsDemo('hospital'); setCurrentTab('mobile'); setShowRoleMenu(false); }}>
                  🏥 Hospital Portal
                </button>
                <button className="btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => { loginAsDemo('donor'); setCurrentTab('mobile'); setShowRoleMenu(false); }}>
                  🩸 Donor Portal
                </button>
                <button className="btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => { loginAsDemo('receiver'); setCurrentTab('mobile'); setShowRoleMenu(false); }}>
                  🤲 Receiver Portal
                </button>
                
                {user && (
                  <>
                    <hr style={{ borderColor: 'var(--border)', margin: '4px 0' }} />
                    <button className="btn-outline" style={{ justifyContent: 'flex-start', color: 'var(--primary)' }} onClick={() => { logout(); setShowRoleMenu(false); }}>
                      <LogOut size={16} /> Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
