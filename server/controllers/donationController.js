const bcrypt = require('bcryptjs');
const { query, getOne, run } = require('../config/db');

// Search Donors with Advanced Filters
const searchDonors = async (req, res) => {
  try {
    const { blood_group, organ, city, availability, gender } = req.query;
    let sql = `
      SELECT d.*, u.full_name, u.email, u.phone, u.city, u.state, u.avatar_url
      FROM Donors d
      JOIN Users u ON d.user_id = u.id
      WHERE u.is_suspended = 0
    `;
    const params = [];

    if (blood_group && blood_group !== 'ALL') {
      sql += ' AND d.blood_group = ?';
      params.push(blood_group);
    }
    if (organ && organ !== 'ALL') {
      sql += ' AND d.organs_registered LIKE ?';
      params.push(`%${organ}%`);
    }
    if (city && city !== 'ALL') {
      sql += ' AND u.city LIKE ?';
      params.push(`%${city}%`);
    }
    if (availability) {
      sql += ' AND d.availability_status = ?';
      params.push(availability);
    }
    if (gender) {
      sql += ' AND d.gender = ?';
      params.push(gender);
    }

    sql += ' ORDER BY d.total_donations DESC LIMIT 50';
    const donors = await query(sql, params);

    res.json({ success: true, count: donors.length, donors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Search failed' });
  }
};

// Search Blood Inventory across Hospitals
const searchBlood = async (req, res) => {
  try {
    const { blood_group, city } = req.query;
    let sql = `
      SELECT bi.*, h.hospital_name, h.city, h.address, h.phone
      FROM BloodInventory bi
      JOIN Hospitals h ON bi.hospital_id = h.id
      WHERE bi.units_available > 0
    `;
    const params = [];

    if (blood_group && blood_group !== 'ALL') {
      sql += ' AND bi.blood_group = ?';
      params.push(blood_group);
    }
    if (city && city !== 'ALL') {
      sql += ' AND h.city LIKE ?';
      params.push(`%${city}%`);
    }

    sql += ' ORDER BY bi.units_available DESC';
    const inventory = await query(sql, params);

    res.json({ success: true, inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Blood search failed' });
  }
};

// Search Organ Inventory across Hospitals
const searchOrgans = async (req, res) => {
  try {
    const { organ_type, city } = req.query;
    let sql = `
      SELECT oi.*, h.hospital_name, h.city, h.address, h.phone
      FROM OrganInventory oi
      JOIN Hospitals h ON oi.hospital_id = h.id
      WHERE 1=1
    `;
    const params = [];

    if (organ_type && organ_type !== 'ALL') {
      sql += ' AND oi.organ_type = ?';
      params.push(organ_type);
    }
    if (city && city !== 'ALL') {
      sql += ' AND h.city LIKE ?';
      params.push(`%${city}%`);
    }

    sql += ' ORDER BY oi.availability_status ASC, oi.waiting_list_count ASC';
    const inventory = await query(sql, params);

    res.json({ success: true, inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Organ search failed' });
  }
};

// Create Request / Emergency SOS Broadcast
const createRequest = async (req, res) => {
  try {
    const { receiver_id, request_type, item_requested, units, hospital_id, urgency, notes } = req.body;

    if (!receiver_id || !request_type || !item_requested) {
      return res.status(400).json({ success: false, message: 'Missing required request parameters' });
    }

    const rRes = await run(
      `INSERT INTO Requests (receiver_id, request_type, item_requested, units, hospital_id, urgency, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
      [receiver_id, request_type, item_requested, units || 1, hospital_id || 1, urgency || 'HIGH', notes || '']
    );

    // Notify nearby donors if Emergency
    if (urgency === 'EMERGENCY') {
      await run(
        `INSERT INTO AuditLogs (user_id, action, target, details)
         VALUES (?, 'EMERGENCY_BROADCAST', 'SYSTEM', ?)`,
        [req.user.id, `Emergency broadcast triggered for ${request_type} (${item_requested})`]
      );
    }

    const broadcast = req.app.get('broadcast');
    if (broadcast) {
      broadcast('REQUEST_CREATED', {
        requestId: rRes.id,
        request_type,
        item_requested,
        urgency,
        notes,
        message: `${urgency === 'EMERGENCY' ? '🚨 EMERGENCY' : '📋 New'} Request created for ${item_requested} (${units || 1} units)`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      requestId: rRes.id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create request' });
  }
};

// Get All Requests (Admin / Receiver / Hospital)
const getRequests = async (req, res) => {
  try {
    const { status, urgency } = req.query;
    let sql = `
      SELECT req.*, u.full_name as receiver_name, u.phone as receiver_phone, u.city as receiver_city,
             h.hospital_name
      FROM Requests req
      JOIN Receivers r ON req.receiver_id = r.id
      JOIN Users u ON r.user_id = u.id
      LEFT JOIN Hospitals h ON req.hospital_id = h.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND req.status = ?';
      params.push(status);
    }
    if (urgency) {
      sql += ' AND req.urgency = ?';
      params.push(urgency);
    }

    sql += ' ORDER BY req.id DESC LIMIT 50';
    const requests = await query(sql, params);

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch requests' });
  }
};

// Update Request Status (Fulfill / Reject)
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // APPROVED, FULFILLED, REJECTED

    await run('UPDATE Requests SET status = ?, updated_at = ? WHERE id = ?', [status, new Date().toISOString(), id]);

    const broadcast = req.app.get('broadcast');
    if (broadcast) {
      broadcast('REQUEST_STATUS_UPDATED', {
        requestId: id,
        status,
        message: `Request #${id} status changed to ${status}`
      });
    }

    res.json({ success: true, message: `Request #${id} status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update request status' });
  }
};

// Update Hospital Blood Stock
const updateBloodStock = async (req, res) => {
  try {
    const { hospital_id, blood_group, units_available } = req.body;
    const existing = await getOne(
      'SELECT id FROM BloodInventory WHERE hospital_id = ? AND blood_group = ?',
      [hospital_id, blood_group]
    );

    if (existing) {
      await run(
        'UPDATE BloodInventory SET units_available = ?, updated_at = ? WHERE id = ?',
        [units_available, new Date().toISOString(), existing.id]
      );
    } else {
      await run(
        'INSERT INTO BloodInventory (hospital_id, blood_group, units_available) VALUES (?, ?, ?)',
        [hospital_id, blood_group, units_available]
      );
    }

    const broadcast = req.app.get('broadcast');
    if (broadcast) {
      broadcast('STOCK_UPDATED', {
        hospital_id,
        blood_group,
        units_available,
        message: `Blood stock updated: ${blood_group} -> ${units_available} units`
      });
    }

    res.json({ success: true, message: `Blood inventory updated for ${blood_group}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update blood stock' });
  }
};

// Update Donor Preferences & Profile Details
const updateDonorProfile = async (req, res) => {
  try {
    const {
      full_name,
      phone,
      city,
      state,
      blood_group,
      organs_registered,
      availability_status,
      current_password,
      new_password
    } = req.body;
    const userId = req.user.id;

    // Verify if user exists
    const user = await getOne('SELECT * FROM Users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify if donor exists
    const donor = await getOne('SELECT id FROM Donors WHERE user_id = ?', [userId]);

    // Handle Password Change if requested
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ success: false, message: 'Current password is required to set a new password' });
      }
      const isMatch = await bcrypt.compare(current_password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password does not match' });
      }
      const newHash = await bcrypt.hash(new_password, 10);
      await run('UPDATE Users SET password_hash = ? WHERE id = ?', [newHash, userId]);
    }

    // Update Users table fields
    const userUpdates = [];
    const userParams = [];
    if (full_name) { userUpdates.push('full_name = ?'); userParams.push(full_name.trim()); }
    if (phone !== undefined) { userUpdates.push('phone = ?'); userParams.push(phone.trim()); }
    if (city !== undefined) { userUpdates.push('city = ?'); userParams.push(city.trim()); }
    if (state !== undefined) { userUpdates.push('state = ?'); userParams.push(state.trim()); }
    if (blood_group !== undefined) { userUpdates.push('blood_group = ?'); userParams.push(blood_group.trim()); }

    if (userUpdates.length > 0) {
      userParams.push(userId);
      await run(`UPDATE Users SET ${userUpdates.join(', ')} WHERE id = ?`, userParams);
    }

    // Update Donors table fields
    if (donor) {
      const donorUpdates = [];
      const donorParams = [];
      if (organs_registered !== undefined) { donorUpdates.push('organs_registered = ?'); donorParams.push(organs_registered); }
      if (availability_status !== undefined) { donorUpdates.push('availability_status = ?'); donorParams.push(availability_status); }
      if (blood_group !== undefined) { donorUpdates.push('blood_group = ?'); donorParams.push(blood_group); }
      if (donorUpdates.length > 0) {
        donorParams.push(donor.id);
        await run(`UPDATE Donors SET ${donorUpdates.join(', ')} WHERE id = ?`, donorParams);
      }
    }

    // Fetch fresh updated details
    const updatedUser = await getOne('SELECT * FROM Users WHERE id = ?', [userId]);
    const updatedDonor = donor ? await getOne('SELECT * FROM Donors WHERE id = ?', [donor.id]) : null;

    res.json({
      success: true,
      message: 'Profile and settings updated successfully',
      donor: updatedDonor,
      user: {
        id: updatedUser.id,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        city: updatedUser.city,
        state: updatedUser.state,
        blood_group: updatedUser.blood_group,
        avatar_url: updatedUser.avatar_url,
        donor: updatedDonor
      }
    });
  } catch (error) {
    console.error('Update donor profile error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

module.exports = {
  searchDonors,
  searchBlood,
  searchOrgans,
  createRequest,
  getRequests,
  updateRequestStatus,
  updateBloodStock,
  updateDonorProfile
};
