const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const donationController = require('../controllers/donationController');
const hospitalController = require('../controllers/hospitalController');
const aiController = require('../controllers/aiController');
const chatController = require('../controllers/chatController');
const reportController = require('../controllers/reportController');

// PUBLIC Stats endpoint — no auth needed (for dashboard counters & realtime)
router.get('/stats', adminController.getPublicStats);

// PUBLIC Live donors search
router.get('/donors/search', donationController.searchDonors);
router.get('/inventory/blood', donationController.searchBlood);
router.get('/inventory/organs', donationController.searchOrgans);

// Authentication Routes
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
// Sync external auth users (Supabase/Firebase) into custom tables for stats
router.post('/auth/sync', authController.syncUser);

// Admin Routes (Protected)
router.get('/admin/analytics', verifyToken, authorizeRoles('admin'), adminController.getDashboardStats);
router.get('/admin/users', verifyToken, authorizeRoles('admin'), adminController.getUsers);
router.put('/admin/users/:id/suspend', verifyToken, authorizeRoles('admin'), adminController.toggleUserSuspension);
router.get('/admin/hospitals', verifyToken, authorizeRoles('admin'), adminController.getHospitals);
router.put('/admin/hospitals/:id/status', verifyToken, authorizeRoles('admin'), adminController.updateHospitalStatus);
router.get('/admin/audit-logs', verifyToken, authorizeRoles('admin'), adminController.getAuditLogs);
router.post('/admin/reset-db', verifyToken, authorizeRoles('admin'), adminController.resetDatabase);

// AI Intelligence & Chatbot Engine
router.get('/ai/match-donors', aiController.matchDonors);
router.post('/ai/chat', aiController.queryMedicalAi);

// Requests & Emergency Routes
router.post('/requests', verifyToken, donationController.createRequest);
router.get('/requests', verifyToken, donationController.getRequests);
router.put('/requests/:id/status', verifyToken, donationController.updateRequestStatus);

// Hospital Management & Patient Queue Routes
router.get('/hospital/patients', hospitalController.getHospitalPatients);
router.post('/hospital/patients', hospitalController.registerPatient);
router.post('/hospital/stock', verifyToken, authorizeRoles('hospital', 'admin'), donationController.updateBloodStock);
router.put('/hospital/surgery-status', hospitalController.updateSurgeryStatus);

// Chat Routes
router.get('/chat/:userId', verifyToken, chatController.getMessages);
router.post('/chat', verifyToken, chatController.sendMessage);

// Reports Exporter
router.get('/reports/:report_type', verifyToken, reportController.generateReport);

module.exports = router;

