const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db');

// ── helpers ──────────────────────────────────────────────────────────────────
const MOBILE_PLANS = ['android-basic','android-pro','android-enterprise','ios-basic','ios-pro','ios-enterprise'];
const DEFAULT_FEATURES = {
  'android-basic':      ['antivirus','anti-malware','app-scanner'],
  'android-pro':        ['antivirus','anti-malware','app-scanner','anti-phishing','vpn','theft-protection'],
  'android-enterprise': ['antivirus','anti-malware','app-scanner','anti-phishing','vpn','theft-protection','mdm-integration','remote-wipe'],
  'ios-basic':          ['antivirus','anti-malware','security-scanner'],
  'ios-pro':            ['antivirus','anti-malware','security-scanner','anti-phishing','vpn','theft-protection'],
  'ios-enterprise':     ['antivirus','anti-malware','security-scanner','anti-phishing','vpn','theft-protection','mdm-integration','remote-wipe'],
};
function genKey() { return `LIC-${uuidv4().toUpperCase()}`; }

// ── GET /  — list with filters ───────────────────────────────────────────────
router.get('/', (req, res) => {
  const { search, status, plan, platform, expiring_days, page = 1, limit = 20 } = req.query;
  let where = 'WHERE 1=1';
  const params = [];

  if (search) {
    where += ' AND (owner_name LIKE ? OR owner_email LIKE ? OR key LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (status)        { where += ' AND status = ?';    params.push(status); }
  if (plan)          { where += ' AND plan = ?';      params.push(plan); }
  if (platform)      { where += ' AND platform = ?';  params.push(platform); }
  if (expiring_days) {
    where += ' AND expires_at IS NOT NULL AND date(expires_at) <= date(\'now\',?) AND status = \'active\'';
    params.push(`+${expiring_days} days`);
  }

  const total  = get(`SELECT COUNT(*) as count FROM licenses ${where}`, params).count;
  const offset = (Number(page) - 1) * Number(limit);
  const rows   = all(
    `SELECT * FROM licenses ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  );
  res.json({ data: rows, total, page: Number(page), limit: Number(limit) });
});

// ── GET /stats — dashboard counts ────────────────────────────────────────────
router.get('/stats', (req, res) => {
  const total    = get(`SELECT COUNT(*) as c FROM licenses`).c;
  const active   = get(`SELECT COUNT(*) as c FROM licenses WHERE status='active'`).c;
  const expired  = get(`SELECT COUNT(*) as c FROM licenses WHERE status='expired'`).c;
  const revoked  = get(`SELECT COUNT(*) as c FROM licenses WHERE status='revoked'`).c;
  const mobile   = get(`SELECT COUNT(*) as c FROM licenses WHERE platform='mobile'`).c;
  const desktop  = get(`SELECT COUNT(*) as c FROM licenses WHERE platform='desktop' OR platform IS NULL`).c;
  const expiring = get(`SELECT COUNT(*) as c FROM licenses WHERE expires_at IS NOT NULL AND date(expires_at) <= date('now','+7 days') AND status='active'`).c;
  const byPlan   = all(`SELECT plan, COUNT(*) as count FROM licenses GROUP BY plan ORDER BY count DESC`);
  res.json({ total, active, expired, revoked, mobile, desktop, expiring_soon: expiring, byPlan });
});

// ── GET /export — CSV download ────────────────────────────────────────────────
router.get('/export', (req, res) => {
  const { status, plan, platform } = req.query;
  let where = 'WHERE 1=1';
  const params = [];
  if (status)   { where += ' AND status = ?';   params.push(status); }
  if (plan)     { where += ' AND plan = ?';     params.push(plan); }
  if (platform) { where += ' AND platform = ?'; params.push(platform); }

  const rows = all(`SELECT key,owner_name,owner_email,plan,status,platform,device_limit,expires_at,created_at FROM licenses ${where} ORDER BY created_at DESC`, params);
  const header = 'key,owner_name,owner_email,plan,status,platform,device_limit,expires_at,created_at';
  const csv = [header, ...rows.map(r =>
    [r.key, r.owner_name, r.owner_email, r.plan, r.status, r.platform, r.device_limit, r.expires_at || '', r.created_at]
      .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(',')
  )].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="licenses.csv"');
  res.send(csv);
});

// ── GET /plans/mobile ─────────────────────────────────────────────────────────
router.get('/plans/mobile', (req, res) => {
  res.json({
    'android-basic':      { name: 'Android Basic',      platform: 'android', description: 'Essential mobile security', features: DEFAULT_FEATURES['android-basic'],      device_limit: 1,  price: { monthly: 9.99,  yearly: 99.99  } },
    'android-pro':        { name: 'Android Pro',        platform: 'android', description: 'Advanced protection',       features: DEFAULT_FEATURES['android-pro'],        device_limit: 3,  price: { monthly: 19.99, yearly: 199.99 } },
    'android-enterprise': { name: 'Android Enterprise', platform: 'android', description: 'Full MDM integration',      features: DEFAULT_FEATURES['android-enterprise'], device_limit: 10, price: { monthly: 49.99, yearly: 499.99 } },
    'ios-basic':          { name: 'iOS Basic',          platform: 'ios',     description: 'Essential iOS security',    features: DEFAULT_FEATURES['ios-basic'],          device_limit: 1,  price: { monthly: 9.99,  yearly: 99.99  } },
    'ios-pro':            { name: 'iOS Pro',            platform: 'ios',     description: 'Advanced iOS protection',   features: DEFAULT_FEATURES['ios-pro'],            device_limit: 3,  price: { monthly: 19.99, yearly: 199.99 } },
    'ios-enterprise':     { name: 'iOS Enterprise',     platform: 'ios',     description: 'Full MDM integration',      features: DEFAULT_FEATURES['ios-enterprise'],     device_limit: 10, price: { monthly: 49.99, yearly: 499.99 } },
  });
});

// ── GET /:id ──────────────────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const row = get('SELECT * FROM licenses WHERE id = ?', [req.params.id]);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// ── POST / — create ───────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  const { owner_name, owner_email, plan, expires_at, platform, device_limit, mobile_features, notes } = req.body;
  if (!owner_name || !owner_email || !plan)
    return res.status(400).json({ error: 'owner_name, owner_email, and plan are required' });

  const isMobile      = MOBILE_PLANS.includes(plan);
  const licensePlatform = platform || (isMobile ? 'mobile' : 'desktop');
  const features      = mobile_features || (isMobile ? JSON.stringify(DEFAULT_FEATURES[plan] || []) : '[]');
  const key           = genKey();

  try {
    const result = run(
      'INSERT INTO licenses (key,owner_name,owner_email,plan,expires_at,platform,device_limit,mobile_features,notes) VALUES (?,?,?,?,?,?,?,?,?)',
      [key, owner_name, owner_email, plan, expires_at || null, licensePlatform, device_limit || 1, features, notes || null]
    );
    res.status(201).json({ id: result.lastInsertRowid, key });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ── PUT /:id — full update ────────────────────────────────────────────────────
router.put('/:id', (req, res) => {
  const { owner_name, owner_email, plan, status, expires_at, platform, device_limit, mobile_features, notes } = req.body;
  run(
    'UPDATE licenses SET owner_name=?,owner_email=?,plan=?,status=?,expires_at=?,platform=?,device_limit=?,mobile_features=?,notes=? WHERE id=?',
    [owner_name, owner_email, plan, status, expires_at || null, platform, device_limit, mobile_features, notes || null, req.params.id]
  );
  res.json({ success: true });
});

// ── PATCH /:id/revoke ─────────────────────────────────────────────────────────
router.patch('/:id/revoke', (req, res) => {
  run("UPDATE licenses SET status='revoked' WHERE id=?", [req.params.id]);
  res.json({ success: true });
});

// ── PATCH /:id/reactivate ─────────────────────────────────────────────────────
router.patch('/:id/reactivate', (req, res) => {
  run("UPDATE licenses SET status='active' WHERE id=?", [req.params.id]);
  res.json({ success: true });
});

// ── PATCH /:id/renew — extend expiry ─────────────────────────────────────────
router.patch('/:id/renew', (req, res) => {
  const { days = 365 } = req.body;
  const lic = get('SELECT * FROM licenses WHERE id=?', [req.params.id]);
  if (!lic) return res.status(404).json({ error: 'Not found' });

  // Extend from today or from current expiry, whichever is later
  const base = lic.expires_at && new Date(lic.expires_at) > new Date()
    ? new Date(lic.expires_at)
    : new Date();
  base.setDate(base.getDate() + Number(days));
  const newExpiry = base.toISOString().slice(0, 10);

  run("UPDATE licenses SET expires_at=?, status='active' WHERE id=?", [newExpiry, req.params.id]);
  res.json({ success: true, expires_at: newExpiry });
});

// ── POST /:id/clone — duplicate a license for a new user ─────────────────────
router.post('/:id/clone', (req, res) => {
  const src = get('SELECT * FROM licenses WHERE id=?', [req.params.id]);
  if (!src) return res.status(404).json({ error: 'Not found' });

  const { owner_name, owner_email } = req.body;
  const key = genKey();
  try {
    const result = run(
      'INSERT INTO licenses (key,owner_name,owner_email,plan,expires_at,platform,device_limit,mobile_features) VALUES (?,?,?,?,?,?,?,?)',
      [key, owner_name || src.owner_name, owner_email || src.owner_email, src.plan, src.expires_at, src.platform, src.device_limit, src.mobile_features]
    );
    res.status(201).json({ id: result.lastInsertRowid, key });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ── POST /bulk — bulk actions ─────────────────────────────────────────────────
router.post('/bulk', (req, res) => {
  const { ids, action, days } = req.body;
  if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'ids required' });

  const placeholders = ids.map(() => '?').join(',');
  switch (action) {
    case 'revoke':
      run(`UPDATE licenses SET status='revoked' WHERE id IN (${placeholders})`, ids);
      break;
    case 'reactivate':
      run(`UPDATE licenses SET status='active' WHERE id IN (${placeholders})`, ids);
      break;
    case 'delete':
      run(`DELETE FROM licenses WHERE id IN (${placeholders})`, ids);
      break;
    case 'renew': {
      const d = Number(days) || 365;
      ids.forEach(id => {
        const lic = get('SELECT expires_at FROM licenses WHERE id=?', [id]);
        if (!lic) return;
        const base = lic.expires_at && new Date(lic.expires_at) > new Date() ? new Date(lic.expires_at) : new Date();
        base.setDate(base.getDate() + d);
        run("UPDATE licenses SET expires_at=?, status='active' WHERE id=?", [base.toISOString().slice(0, 10), id]);
      });
      break;
    }
    default:
      return res.status(400).json({ error: 'Unknown action' });
  }
  res.json({ success: true, affected: ids.length });
});

// ── DELETE /:id ───────────────────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  run('DELETE FROM licenses WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
