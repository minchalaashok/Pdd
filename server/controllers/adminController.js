const { query, getOne, run, supabase } = require('../config/db');
const bcrypt = require('bcryptjs');

// Get Dashboard Analytics & Statistics (Protected - Admin Only)
const getDashboardStats = async (req, res) => {
  try {
    const stats = await fetchLiveStats();
    const charts = await fetchChartData();
    res.json({ success: true, stats, charts });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve analytics' });
  }
};

// PUBLIC Stats — no auth needed, used by RealtimeContext & landing page counters
const getPublicStats = async (req, res) => {
  try {
    const stats = await fetchLiveStats();
    res.json({ success: true, stats, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Public stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve stats' });
  }
};

// Shared helper — fetches actual counts from DB using Supabase native count API
// (avoids the broken execRaw → supabase.rpc('exec_sql') path which requires a
//  custom PostgreSQL function that was never created in the Supabase project)
const fetchLiveStats = async () => {
  try {
    const [
      { count: totalUsers },
      { count: totalDonors },
      { count: totalReceivers },
      { count: totalHospitals },
      { count: totalBloodDonations, data: bloodDonationRows },
      { count: totalOrganDonations },
      { count: pendingRequests },
      { count: fulfilledRequests },
      { count: rejectedRequests },
      { data: bloodInventoryRows },
      { count: organsAvail },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('donors').select('*', { count: 'exact', head: true }),
      supabase.from('receivers').select('*', { count: 'exact', head: true }),
      supabase.from('hospitals').select('*', { count: 'exact', head: true }).eq('is_approved', 1),
      supabase.from('donations').select('units', { count: 'exact' }).eq('type', 'BLOOD'),
      supabase.from('donations').select('*', { count: 'exact', head: true }).eq('type', 'ORGAN'),
      supabase.from('requests').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
      supabase.from('requests').select('*', { count: 'exact', head: true }).eq('status', 'FULFILLED'),
      supabase.from('requests').select('*', { count: 'exact', head: true }).eq('status', 'REJECTED'),
      supabase.from('bloodinventory').select('units_available'),
      supabase.from('organinventory').select('*', { count: 'exact', head: true }).eq('availability_status', 'AVAILABLE'),
    ]);

    // Sum blood units from donation rows and blood inventory
    const totalBloodUnits = (bloodDonationRows || []).reduce((sum, r) => sum + (r.units || 0), 0);
    const availableBloodUnits = (bloodInventoryRows || []).reduce((sum, r) => sum + (r.units_available || 0), 0);

    return {
      totalUsers:          totalUsers          || 0,
      totalDonors:         totalDonors         || 0,
      totalReceivers:      totalReceivers      || 0,
      totalHospitals:      totalHospitals      || 0,
      totalBloodDonations: totalBloodDonations || 0,
      totalBloodUnits,
      totalOrganDonations: totalOrganDonations || 0,
      pendingRequests:     pendingRequests     || 0,
      completedRequests:   fulfilledRequests   || 0,
      rejectedRequests:    rejectedRequests    || 0,
      availableBloodUnits,
      availableOrgans:     organsAvail         || 0,
    };
  } catch (error) {
    console.error('[fetchLiveStats] Supabase count error:', error.message);
    // Return zeroed stats on error so the endpoint still responds
    return {
      totalUsers: 0, totalDonors: 0, totalReceivers: 0, totalHospitals: 0,
      totalBloodDonations: 0, totalBloodUnits: 0, totalOrganDonations: 0,
      pendingRequests: 0, completedRequests: 0, rejectedRequests: 0,
      availableBloodUnits: 0, availableOrgans: 0,
    };
  }
};



const fetchChartData = async () => {
  const monthlyDonations = await query(`
    SELECT strftime('%Y-%m', donation_date) as month, COUNT(*) as count, type
    FROM Donations GROUP BY month, type ORDER BY month DESC LIMIT 12
  `);
  const bloodDistribution = await query(`
    SELECT blood_group, SUM(units_available) as total_units FROM BloodInventory GROUP BY blood_group
  `);
  const organDistribution = await query(`
    SELECT organ_type, COUNT(*) as total_count,
           SUM(CASE WHEN availability_status='AVAILABLE' THEN 1 ELSE 0 END) as available_count
    FROM OrganInventory GROUP BY organ_type
  `);
  const hospitalPerformance = await query(`
    SELECT h.hospital_name, COUNT(d.id) as donation_count
    FROM Hospitals h LEFT JOIN Donations d ON h.id = d.hospital_id
    GROUP BY h.id ORDER BY donation_count DESC LIMIT 6
  `);
  return { monthlyDonations, bloodDistribution, organDistribution, hospitalPerformance };
};

// Users List with Search & Filtering
const getUsers = async (req, res) => {
  try {
    const { role, search, status } = req.query;
    let sql = 'SELECT id, full_name, email, role, phone, city, state, is_verified, is_suspended, created_at FROM Users WHERE 1=1';
    const params = [];

    if (role && role !== 'ALL') {
      sql += ' AND role = ?';
      params.push(role);
    }
    if (search) {
      sql += ' AND (full_name LIKE ? OR email LIKE ? OR city LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (status === 'SUSPENDED') {
      sql += ' AND is_suspended = 1';
    } else if (status === 'ACTIVE') {
      sql += ' AND is_suspended = 0';
    }

    sql += ' ORDER BY id DESC LIMIT 100';
    const users = await query(sql, params);

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// Toggle User Suspension
const toggleUserSuspension = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getOne('SELECT id, is_suspended, full_name FROM Users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newStatus = user.is_suspended === 1 ? 0 : 1;
    await run('UPDATE Users SET is_suspended = ? WHERE id = ?', [newStatus, id]);

    await run('INSERT INTO AuditLogs (user_id, action, target, details) VALUES (?, ?, ?, ?)', [
      req.user.id,
      newStatus === 1 ? 'USER_SUSPEND' : 'USER_UNSUSPEND',
      `User #${id}`,
      `${newStatus === 1 ? 'Suspended' : 'Un-suspended'} user ${user.full_name}`
    ]);

    res.json({
      success: true,
      message: `User ${user.full_name} has been ${newStatus === 1 ? 'suspended' : 'activated'}.`,
      is_suspended: newStatus
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle user status' });
  }
};

// Hospital Approval Workflow
const getHospitals = async (req, res) => {
  try {
    const hospitals = await query(`
      SELECT h.*, u.full_name as owner_name, u.email, u.phone as owner_phone
      FROM Hospitals h
      JOIN Users u ON h.user_id = u.id
      ORDER BY h.id DESC
    `);
    res.json({ success: true, hospitals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch hospitals' });
  }
};

const updateHospitalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_approved } = req.body; // 0: PENDING, 1: APPROVED, 2: REJECTED, 3: UNDER REVIEW, 4: SUSPENDED

    const statusMap = {
      0: 'PENDING',
      1: 'APPROVED',
      2: 'REJECTED',
      3: 'UNDER REVIEW',
      4: 'SUSPENDED'
    };

    const statusName = statusMap[is_approved] || 'UNKNOWN';

    await run('UPDATE Hospitals SET is_approved = ? WHERE id = ?', [is_approved, id]);

    // Determine audit action name
    let action = 'HOSPITAL_STATUS_UPDATE';
    if (is_approved === 1) action = 'HOSPITAL_APPROVE';
    else if (is_approved === 2) action = 'HOSPITAL_REJECT';
    else if (is_approved === 3) action = 'HOSPITAL_REVIEW';
    else if (is_approved === 4) action = 'HOSPITAL_SUSPEND';

    await run('INSERT INTO AuditLogs (user_id, action, target, details) VALUES (?, ?, ?, ?)', [
      req.user.id,
      action,
      `Hospital #${id}`,
      `Updated hospital #${id} status to ${statusName}`
    ]);

    // Broadcast hospital status change so all dashboard clients refresh partner hospitals count
    const broadcast = req.app.get('broadcast');
    if (broadcast) {
      broadcast('HOSPITAL_STATUS_UPDATED', {
        hospitalId: id,
        is_approved,
        title: `🏥 Hospital ${statusName}`,
        message: `Hospital #${id} status has been updated to ${statusName}`
      });
    }

    res.json({ success: true, message: `Hospital status updated to ${statusName}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update hospital status' });
  }
};

// Audit Logs
const getAuditLogs = async (req, res) => {
  try {
    const logs = await query('SELECT * FROM AuditLogs ORDER BY timestamp DESC LIMIT 50');
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
};

// Reset Database Mode (Clean slate vs Demo Data)
const resetDatabase = async (req, res) => {
  try {
    const { mode } = req.query; // 'clean' or 'demo'

    if (mode === 'clean') {
      await run('DELETE FROM AuditLogs');
      await run('DELETE FROM Chats');
      await run('DELETE FROM Notifications');
      await run('DELETE FROM MedicalDocuments');
      await run('DELETE FROM Campaigns');
      await run('DELETE FROM Donations');
      await run('DELETE FROM Requests');
      await run('DELETE FROM OrganInventory');
      await run('DELETE FROM BloodInventory');
      await run('DELETE FROM Hospitals');
      await run('DELETE FROM Receivers');
      await run('DELETE FROM Donors');
      await run('DELETE FROM Admins');
      await run('DELETE FROM Users');

      const passwordHash = await bcrypt.hash('Password123!', 10);
      const adminUser = await run(
        `INSERT INTO Users (full_name, email, password_hash, role, phone, city, state, is_verified, is_suspended)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['System Administrator', 'admin@lifelink.org', passwordHash, 'admin', '+91 9876543210', 'Mumbai', 'Maharashtra', 1, 0]
      );
      await run(`INSERT INTO Admins (user_id, role_level) VALUES (?, ?)`, [adminUser.id, 'SUPER_ADMIN']);

      await run('INSERT INTO AuditLogs (user_id, action, target, details) VALUES (?, ?, ?, ?)', [
        adminUser.id,
        'DATABASE_RESET_CLEAN',
        'DATABASE',
        'Reset database to clean production slate (0 fake users). Only Super Admin retained.'
      ]);

      return res.json({
        success: true,
        message: 'Database reset to clean production slate! 0 fake users.'
      });
    } else {
      const seedDatabase = require('../seeders/seed');
      await seedDatabase();
      return res.json({
        success: true,
        message: 'Database seeded with sample demo presentation dataset.'
      });
    }
  } catch (error) {
    console.error('Reset DB error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset database' });
  }
};

module.exports = {
  getDashboardStats,
  getPublicStats,
  getUsers,
  toggleUserSuspension,
  getHospitals,
  updateHospitalStatus,
  getAuditLogs,
  resetDatabase
};

