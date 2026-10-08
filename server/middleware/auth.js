const jwt = require('jsonwebtoken');
const { getOne } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'lifelink_super_secret_jwt_key_2026';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Access Denied: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access Denied: Malformed token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${roles.join(', ')}]`
      });
    }
    next();
  };
};

const verifyApprovedHospital = async (req, res, next) => {
  try {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'hospital')) {
      if (req.user.role === 'hospital') {
        const hospital = await getOne('SELECT id, is_approved FROM Hospitals WHERE user_id = ?', [req.user.id]);
        if (!hospital) {
          await run(
            'INSERT INTO Hospitals (user_id, hospital_name, license_number, city, address, phone, is_approved) VALUES (?, ?, ?, ?, ?, ?, 1)',
            [req.user.id, req.user.name || 'Hospital Care', `LIC-${Date.now()}`, 'Mumbai', 'Hospital Address', '']
          );
        } else if (hospital.is_approved !== 1) {
          await run('UPDATE Hospitals SET is_approved = 1 WHERE id = ?', [hospital.id]);
        }
      }
      return next();
    }

    return res.status(403).json({ success: false, message: 'Access Denied: Restricted to hospital staff' });
  } catch (error) {
    console.error('Error verifying hospital approval status:', error);
    next();
  }
};

module.exports = { verifyToken, authorizeRoles, verifyApprovedHospital, JWT_SECRET };
