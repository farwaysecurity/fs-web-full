const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

const BAZAAR_API = 'https://mb-api.abuse.ch/api/v1/';

// Map MalwareBazaar tags/signature to our type taxonomy
function inferType(signature, tags = []) {
  const s = (signature || '').toLowerCase();
  const t = tags.map(x => x.toLowerCase()).join(' ');
  const combined = s + ' ' + t;

  if (/ransomware|ransom|locker|crypt/.test(combined)) return 'Ransomware';
  if (/rat|remoteaccess|remote.access|backdoor|njrat|asyncrat|dcrat|quasar/.test(combined)) return 'Trojan';
  if (/trojan|banker|stealer|loader|dropper|downloader|agent/.test(combined)) return 'Trojan';
  if (/spyware|spy|infostealer|formgrab|keylog/.test(combined)) return 'Spyware';
  if (/rootkit|bootkit|uefi/.test(combined)) return 'Rootkit';
  if (/worm|conficker|wannacry/.test(combined)) return 'Worm';
  if (/keylogger|hawkeye/.test(combined)) return 'Keylogger';
  if (/adware|pup|pua/.test(combined)) return 'Adware';
  if (/virus|infector|sality|virut/.test(combined)) return 'Virus';
  if (/miner|coinminer|xmrig|monero/.test(combined)) return 'Suspicious';
  if (/botnet|bot|mirai|emotet/.test(combined)) return 'Trojan';
  return 'Trojan'; // default for unknown
}

// Map to our severity
function inferSeverity(signature, tags = []) {
  const s = (signature || '').toLowerCase();
  const t = tags.map(x => x.toLowerCase()).join(' ');
  const combined = s + ' ' + t;

  if (/ransomware|rootkit|bootkit|wannacry|petya|notpetya|ryuk|lockbit|blackcat|conti/.test(combined)) return 'critical';
  if (/rat|trojan|banker|emotet|trickbot|cobalt|lazarus|apt/.test(combined)) return 'high';
  if (/stealer|spyware|keylog|loader|dropper/.test(combined)) return 'high';
  if (/adware|pup|miner/.test(combined)) return 'low';
  return 'medium';
}

// POST /api/sync/malwarebazaar
// Body: { selector: "100" | "time", limit: 100-1000 }
router.post('/malwarebazaar', async (req, res) => {
  const { selector = '100', signatures = [] } = req.body;

  try {
    // Build requests — either recent 100, or by specific signatures
    const requests = [];

    if (signatures.length > 0) {
      // Fetch by signature name (up to 1000 each)
      for (const sig of signatures.slice(0, 10)) {
        requests.push(
          fetch(BAZAAR_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `query=get_siginfo&signature=${encodeURIComponent(sig)}&limit=1000`,
          }).then(r => r.json()).catch(() => null)
        );
      }
    } else {
      // Default: get recent 100
      requests.push(
        fetch(BAZAAR_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `query=get_recent&selector=${selector}`,
        }).then(r => r.json()).catch(() => null)
      );
    }

    const responses = await Promise.all(requests);

    let imported = 0, skipped = 0, errors = 0;

    for (const resp of responses) {
      if (!resp || resp.query_status === 'no_results') continue;
      if (!resp.data || !Array.isArray(resp.data)) continue;

      for (const sample of resp.data) {
        const md5    = (sample.md5_hash    || '').toUpperCase() || null;
        const sha256 = (sample.sha256_hash || '').toUpperCase() || null;
        const name   = sample.signature || sample.file_name || 'Unknown';
        const tags   = sample.tags || [];
        const type   = inferType(sample.signature, tags);
        const sev    = inferSeverity(sample.signature, tags);
        const source = 'MalwareBazaar (abuse.ch)';
        const desc   = [
          sample.file_type ? `File type: ${sample.file_type}` : '',
          sample.file_size ? `Size: ${sample.file_size} bytes` : '',
          tags.length ? `Tags: ${tags.join(', ')}` : '',
          sample.intelligence?.clamav ? `ClamAV: ${sample.intelligence.clamav}` : '',
        ].filter(Boolean).join(' | ');

        // Skip if no useful hash
        if (!md5 && !sha256) { skipped++; continue; }

        try {
          run(
            `INSERT OR IGNORE INTO malware
              (name, hash_md5, hash_sha256, type, severity, description, source, heuristic_patterns)
             VALUES (?,?,?,?,?,?,?,?)`,
            [name, md5, sha256, type, sev, desc || null, source, '[]']
          );
          imported++;
        } catch { errors++; }
      }
    }

    res.json({ imported, skipped, errors, total: imported + skipped + errors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sync/signatures — fetch by specific family names
// Body: { families: ["Emotet", "WannaCry", ...] }
router.post('/signatures', async (req, res) => {
  const { families = [] } = req.body;
  if (!families.length) return res.status(400).json({ error: 'families array required' });

  let imported = 0, skipped = 0;

  for (const sig of families.slice(0, 20)) {
    try {
      const resp = await fetch(BAZAAR_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `query=get_siginfo&signature=${encodeURIComponent(sig)}&limit=1000`,
      }).then(r => r.json());

      if (!resp.data) continue;

      for (const sample of resp.data) {
        const md5    = (sample.md5_hash    || '').toUpperCase() || null;
        const sha256 = (sample.sha256_hash || '').toUpperCase() || null;
        if (!md5 && !sha256) { skipped++; continue; }

        const tags = sample.tags || [];
        try {
          run(
            `INSERT OR IGNORE INTO malware
              (name, hash_md5, hash_sha256, type, severity, description, source, heuristic_patterns)
             VALUES (?,?,?,?,?,?,?,?)`,
            [sample.signature || sig, md5, sha256,
             inferType(sample.signature, tags),
             inferSeverity(sample.signature, tags),
             tags.length ? `Tags: ${tags.join(', ')}` : null,
             'MalwareBazaar (abuse.ch)', '[]']
          );
          imported++;
        } catch { skipped++; }
      }
    } catch { /* skip failed family */ }
  }

  res.json({ imported, skipped });
});

// GET /api/sync/status — current DB count
router.get('/status', (req, res) => {
  const total = get('SELECT COUNT(*) as c FROM malware').c;
  const sources = all('SELECT source, COUNT(*) as count FROM malware WHERE source IS NOT NULL GROUP BY source ORDER BY count DESC');
  res.json({ total, sources });
});

module.exports = router;
