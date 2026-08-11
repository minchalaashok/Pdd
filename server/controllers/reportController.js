const { query, getOne } = require('../config/db');

// Export Report Data in CSV / JSON format for client rendering & download
const generateReport = async (req, res) => {
  try {
    const { report_type } = req.params; // 'donations', 'users', 'hospitals', 'blood', 'organs'

    let data = [];
    let title = '';

    if (report_type === 'donations') {
      title = 'LifeLink Donation Transactions Report';
      data = await query(`
        SELECT d.id, d.type, d.item_name, d.units, d.donation_date, d.status,
               u.full_name as donor_name, h.hospital_name
        FROM Donations d
        JOIN Donors dn ON d.donor_id = dn.id
        JOIN Users u ON dn.user_id = u.id
        JOIN Hospitals h ON d.hospital_id = h.id
        ORDER BY d.id DESC LIMIT 500
      `);
    } else if (report_type === 'hospitals') {
      title = 'LifeLink Partner Hospitals Performance Report';
      data = await query(`
        SELECT h.id, h.hospital_name, h.license_number, h.city, h.phone, h.is_approved, h.created_at
        FROM Hospitals h
        ORDER BY h.id DESC
      `);
    } else if (report_type === 'blood') {
      title = 'LifeLink Regional Blood Inventory Status';
      data = await query(`
        SELECT bi.id, h.hospital_name, h.city, bi.blood_group, bi.units_available, bi.expiry_date
        FROM BloodInventory bi
        JOIN Hospitals h ON bi.hospital_id = h.id
        ORDER BY bi.units_available DESC
      `);
    } else if (report_type === 'organs') {
      title = 'LifeLink Organ Availability & Waiting List';
      data = await query(`
        SELECT oi.id, h.hospital_name, h.city, oi.organ_type, oi.availability_status, oi.waiting_list_count
        FROM OrganInventory oi
        JOIN Hospitals h ON oi.hospital_id = h.id
        ORDER BY oi.organ_type ASC
      `);
    } else {
      title = 'LifeLink Registered Users Roster';
      data = await query(`
        SELECT id, full_name, email, role, phone, city, state, is_verified, is_suspended, created_at
        FROM Users ORDER BY id DESC LIMIT 500
      `);
    }

    res.json({
      success: true,
      report_type,
      title,
      generated_at: new Date().toISOString(),
      record_count: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
};

module.exports = { generateReport };
