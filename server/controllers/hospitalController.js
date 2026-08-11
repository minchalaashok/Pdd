const { query, getOne, run } = require('../config/db');

// Get Hospital Patient Waiting List & Active Surgery Cases
const getHospitalPatients = async (req, res) => {
  try {
    const { hospital_id } = req.query;

    const patients = await query(
      `SELECT r.*, u.full_name, u.email, u.phone, u.city, u.avatar_url,
              h.hospital_name
       FROM Receivers r
       JOIN Users u ON r.user_id = u.id
       LEFT JOIN Hospitals h ON r.city = h.city
       WHERE r.status = 'ACTIVE'
       ORDER BY CASE r.urgency_level
         WHEN 'CRITICAL' THEN 1
         WHEN 'HIGH' THEN 2
         WHEN 'MEDIUM' THEN 3
         ELSE 4 END, r.id DESC LIMIT 40`
    );

    res.json({ success: true, count: patients.length, patients });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch hospital patients' });
  }
};

// Register New Patient for Organ / Blood Requirement
const registerPatient = async (req, res) => {
  try {
    const { full_name, email, phone, city, blood_group_needed, organ_needed, urgency_level, age, gender, medical_doc_url } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({ success: false, message: 'Patient name and email are required' });
    }

    // Check if user exists or create user record
    let user = await getOne('SELECT id FROM Users WHERE email = ?', [email]);
    if (!user) {
      user = await run(
        `INSERT INTO Users (full_name, email, password_hash, role, phone, city, is_verified)
         VALUES (?, ?, 'TEMP_HASH_PATIENT', 'receiver', ?, ?, 1)`,
        [full_name, email, phone || '+91 9876500000', city || 'Mumbai']
      );
    }

    const rRes = await run(
      `INSERT INTO Receivers (user_id, blood_group_needed, organ_needed, urgency_level, city, medical_doc_url, gender, age, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [user.id, blood_group_needed || 'O+', organ_needed || 'Kidney', urgency_level || 'HIGH', city || 'Mumbai', medical_doc_url || 'https://lifelink.org/docs/prescription_sample.pdf', gender || 'Male', age || 35]
    );

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully on hospital waiting list',
      patientId: rRes.id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to register patient' });
  }
};

// Update Surgery / Transplant Status
const updateSurgeryStatus = async (req, res) => {
  try {
    const { requestId, surgery_status, notes } = req.body; // SCHEDULED, IN_PROGRESS, TRANSPLANT_COMPLETED

    if (!requestId || !surgery_status) {
      return res.status(400).json({ success: false, message: 'Request ID and status are required' });
    }

    await run(
      `UPDATE Requests SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [surgery_status, notes || `Surgery updated to ${surgery_status}`, requestId]
    );

    // Audit log
    await run(
      `INSERT INTO AuditLogs (action, target, details) VALUES ('SURGERY_STATUS_UPDATE', 'REQUEST', ?)`,
      [`Surgery #${requestId} set to ${surgery_status}`]
    );

    const broadcast = req.app.get('broadcast');
    if (broadcast) {
      broadcast('SURGERY_STATUS_UPDATED', {
        requestId,
        surgery_status,
        message: `🩺 Hospital Update: Transplant surgery #${requestId} is now ${surgery_status}`
      });
    }

    res.json({ success: true, message: `Surgery status updated to ${surgery_status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update surgery status' });
  }
};

module.exports = {
  getHospitalPatients,
  registerPatient,
  updateSurgeryStatus
};
