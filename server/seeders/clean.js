const { run } = require('../config/db');
const bcrypt = require('bcryptjs');

async function cleanDatabase() {
  console.log('🧹 Cleaning Database (removing all fake users and data)...');
  try {
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
    console.log('🎉 Database has been reset to clean slate (0 fake users).');
  } catch (error) {
    console.error('❌ Clean error:', error.message);
  }
}

cleanDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Clean exception:', err);
    process.exit(1);
  });
