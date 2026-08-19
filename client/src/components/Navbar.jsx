import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useRealtime } from '../context/RealtimeContext';
import { fetchApi } from '../services/api';
import { Heart, Sun, Moon, Bell, Shield, PhoneCall, QrCode, User, LogOut,
         Smartphone, Activity, Radio, Building2, Menu, X } from 'lucide-react';

export const Navbar = ({ onOpenSos, onOpenQr, onOpenAuth, onOpenSignUp, onOpenAiBot, currentTab, setCurrentTab }) => {
  const { user, loginAsDemo, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isConnected, liveAlerts } = useRealtime();

  const [showRoleMenu, setShowRoleMenu]   = useState(false);
  const [showNotifs, setShowNotifs]       = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [dbNotifications, setDbNotifications] = useState([]);

  const loadDbNotifications = async () => {
    if (!user) return;
    const res = await fetchApi('/notifications');
    if (res.success) {
      setDbNotifications(res.notifications || []);
    }
  };

  const markDbNotificationsAsRead = async () => {
    if (!user) return;
    await fetchApi('/notifications/read', { method: 'PUT' });
    loadDbNotifications();
  };

  useEffect(() => {
    if (user) {
      loadDbNotifications();
      const interval = setInterval(loadDbNotifications, 4000);
      return () => clearInterval(interval);
    } else {
      setDbNotifications([]);
    }
  }, [user]);

  const handleToggleNotifs = () => {
    const nextState = !showNotifs;
    setShowNotifs(nextState);
    if (nextState && user) {
      markDbNotificationsAsRead();
    }
  };

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

  const getNavItems = () => {
    if (user) {
      if (user.role === 'donor') {
        return [
          { id: 'user',     label: 'DONOR',             icon: <User size={16} /> }
        ];
      }
      if (user.role === 'hospital') {
        return [
          { id: 'hospital', label: 'Hospital Portal',   icon: <Building2 size={16} /> }
        ];
      }
    }
    return [
      { id: 'landing',  label: 'Home',             icon: <Activity size={16} /> },
      { id: 'mobile',   label: 'Mobile Simulator',  icon: <Smartphone size={16} /> },
    ];
  };

  const NAV_ITEMS = getNavItems();

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
            {(!user || user.role !== 'donor') && (
              <button className="btn-outline" style={{ padding: '10px 14px', gap: 6 }} onClick={onOpenAiBot} title="LifeLink AI Medical Assistant">
                🤖 AI
              </button>
            )}

            {/* Theme Toggle */}
            <button className="btn-outline" style={{ padding: '10px' }} onClick={toggleTheme} title="Toggle Theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Notifications Bell */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button className="btn-outline" style={{ padding: '10px', position: 'relative' }} onClick={handleToggleNotifs}>
                <Bell size={18} />
                {(user ? dbNotifications.filter(n => n.is_read === 0).length : liveAlerts.length) > 0 && (
                  <span style={{
                    position: 'absolute', top: -2, right: -2,
                    minWidth: 16, height: 16, fontSize: '0.65rem', fontWeight: 'bold',
                    backgroundColor: 'var(--primary)', borderRadius: '50%', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px'
                  }}>
                    {user ? dbNotifications.filter(n => n.is_read === 0).length : liveAlerts.length}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="glass-card" style={{
                  position: 'absolute', top: 48, right: 0,
                  width: 340, padding: 16, zIndex: 200
                }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{user ? '🔔 Notifications' : '⚡ Real-Time Live Feed'}</span>
                    <span className="badge badge-danger">{user ? dbNotifications.length : liveAlerts.length} Alerts</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.82rem', maxHeight: 300, overflowY: 'auto' }}>
                    {user ? (
                      dbNotifications.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>No notifications yet.</p>
                      ) : dbNotifications.map((notif) => (
                        <div key={notif.id} style={{
                          padding: 10,
                          background: notif.type === 'MESSAGE' ? 'var(--primary-light)' : 'var(--bg-main)',
                          borderRadius: 8,
                          borderLeft: `3px solid ${notif.type === 'MESSAGE' ? 'var(--primary)' : 'var(--accent)'}`,
                          opacity: notif.is_read ? 0.7 : 1
                        }}>
                          <div style={{ fontWeight: 700 }}>{notif.title}</div>
                          <div style={{ color: 'var(--text-main)', fontSize: '0.78rem', marginTop: 4 }}>{notif.message}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6, textAlign: 'right' }}>
                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    ) : (
                      liveAlerts.length === 0 ? (
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
                      ))
                    )}
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

      {/* ── Animated Organ Donation Slogan Ribbon ─────────────────────── */}
      <div style={{
        margin: '10px 24px 0 24px',
        borderRadius: 12,
        background: 'linear-gradient(90deg, rgba(229,57,53,0.12) 0%, rgba(2,132,199,0.12) 50%, rgba(16,185,129,0.12) 100%)',
        border: '1px solid rgba(229,57,53,0.22)',
        padding: '7px 16px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 2px 10px rgba(229,57,53,0.06)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontWeight: 800,
          fontSize: '0.75rem',
          color: '#E53935',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          flexShrink: 0,
          marginRight: 16,
          background: 'var(--bg-card)',
          padding: '3px 10px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
        }}>
          <span>❤️ MOTTO:</span>
        </div>

        <div className="slogan-marquee-track" style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          gap: 48,
          animation: 'sloganMarquee 28s linear infinite'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
            🫀 "Donate Organs, Save Lives — Be the Reason Someone Gets a Second Chance at Life!"
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
            🩸 "One Blood Donation Saves 3 Lives • One Organ Donor Saves Up to 8 Lives!"
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
            🌟 "Leave a Legacy of Love — Pledge Your Organs Today and Live On Forever!"
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)' }}>
            💖 "The Greatest Gift You Can Give in This World is the Gift of Life!"
          </span>
          {/* Duplicate copy for continuous looping */}
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
            🫀 "Donate Organs, Save Lives — Be the Reason Someone Gets a Second Chance at Life!"
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
            🩸 "One Blood Donation Saves 3 Lives • One Organ Donor Saves Up to 8 Lives!"
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
            🌟 "Leave a Legacy of Love — Pledge Your Organs Today and Live On Forever!"
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--secondary)' }}>
            💖 "The Greatest Gift You Can Give in This World is the Gift of Life!"
          </span>
        </div>
      </div>

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
