import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  LayoutDashboard, Users, HeartHandshake, UserPlus, Building2, Droplet, Activity,
  AlertCircle, Flag, Bell, FileSpreadsheet, LineChart, Shield, Settings, Check, X, Ban, Download
} from 'lucide-react';
import { fetchApi } from '../services/api';

import { useRealtime } from '../context/RealtimeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const AdminDashboard = () => {
  const { refreshVersion, isConnected, liveStats } = useRealtime();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [hospitalsList, setHospitalsList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Display stats = admin analytics (if logged in) OR public liveStats
  const displayStats = stats || liveStats;

  // Load analytics & table data
  const loadDashboardData = async () => {
    setLoading(true);
    // Try protected admin endpoint first
    const analyticsRes = await fetchApi('/admin/analytics');
    if (analyticsRes.success) {
      setStats(analyticsRes.stats);
      setCharts(analyticsRes.charts);
    } else {
      // Fall back to public stats (no auth needed)
      const pubRes = await fetchApi('/stats');
      if (pubRes.success) setStats(pubRes.stats);
    }

    const usersRes = await fetchApi('/admin/users');
    if (usersRes.success) setUsersList(usersRes.users || []);

    const hospitalsRes = await fetchApi('/admin/hospitals');
    if (hospitalsRes.success) setHospitalsList(hospitalsRes.hospitals || []);

    const requestsRes = await fetchApi('/requests');
    if (requestsRes.success) setRequestsList(requestsRes.requests || []);

    const auditRes = await fetchApi('/admin/audit-logs');
    if (auditRes.success) setAuditLogs(auditRes.logs || []);

    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, [refreshVersion]);

  const handleToggleUserStatus = async (id) => {
    await fetchApi(`/admin/users/${id}/suspend`, { method: 'PUT' });
    loadDashboardData();
  };

  const handleHospitalApproval = async (id, status) => {
    await fetchApi(`/admin/hospitals/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_approved: status })
    });
    loadDashboardData();
  };

  const handleExportCSV = async (reportType) => {
    const res = await fetchApi(`/reports/${reportType}`);
    if (res.success && res.data) {
      const keys = Object.keys(res.data[0] || {});
      const csvLines = [
        keys.join(','),
        ...res.data.map(row => keys.map(k => `"${row[k] || ''}"`).join(','))
      ];
      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LifeLink_${reportType}_Report.csv`;
      a.click();
    }
  };

  // Chart Setup Data
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'Blood Donations',
        data: [120, 145, 180, 160, 210, 240, 280, 310],
        borderColor: '#E53935',
        backgroundColor: 'rgba(229, 57, 53, 0.15)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Organ Records',
        data: [20, 25, 30, 28, 35, 42, 50, 60],
        borderColor: '#1976D2',
        backgroundColor: 'rgba(25, 118, 210, 0.15)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const pieChartData = {
    labels: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    datasets: [
      {
        data: [28, 8, 32, 6, 12, 4, 38, 10],
        backgroundColor: ['#E53935', '#D32F2F', '#1976D2', '#1565C0', '#43A047', '#388E3C', '#FB8C00', '#F57C00']
      }
    ]
  };

  const barChartData = {
    labels: ['Apex Care', 'City Life', 'St. Jude', 'Global Health', 'Metropolitan', 'Sunrise'],
    datasets: [
      {
        label: 'Donations Processed',
        data: [142, 118, 95, 88, 76, 64],
        backgroundColor: '#43A047',
        borderRadius: 8
      }
    ]
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Users', icon: Users },
    { name: 'Donors', icon: HeartHandshake },
    { name: 'Receivers', icon: UserPlus },
    { name: 'Hospitals', icon: Building2 },
    { name: 'Blood Inventory', icon: Droplet },
    { name: 'Organ Inventory', icon: Activity },
    { name: 'Emergency Requests', icon: AlertCircle },
    { name: 'Campaigns', icon: Flag },
    { name: 'Reports Exporter', icon: FileSpreadsheet },
    { name: 'Audit Logs', icon: Shield },
    { name: 'Settings', icon: Settings }
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 100px)', padding: 24, gap: 24 }}>
      
      {/* Sidebar */}
      <aside className="glass-card" style={{ width: 260, padding: 16, display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        <div style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px' }}>
          ADMIN PORTAL
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              className={`btn-outline ${isActive ? 'active-nav' : ''}`}
              style={{
                justifyContent: 'flex-start',
                padding: '10px 14px',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                borderColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-main)',
                fontWeight: isActive ? 700 : 500
              }}
              onClick={() => setActiveTab(item.name)}
            >
              <Icon size={18} /> {item.name}
            </button>
          );
        })}
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{activeTab} Management</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Real-time medical platform telemetry and system administration</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn-outline"
              style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
              onClick={async () => {
                if (window.confirm('Clear all demo data and start with 0 fake users (clean production slate)?')) {
                  await fetchApi('/admin/reset-db?mode=clean', { method: 'POST' });
                  loadDashboardData();
                }
              }}
            >
              🧹 Reset DB (0 Fake Users)
            </button>

            <button
              className="btn-outline"
              onClick={async () => {
                await fetchApi('/admin/reset-db?mode=demo', { method: 'POST' });
                loadDashboardData();
              }}
            >
              🌱 Load Demo Dataset
            </button>

            <button className="btn-primary" onClick={() => handleExportCSV('donations')}>
              <Download size={16} /> Export Reports CSV
            </button>
          </div>
        </div>

        {/* Analytics Section */}
        {activeTab === 'Dashboard' && displayStats && (
          <>
            {/* Stat Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
              {[
                { label: 'TOTAL USERS',       val: displayStats.totalUsers,          sub: `${displayStats.totalDonors || 0} Donors · ${displayStats.totalReceivers || 0} Receivers`, color: 'var(--text-main)', badge: 'badge-success' },
                { label: 'BLOOD DONATIONS',   val: displayStats.totalBloodDonations,  sub: `${(displayStats.totalBloodUnits || 0).toLocaleString()} Units Collected`,  color: 'var(--primary)',   badge: 'badge-danger' },
                { label: 'ORGAN RECORDS',     val: displayStats.totalOrganDonations,  sub: `${displayStats.availableOrgans || 0} Available Now`,                        color: 'var(--secondary)', badge: 'badge-info' },
                { label: 'ACTIVE HOSPITALS',  val: displayStats.totalHospitals,       sub: `${displayStats.pendingRequests || 0} Pending Requests`,                     color: 'var(--accent)',    badge: 'badge-warning' },
                { label: 'BLOOD UNITS AVAIL', val: displayStats.availableBloodUnits,  sub: 'Across all partner hospitals',                                              color: '#E53935',          badge: 'badge-danger' },
                { label: 'COMPLETED REQUESTS',val: displayStats.completedRequests,    sub: `${displayStats.rejectedRequests || 0} Rejected`,                            color: 'var(--accent)',    badge: 'badge-success' },
              ].map(card => (
                <div key={card.label} className="glass-card" style={{ padding: 20 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 6 }}>{card.label}</div>
                  <div style={{ fontSize: '1.9rem', fontWeight: 800, color: card.color, margin: '4px 0', fontVariantNumeric: 'tabular-nums' }}>
                    {(card.val || 0).toLocaleString()}
                  </div>
                  <span className={`badge ${card.badge}`} style={{ fontSize: '0.72rem' }}>{card.sub}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Users Management */}
        {activeTab === 'Users' && (
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Registered Users Roster</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: 12 }}>Name</th>
                  <th style={{ padding: 12 }}>Email</th>
                  <th style={{ padding: 12 }}>Role</th>
                  <th style={{ padding: 12 }}>City</th>
                  <th style={{ padding: 12 }}>Status</th>
                  <th style={{ padding: 12 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersList.slice(0, 15).map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 12, fontWeight: 600 }}>{u.full_name}</td>
                    <td style={{ padding: 12, color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: 12 }}><span className="badge badge-info">{u.role.toUpperCase()}</span></td>
                    <td style={{ padding: 12 }}>{u.city}</td>
                    <td style={{ padding: 12 }}>
                      <span className={`badge ${u.is_suspended ? 'badge-danger' : 'badge-success'}`}>
                        {u.is_suspended ? 'SUSPENDED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: 12 }}>
                      <button
                        className="btn-outline"
                        style={{ padding: '4px 10px', fontSize: '0.75rem', color: u.is_suspended ? 'var(--accent)' : 'var(--primary)' }}
                        onClick={() => handleToggleUserStatus(u.id)}
                      >
                        {u.is_suspended ? 'Activate' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Donors Management */}
        {activeTab === 'Donors' && (
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Registered Donors List</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: 12 }}>Name</th>
                  <th style={{ padding: 12 }}>Email</th>
                  <th style={{ padding: 12 }}>Phone</th>
                  <th style={{ padding: 12 }}>City</th>
                  <th style={{ padding: 12 }}>Status</th>
                  <th style={{ padding: 12 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersList.filter(u => u.role === 'donor').map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 12, fontWeight: 600 }}>{u.full_name}</td>
                    <td style={{ padding: 12, color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: 12 }}>{u.phone}</td>
                    <td style={{ padding: 12 }}>{u.city}</td>
                    <td style={{ padding: 12 }}>
                      <span className={`badge ${u.is_suspended ? 'badge-danger' : 'badge-success'}`}>
                        {u.is_suspended ? 'SUSPENDED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: 12 }}>
                      <button
                        className="btn-outline"
                        style={{ padding: '4px 10px', fontSize: '0.75rem', color: u.is_suspended ? 'var(--accent)' : 'var(--primary)' }}
                        onClick={() => handleToggleUserStatus(u.id)}
                      >
                        {u.is_suspended ? 'Activate' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Receivers Management */}
        {activeTab === 'Receivers' && (
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Registered Receivers List</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: 12 }}>Name</th>
                  <th style={{ padding: 12 }}>Email</th>
                  <th style={{ padding: 12 }}>Phone</th>
                  <th style={{ padding: 12 }}>City</th>
                  <th style={{ padding: 12 }}>Status</th>
                  <th style={{ padding: 12 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersList.filter(u => u.role === 'receiver').map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 12, fontWeight: 600 }}>{u.full_name}</td>
                    <td style={{ padding: 12, color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: 12 }}>{u.phone}</td>
                    <td style={{ padding: 12 }}>{u.city}</td>
                    <td style={{ padding: 12 }}>
                      <span className={`badge ${u.is_suspended ? 'badge-danger' : 'badge-success'}`}>
                        {u.is_suspended ? 'SUSPENDED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: 12 }}>
                      <button
                        className="btn-outline"
                        style={{ padding: '4px 10px', fontSize: '0.75rem', color: u.is_suspended ? 'var(--accent)' : 'var(--primary)' }}
                        onClick={() => handleToggleUserStatus(u.id)}
                      >
                        {u.is_suspended ? 'Activate' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Hospital Approval Workflow */}
        {activeTab === 'Hospitals' && (
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Hospital Registration & Verification Workflow</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: 12 }}>Hospital Name</th>
                  <th style={{ padding: 12 }}>License Number</th>
                  <th style={{ padding: 12 }}>City</th>
                  <th style={{ padding: 12 }}>Phone</th>
                  <th style={{ padding: 12 }}>Approval Status</th>
                  <th style={{ padding: 12 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hospitalsList.slice(0, 15).map(h => (
                  <tr key={h.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 12, fontWeight: 600 }}>{h.hospital_name}</td>
                    <td style={{ padding: 12 }}>{h.license_number}</td>
                    <td style={{ padding: 12 }}>{h.city}</td>
                    <td style={{ padding: 12 }}>{h.phone}</td>
                    <td style={{ padding: 12 }}>
                      <span className={`badge ${h.is_approved === 1 ? 'badge-success' : h.is_approved === 2 ? 'badge-danger' : 'badge-warning'}`}>
                        {h.is_approved === 1 ? 'APPROVED' : h.is_approved === 2 ? 'REJECTED' : 'PENDING'}
                      </span>
                    </td>
                    <td style={{ padding: 12, display: 'flex', gap: 8 }}>
                      {h.is_approved !== 1 && (
                        <button className="btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--accent)' }} onClick={() => handleHospitalApproval(h.id, 1)}>
                          <Check size={14} /> Approve
                        </button>
                      )}
                      {h.is_approved !== 2 && (
                        <button className="btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--primary)' }} onClick={() => handleHospitalApproval(h.id, 2)}>
                          <X size={14} /> Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Audit Logs */}
        {activeTab === 'Audit Logs' && (
          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>System Audit Logs & Security Telemetry</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {auditLogs.map(log => (
                <div key={log.id} style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-main)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: 4 }}>
                    <span>{log.action}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{log.timestamp}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>Target: {log.target} • {log.details}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Exporter Tab */}
        {activeTab === 'Reports Exporter' && (
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Download System Analytics Reports</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {[
                { title: 'Donation Transactions', type: 'donations', desc: 'Complete history of blood and organ donations' },
                { title: 'Registered Users', type: 'users', desc: 'Roster of all donors, receivers, and admins' },
                { title: 'Hospital Performance', type: 'hospitals', desc: 'Partner hospital approvals and metrics' },
                { title: 'Blood Inventory', type: 'blood', desc: 'Regional blood stock and expiry details' }
              ].map(rep => (
                <div key={rep.type} style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg-main)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>{rep.title}</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>{rep.desc}</p>
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleExportCSV(rep.type)}>
                    <Download size={16} /> Download CSV Report
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
