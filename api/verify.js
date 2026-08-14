const kv = require('../lib/kv');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const rawId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const id = (rawId || '').trim().toUpperCase();

  if (!id) {
    res.status(400).json({ error: 'Missing certificate id' });
    return;
  }

  const record = await kv.get(`cert:${id}`);

  if (!record) {
    res.status(404).json({ found: false, id });
    return;
  }

  res.status(200).json({ found: true, id, certificate: record });
};
