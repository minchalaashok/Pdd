import React, { useState, useEffect } from 'react';
import { Building2, Droplet, Heart, Users, Activity, CheckCircle, Clock, AlertTriangle, Plus, Search, ShieldCheck, RefreshCw } from 'lucide-react';
import { fetchApi } from '../services/api';
import { useRealtime } from '../context/RealtimeContext';

export const HospitalPortal = () => {
  const { refreshVersion } = useRealtime();
  const [activeTab, setActiveTab] = useState('inventory');
  
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
  };

  useEffect(() => {
    loadData();
  }, [refreshVersion]);

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    const res = await fetchApi('/hospital/stock', {
      method: 'POST',
      body: JSON.stringify({ hospital_id: 1, blood_group: updateBg, units_available: Number(updateUnits) })
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

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Building2 size={28} color="var(--primary)" />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Apex Multi-Specialty Hospital Portal</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Verified Hospital License: LIC-MED-2026-1001 • Ward 4 Emergency Transplants</p>
        </div>

        <button className="btn-secondary" onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={16} /> Sync Live Data
        </button>
      </div>

      {/* Portal Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
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
          className={activeTab === 'aimatch' ? 'btn-primary' : 'btn-outline'}
          onClick={() => { setActiveTab('aimatch'); handleRunAiMatching(); }}
        >
          🧠 AI Donor Matching Engine
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
                    <td style={{ padding: 12 }}><span className="badge badge-success">{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AI Donor Matching Engine */}
      {activeTab === 'aimatch' && (
        <div>
          <div className="glass-card" style={{ padding: 24, marginBottom: 32 }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              🧠 LifeLink AI-Powered Organ & Blood Matching Algorithm
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
              Calculates donor-recipient compatibility score based on blood group matrix (ABO/Rh), organ tissue compatibility, location proximity, and donor health score.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Blood Group Needed</label>
                <select className="form-input" style={{ width: 140 }} value={selectedBgMatch} onChange={e => setSelectedBgMatch(e.target.value)}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Organ Required</label>
                <select className="form-input" style={{ width: 160 }} value={selectedOrganMatch} onChange={e => setSelectedOrganMatch(e.target.value)}>
                  {['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Eyes', 'Bone Marrow', 'Skin'].map(org => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
              </div>

              <button className="btn-primary" style={{ marginTop: 20 }} onClick={handleRunAiMatching} disabled={matchingLoading}>
                {matchingLoading ? 'Analyzing AI Compatibility...' : 'Run AI Donor Match Search'}
              </button>
            </div>
          </div>

          {/* AI Matched Donor Results */}
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>AI Compatibility Recommendations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {matchedDonors.map((donor, idx) => (
              <div key={idx} className="glass-card" style={{ padding: 20, position: 'relative', borderTop: `4px solid ${donor.matchScore > 80 ? '#10B981' : '#F59E0B'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{donor.full_name}</h4>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>📍 {donor.city} • {donor.estimatedDistanceKm} km away</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: donor.matchScore > 80 ? '#10B981' : '#F59E0B' }}>
                      {donor.matchScore}%
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>MATCH SCORE</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                  <span className="badge badge-danger">Blood: {donor.blood_group}</span>
                  <span className="badge badge-info">Organs: {donor.organs_registered || 'Kidney'}</span>
                  <span className="badge badge-success">{donor.compatibilityTier} MATCH</span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  Contact: <strong>{donor.phone}</strong> • Total Donations: <strong>{donor.total_donations}</strong>
                </div>

                <button className="btn-primary" style={{ width: '100%', fontSize: '0.88rem' }} onClick={() => alert(`Transplant Request & Donor Match Notification sent to ${donor.full_name}!`)}>
                  Initiate Transplant Contact
                </button>
              </div>
            ))}
          </div>
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

    </div>
  );
};
