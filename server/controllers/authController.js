const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query, getOne, run } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

const cityToState = {
  'mumbai': 'Maharashtra',
  'pune': 'Maharashtra',
  'bangalore': 'Karnataka',
  'delhi': 'Delhi',
  'chennai': 'Tamil Nadu',
  'kolkata': 'West Bengal',
  'hyderabad': 'Telangana',
  'ahmedabad': 'Gujarat',
  'jaipur': 'Rajasthan',
  'surat': 'Gujarat',
  'lucknow': 'Uttar Pradesh',
  'kochi': 'Kerala'
};
const getResolvedState = (city, state) => {
  const normCity = (city || '').toLowerCase().trim();
  if (cityToState[normCity]) {
    return cityToState[normCity];
  }
  return state || 'Maharashtra';
};

// Login Handler
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await getOne('SELECT * FROM Users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email address not registered.' });
    }

    if (user.is_suspended === 1) {
      return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ success: false, message: `Access denied. User is registered as ${user.role}` });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Wrong password. Please try again.' });
    }

    // Fetch extra role details if applicable
    let extraData = {};
    if (user.role === 'hospital') {
      const hospital = await getOne('SELECT * FROM Hospitals WHERE user_id = ?', [user.id]);
      extraData.hospital = hospital;
    } else if (user.role === 'donor') {
      const donor = await getOne('SELECT * FROM Donors WHERE user_id = ?', [user.id]);
      extraData.donor = donor;
    } else if (user.role === 'receiver') {
      const receiver = await getOne('SELECT * FROM Receivers WHERE user_id = ?', [user.id]);
      extraData.receiver = receiver;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Audit log
    await run('INSERT INTO AuditLogs (user_id, action, target, details) VALUES (?, ?, ?, ?)', [
      user.id,
      'USER_LOGIN',
      'AUTH',
      `Logged in as ${user.role}`
    ]);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        state: user.state,
        avatar_url: user.avatar_url,
        ...extraData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// Register Handler
const register = async (req, res) => {
  try {
    const { full_name, email, password, role, phone, city, state, blood_group, organ_needed, organs_registered, hospital_name, license_number } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const existing = await getOne('SELECT id FROM Users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const uRes = await run(
      `INSERT INTO Users (full_name, email, password_hash, role, phone, city, state)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [full_name, email.toLowerCase().trim(), passwordHash, role, phone || '', city || 'Mumbai', getResolvedState(city, state)]
    );

    const userId = uRes.id;

    if (role === 'donor') {
      await run(
        `INSERT INTO Donors (user_id, blood_group, organs_registered, availability_status)
         VALUES (?, ?, ?, ?)`,
        [userId, blood_group || 'O+', organs_registered || 'Kidney,Liver', 'AVAILABLE']
      );
    } else if (role === 'receiver') {
      await run(
        `INSERT INTO Receivers (user_id, blood_group_needed, organ_needed, urgency_level, city)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, blood_group || 'O+', organ_needed || 'Kidney', 'HIGH', city || 'Mumbai']
      );
    } else if (role === 'hospital') {
      const hRes = await run(
        `INSERT INTO Hospitals (user_id, hospital_name, license_number, city, address, phone, is_approved)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, hospital_name || full_name, license_number || `LIC-${Date.now()}`, city || 'Mumbai', 'Hospital Address', phone || '', 1]
      );
      const hId = hRes.id;

      // Seed default blood inventory for the new hospital
      const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      for (const bg of bloodGroups) {
        const units = Math.floor(Math.random() * 45) + 20; // 20 to 65 units
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        await run(
          `INSERT INTO BloodInventory (hospital_id, blood_group, units_available, expiry_date, status)
           VALUES (?, ?, ?, ?, ?)`,
          [hId, bg, units, expiryDate.toISOString().split('T')[0], 'AVAILABLE']
        );
      }

      // Seed default organ inventory for the new hospital
      const organTypes = ['Heart', 'Kidney', 'Liver', 'Lungs', 'Pancreas', 'Eyes', 'Bone Marrow', 'Skin', 'Blood Vessels'];
      for (const organ of organTypes) {
        const isAvail = Math.random() > 0.4 ? 'AVAILABLE' : 'WAITING';
        const waitingCount = Math.floor(Math.random() * 10) + 1;
        await run(
          `INSERT INTO OrganInventory (hospital_id, organ_type, availability_status, waiting_list_count)
           VALUES (?, ?, ?, ?)`,
          [hId, organ, isAvail, waitingCount]
        );
      }
    }

    const token = jwt.sign(
      { id: userId, email: email.toLowerCase().trim(), role, name: full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const broadcast = req.app.get('broadcast');
    if (broadcast) {
      broadcast('USER_REGISTERED', {
        user: { id: userId, full_name, email, role, phone, city, blood_group, organ_needed },
        message: `New ${role.toUpperCase()} registered: ${full_name} (${city})`
      });
    }

    return res.status(201).json({
      success: true,
      token,
      user: { id: userId, full_name, email, role, phone, city }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// Sync User — creates a custom-table record for Supabase Auth / Firebase users
// that don't have a row in the custom Users table yet.
// No real password is needed since auth is managed externally.
const syncUser = async (req, res) => {
  try {
    const { full_name, email, role, phone, city, state, blood_group,
            organ_needed, organs_registered, hospital_name, license_number } = req.body;

    if (!email || !role) {
      return res.status(400).json({ success: false, message: 'email and role are required' });
    }

    const normalEmail = email.toLowerCase().trim();

    // If the user already exists in custom tables, just return a fresh token
    const existing = await getOne('SELECT id, role, full_name FROM Users WHERE email = ?', [normalEmail]);
    if (existing) {
      const token = jwt.sign(
        { id: existing.id, email: normalEmail, role: existing.role, name: existing.full_name },
        JWT_SECRET, { expiresIn: '7d' }
      );
      return res.json({ success: true, synced: false, token,
        user: { id: existing.id, full_name: existing.full_name, email: normalEmail, role: existing.role } });
    }

    // Create user record — password managed externally (Supabase Auth / Firebase)
    const placeholderHash = await bcrypt.hash(
      `EXTERNAL_AUTH_${crypto.randomBytes(16).toString('hex')}`, 10
    );

    const uRes = await run(
      `INSERT INTO Users (full_name, email, password_hash, role, phone, city, state)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [full_name || normalEmail.split('@')[0], normalEmail, placeholderHash,
       role, phone || '', city || 'Mumbai', getResolvedState(city, state)]
    );
    const userId = uRes.id;

    // Create role-specific record
    if (role === 'donor') {
      await run(
        `INSERT INTO Donors (user_id, blood_group, organs_registered, availability_status)
         VALUES (?, ?, ?, 'AVAILABLE')`,
        [userId, blood_group || 'O+', organs_registered || '']
      );
    } else if (role === 'receiver') {
      await run(
        `INSERT INTO Receivers (user_id, blood_group_needed, organ_needed, urgency_level, city)
         VALUES (?, ?, ?, 'HIGH', ?)`,
        [userId, blood_group || 'O+', organ_needed || 'Kidney', city || 'Mumbai']
      );
    } else if (role === 'hospital') {
      const hRes = await run(
        `INSERT INTO Hospitals (user_id, hospital_name, license_number, city, address, phone, is_approved)
         VALUES (?, ?, ?, ?, ?, ?, 1)`, // auto-approving for smooth faculty demo
        [userId, hospital_name || full_name || 'Hospital',
         license_number || `LIC-${Date.now()}`, city || 'Mumbai',
         'Hospital Address', phone || '']
      );
      const hId = hRes.id;

      // Seed default blood inventory for the new hospital
      const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      for (const bg of bloodGroups) {
        const units = Math.floor(Math.random() * 45) + 20;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        await run(
          `INSERT INTO BloodInventory (hospital_id, blood_group, units_available, expiry_date, status)
           VALUES (?, ?, ?, ?, ?)`,
          [hId, bg, units, expiryDate.toISOString().split('T')[0], 'AVAILABLE']
        );
      }

      // Seed default organ inventory for the new hospital
      const organTypes = ['Heart', 'Kidney', 'Liver', 'Lungs', 'Pancreas', 'Eyes', 'Bone Marrow', 'Skin', 'Blood Vessels'];
      for (const organ of organTypes) {
        const isAvail = Math.random() > 0.4 ? 'AVAILABLE' : 'WAITING';
        const waitingCount = Math.floor(Math.random() * 10) + 1;
        await run(
          `INSERT INTO OrganInventory (hospital_id, organ_type, availability_status, waiting_list_count)
           VALUES (?, ?, ?, ?)`,
          [hId, organ, isAvail, waitingCount]
        );
      }
    }

    // Broadcast so all open dashboards refresh their stats counters
    const broadcast = req.app.get('broadcast');
    if (broadcast) {
      broadcast('USER_REGISTERED', {
        title: '\uD83D\uDC64 New User Joined',
        message: `${role.toUpperCase()} ${full_name || normalEmail} joined LifeLink (${city || 'India'})`,
        city: city || 'India'
      });
    }

    const token = jwt.sign(
      { id: userId, email: normalEmail, role, name: full_name || normalEmail.split('@')[0] },
      JWT_SECRET, { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true, synced: true, token,
      user: { id: userId, full_name: full_name || normalEmail.split('@')[0], email: normalEmail, role, phone, city }
    });
  } catch (error) {
    console.error('syncUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to sync user profile' });
  }
};

module.exports = { login, register, syncUser };
