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

    await run('UPDATE Requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);

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
        'UPDATE BloodInventory SET units_available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [units_available, existing.id]
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

module.exports = {
  searchDonors,
  searchBlood,
  searchOrgans,
  createRequest,
  getRequests,
  updateRequestStatus,
  updateBloodStock
};
