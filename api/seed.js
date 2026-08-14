const kv = require('../lib/kv');

// One-time setup endpoint: visit /api/seed?secret=YOUR_SEED_SECRET after deploying
// to populate the live demo certificate used by the QR-verification demo.
const DEMO_CERTIFICATE = {
  id: 'RISIQ-0001',
  vehicle: 'BYD Atto 3',
  testType: 'Reference Test',
  testDate: '2026-06-18',
  stateOfHealth: 94,
  grade: 'A',
  usableCapacityKwh: 57.8,
  estimatedRangeKm: 402,
  location: 'Addis Ababa, Ethiopia',
  status: 'Valid',
};

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!process.env.SEED_SECRET || req.query.secret !== process.env.SEED_SECRET) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  await kv.set(`cert:${DEMO_CERTIFICATE.id}`, DEMO_CERTIFICATE);
  res.status(200).json({ ok: true, seeded: DEMO_CERTIFICATE.id });
};
