import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useRealtime } from '../context/RealtimeContext';
import { Heart, Sun, Moon, Bell, Shield, PhoneCall, QrCode, User, LogOut,
         Smartphone, Activity, Radio, Building2, Menu, X } from 'lucide-react';

export const Navbar = ({ onOpenSos, onOpenQr, onOpenAuth, onOpenSignUp, onOpenAiBot, currentTab, setCurrentTab }) => {
  const { user, loginAsDemo, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isConnected, liveAlerts } = useRealtime();

  const [showRoleMenu, setShowRoleMenu]   = useState(false);
  const [showNotifs, setShowNotifs]       = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roleMenuRef  = useRef(null);
  const notifRef     = useRef(null);

  // ── Close dropdowns when clicking outside ─────────────────────────────────
  useEffect(() => {
    const handleOutside = (e) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) {
        setShowRoleMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // ── Close mobile menu on nav item click ───────────────────────────────────
  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  const NAV_ITEMS = [
    { id: 'landing',  label: 'Home',             icon: <Activity size={16} /> },
    { id: 'user',     label: 'User Module',       icon: <User size={16} /> },
    { id: 'hospital', label: 'Hospital Portal',   icon: <Building2 size={16} /> },
    { id: 'admin',    label: 'Admin Portal',      icon: <Shield size={16} /> },
    { id: 'mobile',   label: 'Mobile Simulator',  icon: <Smartphone size={16} /> },
  ];

  return (
    <>
      <header
        className="glass-card"
        style={{ position: 'sticky', top: 12, zIndex: 100, margin: '12px 24px 0 24px', padding: '12px 24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

          {/* ── Brand Logo ───────────────────────────────────────────────── */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flexShrink: 0 }}
            onClick={() => handleTabChange('landing')}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(229, 57, 53, 0.4)'
            }}>
              <Heart style={{ color: 'white', fill: 'white' }} size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)' }}>
                <span>Life</span><span style={{ color: 'var(--primary)' }}>Link</span>
                <span className={`badge ${isConnected ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem', padding: '2px 6px', textTransform: 'uppercase' }}>
                  <Radio size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  {isConnected ? 'LIVE' : 'POLLING'}
                </span>
              </h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Organ &amp; Blood Platform
              </span>
            </div>
          </div>

          {/* ── Desktop Navigation Tabs ──────────────────────────────────── */}
          <nav style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            flexWrap: 'nowrap',
            whiteSpace: 'nowrap',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }} className="navbar-desktop-nav no-scrollbar">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`btn-outline ${currentTab === item.id ? 'active-nav' : ''}`}
                onClick={() => handleTabChange(item.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>

          {/* ── Action Controls ──────────────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }} className="navbar-actions">

            {/* AI Chatbot */}
            <button className="btn-outline" style={{ padding: '10px 14px', gap: 6 }} onClick={onOpenAiBot} title="LifeLink AI Medical Assistant">
              🤖 AI
            </button>

            {/* Theme Toggle */}
            <button className="btn-outline" style={{ padding: '10px' }} onClick={toggleTheme} title="Toggle Theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Notifications Bell */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button className="btn-outline" style={{ padding: '10px', position: 'relative' }} onClick={() => setShowNotifs(!showNotifs)}>
                <Bell size={18} />
                {liveAlerts.length > 0 && (
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 8, height: 8,
                    backgroundColor: 'var(--primary)', borderRadius: '50%'
                  }} />
                )}
              </button>

              {showNotifs && (
                <div className="glass-card" style={{
                  position: 'absolute', top: 48, right: 0,
                  width: 340, padding: 16, zIndex: 200
                }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>⚡ Real-Time Live Feed</span>
                    <span className="badge badge-danger">{liveAlerts.length} Alerts</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.82rem', maxHeight: 300, overflowY: 'auto' }}>
                    {liveAlerts.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>No alerts yet — waiting for events...</p>
                    ) : liveAlerts.map((alert) => (
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                  background: 'var(--accent-light)', border: '1px solid var(--accent)',
                  borderRadius: 12, fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)'
                }}>
                  <User size={16} /> {user.full_name || user.email?.split('@')[0]}{' '}
                  <span style={{ opacity: 0.7 }}>({user.role})</span>
                </div>
                <button
                  className="btn-outline"
                  style={{ gap: 6, padding: '10px 14px', color: 'var(--primary)', borderColor: 'var(--primary-light)' }}
                  onClick={logout}
                  title="Logout from Account"
                >
                  <LogOut size={16} /> Logout
                </button>
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

            {/* ── Mobile Hamburger Button ──────────────────────────────────── */}
            <button
              className="btn-outline navbar-hamburger"
              style={{ padding: '10px', display: 'none' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              title="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Navigation Drawer ───────────────────────────────────── */}
        {mobileMenuOpen && (
          <nav style={{
            marginTop: 16, paddingTop: 16,
            borderTop: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: 8
          }}>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`btn-outline ${currentTab === item.id ? 'active-nav' : ''}`}
                onClick={() => handleTabChange(item.id)}
                style={{ justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: 10 }}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      {/* Responsive CSS injected as a style tag */}
      <style>{`
        @media (max-width: 900px) {
          .navbar-desktop-nav { display: none !important; }
          .navbar-hamburger { display: flex !important; }
          .navbar-actions .btn-outline:not(.navbar-hamburger),
          .navbar-actions .btn-primary,
          .navbar-actions > div:not(:last-child) {
            display: none !important;
          }
        }
        @media (max-width: 560px) {
          header.glass-card { margin: 8px !important; padding: 10px 14px !important; }
        }
      `}</style>
    </>
  );
};
