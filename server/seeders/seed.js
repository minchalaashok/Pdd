const bcrypt = require('bcryptjs');
const { run, query, getOne } = require('../config/db');

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Kochi'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ORGAN_TYPES = ['Heart', 'Kidney', 'Liver', 'Lungs', 'Pancreas', 'Eyes', 'Bone Marrow', 'Skin', 'Blood Vessels'];
const BADGES = ['Gold Donor', 'Hero of Life', 'Emergency Responder', '5+ Donations', 'Organ Hero', 'Community Shield', 'Platinum Giver'];
const URGENCY_LEVELS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const FIRST_NAMES = ['Aarav', 'Ananya', 'Rohan', 'Priya', 'Vikram', 'Neha', 'Aditya', 'Sneha', 'Rahul', 'Kavya', 'Arjun', 'Meera', 'Siddharth', 'Pooja', 'Karan', 'Isha', 'Dev', 'Tara', 'Amit', 'Divya', 'Rajesh', 'Shweta', 'Sunil', 'Ritu', 'Manish', 'Nisha', 'Alok', 'Deepa', 'Sanjay', 'Geeta'];
const LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Rao', 'Gupta', 'Singh', 'Kumar', 'Joshi', 'Nair', 'Reddy', 'Deshmukh', 'Mehta', 'Chopra', 'Bhasin', 'Chatterjee', 'Banerjee', 'Kulkarni', 'Iyer', 'Agarwal', 'Shah'];
const HOSPITAL_NAMES = ['Apex Care Hospital', 'City Life Medical Center', 'St. Jude General Hospital', 'Global Health Institute', 'Metropolitan Multi-Specialty', 'Sunrise Medical Center', 'Apollo Care Hub', 'Fortis Healing Center', 'Max Healthcare Institute', 'Reliance Life Care', 'Lilavati Medical Institute', 'Narayana Health Sciences'];

async function seedDatabase() {
  console.log('🌱 Starting LifeLink Database Seeding...');
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Clear existing tables
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

  console.log('🧹 Cleaned previous data.');

  // 1. Create Default Admin User
  const adminUser = await run(
    `INSERT INTO Users (full_name, email, password_hash, role, phone, city, state, is_verified, is_suspended)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['System Administrator', 'admin@lifelink.org', passwordHash, 'admin', '+91 9876543210', 'Mumbai', 'Maharashtra', 1, 0]
  );
  await run(`INSERT INTO Admins (user_id, role_level) VALUES (?, ?)`, [adminUser.id, 'SUPER_ADMIN']);

  console.log('✅ Created Default Admin (admin@lifelink.org / Password123!)');

  // 2. Create 50+ Hospitals
  const hospitalUserIds = [];
  const hospitalIds = [];

  for (let i = 1; i <= 52; i++) {
    const cityName = CITIES[i % CITIES.length];
    const namePrefix = HOSPITAL_NAMES[i % HOSPITAL_NAMES.length];
    const hName = `${namePrefix} - ${cityName} Wing ${i}`;
    const email = `hospital${i}@lifelink.org`;

    const uRes = await run(
      `INSERT INTO Users (full_name, email, password_hash, role, phone, city, state, is_verified)
       VALUES (?, ?, ?, 'hospital', ?, ?, 'State', 1)`,
      [hName, email, passwordHash, `+91 91234${String(10000 + i)}`, cityName]
    );
    hospitalUserIds.push(uRes.id);

    const isApproved = i % 10 === 0 ? 0 : 1; // 10% pending approval for testing approval workflow
    const hRes = await run(
      `INSERT INTO Hospitals (user_id, hospital_name, license_number, license_doc_url, city, address, phone, is_approved, lat, lng)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uRes.id,
        hName,
        `LIC-MED-2026-${1000 + i}`,
        `https://lifelink.org/docs/license_${1000 + i}.pdf`,
        cityName,
        `${10 + i}, Healthcare Avenue, Sector ${i % 15 + 1}, ${cityName}`,
        `+91 91234${String(10000 + i)}`,
        isApproved,
        18.9 + (i * 0.05),
        72.8 + (i * 0.05)
      ]
    );
    hospitalIds.push(hRes.id);
  }
  console.log(`✅ Created ${hospitalIds.length} Hospitals.`);

  // 3. Create Inventory for Hospitals (Blood & Organ)
  for (const hId of hospitalIds) {
    // Blood inventory for each blood group
    for (const bg of BLOOD_GROUPS) {
      const units = Math.floor(Math.random() * 45) + 5;
      const expiryDays = Math.floor(Math.random() * 30) + 10;
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + expiryDays);

      await run(
        `INSERT INTO BloodInventory (hospital_id, blood_group, units_available, expiry_date, status)
         VALUES (?, ?, ?, ?, 'AVAILABLE')`,
        [hId, bg, units, expDate.toISOString().split('T')[0]]
      );
    }

    // Organ inventory for various organ types
    for (const organ of ORGAN_TYPES) {
      const isAvail = Math.random() > 0.65 ? 'AVAILABLE' : 'WAITING';
      const waitingCount = Math.floor(Math.random() * 15) + 1;
      await run(
        `INSERT INTO OrganInventory (hospital_id, organ_type, availability_status, waiting_list_count)
         VALUES (?, ?, ?, ?)`,
        [hId, organ, isAvail, waitingCount]
      );
    }
  }
  console.log(`✅ Populated Blood & Organ Inventory across hospitals.`);

  // 4. Create 260 Donors
  const donorIds = [];
  const donorUserIds = [];
  for (let i = 1; i <= 260; i++) {
    const fn = FIRST_NAMES[i % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const email = `donor${i}@lifelink.org`;
    const city = CITIES[i % CITIES.length];
    const bg = BLOOD_GROUPS[i % BLOOD_GROUPS.length];

    const uRes = await run(
      `INSERT INTO Users (full_name, email, password_hash, role, phone, city, state, is_verified)
       VALUES (?, ?, ?, 'donor', ?, ?, 'State', 1)`,
      [`${fn} ${ln}`, email, passwordHash, `+91 98${String(1000000 + i)}`, city]
    );
    donorUserIds.push(uRes.id);

    const totalDonations = Math.floor(Math.random() * 12);
    const assignedBadges = JSON.stringify([BADGES[i % BADGES.length], BADGES[(i + 2) % BADGES.length]]);
    const registeredOrgans = [ORGAN_TYPES[i % ORGAN_TYPES.length], ORGAN_TYPES[(i + 4) % ORGAN_TYPES.length]].join(',');

    const dRes = await run(
      `INSERT INTO Donors (user_id, blood_group, organs_registered, availability_status, total_donations, badges, gender, age, emergency_contact)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uRes.id,
        bg,
        registeredOrgans,
        i % 8 === 0 ? 'BUSY' : 'AVAILABLE',
        totalDonations,
        assignedBadges,
        i % 2 === 0 ? 'Male' : 'Female',
        20 + (i % 40),
        `+91 99${String(1000000 + i)}`
      ]
    );
    donorIds.push(dRes.id);
  }
  console.log(`✅ Created ${donorIds.length} Donors.`);

  // 5. Create 160 Receivers
  const receiverIds = [];
  const receiverUserIds = [];
  for (let i = 1; i <= 160; i++) {
    const fn = FIRST_NAMES[(i + 5) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i + 7) % LAST_NAMES.length];
    const email = `receiver${i}@lifelink.org`;
    const city = CITIES[i % CITIES.length];
    const bg = BLOOD_GROUPS[i % BLOOD_GROUPS.length];
    const organNeeded = ORGAN_TYPES[i % ORGAN_TYPES.length];

    const uRes = await run(
      `INSERT INTO Users (full_name, email, password_hash, role, phone, city, state, is_verified)
       VALUES (?, ?, ?, 'receiver', ?, ?, 'State', 1)`,
      [`${fn} ${ln}`, email, passwordHash, `+91 97${String(1000000 + i)}`, city]
    );
    receiverUserIds.push(uRes.id);

    const rRes = await run(
      `INSERT INTO Receivers (user_id, blood_group_needed, organ_needed, urgency_level, city, distance_km, gender, age)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uRes.id,
        bg,
        organNeeded,
        URGENCY_LEVELS[i % URGENCY_LEVELS.length],
        city,
        (Math.random() * 15 + 1).toFixed(1),
        i % 2 === 0 ? 'Female' : 'Male',
        18 + (i % 55)
      ]
    );
    receiverIds.push(rRes.id);
  }
  console.log(`✅ Created ${receiverIds.length} Receivers.`);

  // Total users created: 1 Admin + 52 Hospitals + 260 Donors + 160 Receivers = 473+ Users (rounded with extra additions = 500+)
  for (let i = 1; i <= 30; i++) {
    await run(
      `INSERT INTO Users (full_name, email, password_hash, role, phone, city, state, is_verified)
       VALUES (?, ?, ?, 'donor', ?, ?, 'State', 1)`,
      [`Extra User ${i}`, `user${i}@lifelink.org`, passwordHash, `+91 96000${String(10000 + i)}`, 'Mumbai']
    );
  }
  console.log('✅ Added extra users for 500+ total user count.');

  // 6. Generate 100+ Requests & Emergency Requests
  const requestIds = [];
  for (let i = 1; i <= 110; i++) {
    const rId = receiverIds[i % receiverIds.length];
    const isBlood = i % 2 === 0;
    const reqType = isBlood ? 'BLOOD' : 'ORGAN';
    const itemReq = isBlood ? BLOOD_GROUPS[i % BLOOD_GROUPS.length] : ORGAN_TYPES[i % ORGAN_TYPES.length];
    const hId = hospitalIds[i % hospitalIds.length];
    const status = i % 4 === 0 ? 'FULFILLED' : i % 7 === 0 ? 'REJECTED' : 'PENDING';
    const urgency = i % 3 === 0 ? 'EMERGENCY' : 'URGENT';

    const reqRes = await run(
      `INSERT INTO Requests (receiver_id, request_type, item_requested, units, hospital_id, urgency, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [rId, reqType, itemReq, Math.floor(Math.random() * 3) + 1, hId, urgency, status, `Patient requires urgent ${itemReq} for surgery.`]
    );
    requestIds.push(reqRes.id);
  }
  console.log(`✅ Generated ${requestIds.length} Requests & Emergency Signals.`);

  // 7. Generate 1000+ Blood Donations & 200+ Organ Records
  let donationCount = 0;
  // Generate historical donation records over past 12 months
  const now = new Date();

  for (let i = 1; i <= 1050; i++) {
    const dId = donorIds[i % donorIds.length];
    const hId = hospitalIds[i % hospitalIds.length];
    const bg = BLOOD_GROUPS[i % BLOOD_GROUPS.length];
    const pastDays = Math.floor(Math.random() * 365);
    const dDate = new Date(now.getTime() - pastDays * 24 * 60 * 60 * 1000).toISOString();

    await run(
      `INSERT INTO Donations (donor_id, request_id, hospital_id, type, item_name, units, donation_date, status)
       VALUES (?, ?, ?, 'BLOOD', ?, ?, ?, 'COMPLETED')`,
      [dId, requestIds[i % requestIds.length], hId, bg, Math.floor(Math.random() * 2) + 1, dDate]
    );
    donationCount++;
  }
  console.log(`✅ Generated ${donationCount} Blood Donation Records.`);

  let organCount = 0;
  for (let i = 1; i <= 210; i++) {
    const dId = donorIds[i % donorIds.length];
    const hId = hospitalIds[i % hospitalIds.length];
    const organ = ORGAN_TYPES[i % ORGAN_TYPES.length];
    const pastDays = Math.floor(Math.random() * 365);
    const dDate = new Date(now.getTime() - pastDays * 24 * 60 * 60 * 1000).toISOString();

    await run(
      `INSERT INTO Donations (donor_id, request_id, hospital_id, type, item_name, units, donation_date, status)
       VALUES (?, ?, ?, 'ORGAN', ?, 1, ?, 'COMPLETED')`,
      [dId, requestIds[i % requestIds.length], hId, organ, dDate]
    );
    organCount++;
  }
  console.log(`✅ Generated ${organCount} Organ Donation Records.`);

  // 8. Generate Campaigns
  for (let i = 1; i <= 8; i++) {
    const hId = hospitalIds[i % hospitalIds.length];
    const city = CITIES[i % CITIES.length];
    await run(
      `INSERT INTO Campaigns (hospital_id, title, description, location, start_date, end_date, target_units, collected_units, status)
       VALUES (?, ?, ?, ?, '2026-08-01', '2026-08-30', ?, ?, 'ACTIVE')`,
      [hId, `Mega Blood Drive 2026 - ${city}`, `Join the life-saving movement in ${city}. Free health checkup included.`, `${city} Town Center`, 250, 180]
    );
  }

  // 9. Generate Notifications, Chats, Audit Logs
  await run(
    `INSERT INTO Notifications (user_id, title, message, type)
     VALUES (?, 'Welcome to LifeLink', 'Thank you for registering on LifeLink Smart Donation Platform.', 'SYSTEM')`,
    [adminUser.id]
  );

  await run(
    `INSERT INTO AuditLogs (user_id, action, target, details)
     VALUES (?, 'SYSTEM_SEED', 'DATABASE', 'Seeded demo dataset with 500+ users, 1000+ donations, and 200+ organ records.')`,
    [adminUser.id]
  );

  console.log('🎉 DB SEEDING COMPLETED SUCCESSFULLY!');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding error:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
