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
    if (req.user && req.user.role === 'admin') {
      return next();
    }

    if (!req.user || req.user.role !== 'hospital') {
      return res.status(403).json({ success: false, message: 'Access Denied: Restricted to hospital staff' });
    }

    const hospital = await getOne('SELECT is_approved FROM Hospitals WHERE user_id = ?', [req.user.id]);
    if (!hospital || hospital.is_approved !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Your hospital account is not currently authorized to access donor information.'
      });
    }

    next();
  } catch (error) {
    console.error('Error verifying hospital approval status:', error);
    res.status(500).json({ success: false, message: 'Internal server error checking authorization status' });
  }
};

module.exports = { verifyToken, authorizeRoles, verifyApprovedHospital, JWT_SECRET };
