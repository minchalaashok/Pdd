const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles, verifyApprovedHospital } = require('../middleware/auth');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const donationController = require('../controllers/donationController');
const hospitalController = require('../controllers/hospitalController');
const aiController = require('../controllers/aiController');
const chatController = require('../controllers/chatController');
const reportController = require('../controllers/reportController');
const notificationController = require('../controllers/notificationController');

// PUBLIC Stats endpoint — no auth needed (for dashboard counters & realtime)
router.get('/stats', adminController.getPublicStats);

// PROTECTED Donors search (Approved hospitals & admins only)
router.get('/donors/search', verifyToken, authorizeRoles('hospital', 'admin'), verifyApprovedHospital, donationController.searchDonors);

// PUBLIC/PATIENT search for blood/organ stock availability
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
router.get('/ai/match-donors', verifyToken, aiController.matchDonors);
router.post('/ai/chat', verifyToken, aiController.queryMedicalAi);

// Requests & Emergency Routes
router.post('/requests', verifyToken, donationController.createRequest);
router.get('/requests', verifyToken, donationController.getRequests);
router.put('/requests/:id/status', verifyToken, donationController.updateRequestStatus);

// Donor Profile Preferences
router.put('/donor/profile', verifyToken, authorizeRoles('donor'), donationController.updateDonorProfile);

// Hospital Management & Patient Queue Routes (Approved hospitals only)
router.get('/hospital/patients', verifyToken, authorizeRoles('hospital', 'admin'), verifyApprovedHospital, hospitalController.getHospitalPatients);
router.post('/hospital/patients', verifyToken, authorizeRoles('hospital', 'admin'), verifyApprovedHospital, hospitalController.registerPatient);
router.post('/hospital/stock', verifyToken, authorizeRoles('hospital', 'admin'), verifyApprovedHospital, donationController.updateBloodStock);
router.put('/hospital/surgery-status', verifyToken, authorizeRoles('hospital', 'admin'), verifyApprovedHospital, hospitalController.updateSurgeryStatus);
router.put('/hospital/patients/:id/status', verifyToken, authorizeRoles('hospital', 'admin'), verifyApprovedHospital, hospitalController.updatePatientStatus);

// Chat Routes
router.get('/chat/contacts', verifyToken, chatController.getChatContacts);
router.get('/chat/:userId', verifyToken, chatController.getMessages);
router.post('/chat', verifyToken, chatController.sendMessage);

// Notification Routes
router.get('/notifications', verifyToken, notificationController.getNotifications);
router.put('/notifications/read', verifyToken, notificationController.markAllAsRead);

// Reports Exporter
router.get('/reports/:report_type', verifyToken, reportController.generateReport);

module.exports = router;

