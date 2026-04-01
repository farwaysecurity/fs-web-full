const express = require('express');
const router = express.Router();
const { get, all, run } = require('../db');
const { geoLookup } = require('../geo');

function apiKeyAuth(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.api_key;
  if (!key) return res.status(401).json({ error: 'Missing API key', code: 'NO_API_KEY' });

  const record = get('SELECT * FROM api_keys WHERE key = ? AND active = 1', [key]);
  if (!record) return res.status(403).json({ error: 'Invalid or inactive API key', code: 'INVALID_API_KEY' });

  run('UPDATE api_keys SET last_used = CURRENT_TIMESTAMP WHERE key = ?', [key]);
  req.apiClient = record;
  next();
}

// POST /api/v1/license/verify
router.post('/license/verify', apiKeyAuth, async (req, res) => {
  const { license_key, machine_id, software_version, platform } = req.body;
  if (!license_key) return res.status(400).json({ error: 'license_key is required' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
  const geo = await geoLookup(ip);

  function logUsage(result) {
    run(
      `INSERT INTO license_usage
        (license_key, ip_address, machine_id, software_version, platform, result,
         country, country_code, city, region, latitude, longitude, isp)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [license_key, ip, machine_id || null, software_version || null, platform || null, result,
       geo.country, geo.country_code, geo.city, geo.region, geo.latitude, geo.longitude, geo.isp]
    );
  }

  const license = get('SELECT * FROM licenses WHERE key = ?', [license_key]);

  if (!license) {
    logUsage('not_found');
    return res.json({ valid: false, status: 'not_found', plan: null, message: 'License not found' });
  }
  if (license.status === 'revoked') {
    logUsage('revoked');
    return res.json({ valid: false, status: 'revoked', plan: license.plan, message: 'License has been revoked' });
  }
  if (license.expires_at) {
    const expiry = new Date(license.expires_at);
    if (expiry < new Date()) {
      run("UPDATE licenses SET status='expired' WHERE id=?", [license.id]);
      logUsage('expired');
      return res.json({ valid: false, status: 'expired', plan: license.plan, expires_at: expiry.toISOString(), message: 'License has expired' });
    }
  }
  if (license.status === 'expired') {
    logUsage('expired');
    return res.json({ valid: false, status: 'expired', plan: license.plan, message: 'License has expired' });
  }

  logUsage('valid');
  res.json({
    valid: true, status: 'active', plan: license.plan,
    holder_name: license.owner_name, holder_email: license.owner_email,
    activated_at: license.created_at ? new Date(license.created_at).toISOString() : null,
    expires_at: license.expires_at ? new Date(license.expires_at).toISOString() : null,
    message: ''
  });
});

// POST /api/v1/malware/check
router.post('/malware/check', apiKeyAuth, (req, res) => {
  const { hash } = req.body;
  if (!hash) return res.status(400).json({ error: 'hash is required' });
  const h = hash.trim().toLowerCase();
  const match = get('SELECT * FROM malware WHERE LOWER(hash_md5) = ? OR LOWER(hash_sha256) = ?', [h, h]);
  if (!match) return res.json({ detected: false, hash });
  res.json({ detected: true, hash, malware: { id: match.id, name: match.name, type: match.type, severity: match.severity, description: match.description, detected_at: match.detected_at } });
});

// POST /api/v1/malware/check-bulk
router.post('/malware/check-bulk', apiKeyAuth, (req, res) => {
  const { hashes } = req.body;
  if (!Array.isArray(hashes) || hashes.length === 0) return res.status(400).json({ error: 'hashes array is required' });
  if (hashes.length > 500) return res.status(400).json({ error: 'Maximum 500 hashes per request' });
  const results = hashes.map(hash => {
    const h = hash.trim().toLowerCase();
    const match = get('SELECT id, name, type, severity, description FROM malware WHERE LOWER(hash_md5) = ? OR LOWER(hash_sha256) = ?', [h, h]);
    return match ? { hash, detected: true, malware: match } : { hash, detected: false };
  });
  res.json({ total: hashes.length, detected: results.filter(r => r.detected).length, results });
});

// GET /api/v1/malware/list
router.get('/malware/list', apiKeyAuth, (req, res) => {
  const { severity, page = 1, limit = 50 } = req.query;
  let where = 'WHERE 1=1';
  const params = [];
  if (severity) { where += ' AND severity = ?'; params.push(severity); }
  const total = get(`SELECT COUNT(*) as count FROM malware ${where}`, params).count;
  const offset = (Number(page) - 1) * Number(limit);
  const rows = all(
    `SELECT id, name, type, severity, hash_md5, hash_sha256, source, detected_at FROM malware ${where} ORDER BY detected_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  );
  res.json({ total, page: Number(page), limit: Number(limit), data: rows });
});

// GET /api/v1/health
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Farway License Server', timestamp: new Date().toISOString() });
});

// GET /api/v1/definitions — virus signature database for the antivirus update manager
router.get('/definitions', apiKeyAuth, (req, res) => {
  const rows = all(`
    SELECT id, name, type as ThreatType, severity as Severity,
           hash_md5 as Md5, hash_sha256 as Sha256, description as Description
    FROM malware ORDER BY detected_at DESC
  `);

  // Map to the SignatureDbFile format the antivirus expects
  const signatures = rows.map(r => ({
    Id:               `FAR-${String(r.id).padStart(3, '0')}`,
    Name:             r.name,
    ThreatType:       r.ThreatType || 'Unknown',
    Severity:         r.Severity   || 'Medium',
    Md5:              r.Md5        || '',
    Sha256:           r.Sha256     || '',
    Description:      r.Description || '',
    HeuristicPatterns: [],
  }));

  // Version = total count + date so the antivirus knows when it changed
  const version = `${signatures.length}.${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;

  res.json({
    Version:     version,
    LastUpdated: new Date().toISOString(),
    Signatures:  signatures,
  });
});

module.exports = router;
module.exports.apiKeyAuth = apiKeyAuth;
