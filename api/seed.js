const kv = require('../lib/kv');

// One-time setup endpoint: visit /api/seed?secret=YOUR_SEED_SECRET after deploying
// to populate the demo certificates used by the QR-verification demo.
const DEMO_CERTIFICATES = [
  {
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
  },
  {
    id: 'RISIQ-0002',
    vehicle: 'Changan Lumin',
    testType: 'Rapid Check',
    testDate: '2026-07-02',
    stateOfHealth: 86,
    grade: 'B',
    usableCapacityKwh: 25.6,
    estimatedRangeKm: 251,
    location: 'Addis Ababa, Ethiopia',
    status: 'Valid',
  },
  {
    id: 'RISIQ-0003',
    vehicle: 'Jetour Ice Cream EV',
    testType: 'Reference Test',
    testDate: '2026-07-14',
    stateOfHealth: 71,
    grade: 'C',
    usableCapacityKwh: 20.4,
    estimatedRangeKm: 165,
    location: 'Addis Ababa, Ethiopia',
    status: 'Valid',
  },
];

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!process.env.SEED_SECRET || req.query.secret !== process.env.SEED_SECRET) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  await Promise.all(DEMO_CERTIFICATES.map((cert) => kv.set(`cert:${cert.id}`, cert)));
  res.status(200).json({ ok: true, seeded: DEMO_CERTIFICATES.map((cert) => cert.id) });
};
