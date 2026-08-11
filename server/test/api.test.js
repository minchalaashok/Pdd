const { getOne, query } = require('../config/db');

async function testBackend() {
  console.log('🧪 Testing LifeLink Backend APIs & Database...');

  // Test DB User Count
  const userCount = await getOne('SELECT COUNT(*) as count FROM Users');
  console.log(`✅ Users Count in DB: ${userCount.count}`);
  if (userCount.count < 500) {
    throw new Error('User count test failed! Expected 500+ users.');
  }

  // Test DB Admin User
  const admin = await getOne("SELECT * FROM Users WHERE email = 'admin@lifelink.org'");
  console.log(`✅ Admin User Found: ${admin.full_name} (${admin.email})`);
  if (!admin) {
    throw new Error('Admin user test failed!');
  }

  // Test Donations count
  const donationCount = await getOne('SELECT COUNT(*) as count FROM Donations');
  console.log(`✅ Total Donations Recorded: ${donationCount.count}`);

  console.log('🎉 ALL BACKEND TESTS PASSED CLEANLY!');
  process.exit(0);
}

testBackend().catch((err) => {
  console.error('❌ Test error:', err);
  process.exit(1);
});
