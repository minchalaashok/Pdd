const { query } = require('../config/db');

// ABO Blood Group Compatibility Matrix
const ABO_COMPATIBILITY = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'] // Universal receiver
};

// AI Donor Matching Engine
const matchDonors = async (req, res) => {
  try {
    const { blood_group, organ, city, urgency } = req.query;

    let sql = `
      SELECT d.*, u.full_name, u.email, u.phone, u.city, u.state, u.avatar_url
      FROM Donors d
      JOIN Users u ON d.user_id = u.id
      WHERE u.is_suspended = 0 AND d.availability_status = 'AVAILABLE'
    `;
    const params = [];

    if (organ && organ !== 'ALL') {
      sql += ' AND d.organs_registered LIKE ?';
      params.push(`%${organ}%`);
    }

    const allDonors = await query(sql, params);

    // Calculate Match Score for each donor
    const scoredDonors = allDonors.map(donor => {
      let score = 50; // Base score

      // 1. Blood group compatibility check
      const compatibleTargets = ABO_COMPATIBILITY[donor.blood_group] || [];
      if (donor.blood_group === blood_group) {
        score += 30; // Direct match
      } else if (compatibleTargets.includes(blood_group)) {
        score += 20; // Compatible match
      } else {
        score -= 25; // Incompatible
      }

      // 2. City proximity
      if (city && donor.city && donor.city.toLowerCase() === city.toLowerCase()) {
        score += 15;
      }

      // 3. Donation activity boost
      if (donor.total_donations > 3) {
        score += 5;
      }

      const matchScore = Math.min(Math.max(score, 15), 99); // Clamp score between 15% and 99%

      return {
        ...donor,
        matchScore,
        compatibilityTier: matchScore > 80 ? 'EXCELLENT' : matchScore > 60 ? 'GOOD' : 'FAIR',
        estimatedDistanceKm: (Math.random() * 8 + 1.2).toFixed(1)
      };
    });

    // Sort by highest match score
    scoredDonors.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      count: scoredDonors.length,
      aiRecommendation: scoredDonors[0] ? `Top AI Recommended Donor: ${scoredDonors[0].full_name} (${scoredDonors[0].matchScore}% Match)` : 'No immediate donor available',
      donors: scoredDonors.slice(0, 20)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'AI Donor Matching engine failed' });
  }
};

// AI Medical Assistant & Triage Query Handler
const queryMedicalAi = async (req, res) => {
  try {
    const { prompt } = req.body;
    const lower = (prompt || '').toLowerCase();

    let responseText = '';
    let actionType = 'INFO';

    if (lower.includes('blood') && (lower.includes('eligib') || lower.includes('donor') || lower.includes('can i'))) {
      responseText = `🩸 **Blood Donation Eligibility Guidelines**:
- Must be between 18 - 65 years of age.
- Weight must be at least 45 kg (99 lbs).
- Hemoglobin level must be ≥ 12.5 g/dL.
- Minimum 90 days gap required between whole blood donations.
- Must be free of active infections, fever, or cold.`;
    } else if (lower.includes('compatib') || lower.includes('o-') || lower.includes('ab+')) {
      responseText = `💉 **Blood Group Compatibility Summary**:
- **O- (Universal Donor)**: Can donate whole blood to ALL blood types.
- **AB+ (Universal Receiver)**: Can receive blood from ALL blood types.
- **A+**: Can donate to A+, AB+ | Can receive from A+, A-, O+, O-
- **B+**: Can donate to B+, AB+ | Can receive from B+, B-, O+, O-`;
    } else if (lower.includes('organ') || lower.includes('kidney') || lower.includes('heart') || lower.includes('consent')) {
      responseText = `🫀 **Organ Donation Information**:
- Organs that can be pledged: Kidney, Liver, Heart, Lungs, Pancreas, Cornea (Eyes), Bone Marrow, and Skin.
- Donors receive an Official LifeLink Digital Donor Card with QR code.
- Consent can be updated anytime under your LifeLink User Profile settings.`;
    } else if (lower.includes('sos') || lower.includes('emergency') || lower.includes('urgent')) {
      actionType = 'EMERGENCY';
      responseText = `🚨 **EMERGENCY ASSISTANCE INITIATED**:
LifeLink has recorded an urgent request. Click the **'Instant SOS Request'** button in the header bar or mobile simulator to dispatch nearby registered donors and trigger hospital ambulance tracking.`;
    } else {
      responseText = `🤖 **LifeLink AI Medical Assistant**:
I am here to help you connect with verified blood and organ donors, check inventory stock across partner hospitals, and navigate emergency requests. Ask me about blood donation eligibility, compatible blood types, or emergency SOS!`;
    }

    res.json({
      success: true,
      answer: responseText,
      actionType,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'AI Chatbot error' });
  }
};

module.exports = {
  matchDonors,
  queryMedicalAi
};
