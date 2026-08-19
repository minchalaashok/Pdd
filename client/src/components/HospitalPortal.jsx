import React, { useState, useEffect } from 'react';
import { Building2, Droplet, Heart, Users, Activity, CheckCircle, Clock, AlertTriangle, Plus, Search, ShieldCheck, RefreshCw } from 'lucide-react';
import { fetchApi } from '../services/api';
import { useRealtime } from '../context/RealtimeContext';
import { useAuth } from '../context/AuthContext';

export const HospitalPortal = () => {
  const { user } = useAuth();
  const { refreshVersion } = useRealtime();
  const [activeTab, setActiveTab] = useState('donors');

  if (user?.hospital?.is_approved !== 1) {
    const statusMap = {
      0: { title: 'Verification Pending', icon: <Clock size={48} color="#FB8C00" />, desc: 'Your hospital registration request has been received. Our higher authority/admin is currently verifying your license and credentials.', badge: 'PENDING' },
      2: { title: 'Registration Rejected', icon: <AlertTriangle size={48} color="#E53935" />, desc: 'We regret to inform you that your registration request was rejected. Please verify your details or contact admin support.', badge: 'REJECTED' },
      3: { title: 'Credentials Under Review', icon: <RefreshCw size={48} color="#1976D2" />, desc: 'Your documents are actively being reviewed. This process normally takes up to 24-48 business hours.', badge: 'UNDER REVIEW' },
      4: { title: 'Account Suspended', icon: <AlertTriangle size={48} color="#E53935" />, desc: 'Your account access has been suspended due to policy violations. Please contact the administrator.', badge: 'SUSPENDED' }
    };

    const currentStatus = statusMap[user?.hospital?.is_approved] || statusMap[0];

    return (
      <div style={{ maxWidth: 600, margin: '80px auto', padding: '40px 24px', textAlign: 'center' }} className="glass-card">
        <div style={{ display: 'inline-flex', padding: 20, borderRadius: '50%', background: 'var(--bg-main)', marginBottom: 20 }}>
          {currentStatus.icon}
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>{currentStatus.title}</h2>
        <span className="badge badge-warning" style={{ display: 'inline-block', marginBottom: 20, fontSize: '0.8rem', padding: '6px 12px' }}>
          STATUS: {currentStatus.badge}
        </span>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: 24 }}>
          {currentStatus.desc}
        </p>
        <div style={{ padding: '16px', background: 'rgba(229,57,53,0.05)', borderRadius: 10, border: '1px dashed rgba(229,57,53,0.2)', fontSize: '0.85rem', color: 'var(--text-main)' }}>
          🔒 <strong>Security Restriction:</strong> Your hospital account is not currently authorized to access donor information, search donor directory, or create active transplantation requests.
        </div>
      </div>
    );
  }
  
  // Donors directory state
  const [donorsList, setDonorsList] = useState([]);
  const [searchBg, setSearchBg] = useState('ALL');
  const [searchOrgan, setSearchOrgan] = useState('ALL');
  const [searchCity, setSearchCity] = useState('ALL');
  const [searchLoading, setSearchLoading] = useState(false);

  // Chat state
  const [activeChatDonor, setActiveChatDonor] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');

  useEffect(() => {
    if (!activeChatDonor) return;
    const fetchChat = async () => {
      const res = await fetchApi(`/chat/${activeChatDonor.user_id}`);
      if (res.success) {
        setChatMessages(res.messages || []);
      }
    };
    fetchChat();
    const interval = setInterval(fetchChat, 3000);
    return () => clearInterval(interval);
  }, [activeChatDonor]);

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!newChatMessage.trim() || !activeChatDonor) return;
    const res = await fetchApi('/chat', {
      method: 'POST',
      body: JSON.stringify({
        receiver_id: activeChatDonor.user_id,
        message: newChatMessage
      })
    });
    if (res.success) {
      setNewChatMessage('');
      const chatRes = await fetchApi(`/chat/${activeChatDonor.user_id}`);
      if (chatRes.success) {
        setChatMessages(chatRes.messages || []);
      }
    }
  };

  // Inventory state
  const [bloodStock, setBloodStock] = useState([]);
  const [organStock, setOrganStock] = useState([]);
  const [updateBg, setUpdateBg] = useState('O+');
  const [updateUnits, setUpdateUnits] = useState(20);
  const [stockMsg, setStockMsg] = useState('');

  // Patients state
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({
    full_name: '',
    email: '',
    phone: '',
    blood_group_needed: 'A+',
    organ_needed: 'Kidney',
    urgency_level: 'HIGH',
    city: 'Mumbai',
    age: 32,
    gender: 'Male'
  });
  const [regMsg, setRegMsg] = useState('');

  // AI Donor match state
  const [matchedDonors, setMatchedDonors] = useState([]);
  const [selectedOrganMatch, setSelectedOrganMatch] = useState('Kidney');
  const [selectedBgMatch, setSelectedBgMatch] = useState('A+');
  const [matchingLoading, setMatchingLoading] = useState(false);

  // Surgery Status state
  const [requests, setRequests] = useState([]);

  const loadData = async () => {
    // Load blood stock
    const bloodRes = await fetchApi('/inventory/blood?city=ALL');
    if (bloodRes.success) setBloodStock(bloodRes.inventory || []);

    // Load organ stock
    const organRes = await fetchApi('/inventory/organs?city=ALL');
    if (organRes.success) setOrganStock(organRes.inventory || []);

    // Load hospital patients
    const pRes = await fetchApi('/hospital/patients');
    if (pRes.success) setPatients(pRes.patients || []);

    // Load requests for surgery tracking
    const rRes = await fetchApi('/requests');
    if (rRes.success) setRequests(rRes.requests || []);

    // Load donors list
    loadDonors();
  };

  const loadDonors = async () => {
    setSearchLoading(true);
    const res = await fetchApi(`/donors/search?blood_group=${searchBg}&organ=${searchOrgan}&city=${searchCity}`);
    if (res.success) {
      setDonorsList(res.donors || []);
    }
    setSearchLoading(false);
  };

  useEffect(() => {
    loadData();
    // Fallback polling: refresh live data every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [refreshVersion]);

  useEffect(() => {
    loadDonors();
  }, [searchBg, searchOrgan, searchCity]);

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    const res = await fetchApi('/hospital/stock', {
      method: 'POST',
      body: JSON.stringify({ hospital_id: user?.hospital?.id || 1, blood_group: updateBg, units_available: Number(updateUnits) })
    });
    if (res.success) {
      setStockMsg(`Updated ${updateBg} stock to ${updateUnits} units successfully.`);
      loadData();
      setTimeout(() => setStockMsg(''), 4000);
    }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    const res = await fetchApi('/hospital/patients', {
      method: 'POST',
      body: JSON.stringify(newPatient)
    });
    if (res.success) {
      setRegMsg('Patient successfully registered on hospital waiting list!');
      setNewPatient({
        full_name: '',
        email: '',
        phone: '',
        blood_group_needed: 'A+',
        organ_needed: 'Kidney',
        urgency_level: 'HIGH',
        city: 'Mumbai',
        age: 32,
        gender: 'Male'
      });
      loadData();
      setTimeout(() => setRegMsg(''), 4000);
    }
  };

  const handleRunAiMatching = async () => {
    setMatchingLoading(true);
    const res = await fetchApi(`/ai/match-donors?blood_group=${selectedBgMatch}&organ=${selectedOrganMatch}&city=Mumbai&urgency=HIGH`);
    if (res.success) {
      setMatchedDonors(res.donors || []);
    }
    setMatchingLoading(false);
  };

  const handleUpdateSurgery = async (requestId, surgery_status) => {
    await fetchApi('/hospital/surgery-status', {
      method: 'PUT',
      body: JSON.stringify({ requestId, surgery_status })
    });
    loadData();
  };

  const handleUpdatePatientStatus = async (patientId, newStatus) => {
    await fetchApi(`/hospital/patients/${patientId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    });
    loadData();
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Building2 size={28} color="var(--primary)" />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {user?.hospital?.hospital_name || user?.full_name || 'Hospital'} Portal
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Verified Hospital License: {user?.hospital?.license_number || 'Pending'} • Ward 4 Emergency Transplants
          </p>
        </div>

        <button className="btn-secondary" onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={16} /> Sync Live Data
        </button>
      </div>

      {/* Portal Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
        <button
          className={activeTab === 'donors' ? 'btn-primary' : 'btn-outline'}
          onClick={() => setActiveTab('donors')}
        >
          🔍 Search & Match Donors
        </button>
        <button
          className={activeTab === 'inventory' ? 'btn-primary' : 'btn-outline'}
          onClick={() => setActiveTab('inventory')}
        >
          🩸 Blood & Organ Inventory
        </button>
        <button
          className={activeTab === 'patients' ? 'btn-primary' : 'btn-outline'}
          onClick={() => setActiveTab('patients')}
        >
          📋 Patient Waiting List ({patients.length})
        </button>

        <button
          className={activeTab === 'surgeries' ? 'btn-primary' : 'btn-outline'}
          onClick={() => setActiveTab('surgeries')}
        >
          🩺 Surgery & Transplant Tracker
        </button>
      </div>

      {/* TAB 1: Inventory Management */}
      {activeTab === 'inventory' && (
        <div>
          {/* Quick Stock Updater */}
          <div className="glass-card" style={{ padding: 24, marginBottom: 32 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={18} color="var(--primary)" /> Replenish Hospital Blood Inventory Stock
            </h3>

            {stockMsg && (
              <div className="badge badge-success" style={{ padding: '10px 14px', marginBottom: 16, display: 'block' }}>
                ✅ {stockMsg}
              </div>
            )}

            <form onSubmit={handleUpdateStock} style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Blood Group</label>
                <select className="form-input" style={{ width: 140 }} value={updateBg} onChange={e => setUpdateBg(e.target.value)}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Available Units</label>
                <input
                  type="number"
                  className="form-input"
                  style={{ width: 140 }}
                  value={updateUnits}
                  onChange={e => setUpdateUnits(e.target.value)}
                  min="0"
                  max="500"
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: 22 }}>
                Update Blood Stock
              </button>
            </form>
          </div>

          {/* Current Blood Stock Grid */}
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Live Blood Stock Availability</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
            {bloodStock.slice(0, 8).map((item, idx) => (
              <div key={idx} className="glass-card" style={{ padding: 18, textAlign: 'center', borderLeft: '4px solid var(--secondary)' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--secondary)' }}>{item.blood_group}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '6px 0' }}>{item.units_available} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>units</span></div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.hospital_name || 'Apex Care'}</div>
              </div>
            ))}
          </div>

          {/* Organ Availability Grid */}
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Organ Registry & Reserves</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {organStock.slice(0, 6).map((item, idx) => (
              <div key={idx} className="glass-card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{item.organ_type}</span>
                  <span className="badge badge-success">{item.availability_status}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Waiting List: <strong>{item.waiting_list_count} Patients</strong></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Patient Registration & Waiting List */}
      {activeTab === 'patients' && (
        <div>
          <div className="glass-card" style={{ padding: 24, marginBottom: 32 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Add Patient to Hospital Transplant/Blood Waiting Queue</h3>
            
            {regMsg && (
              <div className="badge badge-success" style={{ padding: '10px 14px', marginBottom: 16, display: 'block' }}>
                ✅ {regMsg}
              </div>
            )}

            <form onSubmit={handleRegisterPatient} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Patient Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={newPatient.full_name}
                  onChange={e => setNewPatient({ ...newPatient, full_name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={newPatient.email}
                  onChange={e => setNewPatient({ ...newPatient, email: e.target.value })}
                  placeholder="patient@email.com"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Contact Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={newPatient.phone}
                  onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })}
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Blood Group Needed</label>
                <select className="form-input" value={newPatient.blood_group_needed} onChange={e => setNewPatient({ ...newPatient, blood_group_needed: e.target.value })}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Organ Requirement</label>
                <select className="form-input" value={newPatient.organ_needed} onChange={e => setNewPatient({ ...newPatient, organ_needed: e.target.value })}>
                  {['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Eyes', 'Bone Marrow', 'Skin'].map(org => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Urgency Priority</label>
                <select className="form-input" value={newPatient.urgency_level} onChange={e => setNewPatient({ ...newPatient, urgency_level: e.target.value })}>
                  <option value="CRITICAL">🚨 CRITICAL (Emergency)</option>
                  <option value="HIGH">⚠️ HIGH</option>
                  <option value="MEDIUM">🟡 MEDIUM</option>
                  <option value="LOW">🟢 ROUTINE</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>
                  Register Patient on Waiting Queue
                </button>
              </div>
            </form>
          </div>

          {/* Patients Queue Table */}
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Current Hospital Patient Queue</h3>
          <div className="glass-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.02)' }}>
                  <th style={{ padding: 12 }}>Patient Name</th>
                  <th style={{ padding: 12 }}>Blood Group</th>
                  <th style={{ padding: 12 }}>Organ Needed</th>
                  <th style={{ padding: 12 }}>Urgency</th>
                  <th style={{ padding: 12 }}>City</th>
                  <th style={{ padding: 12 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 12, fontWeight: 600 }}>{p.full_name}</td>
                    <td style={{ padding: 12 }}><span className="badge badge-danger">{p.blood_group_needed}</span></td>
                    <td style={{ padding: 12 }}>{p.organ_needed}</td>
                    <td style={{ padding: 12 }}>
                      <span className={`badge ${p.urgency_level === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}`}>
                        {p.urgency_level}
                      </span>
                    </td>
                    <td style={{ padding: 12 }}>{p.city}</td>
                    <td style={{ padding: 12 }}>
                      <select
                        className="form-input"
                        style={{ padding: '4px 8px', fontSize: '0.82rem', width: '130px', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '6px' }}
                        value={p.status}
                        onChange={(e) => handleUpdatePatientStatus(p.id, e.target.value)}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Donors Directory */}
      {activeTab === 'donors' && (
        <div>
          {/* Search Filters Row */}
          <div className="glass-card" style={{ padding: 24, marginBottom: 32 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Search Registered Donors Directory</h3>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Blood Group</label>
                <select className="form-input" style={{ width: 140 }} value={searchBg} onChange={e => setSearchBg(e.target.value)}>
                  <option value="ALL">All Groups</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Organ Available</label>
                <select className="form-input" style={{ width: 160 }} value={searchOrgan} onChange={e => setSearchOrgan(e.target.value)}>
                  <option value="ALL">All Organs</option>
                  {['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Eyes', 'Bone Marrow', 'Skin'].map(org => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Location (City)</label>
                <select className="form-input" style={{ width: 160 }} value={searchCity} onChange={e => setSearchCity(e.target.value)}>
                  <option value="ALL">All Cities</option>
                  {['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune', 'Chennai'].map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <button className="btn-primary" style={{ marginTop: 22 }} onClick={loadDonors} disabled={searchLoading}>
                {searchLoading ? 'Searching...' : '🔍 Refresh Directory'}
              </button>

            </div>
          </div>

          {/* Donors List Grid */}
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Available Donors Match List</h3>
          {donorsList.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No registered donors found matching these filter criteria.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {donorsList.map(donor => (
                <div key={donor.id} className="glass-card" style={{ padding: 20, borderLeft: '4px solid var(--secondary)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <h4 style={{ fontWeight: 800, fontSize: '1.15rem' }}>{donor.full_name}</h4>
                    <span className={`badge ${donor.availability_status === 'AVAILABLE' ? 'badge-success' : 'badge-warning'}`}>
                      {donor.availability_status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    <span className="badge badge-danger">Blood Group: {donor.blood_group}</span>
                    <span className="badge badge-info">Organ: {donor.organs_registered || 'Kidney'}</span>
                  </div>

                  <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div>📍 Location: <strong>{donor.city}, {donor.state || 'Maharashtra'}</strong></div>
                    <div>📞 Phone: <strong>{donor.phone || 'N/A'}</strong></div>
                    <div>✉️ Email: <strong>{donor.email}</strong></div>
                  </div>

                  <button className="btn-primary" style={{ width: '100%', fontSize: '0.88rem' }} onClick={() => setActiveChatDonor(donor)}>
                    Initiate Contact / Chat
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}



      {/* TAB 4: Surgery & Transplant Tracker */}
      {activeTab === 'surgeries' && (
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Active Surgery & Transplant Case Timeline</h3>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {requests.slice(0, 10).map(req => (
                <div key={req.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 18, background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
                    <div>
                      <h4 style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                        Case #{req.id}: {req.request_type} - {req.item_requested}
                      </h4>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Patient: <strong>{req.receiver_name}</strong> ({req.receiver_city}) • Hospital: <strong>{req.hospital_name || 'Apex Care Hospital'}</strong>
                      </div>
                    </div>

                    <span className={`badge ${req.status === 'FULFILLED' ? 'badge-success' : 'badge-warning'}`}>
                      STATUS: {req.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>Notes: {req.notes || 'Routine pre-op preparation in progress.'}</p>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="btn-outline" style={{ fontSize: '0.82rem' }} onClick={() => handleUpdateSurgery(req.id, 'SCHEDULED')}>
                      📅 Mark Scheduled
                    </button>
                    <button className="btn-outline" style={{ fontSize: '0.82rem', borderColor: 'var(--warning)', color: 'var(--warning)' }} onClick={() => handleUpdateSurgery(req.id, 'IN_PROGRESS')}>
                      ⚡ In-Progress
                    </button>
                    <button className="btn-primary" style={{ fontSize: '0.82rem' }} onClick={() => handleUpdateSurgery(req.id, 'FULFILLED')}>
                      ✅ Transplant Completed
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Modal */}
      {activeChatDonor && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, width: 380, height: 480,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
          display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px', background: 'var(--primary)', color: 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 800 }}>Chat with {activeChatDonor.full_name}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Blood Group: {activeChatDonor.blood_group}</div>
            </div>
            <button
              onClick={() => setActiveChatDonor(null)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 800 }}
            >
              ✕
            </button>
          </div>

          {/* Messages area */}
          <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(0,0,0,0.02)' }}>
            {chatMessages.length === 0 ? (
              <div style={{ margin: 'auto', color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center' }}>
                Say hello to start the donation conversation!
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isMe = msg.sender_id === user.id;
                return (
                  <div key={msg.id} style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '75%',
                    background: isMe ? 'var(--primary)' : 'var(--bg-main)',
                    color: isMe ? 'white' : 'var(--text-main)',
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    fontSize: '0.88rem'
                  }}>
                    <div>{msg.message}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: 4, textAlign: 'right' }}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input form */}
          <form onSubmit={handleSendChatMessage} style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, background: 'var(--bg-card)' }}>
            <input
              type="text"
              className="form-input"
              value={newChatMessage}
              onChange={(e) => setNewChatMessage(e.target.value)}
              placeholder="Type your message here..."
              style={{ flex: 1, borderRadius: 20, padding: '8px 16px' }}
              required
            />
            <button type="submit" className="btn-primary" style={{ padding: '8px 16px', borderRadius: 20 }}>
              Send
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
