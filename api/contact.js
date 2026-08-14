const kv = require('../lib/kv');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body || {};
  const name = String(body.name || '').trim();
  const org = String(body.org || '').trim();
  const email = String(body.email || '').trim();
  const role = String(body.role || '').trim();
  const message = String(body.message || '').trim();

  // Honeypot field: real visitors never fill this in, bots often do.
  if (String(body.company || '').trim()) {
    res.status(200).json({ ok: true });
    return;
  }

  if (!name || !org || !email || !message || !EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'Please fill in all required fields with a valid email.' });
    return;
  }

  const lead = {
    name,
    org,
    email,
    role: role || 'Other',
    message,
    submittedAt: new Date().toISOString(),
  };

  await kv.rpush('leads', lead);

  if (process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM_EMAIL || 'RISIQ Website <onboarding@resend.dev>',
          to: [process.env.CONTACT_TO_EMAIL],
          reply_to: email,
          subject: `Pilot briefing request — ${org}`,
          text: `Name: ${name}\nOrganisation: ${org}\nEmail: ${email}\nRole: ${lead.role}\n\n${message}`,
        }),
      });
    } catch (err) {
      // Lead is already saved in KV; a failed notification email shouldn't fail the request.
      console.error('Resend notification failed:', err);
    }
  }

  res.status(200).json({ ok: true });
};
